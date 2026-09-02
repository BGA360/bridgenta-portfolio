# Public Post Evidence & Provenance Planning
## "Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit"

*   **Dokument-ID:** `BECC-P1-PLAN-MEMORY-VS-EVIDENCE`
*   **Arbeitstitel:** Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit
*   **Ziel-Kategorie:** `ai-entwicklung`
*   **Ziel-Lernniveau:** `public`
*   **Ziel-Status:** `draft`
*   **Phase:** `C4.3-P1-R3 — Claim-Class Mapping & Ephemeral-Locator Final Closure`
*   **Vorheriger Merge-Commit (PR #257):** `06b1f2b9303301a07553fb84b23e741d63fd001b`
*   **PR #258 R2 HEAD:** `cfc443ab73efe37931afee2797e949382aaa60c2`
*   **Autorität:** Project Owner / Constitutional Architect

---

## 1. Purpose (Zweck)

Diese Planungsanalyse bereitet den nächsten öffentlichen BridGenta-Lernartikel (*Public Post*) auf Basis eines realen Software-Entwicklungsereignisses vor. 

Die primäre Aufgabe dieser Phase C4.3-P1-R3 ist **ausschließlich die finale Harmonisierung von Claim-Klassen, Normierung der Kanon-Taxonomie und Entkopplung flüchtiger Gesprächs-Locators von dauerhaften Quellen**. Es erfolgt in dieser Phase **keine Artikelerstellung**, keine Veröffentlichung und keine Anpassung von kanonischen Standards oder Baselines.

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

*(Historischer Stand aus PR #257)*

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
* **Klassifizierung:** Governance-Entwurf = `DIRECT_EVIDENCE`; Frühere Praxis = `RECONSTRUCTED_EVIDENCE`
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

Kanonische Nachweis-Klassen: `DIRECT_EVIDENCE`, `RECONSTRUCTED_EVIDENCE`, `CONVERSATIONAL_RECOLLECTION`, `INFERENCE`, `SPECIFICATION`, `OPEN`, `UNSUPPORTED`.

---

## 12. Claim Ledger (Historisches P1-Register)

*(Historischer Stand aus PR #257)*

---

## 13. Evidence Gaps (Evidenzlücken-Register)

```yaml
BLOCKING_EVIDENCE_GAPS: 0
NON_BLOCKING_EVIDENCE_GAPS: 1
```

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

Die Didaktik folgt strikt der Sequenz **VERSTEHEN → BENENNEN → BELEGEN → ANWENDEN**.

---

## 18. SEO / AEO / GEO Plan (Historisch)

---

## 19. AEO Answer Units (Historisch)

---

## 20. GEO Citation Units (Historisch)

---

## 21. Terminology Plan (Terminologie-Plan)

* **Kandidaten-Begriff:** `Beleg-Rückverfolgbarkeit`
* **Status:** `TERM_STATUS: ACCEPTABLE_NEW_PUBLIC_TERM`

---

## 22. Practical Lessons Plan (Praktische Regeln)

---

## 23. Glossary Plan (Glossar-Plan)

---

## 24. Provenance Event Decision (Historisch)

---

## 25. Publication Readiness Decision (Historisch P1)

---

## R1 — Durable Source Locator & Evidence Definition Reconciliation (Historisch)

---

## R2 — Source-Identity, Audit-Locator & Claim-Count Deterministic Closure (Historisch)

---

# ## R3 — Claim-Class Mapping & Ephemeral-Locator Final Closure

**Status der Überarbeitung:** `APPROVED / RECONCILED / CANONICAL_CLOSURE`
**Datum der Überarbeitung:** 2026-09-02
**Ziel:** Auflösung von R3-01 (Kanonische Normierung von CLM-01 und Claim-Klassen) und R3-02 (Entkopplung flüchtiger Gesprächs-Locators von dauerhaften Quellen-Feldern).

---

### 26. CLM-01 Final Evidence Class Decision & Justification (R3-01)

In früheren Entwürfen existierte eine Diskrepanz zwischen dem Ledger (`INFERRED`) und der Auszähltabelle (`RECONSTRUCTED_EVIDENCE`).

Die systematische Prüfung der Evidenzgrundlage von **CLM-01** (*„Eine Governance-Regel wurde vor ihrer Dokumentation in der Praxis gelebt“*) führt zu folgender Entscheidung:

```yaml
CLM_01_FINAL_EVIDENCE_CLASS: RECONSTRUCTED_EVIDENCE
CLM_01_CLASS_JUSTIFICATION: >
  Dauerhafte Git-Commit-Historiendiffs (SRC-01-V4: commits/diff-staging-batch-04.patch,
  Commit e7f81a9c3d4e) rekonstruieren direkt das wiederholte historische Muster
  selektiven Datei-Stagings in der Praxis vor der schriftlichen Verankerung der Policy.
```

---

### 27. Source Inventory v4 (Strict Durability & Ephemeral Separation) (R3-02)

Das Quellen-Schema wurde erweitert, um flüchtige Gesprächs-Referenzen strikt von dauerhaften Repository-Locators zu trennen:

| Source ID | Source Project | System | Durable Locator | Conversational / Ephemeral Locator | Revision | Durability | Local Availability | Remote Availability | Evidence Class | Supports Claims |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SRC-01-V4** | `bridgenta-wp-broker-ops` | Git | `commits/diff-staging-batch-04.patch` | `NOT_APPLICABLE` | `e7f81a9c3d4e2b01` | `DURABLE` | `AVAILABLE_LOCAL` | `NOT_AVAILABLE` | `RECONSTRUCTED_EVIDENCE` | CLM-01, CLM-03 |
| **SRC-02-V4** | `bridgenta-wp-broker-ops` | Git | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` | `NOT_APPLICABLE` | `f91c82b04e6a71d3` | `DURABLE` | `AVAILABLE_LOCAL` | `NOT_AVAILABLE` | `DIRECT_EVIDENCE` | CLM-02, CLM-07 |
| **SRC-03-V4** | `bridgenta-wp-broker-ops` | Git/CI/Logs | `NOT_AVAILABLE` (0 Treffer bei SHA-256 Log-Suche) | `NOT_APPLICABLE` | `f91c82b04e6a71d3` | `DURABLE` | `NO_LOG_RECORD` | `NOT_AVAILABLE` | `CONVERSATIONAL_RECOLLECTION` | CLM-04 |
| **SRC-04-V4** | `bridgenta-wp-broker-ops` | Git | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` (History Audit Note) | `NOT_APPLICABLE` | `f91c82b04e6a71d3` | `DURABLE` | `AVAILABLE_LOCAL` | `NOT_AVAILABLE` | `DIRECT_EVIDENCE` | CLM-05, CLM-06, CLM-08 |
| **SRC-05-V4** | `bridgenta-wp-broker-ops` | Chat System | `NOT_AVAILABLE` | `session-logs/2026-08-staging-discussion.json` | `NOT_APPLICABLE` | `EPHEMERAL` | `EPHEMERAL` | `NOT_AVAILABLE` | `CONVERSATIONAL_RECOLLECTION` | CLM-04 |
| **SRC-06-V4** | `bridgenta-portfolio` | Git | `docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md` | `NOT_APPLICABLE` | `c09ac8e52e3f` | `DURABLE` | `AVAILABLE_LOCAL` | `AVAILABLE_REMOTE` | `SPECIFICATION` | CLM-09, CLM-10 |

```yaml
SOURCE_INVENTORY_V4_COMPLETE: YES
SRC_05_DURABLE_LOCATOR: NOT_AVAILABLE
SRC_05_CONVERSATIONAL_LOCATOR: session-logs/2026-08-staging-discussion.json
SRC_05_DURABILITY: EPHEMERAL
SRC_05_LOCAL_AVAILABILITY: EPHEMERAL
SRC_05_REMOTE_AVAILABILITY: NOT_AVAILABLE
SRC_05_EVIDENCE_CLASS: CONVERSATIONAL_RECOLLECTION
EPHEMERAL_SOURCE_IN_DURABLE_LOCATOR_FIELD: NO
```

---

### 28. Ephemeral Locator Semantics & CLM-04 Durability Confirmation

* **Flüchtige Natur:** `SRC-05-V4` ist eine temporäre Chat-Sitzung. Der Dateiname `session-logs/2026-08-staging-discussion.json` ist eine flüchtige Gespraechs-Referenz und **kein dauerhafter Repository-Beleg**.
* **CLM-04 Beleg-Status:** CLM-04 (*„Die KI erinnerte sich an eine spezifische Hash-Prüfung“*) stützt sich ausschließlich auf diese flüchtige Quelle (`SRC-05-V4`).
* **Klassifizierung:** Es existiert kein dauerhafter Beleg für die Hash-Prüfung.

```yaml
CLM_04_EVIDENCE_CLASS: CONVERSATIONAL_RECOLLECTION
CLM_04_DURABLE_EVIDENCE: NOT_AVAILABLE
```

---

### 29. Claim Ledger v4 (Normalized Canonical Vocabulary)

In Claim Ledger v4 werden ausnahmslos die strikten kanonischen Evidenz-Klassennamen verwendet. Shorthand-Aliase (wie `INFERRED` oder `RECONSTRUCTED`) wurden vollständig bereinigt.

| ID | Aussage | Evidenz-Klasse (Kanonisch) | Quell-ID | Dauerhafter Locator | Flüchtiger / Conversational Locator | Stärke | Öffentliche Formulierung | Verbotene Überhöhung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CLM-01** | Governance-Regel wurde vor Dokumentation gelebt. | `RECONSTRUCTED_EVIDENCE` | `SRC-01-V4` | `commits/diff-staging-batch-04.patch` | `N/A` | `MODERATE` | Ja (als gelebte Praxis gerahmt) | Behauptung eines früheren schriftlichen Regelwerks | CANONICAL_CLOSED |
| **CLM-02** | Anlass war das Fehlen eines zitierbaren Belegs. | `DIRECT_EVIDENCE` | `SRC-02-V4` | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` | `N/A` | `STRONG` | Ja (direkte Tatsache) | Behauptung, die Regel sei nie angewendet worden | CANONICAL_CLOSED |
| **CLM-03** | Breites Staging zog unbeteiligte Arbeiten mit ein. | `RECONSTRUCTED_EVIDENCE` | `SRC-01-V4` | `commits/e7f81a9c3d4e` | `N/A` | `MODERATE` | Ja (rekonstruierter Vorfall) | Erfindung exakter Dialog-Prompts oder CLI-Befehle | CANONICAL_CLOSED |
| **CLM-04** | KI erinnerte sich an spezifische Hash-Prüfung. | `CONVERSATIONAL_RECOLLECTION` | `SRC-05-V4` | `NOT_AVAILABLE` | `session-logs/2026-08-staging-discussion.json` | `WEAK` | Ja (explizit als KI-Erinnerung) | Darstellung der Prüfung als Projekttatsache | CANONICAL_CLOSED |
| **CLM-05** | Suche ergab keinen Beleg der Hash-Prüfung. | `DIRECT_EVIDENCE` | `SRC-04-V4` | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` (Audit Note) | `N/A` | `STRONG` | Ja (Suchergebnis belegt) | Behauptung, das Archiv sei gelöscht worden | CANONICAL_CLOSED |
| **CLM-06** | KI-Erinnerung wurde nicht als Beleg akzeptiert. | `DIRECT_EVIDENCE` | `SRC-04-V4` | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` (Audit Note) | `N/A` | `STRONG` | Ja (Entscheidung belegt) | Unterstellung böswilliger Halluzination | CANONICAL_CLOSED |
| **CLM-07** | Governance-Dokument verankerte Evidenz-Prinzip. | `DIRECT_EVIDENCE` | `SRC-02-V4` | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` | `N/A` | `STRONG` | Ja (Dokumenteninhalt) | Verallgemeinerung als globales Gesetz | CANONICAL_CLOSED |
| **CLM-08** | Dokument deckte eigenes Problem bei Erstellung auf. | `INFERENCE` | `SRC-04-V4` | `docs/governance/GOV-004-EXPLICIT-FILE-STAGING-POLICY.md` (Audit Note) | `N/A` | `MODERATE` | Ja (als Prozess-Erkenntnis) | Dramatisierende Übertreibung der Ursächlichkeit | CANONICAL_CLOSED |
| **CLM-09** | Reales Ereignis und Belegbarkeit sind verschieden. | `SPECIFICATION` | `SRC-06-V4` | `docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md` | `N/A` | `STRONG` | Ja (didaktisches Prinzip) | Gleichsetzung von „unbelegt“ mit „existiert nicht“ | CANONICAL_CLOSED |
| **CLM-10** | KI-Erinnerungen sind Hinweise, keine Belege. | `SPECIFICATION` | `SRC-06-V4` | `docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md` | `N/A` | `STRONG` | Ja (Kernbotschaft) | Absolute Ablehnung jeglicher KI-Unterstützung | CANONICAL_CLOSED |

```yaml
CLAIM_LEDGER_V4_COMPLETE: YES
NON_CANONICAL_EVIDENCE_CLASS_LABELS_IN_CURRENT_LEDGER: 0
```

---

### 30. Deterministic Claim Count Table v4 & Mapping Verification

Exakte Zuordnung der 10 Aussagen aus Claim Ledger v4 auf die 7 kanonischen Evidenz-Klassen:

| Kanonische Evidenz-Klasse | Aussagen-IDs | Anzahl |
| :--- | :--- | :---: |
| `DIRECT_EVIDENCE` | CLM-02, CLM-05, CLM-06, CLM-07 | 4 |
| `RECONSTRUCTED_EVIDENCE` | CLM-01, CLM-03 | 2 |
| `CONVERSATIONAL_RECOLLECTION` | CLM-04 | 1 |
| `INFERENCE` | CLM-08 | 1 |
| `SPECIFICATION` | CLM-09, CLM-10 | 2 |
| `OPEN` | *(keine)* | 0 |
| `UNSUPPORTED` | *(keine)* | 0 |
| **GESAMT (MATERIAL_CLAIM_COUNT)** | **CLM-01 bis CLM-10** | **10** |

$$\text{Summe} = 4 + 2 + 1 + 1 + 2 + 0 + 0 = 10$$

```yaml
CLAIM_COUNTS_RECALCULATED: YES
MATERIAL_CLAIM_COUNT: 10
DIRECT_EVIDENCE_CLAIMS: 4
RECONSTRUCTED_EVIDENCE_CLAIMS: 2
CONVERSATIONAL_RECOLLECTION_CLAIMS: 1
INFERENCE_CLAIMS: 1
SPECIFICATION_CLAIMS: 2
OPEN_CLAIMS: 0
UNSUPPORTED_CLAIMS: 0
CLAIM_COUNT_SUM: 10
CLAIM_COUNT_SUM_CHECK: PASS
CLAIM_CLASS_MAPPING_CHECK: PASS
```

---

### 31. Required Reconciliation Ledger (R3-Abgleichs-Register)

| Issue | Before (R2) | After (R3) | Evidence Basis | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CLM-01 Evidence Class** | Inkonsistenz (`INFERRED` in Ledger vs `RECONSTRUCTED` in Count) | Determiniert als `RECONSTRUCTED_EVIDENCE` | Git-Commit-Diffs (SRC-01-V4) rekonstruieren historische Staging-Praxis | RESOLVED |
| **Kanonische Vokabeln** | Mischung aus Aliases (`INFERRED`, `RECONSTRUCTED`) | 100 % kanonische Bezeichnungen in Ledger v4 | BECC-PLS-v1.0 Standard-Klassifikation | RESOLVED |
| **Claim Mapping Check** | Inkonsistent für CLM-01 | Exakte 1:1 Zuordnung zwischen Ledger v4 und Count Table v4 | Invariante `FOR_EVERY_CLAIM: LEDGER_CLASS == COUNT_TABLE_CLASS` | RESOLVED |
| **Claim Total Sum** | Invariant | Summen-Invariante $\sum = 4 + 2 + 1 + 1 + 2 + 0 + 0 = 10$ | Mathematische Invariante erfüllt (`PASS`) | RESOLVED |
| **SRC-05 Locator** | Ephemerer Pfad in `Durable Locator` Spalte | Spaltentrennung: `Durable Locator = NOT_AVAILABLE`, `Conversational Locator` belegt | Durability Semantics (`EPHEMERAL`) | RESOLVED |
| **CLM-04 Belegbarkeit** | Ambivalent | `CLM_04_DURABLE_EVIDENCE: NOT_AVAILABLE` | Nur flüchtige Chat-Memory vorhanden | RESOLVED |
| **Provenienz-Bereitschaft** | Bedingt | `PROVENANCE_EVENT_READY_FOR_REGISTRATION: YES` | Alle R3-Kriterien determiniert | RESOLVED |
| **Public Post Bereitschaft** | Hängend | `PUBLIC_POST_IMPLEMENTATION_READY: YES` | Provenienz-Abdeckung vollständig | RESOLVED |

---

### 32. Final R3 Publication & Provenance Readiness Decision

```yaml
CLM_01_FINAL_EVIDENCE_CLASS: RECONSTRUCTED_EVIDENCE
CLM_01_CLASS_JUSTIFICATION: "Git commit diffs (SRC-01-V4) reconstruct pre-documentation selective staging practice."
CLAIM_LEDGER_V4_COMPLETE: YES
NON_CANONICAL_EVIDENCE_CLASS_LABELS_IN_CURRENT_LEDGER: 0
SOURCE_INVENTORY_V4_COMPLETE: YES
SRC_05_DURABLE_LOCATOR: NOT_AVAILABLE
SRC_05_CONVERSATIONAL_LOCATOR: session-logs/2026-08-staging-discussion.json
SRC_05_DURABILITY: EPHEMERAL
SRC_05_LOCAL_AVAILABILITY: EPHEMERAL
SRC_05_REMOTE_AVAILABILITY: NOT_AVAILABLE
SRC_05_EVIDENCE_CLASS: CONVERSATIONAL_RECOLLECTION
EPHEMERAL_SOURCE_IN_DURABLE_LOCATOR_FIELD: NO
CLM_04_EVIDENCE_CLASS: CONVERSATIONAL_RECOLLECTION
CLM_04_DURABLE_EVIDENCE: NOT_AVAILABLE
HISTORICAL_MEANING_PRESERVED: YES
CURRENT_STATE_UNAMBIGUOUS: YES
DIRECT_EVIDENCE_CLAIMS_WITHOUT_DURABLE_LOCATOR: 0
DIRECT_EVIDENCE_CLAIMS_WITHOUT_AVAILABILITY_BOUNDARY: 0
MATERIAL_CLAIM_COUNT: 10
DIRECT_EVIDENCE_CLAIMS: 4
RECONSTRUCTED_EVIDENCE_CLAIMS: 2
CONVERSATIONAL_RECOLLECTION_CLAIMS: 1
INFERENCE_CLAIMS: 1
SPECIFICATION_CLAIMS: 2
OPEN_CLAIMS: 0
UNSUPPORTED_CLAIMS: 0
CLAIM_COUNT_SUM: 10
CLAIM_COUNT_SUM_CHECK: PASS
CLAIM_CLASS_MAPPING_CHECK: PASS
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
*End of Reconciled Planning Document `BECC-P1-PLAN-MEMORY-VS-EVIDENCE` (R3)*
