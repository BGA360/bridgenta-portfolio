# BECC Public Page Assessment Checklist v1.1

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: Pending Authorization

This checklist guides auditors and developers through evaluating public project pages against the BECC Reference Standard v1.1.

---

## 1. Structural Validation
- [ ] Is there exactly one `H1` tag on the page?
- [ ] Do headings proceed sequentially (`H2` -> `H3` -> `H4`) without skipped levels?
- [ ] Are all public structural and navigation headings in German?
- [ ] Are bilingual headings (e.g. parenthetical English additions in headings) removed?

## 2. Terminology and Register
- [ ] Are common German compound nouns capitalized correctly (e.g. `die Branches`)?
- [ ] Are canonical English proper nouns (e.g. `main branch`, `Repository`) left in English?
- [ ] Are English jargon terms explained on first use in German (e.g. `main branch (Hauptzweig)`)?
- [ ] Are ampersands (`&`) replaced with `und` in all standard German headings?
- [ ] Are programmatic symbols wrapped in code backticks?
- [ ] Is the prose natural, precise, and written in CEFR B2–C1 register?

## 3. Claim and Evidence Bounding
- [ ] Are all quantitative metrics scoped to a test or pilot run (e.g. `im Pilotlauf`, `im Testbetrieb`)?
- [ ] Are absolute guarantees and unverified warranties (e.g. `garantieren`, `fehlerfrei`, `lückenloser Schutz`) removed?
- [ ] Is the use of `alle` and `vollständig` verified as safe (meaning it refers strictly to bounded lists, code constructs, or verified scopes)?
- [ ] Is every claim registered in the project's evidence map?

## 4. Accessibility and Evidence
- [ ] Is any formal WCAG conformance claim supported by evidence appropriate to the declared level, scope, and authority?
- [ ] Are generic payload-size budgets removed from the accessibility contract?
- [ ] Are console errors and network blockages that affect access to content flagged?

## 5. Audit & Adjudication
- [ ] Has the machine lexical scan run successfully with zero malformed registry errors?
- [ ] Has a manual semantic fresh-reading audit been performed by a qualified reviewer?
- [ ] Are all reviewer attestation fields completed and signed?
