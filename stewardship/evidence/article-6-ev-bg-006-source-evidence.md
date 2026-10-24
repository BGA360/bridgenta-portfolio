# Source Evidence Packet: Article 6 / EV-BG-006

This document packages the verifiable source evidence for provenance event `EV-BG-006` linked to Article 6 ("Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-006`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `docs/becc/learning/public-post-memory-vs-evidence-provenance-plan.md`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `319f96d29f5910691e07ba08796641f80d403cda`
- **historicalRevisionVerified**: `319f96d29f5910691e07ba08796641f80d403cda`
- **sourceFileAtRevisionVerified**: `docs/becc/learning/public-post-memory-vs-evidence-provenance-plan.md`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `48a27a8ad4e1c6596732e309dccf870593b426351789d11f1bba00bc20da3ffa`
- **CURRENT_LOCAL_FILE_HASH**: `cb2cb3f30689520d3c12679b1d1444bfcac88e2e6d4540ed96542c9ab1aecf93`
- **HASH_RELATION**: `DIFFERENT` (The planning document was subsequently updated as part of BECC learning documentation iteration).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `319f96d29f5910691e07ba08796641f80d403cda` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/319f96d29f5910691e07ba08796641f80d403cda`

## 4. Verification Reproducibility Details

To verify:
1. Run `git rev-parse 319f96d29f5910691e07ba08796641f80d403cda` in the root folder.
2. Inspect `docs/becc/learning/public-post-memory-vs-evidence-provenance-plan.md` to confirm the recorded incident, absence state analysis, and epistemic boundary.
