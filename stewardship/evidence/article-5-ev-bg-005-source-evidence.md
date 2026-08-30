# Source Evidence Packet: Article 5 / EV-BG-005

This document packages the verifiable source evidence for provenance event `EV-BG-005` linked to Article 5.

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-005`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `src/styles/styles.css`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `34989fdae04230f060f71b284726dee0c4a39dc8`
- **historicalRevisionVerified**: `34989fdae04230f060f71b284726dee0c4a39dc8`
- **sourceFileAtRevisionVerified**: `src/styles/styles.css`
- **capturedEvidenceDate**: `2026-08-30T14:40:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `9e2ea04c64ae0cde1b10314b0f2e712cfc0166067755ae380cfe67af28c66008`
- **CURRENT_LOCAL_FILE_HASH**: `9e2ea04c64ae0cde1b10314b0f2e712cfc0166067755ae380cfe67af28c66008`
- **HASH_RELATION**: `IDENTICAL`

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `34989fdae04230f060f71b284726dee0c4a39dc8` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/34989fdae04230f060f71b284726dee0c4a39dc8`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 34989fdae04230f060f71b284726dee0c4a39dc8:src/styles/styles.css` to inspect CSS alterations that removed the mobile contact button.
