# Source Evidence Packet: Article 1 / EV-BG-001

This document packages the verifiable source evidence for provenance event `EV-BG-001` linked to Article 1.

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-001`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `bridgenta-workspace/validation/automation_controller.js`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `07aac848a4a48282c8b83169179308bdb17db0c6`
- **historicalRevisionVerified**: `07aac848a4a48282c8b83169179308bdb17db0c6`
- **sourceFileAtRevisionVerified**: `validation/automation_controller.js`
- **capturedEvidenceDate**: `2026-08-26T16:15:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `f26eec55fb363ff00281f4d9ddf00391fb1b3477031005c5042be1aa36c58280`
- **CURRENT_LOCAL_FILE_HASH**: `60c3eeec08a279732b24d69ad331de2c960dc6a7711a1467713e80ec9f4ddaf8`
- **HASH_RELATION**: `DIFFERENT` (The file was subsequently modified in commit `8ed993a` to implement the `prag-check` CLI utility and arguments parser).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The git commit `07aac848a4a48282c8b83169179308bdb17db0c6` exists in the local `bridgenta-workspace` repository).
- **REMOTE_SOURCE_AVAILABILITY**: `NOT_AVAILABLE` (The `bridgenta-workspace` repository is hosted locally in this environment and is not accessible via a public remote host).
- **REMOTE_GITHUB_EVIDENCE**: `NOT_AVAILABLE`

## 4. Verification Reproducibility Details

To re-verify the historical commit existence and file content:
1. Run `git rev-parse 07aac848a4a48282c8b83169179308bdb17db0c6` in the `bridgenta-workspace` folder.
2. Run `git cat-file -t 07aac848a4a48282c8b83169179308bdb17db0c6` to verify it is a valid commit object.
3. Run `git show 07aac848a4a48282c8b83169179308bdb17db0c6:validation/automation_controller.js` to inspect the historical code.
