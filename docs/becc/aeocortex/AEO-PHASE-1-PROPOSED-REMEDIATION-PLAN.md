# AEOcortex BECC Phase 1 — Proposed Remediation Plan

This plan outlines the specific content, heading, and terminology transformations proposed for the AEOcortex public project page. 

*Approval Status:* **`PROPOSED / PENDING REVIEW`**

---

## 1. Heading Alignment Transformations

The following H2 heading transformations are proposed to align the page structure to the BECC German-only heading policy:

| Target File Line | Original English Heading | Proposed German Replacement | Rationale |
| :--- | :--- | :--- | :--- |
| **Line 24** | `## Executive Summary` | `## Kurzfassung` | Policy alignment. |
| **Line 29** | `## Context` | `## Ausgangssituation` | Policy alignment. |
| **Line 39** | `## Problem` | `## Problemstellung` | Policy alignment. |
| **Line 44** | `## Constraints` | `## Rahmenbedingungen` | Policy alignment. |
| **Line 57** | `## Engineering Thinking` | `## Technische Überlegungen` | Policy alignment. |
| **Line 62** | `## Architecture` | `## Architektur` | *Custom alignment:* Excludes "Preservation Layers" due to project-specific architecture differences. |
| **Line 72** | `## Engineering Decisions` | `## Technische Entscheidungen` | Policy alignment. |
| **Line 102** | `## Implementation` | `## Umsetzung` | Policy alignment. |
| **Line 107** | `## Public Artifacts` | `## Öffentliche Projekteinblicke` | Policy alignment. |
| **Line 206** | `## Results` | `## Ergebnisse` | Policy alignment. |
| **Line 213** | `## Lessons Learned` | `## Erkenntnisse aus der Entwicklung` | Policy alignment. |
| **Line 218** | `## Risks` | `## Risiken` | Already matches policy. |
| **Line 230** | `## Future Evolution` | `## Nächste Entwicklungsschritte` | Policy alignment. |
| **Line 240** | `## References` | `## Quellen und Referenzen` | Policy alignment. |

---

## 2. Prose and Terminology Transformations

### Item AEO-RM-001 (Executive Summary Sentence Splitting)
* **Target (Lines 24-25):**
  ```markdown
  AEOcortex ist ein persönliches Entwicklungsprojekt zur praktischen Untersuchung und Erprobung von Suchmechanismen in KI-gestützten Systemen (Answer Engine Optimization — AEO und Generative Engine Optimization — GEO). Ziel des Projekts ist es...
  ```
* **Proposed Replacement:**
  ```markdown
  AEOcortex ist ein persönliches Entwicklungsprojekt zur praktischen Untersuchung von Suchmechanismen in KI-gestützten Systemen. Der Fokus liegt auf der Answer Engine Optimization (AEO) und der Generative Engine Optimization (GEO). Ziel des Projekts ist es...
  ```
* **Rationale:** Reduces cognitive load by splitting a 44-word sentence and removing nesting parentheticals.

### Item AEO-RM-002 (Compound Nouns Hyphenation)
* **Target (Lines 159, 172):**
  ```markdown
  robots.txt Konflikte
  LLM-Crawler Barrieren
  ```
* **Proposed Replacement:**
  ```markdown
  robots.txt-Konflikte
  LLM-Crawler-Barrieren
  ```
* **Rationale:** Aligns compound formatting to the Terminology Policy.

### Item AEO-RM-003 (Qualitative Claim Bounding)
* **Target (Line 154):**
  ```markdown
  100% automatisierte Erkennung fehlerhafter Graphstrukturen.
  ```
* **Proposed Replacement:**
  ```markdown
  Automatisierte Erkennung fehlerhafter Graphstrukturen im Rahmen der Testumgebung.
  ```
* **Rationale:** Removes absolute guarantee wording and bounds the outcome to the testing setup.

### Item AEO-RM-004 (Prohibited Guarantee Removal)
* **Target (Line 214):**
  ```markdown
  ...sparen wertvolle Zeit und garantieren die Einhaltung aktueller Web-Standards.
  ```
* **Proposed Replacement:**
  ```markdown
  ...sparen wertvolle Zeit und unterstützen die Einhaltung aktueller Web-Standards.
  ```
* **Rationale:** Replaces prohibited guarantee verb `garantieren` with scoped verb `unterstützen`.
