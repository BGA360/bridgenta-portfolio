# BECC Public Page Reference Standard v1.1
## Guidelines for Governed Public Engineering Communication

*   **Status**: `PROPOSED — PENDING REVIEW`
*   **Version**: `1.1-Candidate`
*   **Release Gate**: Framework-Only Amendment Candidate
*   **Effective Date**: Pending Authorization

This standard defines the rules, validation layers, and claim-integrity constraints for publishing, auditing, and certifying public-facing project pages and portfolios under the BECC (BridGenta Engineering Communication Constitution) framework.

---

## 1. Core Validation Layers

To ensure complete verification, technical communication must satisfy three validation layers:

### 1.1 Lexical Validation
Automated matching of vocabulary, spelling compound standards, proper nouns, and prohibited absolute claims. The lexical scanner detects candidate patterns and logs them as lexical findings.

### 1.2 Semantic Validation
Human fresh-reader review of the layout context, reading complexity, and semantic clarity. It addresses nuances that automated lexical tools cannot detect.

### 1.3 Evidence Validation
Mapping of all quantitative and performance claims to version-controlled evidence repositories or test logs. Every published metric must refer to a specific, bounded verification run.

---

## 2. Claim Bounding & Terminology

### 2.1 Bounded Claims
All quantitative, performance, or outcome-based statements must be explicitly:
1. Mapped to documented test run logs.
2. Bounded to the specific environment in which they were observed (e.g. `im Pilotlauf`, `im Pilotbetrieb`, `in der Testumgebung`).
3. Registered in a centralized evidence map.

### 2.2 Prohibited Guarantees & Absolute Claims
Do not publish absolute claims, warranties, or complete absence-of-event claims (e.g., `garantieren`, `Gewährleistung`, `fehlerfrei`, `ohne Ausfälle`, `lückenloser Schutz`) unless they are bounded to pilot contexts.

### 2.3 Contextual Treatment of High-Risk Terminology
Words like `alle` (all) or `vollständig` (completely/full) are flagged as review candidates. They are permitted only when representing bounded code structures or specific verified scopes (e.g. `alle 5 Fallstudien`), and prohibited when making absolute commercial guarantees.

---

## 3. Readability & Language Governance

### 3.1 German B2–C1 Readability Target
Technical prose must maintain a professional CEFR B2–C1 register. Authors must use active verbs, clear sentence structures, and eliminate marketing hyperboles. Structured automated readability scores (e.g. Flesch metrics) serve as advisory targets; human editorial approval remains authoritative.

### 3.2 Proper Noun and Jargon Registers
- **Capitalized German Compounds**: Proper compounds must follow standard capitalization and naming rules (e.g. `die Branches`, `der Static-Site-Builder`).
- **Canonical English Terms**: Standard industry technical jargon or system layers (e.g., `main branch`, `Repository`, `Workspace`, `CI/CD`) must remain in English in technical prose.
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
Every project page must pass through the validation gates prior to publication:
1. **Source Check**: Lexical validation check.
2. **Semantic Check**: Manual fresh-reader review.
3. **Evidence Verification**: Mapping claims to evidence records.

### 5.2 Human Adjudication
Lexical scans are advisory match lists. The final adjudication of compliance, severity evaluation, and override justifications must be performed by a human reviewer.

---

## 6. Rollback & Maintenance
In the event of verification failures during branch validation, the branch history must not be rewritten. Corrective commits must be applied, or the branch abandoned.
