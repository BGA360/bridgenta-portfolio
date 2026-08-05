# BECC Public Page Reference Standard v1.1
## Guidelines for Governed Public Engineering Communication

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: PENDING AUTHORIZATION

> [!IMPORTANT]
> **Shared Status & Separation Boundary**
> *   This standard candidate has no active enforcement, certification, publication, or supersession effect until formally approved.
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

This standard defines the rules, validation layers, and claim-integrity constraints for publishing, auditing, and certifying public-facing project pages and portfolios under the BECC (BridGenta Engineering Communication Constitution) framework.

---

## 1. Core Validation Layers

To ensure structured verification within the declared BECC scope, technical communication must satisfy six validation layers:

*   **Layer 1 — Machine lexical validation**: Automated matching of vocabulary, compound standards, proper nouns, and prohibited absolute claims using a deterministic registry.
*   **Layer 2 — Author or engineering self-review**: Verification by the author or developer of layouts, evidence mapping, and readability.
*   **Layer 3 — Authorized semantic fresh-reader review**: Human fresh-reader review of the layout context, reading complexity, and semantic clarity to resolve nuances that machine scanning cannot detect.
*   **Layer 4 — Independent certification review**: Third-party evaluation of live pages against criteria, verifying deployed commit SHA-256 hashes and evidence manifests.
*   **Layer 5 — Constitutional or designated approval**: Official approval of the reviewed candidate by the designated authorities.
*   **Layer 6 — Publication or activation authorization**: Formal permission to deploy, merge, or activate the verified standard.

*Completion of one layer does not automatically complete, authorize, or satisfy any later layer.*

---

## 2. Claim Bounding & Terminology

### 2.1 Bounded Claims
All quantitative, performance, or outcome-based statements must be explicitly:
1. Mapped to documented test run logs.
2. Bounded to the specific environment in which they were observed (e.g. `im Pilotlauf`, `im Pilotbetrieb`, `in der Testumgebung`).
3. Registered in a centralized evidence map.

### 2.2 Prohibited Guarantees & Absolute Claims
Absolute warranties and categorical absence-of-event claims remain impermissible. Naming a pilot, test, staging, or limited environment does not make an absolute warranty or categorical absence-of-event statement acceptable.

Absolute-sounding claims such as `fehlerfrei`, `garantiert`, `ohne Ausfälle`, and `lückenloser Schutz` remain completely impermissible in any context.

#### Claim Bounding Examples:
*   **Unsafe**: "The system was failure-free during the pilot."
*   **Potentially supportable**: "No failures were observed during the defined pilot run documented in the identified evidence record."

### 2.3 Contextual Treatment of High-Risk Terminology
Words like `alle` (all) or `vollständig` (completely/full) are flagged as review candidates. They are permitted only when representing bounded code structures or specific verified scopes (e.g. `alle 5 Fallstudien`), and prohibited when making absolute commercial guarantees.

---

## 3. Readability & Language Governance

### 3.1 German B2–C1 Readability Target
Technical prose must maintain a professional CEFR B2–C1 register. Authors must use active verbs, clear sentence structures, and eliminate marketing hyperboles. Structured automated readability scores (e.g. Flesch metrics) serve as advisory targets; human editorial approval remains authoritative.

### 3.2 Proper Noun and Jargon Registers
- **Capitalized German Compounds**: Proper compounds must follow standard capitalization and naming rules (e.g. `die Branches`, `der Static-Site-Builder`).
- **Canonical English Terms**: Standard industry technical jargon or system layers (e.g., `main branch`, `Repository`, `Workspace`, `CI/CD pipeline`, `Service Worker`) must remain in English in technical prose.
- **First-Use Rule**: Jargon or English terms must be explained on first use in German (e.g. `main branch (Hauptzweig des Repositories)`).

---

## 4. Accessibility and Evidence Boundaries

### 4.1 Accessibility Claims
No formal WCAG conformance claim may be published unless supported by evidence appropriate to the declared conformance level, scope, and assessment authority.
- The BECC accessibility contract may contain the evidence or reference an authoritative external assessment.
- Generic payload-size budgets and performance metrics are moved out of the core accessibility contract.
- Browser DevTools console errors and network failures that block or affect access to content are retained inside the accessibility contract.

---

## 5. Governance and Human Adjudication

### 5.1 Verification gates
If BECC v1.1 is formally authorized, project pages within its declared governed scope must pass through the applicable validation gates before publication authorization:
1. **Source Check**: Lexical validation check.
2. **Semantic Check**: Manual fresh-reader review.
3. **Evidence Verification**: Mapping claims to evidence records.

### 5.2 Authorized Human Review Criteria
An authorized human semantic fresh-reader review requires the following documented criteria:
*   Known human reviewer identity
*   Appointment or authorization reference
*   Declared scope of the review
*   Repository identity
*   Full 40-character reviewed commit SHA
*   Exact rendered target (URL or file)
*   Governing standard version
*   Review date
*   Relationship and conflict disclosure
*   Independence disclosure where applicable
*   Reviewer-controlled submission
*   Recorded limitations of the review

*Project-owner review is not automatically independent assurance.*

### 5.3 Human Adjudication
Lexical scans are advisory match lists. The final adjudication of compliance, severity evaluation, and override justifications must be performed by a human reviewer.

---

## 6. Rollback & Maintenance
In the event of verification failures during branch validation, the branch history must not be rewritten. Corrective commits must be applied, or the branch abandoned.
