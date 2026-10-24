---
subject: "src/content/learning/entwurfs-vorschau-vs-veroeffentlichungsstand.md"
reviewType: "Source-Fidelity"
result: "PASS"
reviewedAt: "2026-10-24T21:00:00+02:00"
reviewerOrRole: "Publication Steward"
---

# Source-Fidelity Review: Entwurfs-Vorschau vs. Veröffentlichungsstand: Sichere Sichtprüfung ohne Frühveröffentlichung (EV-BG-009)

This review evaluates the source fidelity of Article 9 ("Entwurfs-Vorschau vs. Veröffentlichungsstand: Sichere Sichtprüfung ohne Frühveröffentlichung") against verified event `EV-BG-009`.

## 1. Verified Evidence Sources

- **Source Event (Draft Preview Routing Implementation)**:
  - SOURCE_PROJECT: `bridgenta-core`
  - SOURCE_SYSTEM: `git`
  - SOURCE_LOCATOR: `src/pages/lernen/preview/[slug].astro`
  - HISTORICAL_LOCATOR_STATE: `AVAILABLE`
  - HISTORICAL_LOCATOR: `d45de9d7290495da65596465b1b45cfded8dacab`
  - Evidence Packet: [article-9-ev-bg-009-source-evidence.md](file:///c:/antigravity/statichtmlpro/fdrefs/stewardship/evidence/article-9-ev-bg-009-source-evidence.md)

---

## 2. Claim-to-Evidence Matrix

### Claim 1: Commit d45de9d introduced the isolated preview route src/pages/lernen/preview/[slug].astro for DEV mode draft previews.
- **Evidence Location**: Commit `d45de9d7290495da65596465b1b45cfded8dacab` (`src/pages/lernen/preview/[slug].astro`).
- **Evidence Type**: Git diff and implementation code.
- **Support**: `DIRECT` (The commit adds the preview file with DEV-mode condition and `noindex, nofollow` metadata).
- **Disposition**: `KEEP`

### Claim 2: The public learning route (/lernen/[slug]) generates exclusively articles with publicationState: "published".
- **Evidence Location**: `src/pages/lernen/[slug].astro` (collection filter function).
- **Evidence Type**: Implementation code.
- **Support**: `DIRECT` (The public routing page filters `entry.data.publicationState === 'published'`).
- **Disposition**: `KEEP`

---

## 3. Conclusion

All claims are supported by the git commit history and Astro routing implementation. The locator is resolved and verified.

**Final Fidelity Disposition: PASS**
