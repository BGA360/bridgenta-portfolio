# BECC Operational Stewardship Policy — OS-1: Richtlinie zur Betriebsverwaltung

Dieses Dokument definiert die offizielle **Richtlinie zur Betriebsverwaltung (Operational Stewardship Policy)** für die **BridGenta Engineering Communication Constitution (BECC)**. Sie regelt den langfristigen Betrieb, die Qualitätssicherung, die Pflege und die kontrollierte Weiterentwicklung des Frameworks nach erfolgreicher operativer Validierung (Operational Validation).

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **konstitutionelles Stewardship-Dokument** zur Festlegung operativer Governance-Regeln. Es definiert die Prozesse zur Verwaltung des Frameworks und ändert die in BECC v1.0 GA verankerten inhaltlichen Standards nicht.

---

## 1. Zweck & Geltungsbereich (Purpose & Scope)

Die Operational Stewardship Policy etabliert die Governance-Regeln für die BECC nach deren Übergang aus der Entwicklungsphase in den regulären Betrieb. Sie stellt sicher, dass das Framework im gesamten BridGenta-Ökosystem einheitlich, kontrolliert und qualitätsgesichert angewendet wird.

### Abgrenzung der Lebenszyklus-Phasen:
1.  **Constitutional Engineering (Verfassungskonstruktion)**: 
    Die Entwurfs- und Spezifikationsphase, in der die Kernnormen und Kommunikationsprinzipien der BECC v1.0 entwickelt wurden.
2.  **Release Engineering (Freigabeverwaltung)**: 
    Die Konsolidierung, Paketierung und Erklärung der Verfassungsversionen bis zur General Availability (GA).
3.  **Operational Validation (Operative Validierung)**: 
    Die praktische Überprüfung der Usabilität und Reproduzierbarkeit unter realen Bedingungen anhand eines abgeschlossenen Pilotprojekts (Pilot 1).
4.  **Operational Stewardship (Betriebsverwaltung)**: 
    Die langfristige Steuerung, Überwachung und evolutionäre Pflege des Frameworks im Produktivbetrieb.

---

## 2. Grundsätze der Betriebsverwaltung (Stewardship Principles)

Jede zukünftige Aktivität im Rahmen des Framework-Betriebs muss sich an den folgenden permanenten Grundsätzen ausrichten:

*   **Verfassungsmäßige Stabilität (Constitutional Stability)**: Die Kernnormen und Kommunikationsstandards der BECC v1.0 GA bleiben geschützt. Änderungen werden nur bei nachgewiesenem operativen Bedarf vorgenommen.
*   **Faktenbasierte Belege vor Änderung (Evidence Before Change)**: Keine Modifikationen an Prozessen oder Matrizen ohne dokumentierten empirischen Beleg aus echten Reviews.
*   **Governance vor Umsetzung (Governance Before Implementation)**: Jede operative Änderung muss den vollständigen Freigabezyklus durchlaufen, bevor sie im Repository ausgeführt wird.
*   **Lückenlose Traceability (Rückverfolgbarkeit)**: Sämtliche Änderungen an Dokumenten oder Systemen müssen bis zur ursprünglichen Motivation (z. B. Audit-Finding oder EDR) zurückverfolgbar sein.
*   **Wiederholbarkeit (Repeatability)**: Die Bewertungsverfahren müssen so gestaltet sein, dass verschiedene Reviewer unabhängig voneinander zu denselben Ergebnissen gelangen.
*   **Kontrollierte Evolution (Controlled Evolution)**: Die Weiterentwicklung erfolgt strukturiert über definierte Wartungs- und Versionsfreigaben.
*   **Operative Integrität (Operational Integrity)**: Der laufende Betrieb von Dokumentationsprüfungen darf durch Stewardship-Aktivitäten nicht gestört werden.
*   **Langfristige Wartbarkeit (Long-Term Maintainability)**: Das Dokumenten-Ökosystem ist so zu pflegen, dass es auch bei wachsender Dokumentenzahl einfach zu auditieren bleibt.

---

## 3. Operative Governance (Operational Governance)

Die Governance nach der erfolgreichen Validierung stellt sicher, dass die application der BECC festen Regeln folgt:
*   **Hierarchie**: Der Project Owner hält die oberste Entscheidungs- und Freigabeautorität. Der Constitutional Architect leitet die technische Ausrichtung.
*   **Entscheidungskompetenz**: Abweichungen von den Standardprüfverfahren sind unzulässig. Jede Modifikation an der Bewertungsmatrix erfordert eine formelle Freigabe der Verfassungsverwaltung.
*   **Geltungsbereich der Verwaltung**: Die Betriebsverwaltung regelt ausschließlich den Betrieb und die Anpassung von operativen Hilfsmitteln (Methoden, Matrizen, Templates) und keine grundlegende inhaltliche Neugestaltung der Verfassungsprinzipien.

---

## 4. Operative Rollen & Verantwortlichkeiten (Operational Roles)

Die Aufgaben im Rahmen der Betriebsverwaltung verteilen sich auf folgende Rollen:

### Project Owner (Projektinhaber)
*   **Aufgaben**: Freigabe von Behebungsplänen, Autorisierung von Audits, Gesamtsteuerung des Prozesses.
*   **Kompetenzen**: Veto-Recht bei allen Änderungen, Letztentscheidungsrecht bei der Release-Freigabe.
*   **Freigaberechte**: Formeller Abschluss von Audits und Freigabe von Verfassungsänderungen.

### Constitutional Architect (Verfassungsarchitekt)
*   **Aufgaben**: Fachliche Auslegung der BECC-Normen, Beratung bei Abweichungen, Steuerung der Stewardship-Aktivitäten.
*   **Kompetenzen**: Formulierung von Behebungsrichtlinien, technische Leitung des Review-Prozesses.
*   **Freigaberechte**: Technische Freigabe von Wartungsreleases und Versionsentwürfen.

### Operational Reviewer (Operativer Prüfer)
*   **Aufgaben**: Durchführung der Konformitätsprüfungen (Compliance Assessments) anhand der Matrix, Erhebung von Textbelegen, Erstellung von Befundberichten.
*   **Kompetenzen**: Unabhängige Bewertung der Textkonformität (Ja/Nein/Teilweise).
*   **Freigaberechte**: Unterzeichnung und Einreichung der Compliance Assessments.

### Implementer (Umsetzer)
*   **Aufgaben**: Durchführung der kontrollierten Behebungen (Remediation) am Ziel-Artefakt gemäß Spezifikation.
*   **Kompetenzen**: Modifikation des Ziel-Textes innerhalb des freigegebenen Scopes.
*   **Freigaberechte**: Erstellung und Dokumentation des Trace-Reports.

---

## 5. Bewertungsgovernance (Assessment Governance)

Jede offizielle Konformitätsprüfung muss feste Phasen durchlaufen:
1.  **Voraussetzungen**: Vorliegen einer definierten Baseline (Dokumentenversion und Commit eingefroren).
2.  **Autorisierung**: Der Project Owner erteilt die formelle Prüffreigabe.
3.  **Lebenszyklus**: Der Ablauf folgt der offiziellen Methodik (Assessment -> Findings Register -> EDR -> Remediation Spec -> Execution -> Post-Assessment).
4.  **Abschluss & Archivierung**: Nach erfolgreichem Post-Assessment wird die Prüfung durch den Project Owner geschlossen und permanent protokolliert.
5.  **Assessment Ledger**: Jedes geschlossene Audit wird im zentralen **Assessment Ledger (Bewertungsbuch)** chronological registriert.

---

## 6. Operative Nachweise & Protokollierung (Operational Records)

*   **Revisionssicherheit**: Alle erzeugten Assessments, Befundregister und EDRs müssen permanent im Repository im Ordner `stewardship/pilots/` oder einem entsprechenden Archivordner abgelegt werden.
*   **Aufbewahrungsfrist**: Sämtliche Belege und Commit-Referenzen sind über die gesamte Lebensdauer des Projekts aufzubewahren.
*   **Identifikatoren**: Audits müssen eindeutige Kennungen erhalten (z. B. `BECC-PILOT-001`), um Verwechselungen auszuschließen.
*   **Prüfprotokolle (Auditability)**: Der Verlauf eines Dokuments muss für externe Auditoren jederzeit lückenlos nachvollziehbar sein.

---

## 7. Verwaltung operativer Erkenntnisse (Operational Guidance Management)

Erkenntnisse, Usability-Probleme oder Lücken in den Leitfäden, die von Reviewern oder Implementern gemeldet werden, unterliegen folgenden Regeln:
*   **Erfassung**: Meldungen werden im Rahmen der Lektionen (Lessons Learned) erfasst und dokumentiert.
*   **Keine automatische Änderung**: Ein identifiziertes Problem führt nicht zur ad hoc Modifikation der BECC.
*   **Sewardship-Input**: Die Erkenntnisse werden gesammelt und dienen als offizielle Eingabe (Input) für das jährliche Review zur Framework-Weiterentwicklung.

---

## 8. Wartungsgovernance (Maintenance Governance)

Wartungsreleases (Maintenance Releases) dienen der Fehlerbehebung und kosmetischen Optimierung des Framework-Betriebs.
*   **Zulässige Änderungen**: Korrektur von Tippfehlern, Behebung von Linkfehlern (Broken References), Formatierungsfehler, Aktualisierung von Beispielen oder Markdown-Templates.
*   **Ausschluss**: Es dürfen keine neuen Kommunikationsstandards eingeführt oder bestehende Bewertungsfragen inhaltlich verschärft werden.
*   **Prozess**: Einreichung als Pull Request, Review durch den Constitutional Architect, Freigabe durch den Project Owner.

---

## 9. Governance von Verfassungsänderungen (Constitutional Amendment Governance)

Inhaltliche Änderungen an der BECC (z. B. neue Standards oder veränderte Matrix-Fragen) unterliegen strengen Hürden:
*   **Nachweis-Schwellenwert**: Ein Änderungsbedarf muss durch mindestens einen operativen Review-Lauf empirisch begründet sein (z. B. nachgewiesene Unklarheit in einer Prüffrage oder fehlender Standard für einen neuen Dokumententyp).
*   **Antragstellung**: Entwurf eines formellen Änderungsantrags (Amendment Proposal) durch den Constitutional Architect.
*   **Freigabe**: Einstimmige Genehmigung durch Project Owner und Constitutional Architect nach erfolgreichem Review-Durchlauf.

---

## 10. Versionsgovernance (Version Governance)

Die Weiterentwicklung der BECC folgt einer klaren Versionshierarchie:

1.  **Maintenance Release (Wartungs-Release)**:
    *   *Schema*: `v1.0.1`, `v1.0.2` etc.
    *   *Inhalt*: Fehlerkorrekturen, Linkkorrekturen, redaktionelle Klarstellungen.
    *   *Genehmigung*: Project Owner & Constitutional Architect.
2.  **Minor Version (Unterversion)**:
    *   *Schema*: `v1.1`, `v1.2` etc.
    *   *Inhalt*: Neue Templates, optionale Leitfäden, Erweiterungen der Matrix um neue Dokumententypen.
    *   *Genehmigung*: Formeller Stewardship-Entscheid.
3.  **Major Version (Hauptversion)**:
    *   *Schema*: `v2.0`, `v3.0` etc.
    *   *Inhalt*: Grundlegende Überarbeitung der Verfassungsgrundsätze, Einführung neuer Kernstandards.
    *   *Genehmigung*: Vollständiges Review- und Validierungsverfahren.

---

## 11. Jährliche Betriebsüberprüfung (Annual Stewardship Review)

Einmal jährlich findet eine formelle Überprüfung des Frameworks statt:
*   **Turnus**: Jährlich (12-Monats-Intervall).
*   **Teilnehmer**: Project Owner, Constitutional Architect, repräsentative Reviewer.
*   **Eingaben (Inputs)**: Assessment Ledger, erfasste Guidance Gaps, Lessons Learned aus durchgeführten Audits, Fehlermeldungen.
*   **Ergebnisse (Outputs)**: Jährlicher Stewardship-Bericht, Freigabe von Wartungsreleases, Pflege-Roadmap.
*   **Entscheidungsbefugnis**: Der Project Owner entscheidet über die Umsetzung der empfohlenen Maßnahmen.

---

## 12. Operativer Lebenszyklus (Operational Lifecycle)

Der permanente Ablauf für alle zukünftigen BECC-Aktivitäten ist im folgenden Prozessdiagramm festgeschrieben:

```text
       Prüfanforderung (Assessment Request)
                      │
                      ▼
     Prüfungsautorisierung (Authorization)
                      │
                      ▼
       Prüfungsdurchführung (Execution)
                      │
                      ▼
          Nachweiserhebung (Evidence)
                      │
                      ▼
        Technische Befunde (Findings)
                      │
                      ▼
      Technische Entscheidungen (EDR)
                      │
                      ▼
       Gesteuerte Behebung (Remediation)
                      │
                      ▼
           Verifikation (Verification)
                      │
                      ▼
      Bewertungsabschluss (Assessment Closure)
                      │
                      ▼
         Assessment Ledger (Registrierung)
                      │
                      ▼
      Operative Metriken (Operational Metrics)
                      │
                      ▼
      Jährliche Überprüfung (Annual Review)
                      │
                      ▼
       Versionsplanung (Version Planning)
```

---

## 13. Stewardship-Erklärung (Stewardship Declaration)

Mit dem Inkrafttreten dieser Richtlinie deklariert die Verfassungsverwaltung:
*   Die BECC v1.0 GA hat ihre operative Validierung erfolgreich abgeschlossen und befindet sich im **Betriebszustand (Operational Stewardship)**.
*   Die inhaltliche und strukturelle Integrität des Frameworks ist geschützt und darf nur über die in dieser Richtlinie definierten, kontrollierten Abläufe verändert werden.
*   Empirische Belege aus dem realen Review-Betrieb bilden das fundamentale Fundament für jede zukünftige Evolution des Regelwerks.

---

[Zurück zur BECC-Übersicht](../README.md)
