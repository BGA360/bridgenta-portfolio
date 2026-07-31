# BECC Governance Finding — GOV-FIND-001

*   **Finding ID**: `GOV-FIND-001 — OPEN — PENDING GOVERNANCE ADJUDICATION`
*   **Audit Phase**: Work Package A Framework Audit
*   **Record Date**: 2026-07-31

---

## 1. Candidate Concern
`Candidate concern: current route inclusion may conflict with applicable portfolio-readiness and lifecycle controls.`

---

## 2. Source Evidence
* **File Path**: [project-[slug].astro](../../../src/pages/project-[slug].astro#L10-L11)
* **Code Reference**:
  ```javascript
  const activeProjectSlugs = ['bridgenta', 'aeocortex', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners'];
  ```
  The array hardcodes slugs for candidate projects that have not completed the release clearance gates, automatically registering them in the site sitemap and build generation processes.

---

## 3. Governing Rules
* **Rule 1**: [portfolio-readiness-rule.md](../../portfolio-readiness-rule.md) (Section 3: Umgang mit inaktiven Projekten)
* **Rule 2**: `SPEC-CPL-001` (Section 2: Constitutional Project Lifecycle)
  * Both rules dictate that candidate projects must not generate public routes or be indexed on the production host until a signed clearance is logged.

---

## 4. Assessment Metadata
* **Affected Projects**: `luminapraxisds`, `rootedrealitygarden`, `starcleaners`
* **Candidate Severity**: `Medium–High, pending adjudication`
* **Proposed Authority**: BPGA (Publication Governance Authority), subject to verification.
* **Remediation Reference**: Deferred to `Work Package C — Publication Routing and Lifecycle Enforcement`.
* **Work Package A Restriction**: No project or route modifications are executed under Work Package A.
