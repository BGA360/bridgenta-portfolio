# BECC v2.3 Lumina Praxis Improvement Implementation Plan

**BECC — BridGenta Engineering Communication Constitution**

Framework Version: BECC v2.3  
Operational Phase: Certification Execution  
Pipeline Sprint: OP-003  
Project: Lumina Praxis (`lumina-praxis`)  
Previous Sprint: OP-002 — Communication Assessment (Completed)  

---

## 1. Executive Summary

This document establishes the official **Improvement Implementation Plan** for the **Lumina Praxis** project under Sprint OP-003 of the BECC v2.3 Certification Program.

In the preceding sprint (**OP-002 — Communication Assessment**), Lumina Praxis underwent an independent evaluation against the BECC Assessment Matrix. While the project demonstrated high text quality, clear architectural explainability, and excellent UI/UX visual mockups, the assessment concluded with a recommendation of **IMPROVEMENT REQUIRED** due to the omission of three mandatory structural chapters and commit-level traceability.

The objective of this planning sprint is to define a structured, risk-managed implementation plan that converts all four approved assessment findings (`FIND-LP-001` through `FIND-LP-004`) into discrete, verifiable Work Packages (`WP-LP-001` through `WP-LP-004`).

This document governs the *planning* of documentation remediations. It does not contain final documentation text or modify the Lumina Praxis codebase. Execution of these work packages will occur during the engineering phase, followed by formal verification in **Sprint OP-004**.

---

## 2. Improvement Inventory

All four findings identified during the OP-002 independent assessment are cataloged into the official Improvement Inventory:

| Identifier | Category | Severity | Target Matrix Requirement | Implementation Status |
| :---: | :--- | :---: | :--- | :---: |
| **FIND-LP-001** | Structural Completeness | **Major** | MAT-009 (Validation) | Planned (`WP-LP-001`) |
| **FIND-LP-002** | Structural Completeness | **Major** | MAT-012 (Risks & Mitigations) | Planned (`WP-LP-002`) |
| **FIND-LP-003** | Structural Completeness | **Minor** | MAT-014 (References) | Planned (`WP-LP-003`) |
| **FIND-LP-004** | Traceability | **Observation** | Operational Workspace Spec | Planned (`WP-LP-004`) |

---

## 3. Implementation Work Packages

Four Work Packages are defined to remediate all inventory items:

### 3.1. Work Package WP-LP-001: Validation Section Implementation

*   **Identifier**: `WP-LP-001`
*   **Objective**: Incorporate a dedicated `## Validation` section in the Lumina Praxis case study to document automated testing, accessibility audits, and Lighthouse performance metrics.
*   **Constitutional Requirement**: BECC Assessment Matrix requirement **MAT-009 (Validation)**.
*   **Current State**: The primary case study (`src/content/projects/luminapraxisds.md`) lacks a `## Validation` section, leaving Lighthouse accessibility scores (100/100) and WCAG 2.1 AA contrast scans unrecorded in structural markdown.
*   **Planned Change**: Author a new `## Validation` section in `src/content/projects/luminapraxisds.md` containing:
    1. Automated testing breakdown (component rendering and client JS unit tests).
    2. Accessibility audit metrics (Lighthouse 100/100 score, contrast ratio $>4.5:1$, keyboard focus flow).
    3. Browser compatibility matrix (Chrome, Firefox, Safari, Edge mobile/desktop).
*   **Expected Outcome**: Complete compliance with MAT-009, providing explicit structural evidence of validation activities.
*   **Verification Criteria**: Observable presence of `## Validation` heading in `luminapraxisds.md` containing quantitative test and audit logs, verified during OP-004.

### 3.2. Work Package WP-LP-002: Risks & Mitigations Section Implementation

*   **Identifier**: `WP-LP-002`
*   **Objective**: Add a formal `## Risks & Mitigations` section in the Lumina Praxis case study to evaluate technical, operational, and privacy risks.
*   **Constitutional Requirement**: BECC Assessment Matrix requirement **MAT-012 (Risks & Mitigations)**.
*   **Current State**: `src/content/projects/luminapraxisds.md` currently lacks a `## Risks` or `## Risks & Mitigations` section, missing risk assessment for client-side JavaScript execution failure or local SEO structured data drift.
*   **Planned Change**: Author a new `## Risks & Mitigations` section in `src/content/projects/luminapraxisds.md` formatted as a structured risk table covering:
    1. *Risk 1*: Client-side JavaScript disabled in user browser $\rightarrow$ *Mitigation*: Progressive enhancement fallback displaying basic dental health guidance.
    2. *Risk 2*: Local SEO Schema drift (`Dentist` / `MedicalBusiness` JSON-LD) $\rightarrow$ *Mitigation*: Automated schema validation during Astro build.
    3. *Risk 3*: Sensitive health data leakage $\rightarrow$ *Mitigation*: Architectural constraint enforcing zero network data transmission.
*   **Expected Outcome**: Complete compliance with MAT-012, demonstrating proactive engineering risk management.
*   **Verification Criteria**: Observable presence of `## Risks & Mitigations` heading in `luminapraxisds.md` with structured risk/mitigation entries, verified during OP-004.

### 3.3. Work Package WP-LP-003: References Section Implementation

*   **Identifier**: `WP-LP-003`
*   **Objective**: Add a formal `## References` section in the Lumina Praxis case study to cite governing web, accessibility, and privacy standards.
*   **Constitutional Requirement**: BECC Assessment Matrix requirement **MAT-014 (References)**.
*   **Current State**: `src/content/projects/luminapraxisds.md` cites standards (WCAG, DSGVO, W3C ARIA) informally within text body without a dedicated `## References` section.
*   **Planned Change**: Author a new `## References` section at the end of `src/content/projects/luminapraxisds.md` providing formal citations:
    1. W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA Specification.
    2. EU General Data Protection Regulation (GDPR / DSGVO) Article 9 (Processing of special categories of personal data).
    3. Schema.org `MedicalBusiness` & `Dentist` Type Specifications.
*   **Expected Outcome**: Complete compliance with MAT-014, establishing explicit standards grounding.
*   **Verification Criteria**: Observable presence of `## References` heading in `luminapraxisds.md` with numbered external/standard citations, verified during OP-004.

### 3.4. Work Package WP-LP-004: Commit SHA & Repository Baseline Traceability Implementation

*   **Identifier**: `WP-LP-004`
*   **Objective**: Formalize repository commit-level traceability in Lumina Praxis metadata.
*   **Constitutional Requirement**: BECC Operational Workspace Specification & Evidence Traceability Policy.
*   **Current State**: Sidebar frontmatter in `src/content/projects/luminapraxisds.md` records role, timeline, and tech stack, but lacks explicit `evaluatedCommitSha` or evaluation repository version tag.
*   **Planned Change**: Update frontmatter metadata in `src/content/projects/luminapraxisds.md` to include explicit `evaluatedCommitSha` and baseline release tag fields.
*   **Expected Outcome**: 100% end-to-end evidence traceability matching BECC Certified Project Registry standards.
*   **Verification Criteria**: Frontmatter in `luminapraxisds.md` contains valid Git commit SHA and version baseline tag, verified during OP-004.

---

## 4. Implementation Order

Work packages are prioritized according to constitutional impact, resolving critical matrix gaps first:

1.  **WP-LP-001 (Validation Section — Major Severity)**: Priority 1. Resolves MAT-009 compliance failure; establishes core empirical proof of quality.
2.  **WP-LP-002 (Risks & Mitigations Section — Major Severity)**: Priority 2. Resolves MAT-012 compliance failure; establishes operational safety and privacy risk management.
3.  **WP-LP-003 (References Section — Minor Severity)**: Priority 3. Resolves MAT-014 compliance gap; completes structural markdown requirements.
4.  **WP-LP-004 (Traceability Metadata — Observation)**: Priority 4. Enhances governance metadata to align with machine-readable registry standards.

---

## 5. Risk Assessment

Potential risks during work package execution are identified alongside proactive mitigations:

| Work Package | Implementation Risk | Documentation Risk | Regression Risk | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **WP-LP-001** | Test log formatting inconsistencies. | Overly verbose test output cluttering case study readability. | Markdown heading level skip errors. | Use concise summary tables with metrics; enforce `##` H2 heading hierarchy. |
| **WP-LP-002** | Speculative or unrealistic risk scenarios. | Imbalanced risk presentation undermining project credibility. | None. | Focus strictly on client-side JS and privacy boundary risks. |
| **WP-LP-003** | Broken external URL links in references. | Non-standard citation syntax breaking link checker tool. | None. | Use clean markdown link formatting; validate via `npm run check-links`. |
| **WP-LP-004** | Invalid Git SHA syntax in YAML frontmatter. | Frontmatter parsing error in Astro content collection schema. | Build failure in `src/pages/project-[slug].astro`. | Verify frontmatter schema compatibility; run `npm run build` validation. |

---

## 6. Traceability Matrix

Every Work Package is mapped directly to its origin finding, constitutional matrix requirement, and verification milestone:

| Finding ID | Work Package | BECC Matrix Requirement | Target File | Verification Milestone |
| :---: | :---: | :--- | :--- | :--- |
| **FIND-LP-001** | `WP-LP-001` | MAT-009 (Validation) | `src/content/projects/luminapraxisds.md` | OP-004 Audit |
| **FIND-LP-002** | `WP-LP-002` | MAT-012 (Risks & Mitigations) | `src/content/projects/luminapraxisds.md` | OP-004 Audit |
| **FIND-LP-003** | `WP-LP-003` | MAT-014 (References) | `src/content/projects/luminapraxisds.md` | OP-004 Audit |
| **FIND-LP-004** | `WP-LP-004` | Workspace Spec (Traceability) | `src/content/projects/luminapraxisds.md` | OP-004 Audit |

---

## 7. Success Criteria

Implementation phase completion for Lumina Praxis will be evaluated against five quantitative success criteria during OP-004:

1.  **Validation Section Present**: `src/content/projects/luminapraxisds.md` contains an explicit `## Validation` section meeting MAT-009.
2.  **Risks & Mitigations Section Present**: `src/content/projects/luminapraxisds.md` contains an explicit `## Risks & Mitigations` section meeting MAT-012.
3.  **References Section Present**: `src/content/projects/luminapraxisds.md` contains an explicit `## References` section meeting MAT-014.
4.  **Traceability Metadata Added**: Frontmatter contains valid `evaluatedCommitSha` metadata.
5.  **100% Matrix Structural Compliance**: All mandatory BECC Assessment Matrix chapters (MAT-001 through MAT-014) are present, valid, and lint-clean.

---

## 8. Readiness Assessment

```text
READINESS DETERMINATION:
READY FOR IMPLEMENTATION
```

### Justification

1.  **Complete Finding Coverage**: Every finding (`FIND-LP-001` through `FIND-LP-004`) from the OP-002 Assessment is addressed by a dedicated Work Package.
2.  **Clear Execution Scope**: Target files, section headings, and documentation additions are strictly defined without ambiguity.
3.  **Low Regression Risk**: Remediations are strictly additive markdown updates to `src/content/projects/luminapraxisds.md`, posing zero risk to core Astro site functionality.
4.  **Operational Alignment**: All work packages directly support clearing Lumina Praxis for verification in Sprint OP-004 and eventual entry into the Certified Project Registry as Entry #002.

---

BECC LUMINA PRAXIS IMPROVEMENT IMPLEMENTATION PLAN COMPLETE

IMPLEMENTATION STATUS:
PLANNED

NEXT PHASE:
IMPLEMENT DOCUMENTATION IMPROVEMENTS

FOLLOWING OPERATIONAL SPRINT:
OP-004 — LUMINA PRAXIS IMPROVEMENT VERIFICATION
