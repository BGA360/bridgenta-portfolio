# BridGenta Public Terminology Register
## BECC Reference Maturity Standard v1.0

This register defines the vocabulary and terminology boundaries for the BridGenta public-facing German documentation. It classifies terminology into distinct categories to preserve technical precision while enforcing B2–C1 German language rules.

---

## 1. Classification Categories

1. **German Public Terminology:** Terms that must be written in standard German to remain professional and accessible to hiring managers, engineering managers, and recruiters.
2. **Canonical English Technical Terminology:** Established standard industry terms or proprietary system concepts that should not be translated or renamed, as doing so would compromise technical meaning or project identity.
3. **Context-Dependent Terminology:** Terms that use German in structural/headline contexts and English in technical descriptions/prose contexts.

---

## 2. Terminology Mapping Registry

| Concept | Approved Public Term | Category / Classification | Usage Rules |
| :--- | :--- | :--- | :--- |
| **Code generation** | Codegenerierung | German Public Terminology | Always use the standard German noun. Capitalize correctly. |
| **Main branch** | Main Branch | Canonical Git Terminology | Keep English, capitalized as a German proper noun group. |
| **Repository** | Repository | Canonical Git Terminology | Keep English, capitalized. Never translate as *Archiv*. |
| **Branch** | Branch / Branches | Canonical Git Terminology | Keep English, capitalized. Never translate as *Zweig*. |
| **Manual review** | manuelles Review | Approved Project Terminology | German adjective with English noun. Used to describe human-in-the-loop steps. |
| **AI-generated code** | KI-generierter Code | German Public Terminology | Standard German compound with German capitalization rules. |
| **Reconstruction Package** | Reconstruction Package | Canonical BridGenta Concept | Proprietary project concept. Must not be translated. |
| **Intelligence Domains** | Intelligence Domains | Canonical BridGenta Architecture Term | Core platform domain names (e.g. *Source Intelligence*). Never translate. |
| **Preservation Layers** | Preservation Layers | Canonical BridGenta Architecture Term | Core platform architectural layers (e.g. *Visibility Preservation Layer*). |
| **Workspace** | Workspace / Arbeitsbereich | Context-Dependent | Use **Arbeitsbereich** in public section headings; use **Workspace** in technical prose. |
| **Workflow** | Workflow / Arbeitsablauf | Context-Dependent | Use **Arbeitsablauf** in public section headings; use **Workflow** in technical prose. |

---

## 3. General Style Policies

- **Ampersands:** The character `&` must be written as `und` in all standard German prose and headings (e.g., *Rahmenbedingungen und Constraints*), unless it forms part of an official proprietary name.
- **Over-Explanation:** Common industry terms (such as *UI*, *CI/CD*, *Mock-Daten*) must not be defined or explained in parentheticals. They should be used directly and naturally.
- **Capitalization:** All standard German nouns and English nouns imported into German prose must follow standard German capitalization rules (e.g., *die Branches*, *das Repository*).
