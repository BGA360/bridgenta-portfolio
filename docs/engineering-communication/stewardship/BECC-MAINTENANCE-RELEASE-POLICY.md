# BECC Maintenance Release Policy — OS-4: Wartungsrichtlinie

Dieses Dokument definiert die offizielle **Wartungsrichtlinie (Maintenance Release Policy)** für die **BridGenta Engineering Communication Constitution (BECC)**. Sie regelt den Prozess zur kontrollierten Behebung von Fehlern, zur Klärung von Dokumenten und zur kontinuierlichen Pflege des Frameworks nach dessen Freigabe (General Availability).

> [!IMPORTANT]
> **GOVERNANCE-CLASSIFICATION**: Dies ist ein **konstitutionelles Stewardship-Dokument** zur Festlegung von Wartungsprozessen. Es regelt rein die Pflege des Frameworks und ändert die in BECC v1.0 GA verankerten inhaltlichen Standards nicht.

---

## 1. Zweck & Abgrenzung (Purpose & Scope)

Die Wartungsrichtlinie stellt sicher, dass Korrekturen und Klarstellungen an der BECC einem geordneten, nachvollziehbaren und qualitätsgesicherten Engineering-Prozess folgen.
*   **Zweck**: Wahrung der Anwendbarkeit, logischen Konsistenz und Link-Integrität des Frameworks über dessen gesamte Lebenszeit.
*   **Abgrenzung**: Wartungsänderungen dürfen niemals die verfassungsmäßigen Grundsätze oder inhaltlichen Anforderungen der BECC-Standards verändern. Solche inhaltlichen Weiterentwicklungen unterliegen der separaten Governance von Verfassungsänderungen (Amendments).

---

## 2. Grundsätze der Wartung (Maintenance Principles)

Jede Aktivität zur Framework-Wartung muss sich an folgenden permanenten Grundsätzen ausrichten:

*   **Verfassungsmäßige Stabilität (Constitutional Stability)**: Die Kernnormen und Kommunikationsziele bleiben geschützt und unverändert.
*   **Nachweis vor Freigabe (Evidence Before Release)**: Jede Wartung muss auf dokumentierten operativen Erkenntnissen basieren.
*   **Lückenlose Traceability (Rückverfolgbarkeit)**: Jede Wartungsänderung muss bis zum auslösenden Review-Finding, Ledger-Eintrag oder Issue rückverfolgbar sein.
*   **Minimale Änderung (Minimal Change)**: Wartung soll so minimal wie möglich in die Struktur eingreifen.
*   **Prozessintegrität (Operational Integrity)**: Laufende Audits dürfen durch Wartungsarbeiten nicht behindert werden.
*   **Abwärtskompatibilität (Backward Compatibility)**: Wartungsreleases müssen zu bestehenden Audits abwärtskompatibel sein. Ein laufendes Audit darf durch ein Wartungsrelease nicht ungültig werden.
*   **Eingegrenzter Scope (Controlled Scope)**: Keine Ausweitung des Wartungsbereichs (Scope Creep) während der Ausführung.
*   **Formelle Genehmigung (Governance Approval)**: Jedes Wartungs-Release benötigt eine explizite Freigabe.

---

## 3. Definition eines Wartungs-Releases (Definition)

Ein **Wartungs-Release (Maintenance Release)** ist eine kontrollierte Aktualisierung des BECC-Ökosystems, die:
*   Die operative Qualität und Usabilität verbessert,
*   Die verfassungsmäßige Absicht (Constitutional Intent) unverändert bewahrt,
*   **Keine** neuen Kommunikations- oder Governance-Anforderungen für Dokumente einführt,
*   **Keine** bestehenden Standards oder Matrixfragen neu definiert.

---

## 4. Zulässige Wartungsaktivitäten (Eligible Activities)

Die folgenden Aktivitäten qualifizieren sich für ein Wartungs-Release:
*   **Klarstellung der Dokumentation**: Präzisierung von Formulierungen in den Leitfäden zur Verringerung von Interpretationsspielräumen für Reviewer.
*   **Fehlerkorrekturen (Typographical Corrections)**: Behebung von Grammatik-, Rechtschreib- oder Zeichensetzungsfehlern.
*   **Link-Korrekturen (Broken Reference Repairs)**: Reparatur fehlerhafter Dateipfade oder Hyperlinks im Dokumentennetzwerk.
*   **Repository-Engineering**: Technische Verbesserungen an den Validierungsskripten (Linter, Link-Auditor) oder Build-Konfigurationen.
*   **Klarstellung operativer Leitlinien**: Ergänzung von Auslegungshilfen im Bewertungskonzept (Methodology) zur Erhöhung der Reviewer-Konsistenz.
*   **Template-Optimierung**: Verbesserung von Markdown-Vorlagen (z. B. für EDRs oder Trace-Reports) zur Steigerung der Usabilität.
*   **Referenz-Updates**: Aktualisierung von Versionsnummern oder Querverweisen in den Stewardship-Dokumenten.
*   **Beispiel-Verbesserungen**: Überarbeitung von Negativ- oder Positivbeispielen in den Schreibstandards zur besseren Veranschaulichung.

---

## 5. Nicht zulässige Aktivitäten (Non-Eligible Activities)

Die folgenden Aktivitäten sind im Rahmen der Wartung **explizit ausgeschlossen** und erfordern einen formellen Verfassungsänderungs-Prozess (Amendment):
*   Änderung oder Streichung von Verfassungsprinzipien (Principles).
*   Einführung neuer Kommunikationsstandards (z. B. ein neuer `MAT`-Kapiteltyp).
*   Neugestaltung der Governance-Hierarchie oder Rollen.
*   Neugestaltung der Bewertungsmethodik oder der Bewertungsmatrix.
*   Veränderung oder Streichung bestehender standardisierter Matrix-Prüffragen.
*   Änderungen am operativen Lebenszyklus oder dem Stewardship-Modell.
*   Änderungen am Versions- oder Freigabemodell.

---

## 6. Auslöser für Wartungs-Releases (Triggers)

Ein Wartungs-Release darf nur durch folgende objektive Belege ausgelöst werden:
1.  **Erkenntnisse aus dem Assessment Ledger** (z. B. wiederholte Unklarheiten bei der Anwendung einer Frage).
2.  **Auffälligkeiten in den operativen Kennzahlen** (z. B. Anstieg der Audit-Dauer durch fehlerhafte Templates).
3.  **Befunde der jährlichen Betriebsüberprüfung (Annual Review)**.
4.  **Verifizierte Fehler im Repository** (z. B. fehlgeschlagene automatische Linkprüfung oder Linter-Fehlalarme).
5.  **Dokumentierte Hinweise von Reviewern oder Implementern** (Guidance Gaps).

*Ausschließlich subjektive Wünsche oder anekdotisches Feedback ohne dokumentierte Evidenz sind als Auslöser unzulässig.*

---

## 7. Ablauf eines Wartungs-Releases (Workflow)

Jedes Wartungs-Release durchläuft streng den folgenden Lebenszyklus:

```text
       Operativer Beleg (Operational Evidence)
                         │
                         ▼
        Wartungsbewertung (Evaluation)
                         │
                         ▼
      Scope-Definition & Freigabe (Scope Definition)
                         │
                         ▼
             Genehmigung (Approval)
                         │
                         ▼
            Implementierung (Implementation)
                         │
                         ▼
             Verifikation (Verification)
                         │
                         ▼
        Wartungs-Release (Maintenance Release)
```

### Die Phasen im Detail:
*   **Evidence**: Registrierung des Belegfalls (z. B. ein Issue wegen eines toten Links).
*   **Evaluation**: Der *Constitutional Architect* bewertet, ob der Fall die Wartungskriterien erfüllt.
*   **Scope Definition**: Erstellung einer Liste aller zu ändernden Dateien und Zeilen.
*   **Approval**: Freigabe des Scopes durch den *Project Owner*.
*   **Implementation**: Durchführung der Änderungen auf einem separaten Wartungs-Branch.
*   **Verification**: Ausführung der Linter, Link-Prüfungen und Test-Builds.
*   **Release**: Zusammenführung in den Hauptzweig und Erhöhung der Maintenance-Versionsnummer (z. B. `v1.0.1`).

---

## 8. Rollen in der Wartungsgovernance (Governance Roles)

*   **Project Owner**: Alleinige Freigabeautorität für den Wartungsscope und die Release-Veröffentlichung.
*   **Constitutional Architect**: Bewertung der Qualifizierung, Definition des Scopes und fachliche Prüfung der Umsetzung.
*   **Operational Reviewer**: Einreichen von Belegen (Guidance Gaps) und Validierung der geänderten Hilfsmittel im Betrieb.
*   **Implementer**: Ausführung der genehmigten Änderungen auf dem Wartungs-Branch und Nachweis des erfolgreichen Builds.

---

## 9. Release-Klassifizierung (Release Classification)

Die BECC-Freigabeordnung stuft Wartungsarbeiten wie folgt ein:

```text
     Maintenance Release (Fehlerbehebung, z. B. v1.0.1)
                            │
                            ▼
     Minor Version (Funktionale Erweiterung, z. B. v1.1.0)
                            │
                            ▼
     Major Version (Konstitutionelle Änderung, z. B. v2.0.0)
```

*   **Maintenance Release**: Rein deklarative Korrekturen und technische Korrekturen.
*   **Minor Version**: Hinzufügen neuer, optionaler Hilfsmittel oder neuer Kapiteltypen in die Matrix bei Abwärtskompatibilität.
*   **Major Version**: Strukturänderungen mit Auswirkung auf bestehende Audits (z. B. Neudefinition von Standards).

---

## 10. Freigabeanforderungen (Approval Requirements)

Ein Wartungs-Release darf erst freigegeben werden, wenn:
*   Ein schriftlicher Beleg die Änderung motiviert,
*   Die Traceability im Commit-Log gewahrt ist,
*   Die Abwärtskompatibilität geprüft und bestätigt wurde,
*   Alle Validierungsskripte (`npm run lint` etc.) fehlerfrei durchlaufen,
*   Der CI-Build erfolgreich abschließt,
*   Der *Project Owner* die schriftliche Freigabe erteilt.

---

## 11. Integration im Stewardship-Ökosystem (Relationships)

Die Wartungsrichtlinie arbeitet eng mit den anderen Stewardship-Komponenten zusammen:
*   Sie greift auf die Daten des **Assessment Ledger (OS-2)** und des **Kennzahlen-Systems (OS-3)** zurück.
*   Sie steuert die kleineren Release-Zyklen gemäß der **Betriebs-Policy (OS-1)**.
*   Sie grenzt sich scharf von großen Änderungen ab, die im **Constitutional Amendment Register (OS-5)** erfasst werden.

---

## 12. Wartungs-Deklaration (Stewardship Declaration)

Die Verfassungsverwaltung deklariert hiermit:
*   Wartungsreleases dienen der **Erhaltung der Betriebsgüte** und nicht der inhaltlichen Evolution der BECC.
*   Jede evolutionäre Weiterentwicklung der Verfassungsnormen bleibt dem formellen Verfassungsänderungsprozess vorbehalten.

---

[Zurück zur BECC-Übersicht](../README.md)
