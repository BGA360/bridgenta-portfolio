#!/usr/bin/env node
/**
 * BGDE-OPS-001C — Read-Only Canonical Release Record Validator
 *
 * Validates `bgde-release-record/1.0` records against structural, lifecycle,
 * BPGA compatibility, SHA-256 integrity, source-tree equivalence, rollback
 * governance, and public-safe disclosure rules.
 *
 * Strictly READ-ONLY:
 * - Never writes or modifies release records
 * - Never calls STRATO APIs or uploads files
 * - Never modifies Git history
 * - Never generates approvals or grants release authorization
 * - Reports unresolved external evidence as UNVERIFIED (never PASS)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.resolve(__dirname, '..', 'stewardship', 'releases', 'schema', 'release-record.v1.json');
const RELEASE_RECORD_SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

export const EXPECTED_SCHEMA_VERSION = 'bgde-release-record/1.0';

export const LIFECYCLE_STATES = new Set([
  'DRAFT',
  'VALIDATED',
  'STAGING_ACCEPTED',
  'AUTHORIZED',
  'DEPLOYED_PENDING_VERIFICATION',
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
  'REJECTED',
  'ROLLED_BACK',
]);

export const ALLOWED_TRANSITIONS = {
  DRAFT: new Set(['VALIDATED', 'REJECTED']),
  VALIDATED: new Set(['STAGING_ACCEPTED', 'REJECTED']),
  STAGING_ACCEPTED: new Set(['AUTHORIZED', 'REJECTED']),
  AUTHORIZED: new Set(['DEPLOYED_PENDING_VERIFICATION', 'REJECTED']),
  DEPLOYED_PENDING_VERIFICATION: new Set([
    'RELEASE_ACCEPTED',
    'RELEASE_ACCEPTED_WITH_LIMITATIONS',
    'ROLLED_BACK',
  ]),
  RELEASE_ACCEPTED: new Set(['ROLLED_BACK']),
  RELEASE_ACCEPTED_WITH_LIMITATIONS: new Set(['ROLLED_BACK']),
  REJECTED: new Set([]),
  ROLLED_BACK: new Set([]),
};

const VALID_RISK_TIERS = new Set(['T1_EDITORIAL', 'T2_STANDARD', 'T3_HIGH_RISK']);
const VALID_SCOPES = new Set([
  'ORDINARY_ASTRO_WEBSITE',
  'EPPS_INCLUDED_WEBSITE',
  'BPGA_FORMAL_EPPS_RELEASE',
]);
const VALID_FRAMEWORKS = new Set(['CEF', 'CEP', 'RKF', 'BGCF', 'BECC', 'BPGA', 'PRAG', 'M5']);
const VALID_RAG_DECISIONS = new Set([
  'AUTHORIZED',
  'AUTHORIZED WITH OBSERVATIONS',
  'DEFERRED',
  'REJECTED',
]);
const VALID_OWNER_DECISIONS = new Set([
  'AUTHORIZED',
  'AUTHORIZED_WITH_OBSERVATIONS',
  'DEFERRED',
  'REJECTED',
]);
const VALID_SOURCE_DISPOSITIONS = new Set([
  'NO_CODE_CHANGE_DEPLOYMENT_FAILURE',
  'REVERT_PR_REQUIRED_CODE_DEFECT',
  'FORWARD_FIX_PR_REQUIRED',
]);

const SHA256_RE = /^[a-f0-9]{64}$/;
const GIT_SHA_RE = /^[a-f0-9]{40}$/;
const RELEASE_ID_RE = /^BGDE-REL-[0-9]{4}-[0-9]{3}(?:-[A-Z0-9]+)?$/;
const ARCHIVE_REF_RE = /^ARCHIVE-[A-Z0-9-]+$/;
const ERR_ID_RE = /^ERR-[0-9]{4}-[0-9]{3,}$/;
const RAG_ID_RE = /^RAG-[0-9]{4}-[0-9]{3,}$/;
const BND_ID_RE = /^BND-[0-9]{4}-[0-9]{3,}$/;
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

const POST_VALIDATED_STATES = new Set([
  'VALIDATED',
  'STAGING_ACCEPTED',
  'AUTHORIZED',
  'DEPLOYED_PENDING_VERIFICATION',
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
  'ROLLED_BACK',
]);

const POST_STAGING_STATES = new Set([
  'STAGING_ACCEPTED',
  'AUTHORIZED',
  'DEPLOYED_PENDING_VERIFICATION',
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
  'ROLLED_BACK',
]);

const POST_AUTHORIZED_STATES = new Set([
  'AUTHORIZED',
  'DEPLOYED_PENDING_VERIFICATION',
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
  'ROLLED_BACK',
]);

const POST_DEPLOYED_STATES = new Set([
  'DEPLOYED_PENDING_VERIFICATION',
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
]);

const ACCEPTED_STATES = new Set([
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
]);

const TERMINAL_STATES = new Set([
  'RELEASE_ACCEPTED',
  'RELEASE_ACCEPTED_WITH_LIMITATIONS',
  'REJECTED',
  'ROLLED_BACK',
]);

const PUBLIC_DISCLOSURE_PATTERNS = [
  { id: 'TOKEN_GITHUB', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{16,}\b/ },
  { id: 'TOKEN_GITHUB_PAT', re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { id: 'TOKEN_API_KEY', re: /\b(?:sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16})\b/ },
  { id: 'PRIVATE_KEY_HEADER', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { id: 'BEARER_CREDENTIAL', re: /\bBearer\s+[A-Za-z0-9._-]{12,}/i },
  { id: 'SECRET_ASSIGNMENT', re: /\b(?:password|passwd|api[_-]?key|access[_-]?token|sftp[_-]?pass|secret[_-]?key)\s*[:=]\s*[^\s,"'}{]+/i },
  { id: 'SESSION_IDENTIFIER', re: /\b(?:JSESSIONID|PHPSESSID|connect\.sid|session[_-]?id)\s*[:=]\s*[A-Za-z0-9._-]{6,}/i },
  { id: 'SFTP_CONNECTION_DETAIL', re: /\b(?:sftp:\/\/|ssh\.strato\.de|sftp\.strato\.de)/i },
  { id: 'WINDOWS_LOCAL_PATH', re: /(?:^|[\s"'(=])[A-Za-z]:[\\/][^\s"']+/ },
  { id: 'POSIX_HOME_PATH', re: /(?:^|[\s"'(=])\/(?:Users|home)\/[^\s"']+/ },
  { id: 'FILE_URI', re: /\bfile:\/\/\//i },
  { id: 'INTERNAL_SSOT_REF', re: /\bINTERNAL[\s_-]+Learning[\s_-]+SSOT\b/i },
];

function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function scanPublicStrings(value, currentPath, findings) {
  if (typeof value === 'string') {
    for (const rule of PUBLIC_DISCLOSURE_PATTERNS) {
      if (rule.re.test(value)) {
        findings.push({
          code: 'ERR_PUBLIC_DISCLOSURE',
          field: currentPath,
          message: `Prohibited private/confidential metadata detected (${rule.id}) in PUBLIC_SAFE record.`,
        });
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => scanPublicStrings(item, `${currentPath}[${idx}]`, findings));
    return;
  }
  if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (/^(?:password|secret|token|sftpPassword|privateKey|sessionId|localArchivePath)$/i.test(k)) {
        findings.push({
          code: 'ERR_PUBLIC_DISCLOSURE',
          field: `${currentPath}.${k}`,
          message: `Prohibited private field name "${k}" in PUBLIC_SAFE record.`,
        });
      }
      scanPublicStrings(v, currentPath ? `${currentPath}.${k}` : k, findings);
    }
  }
}

function checkAdditionalProperties(value, schemaNode, currentPath, addError) {
  if (!schemaNode || value === null || value === undefined) return;
  if (Array.isArray(value)) {
    if (schemaNode.items) {
      value.forEach((item, idx) =>
        checkAdditionalProperties(item, schemaNode.items, `${currentPath}[${idx}]`, addError)
      );
    }
    return;
  }
  if (isPlainObject(value) && isPlainObject(schemaNode.properties)) {
    const allowedKeys = new Set(Object.keys(schemaNode.properties));
    for (const [key, childVal] of Object.entries(value)) {
      const childPath = currentPath === '$' ? key : `${currentPath}.${key}`;
      if (schemaNode.additionalProperties === false && !allowedKeys.has(key)) {
        addError(
          'ERR_UNKNOWN_PROPERTY',
          childPath,
          `Unknown property "${key}" is forbidden by release-record.v1.json (additionalProperties: false).`
        );
        continue;
      }
      if (allowedKeys.has(key)) {
        checkAdditionalProperties(childVal, schemaNode.properties[key], childPath, addError);
      }
    }
  }
}

function readGitTree(gitDir, commitSha) {
  try {
    const resolvedDir = path.resolve(gitDir);
    const out = execFileSync(
      'git',
      ['-c', `safe.directory=${resolvedDir}`, 'rev-parse', `${commitSha}^{tree}`],
      {
        cwd: resolvedDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    ).trim();
    return GIT_SHA_RE.test(out) ? out : null;
  } catch {
    return null;
  }
}

export function verifyReleaseRecord(record, options = {}) {
  const {
    manifestPath = null,
    gitDir = null,
    allowProtected = false,
  } = options;

  const errors = [];
  const warnings = [];
  const externalEvidence = {
    manifestCheck: 'UNVERIFIED',
    gitTreeCheck: 'UNVERIFIED',
    ciEvidenceCheck: 'UNVERIFIED',
    bpgaExternalArtifactsCheck: 'UNVERIFIED',
  };

  const addError = (code, field, message) => {
    errors.push({ code, field, message });
  };

  if (!isPlainObject(record)) {
    addError('ERR_SCHEMA_TYPE', '$', 'Release record must be a JSON object.');
    return {
      structuralValidity: 'FAIL',
      externalEvidence,
      errors,
      warnings,
    };
  }

  // 0. Schema additionalProperties: false parity check (derived directly from release-record.v1.json)
  checkAdditionalProperties(record, RELEASE_RECORD_SCHEMA, '$', addError);

  // 1. Core schema & version checks
  if (record.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    addError(
      'ERR_SCHEMA_VERSION',
      'schemaVersion',
      `Expected schemaVersion "${EXPECTED_SCHEMA_VERSION}", got "${record.schemaVersion}".`
    );
  }

  if (record.recordTier !== 'PUBLIC_SAFE' && record.recordTier !== 'PROTECTED_INTERNAL') {
    addError('ERR_RECORD_TIER', 'recordTier', 'recordTier must be "PUBLIC_SAFE" or "PROTECTED_INTERNAL".');
  } else if (record.recordTier === 'PROTECTED_INTERNAL' && !allowProtected) {
    addError(
      'ERR_PROTECTED_RECORD_IN_PUBLIC_MODE',
      'recordTier',
      'PROTECTED_INTERNAL record cannot be validated in default public ledger mode without --allow-protected.'
    );
  }

  if (typeof record.releaseId !== 'string' || !RELEASE_ID_RE.test(record.releaseId)) {
    addError('ERR_RELEASE_ID', 'releaseId', 'releaseId must match BGDE-REL-YYYY-NNN (optional suffix).');
  }

  if (!VALID_RISK_TIERS.has(record.riskTier)) {
    addError('ERR_RISK_TIER', 'riskTier', 'Invalid riskTier.');
  }

  if (!VALID_SCOPES.has(record.releaseScope)) {
    addError('ERR_RELEASE_SCOPE', 'releaseScope', 'Invalid releaseScope.');
  }

  if (!LIFECYCLE_STATES.has(record.lifecycleState)) {
    addError('ERR_LIFECYCLE_STATE', 'lifecycleState', `Unknown lifecycleState "${record.lifecycleState}".`);
  }

  if (typeof record.createdAtUtc !== 'string' || !ISO_UTC_RE.test(record.createdAtUtc)) {
    addError('ERR_TIMESTAMP', 'createdAtUtc', 'createdAtUtc must be an ISO-8601 UTC timestamp (ending in Z).');
  }

  // 2. Public-safe disclosure scan (fail-closed)
  if (record.recordTier === 'PUBLIC_SAFE') {
    scanPublicStrings(record, '$', errors);
  }

  // 3. State history & transition validation
  if (!Array.isArray(record.stateHistory) || record.stateHistory.length === 0) {
    addError('ERR_STATE_HISTORY', 'stateHistory', 'stateHistory must be a non-empty array.');
  } else {
    for (let i = 0; i < record.stateHistory.length; i++) {
      const entry = record.stateHistory[i];
      if (!isPlainObject(entry)) {
        addError('ERR_STATE_HISTORY', `stateHistory[${i}]`, 'State history entry must be an object.');
        continue;
      }
      if (!LIFECYCLE_STATES.has(entry.state)) {
        addError('ERR_STATE_HISTORY', `stateHistory[${i}].state`, `Invalid state "${entry.state}".`);
      }
      if (typeof entry.timestampUtc !== 'string' || !ISO_UTC_RE.test(entry.timestampUtc)) {
        addError('ERR_STATE_HISTORY', `stateHistory[${i}].timestampUtc`, 'Must be ISO-8601 UTC timestamp.');
      }
      if (typeof entry.actor !== 'string' || entry.actor.trim().length === 0) {
        addError('ERR_STATE_HISTORY', `stateHistory[${i}].actor`, 'Actor must be a non-empty string.');
      }
      if (i === 0 && entry.state !== 'DRAFT') {
        addError('ERR_INVALID_TRANSITION', 'stateHistory[0].state', 'Initial lifecycle state must be DRAFT.');
      }
      if (i > 0) {
        const prev = record.stateHistory[i - 1]?.state;
        const allowed = ALLOWED_TRANSITIONS[prev];
        if (allowed && !allowed.has(entry.state)) {
          addError(
            'ERR_INVALID_TRANSITION',
            `stateHistory[${i}].state`,
            `Disallowed lifecycle transition: ${prev} -> ${entry.state}.`
          );
        }
      }
    }
    const lastState = record.stateHistory[record.stateHistory.length - 1]?.state;
    if (lastState && record.lifecycleState && lastState !== record.lifecycleState) {
      addError(
        'ERR_STATE_MISMATCH',
        'lifecycleState',
        `lifecycleState "${record.lifecycleState}" does not match last stateHistory entry "${lastState}".`
      );
    }
  }

  const state = record.lifecycleState;

  // 4. Source & tree-equivalence checks
  if (!isPlainObject(record.source)) {
    addError('ERR_SOURCE', 'source', 'source block is required.');
  } else {
    const s = record.source;
    if (s.repository !== 'BGA360/bridgenta-portfolio') {
      addError('ERR_SOURCE', 'source.repository', 'repository must be "BGA360/bridgenta-portfolio".');
    }
    if (typeof s.featureBranch !== 'string' || s.featureBranch.trim().length === 0) {
      addError('ERR_SOURCE', 'source.featureBranch', 'featureBranch is required.');
    }
    if (typeof s.featureHeadSha !== 'string' || !GIT_SHA_RE.test(s.featureHeadSha)) {
      addError('ERR_SOURCE', 'source.featureHeadSha', 'featureHeadSha must be a 40-char lowercase hex SHA.');
    }
    if (s.mainSquashSha !== null && (typeof s.mainSquashSha !== 'string' || !GIT_SHA_RE.test(s.mainSquashSha))) {
      addError('ERR_SOURCE', 'source.mainSquashSha', 'mainSquashSha must be null or a 40-char hex SHA.');
    }
    if (s.featureTreeSha !== null && (typeof s.featureTreeSha !== 'string' || !GIT_SHA_RE.test(s.featureTreeSha))) {
      addError('ERR_SOURCE', 'source.featureTreeSha', 'featureTreeSha must be null or a 40-char hex SHA.');
    }
    if (s.mainTreeSha !== null && (typeof s.mainTreeSha !== 'string' || !GIT_SHA_RE.test(s.mainTreeSha))) {
      addError('ERR_SOURCE', 'source.mainTreeSha', 'mainTreeSha must be null or a 40-char hex SHA.');
    }

    if (s.featureTreeSha && s.mainTreeSha) {
      const treesMatch = s.featureTreeSha === s.mainTreeSha;
      if (s.sourceTreeEquivalent === true && !treesMatch) {
        addError(
          'ERR_TREE_EQUIVALENCE',
          'source.sourceTreeEquivalent',
          'Claimed sourceTreeEquivalent=true but featureTreeSha and mainTreeSha differ.'
        );
      }
      if (s.sourceTreeEquivalent === false && treesMatch) {
        addError(
          'ERR_TREE_EQUIVALENCE',
          'source.sourceTreeEquivalent',
          'Claimed sourceTreeEquivalent=false but featureTreeSha and mainTreeSha are identical.'
        );
      }
    } else if (s.sourceTreeEquivalent === true) {
      addError(
        'ERR_TREE_EQUIVALENCE',
        'source.sourceTreeEquivalent',
        'Cannot claim sourceTreeEquivalent=true without both featureTreeSha and mainTreeSha.'
      );
    }

    if (POST_AUTHORIZED_STATES.has(state)) {
      if (!s.mainSquashSha) {
        addError('ERR_SOURCE', 'source.mainSquashSha', `State ${state} requires a merged mainSquashSha.`);
      }
      if (!s.featureTreeSha || !s.mainTreeSha) {
        addError('ERR_TREE_EQUIVALENCE', 'source', `State ${state} requires featureTreeSha and mainTreeSha.`);
      }
      if (s.sourceTreeEquivalent !== true && s.reStagedAfterMerge !== true) {
        addError(
          'ERR_TREE_EQUIVALENCE',
          'source.sourceTreeEquivalent',
          `State ${state} requires sourceTreeEquivalent=true or reStagedAfterMerge=true.`
        );
      }
    }

    // Optional local Git verification
    if (gitDir && s.featureHeadSha && s.mainSquashSha) {
      const actualFeatureTree = readGitTree(gitDir, s.featureHeadSha);
      const actualMainTree = readGitTree(gitDir, s.mainSquashSha);
      if (actualFeatureTree && actualMainTree) {
        const featureOk = !s.featureTreeSha || s.featureTreeSha === actualFeatureTree;
        const mainOk = !s.mainTreeSha || s.mainTreeSha === actualMainTree;
        const eqOk = s.sourceTreeEquivalent === null || s.sourceTreeEquivalent === (actualFeatureTree === actualMainTree);
        if (featureOk && mainOk && eqOk) {
          externalEvidence.gitTreeCheck = 'VERIFIED';
        } else {
          externalEvidence.gitTreeCheck = 'MISMATCH';
          addError(
            'ERR_GIT_TREE_MISMATCH',
            'source',
            `Local Git tree verification mismatch (featureTree=${actualFeatureTree}, mainTree=${actualMainTree}).`
          );
        }
      } else {
        externalEvidence.gitTreeCheck = 'UNVERIFIED';
        warnings.push('Referenced Git commits not available in local gitDir; gitTreeCheck=UNVERIFIED.');
      }
    }
  }

  // 5. Governance & BPGA compatibility boundary
  if (!isPlainObject(record.governance)) {
    addError('ERR_GOVERNANCE', 'governance', 'governance block is required.');
  } else {
    const g = record.governance;
    if (!Array.isArray(g.applicableFrameworks) || g.applicableFrameworks.length === 0) {
      addError('ERR_GOVERNANCE', 'governance.applicableFrameworks', 'Must list at least one applicable framework.');
    } else {
      for (const fw of g.applicableFrameworks) {
        if (!VALID_FRAMEWORKS.has(fw)) {
          addError('ERR_GOVERNANCE', 'governance.applicableFrameworks', `Unknown framework "${fw}".`);
        }
      }
    }

    const scopeRequiresBpga =
      record.releaseScope === 'EPPS_INCLUDED_WEBSITE' ||
      record.releaseScope === 'BPGA_FORMAL_EPPS_RELEASE';

    if (scopeRequiresBpga && g.requiresFormalBpgaRag !== true) {
      addError(
        'ERR_BPGA_BOUNDARY',
        'governance.requiresFormalBpgaRag',
        `releaseScope "${record.releaseScope}" constitutionally requires requiresFormalBpgaRag=true.`
      );
    }

    if (record.releaseScope === 'ORDINARY_ASTRO_WEBSITE' && g.bpgaCertified === true) {
      addError(
        'ERR_UNSUPPORTED_CERTIFICATION',
        'governance.bpgaCertified',
        'ORDINARY_ASTRO_WEBSITE release cannot claim bpgaCertified=true without formal BPGA EPPS/ERR/RAG certification.'
      );
    }

    const needBpgaRefsNow =
      (scopeRequiresBpga || g.requiresFormalBpgaRag === true) &&
      (POST_AUTHORIZED_STATES.has(state) || g.bpgaCertified === true);

    if (needBpgaRefsNow) {
      if (!isPlainObject(g.bpgaRefs)) {
        addError(
          'ERR_MISSING_BPGA_REFS',
          'governance.bpgaRefs',
          'Formal BPGA ERR/RAG references are mandatory for this release scope/state.'
        );
      } else {
        if (typeof g.bpgaRefs.errId !== 'string' || !ERR_ID_RE.test(g.bpgaRefs.errId)) {
          addError('ERR_MISSING_BPGA_REFS', 'governance.bpgaRefs.errId', 'Valid BPGA errId (ERR-YYYY-NNN) is required.');
        }
        if (typeof g.bpgaRefs.ragId !== 'string' || !RAG_ID_RE.test(g.bpgaRefs.ragId)) {
          addError('ERR_MISSING_BPGA_REFS', 'governance.bpgaRefs.ragId', 'Valid BPGA ragId (RAG-YYYY-NNN) is required.');
        }
        if (
          g.bpgaRefs.ragDecision !== 'AUTHORIZED' &&
          g.bpgaRefs.ragDecision !== 'AUTHORIZED WITH OBSERVATIONS'
        ) {
          addError(
            'ERR_INVALID_BPGA_RAG_DECISION',
            'governance.bpgaRefs.ragDecision',
            'Formal BPGA ragDecision must be AUTHORIZED or AUTHORIZED WITH OBSERVATIONS.'
          );
        }
        if (
          record.releaseScope === 'BPGA_FORMAL_EPPS_RELEASE' &&
          (typeof g.bpgaRefs.bundleId !== 'string' || !BND_ID_RE.test(g.bpgaRefs.bundleId))
        ) {
          addError('ERR_MISSING_BPGA_REFS', 'governance.bpgaRefs.bundleId', 'Valid BPGA bundleId (BND-YYYY-NNN) is required.');
        }
      }
      externalEvidence.bpgaExternalArtifactsCheck = 'UNVERIFIED';
    } else {
      externalEvidence.bpgaExternalArtifactsCheck = g.bpgaRefs ? 'UNVERIFIED' : 'NOT_APPLICABLE';
    }

    if (g.bpgaCertified === true && !scopeRequiresBpga) {
      addError(
        'ERR_UNSUPPORTED_CERTIFICATION',
        'governance.bpgaCertified',
        'Cannot claim bpgaCertified=true outside an EPPS/BPGA-governed release.'
      );
    }

    if (isPlainObject(g.bpgaRefs)) {
      if (g.bpgaRefs.errId !== null && g.bpgaRefs.errId !== undefined && !ERR_ID_RE.test(g.bpgaRefs.errId)) {
        addError('ERR_BPGA_FORMAT', 'governance.bpgaRefs.errId', 'errId must match ERR-YYYY-NNN.');
      }
      if (g.bpgaRefs.ragId !== null && g.bpgaRefs.ragId !== undefined && !RAG_ID_RE.test(g.bpgaRefs.ragId)) {
        addError('ERR_BPGA_FORMAT', 'governance.bpgaRefs.ragId', 'ragId must match RAG-YYYY-NNN.');
      }
      if (g.bpgaRefs.ragDecision !== null && g.bpgaRefs.ragDecision !== undefined && !VALID_RAG_DECISIONS.has(g.bpgaRefs.ragDecision)) {
        addError('ERR_BPGA_FORMAT', 'governance.bpgaRefs.ragDecision', 'Invalid BPGA ragDecision.');
      }
      if (g.bpgaRefs.bundleId !== null && g.bpgaRefs.bundleId !== undefined && !BND_ID_RE.test(g.bpgaRefs.bundleId)) {
        addError('ERR_BPGA_FORMAT', 'governance.bpgaRefs.bundleId', 'bundleId must match BND-YYYY-NNN.');
      }
    }

    if (!isPlainObject(g.reviewSignOff)) {
      addError('ERR_REVIEW_SIGNOFF', 'governance.reviewSignOff', 'reviewSignOff is required.');
    } else {
      if (g.reviewSignOff.protectMainBypassed !== false) {
        addError('ERR_PROTECT_MAIN_BYPASS', 'governance.reviewSignOff.protectMainBypassed', 'protectMainBypassed must be false.');
      }
      if (POST_AUTHORIZED_STATES.has(state)) {
        if (!g.reviewSignOff.approver) {
          addError('ERR_REVIEW_SIGNOFF', 'governance.reviewSignOff.approver', `State ${state} requires an approver.`);
        }
        if (g.reviewSignOff.reviewIndependence === 'PENDING') {
          addError('ERR_REVIEW_SIGNOFF', 'governance.reviewSignOff.reviewIndependence', 'Review independence must be classified.');
        }
      }
    }
  }

  // 6. CI Verification (never claim external CI passed independently)
  if (!isPlainObject(record.ciVerification) || !isPlainObject(record.ciVerification.requiredChecks)) {
    addError('ERR_CI_VERIFICATION', 'ciVerification', 'ciVerification.requiredChecks is required.');
  } else {
    const rc = record.ciVerification.requiredChecks;
    if (POST_VALIDATED_STATES.has(state)) {
      for (const key of ['build', 'pragValidationGate', 'postgresCi', 'failureRecoveryCi']) {
        if (rc[key] !== 'PASS') {
          addError('ERR_CI_VERIFICATION', `ciVerification.requiredChecks.${key}`, `State ${state} requires ${key}=PASS.`);
        }
      }
    }
    // External GitHub Actions runs cannot be independently verified offline by this read-only validator
    externalEvidence.ciEvidenceCheck = 'UNVERIFIED';
  }

  // 7. Staging Acceptance
  if (POST_STAGING_STATES.has(state)) {
    if (!isPlainObject(record.staging)) {
      addError('ERR_STAGING_EVIDENCE', 'staging', `State ${state} requires staging acceptance evidence.`);
    } else {
      const st = record.staging;
      if (st.basicAuthPreserved !== true) {
        addError('ERR_STAGING_EVIDENCE', 'staging.basicAuthPreserved', 'Staging Basic Auth must be preserved.');
      }
      if (st.postUploadSnapshotVerified !== true) {
        addError('ERR_STAGING_EVIDENCE', 'staging.postUploadSnapshotVerified', 'Staging post-upload snapshot must be verified.');
      }
      if (!SHA256_RE.test(st.stagingManifestSha256 || '')) {
        addError('ERR_SHA256_FORMAT', 'staging.stagingManifestSha256', 'Must be a valid 64-char lowercase SHA-256 hex digest.');
      }
      if (!SHA256_RE.test(st.stagingPackageRootSha256 || '')) {
        addError('ERR_SHA256_FORMAT', 'staging.stagingPackageRootSha256', 'Must be a valid 64-char lowercase SHA-256 hex digest.');
      }
      if (typeof st.acceptedBy !== 'string' || st.acceptedBy.trim().length === 0) {
        addError('ERR_STAGING_EVIDENCE', 'staging.acceptedBy', 'acceptedBy is required.');
      }
      if (typeof st.acceptedAtUtc !== 'string' || !ISO_UTC_RE.test(st.acceptedAtUtc)) {
        addError('ERR_TIMESTAMP', 'staging.acceptedAtUtc', 'Must be ISO-8601 UTC timestamp.');
      }
    }
  }

  // 8. Production Artifact & Integrity Proof (DEC-OPS-04)
  if (record.productionArtifact !== null && record.productionArtifact !== undefined) {
    if (!isPlainObject(record.productionArtifact)) {
      addError('ERR_ARTIFACT', 'productionArtifact', 'productionArtifact must be an object or null.');
    } else {
      const pa = record.productionArtifact;
      if (pa.integrityProofType !== 'SHA256_HASH_MANIFEST') {
        addError(
          'ERR_UNSUPPORTED_SIGNATURE',
          'productionArtifact.integrityProofType',
          'integrityProofType must be "SHA256_HASH_MANIFEST" under DEC-OPS-04.'
        );
      }
      if (pa.cryptographicSignature !== null) {
        addError(
          'ERR_UNSUPPORTED_SIGNATURE',
          'productionArtifact.cryptographicSignature',
          'Cryptographic signing is unimplemented under DEC-OPS-04; cryptographicSignature must be null.'
        );
      }
      if (!SHA256_RE.test(pa.manifestSha256 || '')) {
        addError('ERR_SHA256_FORMAT', 'productionArtifact.manifestSha256', 'Invalid SHA-256 hex digest.');
      }
      if (!SHA256_RE.test(pa.packageRootSha256 || '')) {
        addError('ERR_SHA256_FORMAT', 'productionArtifact.packageRootSha256', 'Invalid SHA-256 hex digest.');
      }
      if (POST_AUTHORIZED_STATES.has(state) && pa.verifyOnlyPassed !== true) {
        addError('ERR_ARTIFACT', 'productionArtifact.verifyOnlyPassed', 'Production artifact must pass --verify-only.');
      }

      // Optional local manifest cross-check
      if (manifestPath) {
        if (!fs.existsSync(manifestPath)) {
          externalEvidence.manifestCheck = 'UNVERIFIED';
          warnings.push(`Provided manifestPath does not exist: ${manifestPath}; manifestCheck=UNVERIFIED.`);
        } else {
          const rawManifest = fs.readFileSync(manifestPath);
          const actualManifestSha = crypto.createHash('sha256').update(rawManifest).digest('hex');
          let parsedManifest = null;
          try {
            parsedManifest = JSON.parse(rawManifest.toString('utf8'));
          } catch {
            addError('ERR_MANIFEST_PARSE', 'productionArtifact', 'Local manifest file is not valid JSON.');
          }
          if (parsedManifest) {
            const actualRootSha = parsedManifest.packageSummary?.packageRootSha256;
            const manifestMatches = actualManifestSha === pa.manifestSha256;
            const rootMatches = actualRootSha === pa.packageRootSha256;
            if (manifestMatches && rootMatches) {
              externalEvidence.manifestCheck = 'VERIFIED';
            } else {
              externalEvidence.manifestCheck = 'MISMATCH';
              if (!manifestMatches) {
                addError(
                  'ERR_DIGEST_MISMATCH',
                  'productionArtifact.manifestSha256',
                  `Manifest SHA-256 mismatch: record=${pa.manifestSha256}, local=${actualManifestSha}.`
                );
              }
              if (!rootMatches) {
                addError(
                  'ERR_DIGEST_MISMATCH',
                  'productionArtifact.packageRootSha256',
                  `packageRootSha256 mismatch: record=${pa.packageRootSha256}, local=${actualRootSha}.`
                );
              }
            }
          }
        }
      }
    }
  } else if (POST_AUTHORIZED_STATES.has(state)) {
    addError('ERR_ARTIFACT', 'productionArtifact', `State ${state} requires productionArtifact metadata.`);
  }

  // 9. Owner Authorization Gate
  if (record.ownerAuthorization !== null && record.ownerAuthorization !== undefined) {
    if (!isPlainObject(record.ownerAuthorization)) {
      addError('ERR_OWNER_AUTH', 'ownerAuthorization', 'ownerAuthorization must be an object or null.');
    } else {
      const oa = record.ownerAuthorization;
      if (!VALID_OWNER_DECISIONS.has(oa.decision)) {
        addError('ERR_OWNER_AUTH', 'ownerAuthorization.decision', 'Invalid ownerAuthorization.decision.');
      }
      if (oa.satisfiesFormalBpgaRag !== false) {
        addError(
          'ERR_BPGA_MISCLASSIFICATION',
          'ownerAuthorization.satisfiesFormalBpgaRag',
          'Procedural owner authorization must never be classified as formal BPGA RAG authorization (must be false).'
        );
      }
      if (typeof oa.authorizedBy !== 'string' || oa.authorizedBy.trim().length === 0) {
        addError('ERR_OWNER_AUTH', 'ownerAuthorization.authorizedBy', 'authorizedBy is required.');
      }
      if (typeof oa.authorizedAtUtc !== 'string' || !ISO_UTC_RE.test(oa.authorizedAtUtc)) {
        addError('ERR_TIMESTAMP', 'ownerAuthorization.authorizedAtUtc', 'Must be ISO-8601 UTC timestamp.');
      }
      if (oa.decision === 'AUTHORIZED' || oa.decision === 'AUTHORIZED_WITH_OBSERVATIONS') {
        if (!SHA256_RE.test(oa.approvedPackageRootSha256 || '')) {
          addError(
            'ERR_OWNER_AUTH',
            'ownerAuthorization.approvedPackageRootSha256',
            'Owner authorization must bind to a valid 64-char SHA-256 packageRootSha256.'
          );
        } else if (
          isPlainObject(record.productionArtifact) &&
          oa.approvedPackageRootSha256 !== record.productionArtifact.packageRootSha256
        ) {
          addError(
            'ERR_DIGEST_MISMATCH',
            'ownerAuthorization.approvedPackageRootSha256',
            'approvedPackageRootSha256 does not match productionArtifact.packageRootSha256.'
          );
        }
      }
    }
  }

  if (POST_AUTHORIZED_STATES.has(state)) {
    if (!isPlainObject(record.ownerAuthorization)) {
      addError('ERR_MISSING_OWNER_AUTH', 'ownerAuthorization', `State ${state} requires explicit ownerAuthorization.`);
    } else if (
      record.ownerAuthorization.decision !== 'AUTHORIZED' &&
      record.ownerAuthorization.decision !== 'AUTHORIZED_WITH_OBSERVATIONS'
    ) {
      addError(
        'ERR_MISSING_OWNER_AUTH',
        'ownerAuthorization.decision',
        `State ${state} requires ownerAuthorization.decision to be AUTHORIZED or AUTHORIZED_WITH_OBSERVATIONS.`
      );
    }
  }

  // 10. Production Deployment Evidence
  if (POST_DEPLOYED_STATES.has(state)) {
    if (!isPlainObject(record.productionDeployment)) {
      addError('ERR_DEPLOYMENT_EVIDENCE', 'productionDeployment', `State ${state} requires productionDeployment evidence.`);
    } else {
      const pd = record.productionDeployment;
      if (pd.transferMethod !== 'OWNER_MANUAL_SFTP_CHROOTED') {
        addError('ERR_DEPLOYMENT_EVIDENCE', 'productionDeployment.transferMethod', 'transferMethod must be OWNER_MANUAL_SFTP_CHROOTED.');
      }
      if (pd.postUploadSnapshotVerified !== true) {
        addError('ERR_DEPLOYMENT_EVIDENCE', 'productionDeployment.postUploadSnapshotVerified', 'Post-upload snapshot must be verified.');
      }
      if (typeof pd.missingOrUnexpectedFiles !== 'number' || pd.missingOrUnexpectedFiles !== 0) {
        addError('ERR_DEPLOYMENT_EVIDENCE', 'productionDeployment.missingOrUnexpectedFiles', 'Must have 0 missing or unexpected files.');
      }
      if (typeof pd.deployedAtUtc !== 'string' || !ISO_UTC_RE.test(pd.deployedAtUtc)) {
        addError('ERR_TIMESTAMP', 'productionDeployment.deployedAtUtc', 'Must be ISO-8601 UTC timestamp.');
      }
    }
  } else if (state === 'DRAFT' || state === 'VALIDATED' || state === 'STAGING_ACCEPTED' || state === 'AUTHORIZED') {
    if (record.productionDeployment !== null && record.productionDeployment !== undefined) {
      addError('ERR_PREMATURE_DEPLOYMENT_CLAIM', 'productionDeployment', `Pre-deployment state ${state} must not claim productionDeployment.`);
    }
  }

  // 11. Post-Deployment Verification Evidence
  if (ACCEPTED_STATES.has(state)) {
    if (!isPlainObject(record.postDeploymentVerification)) {
      addError('ERR_VERIFICATION_EVIDENCE', 'postDeploymentVerification', `State ${state} requires postDeploymentVerification evidence.`);
    } else {
      const pv = record.postDeploymentVerification;
      if (pv.canonicalRedirectsVerified !== true || pv.privacyZeroStorageVerified !== true || pv.legalPagesVerified !== true) {
        addError('ERR_VERIFICATION_EVIDENCE', 'postDeploymentVerification', 'Redirects, zero-storage privacy, and legal pages must all be verified.');
      }
      if (typeof pv.consoleErrors !== 'number' || pv.consoleErrors !== 0) {
        addError('ERR_VERIFICATION_EVIDENCE', 'postDeploymentVerification.consoleErrors', 'Accepted release must have 0 consoleErrors.');
      }
      if (typeof pv.verifiedAtUtc !== 'string' || !ISO_UTC_RE.test(pv.verifiedAtUtc)) {
        addError('ERR_TIMESTAMP', 'postDeploymentVerification.verifiedAtUtc', 'Must be ISO-8601 UTC timestamp.');
      }
    }
  } else if (!TERMINAL_STATES.has(state)) {
    if (record.postDeploymentVerification !== null && record.postDeploymentVerification !== undefined) {
      addError(
        'ERR_PREMATURE_VERIFICATION_CLAIM',
        'postDeploymentVerification',
        `Non-accepted state ${state} must not claim postDeploymentVerification.`
      );
    }
  }

  // 12. Residual Risks & Final Disposition Consistency
  if (!Array.isArray(record.residualRisksAndLimitations)) {
    addError('ERR_RESIDUAL_RISKS', 'residualRisksAndLimitations', 'residualRisksAndLimitations must be an array.');
  } else if (state === 'RELEASE_ACCEPTED_WITH_LIMITATIONS' && record.residualRisksAndLimitations.length === 0) {
    addError(
      'ERR_RESIDUAL_RISKS',
      'residualRisksAndLimitations',
      'RELEASE_ACCEPTED_WITH_LIMITATIONS requires at least one documented residual risk/limitation.'
    );
  }

  if (TERMINAL_STATES.has(state)) {
    if (record.finalDisposition !== state) {
      addError(
        'ERR_FINAL_DISPOSITION',
        'finalDisposition',
        `Terminal state ${state} requires finalDisposition="${state}".`
      );
    }
  } else if (record.finalDisposition !== null) {
    addError(
      'ERR_FINAL_DISPOSITION',
      'finalDisposition',
      `Non-terminal state ${state} must have finalDisposition=null.`
    );
  }

  // 13. Rollback Reference & Rollback Execution Governance
  if (!isPlainObject(record.rollback)) {
    addError('ERR_ROLLBACK', 'rollback', 'rollback reference block is required.');
  } else {
    if (!SHA256_RE.test(record.rollback.previousPackageRootSha256 || '')) {
      addError('ERR_SHA256_FORMAT', 'rollback.previousPackageRootSha256', 'Must be a valid 64-char SHA-256 hex digest.');
    }
    if (record.recordTier === 'PUBLIC_SAFE' && !ARCHIVE_REF_RE.test(record.rollback.archiveReferenceId || '')) {
      addError('ERR_ROLLBACK', 'rollback.archiveReferenceId', 'archiveReferenceId must match ARCHIVE-<ID> (no local paths).');
    }
  }

  if (state === 'ROLLED_BACK') {
    if (!isPlainObject(record.rollbackExecution)) {
      addError('ERR_ROLLBACK_GOVERNANCE', 'rollbackExecution', 'ROLLED_BACK state requires rollbackExecution evidence.');
    } else {
      const re = record.rollbackExecution;
      if (re.rollbackMode !== 'FILE_LEVEL' && re.rollbackMode !== 'FULL_RELEASE') {
        addError('ERR_ROLLBACK_GOVERNANCE', 'rollbackExecution.rollbackMode', 'rollbackMode must be FILE_LEVEL or FULL_RELEASE.');
      }
      if (re.ownerAuthorized !== true) {
        addError('ERR_ROLLBACK_GOVERNANCE', 'rollbackExecution.ownerAuthorized', 'Rollback requires explicit owner authorization.');
      }
      if (re.postRollbackVerified !== true) {
        addError('ERR_ROLLBACK_GOVERNANCE', 'rollbackExecution.postRollbackVerified', 'Post-rollback verification must be true.');
      }
      if (!SHA256_RE.test(re.restoredPackageRootSha256 || '')) {
        addError('ERR_SHA256_FORMAT', 'rollbackExecution.restoredPackageRootSha256', 'Must be a valid 64-char SHA-256 hex digest.');
      }
      if (!VALID_SOURCE_DISPOSITIONS.has(re.sourceCodeDisposition)) {
        addError(
          'ERR_ROLLBACK_GOVERNANCE',
          'rollbackExecution.sourceCodeDisposition',
          'Must specify explicit sourceCodeDisposition (NO_CODE_CHANGE_DEPLOYMENT_FAILURE, REVERT_PR_REQUIRED_CODE_DEFECT, or FORWARD_FIX_PR_REQUIRED).'
        );
      }
      if (re.autoGitRevertTriggered !== false) {
        addError(
          'ERR_ROLLBACK_GOVERNANCE',
          'rollbackExecution.autoGitRevertTriggered',
          'Production rollback must never automatically trigger a Git revert (autoGitRevertTriggered must be false).'
        );
      }
    }
  }

  return {
    structuralValidity: errors.length === 0 ? 'PASS' : 'FAIL',
    externalEvidence,
    errors,
    warnings,
  };
}

function parseCliArgs(argv) {
  const opts = {
    recordPath: null,
    manifestPath: null,
    gitDir: null,
    allowProtected: false,
    json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--manifest' && argv[i + 1]) {
      opts.manifestPath = path.resolve(argv[++i]);
    } else if (arg === '--git-dir' && argv[i + 1]) {
      opts.gitDir = path.resolve(argv[++i]);
    } else if (arg === '--allow-protected') {
      opts.allowProtected = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (!arg.startsWith('-') && !opts.recordPath) {
      opts.recordPath = path.resolve(arg);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }
  return opts;
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  try {
    const opts = parseCliArgs(process.argv);
    if (!opts.recordPath) {
      console.error(
        'Usage: node tooling/verify_release_record.mjs <release-record.json> [--manifest <path>] [--git-dir <dir>] [--allow-protected] [--json]'
      );
      process.exit(2);
    }
    const raw = fs.readFileSync(opts.recordPath, 'utf8');
    const parsed = JSON.parse(raw);
    const result = verifyReleaseRecord(parsed, {
      manifestPath: opts.manifestPath,
      gitDir: opts.gitDir,
      allowProtected: opts.allowProtected,
    });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`[release-record-verify] Structural Validity: ${result.structuralValidity}`);
      console.log(
        `[release-record-verify] External Evidence: manifest=${result.externalEvidence.manifestCheck}, gitTree=${result.externalEvidence.gitTreeCheck}, ci=${result.externalEvidence.ciEvidenceCheck}, bpga=${result.externalEvidence.bpgaExternalArtifactsCheck}`
      );
      for (const w of result.warnings) {
        console.warn(`  WARN: ${w}`);
      }
      for (const e of result.errors) {
        console.error(`  FAIL [${e.code}] ${e.field}: ${e.message}`);
      }
    }
    process.exit(result.structuralValidity === 'PASS' ? 0 : 1);
  } catch (err) {
    console.error(`[release-record-verify] ERROR: ${err.message}`);
    process.exit(2);
  }
}
