# AEOcortex BECC Pilot 2 — Baseline and Assessment Plan

This document establishes the kickoff parameters, baseline state, and evidence-sensitive claim inventory for the AEOcortex public project page audit.

---

## 1. Authoritative State and Lifecycle Eligibility

* **Authoritative Source File:** `src/content/projects/aeocortex.md`
* **Expected Production URL:** `https://bridgenta.de/project-aeocortex/`
* **Eligibility Decision:** **`ELIGIBLE`** (Meets the 50% maturity threshold; represents an active portfolio project under the Portfolio Readiness Rule).

---

## 2. Baselines Establishment

### Communication Baseline (Spelling, Grammar, Readability)
* **German-only Heading Violations:** The page contains 12 English structural headings that violate the BECC German-only heading policy:
  - `Executive Summary`
  - `Context`
  - `Problem`
  - `Constraints`
  - `Engineering Thinking`
  - `Architecture`
  - `Engineering Decisions`
  - `Implementation`
  - `Public Artifacts`
  - `Results`
  - `Lessons Learned`
  - `Risks`
  - `Future Evolution`
  - `References`
* **Qualitative Register:** Uses double-naming parentheticals `(Answer Engine Optimization — AEO und Generative Engine Optimization — GEO)`.

### Technical Baseline (Architecture & Integrity)
* **Crawler Technology:** Cheerio HTML parsing in a Node.js runtime.
* **Metrics:** Flesch Reading Ease calculations.
* **Integrity Gate:** Must protect the Cheerio parser boundaries and entity heuristics from dilution.
* **Portfolio Publication Layer:** Astro is utilized solely on the `bridgenta.de` site to render and publish the static HTML report generated from the AEOcortex parser output.

---

## 3. Evidence-Sensitive Claims Inventory

The kickoff audit has identified the following quantitative claims that require bounding and validation:

| Claim ID | Source Section | Raw Claim Wording | Required Mitigation / Bounding | Evidence Reference |
| :--- | :--- | :--- | :--- | :--- |
| **AEO-CLM-001** | `Public Artifacts` | `Entity-Score: 95%` | Qualify to testing run context (e.g. `im Testdurchlauf`). | Verification log |
| **AEO-CLM-002** | `Public Artifacts` | `100% automatisierte Erkennung` | Limit to the test suite parameters. Avoid absolute guarantee. | Verification log |
| **AEO-CLM-003** | `Validation` | `maximal 100 HTTP-Anfragen` | State testing constraints clearly. | Test config |

---

## 4. Assessment Path Selection

* **Selected Path:** **Tier 1 (9 Sprints)**
* **Reasoning:** AEOcortex processes complex AI Search crawlers, rates API restrictions, and parses schema JSON-LD graphs. This high functional complexity warrants a complete 9-sprint program to ensure both vocabulary and evidence registers remain fully traceable and verified.
