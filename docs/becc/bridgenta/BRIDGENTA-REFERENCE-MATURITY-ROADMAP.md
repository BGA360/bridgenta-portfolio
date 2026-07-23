# Hardened Roadmap to BECC Reference Maturity (BridGenta)

This document establishes the official 9-sprint roadmap to bring the BridGenta project page to full BECC reference maturity, incorporating strict governance, terminology control, and claim-to-evidence validation.

---

## User Review Required

> [!IMPORTANT]
> - **Production Merge Control:** Sprint 7 requires the user's explicit authorization to perform the git merge and deploy the live site.
> - **No Merge Authorized in Current Sprint:** Sprint 2 is limited to local language, naturalness, and terminology cleanup.

---

## Core Heading & Terminology Policy

All public structural, navigation, editorial, and section headings must be in **German**. 

### Canonical English Terms
Canonical English technical terms may remain only where they represent:
- Official BridGenta domain names (e.g., *Source Intelligence*, *Preservation Intelligence*)
- Architecture layer names (e.g., *Visibility Preservation Layer*)
- Code/design identifiers (e.g., *CSS-Klassen*, *Design-Tokens*)
- Git and Repository terminology (e.g., *main branch*, *Repository*, *Branches*)
- Established project-specific system concepts (e.g., *Reconstruction Package*, *CI/CD*, *Architecture Gate*, *Branch-Gating*)

Bilingual headings (displaying both English and German equivalents in parentheticals) are prohibited.

### Phase-Heading Rule
Bilingual phase headings such as `Phase 1 Observe (Beobachten)` must be replaced with the clean German-only form:
- `Phase 1: Beobachten`

English phase names may remain in internal technical documentation but are excluded from the public page headings.

---

## Approved Heading Map

| Current Heading | Approved Public Heading |
| :--- | :--- |
| **Executive Summary** | Kurzfassung |
| **Why This Project Exists** | Warum dieses Projekt entstand |
| **Engineering Insight** | Technische Erkenntnis |
| **Context** | Ausgangssituation |
| **Problem** | Problemstellung |
| **Constraints** | Rahmenbedingungen |
| **Reconstruction Strategy** | Rekonstruktionsstrategie |
| **Engineering Thinking** | Technische Überlegungen |
| **Capabilities & Intelligence Domains** | Fähigkeitsbereiche und Intelligence Domains |
| **Architecture & Preservation Layers** | Architektur und Preservation Layers |
| **Engineering Decisions** | Technische Entscheidungen |
| **Implementation** | Umsetzung |
| **Validation** | Validierung |
| **Public Artifacts** | Öffentliche Projekteinblicke |
| **Results** | Ergebnisse |
| **Risks** | Risiken |
| **Lessons Learned** | Erkenntnisse aus der Entwicklung |
| **Next Evolution** | Nächste Entwicklungsschritte |
| **References** | Quellen und Referenzen |
| **Key Takeaway** | Kernaussage |
| **Workspace: Systemanalyse & Isolierung** | Arbeitsbereich: Systemanalyse und Isolierung |
| **Workflow: Strukturierte Code-Generierung** | Arbeitsablauf: Strukturierte Codegenerierung |
| **Governance: Validierung & Qualitätskontrolle** | Governance: Validierung und Qualitätskontrolle |

*Note: The ampersand `&` must be replaced by `und` in all standard German headings.*

---

## Sprint Phasing

### Sprint 1: Constitutional Heading Alignment
* **Goal:** Align structural, phase, editorial, and implementation headings to the approved German terminology map.
* **Target Files:**
  - `src/content/projects/bridgenta.md`
  - `docs/becc/bridgenta/BRIDGENTA-PUBLIC-TERMINOLOGY-REGISTER.md`
  - `docs/becc/bridgenta/BRIDGENTA-REFERENCE-MATURITY-CHANGE-REGISTER.md`
  - `docs/becc/bridgenta/BRIDGENTA-SPRINT-1-HEADING-ALIGNMENT-REPORT.md`
* **Changes:** Apply the approved headings and phase simplifications exactly. Set up the terminology and change registers. No prose edits are allowed.
* **Verification:** Astro build check, markdown lint, link verification.

### Sprint 2: Residual Language & Terminology Cleanup
* **Goal:** Resolve remaining spelling, grammar, punctuation, and terminology consistency issues.
* **Target Files:**
  - `src/content/projects/bridgenta.md`
* **Changes:**
  - Correct grammar, declensions, and capitalization.
  - Standardize Git and project terminology capitalization and usage.
  - Review and refine unnatural or künstlich elevated phrasing to natural B2-C1 register.
* **Verification:** Verify changes against the change register.

### Sprint 3: Cognitive Load & Redundancy Optimization
* **Goal:** Reduce reading load, simplify sentence structure, and eliminate redundant iterations of core principles.
* **Target Files:**
  - `src/content/projects/bridgenta.md`
* **Changes:**
  - Split complex, multi-clause sentences.
  - Replace excessive nominal style with active verbs.
  - treats one central thought per paragraph.
  - Consolidate explanation of core principles (e.g. explain *menschliche Letztkontrolle*, *Branch-Gating*, or *Datentrennung* once in full, then reference them briefly).
  - Remove bilingual double-namings.
* **Verification:** Traceability review of readability improvements.

### Sprint 4: Evidence & Claim Validation
* **Goal:** Verify, qualify, and trace every quantitative and security assertion to version-controlled evidence.
* **Target Files:**
  - `src/content/projects/bridgenta.md`
  - [NEW] `docs/becc/bridgenta/BRIDGENTA-EVIDENCE-MAP.md`
* **Changes:**
  - Map metrics (45% time savings, 100% conflict-free, 0 leaks) strictly to the pilot context.
  - Document evidence scope, test durations, measurement methods, and sample sizes in `BRIDGENTA-EVIDENCE-MAP.md`.
  - Refine security terminology (e.g., replace *Null-Leak-Szenario* with *kein Datenabfluss im Pilotlauf*).
  - Do not mix general style or grammar edits into this sprint.
* **Verification:** Complete claim-to-evidence validation checklist.

### Sprint 5: Engineering Integrity Verification
* **Goal:** Ensure no content changes have altered the underlying technical architecture, scope, or decisions.
* **Target Files:**
  - `src/content/projects/bridgenta.md`
* **Changes:**
  - Check diff against baseline to confirm architecture layers (VPL, EPL, DPL), intelligence domains, paths, and scope remain intact.
  - Log integrity checks in the reference change register.
* **Verification:** Sanity checklist of technical equivalence.

### Sprint 6: Build & Render Certification
* **Goal:** Perform compilation checks and visual validation.
* **Checks:**
  - Markdown lint and link checks.
  - Astro static build verification.
  - **Responsive viewport validation:** Test layout wrapping, table overflow, captions, spacing, and hierarchy at **320 px**, **375 px**, **768 px**, **1024 px**, **1440 px**, and **native 200% browser zoom**.
* **Acceptance:** No build errors and no unresolved publication-relevant warnings. Known unrelated warnings must be documented with justification.

### Sprint 7: Production Deployment Verification
* **Goal:** Merge the certified changes into the main branch and verify live output.
* **Action:** Merge PR and deploy to GitHub Pages.
* **Verification:**
  - Run production smoke-tests.
  - Verify live content at `https://bridgenta.de/project-bridgenta/` matches source.
  - Document commit hash and release ID.

### Sprint 8: Independent Published-Page Certification
* **Goal:** Evaluate reference maturity outside the implementation context.
* **Inputs:** The verifier receives only:
  - Final public URL
  - BECC standard and terminology register
  - Version-controlled evidence map
  - Deployed commit identifier
* **Constraints:** The verifier must not receive desired verdicts or implementation agents' pre-packaged conclusions.
* **Verdict Options:** `CERTIFIED AS PUBLISHED`, `CERTIFIED WITH OBSERVATIONS`, `REMEDIATION REQUIRED`, `NOT SUITABLE AS BECC REFERENCE`.

### Sprint 9: BECC Reference Package Extraction
* **Goal:** Formalize the lessons and structures from BridGenta into standard BECC assets for other projects.
* **Deliverables:** Creation of:
  - `BECC-PUBLIC-PAGE-REFERENCE-STANDARD-v1.0.md`
  - `BECC-PUBLIC-PAGE-ASSESSMENT-CHECKLIST.md`
  - `BECC-PUBLIC-PAGE-FINDING-REGISTER-TEMPLATE.md`
  - `BECC-PUBLIC-PAGE-REMEDIATION-REGISTER-TEMPLATE.md`
  - `BECC-PUBLISHED-PAGE-CERTIFICATION-TEMPLATE.md`
  - `BECC-PUBLIC-TERMINOLOGY-POLICY.md`
  - `BECC-PUBLIC-CLAIM-EVIDENCE-TEMPLATE.md`
  - `BECC-PUBLIC-PAGE-ROLLOUT-GUIDE.md`
* **Status:** **`COMPLETE`** (All 8 standards extracted; BridGenta-specific reference package sealed with manifest and stewardship policies under `docs/becc/bridgenta/reference-package/`).

---

## Build & Validation Gate
- **Lint command:** `npm run lint`
- **Link check:** `npm run check-links`
- **Build command:** `npm run build`
- **Acceptance Rule:** No build errors and no unresolved publication-relevant warnings.
