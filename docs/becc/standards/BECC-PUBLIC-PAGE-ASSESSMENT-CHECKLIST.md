# BECC Public Page Assessment Checklist

This checklist guides auditors and developers through evaluating public project pages against the BECC Reference Standard.

---

## 1. Structural Auditing
- [ ] Is there exactly one `H1` tag on the page?
- [ ] Do headings proceed sequentially (`H2` -> `H3` -> `H4`) without skipped levels?
- [ ] Are all public structural and navigation headings in German?
- [ ] Are bilingual headings (e.g. displaying both English and German parentheticals) removed?

## 2. Terminology and Register
- [ ] Are common German nouns and compounds capitalized correctly (e.g., `die Branches`)?
- [ ] Are canonical English proper nouns (e.g., `Preservation Layers`) left in English?
- [ ] Are general-use terms natural and readable (CEFR B2–C1 register)?
- [ ] Are ampersands (`&`) replaced with `und` in all standard German headings?

## 3. Evidence and Claims
- [ ] Are all quantitative metrics scoped to a test or pilot run (e.g., `im Pilotbetrieb`)?
- [ ] Are absolute warranties (e.g. `garantieren`, `lückenlos`, `fehlerfrei`) removed or reworded?
- [ ] Is every claim registered in the project's evidence map?

## 4. Visual and Render Gates
- [ ] Does the page compile cleanly using `npm run build` without warnings?
- [ ] At 320 px, does the page stack vertically without horizontal body scrollbars?
- [ ] Do tables utilize horizontal scroll containers (`overflow-x: auto`)?
- [ ] At 200% browser zoom, does the layout scale fluidly without overlapping text?

## 5. Live Page & Cache
- [ ] Does the live page return HTTP 200?
- [ ] Is the Service Worker cache name version bumped after deployment to prevent stale loads?
