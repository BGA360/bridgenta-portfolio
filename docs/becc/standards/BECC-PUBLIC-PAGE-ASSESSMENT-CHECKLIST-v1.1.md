# BECC Public Page Assessment Checklist v1.1

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: PENDING AUTHORIZATION
*   **Checklist Status**: `DRAFT — NOT EVIDENCE`
*   **Completion Effect**: `NONE`

> [!IMPORTANT]
> **Shared Status & Separation Boundary**
> *   This checklist candidate has no active enforcement, certification, publication, or supersession effect until formally approved.
> *   Completing this checklist does not itself produce certification, publication authorization, merge authorization, amendment approval, supersession, or activation.
>
> ```text
> Machine validation
> ≠ author or engineering self-review
> ≠ authorized semantic fresh-reader review
> ≠ independent certification review
> ≠ constitutional or designated approval
> ≠ merge authorization
> ≠ publication authorization
> ≠ activation
> ```

This checklist guides auditors and developers through evaluating public project pages against the BECC Reference Standard v1.1.

---

## 1. Validation Phase Layering
The validation process is divided into distinct sections. Completion of one section does not complete or authorize a later section.

### Phase 1: Machine Lexical Validation
- [ ] Has the machine lexical scan run successfully with zero malformed registry errors?
- [ ] Are all candidate matches flagged by the scanner adjudicated by a human reviewer?

### Phase 2: Author or Engineering Self-Review
- [ ] Is there exactly one `H1` tag on the page?
- [ ] Do headings proceed sequentially (`H2` -> `H3` -> `H4`) without skipped levels?
- [ ] Are all public structural and navigation headings in German?
- [ ] Are bilingual headings (e.g. parenthetical English additions in headings) removed?
- [ ] Are ampersands (`&`) replaced with `und` in all standard German headings?
- [ ] Are programmatic symbols wrapped in code backticks?
- [ ] Is the prose natural, precise, and written in CEFR B2–C1 register?

### Phase 3: Authorized Semantic Fresh-Reader Review
- [ ] Where human review is required, is there an authenticated, reviewer-controlled attestation bound to the exact reviewed target?
- [ ] Does the review check details that automated lexical scans cannot cover?

### Phase 4: Independent Certification Review
- [ ] Is any formal WCAG conformance claim supported by evidence appropriate to the declared level, scope, and authority?
- [ ] Are generic payload-size budgets removed from the accessibility contract?
- [ ] Are console errors and network blockages that affect access to content flagged?

### Phase 5: Constitutional or Designated Approval
- [ ] Has the record been verified by the constitutionally designated authority?

### Phase 6: Publication or Activation Authorization
- [ ] Is the formal clearance logged before merging or deploying?

---

## 2. Exact-Target Verification Controls
Every review must be bound to the exact target reference:
- [ ] Repository identified?
- [ ] Branch or release reference logged?
- [ ] Full 40-character reviewed SHA recorded?
- [ ] Source artifact specified?
- [ ] Rendered target specified?
- [ ] Deployment or build reference recorded?
- [ ] Governing standard version matched?

---

## 3. Human-Review Prerequisites & Restrictions
> [!WARNING]
> Automated systems must not populate reviewer identity, signature, attestation, independence, authorization, or human-verdict fields.

Verification of human gates requires checklist controls for:
- [ ] Known human reviewer identity
- [ ] Appointment reference
- [ ] Appointing authority
- [ ] Authorization scope
- [ ] Identity-verification reference
- [ ] Relationship to project
- [ ] Competence or role suitability
- [ ] Full 40-character reviewed SHA
- [ ] Rendered target
- [ ] Governing standard version
- [ ] Review date
- [ ] Conflict disclosure
- [ ] Independence disclosure where applicable
- [ ] Reviewer-controlled submission
- [ ] Recorded limitations

---

## 4. Claim and Evidence Bounding
- [ ] Are all quantitative metrics scoped to a test or pilot run (e.g. `im Pilotlauf`, `im Testbetrieb`)?
- [ ] Are absolute guarantees and unverified warranties (e.g. `garantieren`, `fehlerfrei`, `lückenloser Schutz`) removed?
- [ ] Is the use of `alle` and `vollständig` verified as safe (meaning it refers strictly to bounded lists, code constructs, or verified scopes)?
- [ ] Are all substantiation-sensitive claims required by the governing standard registered in the applicable claim-evidence map?
  *   *Includes: quantitative, performance, outcome, accessibility, security, conformance, certification, and categorical absence-of-event claims.*

---

## 5. Incomplete-State Behavior

> [!CAUTION]
> **INCOMPLETE — HUMAN ACTION REQUIRED**
> If any human validation gate or checklist control remains incomplete, the record cannot pass.
> Incomplete human gates must not be represented as:
> *   certified;
> *   approved;
> *   failed by automated adjudication;
> *   publication-authorized;
> *   activation-authorized.
