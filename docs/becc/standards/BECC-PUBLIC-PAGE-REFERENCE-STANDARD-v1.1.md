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

## 1. Core Validation Layers & Authority Boundaries

To ensure structured verification within the declared BECC scope, technical communication must satisfy six validation layers. Each layer has distinct authority:

*   **Layer 1 — Machine lexical validation**: Automated matching of vocabulary, compound standards, proper nouns, and prohibited absolute claims using a deterministic registry. **Authority:** BECC/PRAG pipelines govern applicable validation gates and publication eligibility (security, secrets, structural validation).
*   **Layer 2 — Author or engineering self-review**: Verification by the author or developer of layouts, evidence mapping, and readability.
*   **Layer 3 — Authorized semantic fresh-reader review**: Human fresh-reader review of the layout context, reading complexity, and semantic clarity to resolve nuances that machine scanning cannot detect. **Authority:** The authorized fresh-reader holds sole authority to judge linguistic accessibility.
*   **Layer 4 — Independent certification review**: Third-party evaluation of live pages against criteria, verifying deployed commit SHA-256 hashes and evidence manifests. **Authority:** Technical and evidence review judges technical correctness and evidence fidelity.
*   **Layer 5 — Constitutional or designated approval**: Official approval of the reviewed candidate by the designated authorities. **Authority:** Constitutional or designated approval authority.
*   **Layer 6 — Publication or activation authorization**: Formal permission to deploy, merge, or activate the verified standard. **Authority:** Authorized human publication/activation authorization.

*Completion of one layer does not automatically complete, authorize, or satisfy any later layer.*

---

## 2. Communication Profiles & Learning Branch Model

BECC establishes a clear target distinction between professional and learning communication channels:

### 2.1 Professional Communication Profile (CEFR B2–C1)
Technical prose targeting professional pages, official reports, and portfolio case studies must maintain a professional CEFR B2–C1 register. Authors must use active verbs, clear sentence structures, and eliminate marketing hyperboles.

### 2.2 Learning Accessibility Profile (CEFR A2–B1)
Prose targeting educational or learning-focused content targets approximately CEFR A2–B1 sentence structure and explanatory language. The profile's scope explicitly includes all four learning branch levels:
*   **PUBLIC**
*   **BEGINNER**
*   **INTERMEDIATE**
*   **ADVANCED**

#### 2.2.1 Invariant: Technical Depth vs. Linguistic Complexity
The core invariant of this profile is:
$$\text{ADVANCED TECHNICAL DEPTH} \neq \text{ADVANCED LANGUAGE COMPLEXITY}$$
While the technical depth, analytical depth, evidence density, architecture detail, implementation detail, and assurance reasoning vary between learning levels, the grammar, sentence construction, and explanatory accessibility do not intentionally become harder. Learning content targets approximately CEFR A2–B1 sentence structure and explanatory language. Necessary technical terminology may exceed ordinary A2–B1 vocabulary when technically required, as CEFR controls linguistic accessibility, not engineering depth.

---

## 3. Claim Bounding & Terminology

### 3.1 Bounded Claims
All quantitative, performance, or outcome-based statements must be explicitly:
1. Mapped to documented test run logs.
2. Bounded to the specific environment in which they were observed (e.g. `im Pilotlauf`, `im Pilotbetrieb`, `in der Testumgebung`).
3. Registered in a centralized evidence map.

### 3.2 Prohibited Guarantees & Absolute Claims
Absolute warranties and categorical absence-of-event claims remain impermissible. Naming a pilot, test, staging, or limited environment does not make an absolute warranty or categorical absence-of-event statement acceptable.

Absolute-sounding claims such as `fehlerfrei`, `garantiert`, `ohne Ausfälle`, and `lückenloser Schutz` remain completely impermissible in any context.

#### Claim Bounding Examples:
*   **Unsafe**: "The system was failure-free during the pilot."
*   **Potentially supportable**: "No failures were observed during the defined pilot run documented in the identified evidence record."

### 3.3 Contextual Treatment of High-Risk Terminology
Words like `alle` (all) or `vollständig` (completely/full) are flagged as review candidates. They are permitted only when representing bounded code structures or specific verified scopes (e.g. `alle 5 Fallstudien`), and prohibited when making absolute commercial guarantees.

---

## 4. Readability, Grammar & Advisory Metrics

Linguistic checks and automated readability statistics serve as advisory signals only. They are not CEFR compliance rules and must never masquerade as semantic assurance.

### 4.1 Advisory Heuristics
*   **Readability Scores (Flesch metrics):** Readability scores are supporting signals used to flag text for human review. They cannot prove CEFR compliance, comprehension, or teachability.
*   **Sentence and Paragraph Limits:** Word counts (e.g. 15-word threshold for A2-B1) and sentence counts (e.g. 5-sentence threshold for paragraphs) are experimental advisory heuristics to guide human editorial review. They are not blocking validation gates.
*   **Passive Voice:** Passive voice checks serve purely as editorial advisories. Passive structures may be used when they are necessary or technically appropriate.

### 4.2 Jargon & Proper Nouns
*   **Capitalized German Compounds**: Proper compounds must follow standard capitalization and naming rules (e.g. `die Branches`, `der Static-Site-Builder`).
*   **Canonical English Terms**: Standard industry technical jargon or system layers (e.g., `main branch`, `Repository`, `Workspace`, `CI/CD pipeline`, `Service Worker`) must remain in English in technical prose.
*   **Clear Explanation Close to First Use:** Any established technical term or English technical jargon must be accompanied by a clear explanation close to its first meaningful use when needed, utilizing inline definitions, examples, tooltips, or glossary mechanisms.

---

## 5. Accessibility and Evidence Boundaries

### 5.1 Accessibility Claims
No formal WCAG conformance claim may be published unless supported by evidence appropriate to the declared conformance level, scope, and assessment authority.
- The BECC accessibility contract may contain the evidence or reference an authoritative external assessment.
- Generic payload-size budgets and performance metrics are moved out of the core accessibility contract.
- Browser DevTools console errors and network failures that block or affect access to content are retained inside the accessibility contract.

---

## 6. Governance and Human Adjudication

### 6.1 Verification Gates
If BECC v1.1 is formally authorized, project pages within its declared governed scope must pass through the applicable validation gates before publication authorization:
1. **Source Check**: Lexical validation check.
2. **Semantic Check**: Manual fresh-reader review.
3. **Evidence Verification**: Mapping claims to evidence records.

### 6.2 Authorized Human Review Criteria
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

### 6.3 Human Adjudication
Lexical scans are advisory match lists. The final adjudication of compliance, severity evaluation, and override justifications must be performed by a human reviewer.

---

## 7. Rollback & Maintenance
In the event of verification failures during branch validation, the branch history must not be rewritten. Corrective commits must be applied, or the branch abandoned.
