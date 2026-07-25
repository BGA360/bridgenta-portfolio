# AEOcortex BECC Pilot 2 — Findings Register

This register logs all baseline defects and compliance issues identified during the kickoff phase of the AEOcortex project-page audit.

---

## 1. Initial Findings Log

| Finding ID | Area | Defect Description | Root Cause | Severity | Governing Rule | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **AEO-FIND-001** | Heading Structure | 12 H2 headings are written in English (e.g. `Executive Summary`, `Context`). | Wording not aligned to German-only heading standard. | **High** | `BECC-PUBLIC-PAGE-REFERENCE-STANDARD-v1.0.md` Section 1 | **Closed** |
| **AEO-FIND-002** | Terminology / Style | Uses bilingual double-namings like `(Answer Engine Optimization — AEO...)`. | Nominal and redundant wording styles. | **Medium** | `BECC-PUBLIC-TERMINOLOGY-POLICY.md` Section 3 | **Closed** |
| **AEO-FIND-003** | Claims & Evidence | `100% automatisierte Erkennung` is stated as an absolute warranty. | Claim lacks environmental bounding. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-004** | Claims & Evidence | `Entity-Score: 95%` is stated without context. | Metric lacks test-run qualification. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-005** | Terminology / Claims | Use of prohibited guarantee verb `garantieren` on line 214. | Violates prohibited guarantees policy. | **High** | `BECC-PUBLIC-TERMINOLOGY-POLICY.md` Section 3 | **Closed** |
| **AEO-FIND-006** | Claims & Evidence | `Detaillierte Analyse der Auslesbarkeit für alle großen LLM-Parser` is over-scoped. | Tool cannot simulate proprietary crawl logics. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-007** | Claims & Bounding | Deterministic path claim for external AI engines. | Implies external search follows static deterministic paths. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-008** | Readability | Readability classified as AEO-Auslesbarkeit without Flesch limitations. | Flesch index lacks qualification on machine indexing. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-009** | Claims & Bounding | Hardcoded `100 HTTP-Anfragen` limit lacks context. | Numerical claim requires internal spec bounding. | **Medium** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-010** | Architecture / Stack | Astro listed in project stack of AEOcortex and BridGenta. | Astro is publication infrastructure, not project stack. | **High** | `BECC-PUBLIC-PAGE-REFERENCE-STANDARD-v1.0.md` Section 2 | **Closed** |
| **AEO-FIND-011** | Terminology / Bounding | Broad references to "known specifications" on lines 39 and 57 of the public page. | Wording requires narrow bounding to documented criteria and public crawler rules. | **Medium** | `BECC-PUBLIC-TERMINOLOGY-POLICY.md` Section 3 | **Closed** |

---

## 2. Severity Classifications

* **Critical:** Blocks build, contains security credentials, or introduces data leaks.
* **High:** Violates structural heading policies, lists absolute claims, or contains major visual breakages.
* **Medium:** Minor terminology misalignment or excessive nominal phrasing.
* **Low:** Typos and simple formatting adjustments.
