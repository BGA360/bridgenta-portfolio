# BECC Releases Index

This directory serves as the official release repository for the BridGenta Engineering Communication Constitution (BECC) framework. It catalogs release declarations, release notes, changelogs, and machine-readable manifests for all major and minor versions.

---

## 1. Current Production Release

*   **Version**: **BECC v1.0.0-GA**
*   **Status**: **Active Production Standard**
*   **Key Documents**:
    *   [GA Declaration](./BECC-v1.0-GA-DECLARATION.md) (Official GA declaration statement)
    *   [Release Standard](./BECC-v1.0-GA.md) (Core v1.0 standard text)

---

## 2. Proposed Amendment Candidate

*   **Version**: **BECC v1.1-Candidate**
*   **Status**: **PROPOSED — PENDING REVIEW — INACTIVE**
*   **Key Documents**:
    *   [Amendment Candidate](../stewardship/amendments/BECC-AMENDMENT-CANDIDATE-v1.1.md) (Pending review manifest)


---

## 2. Release Artifact Descriptions

For every release, the following standard set of publication artifacts is generated:

1.  **GA Declaration (`*-GA-DECLARATION.md`)**: The constitutional closure statement verifying that the version has successfully met all architecture, validation, and governance gates.
2.  **Release Notes (`*-RELEASE-NOTES.md`)**: Adoption guides detailing new capabilities, comparisons to legacy editions, and usage warnings.
3.  **Changelog (`*-CHANGELOG.md`)**: Structured logs of added, changed, validated, deferred, and removed items.
4.  **Release Manifest (`*-RELEASE-MANIFEST.json`)**: Machine-readable JSON contract specifying metadata, compatibility, and file checksums.

---

## 3. Historical Releases

### 3.1. BECC v1.0.0 Series
*   **Active Release**: [BECC-v1.0-GA.md](./BECC-v1.0-GA.md)
*   **Declaration**: [BECC-v1.0-GA-DECLARATION.md](./BECC-v1.0-GA-DECLARATION.md)
*   **Release Candidates**:
    *   [v1.0-RC1](./BECC-v1.0-RC1.md)
    *   [v1.0-RC2](./BECC-v1.0-RC2.md)
*   **Release Records**:
    *   [RC2 Implementation Plan](./BECC-v1.0-RC2-IMPLEMENTATION-PLAN.md)
    *   [RC2 Remediation Plan](./BECC-v1.0-RC2-REMEDIATION-PLAN.md)
    *   [RC2 Verification Report](./BECC-v1.0-RC2-VERIFICATION-REPORT.md)

### 3.2. BECC Public-Page Standard v1.1 Candidate
*   **Active Status**: `PROPOSED — PENDING REVIEW`
*   **Amendment Proposal**: [BECC-AMENDMENT-CANDIDATE-v1.1.md](../stewardship/amendments/BECC-AMENDMENT-CANDIDATE-v1.1.md)
*   **Rationale**: Introduces terminology policy, lexical checks, and semantic fresh-reader review gates.

---

## 4. Release Lifecycle & Future Guidance

Any future release of the BECC framework (e.g. minor updates like v2.1 or major milestones like v3.0) must adhere to the following governance cycle:

1.  **Pilot Accumulation**: Gaps must be recorded in the `Improvement Candidate Register` across multiple audits.
2.  **Review Board Meeting**: The PICRB must evaluate candidates against standardization thresholds.
3.  **Architecture Freeze**: Updates to schemas or spec roadmaps must be frozen and baseline-hashes verified.
4.  **Changelog Compilation**: All changes must be logged under the standard changelog structure.
5.  **Release Packaging**: The manifest must include SHA-256 hashes computed against the explicitly declared repository tree or artifact state (recording the exact commit or tree state, whether raw repository bytes or a documented normalization method is used, and excluding self-referential manifest files). Cryptographic hashes serve solely for integrity verification and do not establish factual truth, approval, or certification.
