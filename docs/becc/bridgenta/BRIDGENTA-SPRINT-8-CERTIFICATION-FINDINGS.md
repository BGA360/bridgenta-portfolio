# BridGenta BECC Reference Programme — Sprint 8 Certification Findings

This report details the findings, minor defects, and residual risks identified during the Sprint 8 independent certification audit of the published BridGenta project page.

---

## 1. Findings Register

During the independent verification of the live page against the approved source file, the following issues were logged:

* **Finding ID:** `BG-FIND-001`
  - **Area:** Cache & Propagation (Freshness)
  - **Defect:** Initial page loads served a stale pre-remediation copy of the project page.
  - **Root Cause:** A cache-first navigation strategy in `public/service-worker.js` intercepted browser requests and served assets from the `bridgenta-portfolio-v20` cache storage version without checking the network.
  - **Severity:** Medium (operational propagation delay).
  - **Resolution:** Bumped `CACHE_NAME` version to `bridgenta-portfolio-v21` (PR #184) and successfully squash-merged/deployed to production. Client caches now correctly invalidate on reload.
  - **Status:** Resolved.

* **Finding ID:** `BG-FIND-002`
  - **Area:** Terminology Policy Compliance
  - **Defect:** Prohibited term `Sicherung der Datensicherheit:` was found on line 195.
  - **Root Cause:** Wording was not aligned to design-specific rules.
  - **Severity:** Low (policy misalignment).
  - **Resolution:** Replaced with approved, design-specific term `Datensicherheit durch UI-Isolation:` in both page source and maturity change register (entry `BRM-061`).
  - **Status:** Resolved.

* **Finding ID:** `BG-FIND-013`
  - **Area:** Claim Integrity (Absolute capability claims)
  - **Defect:** Absolute verbs promising AI accuracy and defect prevention (L127, L216, L226, L239, L241, L320, L323).
  - **Severity:** High
  - **Resolution:** Replaced absolute guarantees with qualified/probabilistic wording (e.g. "soll das Risiko minimiert werden", "zielt darauf ab", "dienen der Überprüfung").
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-014`
  - **Area:** Terminology Parentheticals
  - **Defect:** Parenthetical translations of canonical English architectural terms on lines 150-154, 194, 308, 310.
  - **Severity:** Medium
  - **Resolution:** Removed parentheticals `Sichtbarkeitsebene`, `Verhaltensebene`, `Gestaltungsebene`, `UI`, `Code-Patterns`, and the second duplicate `Architecture Gate`.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-015`
  - **Area:** Style & Layout (Ampersand title)
  - **Defect:** Use of `&amp;` inside a heading (L65) violating style guide.
  - **Severity:** Low
  - **Resolution:** Replaced ampersand with `und` to yield `Datensicherheit und Geheimnisschutz`.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-016`
  - **Area:** Evidence Bounding (Quantitative results)
  - **Defect:** Metrics table lacked a clear pilot-scope boundary footnote.
  - **Severity:** Medium
  - **Resolution:** Appended the complete, approved metrics footnote beneath the results table.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-017`
  - **Area:** Risks Formatting & Traceability
  - **Defect:** Risks were listed as bullets and lacked internal mapping to private BECC risk registers.
  - **Severity:** Medium
  - **Resolution:** Converted the risks to a clean public table and added private mappings to `RISK-BG-001` through `003` inside the evidence map.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-018`
  - **Area:** Visual Traceability (Asset mismatch)
  - **Defect:** Active images on the page did not match the Sprint 8 evidence record.
  - **Severity:** Critical
  - **Resolution:** Calculated actual file SHA-256 hashes and dimensions, reconciled assets (`BG-PA01` through `04`), and updated the published page evidence record.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-019`
  - **Area:** Accessibility Assurance
  - **Defect:** Lack of keyboard, contrast, and reflow verification logs.
  - **Severity:** Low
  - **Resolution:** Created a dedicated accessibility evidence report documenting local testing results across four layers.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-020`
  - **Area:** Notice and Lifecycle
  - **Defect:** Notice on line 22 was misaligned with the active portfolio screenshots.
  - **Severity:** High
  - **Resolution:** Revised notice to specify Private Beta phase and acknowledge authorized public demonstrations.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

* **Finding ID:** `BG-FIND-021`
  - **Area:** Domain Boundary Paths
  - **Defect:** Raw filesystem paths exposed in public prose, implying inspectability.
  - **Severity:** High
  - **Resolution:** Replaced raw paths with generic descriptions (Workspace-Kernmodule, etc.) and reframed them to identify them as references to the private `BridGenta-Core-Codebasis`.
  - **Status:** REMEDIATED — PENDING INDEPENDENT VERIFICATION

---


## 2. Residual Risks and Scope Limitations

* **Client Cache Propagation:** Although the cache name was bumped to `v21`, browser clients that visited the site under `v20` and do not have an active network connection will still load the stale version until their service worker successfully installs the new script and activates in the background. This is a standard constraint of the Service Worker lifecycle.
* **Evidence Scope:** All quantitative metrics (e.g. 45% time savings, 100% conflict-free) are strictly limited to the pilot environment parameters and do not constitute absolute future guarantees for other systems.

---

## 3. Reference Suitability Decision
The live page is found to be highly suitable to serve as a certified BECC-governed public engineering communication standard. All initial defects are corrected, and the entire audit trail is fully documented.
