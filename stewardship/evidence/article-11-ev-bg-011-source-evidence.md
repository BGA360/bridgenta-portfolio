# Source Evidence Packet: Article 11 / EV-BG-011

This document packages the verifiable source evidence for provenance event `EV-BG-011` linked to Article 11 ("Ausführungsreihenfolge vs. Datenabhängigkeit: Warum ein Ablaufplan Datenflüsse nicht ersetzen kann").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-011`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `docs/ECP-WP009-001-PROVIDER-EXECUTION-LIFECYCLE-RESOLUTION.md`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `76b6ed570ee490321825933eece3af77d2852e6f`
- **historicalRevisionVerified**: `76b6ed570ee490321825933eece3af77d2852e6f`
- **sourceFileAtRevisionVerified**: `docs/ECP-WP009-001-PROVIDER-EXECUTION-LIFECYCLE-RESOLUTION.md`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `1f0b5860d350616ab020da1f88ee66495c565f2bebcd1a3b15952a1a97bc56ed`
- **CURRENT_LOCAL_FILE_HASH**: `4ae37e42953f2148fd16937fba5f85511e51c2b1f28044d1dc4e00c7ca560d2c`
- **HASH_RELATION**: `DIFFERENT` (The architectural decision document was refined and cross-referenced in subsequent BECC packages).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `76b6ed570ee490321825933eece3af77d2852e6f` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/76b6ed570ee490321825933eece3af77d2852e6f`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show 76b6ed570ee490321825933eece3af77d2852e6f:docs/ECP-WP009-001-PROVIDER-EXECUTION-LIFECYCLE-RESOLUTION.md` to inspect the architectural conflict resolution.
2. Confirm the separation of WP-009 (transport) and WP-010 (prompt compilation), and Model A Two-Phase Transformation.
