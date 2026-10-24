---
subject: "src/content/learning/sitemap-vollstaendigkeit-und-suchmaschinen-entdeckbarkeit.md"
reviewType: "Source-Fidelity"
result: "PASS"
reviewedAt: "2026-10-24T21:00:00+02:00"
reviewerOrRole: "Publication Steward"
---

# Source-Fidelity Review: Wenn der Build grün ist, aber die Seite in der Sitemap fehlt (EV-BG-007)

This review evaluates the source fidelity of Article 7 ("Wenn der Build grün ist, aber die Seite in der Sitemap fehlt") against verified event `EV-BG-007`.

## 1. Verified Evidence Sources

- **Source Event (Publish Check Tooling Commit)**:
  - SOURCE_PROJECT: `bridgenta-core`
  - SOURCE_SYSTEM: `git`
  - SOURCE_LOCATOR: `tooling/publish_check_learning_article.js`
  - HISTORICAL_LOCATOR_STATE: `AVAILABLE`
  - HISTORICAL_LOCATOR: `cb5b03b2b54a0640396e7c0ce0021727957677eb`
  - Evidence Packet: [article-7-ev-bg-007-source-evidence.md](file:///c:/antigravity/statichtmlpro/fdrefs/stewardship/evidence/article-7-ev-bg-007-source-evidence.md)

---

## 2. Claim-to-Evidence Matrix

### Claim 1: The BridGenta publish-check tool inspects dist/sitemap.xml to verify article inclusion.
- **Evidence Location**: `tooling/publish_check_learning_article.js` (lines verifying sitemap content).
- **Evidence Type**: Implementation code.
- **Support**: `DIRECT` (The script parses `dist/sitemap.xml` and checks for the exact article URL).
- **Disposition**: `KEEP`

### Claim 2: A green build exit code alone does not guarantee presence in the discovery sitemap.
- **Evidence Location**: Astro build compiler behavior / Tooling rationale.
- **Evidence Type**: Architectural analysis.
- **Support**: `INFERENCE` (Static site generators do not treat omitted sitemap entries as build failures).
- **Disposition**: `KEEP`

### Claim 3: The automated publish-check detects missing sitemap entries and outputs DISCOVERY: FAIL.
- **Evidence Location**: `tooling/publish_check_learning_article.js`.
- **Evidence Type**: Implementation code.
- **Support**: `DIRECT` (The script outputs failure and exits with non-zero status when discovery verification fails).
- **Disposition**: `KEEP`

### Claim 4: Integrating the automated artifact check into the release gate prevents incomplete deployment.
- **Evidence Location**: `package.json` scripts (`learning:publish-check`) and GitHub Actions workflows.
- **Evidence Type**: Pipeline configuration.
- **Support**: `INFERENCE` (Enforcing checks before deployment prevents shipping incomplete artifacts).
- **Disposition**: `KEEP`

---

## 3. Conclusion

All claims are supported by the publish-check tooling and release pipeline evidence. The locator is resolved and verified.

**Final Fidelity Disposition: PASS**
