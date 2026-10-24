# Source Evidence Packet: Article 13 / EV-BG-013

This document packages the verifiable source evidence for provenance event `EV-BG-013` linked to Article 13 ("Wer genau ist dieser KI-Agent?").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-013`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `becc-runtime/evidence/ledger-verification.service.ts`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `184b463b5b9be09bb6954e50329540f69c106c8d`
- **historicalRevisionVerified**: `184b463b5b9be09bb6954e50329540f69c106c8d`
- **sourceFileAtRevisionVerified**: `becc-runtime/evidence/ledger-verification.service.ts`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `1494eeb9401dfaa02f9e6653dd39aa1309786081c0d5d5e1690816821acff3b0`
- **CURRENT_LOCAL_FILE_HASH**: `a0388d0eacf159e7c22da2b36590c28a45f143232287885433857e9d40cb238e`
- **HASH_RELATION**: `DIFFERENT` (The ledger verification service was maintained across BECC testbed and runtime enhancements).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `184b463b5b9be09bb6954e50329540f69c106c8d` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/184b463b5b9be09bb6954e50329540f69c106c8d`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 184b463b5b9be09bb6954e50329540f69c106c8d:becc-runtime/evidence/ledger-verification.service.ts` to inspect signature and envelope verification.
2. Confirm that identity verification tracks providerId, reviewerId, sessionId, and key revocation, while lacking an autonomous agentId.
