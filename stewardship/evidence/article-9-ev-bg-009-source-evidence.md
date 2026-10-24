# Source Evidence Packet: Article 9 / EV-BG-009

This document packages the verifiable source evidence for provenance event `EV-BG-009` linked to Article 9 ("Entwurfs-Vorschau vs. Veröffentlichungsstand: Sichere Sichtprüfung ohne Frühveröffentlichung").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-009`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `src/pages/lernen/preview/[slug].astro`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `d45de9d7290495da65596465b1b45cfded8dacab`
- **historicalRevisionVerified**: `d45de9d7290495da65596465b1b45cfded8dacab`
- **sourceFileAtRevisionVerified**: `src/pages/lernen/preview/[slug].astro`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `cc69370c7cd470b2154d1693e901c67121d8863a99a0e75e07dabd4c25ca4c95`
- **CURRENT_LOCAL_FILE_HASH**: `3e47d8d629594996f5a2c534958b29648028157225ff89954d6ae6b4ba15eae7`
- **HASH_RELATION**: `DIFFERENT` (The preview page was subsequently maintained with enhanced layout guards).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `d45de9d7290495da65596465b1b45cfded8dacab` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/d45de9d7290495da65596465b1b45cfded8dacab`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show d45de9d7290495da65596465b1b45cfded8dacab:src/pages/lernen/preview/[slug].astro` to inspect preview routing logic.
2. Confirm that draft articles are rendered only under `/preview/` in DEV mode, while production builds exclude drafts from `/lernen/[slug]`.
