# Decision Record Standard — Mandatory Constitutional Decision Record (CDR) Template

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Constitutional Decision Architecture |
| **Project Status** | Constitution Engineering |
| **Lifecycle Stage** | Stage A — Constitution Engineering (**CONCLUDED**) |
| **Sprint Reference** | Sprint A3 |
| **Next Authorized Sprint** | Stage B — Platform Engineering / Sprint B1 — CEP Domain Model |
| **Specification Mandate** | Mandatory CDR Structure & Schema Template |

---

## 1. Overview & CDR Purpose

The **Constitutional Decision Record (CDR)** is the mandatory architectural document format for capturing all binding decisions, framework amendments, authority transfers, and generalization reviews within the **Constitutional Engineering Platform (CEP)** ecosystem.

Following the principle **Mechanisms Before Labels**, no verbal agreement, pull request comment, or unformatted text document constitutes an authoritative constitutional decision. All decisions must be authored and persisted as a structured CDR following the template defined herein.

---

## 2. Mandatory CDR Template

Every future constitutional decision artifact must adhere to the following markdown template structure:

```markdown
# CDR-[ID]: [Short Descriptive Title]

---

| Metadata Attribute | Specification Value |
| :--- | :--- |
| **Decision ID** | CDR-[YEAR]-[SEQUENCE] (e.g., CDR-2026-001) |
| **Status** | DRAFT | PROPOSED | APPROVED | REJECTED | SUSPENDED | SUPERSEDED |
| **Amendment Class** | Class I (Operational) \| Class II (Framework Scope) \| Class III (Meta-Constitutional) |
| **Primary Owner** | [Owner Role / Domain Name] |
| **Author(s)** | [Author Name(s) & Sign-Off Keys] |
| **Creation Date** | YYYY-MM-DD |
| **Review Date** | YYYY-MM-DD |
| **Version** | vX.Y.Z |
| **Target Governance Level** | Level 0 through Level 5 |
| **Superseded By** | [CDR-ID or N/A] |

---

## 1. Problem Statement
State the explicit engineering problem, architectural gap, or governance issue that necessitates this decision.

## 2. Context & Background
Provide necessary background, architectural references, and historical factors influencing the decision.

## 3. Considered Alternatives
List all alternative options considered during the proposal stage, detailing pros and cons for each:
- **Alternative 1**: [Description]
  - *Pros*: ...
  - *Cons*: ...
- **Alternative 2**: [Description]
  - *Pros*: ...
  - *Cons*: ...

## 4. Evidence Package
Specify all supporting evidence artifacts, test logs, benchmark data, and content hashes:
- **Evidence Item 1**: [Description / Path / Cryptographic Hash]
- **Evidence Item 2**: [Test Suite Output Reference]

## 5. Constitutional Assessment
Document the evaluation against active CEF meta-rules, precedent checks, and impact assessments:
- **Rule Precedence Check**: PASS / FAIL
- **Impact Assessment**: Class I / Class II / Class III Summary
- **Authority Boundary Check**: Single Ownership Confirmed

## 6. Formal Decision
State the binding choice made by the Primary Owner, providing explicit justification based on the evidence package.

## 7. Architectural Consequences
Detail positive, negative, and neutral impacts resulting from this decision:
- **Positive Consequences**: ...
- **Negative / Trade-off Consequences**: ...
- **Follow-up Action Items**: ...

## 8. Review Date & Maintenance Schedule
State the mandatory review interval (e.g., Annual, Biennial) and scheduled re-evaluation date.

## 9. Version & Historical Status
Maintain a revision log tracking state transitions and version increments:
- **v1.0.0 (YYYY-MM-DD)**: Approved and logged to audit ledger (Hash: `0x...`).
```

---

## 3. CDR Field Definitions & Authoring Constraints

| Section / Field | Required Content & Constraint | Invalid Condition |
| :--- | :--- | :--- |
| **Decision ID** | Unique sequential ID (`CDR-YYYY-XXX`). | Reused or non-sequential ID. |
| **1. Problem Statement** | Objective description of problem. | Subjective opinion or vague desire. |
| **2. Context** | Relevant background and specs. | Omitting historical decision links. |
| **3. Alternatives** | Minimum 2 viable alternatives evaluated. | Single choice with no alternatives. |
| **4. Evidence Package** | Machine-verifiable artifacts & hashes. | Assertions without evidence items. |
| **5. Assessment** | Rule precedence & impact evaluation. | Missing authority boundary check. |
| **6. Decision** | Clear, unambiguous choice statement. | Ambiguous or conditional decision. |
| **7. Consequences** | Honest trade-off & impact breakdown. | Claiming "zero trade-offs/negatives". |
| **8. Review Date** | Explicit future review date. | Missing review schedule. |
| **9. Version** | Version tag + Ledger hash. | Unversioned or unhashed record. |

---

## 4. Storage & Registration Protocol

1. **Draft Records**: Saved in `docs/decisions/records/drafts/CDR-[ID].md`.
2. **Active Approved Records**: Saved in `docs/decisions/records/active/CDR-[ID].md`.
3. **Superseded Records**: Saved in `docs/decisions/records/archive/CDR-[ID].md` with `Status: SUPERSEDED`.
4. **Audit Ledgering**: Upon approval, the SHA-256 hash of the final CDR file is appended to `docs/decisions/audit-ledger.json`.
