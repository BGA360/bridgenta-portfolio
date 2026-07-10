# BridGenta Engineering Communication Constitution (BECC) — Bewertungskonzept (Assessment Methodology)

Dieses Dokument definiert das offizielle **Bewertungskonzept (Assessment Methodology)** zur Durchführung von Konformitätsprüfungen technischer Dokumente gegen die **BridGenta Engineering Communication Constitution (BECC)**. Es stellt sicher, dass Reviews nach einem standardisierten, nachvollziehbaren und reproduzierbaren Verfahren ablaufen, um subjektive Einflüsse von Reviewern zu minimieren.

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **operatives Stewardship-Dokument** der Verfassungsverwaltung. Es dient als verfahrensrechtlicher Leitfaden und ändert oder erweitert die konstitutionellen Normen der BECC v1.0 nicht.

---

## 1. Bewertungsphilosophie (Assessment Philosophy)

Die technische Kommunikation bei BridGenta wird als **eigenständiges Engineering-Artefakt** verstanden. Daher unterliegt sie denselben Qualitätsmaßstäben und Prüfverfahren wie der Software-Code:
*   **Objektivität**: Bewertungen stützen sich ausschließlich auf überprüfbare Metriken und definierte Normen, nicht auf persönliche Stilpräferenzen des Reviewers.
*   **Evidenzbasierung**: Jeder Befund muss durch eine konkrete Textstelle, eine strukturelle Lücke oder einen Verstoß gegen Linter-Regeln belegt sein.
*   **Wiederholbarkeit (Repeatability)**: Verschiedene Reviewer müssen bei der Bewertung desselben Dokuments mit derselben Methodik zu identischen Ergebnissen gelangen.
*   **Reviewer-Unabhängigkeit**: Die Bewertung erfolgt unvoreingenommen und unabhängig von der Hierarchie der Autoren.
*   **Rückverfolgbarkeit (Traceability)**: Jeder Schritt von der Befundaufnahme über das Entscheidungs-Review bis zur Korrektur muss dokumentiert und nachvollziehbar sein.

---

## 2. Bewertungs-Lebenszyklus (Assessment Lifecycle)

Jede Konformitätsprüfung durchläuft einen standardisierten, zyklischen Prozess:

```text
       Artefakt auswählen (Select Artifact)
                       │
                       ▼
       Baseline einfrieren (Freeze Baseline)
                       │
                       ▼
     Zugeordnete Standards bestimmen (Identify Standards)
                       │
                       ▼
          Belege sammeln (Collect Evidence)
                       │
                       ▼
        Gegen BECC abgleichen (Evaluate Against BECC)
                       │
                       ▼
         Befunde protokollieren (Record Findings)
                       │
                       ▼
      Entscheidungs-Review (Engineering Decision Review)
                       │
                       ▼
        Geregelte Korrekturen (Controlled Remediation)
                       │
                       ▼
          Re-Auditierung (Reassessment)
                       │
                       ▼
        Effektivitäts-Review (Pilot Effectiveness Review)
```

1.  **Select Artifact**: Auswahl des zu prüfenden Dokuments (z.B. eine Fallstudie oder ein ADR).
2.  **Freeze Baseline**: Festlegen des genauen Git-Commit-Standes des Dokuments.
3.  **Identify Standards**: Bestimmen der anwendbaren BECC-Teilaspekte über die *BECC-Assessment-Matrix*.
4.  **Collect Evidence**: Systematisches Auswerten des Textes und Sammeln von Belegen.
5.  **Evaluate Against BECC**: Abgleich der Belege mit den Akzeptanzkriterien.
6.  **Record Findings**: Protokollierung der identifizierten Schwachstellen in einem Befundregister.
7.  **Engineering Decision Review**: Formelle Genehmigung oder Ablehnung von Korrekturmaßnahmen durch die Governance-Instanz.
8.  **Controlled Remediation**: Durchführung der genehmigten Korrekturen in einem separaten Branch.
9.  **Reassessment**: Erneute Prüfung der korrigierten Abschnitte.
10. **Pilot Effectiveness Review**: Abschließende Bewertung, ob die Korrekturen die Verständlichkeit und Portabilität des Dokuments erhöht haben.

---

## 3. Bewertungstiefen (Assessment Levels)

Um den Prüfaufwand dem Risiko des Dokuments anzupassen, werden vier Stufen der Bewertung unterschieden:
*   **Full Assessment (Vollständige Auditierung)**: Umfassende manuelle und automatisierte Prüfung aller Abschnitte gegen sämtliche anwendbaren BECC-Standards. Erforderlich bei zentralen Systemarchitekturen, Veröffentlichungen im Hauptportal und neuen Vorlagen (Templates).
*   **Targeted Assessment (Fokussierte Auditierung)**: Eingeschränkte Prüfung, die sich auf bestimmte Abschnitte (z. B. nur die Architekturbeschreibung) oder ausgewählte Standards (z. B. nur Verständlichkeit/Explainability) konzentriert.
*   **Reassessment (Re-Auditierung)**: Gezielte Nachprüfung zuvor festgestellter und korrigierter Befunde zur Freigabe des Dokuments.
*   **Validation Assessment (Validierungsprüfung)**: Ausschließlich automatisierte statische Analyse (Linter, Linkcheck) im Rahmen der CI/CD-Pipeline bei jedem Commit/Pull Request.

---

## 4. Bewertungsablauf (Assessment Process)

Der Reviewer geht bei der Prüfung eines Dokuments schrittweise vor:
1.  **Zuordnung prüfen**: Der Reviewer ermittelt anhand der *BECC-Assessment-Matrix*, welche Abschnitte des Dokuments welchen Standards unterliegen.
2.  **Fragenkatalog anwenden**: Für jeden anwendbaren Standard beantwortet der Reviewer die vordefinierten standardisierten Fragen.
3.  **Belege sichern**: Bei Unstimmigkeiten dokumentiert der Reviewer die exakte Fundstelle (Datei, Zeilennummer, Zitat).
4.  **Abgleich durchführen**: Der Reviewer bewertet die Fundstelle gegen das Akzeptanzkriterium.
5.  **Ergebnis festlegen**: Bestimmung des Konformitätsstatus (Compliant, Partially Compliant, Non-Compliant).
6.  **Dokumentation**: Erstellung des Befundberichts inklusive Schweregrad und Korrekturempfehlung.

---

## 5. Bewertungsergebnisse (Assessment Outcomes)

Für jede geprüfte Regel bzw. jeden Abschnitt wird eines der folgenden Ergebnisse vergeben:
*   **Compliant (Konform - PASS)**: Das Dokument erfüllt alle Anforderungen des Standards vollständig. Es sind keine kritischen oder mittleren Mängel vorhanden.
*   **Partially Compliant (Teilweise konform - PARTIAL)**: Der Standard ist im Wesentlichen erfüllt, es wurden jedoch geringfügige Mängel (z. B. einzelne terminologische Abweichungen oder mangelnde Satzstrukturen) festgestellt, die die Verständlichkeit nicht grundlegend gefährden.
*   **Non-Compliant (Nicht konform - FAIL)**: Wesentliche Anforderungen des Standards wurden verletzt (z. B. absolute Pfade verwendet, Erklärungsstruktur missachtet, logische Inkonsistenzen), was die Verständlichkeit, Portabilität oder Nachvollziehbarkeit des Dokuments erheblich beeinträchtigt.
*   **Not Applicable (Nicht anwendbar - N/A)**: Der Standard betrifft den vorliegenden Abschnitt inhaltlich nicht (z. B. Sprachvorgaben für Quelltextzitate).
*   **Requires Interpretation (Interpretationsbedürftig)**: Die Anwendung des Standards auf diesen spezifischen Fall ist unklar und erfordert eine Klärung durch das Architektur-Board.

---

## 6. Nachweisführung (Evidence Collection)

Jedes Prüfungsergebnis muss auf nachvollziehbaren Belegen basieren. Als Belegklassen zulässig sind:
*   **Textuelle Belege**: Direkte Zitate aus dem Dokument (z. B. Verwendung von Nominalstil oder Metaphern).
*   **Strukturelle Belege**: Aufbau und Gliederung des Dokuments (z. B. fehlende Why-before-How-Struktur in der Einleitung).
*   **Terminologische Belege**: Verwendung nicht freigegebener Fachbegriffe oder begrifflicher Drift im Vergleich zum Glossar.
*   **Visualisierungs-Belege**: Mangelhafte oder irreführende Diagrammstrukturen.
*   **Referenzielle Belege**: Fehlerhafte relative Links, fehlende Querverweise oder absolute URL-Pfade.

---

## 7. Akzeptanzkriterien (Acceptance Criteria)

Die formelle Bewertung orientiert sich an standardunabhängigen Schwellenwerten:
*   **PASS**:
    *   0 kritische Abweichungen (Critical Non-Conformances).
    *   0 schwerwiegende Abweichungen (High Non-Conformances).
    *   Maximal 3 geringfügige Abweichungen (Medium/Low), sofern diese die Gesamtqualität nicht gefährden.
*   **PARTIAL**:
    *   0 kritische Abweichungen.
    *   Maximal 2 schwerwiegende Abweichungen.
    *   Korrekturen sind erforderlich, das Dokument kann jedoch mit Vorbehalt freigegeben werden.
*   **FAIL**:
    *   Mindestens 1 kritische Abweichung ODER
    *   Mehr als 2 schwerwiegende Abweichungen.
    *   Das Dokument wird blockiert und muss zwingend nachgebessert werden.

---

## 8. Befundklassen (Finding Classification)

Jede Abweichung wird in eine der folgenden Klassen eingeordnet:
*   **Non-Conformance (Abweichung)**: Ein klarer Verstoß gegen eine verbindliche Verfassungsregel der BECC (z. B. absolute Links, verbotene Formulierungen).
*   **Improvement Opportunity (Verbesserungspotenzial)**: Die Formulierung ist zwar regelkonform, könnte jedoch zur Erhöhung der Verständlichkeit präzisiert werden.
*   **Observation (Beobachtung)**: Ein formaler Hinweis ohne direkten Korrekturbedarf (z. B. Formatierungsbesonderheiten).
*   **Operational Guidance Gap (Lücke in den operativen Leitlinien)**: Der Fall ist durch die aktuellen Arbeitsanweisungen nicht abgedeckt, was zu Interpretationsspielraum führt.
*   **Potential Constitutional Defect (Potenzieller Verfassungsfehler)**: Ein Widerspruch oder eine Lücke in der BECC-Verfassung selbst, die über ein formelles Änderungsverfahren (Amendment) behoben werden muss.

---

## 9. Schweregrade (Severity Classification)

Befunde werden nach ihrer Auswirkung auf die Qualität gewichtet:
*   **Critical (Kritisch)**: Verhindert die Portabilität, Nutzbarkeit oder das Verständnis des Dokuments vollständig (z. B. fehlerhafte relative Links, die zu leeren Seiten führen). Führt immer zu einem **FAIL**.
*   **High (Hoch)**: Erschwert das Verständnis komplexer Abschnitte massiv (z. B. völliges Fehlen der Why-before-How-Struktur in Architekturkapiteln).
*   **Medium (Mittel)**: Kleinere Verstöße gegen Sprach- oder Stilregeln (z. B. übermäßiger Gebrauch von Nominalstil oder zu lange Sätze).
*   **Low (Niedrig)**: Einzelfälle von Formatierungsfehlern oder orthografischen Schwächen, die das Verständnis nicht beeinträchtigen.
*   **Informational (Hinweis)**: Stilistische Vorschläge des Reviewers.

---

## 10. Entscheidungs-Workflow (Engineering Decision Workflow)

Befunde durchlaufen ein strukturiertes Governance-Verfahren zur Fehlerbehebung:

1.  **Logging**: Der Reviewer trägt alle Befunde in das Befundregister ein.
2.  **Review**: Das Review-Gremium prüft die Befunde im Rahmen des Engineering Decision Reviews (EDR).
3.  **Entscheidung (Decision)**:
    *   *Genehmigt (Approved)*: Der Befund wird als berechtigt anerkannt; es wird ein Arbeitspaket (Work Package) zur Korrektur erstellt.
    *   *Abgelehnt (Rejected)*: Der Befund wird begründet zurückgewiesen und archiviert.
4.  **Execution & Verification**: Nach Umsetzung der Korrekturen erfolgt eine erneute Verifikation (Reassessment).

---

## 11. Operative Governance (Reviewer & Stewardship)

*   **Reviewer-Rolle**: Der Reviewer agiert als unabhängige Kontrollinstanz. Er bewertet ausschließlich auf Basis dieses Dokuments und der *BECC-Assessment-Matrix*.
*   **Stewardship**: Die Pflege dieses Konzepts liegt beim Constitutional Architect. Anpassungen an dieser Methodik (z. B. Änderung der Schweregrade) werden über reguläre Minor-Releases oder operative Updates eingepflegt.

---

## 12. Verhältnis zu anderen operativen Dokumenten

Dieses Dokument bildet das verfahrensrechtliche Fundament der Operational Governance:
*   **BECC-ASSESSMENT-METHODOLOGY.md** (dieses Dokument): Definiert das **WIE** (Lebenszyklus, Abweichungsklassen, Schweregrade, Workflows).
*   **BECC-ASSESSMENT-MATRIX.md**: Definiert das **WO** (Zuordnung der BECC-Standards zu den einzelnen Kapiteln eines Dokuments und Bereitstellung der konkreten Prüffragen).

Beide Dokumente zusammen bilden die vollständige Bewertungsinfrastruktur zur Absicherung der technischen Kommunikationsqualität im BridGenta-Repository.

---

[Zurück zur BECC-Übersicht](../README.md)
