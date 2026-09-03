# BECC Learning Routine Publication Pipeline v1.0 — Operational Architecture

*   **Identifikator:** `BECC-LRP-v1.0`
*   **Status:** `ACTIVE / OPERATIONAL`
*   **Version:** `1.0.0`
*   **Basis-Standards:** [BECC-PUBLIC-LEARNING-STANDARD-v1.0.md](../standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md) (`BECC-PLS-v1.0`) & [BECC-LEARNING-CANONICAL-MODEL-BASELINE-v1.0.md](BECC-LEARNING-CANONICAL-MODEL-BASELINE-v1.0.md) (`BECC-LCMB-v1.0`)
*   **Freigabe-Autorität:** Project Owner (Letztentscheidungsrecht)
*   **Konformitäts-Regel:** `NEW_LEARNING_STANDARD_CREATED: NO`, `NEW_CANONICAL_MODEL_CREATED: NO`

---

## 1. Mission & Operational Target

Dieses Dokument definiert das minimale wiederverwendbare Betriebsmodell für die Erstellung, Prüfung und Veröffentlichung von Routine-Lernartikeln auf BridGenta.de (`BECC-LRP-1.0`).

Das operative Ziel lautet:
> **Ein validierter Standard entfernt zukünftige Arbeit und reproduziert nicht dieselbe Governance-Arbeit für jeden einzelnen Artikel.**

```text
ESTABLISH SYSTEM ONCE
        ↓
REUSE SYSTEM MANY TIMES
        ↓
VERIFY ONLY ARTICLE-SPECIFIC DELTAS
```

**Ziel-Zeitbudget für Routine-Artikel:** **40–80 Minuten** Gesamtdauer von Quelle-Intake bis Veröffentlichung bei gleichbleibender Beleg-Qualität, Anstrengungs-Erhaltung, Provenienz-Absicherung und Project Owner-Autorität.

---

## 2. Betriebs-Modi (Operating Modes)

Das System unterscheidet deterministisch zwei Modi:

```text
       ┌───────────────────────────────┐
       │   ÄNDERUNG IM PR DETEKTIERT   │
       └───────────────┬───────────────┘
                       │
            Pfad- & Änderungsklassen-Prüfung
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
 ┌───────────┐                   ┌─────────────┐
 │  ROUTINE  │                   │ CALIBRATION │
 └─────┬─────┘                   └──────┬──────┘
       │                                │
 Normaler Lernartikel            System-Infrastruktur /
 (Content, Frontmatter, Event)    Schema / Renderer / CI
```

### 2.1 ROUTINE Mode
Wird verwendet, wenn Änderungen strikt auf normale Artikel-Produktion beschränkt sind:
*   Erstellung oder Bearbeitung von Artikel-Inhalten (`src/content/learning/<slug>.md`)
*   Routine-Aktualisierung von Frontmatter-Metadaten (`category`, `learningLevel`, `publicationState`, `publishedAt`, `provenanceRef`)
*   Anfügen eines einzelnen validen Provenienz-Ereignisses an `src/data/provenance_registry.json`
*   Anlegen oder Aktualisieren eines Artikel-Evidenz-Pakets (`stewardship/evidence/<slug>.yaml`)

### 2.2 CALIBRATION Mode
Wird ausgelöst, wenn sich das Learning-System selbst ändert:
*   Änderung von `BECC-PLS-v1.0` oder `BECC-LCMB-v1.0`
*   Änderung des Zod-Schemas oder der Regeln in `src/content/config.ts`
*   Änderung des Renderers (`LearningArticleRenderer.astro`) oder statischer Callout-Transformation (`LearningContentStatic.astro`)
*   Änderungen an Routen (`src/pages/lernen/`) oder Vorschau-Architektur
*   Änderung globaler Styles (`src/styles/styles.css`) oder Core-Layouts (`Layout.astro`)
*   Änderungen an Prüfskripten (`tooling/`), `becc-runtime` oder GitHub CI Workflows (`.github/workflows/`)

**Kern-Invariant:**
```text
ROUTINE_ARTICLE_CHANGE != SYSTEM_CHANGE
```

---

## 3. System-Invarianten & Artikel-spezifische Prüfungen

### 3.1 System-Invarianten (System Invariants)
Folgende etablierte Eigenschaften verbleiben invariant und werden **nicht** für jeden Routine-Artikel neu geprüft, es sei denn, die relevante Implementierung ändert sich oder ein konkreter Defekt tritt auf (`SYSTEM_INVARIANT_RECHECK: CHANGE_OR_FAILURE_TRIGGERED_ONLY`):

| Invariant ID | Invariant | Implementierungs-Quelle |
|---|---|---|
| `LRP-INV-001` | Shared Learning renderer formats layout, header, footer, & signature correctly | `src/components/LearningArticleRenderer.astro` |
| `LRP-INV-002` | Published route selector exclusively includes `publicationState === 'published'` | `src/pages/lernen/[slug].astro` |
| `LRP-INV-003` | Draft preview selector exclusively includes `publicationState === 'draft'` | `src/pages/lernen/preview/[slug].astro` |
| `LRP-INV-004` | Draft preview capability is excluded from production builds (DEV-only fail-closed) | `src/pages/lernen/preview/[slug].astro` |
| `LRP-INV-005` | Canonical metadata suppression applies to draft preview (`robots: noindex, nofollow`) | `src/components/LearningArticleRenderer.astro` |
| `LRP-INV-006` | Static IMPORTANT callout normalization transforms `[!IMPORTANT]` quote blocks | `src/components/LearningContentStatic.astro` |
| `LRP-INV-007` | Central signature renders consistently across all articles | `src/components/LearningArticleRenderer.astro` |
| `LRP-INV-008` | Learning CSS layout is responsive across desktop, tablet, mobile viewports | `src/styles/styles.css` |
| `LRP-INV-009` | Category dynamic route generation indexes published articles correctly | `src/pages/lernen/themen/[category].astro` |

### 3.2 Artikel-spezifische Prüfungen (Article-Specific Checks)
Diese mechanischen und didaktischen Prüfungen gelten für jeden einzelnen Artikel:

| Check ID | Artikel-Spezifische Prüfung | Automatisiert | Menschliches Urteil |
|---|---|---:|---:|
| `LRP-CHK-001` | Claim fidelity to source SSoT | NEIN | JA |
| `LRP-CHK-002` | Evidence classification & boundary declaration | NEIN | JA |
| `LRP-CHK-003` | Public wording boundary compliance | JA | JA |
| `LRP-CHK-004` | Frontmatter schema & date ordering validity | JA | NEIN |
| `LRP-CHK-005` | `provenanceRef` format and resolution in `provenance_registry.json` | JA | NEIN |
| `LRP-CHK-006` | Provenance event uniqueness (no `eventId` collision) | JA | NEIN |
| `LRP-CHK-007` | `publishedAt` date validity & presence when state is `published` | JA | NEIN |
| `LRP-CHK-008` | Article route slug validity (flat directory, no reserved words) | JA | NEIN |
| `LRP-CHK-009` | Category / index inclusion check | JA | NEIN |
| `LRP-CHK-010` | Content-specific layout overflow or malformed markdown | JA | JA |
| `LRP-CHK-011` | Malformed article callout or unclosed markdown tags | JA | NEIN |
| `LRP-CHK-012` | Body separator / section hierarchy compliance | JA | NEIN |
| `LRP-CHK-013` | Duplicate signature content introduced inside article body | JA | NEIN |

---

## 4. Kompaktes Evidenz-Paket (Compact Evidence Packet)

Jeder Routine-Artikel wird durch ein kompaktes Evidenz-Paket in `stewardship/evidence/<article-slug>.yaml` begleitet.

### 4.1 Vokabular-Trennung (`sourceType` vs `evidenceClass`)
Gemäß **LRP-P2-CONSTRAINT-01** wird strikt zwischen Quell-Typ (`sourceType`) und kanonischem Evidenz-Stärke-Vokabular (`evidenceClass`) unterschieden:

*   **`sourceType`:** `GIT_COMMIT`, `GIT_DIFF`, `GOVERNANCE_DOC`, `TEST_RECORD`, `LOG_OUTPUT`, `AUDIT_NOTE`, `CHAT_MEMORY`, `ABSENCE_STATE`, `STANDARD`
*   **Kanonische `evidenceClass`:**
    *   `DIRECT_EVIDENCE` (Direkter Git-Commit / Hash / verifiziertes Artefakt)
    *   `RECONSTRUCTED_EVIDENCE` (Aus Protokollen / Commits rekonstruierter Ablauf)
    *   `CONVERSATIONAL_RECOLLECTION` (Gedächtnisprotokoll / Entwickler-Erinnerung)
    *   `INFERENCE` (Logische Schlussfolgerung aus Nebeneffekten)
    *   `SPECIFICATION` (Regel / Vorgabe / Standard)
    *   `OPEN` (Offener Punkt / unbestätigt)
    *   `UNSUPPORTED` (Nicht durch Evidenz gedeckte Aussage)

### 4.2 Template-Struktur
Das Referenz-Template ist in `stewardship/evidence/BECC-LEARNING-ARTICLE-EVIDENCE-PACKET-v1.0.yaml` hinterlegt.

```yaml
# BECC Routine Article Evidence Packet v1.0
articleId: "article-slug-name"
workingTitle: "Titel des Lernartikels"
learningLevel: "beginner" # public | beginner | intermediate | advanced
category: "architecture" # matches learningCategories id
centralLesson: "Eine kurze didaktische Kernlektion."

claims:
  - id: "CLM-001"
    statement: "Verifizierbare Aussage aus dem Quellprojekt"
    sourceType: "GIT_COMMIT"
    sourceLocator: "bridgenta-workspace/validation/automation_controller.js"
    historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6"
    evidenceClass: "DIRECT_EVIDENCE"
    publicWordingBoundary:
      internalPathsSanitized: true
      secretsExcluded: true
      publicSummaryAllowed: true

unsupportedOrOpenClaims: []

transferabilityBoundary: "Gilt für statische Generatoren, nicht für SPAs."

proposedProvenanceEvent:
  eventId: "EV-BG-007"
  sourceProject: "bridgenta-core"
  sourceSystem: "git"
  sourceLocator: "bridgenta-workspace/validation/automation_controller.js"
  historicalLocatorState: "AVAILABLE"
  historicalLocator: "07aac848a4a48282c8b83169179308bdb17db0c6"
```

---

## 5. Single Owner Approval Gate & Merging Contract

Gemäß **LRP-P2-CONSTRAINT-03** erfordert die Routine-Veröffentlichung **exakt ein** Owner-Freigabe-Gate:

```text
OWNER_APPROVAL:PUBLISH
```

Dieser Entschluss umfasst gleichzeitig:
1. Inhalts- & Didaktik-Freigabe
2. Autorisierung der Veröffentlichungs-Metadaten (`publicationState: published`, `publishedAt: YYYY-MM-DD`)
3. Registrierungs-Autorisierung für das Provenienz-Ereignis in `provenance_registry.json`
4. Exact-Head-Merge-Autorisierung (vorausgesetzt CI ist grün und kein Head-Drift liegt vor)

**Formale Merge-Bedingung:**
```text
OWNER_APPROVAL
+
CI_PASS
+
NO_HEAD_DRIFT
+
NO_P0_P1
=
MERGE_AUTHORIZED
```

Sollte es zwischen Freigabe und Merge zu einem unerwarteten Git HEAD-Drift kommen (`HEAD_DRIFT = YES`), **STOPPT** der Prozess automatisch und verlangt erneute Owner-Review.

---

## 6. Automatisierte Befehle

### 6.1 `learning:validate`
Mechanische Vorab-Validierung von Entwürfen vor der Owner-Review.
```bash
npm run learning:validate -- <article-slug>
```
*   **Verantwortung:** Frontmatter-Schema, Dateisystem-Slugs, Date-Verpflichtungen, Provenienz-Syntax, Link-Syntax, Body-Regeln (keine doppelten Signaturen, keine unerlaubten HRs).
*   **Skript:** `tooling/validate_learning_article.js`

### 6.2 `learning:publish-check`
Finale Veröffentlichungs-Prüfung vor dem Merge auf den Main-Branch.
```bash
npm run learning:publish-check -- <article-slug>
```
*   **Verantwortung:** `publicationState === published`, `publishedAt` vorhanden, `provenanceRef` in `provenance_registry.json` aufgelöst, öffentliche Routen-Generierung verifiziert, Preview-Exklusion verifiziert, `npm run build` und `npm run m5:shadow` bestanden.
*   **Skript:** `tooling/publish_check_learning_article.js`

---

## 7. Deterministische Eskalations-Regeln

### 7.1 Eskalations-Matrix

| Bedingung | Im Routine-Modus verbleiben | Zielgerichtete Korrektur (Targeted Remediation) | Eskalation in Calibration Mode |
|---|---:|---:|---:|
| Artikel-Behauptung unklar / schwach belegt | NEIN | JA (Evidenz-Paket klären) | NEIN |
| Fehlerhafte Frontmatter-Syntax | NEIN | JA (Frontmatter korrigieren) | NEIN |
| Fehlender Provenienz-Locator | NEIN | JA (Git-Commit nachschlagen) | NEIN |
| Renderer-Defekt (`LearningArticleRenderer.astro`) | NEIN | NEIN | JA (System-Änderung) |
| Zod-Schema-Mischung (`config.ts`) | NEIN | NEIN | JA (System-Änderung) |
| CI-Skript-Fehler im Workflow | NEIN | JA (Konfigurationsfix) | JA (Workflow-Redesign) |
| Fließtext-Layout-Überlauf im Artikel | NEIN | JA (Text formulieren) | NEIN |
| Globale CSS-Regression (`styles.css`) | NEIN | NEIN | JA (System-Änderung) |

### 7.2 Artikel-Defekt vs. System-Defekt
```text
ARTICLE_DEFECT → TARGETED_REMEDIATION
SYSTEM_DEFECT  → CALIBRATION
```

---

## 8. Anti-Overengineering Regeln

Um administrative Bürokratie zu verhindern, gelten folgende eiserne Regeln:

```text
DO_NOT_REAUDIT_SHARED_RENDERER
unless changed or failing

DO_NOT_REAUDIT_DRAFT_PREVIEW_ARCHITECTURE
unless changed or failing

DO_NOT_REDISCOVER_PROVENANCE_SCHEMA
unless schema changed

DO_NOT_REDEFINE_PUBLISHED_AT_POLICY
unless policy changed

DO_NOT_REVERIFY_CANONICAL_MODEL
unless model changed

DO_NOT_CREATE_BESPOKE_PHASES
when routine pipeline gates already cover the risk

DO_NOT_ADD_NEW_TOOLING
unless it removes repeated work or closes a proven gap
```

---

## 9. Reusable Antigravity Prompts

### 9.1 Prompt 1: Entwurfs-Phase (Draft Phase)

```text
Run BECC Learning Routine Publication Pipeline v1.0 — Phase 1: Draft.

MODE: ROUTINE

ARTICLE_SLUG: <article-slug>
SOURCE_EVIDENCE: stewardship/evidence/<article-slug>.yaml

Instructions:
1. Inspect stewardship/evidence/<article-slug>.yaml.
2. Generate/update draft article under src/content/learning/<article-slug>.md consuming BECC-PLS-v1.0 and BECC-LCMB-v1.0.
3. Set frontmatter publicationState: draft. Do NOT set publishedAt date.
4. Execute routine validation (npm run learning:validate -- <article-slug>).
5. Verify draft route accessibility on local preview (/lernen/preview/<article-slug>).
6. Do not re-audit established system invariants unless a relevant implementation changed or a validation error indicates a system defect.
7. Stop for Owner Review when draft validation passes cleanly.
8. Escalate to CALIBRATION mode only if deterministic escalation criteria are met.
```

### 9.2 Prompt 2: Veröffentlichungs-Phase (Publication Phase)

```text
Resume BECC Learning Routine Publication Pipeline v1.0 — Phase 2: Publication.

ARTICLE_SLUG: <article-slug>
OWNER_APPROVAL: PUBLISH

Instructions:
1. Update frontmatter in src/content/learning/<article-slug>.md: set publicationState to 'published', set publishedAt date to current ISO date, verify provenanceRef.
2. Append the proposed provenance event from stewardship/evidence/<article-slug>.yaml to src/data/provenance_registry.json if not already present.
3. Execute publication validation (npm run learning:publish-check -- <article-slug>).
4. Create feature branch, commit changes, push, and open PR using GitHub CLI (gh pr create).
5. Monitor GitHub Actions CI.
6. Merge only the exact verified head to main after CI passes and Owner gives final merge command.
7. Confirm post-merge live site verification.
8. Do not modify Learning infrastructure unless a concrete P0/P1 system defect blocks publication.
9. Stop when publication verification completes.
```

---

## 10. Time-Budget Design

```text
ROUTINE_TIME_BUDGET:
- Source/evidence intake & packet creation:  10–15 min
- Draft generation:                          10–20 min
- Automated validation (learning:validate):   2–5 min
- Owner review (draft preview inspection):   10–20 min
- Publication prep & publish-check:           3–5 min
- PR creation, CI run & merge verify:         5–15 min
Gesamtdauer Routine-Artikel: 40–80 Minuten

TIME_BUDGET_ESCALATION_TRIGGER:
IF total active working time on a single routine article exceeds 120 minutes without reaching OWNER_REVIEW state
OR IF automated validation fails more than 2 retry attempts due to system ambiguity
THEN STOP, document the exact friction point, and evaluate escalation to CALIBRATION mode.
```
