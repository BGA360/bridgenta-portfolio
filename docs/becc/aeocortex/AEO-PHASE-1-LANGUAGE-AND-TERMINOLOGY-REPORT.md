# AEOcortex BECC Phase 1 — Language and Terminology Report

This report presents the German language assessment, terminology register decisions, and cognitive load reviews for AEOcortex.

---

## 1. German B2–C1 Language Quality Assessment

* **Overall Register:** The text utilizes a professional technical register. However, it exhibits a high density of nominal style (Substantivstil) and passive constructions that slow down comprehension.
* **Grammar and Orthography:** Capitalization and spelling of standard German words are correct. Imported nouns (e.g. `Crawler`, `HTML-Parser`, `Build-Prozess`) are capitalized correctly.

---

## 2. Terminology Policy Decisions

Applying the `BECC-PUBLIC-TERMINOLOGY-POLICY.md`, the following vocabulary definitions are approved for AEOcortex:

* **Category 1 (German Proper Terminology):**
  - Use `Entität` instead of `Entity` when referring to data elements in German prose.
  - Use `Verständlichkeit` or `Lesbarkeit` instead of `Readability` in standard text.
* **Category 2 (Canonical English Terminology):**
  - Keep proper names of crawlers (e.g., `LLM-Crawler`, `OAI-SearchBot`) in English.
  - Keep standard formats and libraries (e.g., `JSON-LD`, `Cheerio`, `Dublin Core`, `robots.txt`) in English.
* **Category 3 (Compounds Formatting):**
  - Format compound nouns with standard German hyphens (e.g., `AEOcortex-Module`, `HTML-Markup`, `Analyse-Skripte`).

---

## 3. Cognitive Load & Readability Analysis

* **Sentence Complexity:** Multiple sentences are overly complex and contain nested sub-clauses:
  - *Example (Line 25):* AEOcortex is described using a single 44-word sentence with bilingual English-German parentheticals. This creates a high memory load.
  - *Solution:* Split into two distinct sentences and remove bilingual parentheticals.
* **Nominal Style Reduction:** Phrases like `die manuelle Verifizierung strukturierter Daten` can be expressed using active verbs (e.g., `strukturierte Daten manuell zu verifizieren`).

---

## 4. Prohibited Guarantees and Hype
* **Absolute Warranty:** Line 214 contains the verb `garantieren` (`garantieren die Einhaltung aktueller Web-Standards`). Under the BECC standard, absolute promises are prohibited.
  - *Solution:* Replace with `unterstützen die Einhaltung`.
* **Qualitative Claims:** The phrase `100% automatisierte Erkennung` (Line 154) must be qualified to the test environment parameters.
