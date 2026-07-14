# BECC v2.0 — Release Notes

These release notes detail the architectural, operational, and governance enhancements introduced in version 2.0 of the BridGenta Engineering Communication Constitution (BECC) framework.

This release establishes the stable production baseline of the framework for portfolio-wide adoption.

---

## 1. Major Capabilities & Enhancements

BECC v2.0 shifts the framework from a static style auditor into an **evidence-driven operational governance system**.

### 1.1. Decoupled Check Architecture
The core check logic is completely decoupled from the execution runtimes. This allows checking rules (the 15 chapters defined in the matrix) to evolve independently of the repository parsers and validation tools.

### 1.2. Canonical Data Modeling
Defined standard JSON schemas and markdown templates for all audit stages. This ensures that findings registers, baseline records, and engineering decisions maintain a consistent, machine-readable syntax across all projects.

### 1.3. Structured Evolution backlog
Introduced the **Portfolio Improvement Candidate Register**, providing a controlled, evidence-based backlog to record documentation observations. Gaps observed in audits are backlogged and validated across multiple projects before standard revisions are authorized, preventing ad-hoc changes.

---

## 2. Key Differences from BECC v1.0

| Feature | BECC v1.0 (Legacy) | BECC v2.0 (GA Release) |
| :--- | :--- | :--- |
| **Audit Focus** | Manual style checklist | Automated, binary criteria matching |
| **Process Control** | Unstructured review comments | Strict 9-stage operational lifecycle |
| **Change Control** | Ad-hoc edits to target files | EDR-based Controlled Remediation |
| **Traceability** | None | Closed trace chain locked to Commit SHAs |
| **Evolution Model** | Direct guidelines edits | PICRB review and backlogged register |
| **Template Handling** | Flat compliance expectations | Template Generation Classification |

---

## 3. Adoption Guide for Engineers

### 3.1. Standard Reference Mappings
When referencing BECC compliance folders in case studies, avoid relative directory traversals which break during compilation. Always use absolute repository URLs (e.g. `https://github.com/BGA360/...`) to reference internal governance folders.

### 3.2. Controlled Remediation Positions
To prevent fragile specifications that break when content is added, all Controlled Remediation Specifications (CRS) must reference **semantic section anchors** (headings) rather than line numbers.
