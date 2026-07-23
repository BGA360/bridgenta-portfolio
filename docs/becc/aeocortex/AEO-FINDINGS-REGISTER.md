# AEOcortex BECC Pilot 2 — Findings Register

This register logs all baseline defects and compliance issues identified during the kickoff phase of the AEOcortex project-page audit.

---

## 1. Initial Findings Log

| Finding ID | Area | Defect Description | Root Cause | Severity | Governing Rule | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **AEO-FIND-001** | Heading Structure | 12 H2 headings are written in English (e.g. `Executive Summary`, `Context`). | Wording not aligned to German-only heading standard. | **High** | `BECC-PUBLIC-PAGE-REFERENCE-STANDARD-v1.0.md` Section 1 | **Closed** |
| **AEO-FIND-002** | Terminology / Style | Uses bilingual double-namings like `(Answer Engine Optimization — AEO...)`. | Nominal and redundant wording styles. | **Medium** | `BECC-PUBLIC-TERMINOLOGY-POLICY.md` Section 3 | **Closed** |
| **AEO-FIND-003** | Claims & Evidence | `100% automatisierte Erkennung` is stated as an absolute warranty. | Claim lacks environmental bounding. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Closed** |
| **AEO-FIND-004** | Claims & Evidence | `Entity-Score: 95%` is stated without context. | Metric lacks test-run qualification. | **High** | `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md` Section 2 | **Open** |
| **AEO-FIND-005** | Terminology / Claims | Use of prohibited guarantee verb `garantieren` on line 214. | Violates prohibited guarantees policy. | **High** | `BECC-PUBLIC-TERMINOLOGY-POLICY.md` Section 3 | **Closed** |

---

## 2. Severity Classifications

* **Critical:** Blocks build, contains security credentials, or introduces data leaks.
* **High:** Violates structural heading policies, lists absolute claims, or contains major visual breakages.
* **Medium:** Minor terminology misalignment or excessive nominal phrasing.
* **Low:** Typos and simple formatting adjustments.
