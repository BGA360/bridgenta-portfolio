---
title: "BECC v2"
subtitle: "Cloud-Infrastruktur, Persistenz & Verifikation"
description: "Produktionsreife Backend- und Cloud-Architektur mit persistenter PostgreSQL, strikter CA-validierter TLS, automatisierten Backups und 7-Tage-PITR unter strikter Kostendisziplin."
seoTitle: "BECC v2 – Cloud-Infrastruktur, PostgreSQL & strikte TLS-Verifikation"
seoDescription: "Fallstudie zur produktionsreifen Cloud-Architektur von BECC v2: Persistente PostgreSQL in Frankfurt, strikte CA-TLS, automatisierte Backups, PITR-Restore-Drill und 320 Tests."
schemaType: "SoftwareApplication"
sidebar:
  category: "Cloud-Infrastruktur / Backend-Architektur"
  status: "Abgeschlossen"
  timeline: "Oktober 2026"
  role: "Backend & Cloud Infrastructure Engineer"
  technologies: "Node.js, TypeScript, PostgreSQL 16, Render Frankfurt, Strato DNS, Strict TLS"
  devStack:
    - Node.js (v24 LTS)
    - TypeScript
    - PostgreSQL 16 (SSD)
    - Render Cloud (Frankfurt am Main / EU)
    - Strato DNS (CNAME-Ingress)
    - Strict CA-verified TLS
    - Automated Daily Snapshots & 7-Day PITR
  aiBuilders:
    - Antigravity
  notice: "BECC v2 ist die produktionsreife Backend- und Auswertungsinfrastruktur für Evidenz- und Bereitschaftsprüfungen von BridGenta. Die Fallstudie dokumentiert verifizierte Architekturentscheidungen und operative Kennzahlen. Interne Zugangsdaten und administrative Tokens verbleiben geschützt."
---

## Kurzfassung

BECC v2 (*BridGenta Evidence & Constitutional Check*) ist eine headless betriebene Backend- und Verifikationslaufzeit, die technische Bereitschaftskriterien, Governance-Entscheidungen und einen kryptografisch nachvollziehbaren Audit-Ledger bereitstellt.

Dieses Dokument richtet sich an Cloud-Architekten, Backend-Ingenieure und technische Auditoren. Es beschreibt den Übergang von einer flüchtigen Entwicklungsumgebung zu einer gehärteten, produktionsreifen Cloud-Infrastruktur unter realen operativen Rahmenbedingungen: persistente Datenspeicherung in Frankfurt am Main, strikte CA-validierte Transportsicherheit ohne Ausnahmen, ein always-on Compute-Dienst mit null Kaltstartzeiten, 7 Tage Point-in-Time-Recovery (PITR) mit verifiziertem Wiederherstellungsdrill sowie 320 automatisierte Tests bei strikter Einhaltung einer monatlichen Budgetobergrenze von 15,00 €.

---

## Warum dieses Projekt entstand

Viele moderne Softwarearchitekturen stützen sich zunehmend auf generative KI-Systeme und automatisierte Agenten. Ohne eine unabhängige, deterministische Prüfinstanz besteht jedoch das Risiko, dass synthetische oder fehlerhafte Behauptungen ungeprüft in Produktionsprozesse einfließen.

BECC v2 wurde als verlässliche Gegeninstanz konzipiert: Ein deterministischer Prüf- und Ledger-Dienst, der jede Governance-Entscheidung und jeden Nachweis unveränderlich protokolliert. Ein solches Prüfsystem kann seine Aufgabe jedoch nur glaubwürdig erfüllen, wenn seine eigene Betriebsumgebung höchste Standards an Persistenz, Ausfallsicherheit und Datensicherheit erfüllt.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Ein Evidenz- und Governance-System verliert jede Glaubwürdigkeit, wenn sein zugrundeliegender Audit-Speicher flüchtig ist oder Datenverbindungen ohne Zertifikatsprüfung erfolgen. Operative Härtung ist das Fundament vertrauenswürdiger Software.</p>
</div>

---

## Ausgangssituation: Die fünf Produktionslücken

Im Rahmen des vorangegangenen technischen Audits (`BECC-NEXT-008A`) wurden fünf wesentliche Lücken identifiziert, die einer Produktionsfreigabe im Wege standen:

1. **Flüchtige Datenhaltung (`GAP-PROD-001`)**: Die Entwicklungsdatenbank lief auf einer kostenfreien Testinstanz mit Ablaufdatum (Expiration-Timer) und automatischem Datenverlust nach Inaktivität.
2. **Ungesicherte Backups & Fehlendes PITR (`GAP-PROD-002`)**: Es existierten weder automatisierte tägliche Snapshots noch eine kontinuierliche WAL-Archivierung für Point-in-Time-Recovery.
3. **Ungetesteter Wiederherstellungspfad (`GAP-PROD-003`)**: Die Wiederherstellung aus einem Speicherabzug war theoretisch dokumentiert, aber nie gegen einen realen Datenbestand verifiziert worden.
4. **Instanz-Schlafzustände & Kaltstarts (`GAP-PROD-004`)**: Der Web-Service wurde bei Inaktivität nach 15 Minuten heruntergefahren, was zu unberechenbaren Antwortzeiten von 30 bis 60 Sekunden führte.
5. **Fehlende Produktiv-Domain & Unvollständige TLS-Kette (`GAP-PROD-005`)**: Die Anwendung war nur über eine generische Drittanbieter-URL erreichbar, und interne Datenbankverbindungen drohten bei fehlerhafter Zertifikatskonfiguration kompromittiert zu werden.

---

## Architekturentscheidung & Cloud-Topologie

Für die Schließung dieser Lücken wurden alternative Bereitstellungsmodelle (Multi-Cloud vs. Managed Single-Provider) evaluiert (`BECC-NEXT-008B`). 

### Topologie-Entscheidung (`DEC-OWNER-001`)
Aus Gründen der operativen Einfachheit, der Latenzminimierung und der Vermeidung von Egress-Kosten fiel die Entscheidung auf eine **Single-Provider-Topologie in der Region Frankfurt am Main (`fra`, Deutschland, EU)** auf Basis der Render-Plattform:

```text
               +-------------------------------------------------------+
               |                  INTERNET / CLIENTS                   |
               +---------------------------+---------------------------+
                                           |
                                HTTPS (Port 443)
                         Google Trust Services TLS (SNI)
                                           |
                                           v
               +-------------------------------------------------------+
               |         DNS INGRESS: becc.bridgenta.de                |
               |         Strato AG CNAME-Delegation                     |
               +---------------------------+---------------------------+
                                           |
                                           v
               +-------------------------------------------------------+
               |         COMPUTE: becc-test-runtime                    |
               |         Starter Tier (0.5 CPU / 512 MB RAM)           |
               |         Always-On / 0ms Kaltstart                     |
               |         Node.js 24 LTS / TypeScript Runtime           |
               +---------------------------+---------------------------+
                                           |
                                PostgreSQL TLS (Port 5432)
                         OPTION-3A: Strict Public CA Verification
                                rejectUnauthorized: true
                                           |
                                           v
               +-------------------------------------------------------+
               |         DATABASE: becc-test-postgres                  |
               |         PostgreSQL 16.8 (Basic 1GB SSD)               |
               |         Persistenter SSD-Speicher (Frankfurt)         |
               |         Automatisierte tägliche Snapshots             |
               |         7 Tage kontinuierliche WAL-Archivierung (PITR)|
               +-------------------------------------------------------+
```

---

## Persistente Datenhaltung & Rollentrennung

Die Datenbank wurde auf einen dedizierten, persistenten SSD-Speicherplan (`basic_1gb`) umgestellt (`BECC-NEXT-008D`). Der bisherige Ablauf-Timer wurde dauerhaft entfernt.

Zur Durchsetzung des Prinzips der geringsten Rechte (*Least Privilege*) wurde eine strikte administrative Rollentrennung implementiert:

| Rolle | Zugriffsrechte | Verwendungszweck |
|---|---|---|
| `render_admin` | Superuser / DDL-Rechte / Schema-Verwaltung | Ausschließlich für Migrationen und Provisionierung |
| `becc_app` | Streng limitiert: `SELECT`, `INSERT` auf `becc.becc_audit_records` | Reguläre Laufzeit / Schreibender Audit-Ledger |

Versuche der Laufzeitrolle `becc_app`, Schemata zu verändern (`CREATE TABLE`), neue Rollen anzulegen oder bestehende Audit-Einträge zu manipulieren (`UPDATE`, `DELETE`), werden von der Datenbank-Engine strikt mit `permission denied` abgewiesen.

---

## Strikte Transportsicherheit & CA-Validierung

Bei Cloud-Datenbanken greifen Entwicklungsteams häufig auf unsichere Abkürzungen wie `sslmode=no-verify` oder `rejectUnauthorized: false` zurück, um Verbindungsprobleme mit selbstsignierten Zertifikaten zu umgehen. Dies öffnet Man-in-the-Middle-Angriffen (MitM) Tür und Tor.

### Die OPTION-3A-Entscheidung (`DEC-OWNER-003`)
Für BECC v2 wurde jeglicher Verzicht auf Zertifikatsprüfungen kategorisch untersagt:
- **Verbindungsziel**: Externes PostgreSQL-Gateway in Frankfurt mit öffentlich signiertem Zertifikat.
- **Validierungsrichtlinie**: `rejectUnauthorized: true` ohne Ausnahme.
- **Trust Store**: Verifikation gegen das offizielle Mozilla CA-Wurzelzertifikate-Bündel der Node.js-Laufzeit.
- **Ergebnis**: Absoluter Schutz vor MitM-Angriffen auf dem Transportweg zwischen Compute-Instanz und Datenbank.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">TLS ohne CA-Validierung bietet nur die Illusion von Sicherheit. Echte Transportverschlüsselung erfordert die strikte Zurückweisung unbestätigter Zertifikate (rejectUnauthorized: true) als nicht verhandelbare Richtlinie.</p>
</div>

---

## Always-On Runtime & Betriebsdisziplin

Die Laufzeitinstanz wurde auf den kostenpflichtigen Starter-Plan (`0.5 CPU`, `512 MB RAM`) angehoben (`BECC-NEXT-008E`). Dadurch wurde das standardmäßige Einschlafen nach 15 Minuten Inaktivität eliminiert:

- **Verfügbarkeit**: 24/7 Always-On ohne Unterbrechung.
- **Kaltstartzeit**: 0 ms (keine Anlaufverzögerungen für anfragende Clients).
- **Ressourcenverbrauch**: Der Speicherverbrauch des Node.js-Daemons liegt stabil bei unter 85 MB, was ausreichend Puffer für Lastspitzen bietet.

---

## Produktiv-Domain & DNS-Ingress

Die Anwendung wurde nahtlos in die bestehende Domain-Architektur von `bridgenta.de` integriert:

- **Hostname**: `https://becc.bridgenta.de`
- **DNS-Verwaltung**: Strato AG Nameserver via `CNAME`-Delegation auf den Ingress-Endpunkt `becc-test-runtime.onrender.com`.
- **Edge-Zertifikat**: Automatisch verwaltetes TLS-Zertifikat von *Google Trust Services (WE1)* mit vollständiger SNI-Unterstützung und moderner Cipher-Suite (TLS 1.3).
- **Verifikationsstatus**: Verifiziert ohne Weiterleitungsschleifen oder Hostname-Konflikte.

---

## Betriebstelemetrie & Live-Endpunkte

Um den Zustand des Dienstes transparent und automatisiert überwachbar zu machen, stellt BECC v2 standardisierte Endpunkte bereit:

| Endpunkt | Methode | Antwort | Zweck |
|---|---|---|---|
| `/` | `GET`, `HEAD` | `200 OK` (JSON) | Deterministischer Service-Index für Operatoren und Browser |
| `/health` | `GET` | `200 OK` (`HEALTHY`) | Tiefe Liveness-Prüfung inkl. aktiver Datenbankverbindung |
| `/ready` | `GET` | `200 OK` (`readiness: true`) | Bereitschaftsprüfung für vorgeschaltete Gateways |
| `/version` | `GET` | `200 OK` (`version: 2.0.0-GA`) | Semantische Versionsnummer, Git-Release-SHA und Zeitstempel |

Alle Endpunkte wurden einem Sicherheitsaudit unterzogen: Sie liefern präzise Diagnosedaten, legen jedoch zu keinem Zeitpunkt vertrauliche Umgebungsvariablen, Datenbankpasswörter oder interne Hostnamen offen.

---

## Datensicherung, 7-Tage-PITR & Validierter Restore-Drill

Ein Datensicherungskonzept ist erst dann bewährt, wenn die Wiederherstellung in der Praxis erfolgreich getestet wurde.

### Kontinuierliche Datensicherung
Die persistente Datenbankinstanz erstellt automatisierte tägliche Snapshots und archiviert fortlaufend Write-Ahead-Logs (WAL). Dies ermöglicht ein Point-in-Time-Recovery (PITR) über ein rollierendes Zeitfenster von **7 Tagen**.

### Der Restore-Drill (`BECC-NEXT-008D-R0`)
Zur Schließung von `GAP-PROD-003` wurde ein kontrollierter Wiederherstellungstest durchgeführt:
1. **Initialer Datenbestand**: 5 synthetische Datensätze wurden mit kryptografischen Prüfsummen in den produktiven Ledger geschrieben.
2. **Klon-Wiederherstellung**: Über die Backup-API wurde zu einem exakten historischen Zeitstempel eine isolierte Testinstanz (`becc-restore-drill`) hochgezogen.
3. **Integritätsprüfung**: Alle 5 Datensätze wurden aus der wiederhergestellten Datenbank ausgelesen und byteweise mit dem Ursprungsbestand verglichen:
   - **Prüfsumme Vorher**: `1910418b6a6dba83f15be12ab40670b773231ffa67774566512c0ff329517524`
   - **Prüfsumme Nachher**: `1910418b6a6dba83f15be12ab40670b773231ffa67774566512c0ff329517524`
   - **Abweichung**: Exakt 0 Bytes Differenz (`HASH_PARITY: PASS`).
4. **Bereinigung**: Nach erfolgreicher Zertifizierung wurde die temporäre Instanz vollständig gelöscht, um unnötige Kosten zu vermeiden.

---

## Kostendisziplin & Budgettreue

Eine zentrale Vorgabe des Projektinhabers (`DEC-OWNER-002`) war die Einhaltung eines monatlichen Budgets von maximal **15,00 €**:

| Ressource | Spezifikation | Monatliche Kosten (USD) | Monatliche Kosten (EUR) |
|---|---|---|---|
| **Datenbank** | Render Basic 1GB SSD (Frankfurt) | $7.00 | ~€6.50 |
| **Compute** | Render Starter 0.5 CPU / 512 MB | $7.00 | ~€6.50 |
| **Domain & TLS** | CNAME Ingress & GTS Zertifikat | $0.00 | €0.00 |
| **Gesamtkosten** | | **$14.00 / Monat** | **~€13.00 / Monat** |

Mit laufenden Gesamtkosten von ca. 13,00 € pro Monat wird die Budgetgrenze von 15,00 € zuverlässig eingehalten, ohne Abstriche bei Datenpersistenz oder Verfügbarkeit zu machen.

---

## Testabdeckung & Automatisierte Verifikation

Die Verlässlichkeit der BECC-Laufzeit wird durch eine umfassende, automatisierte Testsuite in `becc-runtime/` sichergestellt:

- **Gesamtzahl Tests**: **320 automatisierte Tests** (31 Test-Suiten).
- **Test-Schwerpunkte**:
  - Dienst-Lebenszyklus und HTTP-Endpunkte (`GET /`, `/health`, `/ready`, `/version`).
  - Standalone-PostgreSQL-Testbed mit Container-Isolation.
  - Rollentrennung, DDL-Restriktionen und Ledger-Integrität.
  - Multi-Instanz-Zertifizierung und Fehlertoleranz (`BECC-NEXT-006C`).
  - Strict-TLS-Handshake und Ablehnung unverschlüsselter Verbindungen.
- **Ausführungsstatus**: 100% grün in der lokalen Testumgebung und der Linux-CI-Pipeline.

---

## Was nachgewiesen wurde vs. Was explizit nicht beansprucht wird

Zur Wahrung technischer Redlichkeit und Vermeidung von Marketing-Übertreibungen gilt folgende klare Abgrenzung:

### Verifizierte Nachweise
- Echte Persistenz auf SSD-Speicher in Frankfurt am Main ohne Ablaufdatum.
- Strikte CA-validierte TLS-Verbindung zur Datenbank ohne Sicherheitsabschwächung.
- Erfolgreich durchgeführter PITR-Restore-Drill mit kryptografischer Datenparität.
- Always-on Verfügbarkeit ohne Kaltstartverzögerung.
- 320 bestandene automatisierte Tests und strikte Budgettreue ($14.00/Monat).

### Explizit nicht beansprucht
- **Kein Multi-AZ-Hochverfügbarkeitscluster**: Die Datenbank läuft als robuste Einzelinstanz im Basic-Tarif ohne automatischen Hot-Standby-Failover.
- **Keine formelle Konformitätszertifizierung**: Es handelt sich um ein strukturiertes Eigenprojekt; formelle Audits wie ISO 27001, SOC 2 oder NIS2 wurden nicht durchgeführt.
- **Kein externer Penetrationstest**: Die Sicherheitsarchitektur basiert auf Prinzipien wie Least Privilege und Strict TLS, wurde jedoch keinem externen Red-Teaming unterzogen.

---

## Evidenz- und Prüfreferenzen

Die in dieser Fallstudie dargestellten Ergebnisse basieren auf dauerhaft im Repository archivierten Prüfdokumenten:

1. `BECC-NEXT-008A-ZERO-COST-PRODUCTION-READINESS-FOUNDATION-TECHNICAL-GAP-CLOSURE.md`: Identifikation der fünf Produktionslücken.
2. `BECC-NEXT-008B-PROVIDER-EVALUATION-OWNER-BUDGET-AUTHORIZATION.md`: Provider-Evaluierung und Eigentümer-Budgetfreigabe.
3. `BECC-NEXT-008C-OWNER-REAUTHORIZATION-TLS-ARCHITECTURE-RECONCILIATION.md`: Beschluss zur OPTION-3A TLS-Architektur.
4. `BECC-NEXT-008C-RESUME-OPTION-3A-PRODUCTION-INFRASTRUCTURE-EVIDENCE.md`: Technischer Nachweis der externen Gateway-TLS.
5. `BECC-NEXT-008D-PRODUCTION-GAP-CLOSURE-AND-CERTIFICATION.md`: Livedurchführung der Schließung von GAP-PROD-001 bis 005.
6. `BECC-NEXT-008E-PRODUCTION-OPERATIONS-BASELINE-OPERATIONAL-READINESS-HANDOFF.md`: Finaler operativer Bereitschaftsübergang.
7. `BECC-NEXT-008E-PRODUCTION-OPERATIONS-RUNBOOK.md`: Verbindliches Betriebshandbuch für den laufenden Betrieb.
