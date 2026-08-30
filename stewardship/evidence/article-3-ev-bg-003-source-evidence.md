# Source Evidence Packet: Article 3 / EV-BG-003

This document packages the verifiable source evidence for provenance event `EV-BG-003` linked to Article 3.

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-003`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `tooling/build_tina.cjs`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `50a8c85e8aa7ebdc8fafb060b92166aebba4764c`
- **historicalRevisionVerified**: `50a8c85e8aa7ebdc8fafb060b92166aebba4764c`
- **sourceFileAtRevisionVerified**: `tooling/build_tina.cjs` (Note: deleted at this revision to revert build integration).
- **capturedEvidenceDate**: `2026-08-30T14:40:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `none` (Deleted in the target revision).
- **CURRENT_LOCAL_FILE_HASH**: `none` (Not present in the active worktree).
- **HASH_RELATION**: `IDENTICAL` (Both represent deleted state).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `50a8c85e8aa7ebdc8fafb060b92166aebba4764c` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/50a8c85e8aa7ebdc8fafb060b92166aebba4764c`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 50a8c85e8aa7ebdc8fafb060b92166aebba4764c` to inspect the reversion of `tooling/build_tina.cjs`.
