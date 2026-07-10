# BECC Operational Metrics Framework — OS-3: Kennzahlen-System

Dieses Dokument definiert das offizielle **Kennzahlen-System (Operational Metrics Framework)** für die **BridGenta Engineering Communication Constitution (BECC)**. Es regelt, wie die operative Leistungsfähigkeit, die Konformitätsgüte und die Governance-Reife des Frameworks gemessen, interpretiert und zur Steuerung der Framework-Evolution eingesetzt werden.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Stewardship-Dokument** zur Festlegung von Mess- und Governance-Indikatoren. Es berechnet keine aktiven Kennzahlen und ändert die in BECC v1.0 GA verankerten inhaltlichen Standards nicht.

---

## 1. Zweck & Kontext (Purpose & Context)

Das Kennzahlen-System überführt qualitative Beobachtungen aus dem Audit-Betrieb in messbare, objektive Steuerungsindikatoren.
*   **Nutzen für die Governance**: Entscheidungen über die Weiterentwicklung der BECC (z. B. Wartungsreleases oder Verfassungsänderungen) werden auf eine empirische, datengestützte Basis gestellt.
*   **Abgrenzung**: Die Kennzahlen dienen der Überwachung des Framework-Reifegrads und nicht dem Leistungsvergleich (Performance Ranking) einzelner Autoren oder Entwickler.

---

## 2. Messgrundsätze (Measurement Principles)

Jede Messung und Interpretation von Kennzahlen unterliegt den folgenden Prinzipien:
*   **Evidenzbasierte Messung**: Nur verifizierte, in den offiziellen Dokumenten (z. B. Ledger) protokollierte Daten dürfen einfließen.
*   **Wiederholbarkeit (Repeatability)**: Die Berechnungsmethode muss deterministisch sein.
*   **Rückverfolgbarkeit (Traceability)**: Jede aggregierte Kennzahl muss bis auf den zugrundeliegenden Bucheintrag oder Befund zurückführbar sein.
*   **Konsistenz**: Die Definitionen und Berechnungen bleiben über alle Messperioden hinweg identisch.
*   **Transparenz**: Alle Berechnungsformeln und Quelldaten sind für alle Stakeholder offenlegbar.
*   **Operative Neutralität**: Kennzahlen messen Fakten wertungsfrei. Sie dienen als Diskussionsgrundlage, nicht als automatischer Auslöser für Disziplinarmaßnahmen.
*   **Historischer Vergleich**: Die Kennzahlen müssen den Vergleich von Trends über Monate und Jahre hinweg ermöglichen.

---

## 3. Kennzahlen-Kategorien (Metric Categories)

Das Kennzahlen-System gliedert sich in fünf komplementäre Kategorien:

### A. Prüfungs-Kennzahlen (Assessment Metrics)
Messen die quantitative Nutzung und Durchsatzleistung des BECC-Audit-Prozesses.
*   *Beispiele*: Anzahl durchgeführter Prüfungen (Gesamt, Aktiv, Geschlossen), Abschlussquote (Completion Rate), durchschnittliche Prüfungsdauer.

### B. Konformitäts-Kennzahlen (Compliance Metrics)
Messen den inhaltlichen Reifegrad und die Qualität der geprüften technischen Dokumente.
*   *Beispiele*: Konformitätsrate (Overall Compliance Rate), durchschnittlicher Konformitätswert, Anzahl Befunde pro Audit, Behebungsquote (Improvement Rate), Wiederholungsfehler (Repeat Findings).

### C. Governance-Kennzahlen (Governance Metrics)
Messen die Effektivität und Strukturstärke der Behebungssteuerung.
*   *Beispiele*: Anzahl technischer Entscheidungen (EDR-Volumen), Akzeptanzquote (Accepted vs. Rejected Decisions), Anzahl Wartungs- oder Änderungsanträge.

### D. Operative Prozess-Kennzahlen (Operational Metrics)
Messen die Integrität und Konsistenz des Prüfungsverfahrens selbst.
*   *Beispiele*: Konsistenzquote (Reviewer Consistency), Rückverfolgbarkeitsquote (Traceability Completeness), Nachweisvollständigkeit, Verifikationsquote.

### E. Repository- & Integrations-Kennzahlen (Repository Metrics)
Messen die technische Stabilität der Dokumentenintegration in die Codebase.
*   *Beispiele*: Erfolgsquote der statischen Dokumentenprüfung (Linter Pass Rate), Link-Integritätsrate, CI/CD-Bestehensquote für Dokumenten-PRs.

---

## 4. Standard zur Definition von Kennzahlen (Metric Definition Standard)

Jede offizielle BECC-Kennzahl muss zwingend nach der folgenden Struktur definiert sein:

```text
+-------------------------------------------------------------------------+
| Kennzahlen-Name (Metric Name)                                           |
+-------------------------------------------------------------------------+
| Kennzahlen-ID (Identifier):   MET-[Kategorie]-[Nummer] (z.B. MET-ASM-01)  |
| Zweck (Purpose):              Ziel und Nutzen der Kennzahl              |
| Beschreibung (Description):   Inhaltliche Definition                    |
| Datenquelle (Data Source):    Erforderliche Quelldokumente              |
| Berechnungsmethode:           Mathematische Formel / Logik              |
| Messintervall (Frequency):    Wie oft wird gemessen (z.B. per Audit)    |
| Interpretation:               Bedeutung hoher/niedriger Werte           |
| Governance-Nutzung:           Steuerungswirkung im Stewardship          |
+-------------------------------------------------------------------------+
```

### Spezifikation ausgewählter Schlüsselkennzahlen:

#### MET-ASM-01: Durchschnittliche Audit-Dauer (Average Assessment Duration)
*   **Zweck**: Überwachung der Effizienz und Usability des Audit-Prozesses.
*   **Beschreibung**: Die durchschnittliche Kalenderzeit vom offiziellen Start (Authorized) bis zum Abschluss der Verifikation (Validated).
*   **Datenquelle**: Assessment Ledger (`BECC-ASSESSMENT-LEDGER.md`).
*   **Berechnungsmethode**: `Summe(Completion Date - Start Date) / Anzahl geschlossene Audits`
*   **Messintervall**: Vierteljährlich (Quarterly).
*   **Interpretation**: Eine steigende Dauer deutet auf unklare Prüffragen oder zähe Behebungszyklen hin.
*   **Governance-Nutzung**: Identifikation von Lücken in den Leitfäden; Anlass zur Prozessoptimierung.

#### MET-CMP-01: Konformitätsrate (Overall Compliance Rate)
*   **Zweck**: Messung der Dokumentenqualität im gesamten Portfolio.
*   **Beschreibung**: Anteil der vollständig konformen Kapitel (Compliant) an der Gesamtzahl der anwendbaren Kapitel der Matrix.
*   **Datenquelle**: Compliance Assessments (`PILOT-1-COMPLIANCE-ASSESSMENT.md` etc.).
*   **Berechnungsmethode**: `(Anzahl Compliant Kapitel) / (Gesamtzahl anwendbare Kapitel - Not Applicable Kapitel) * 100`
*   **Messintervall**: Per Audit.
*   **Interpretation**: Hohe Werte belegen eine sehr gute Einhaltung der BECC-Standards vor oder nach der Behebung.
*   **Governance-Nutzung**: Nachweis des Qualitätsgewinns (Delta-Messung) im Post-Assessment.

#### MET-GOV-01: Entscheidungs-Akzeptanzquote (Decision Acceptance Rate)
*   **Zweck**: Prüfung der fachlichen Qualität der erhobenen Befunde.
*   **Beschreibung**: Anteil der im Engineering Decision Review (EDR) akzeptierten Befunde an der Gesamtzahl der eingereichten Befunde.
*   **Datenquelle**: EDR-Berichte (`PILOT-1-ENGINEERING-DECISION-REVIEW.md` etc.).
*   **Berechnungsmethode**: `(Anzahl EDRs mit Status Accept) / (Gesamtzahl geprüfte Befunde) * 100`
*   **Messintervall**: Vierteljährlich.
*   **Interpretation**: Niedrige Quoten (< 80%) deuten auf Fehlinterpretationen der Reviewer hin (falsch-positive Befunde).
*   **Governance-Nutzung**: Schulungsbedarf für Reviewer; Überarbeitung unklarer Prüffragen.

#### MET-OPR-01: Rückverfolgbarkeits-Abdeckung (Traceability Completeness)
*   **Zweck**: Sicherung der Governance-Integrität.
*   **Beschreibung**: Anteil der im Implementierungs-Trace-Report dokumentierten Änderungen, die eine lückenlose ID-Kette aufweisen.
*   **Datenquelle**: Trace-Reports (`PILOT-1-IMPLEMENTATION-TRACE-REPORT.md` etc.).
*   **Berechnungsmethode**: `(Änderungen mit vollständiger Kette) / (Gesamtzahl Änderungen) * 100`
*   **Messintervall**: Per Audit.
*   **Interpretation**: Muss im regulären Betrieb zwingend 100% betragen.
*   **Governance-Nutzung**: Ein Wert unter 100% blockiert die Audit-Schließung.

---

## 5. Schwellenwerte & Status-Modell (Metric Thresholds)

Zur schnellen Bewertung des operativen Framework-Zustands gelten folgende Ampelstufen:

*   **Grün (Healthy)**: Alle Kernkennzahlen liegen im Zielbereich. Der Audit-Betrieb läuft reibungslos. Keine Stewardship-Maßnahmen erforderlich.
*   **Gelb (Monitor)**: Leichte Abweichungen in den Prozesskennzahlen (z. B. Audit-Dauer steigt). Systematische Beobachtung im nächsten Quartalsbericht.
*   **Orange (Attention Required)**: Deutliche Qualitätseinbußen (z. B. sinkende Akzeptanzquoten, steigende Fehlerzahlen). Der *Constitutional Architect* muss eine Analyse einleiten.
*   **Rot (Critical)**: Schwere Prozessmängel (z. B. unvollständige Traceability, hohe Fehlerraten im CI-Build). Sofortiger Stopp neuer Audits; Behebungsplan für das Framework erforderlich.

*Diese Schwellenwerte dienen als Frühwarnsystem für die Stewardship-Verantwortlichen und lösen keine automatischen Änderungen an der Verfassung aus.*

---

## 6. Zugelassene Datenquellen (Approved Data Sources)

Für die Ermittlung von Kennzahlen are ausschließlich die folgenden formellen Dokumente zugelassen:
1.  **Zentrales Bewertungsbuch** (`BECC-ASSESSMENT-LEDGER.md`)
2.  **Konformitätsberichte** (`PILOT-1-COMPLIANCE-ASSESSMENT.md` etc.)
3.  **Befundregister** (`PILOT-1-FINDINGS-REGISTER.md` etc.)
4.  **Entscheidungsberichte** (`PILOT-1-ENGINEERING-DECISION-REVIEW.md` etc.)
5.  **Behebungsspezifikationen** (`PILOT-1-CONTROLLED-REMEDIATION-SPECIFICATION.md` etc.)
6.  **Trace-Reports** (`PILOT-1-IMPLEMENTATION-TRACE-REPORT.md` etc.)
7.  **CI/CD-Build-Logs** (GitHub Actions Läufe für Dokumenten-PRs)

---

## 7. Operative Berichterstattung (Reporting Model)

Die Aggregation und Präsentation der Kennzahlen erfolgt in festgelegten Zyklen:
*   **Per Audit**: Bereitstellung der direkten Audit-Kennzahlen (Konformitätsrate, Behebungsdauer, Traceability) im jeweiligen Abschlussbericht.
*   **Quartalsweise (Quarterly)**: Konsolidierter Bericht über alle Audits des Quartals zur Erkennung kurzfristiger Trends.
*   **Jährlich (Annual Stewardship Review)**: Umfassender Jahresbericht als Grundlage für die Weiterentwicklung des Frameworks.

---

## 8. Anwendung im Stewardship (Stewardship Usage)

*   **Betriebliche Reviews**: Kennzahlen bilden das sachliche Fundament für Prozessanpassungen.
*   **Wartung & Evolution**: Zeigen Kennzahlen wiederholt Schwachstellen in bestimmten Sektionen auf (z. B. hohe Durchfallquote bei `MAT-008`), initiiert dies gezielte Wartungsreleases (z. B. präzisierte Templates) oder Minor-Versionen.
*   **Entscheidungsunterstützung**: Kennzahlen ersetzen nicht das menschliche Urteil des *Constitutional Architect*, sondern unterstützen die Argumentation.

---

## 9. Regeln zur Erweiterung des Kennzahlen-Systems (Future Expansion)

Das Hinzufügen neuer Kennzahlen ist strikt reglementiert:
1.  **Operative Begründung**: Es muss nachgewiesen werden, welche Governance-Lücke die neue Kennzahl schließt.
2.  **Messbarkeit**: Die Kennzahl muss auf den zugelassenen Datenquellen basieren und mathematisch eindeutig formuliert sein.
3.  **Genehmigung**: Die Aufnahme erfordert die Freigabe des *Project Owner* und des *Constitutional Architect* im Rahmen eines Minor-Releases.
4.  **Keine Ad-Hoc-Messungen**: Die Nutzung inoffizieller Kennzahlen in Stewardship-Berichten ist untersagt.

---

## 10. Beziehungen im Stewardship-Ökosystem (Relationships)

Das Kennzahlen-System verbindet die Stewardship-Elemente zu einem geschlossenen Regelkreis:

```text
   Richtlinie (Policy, OS-1) ──► Regelt den Betrieb
        │
        ▼
   Bewertungsbuch (Ledger, OS-2) ──► Liefert die Rohdaten
        │
        ▼
   Kennzahlen-System (Metrics, OS-3) ──► Aggregiert Indikatoren
        │
        ▼
   Wartungsrichtlinie (Maintenance, OS-4) ──► Steuert Verbesserungen
```

---

## 11. Kennzahlen-Erklärung (Metrics Declaration)

Die Verfassungsverwaltung deklariert hiermit:
*   Das BECC-Kennzahlen-System (Operational Metrics Framework) ist die **autoritative Governance-Referenz** zur Messung der Betriebsgüte des Frameworks.
*   Zukünftige Stewardship-Berichte und Freigabeentscheidungen müssen die in diesem Dokument definierten Messmodelle als Standard verwenden.

---

[Zurück zur BECC-Übersicht](../README.md)
