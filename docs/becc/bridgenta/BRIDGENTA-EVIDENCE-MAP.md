# BridGenta Project Evidence Map
## BECC Reference Maturity Programme — Sprint 4

This document maps all quantitative performance, security, and quality claims on the BridGenta public project page to their respective test environments, data definitions, measurement methodologies, and version-controlled evidence logs.

---

## 1. Governance Principles for Evidence

- **Pilot-only Scoping:** All metrics are derived from the controlled pilot migration run. They must not be presented as universal guarantees for all future migrations.
- **Traceability:** Every published metric must refer to an internal project test record.
- **Fail-Closed Security:** Safety claims are verified under a defined threat model and closed sandbox network environment.

---

## 2. Claim-to-Evidence Registry

### 1. Modernisierungs-Beschleunigung (45% Zeitersparnis)
* **Claimed Metric:** "45% Zeitersparnis" (compared to historical manual baseline)
* **Definition:** Reduction in developer hours required to complete reconstruction phases (Observe, Understand, Map, Reconstruct, Validate, Handoff) for pilot components.
* **Test Environment:** Closed developer workspace running static analysis and AI code-generation pipelines.
* **Sample Size:** 10 legacy web application modules (totaling approx. 50,000 lines of legacy code).
* **Measurement Method:** Time-tracking logs compared to the average historical migration baseline (120 developer hours per module manual vs. 66 hours average with BridGenta).
* **Evidence Trace Link:** `CPL-PILOT-LOG-TIME.json#L45`
* **Test Record ID:** `TR-TIME-012`

### 2. Handoff-Stabilität (100% konfliktfreie Integration)
* **Claimed Metric:** "100% der Code-Übergaben im Pilotlauf wurden über isolierte Branches konfliktfrei integriert."
* **Definition:** Zero manual merge conflicts requiring developer intervention when merging pilot Handoff branches into the staging branch.
* **Test Environment:** Staging environment CI/CD pipelines (GitHub Actions runners).
* **Sample Size:** 10/10 successfully merged pilot Handoff branches.
* **Measurement Method:** Automated git merge exit status checking (zero conflict exits).
* **Evidence Trace Link:** `CPL-PILOT-LOG-MERGE.json#L12`
* **Test Record ID:** `TR-CONF-045`

### 3. Sicherheits-Compliance (0 Leaks sensibler Daten / kein Datenabfluss)
* **Claimed Metric:** "0 Leaks sensibler Daten" / "verhinderte jeglichen Abfluss sensibler Daten im Pilotlauf."
* **Definition:** Outbound data sanitization audits verifying that zero secrets, PII, or database credentials were sent to LLM endpoints.
* **Test Environment:** Closed network sandbox with outbound proxy scanning.
* **Sample Size:** All API requests generated during the 10-module reconstruction run.
* **Measurement Method:** Regex matching and entropy analysis of outbound proxy logs against project secret pattern lists.
* **Evidence Trace Link:** `CPL-PILOT-LOG-SECURITY.json#L89`
* **Test Record ID:** `TR-SECU-089`

### 4. Codequalität (Quality Gate A bestanden)
* **Claimed Metric:** "Quality Gate A (bestanden)"
* **Definition:** Conformance to SonarQube Quality Gate A requirements on the generated code.
* **Test Environment:** SonarQube Scanner run on the main branch CI workflow.
* **Sample Size:** 100% of newly reconstructed codebase files.
* **Measurement Method:** Code coverage analysis (>80%), duplications (<3%), and zero open blocker/critical vulnerabilities.
* **Evidence Trace Link:** `CPL-PILOT-LOG-QUALITY.json#L3`
* **Test Record ID:** `TR-QUAL-003`
