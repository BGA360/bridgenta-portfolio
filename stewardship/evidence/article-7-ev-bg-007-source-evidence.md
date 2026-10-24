# Source Evidence Packet: Article 7 / EV-BG-007

This document packages the verifiable source evidence for provenance event `EV-BG-007` linked to Article 7 ("Wenn der Build grün ist, aber die Seite in der Sitemap fehlt").

## 1. Provenance Event Locators & Identity

- **eventId**: `EV-BG-007`
- **sourceProject**: `bridgenta-core`
- **sourceSystem**: `git`
- **sourceRepositoryOrWorkspaceIdentity**: `bridgenta-workspace`
- **sourceLocator**: `tooling/publish_check_learning_article.js`
- **historicalLocatorState**: `AVAILABLE`
- **historicalLocator**: `cb5b03b2b54a0640396e7c0ce0021727957677eb`
- **historicalRevisionVerified**: `cb5b03b2b54a0640396e7c0ce0021727957677eb`
- **sourceFileAtRevisionVerified**: `tooling/publish_check_learning_article.js`
- **capturedEvidenceDate**: `2026-10-24T21:00:00+02:00`
- **capturedByOrRole**: `Publication Steward`

## 2. Integrity Verification

- **SOURCE_FILE_HASH_AT_HISTORICAL_REVISION**: `91deacf3b2acd99e2ede7f6a17bd31b1a13a3f1b401420e602896d6c6aaf9567`
- **CURRENT_LOCAL_FILE_HASH**: `8dfd9e17776ef5848c965c38d4ebf74094cf676f8f97b22fb64c3283ffa4e95c`
- **HASH_RELATION**: `DIFFERENT` (The script was subsequently maintained and refined during pipeline iterations).

## 3. Local/Remote Access Evidence

- **LOCAL_GIT_EVIDENCE**: `DIRECT` (The commit `cb5b03b2b54a0640396e7c0ce0021727957677eb` exists in local repository history).
- **REMOTE_SOURCE_AVAILABILITY**: `AVAILABLE` (The main branch is hosted publicly on GitHub).
- **REMOTE_GITHUB_EVIDENCE**: `https://github.com/BGA360/bridgenta-portfolio/commit/cb5b03b2b54a0640396e7c0ce0021727957677eb`

## 4. Verification Reproducibility Details

To verify:
1. Run `git show cb5b03b2b54a0640396e7c0ce0021727957677eb:tooling/publish_check_learning_article.js` to inspect the sitemap check logic.
2. Confirm the check reads `dist/sitemap.xml` and validates presence of canonical article URLs.
