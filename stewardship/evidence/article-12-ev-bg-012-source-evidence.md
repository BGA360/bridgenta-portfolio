# Source Evidence Packet: Article 12 / EV-BG-012

This document packages the verifiable source evidence for provenance event `EV-BG-012` linked to Article 12 ("Was passiert, wenn mitten im Softwareprojekt das KI-Modell wechselt?").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-012`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `301799f07a2139ee8eeef4c84a8ff6dcbc48f3fb`
- **historicalRevisionVerified**: `301799f07a2139ee8eeef4c84a8ff6dcbc48f3fb`
- **sourceFileAtRevisionVerified**: `docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `e2f179156c4a5451b56a87f2099b9d59b01453aff3195e70d4aa9b923665c8d5`
- **CURRENT_LOCAL_FILE_HASH**: `e2f179156c4a5451b56a87f2099b9d59b01453aff3195e70d4aa9b923665c8d5`
- **HASH_RELATION**: `IDENTICAL`

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `301799f` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/301799f07a2139ee8eeef4c84a8ff6dcbc48f3fb`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 301799f:docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md` to inspect the WP-008 certificate.
2. Confirm the provider broker architecture, model abstraction boundaries, and requirement for external SSoT rules.
