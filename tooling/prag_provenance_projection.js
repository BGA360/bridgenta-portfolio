import crypto from "node:crypto";

export function buildPublicationProjection({ expectedSubjects, m5DecisionRecords, options = {} }) {
  const policyVersion = options.policyVersion || "M5-POLICY-1.0";
  const evaluatorVersion = options.evaluatorVersion || "M5-EVALUATOR-1.0";
  const implementationIdentity = options.implementationIdentity;

  if (!implementationIdentity) {
    throw new Error("Missing implementationIdentity.");
  }

  // Group decisions by subjectId
  const decisionsMap = new Map();
  for (const dec of m5DecisionRecords) {
    if (!dec.subjectId) continue;
    if (!decisionsMap.has(dec.subjectId)) {
      decisionsMap.set(dec.subjectId, []);
    }
    decisionsMap.get(dec.subjectId).push(dec);
  }

  const records = [];
  const eligibleSubjectIds = [];
  const withheldSubjectIds = [];
  const undecidedSubjectIds = [];
  const diagnostics = [];

  const allSubjects = Array.from(new Set([
    ...expectedSubjects,
    ...decisionsMap.keys()
  ]));

  for (const subjId of allSubjects) {
    const decisions = decisionsMap.get(subjId) || [];
    const count = decisions.length;

    const record = {
      subjectType: "learning-article",
      subjectId: subjId,
      m5Decision: null,
      publicationEligibility: "PUBLICATION_UNDECIDED",
      b5ReasonCodes: [],
      m5ReasonCodes: [],
      projectionDiagnostics: [],
      policyVersion,
      evaluatorVersion,
      implementationIdentity
    };

    if (count === 0) {
      record.m5Decision = "NOT_EVALUATED";
      record.publicationEligibility = "PUBLICATION_UNDECIDED";
      record.projectionDiagnostics.push("DECISION_MISSING");
      undecidedSubjectIds.push(subjId);
    } else if (count > 1) {
      // Pick first decision's metadata for fields but flag duplicate
      const firstDec = decisions[0];
      record.subjectType = firstDec.subjectType || "learning-article";
      record.m5Decision = firstDec.m5Decision || "NOT_EVALUATED";
      record.b5ReasonCodes = firstDec.b5ReasonCodes ? [...firstDec.b5ReasonCodes] : [];
      record.m5ReasonCodes = firstDec.m5ReasonCodes ? [...firstDec.m5ReasonCodes] : [];
      record.publicationEligibility = "PUBLICATION_UNDECIDED";
      record.projectionDiagnostics.push("DECISION_DUPLICATE");
      undecidedSubjectIds.push(subjId);
      diagnostics.push(`Duplicate decisions for subject: '${subjId}'`);
    } else {
      const dec = decisions[0];
      record.subjectType = dec.subjectType || "learning-article";
      record.m5Decision = dec.m5Decision || "NOT_EVALUATED";
      record.b5ReasonCodes = dec.b5ReasonCodes ? [...dec.b5ReasonCodes] : [];
      record.m5ReasonCodes = dec.m5ReasonCodes ? [...dec.m5ReasonCodes] : [];

      const validM5Decisions = new Set(["ELIGIBLE", "WITHHELD", "SYSTEM_UNAVAILABLE", "NOT_EVALUATED"]);
      if (!validM5Decisions.has(dec.m5Decision)) {
        record.publicationEligibility = "PUBLICATION_UNDECIDED";
        record.projectionDiagnostics.push("PROJECTION_CONFIGURATION_INVALID");
        undecidedSubjectIds.push(subjId);
        diagnostics.push(`Unknown M5 decision state: '${dec.m5Decision}' for subject: '${subjId}'`);
      } else if (dec.m5Decision === "ELIGIBLE") {
        record.publicationEligibility = "PUBLICATION_ELIGIBLE";
        eligibleSubjectIds.push(subjId);
      } else if (dec.m5Decision === "WITHHELD") {
        record.publicationEligibility = "PUBLICATION_WITHHELD";
        withheldSubjectIds.push(subjId);
      } else {
        record.publicationEligibility = "PUBLICATION_UNDECIDED";
        undecidedSubjectIds.push(subjId);
      }
    }

    records.push(record);
  }

  // Sort outputs deterministically ascending
  records.sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  eligibleSubjectIds.sort();
  withheldSubjectIds.sort();
  undecidedSubjectIds.sort();
  diagnostics.sort();

  return {
    records,
    eligibleSubjectIds,
    withheldSubjectIds,
    undecidedSubjectIds,
    diagnostics
  };
}

export function serializeProjection(projectionResult) {
  // Deep clone to prevent mutations to caller input
  const clone = JSON.parse(JSON.stringify(projectionResult));

  // Sort inner reasons for each record
  const B5_ORDER = [
    "MISSING_PROVENANCE_REF",
    "INVALID_PROVENANCE_REF_SYNTAX",
    "UNKNOWN_EVENT",
    "REGISTRY_INVALID",
    "MANIFEST_INVALID",
    "SOURCE_FIDELITY_MISSING",
    "MULTIPLE_SOURCE_FIDELITY_REVIEWS",
    "SOURCE_FIDELITY_NOT_PASS",
    "SOURCE_FIDELITY_EVIDENCE_MISSING",
    "SOURCE_FIDELITY_EVIDENCE_AMBIGUOUS",
    "RUNTIME_NOT_PASS",
    "CLEARANCE_INEFFECTIVE"
  ];

  const M5_ORDER = [
    "M5_EVALUATION_ERROR",
    "M5_DEPENDENCY_UNAVAILABLE",
    "M5_INPUT_STATE_UNVERIFIABLE",
    "M5_CONFIGURATION_INVALID",
    "M5_POLICY_VERSION_UNAVAILABLE",
    "M5_HISTORICAL_RULE_UNAVAILABLE"
  ];

  for (const rec of clone.records) {
    if (rec.b5ReasonCodes) {
      rec.b5ReasonCodes.sort((a, b) => {
        const idxA = B5_ORDER.indexOf(a);
        const idxB = B5_ORDER.indexOf(b);
        const posA = idxA === -1 ? B5_ORDER.length : idxA;
        const posB = idxB === -1 ? B5_ORDER.length : idxB;
        return posA - posB;
      });
    }
    if (rec.m5ReasonCodes) {
      rec.m5ReasonCodes.sort((a, b) => {
        const idxA = M5_ORDER.indexOf(a);
        const idxB = M5_ORDER.indexOf(b);
        const posA = idxA === -1 ? M5_ORDER.length : idxA;
        const posB = idxB === -1 ? M5_ORDER.length : idxB;
        return posA - posB;
      });
    }
    if (rec.projectionDiagnostics) {
      rec.projectionDiagnostics.sort();
    }
  }

  // Deterministic JSON stringification
  const orderedKeys = Object.keys(clone).sort();
  const sortedResult = {};
  for (const k of orderedKeys) {
    if (Array.isArray(clone[k])) {
      sortedResult[k] = clone[k].map(item => {
        if (typeof item === "object" && item !== null) {
          const itemKeys = Object.keys(item).sort();
          const sortedItem = {};
          for (const ik of itemKeys) {
            sortedItem[ik] = item[ik];
          }
          return sortedItem;
        }
        return item;
      });
    } else {
      sortedResult[k] = clone[k];
    }
  }

  return JSON.stringify(sortedResult);
}

export function computeProjectionHash(projectionResult) {
  const jsonString = serializeProjection(projectionResult);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}
