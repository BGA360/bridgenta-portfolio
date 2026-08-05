# BECC Governance Finding — GOV-FIND-001

> [!IMPORTANT]
> **Global Governance Boundary Statement**
> ```text
> Observed code fact
> ≠ governance conclusion
> ≠ publication decision
> ≠ route-removal authorization
> ```

*   **Finding ID**: `GOV-FIND-001 — OPEN — PENDING GOVERNANCE ADJUDICATION`
*   **Audit Phase**: Work Package A Framework Audit
*   **Record Date**: 2026-07-31

---

## 1. Candidate Concern

### Observed Code Fact
The route-generation array contains explicitly listed project slugs.

### Unresolved Governance Question
Whether each listed project currently satisfies its applicable publication, lifecycle, and clearance requirements.

### Not Established by This Finding
This record does not establish that any listed project is constitutionally ineligible for public routing.

---

## 2. Source Evidence
* **File Path**: [project-[slug].astro](../../../src/pages/project-[slug].astro#L10-L11)
* **Code Reference**:
  ```javascript
  const activeProjectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];
  ```
  The array hardcodes slugs for candidate projects that are evaluated under the portfolio-readiness and lifecycle review framework.

---

## 3. Governing Rules
* **Rule 1**: [portfolio-readiness-rule.md](../../portfolio-readiness-rule.md) (Section 3: Umgang mit inaktiven Projekten)
* **Rule 2**: `SPEC-CPL-001` (Section 2: Constitutional Project Lifecycle)
  * Both rules specify the verification requirements for candidate projects prior to active publication and indexing.
  * The reconciliation requirement covers:
    - project frontmatter;
    - portfolio-readiness-rule.md;
    - SPEC-CPL-001;
    - authoritative lifecycle register;
    - signed publication-clearance records.

---

## 4. Assessment Metadata
* **Projects Requiring Lifecycle-Status Reconciliation**: `luminapraxisds`, `rootedrealitygarden`, `starcleaners`
* **Candidate Severity**: `UNASSESSED — PENDING GOVERNANCE ADJUDICATION`
* **Proposed Authority**: BPGA (Publication Governance Authority), subject to verification.
* **Remediation Reference**: Deferred to `Work Package C — Publication Routing and Lifecycle Enforcement`.
* **Work Package A Restriction**: No project or route modifications are executed under Work Package A.

**Instructional and Authority Limitations**:
* This finding is informational and non-executing.
* No route may be added, removed, suppressed, or de-indexed solely on the basis of GOV-FIND-001.
