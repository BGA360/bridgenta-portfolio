# Source Evidence Packet: Article 14 / EV-BG-014

This document packages the verifiable source evidence for provenance event `EV-BG-014` linked to Article 14 ("Was ist ein KI-Agent? Einfach erklärt").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-014`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `becc-runtime/orchestrator/orchestrator.service.ts`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `184b463b5b9be09bb6954e50329540f69c106c8d`
- **historicalRevisionVerified**: `184b463b5b9be09bb6954e50329540f69c106c8d`
- **sourceFileAtRevisionVerified**: `becc-runtime/orchestrator/orchestrator.service.ts`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `5516a9490b28171745195e3f14ac96627c0abc94282940cc2860a489c89c5e4b`
- **CURRENT_LOCAL_FILE_HASH**: `0dc60e1cbcdce8c6be6044e328d7c4117aa876a39751e3d894a85406f010ed24`
- **HASH_RELATION**: `DIFFERENT` (The orchestrator service was maintained across BECC testbed and runtime enhancements).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `184b463b5b9be09bb6954e50329540f69c106c8d` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/184b463b5b9be09bb6954e50329540f69c106c8d`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 184b463b5b9be09bb6954e50329540f69c106c8d:becc-runtime/orchestrator/orchestrator.service.ts` to inspect orchestrator lifecycle handling.
2. Confirm the orchestration state machine managing request transformation, provider calls, review gates, and ledger commits.
