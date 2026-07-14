# BECC Releases Index

This directory serves as the official release repository for the BridGenta Engineering Communication Constitution (BECC) framework. It catalogs release declarations, release notes, changelogs, and machine-readable manifests for all major and minor versions.

---

## 1. Current Production Release

*   **Version**: **BECC v2.0.0-GA**
*   **Release Date**: 2026-07-14
*   **Status**: **Production Baseline (General Availability)**
*   **Manifest**: [BECC-v2.0-RELEASE-MANIFEST.json](./BECC-v2.0-RELEASE-MANIFEST.json)
*   **Key Documents**:
    *   [GA Declaration](./BECC-v2.0-GA-DECLARATION.md) (Official closure statement)
    *   [Release Notes](./BECC-v2.0-RELEASE-NOTES.md) (adoption guide for engineers)
    *   [Changelog](./BECC-v2.0-CHANGELOG.md) (Completed v2.0 modifications)

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

---

## 4. Release Lifecycle & Future Guidance

Any future release of the BECC framework (e.g. minor updates like v2.1 or major milestones like v3.0) must adhere to the following governance cycle:

1.  **Pilot Accumulation**: Gaps must be recorded in the `Improvement Candidate Register` across multiple audits.
2.  **Review Board Meeting**: The PICRB must evaluate candidates against standardization thresholds.
3.  **Architecture Freeze**: Updates to schemas or spec roadmaps must be frozen and baseline-hashes verified.
4.  **Changelog Compilation**: All changes must be logged under the standard changelog structure.
5.  **Release Packaging**: The manifest must include hashes computed using the standard MD5 algorithm before signing the GA Declaration.
