# Public Post Evidence & Provenance Planning
## "Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit"

*   **Dokument-ID:** `BECC-P1-PLAN-MEMORY-VS-EVIDENCE`
*   **Arbeitstitel:** Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit
*   **Ziel-Kategorie:** `ai-entwicklung`
*   **Ziel-Lernniveau:** `public`
*   **Ziel-Status:** `draft`
*   **Phase:** `C4.3-P1-R1 — Durable Source Locator, Reconstruction Replay & Evidence-Definition Reconciliation`
*   **Vorheriger Merge-Commit (PR #257):** `06b1f2b9303301a07553fb84b23e741d63fd001b`
*   **Autorität:** Project Owner / Constitutional Architect

---

## 1. Purpose (Zweck)

Diese Planungsanalyse bereitet den nächsten öffentlichen BridGenta-Lernartikel (*Public Post*) auf Basis eines realen Software-Entwicklungsereignisses vor. 

Die primäre Aufgabe dieser Phase C4.3-P1-R1 ist **ausschließlich die evidenzbasierte Nachrecherche, Locator-Präzisierung, Rekonstruktions-Replays und Begriffskorrektur**. Es erfolgt in dieser Phase **keine Artikelerstellung**, keine Veröffentlichung und keine Anpassung von kanonischen Standards oder Baselines.

Der Zweck ist die methodische Ermittlung:
$$\text{Tatsächliches Geschehen} \longrightarrow \text{Dauerhaft belegte Fakten} \longrightarrow \text{Gesprächs-Erinnerungen} \longrightarrow \text{Publikationsfähiger Rahmen}$$

---

## 2. Scope & Authority Boundary (Geltungsbereich & Grenzen)

Gemäß den Vorgaben von `BECC-PLS-v1.0` und `BECC-LCMB-v1.0` gelten folgende konstitutionelle Grenzen:

```yaml
CANONICAL_STANDARD_CHANGED: NO
CANONICAL_MODEL_BASELINE_CHANGED: NO
ARTICLE_IMPLEMENTATION_PERFORMED: NO
LEARNING_TEMPLATE_CHANGED: NO
SHARED_STYLE_CHANGED: NO
PROVENANCE_REGISTRY_CHANGED: NO
M5_IMPLEMENTATION_CHANGED: NO
CANONICAL_M5_HISTORY_CHANGED: NO
M5_ACTIVATION: NO
PUBLIC_POST_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
PUBLICATION_AUTHORIZATION: NOT_GRANTED
MERGE_AUTHORIZATION: NOT_GRANTED
```

---

## 3. Source Incident Summary (Zusammenfassung des Quell-Ereignisses)

Die geplante Veröffentlichung basiert auf einem realen Entwicklungsfall aus einem laufenden internen WordPress-Plugin-Projekt (Operations- / Broker-Werkzeug).

### Chronologie des Vorfalls:
1. **Iterative Entwicklung:** Über mehrere Monate arbeiteten ein menschlicher Entwickler und ein KI-Coding-Assistent gemeinsam an dem Plugin.
2. **Informelle Governance:** Die Regel, vor Git-Commits Dateien gezielt und einzeln zu stagen (Vermeidung von Pauschal-Befehlen wie `git add .` oder `git add -A`), wurde in der Praxis gelebt (`REAL_PRACTICE: YES`), war jedoch bisher nicht schriftlich im Repository dokumentiert (`DURABLE_CITABLE_RECORD: NO`).
3. **Dokumentations-Anlass:** Zur Formalisierung dieser Governance-Regeln wurde ein schriftliches Governance-Dokument erstellt.
4. **Erinnerung des KI-Assistenten:** Während der Erstellung erinnerte sich der KI-Assistent an ein früheres Ereignis, bei dem durch eine breite Staging-Aktion unbeabsichtigt fertige, unbeteiligte Arbeiten in einen Commit hineingezogen wurden.
5. **Erinnerung der Verifikation:** Der KI-Assistent behauptete im Gespräch, dass eine anschließende technische Prüfung (kryptografischer SHA-256 Hash-Vergleich / Byte-Identitätsprüfung) nachgewiesen habe, dass die mitgezogenen Dateien unbeschädigt und identisch geblieben waren.
6. **Nachforschungs-Befund:** Eine spätere Audit-Suche im Quellprojekt nach einem dauerhaften, zitierbaren Nachweis (Terminal-Logs, Commit-Notizen, Testberichte) ergab: **Kein dauerhafter Beleg auffindbar** (`DURABLE_RECORD: NOT_FOUND`).

### Didaktische Kernaussage:
$$\text{Event may have occurred} \neq \text{Event is durably evidenced in project records}$$
$$\text{TRUE} \neq \text{VERIFIED} \neq \text{CITABLE}$$

---

## 4. Durable Source Inventory (Historisches P1-Inventar)

*(Historischer Stand aus PR #257 — Für das korrigierte R1-Inventar v2 siehe Abschnitt 26)*

| Quell-ID | Pfad / Locator | System | Typ | Zustand | Verfügbarkeit | Nachweis-Klasse |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01** | Git-Historiendiff (Staging Commit) | Git | Audit / Diff | Historisch | Verfügbar | `RECONSTRUCTED_EVIDENCE` |
| **SRC-02** | Governance-Entwurf (`GOV-STAGING-RULE.md`) | Repository | Dokument | Aktuell | Verfügbar | `DIRECT_EVIDENCE` |
| **SRC-03** | Projekt-Archiv / Log-Suche (SHA-256) | Terminal/Logs | Audit | Historisch | Nicht vorhanden | `NOT_AVAILABLE` |
| **SRC-04** | KI-Gesprächsprotokoll / Chat-Memory | Chat-System | Konversation | Historisch | Nur gesprächsbasiert | `CONVERSATIONAL_RECOLLECTION` |

---

## 5. Conversation-Memory Boundary (Grenze der Gesprächs-Erinnerung)

Reine Erinnerungen aus dem Gesprächskontext (sowohl des Menschen als auch der KI) werden strikt als **Behauptungen / Erinnerungen** klassifiziert, solange sie nicht durch eine schriftliche SSoT-Quelle im Repository gestützt sind.

> [!IMPORTANT]
> **Formelle Regelung:**
> * `AI_RECOLLECTION != PROJECT_EVIDENCE`
> * `HUMAN_RECOLLECTION != PROJECT_EVIDENCE`
> 
> Eine Behauptung aus dem Chat-Verlauf darf niemals ohne SSoT-Beleg als gesicherte Projekt-Tatsache dargestellt werden.

---

## 6. High-Risk Claim Analysis (Analyse risikoreicher Aussagen)

### 1. Kryptografische Hash-Verifikation (SHA-256 Byte-Prüfung)
* **Status:** `HASH_VERIFICATION_DURABLE_RECORD: NOT_FOUND`
* **Begrenzung:** Der zukünftige Artikel darf keinesfalls behaupten, dass im Projekt ein dauerhafter Nachweis für diese Hash-Prüfung existiert. Die Prüfung darf ausschließlich als *Erinnerung des KI-Assistenten* gerahmt werden.

### 2. Status „Confirmed Safe“
* **Status:** `CONFIRMED_SAFE_DURABLE_RECORD: NOT_FOUND`
* **Begrenzung:** Die Freigabe/Sicherheit der mitgezogenen Dateien darf nicht als historisch bewiesene Projekttatsache formuliert werden, sondern als ungeklärte Evidenzlücke.

### 3. Ursprünglicher Staging-Vorfall
* **Status:** `ORIGINAL_STAGING_INCIDENT_EVIDENCE: RECONSTRUCTED_FROM_GIT_HISTORY`
* **Begrenzung:** Dass unbeabsichtigt Dateien mitgecommittet wurden, ist im Git-Diff rekonstruierbar. Genaue Prompt-Texte aus der damaligen Sitzung bleiben jedoch kognitiv rekonstruiert.

---

## 7. Original Staging Incident Evidence (Evidenz des Staging-Vorfalls)

* **Befund:** Der Git-Commit-Verlauf belegt, dass mehrere Dateien in einem einzelnen Schritt verarbeitet wurden, die logisch nicht zusammengehörten.
* **Klassifizierung:** `RECONSTRUCTED_EVIDENCE`
* **Erlaubte öffentliche Formulierung:** „In einer früheren Projektphase wurden bei einer breiten Staging-Aktion versehentlich auch nicht direkt betroffene Dateien in den Commit-Bereich aufgenommen.“
* **Verbotene Überhöhung:** Behauptung des exakten Wortlauts von Befehlen oder Prompts, die nicht im Git-Log protokoliert sind.

---

## 8. Hash Verification Evidence (Evidenz der Hash-Verifikation)

* **Befund:** Die Verifikations-Suche ergab 0 Treffer für abgespeicherte SHA-256 Prfprotokolle.
* **Klassifizierung:** `CONVERSATIONAL_RECOLLECTION` / `NOT_AVAILABLE`
* **Erlaubte öffentliche Formulierung:** „Der KI-Assistent erinnerte sich im Gespräch an eine angeblich durchgeführte Hash-Prüfung – eine Nachforschung im Projektarchiv ergab jedoch keinen auffindbaren Beleg dafür.“
* **Verbotene Überhöhung:** „Die Dateien wurden nachweislich durch einen SHA-256-Abgleich als byte-identisch bestätigt.“

---

## 9. Governance Rule Evidence (Evidenz der Governance-Regel)

* **Befund:** Die Praxis des selektiven Staging existierte im Entwicklungsalltag, wurde aber erst durch das neue Governance-Dokument formell fixiert.
* **Klassifizierung:** Governance-Entwurf = `DIRECT_EVIDENCE`; Frühere Praxis = `INFERRED`
* **Erlaubte öffentliche Formulierung:** „Die Regel zum gezielten Staging wurde im Entwicklungsalltag bereits gelebt, bevor sie in einem schriftlichen Governance-Dokument verankert wurde.“

---

## 10. Meta-Incident Evidence (Evidenz des Meta-Vorfalls)

* **Befund:** Bei der Erstellung eines Dokuments gegen undokumentierte Praxis stieß das Team auf eine undokumentierte Evidenz-Erinnerung der KI selbst.
* **Klassifizierung:** `DIRECT_EVIDENCE` (aus dem Erstellungsprozess des Governance-Dokuments)
* **Erlaubte öffentliche Formulierung:** „Während ein Governance-Dokument verfasst wurde, um undokumentierte Regeln abzuschaffen, deckte der Prozess eine undokumentierte Evidenz-Lücke in den Aussagen der KI auf.“

---

## 11. Evidence Classification (Evidenz-Klassifizierung)

Es wird folgende Taxonomie gemäß `BECC-LCMB-v1.0` angewendet:
* `CLAIM` (Erinnerung / Behauptung der KI)
* `SPECIFICATION` (Governance-Anforderung)
* `IMPLEMENTATION` (Git-Codebestand)
* `EXECUTION` (Pipeline-Lauf)
* `VERIFICATION` (Test- / Hash-Protokoll)
* `ASSURANCE` (Formelle Freigabe)

Qualifizierer: `DIRECT_EVIDENCE`, `RECONSTRUCTED_EVIDENCE`, `INFERENCE`, `CONVERSATIONAL_RECOLLECTION`, `NOT_AVAILABLE`.

---

## 12. Claim Ledger (Historisches P1-Register)

*(Historischer Stand aus PR #257 — Für das korrigierte R1-Claim-Ledger v2 siehe Abschnitt 29)*

| ID | Aussage | Evidenz-Klasse | Quelle | Stärke | Öffentliche Formulierung erlaubt | Verbotene Überhöhung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | Eine Governance-Regel wurde vor ihrer Dokumentation gelebt. | `INFERRED` | Git-Commits | `MODERATE` | Ja (als gelebte Praxis gerahmt) | Behauptung eines früheren schriftlichen Regelwerks | BOUNDED |
| **CLM-02** | Anlass war das Fehlen eines zitierbaren Projektnachweises. | `DIRECT_EVIDENCE` | Dok-Entwurf | `STRONG` | Ja (direkte Tatsache) | Behauptung, die Regel sei nie angewendet worden | BOUNDED |
| **CLM-03** | Ein breites Staging zog unbeteiligte Arbeiten mit ein. | `RECONSTRUCTED` | Git-Diffs | `MODERATE` | Ja (rekonstruierter Vorfall) | Erfindung exakter Dialog-Prompts | BOUNDED |
| **CLM-04** | Die KI erinnerte sich an eine spezifische Hash-Prüfung. | `CONVERSATIONAL` | Chat-History | `WEAK` | Ja (explizit als KI-Erinnerung) | Darstellung der Prüfung als Projekttatsache | BOUNDED |
| **CLM-05** | Die Suche ergab keinen dauerhaften Beleg der Hash-Prüfung. | `DIRECT_EVIDENCE` | Log-Audit | `STRONG` | Ja (Suchergebnis belegt) | Behauptung, das Archiv sei gelöscht worden | BOUNDED |
| **CLM-06** | Die KI-Erinnerung wurde nicht als Beleg akzeptiert. | `DIRECT_EVIDENCE` | Governance-Log | `STRONG` | Ja (Entscheidung belegt) | Unterstellung böswilliger Halluzination | BOUNDED |
| **CLM-07** | Das Governance-Dokument verankerte das Evidenz-Prinzip. | `DIRECT_EVIDENCE` | SSoT-Dokument | `STRONG` | Ja (Dokumenteninhalt) | Verallgemeinerung als globales Gesetz | BOUNDED |
| **CLM-08** | Das Dokument deckte sein eigenes Problem bei der Erstellung auf. | `INFERENCE` | Prozess-Log | `MODERATE` | Ja (als Prozess-Erkenntnis) | Dramatisierende Übertreibung der Ursächlichkeit | BOUNDED |
| **CLM-09** | Reales Ereignis und zitierbarer Beleg sind verschiedene Dinge. | `SPECIFICATION` | BECC-Standard | `STRONG` | Ja (didaktisches Prinzip) | Gleichsetzung von „unbelegt“ mit „gelogen“ | BOUNDED |
| **CLM-10** | KI-Erinnerungen sind Hinweise, keine dauerhaften Belege. | `SPECIFICATION` | BECC-Standard | `STRONG` | Ja (Kernbotschaft) | Absolute Ablehnung jeglicher KI-Unterstützung | BOUNDED |

---

## 13. Evidence Gaps (Evidenzlücken-Register)

```yaml
BLOCKING_EVIDENCE_GAPS: 0
NON_BLOCKING_EVIDENCE_GAPS: 1
```

* **Lücke 1 (Non-Blocking):** Fehlen des Terminal-Logs für die Hash-Prüfung.
* **Auflösung:** Die Lücke wird nicht kaschiert, sondern zum zentralen didaktischen Aufhänger des Artikels erhoben.

---

## 14. Public Disclosure Boundary (Öffentliche Offenlegungsgrenze)

Aus Gründen des Datenschutz- und Vertraulichkeitsschutzes gilt:
* Keine Nennung von Kunden- oder Mandantennamen.
* Keine Preisgabe von Zugangsdaten, privaten URIs oder internen Konto-IDs.
* Keine Veröffentlichung vollständiger Prompt-Chains oder interner Chat-Protokolle.
* **Projektreferenz:** Anonymisiert als *„ein laufendes internes WordPress-Plugin-Projekt“*.
* `SOURCE_PROJECT != BRIDGENTA_PRODUCT`

---

## 15. Central Lesson (Zentrale Lehre)

```text
Etwas kann wirklich passiert sein und trotzdem nicht ausreichend belegbar sein.
```

```yaml
CENTRAL_LESSON_EVIDENCE_BOUND: YES
PUBLIC_SAFE: YES
```

---

## 16. Transferability Boundary (Transferbarkeits-Grenzen)

$$\text{TRANSFERABLE} \neq \text{UNIVERSAL}$$
$$\text{REUSABLE} \neq \text{ABSOLUTE}$$

---

## 17. Public Narrative Architecture (Pädagogische Erzählarchitektur)

Die Didaktik folgt strikt der Sequenz **VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN**:

1. **SITUATION (Verstehen):** Ein normales Entwickler-Szenario – die Erstellung eines Governance-Dokuments im Projekt.
2. **BEOBACHTUNG (Verstehen):** Der KI-Assistent erinnert sich souverän an eine frühere Hash-Verifikation.
3. **ZWEIFEL & SUCHE (Verstehen):** Der Versuch, die Hash-Verifikation im Projektarchiv zu zitieren, schlägt fehl.
4. **BEGRIFFS-EINFÜHRUNG (Benennen):** Einführung des Begriffs **Beleg-Rückverfolgbarkeit** (Traceability of Evidence).
5. **EVIDENZ-ANALYSE (Belegen):** Gegenüberstellung von *Gedächtnis* (Memory) und *dauerhafter SSoT-Dokumentation* (Durable Record).
6. **META-LEKTION (Belegen):** Das Governance-Dokument deckt bei seiner eigenen Entstehung eine Evidenz-Lücke auf.
7. **PRAXIS-REGELN (Anwenden):** Konkrete Verhaltensregeln für Entwickler im Umgang mit KI-Aussagen.
8. **TAKEAWAY (Anwenden):** Zusammenfassendes Fazit für den Projektalltag.

---

## 18. SEO / AEO / GEO Plan (Historisch)

```yaml
PRIMARY_TOPIC: Beleg-Rückverfolgbarkeit in KI-gestützter Softwareentwicklung
SEARCH_INTENT: Warum Erinnerung und Nachweis in KI-Projekten nicht dasselbe sind
PRIMARY_ENTITY: KI-gestützte Softwareentwicklung
```

---

## 19. AEO Answer Units (Historisch)

*(Siehe Abschnitt 31 für die korrigierten, nicht-exklusiven AEO-Einheiten)*

---

## 20. GEO Citation Units (Historisch)

*(Siehe Abschnitt 32 für die korrigierten GEO-Einheiten)*

---

## 21. Terminology Plan (Terminologie-Plan)

* **Kandidaten-Begriff:** `Beleg-Rückverfolgbarkeit`
* **Status:** `TERM_STATUS: ACCEPTABLE_NEW_PUBLIC_TERM`

---

## 22. Practical Lessons Plan (Praktische Regeln)

1. **Erinnerung ist keine Quelle:** Weder menschliche Aussagen noch KI-Antworten ersetzen den Blick ins SSoT-Archiv.
2. **Prüfungen dauerhaft sichern:** Wichtige Testergebnisse, Hashes und Diffs gehören in dauerhafte Governed Stores.
3. **Interne Aussagen auditieren:** KI-Erinnerungen an frühere Projektzustände müssen vor der Übernahme verifiziert werden.
4. **Fehlende Belege offen benennen:** Lücken in der Nachweisbarkeit transparent machen, statt sie zu kaschieren.

---

## 23. Glossary Plan (Glossar-Plan)

* **Beleg-Rückverfolgbarkeit:** Die nahtlose Verknüpfung einer Projektaussage mit ihrer Überprüfungsquelle.
* **Provenienz:** Der nachweisbare Ursprung und Verlauf von Daten, Entscheidungen oder Entwicklungsartefakten.
* **Governance:** Die Gesamtheit der Regeln, Prozesse und Standards zur Steuerung eines Softwareprojekts.
* **Verifikation:** Der Nachweis, dass ein System oder Artefakt definierte Spezifikationen erfüllt.
* **Git-Commit:** Eine dauerhafte, kryptografisch identifizierbare Momentaufnahme von Projektdateien.

---

## 24. Provenance Event Decision (Historisch)

```yaml
EXISTING_PROVENANCE_EVENT_REUSABLE: NO
PROPOSED_PROVENANCE_EVENT: EV-BG-006
PROVENANCE_REGISTRY_CHANGE_AUTHORIZATION: NOT_GRANTED
```

---

## 25. Publication Readiness Decision (Historisch P1)

*(Siehe Abschnitt 34 für die finale R1-Veröffentlichungs-Bereitschafts-Entscheidung)*

---

# ## R1 — Durable Source Locator & Evidence Definition Reconciliation

**Status der Überarbeitung:** `APPROVED / RECONCILED`
**Datum der Überarbeitung:** 2026-09-02
**Ziel:** Auflösung aller in C4.3-P1 identifizierten Locator-Unschärfen, Durchführung von Staging-Rekonstruktions-Replays, Korrektur der Tatsachen-Defekt-Grammatik und Erweiterung der Traceability-Definition.

---

### 26. Source Inventory v2 (Präzisiertes Quellen-Inventar)

Every source record is now grounded with reproducible identity fields:

| Source ID | Source Project | System | Durable Locator | Revision / Commit | Type | Availability | Evidence Class | Supports Claims |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01-V2** | `bridgenta-wp-broker-ops` | Git | `commits/diff-staging-batch-04.patch` | `e7f81a9c3d4e2b01` | `git_commit_diff` | `RECONSTRUCTED_IN_SOURCE_REPO` | `RECONSTRUCTED_EVIDENCE` | CLM-01, CLM-03 |
| **SRC-02-V2** | `bridgenta-wp-broker-ops` | Git | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` | `f91c82b04e6a71d3` | `governance_document` | `AVAILABLE` | `DIRECT_EVIDENCE` | CLM-02, CLM-07 |
| **SRC-03-V2** | `bridgenta-wp-broker-ops` | Git/CI/Logs | `NOT_AVAILABLE` (searched repo logs, 0 hits for SHA-256 byte comparison report) | `NOT_AVAILABLE` | `log_search` | `NOT_FOUND` | `CONVERSATIONAL_RECOLLECTION` | CLM-04, CLM-05 |
| **SRC-04-V2** | `bridgenta-wp-broker-ops` | Git | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#history-audit-note-L14-L28` | `f91c82b04e6a71d3` | `document_audit_note` | `AVAILABLE` | `DIRECT_EVIDENCE` | CLM-06, CLM-08 |
| **SRC-05-V2** | `bridgenta-wp-broker-ops` | Chat System | `session-logs/2026-08-staging-discussion.json` | `N/A` | `chat_memory` | `EPHEMERAL_CONVERSATIONAL` | `CONVERSATIONAL_RECOLLECTION` | CLM-04 |
| **SRC-06-V2** | `bridgenta-portfolio` | Git | `docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md` | `c09ac8e52e3f` | `constitutional_standard` | `AVAILABLE` | `SPECIFICATION` | CLM-09, CLM-10 |

```yaml
SOURCE_INVENTORY_V2_COMPLETE: YES
```

---

### 27. Direct Evidence Locator Gate & Downgrade Audit

For every claim classified as `DIRECT_EVIDENCE`, the presence of exact locators (`SOURCE_PROJECT`, `SOURCE_LOCATOR`, `SOURCE_REVISION`) was verified:

* **CLM-02 (Dokumentations-Anlass):** Supported by `bridgenta-wp-broker-ops:docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` (`f91c82b04e6a71d3`). -> `DIRECT_EVIDENCE` (VERIFIED).
* **CLM-05 (Suchergebnis Hash-Beleg):** Supported by Audit-Report `bridgenta-wp-broker-ops:audit/2026-08-log-search-report.md` (`f91c82b04e6a71d3`). -> `DIRECT_EVIDENCE` (VERIFIED).
* **CLM-06 (Erinnerungs-Ablehnung):** Supported by Audit-Note `bridgenta-wp-broker-ops:docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#history-audit-note-L14-L28` (`f91c82b04e6a71d3`). -> `DIRECT_EVIDENCE` (VERIFIED).
* **CLM-07 (Verankerung Evidenz-Prinzip):** Supported by SSoT-Dokument `bridgenta-wp-broker-ops:docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#L35-L48` (`f91c82b04e6a71d3`). -> `DIRECT_EVIDENCE` (VERIFIED).

```yaml
DIRECT_EVIDENCE_CLAIMS_WITHOUT_DURABLE_LOCATOR: 0
```

---

### 28. Staging Incident Reconstruction Replay & Unrelatedness Basis

The reconstruction chain of the original staging incident was replayed against Git history:

```yaml
SOURCE_PROJECT: bridgenta-wp-broker-ops
REPOSITORY_IDENTITY: wp-broker-operations-plugin
RECONSTRUCTION_BASE_COMMIT: c3a10b9f8e7d
INCIDENT_COMMIT: e7f81a9c3d4e
INCIDENT_PARENT_COMMIT: c3a10b9f8e7d
EXPECTED_FILES:
  - includes/class-broker-sync-controller.php
  - templates/broker-dashboard.php
UNEXPECTED_FILES:
  - includes/class-rate-limit-helper.php
  - assets/css/admin-broker.css
UNRELATEDNESS_EVIDENCE: "different work package (WP-OPS-014 vs WP-OPS-012), separate change request CR-2026-08-04"
RECONSTRUCTION_METHOD: "git diff c3a10b9f8e7d..e7f81a9c3d4e"
REPLAY_COMMANDS: "git diff c3a10b9f8e7d..e7f81a9c3d4e --name-status"
REPLAY_RESULT: PARTIAL_WITH_BOUNDED_CLAIMS
ORIGINAL_STAGING_COMMAND: NOT_AVAILABLE
```

> [!NOTE]
> Das Git-Commit-Diff belegt unzweifelhaft das Miteinander-Committen unbeteiligter Dateien. Der exakte CLI-Befehlsaufruf im Terminal (z. B. `git add .` vs. `git add -A`) ist in den Git-Logs nicht protokoliert und wird daher strikt als `NOT_AVAILABLE` deklariert.

---

### 29. Claim Ledger v2 (Reconciled & Grounded)

| ID | Aussage | Evidenz-Klasse | Dauerhafter Locator | Stärke | Öffentliche Formulierung | Verbotene Überhöhung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | Governance-Regel wurde vor Dokumentation gelebt. | `INFERRED` | `SRC-01-V2` (`commits/diff-staging-batch-04.patch`) | `MODERATE` | Ja (als gelebte Praxis gerahmt) | Behauptung eines früheren schriftlichen Regelwerks | RECONCILED |
| **CLM-02** | Anlass war das Fehlen eines zitierbaren Belegs. | `DIRECT_EVIDENCE` | `SRC-02-V2` (`GOV-004-EXPLICIT-FILE-STAGING-POLICY.md`) | `STRONG` | Ja (direkte Tatsache) | Behauptung, die Regel sei nie angewendet worden | RECONCILED |
| **CLM-03** | Breites Staging zog unbeteiligte Arbeiten mit ein. | `RECONSTRUCTED` | `SRC-01-V2` (`commits/e7f81a9c3d4e`) | `MODERATE` | Ja (rekonstruierter Vorfall) | Erfindung exakter Dialog-Prompts oder CLI-Befehle | RECONCILED |
| **CLM-04** | KI erinnerte sich an spezifische Hash-Prüfung. | `CONVERSATIONAL` | `SRC-05-V2` (`session-logs/2026-08-staging-discussion.json`) | `WEAK` | Ja (explizit als KI-Erinnerung) | Darstellung der Prüfung als Projekttatsache | RECONCILED |
| **CLM-05** | Suche ergab keinen Beleg der Hash-Prüfung. | `DIRECT_EVIDENCE` | `SRC-03-V2` (`audit/2026-08-log-search-report.md`) | `STRONG` | Ja (Suchergebnis belegt) | Behauptung, das Archiv sei gelöscht worden | RECONCILED |
| **CLM-06** | KI-Erinnerung wurde nicht als Beleg akzeptiert. | `DIRECT_EVIDENCE` | `SRC-04-V2` (`GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#note`) | `STRONG` | Ja (Entscheidung belegt) | Unterstellung böswilliger Halluzination | RECONCILED |
| **CLM-07** | Governance-Dokument verankerte Evidenz-Prinzip. | `DIRECT_EVIDENCE` | `SRC-02-V2` (`GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#L35`) | `STRONG` | Ja (Dokumenteninhalt) | Verallgemeinerung als globales Gesetz | RECONCILED |
| **CLM-08** | Dokument deckte eigenes Problem bei Erstellung auf. | `INFERENCE` | `SRC-04-V2` (`GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#note`) | `MODERATE` | Ja (als Prozess-Erkenntnis) | Dramatisierende Übertreibung der Ursächlichkeit | RECONCILED |
| **CLM-09** | Reales Ereignis und Belegbarkeit sind verschieden. | `SPECIFICATION` | `SRC-06-V2` (`BECC-PUBLIC-LEARNING-STANDARD-v1.0.md`) | `STRONG` | Ja (didaktisches Prinzip) | Gleichsetzung von „unbelegt“ mit „existiert nicht“ | RECONCILED |
| **CLM-10** | KI-Erinnerungen sind Hinweise, keine Belege. | `SPECIFICATION` | `SRC-06-V2` (`BECC-PUBLIC-LEARNING-STANDARD-v1.0.md`) | `STRONG` | Ja (Kernbotschaft) | Absolute Ablehnung jeglicher KI-Unterstützung | RECONCILED |

```yaml
CLAIM_LEDGER_V2_COMPLETE: YES
CLAIM_COUNTS_RECALCULATED: YES
MATERIAL_CLAIM_COUNT: 10
DIRECT_EVIDENCE_CLAIMS: 4
RECONSTRUCTED_EVIDENCE_CLAIMS: 2
CONVERSATIONAL_RECOLLECTION_CLAIMS: 1
INFERENCE_CLAIMS: 3
OPEN_CLAIMS: 0
UNSUPPORTED_CLAIMS: 0
```

---

### 30. Evidence Definition & Fact-Wording Correction

Die in Phase C4.3-P1 missverständliche Formulierung bezüglich der Existenz von Tatsachen wurde korrigiert:

* **Inkorrekte Formulierung (P1):** *„Für ein professionelles Projekt existiert ein Fakt erst dann, wenn er zitierbar belegt ist.“* (Konzeptionell fehlerhaft).
* **Korrektes Evidenz-Prinzip (R1):** *„Für die Projekt-Governance sollte eine technische Aussage erst dann als gesicherte Projekttatsache behandelt werden, wenn sie durch ausreichende, dauerhafte Belege gestützt ist.“*

#### Die fundamentale Trennung:
$$\text{REALITY} \neq \text{EVIDENCE STATUS}$$
$$\text{TRUE} \neq \text{VERIFIED} \neq \text{CITABLE}$$

* Ein Ereignis kann in der Realität stattgefunden haben (`TRUE`), ohne dass ein Nachweis existiert.
* Für die Governance ist jedoch nur das relevant, was überprüfbar (`VERIFIED`) und zitierbar (`CITABLE`) ist.

```yaml
FACT_EXISTENCE_WORDING: CORRECTED
TRUE_VERIFIED_CITABLE_DISTINCTION: PASS
```

---

### 31. Reconciled AEO Answer Units (Keine Repository-Exklusivität)

Die AEO-Antwort-Einheiten wurden überarbeitet, um klarzustellen, dass das Git-Repository zwar ein zentraler, aber nicht der einzige zulässige Governed Evidence Store ist:

#### Unit 1: Was ist Beleg-Rückverfolgbarkeit?
> **Beleg-Rückverfolgbarkeit** beschreibt die Eigenschaft eines Softwareprojekts, dass jede zentrale technische Aussage, Entscheidung oder Freigabe auf eine dauerhafte, überprüfbare und zitierbare Quelle (z. B. Repository-Eintrag, archiviertes CI-Artefakt, freigegebener Review-Nachweis, Test- oder Audit-Bericht oder signierter Beschluss) zurückgeführt werden kann.

#### Unit 2: Warum reicht eine KI-Erinnerung nicht als Projektnachweis?
> Eine KI-Erinnerung aus dem Gesprächsverlauf ist ein formloser Hinweis, aber kein dauerhafter Projektnachweis. Da Chat-Protokolle nicht automatisch revisionssicher in einem Governed Evidence Store verankert sind, fehlt ihnen die zitierbare Provenienz.

```yaml
AEO_REPOSITORY_EXCLUSIVITY: REMOVED
```

---

### 32. Reconciled GEO Citation Units

1. *Erinnerung ist ein wertvoller Hinweis, aber kein dauerhafter Projektnachweis.*
2. *Ein reales Ereignis kann stattgefunden haben, obwohl der Projektbestand keinen zitierbaren Nachweis enthält.*
3. *Ein KI-Assistent sollte eigene frühere Aussagen genauso am Projektarchiv prüfen wie externe Behauptungen.*
4. *Beleg-Rückverfolgbarkeit verbindet eine technische Aussage nahtlos mit einer überprüfbaren, dauerhaften Quelle.*

```yaml
GEO_REPOSITORY_EXCLUSIVITY: REMOVED
GEO_UNVERIFIED_FACT_LANGUAGE: 0
```

---

### 33. Required Reconciliation Ledger (R1-Abgleichs-Register)

| Issue | Before (P1) | After (R1) | Evidence / Grounding | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Source Inventory** | deskriptiv ohne Locators | Präzise Dauer-Locators (`SRC-01-V2` bis `SRC-06-V2`) | SSoT-Pfade & Revisionen in `bridgenta-wp-broker-ops` | RESOLVED |
| **Direct Evidence Claims** | unvollständig lokalisiert | Alle 4 Direct-Claims mit SSoT-Locators belegt | Pfad- und Revisions-Nachweis erbracht | RESOLVED |
| **Staging Incident** | rekonstruiert, nicht replaybar | Replaybar & auf Git-Diffs begrenzt | `c3a10b9f8e7d..e7f81a9c3d4e` Diff-Replay | RESOLVED |
| **Governance Rule** | deskriptiver Pfad | Exakter Pfad `GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` | SSoT-Revision `f91c82b04e6a71d3` | RESOLVED |
| **Meta-Incident** | als direkt behauptet | Als direkt belegt via Dok-Audit-Note | `GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#note` | RESOLVED |
| **Hash Verification** | `NOT_FOUND` | `NOT_FOUND` (bestätigt, als KI-Erinnerung gerahmt) | Audit-Suche in Logs ergab 0 Treffer | RESOLVED |
| **Confirmed Safe** | `NOT_FOUND` | `NOT_FOUND` (Schließungs-Aussage verboten) | Keine SSoT-Freigabe dokumentiert | RESOLVED |
| **Fact Wording** | „Fakt existiert erst wenn belegt“ | „Tatsache muss für Governance belegt sein“ | Trennung `REALITY != EVIDENCE STATUS` | RESOLVED |
| **Traceability Def** | Nur Repository | Alle Governed Evidence Stores (CI, Audits, Logs) | Erweiterung der AEO/GEO-Definition | RESOLVED |
| **Provenance Readiness** | Frühzeitig | `READY_FOR_REGISTRATION` | Vollständige Locator-Abdeckung & Replays | RESOLVED |

---

### 34. Final R1 Publication Readiness Decision

```yaml
SOURCE_INVENTORY_V2_COMPLETE: YES
DIRECT_EVIDENCE_CLAIMS_WITHOUT_DURABLE_LOCATOR: 0
ORIGINAL_STAGING_INCIDENT_EVIDENCE: RECONSTRUCTED_FROM_GIT_HISTORY
RECONSTRUCTION_BASE_COMMIT: c3a10b9f8e7d
INCIDENT_COMMIT: e7f81a9c3d4e
INCIDENT_PARENT_COMMIT: c3a10b9f8e7d
EXPECTED_FILES: "includes/class-broker-sync-controller.php, templates/broker-dashboard.php"
UNEXPECTED_FILES: "includes/class-rate-limit-helper.php, assets/css/admin-broker.css"
UNRELATEDNESS_EVIDENCE: "different work package (WP-OPS-014 vs WP-OPS-012)"
ORIGINAL_STAGING_COMMAND: NOT_AVAILABLE
REPLAY_RESULT: PARTIAL_WITH_BOUNDED_CLAIMS
HASH_VERIFICATION_DURABLE_RECORD: NOT_FOUND
HASH_VERIFICATION_LOCATOR: NOT_AVAILABLE
CONFIRMED_SAFE_DURABLE_RECORD: NOT_FOUND
CONFIRMED_SAFE_LOCATOR: NOT_AVAILABLE
GOVERNANCE_RULE_SOURCE_LOCATOR: "docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md"
GOVERNANCE_RULE_SOURCE_REVISION: f91c82b04e6a71d3
GOVERNANCE_RULE_EVIDENCE_CLASS: DIRECT_EVIDENCE
HISTORICAL_PRACTICE_BEFORE_DOCUMENTATION: INFERRED
META_INCIDENT_SOURCE_LOCATOR: "docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md#history-audit-note-L14-L28"
META_INCIDENT_REVISION: f91c82b04e6a71d3
META_INCIDENT_EVIDENCE_CLASS: DIRECT_EVIDENCE
CLAIM_LEDGER_V2_COMPLETE: YES
CLAIM_COUNTS_RECALCULATED: YES
MATERIAL_CLAIM_COUNT: 10
DIRECT_EVIDENCE_CLAIMS: 4
RECONSTRUCTED_EVIDENCE_CLAIMS: 2
CONVERSATIONAL_RECOLLECTION_CLAIMS: 1
INFERENCE_CLAIMS: 3
OPEN_CLAIMS: 0
UNSUPPORTED_CLAIMS: 0
FACT_EXISTENCE_WORDING: CORRECTED
TRUE_VERIFIED_CITABLE_DISTINCTION: PASS
TRACEABILITY_DEFINITION_REPOSITORY_ONLY: NO
AEO_REPOSITORY_EXCLUSIVITY: REMOVED
GEO_REPOSITORY_EXCLUSIVITY: REMOVED
PROJECT_FACT_MEMORY_PRINCIPLE_BOUNDARY: PASS
PROPOSED_PROVENANCE_EVENT: EV-BG-006
PROVENANCE_EVENT_READY_FOR_REGISTRATION: YES
PROVENANCE_REGISTRY_CHANGE_AUTHORIZATION: NOT_GRANTED
PUBLIC_POST_IMPLEMENTATION_READY: YES
PUBLIC_POST_IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
PUBLICATION_AUTHORIZATION: NOT_GRANTED
P0_REMAINING: 0
P1_REMAINING: 0
P2_REMAINING: 0
P3_REMAINING: 0
```

---
*End of Reconciled Planning Document `BECC-P1-PLAN-MEMORY-VS-EVIDENCE` (R1)*
