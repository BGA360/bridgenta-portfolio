---
title: "BECC v2"
subtitle: "Cloud-Infrastruktur, Persistenz & Verifikation"
description: "Gehärtete Backend- und Cloud-Architektur mit persistenter PostgreSQL, strikter CA-validierter TLS, automatisierten Backups und verifiziertem Restore unter strikter Kostendisziplin."
seoTitle: "BECC v2 – Cloud-Infrastruktur, PostgreSQL & strikte TLS-Verifikation"
seoDescription: "Fallstudie zur gehärteten Cloud-Architektur von BECC v2: Persistente PostgreSQL in Frankfurt, strikte CA-TLS, automatisierte Backups, Restore-Drill und 320 Tests."
schemaType: "SoftwareApplication"
sidebar:
  category: "Cloud-Infrastruktur / Backend-Architektur"
  status: "Abgeschlossen"
  timeline: "Oktober 2026"
  role: "Backend & Cloud Infrastructure Engineer"
  technologies: "Node.js, TypeScript, PostgreSQL, Managed Cloud (Frankfurt), Strict TLS"
  devStack:
    - Node.js (LTS Runtime)
    - TypeScript
    - PostgreSQL (Persistenter SSD-Speicher)
    - Managed Cloud (Frankfurt am Main / EU)
    - DNS-Ingress & TLS 1.3
    - Strikte CA-validierte Transportsicherheit
    - Automatisierte Backups & PITR-Fähigkeit
  aiBuilders:
    - Antigravity
  notice: "BECC v2 ist die gehärtete Backend- und Auswertungsinfrastruktur für Evidenz- und Bereitschaftsprüfungen von BridGenta. Die Fallstudie dokumentiert verifizierte Architekturentscheidungen und operative Kennzahlen. Interne Zugangsdaten, Passwörter und sensitive Infrastruktur-Details verbleiben geschützt."
---

## Kurzfassung

BECC v2 (*BridGenta Evidence & Constitutional Check*) ist eine headless betriebene Backend- und Verifikationslaufzeit, die technische Bereitschaftskriterien, Governance-Entscheidungen und einen kryptografisch nachvollziehbaren Audit-Ledger bereitstellt.

Dieses Dokument richtet sich an Cloud-Architekten, Backend-Ingenieure und technische Auditoren. Es beschreibt den Übergang von einer flüchtigen Entwicklungsumgebung zu einer gehärteten Cloud-Infrastruktur unter realen operativen Rahmenbedingungen: persistente Datenspeicherung in der Region Frankfurt am Main, strikte CA-validierte Transportsicherheit ohne Ausnahmen, ein dedizierter Compute-Dienst zur Vermeidung von Kaltstartzeiten, automatisierte Backups mit kontinuierlicher WAL-Archivierung (Point-in-Time-Recovery-Fähigkeit), ein verifizierter logischer Restore-Drill sowie 320 automatisierte Tests bei strikter Einhaltung einer monatlichen Budgetobergrenze von unter 15,00 €.

---

## Warum dieses Projekt entstand

Viele moderne Softwarearchitekturen stützen sich zunehmend auf generative KI-Systeme und automatisierte Agenten. Ohne eine unabhängige, deterministische Prüfinstanz besteht jedoch das Risiko, dass synthetische oder fehlerhafte Behauptungen ungeprüft in Produktionsprozesse einfließen.

BECC v2 wurde als verlässliche Gegeninstanz konzipiert: Ein deterministischer Prüf- und Ledger-Dienst, der jede Governance-Entscheidung und jeden Nachweis unveränderlich protokolliert. Ein solches Prüfsystem kann seine Aufgabe jedoch nur glaubwürdig erfüllen, wenn seine eigene Betriebsumgebung verlässliche Standards an Persistenz, Ausfallsicherheit und Datensicherheit erfüllt.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Ein Evidenz- und Governance-System verliert seine Glaubwürdigkeit, wenn sein zugrundeliegender Audit-Speicher flüchtig ist oder Datenverbindungen ohne strikte Zertifikatsprüfung erfolgen. Operative Härtung ist das Fundament vertrauenswürdiger Software.</p>
</div>

---

## Ausgangssituation: Die fünf operativen Herausforderungen

Im Rahmen der technischen Bestandsaufnahme wurden fünf wesentliche Herausforderungen identifiziert, die für einen verlässlichen Produktivbetrieb gelöst werden mussten:

1. **Flüchtige Datenhaltung**: Die anfängliche Entwicklungsdatenbank lief auf einer temporären Testinstanz mit automatischem Datenverlust nach Inaktivität.
2. **Datensicherung & Wiederherstellung**: Es fehlten ein automatisiertes Snapshot-Konzept, eine kontinuierliche Transaktionsarchivierung für zeitpunktgenaue Wiederherstellungen sowie ein praktisch verifizierter Restore-Drill.
3. **Transportsicherheit & Zertifikatsvalidierung**: Datenbankverbindungen in Cloud-Umgebungen bergen Risiken, wenn Zertifikatsprüfungen deaktiviert werden; gefordert war eine strikte CA-Validierung (`rejectUnauthorized: true`).
4. **Instanz-Schlafzustände & Latenz**: Kostenfreie Instanzen wurden bei Inaktivität heruntergefahren, was zu unvorhersehbaren Kaltstartverzögerungen für anfragende Clients führte.
5. **Domain-Integration & Ingress-Routing**: Die Anwendung war nur über generische Standard-Hostnamen erreichbar und musste sauber in die primäre Domain-Architektur (`becc.bridgenta.de`) eingebunden werden.

---

## Architekturentscheidung & Cloud-Topologie

Für die Schließung dieser Herausforderungen wurden verschiedene Bereitstellungsmodelle (Multi-Cloud vs. Managed Single-Provider) evaluiert.

Aus Gründen operativer Einfachheit, Latenzminimierung innerhalb der EU und Vermeidung von Egress-Kosten fiel die Entscheidung auf eine **Single-Provider-Topologie in der Region Frankfurt am Main (Deutschland / EU)**:

- **Ingress & Edge-Routing**: Client-Anfragen erreichen den Dienst über die dedizierte Domain `https://becc.bridgenta.de`. Die Edge terminiert TLS über moderne Cipher-Suiten (TLS 1.3) mit automatisch verwalteten Zertifikaten.
- **Compute-Dienst**: Ein dauerhaft betriebener Container-Daemon auf Basis von Node.js LTS führt die TypeScript-Laufzeit aus und verhindert Kaltstartverzögerungen regulärer Anfragen.
- **Datenbank & Persistenz**: Eine dedizierte PostgreSQL-Instanz auf persistentem SSD-Speicher in derselben Cloud-Region sichert den Audit-Ledger dauerhaft ab.
- **Sichere Inter-Service-Kommunikation**: Die Verbindung zwischen Anwendungsinstanz und Datenbank erfolgt verschlüsselt über strikt CA-validiertes TLS.

---

## Persistente Datenhaltung & Rollentrennung

Die Datenbank wurde dauerhaft auf persistenten SSD-Speicher umgestellt. Temporäre Speicherbegrenzungen und Ablauf-Timer wurden vollständig beseitigt.

Zur Durchsetzung des Prinzips der geringsten Rechte (*Least Privilege*) wurde eine strikte administrative Rollentrennung implementiert:

| Zugriffsebene | Zugriffsrechte | Verwendungszweck |
|---|---|---|
| **Administrations- & Migrationsebene** | Superuser- / DDL-Rechte / Schemaberechtigung | Ausschließlich für kontrollierte Schema-Migrationen und Initialisierung |
| **Laufzeitebene (Application)** | Streng limitiert: Nur lesende und anfügende Rechte (`SELECT`, `INSERT`) auf Ledger-Tabellen | Regulärer Anwendungsbetrieb / Schreibender Audit-Ledger |

Versuche der regulären Anwendungsrolle, Schemata zu verändern (`CREATE TABLE`), neue Rollen anzulegen oder bestehende Audit-Einträge nachträglich zu modifizieren (`UPDATE`, `DELETE`), werden von der Datenbank-Engine strikt mit `permission denied` abgewiesen.

---

## Strikte Transportsicherheit & CA-Validierung

Bei Cloud-Datenbanken greifen Entwicklungsteams häufig auf unsichere Behelfskonfigurationen wie `sslmode=no-verify` oder `rejectUnauthorized: false` zurück, um Verbindungsprobleme mit Zertifikaten zu umgehen. Dies hebt wesentliche Sicherheitsgarantien auf und exponiert Verbindungen für Man-in-the-Middle-Angriffe (MitM).

Für BECC v2 wurde jeglicher Verzicht auf Zertifikatsprüfungen kategorisch ausgeschlossen:
- **Validierungsrichtlinie**: Strikte Erzwingung von `rejectUnauthorized: true` ohne Ausnahme.
- **Trust Store**: Verifikation gegen das offizielle Mozilla-CA-Wurzelzertifikate-Bündel der Node.js-Laufzeit.
- **Ergebnis**: Wirksamer kryptografischer Schutz des Übertragungswegs zwischen Anwendungsinstanz und Datenbank durch konsequente Zurückweisung selbstsignierter oder manipulierter Zertifikate.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">TLS ohne strikte CA-Validierung bietet nur die Illusion von Sicherheit. Echte Transportverschlüsselung erfordert die konsequente Zurückweisung unbestätigter Zertifikate (rejectUnauthorized: true) als nicht verhandelbare Richtlinie.</p>
</div>

---

## Always-On Runtime & Betriebsverhalten

Die Laufzeitinstanz wurde auf einen dauerhaft aktiven Betriebsmodus umgestellt, wodurch das automatische Herunterfahren bei Inaktivität eliminiert wurde:

- **Vermeidung von Kaltstarts**: Anfragen werden unmittelbar ohne providerbedingte Aufwachpausen beantwortet.
- **Kontinuierlicher Daemon**: Der Hintergrunddienst läuft stabil als ressourcenschonender Daemon mit geringem Speicherbedarf, sodass signifikante Puffer für Lastspitzen verbleiben.
- **Betriebsgrenzen**: Der Dienst ist für kontinuierliche Verfügbarkeit ausgelegt; planmäßige Versions-Rollouts oder Infrastrukturwartungen des Cloud-Providers bedingen jedoch minimale, standardmäßige Neustartintervalle.

---

## Produktiv-Domain & DNS-Ingress

Die Anwendung wurde nahtlos in die bestehende Domain-Architektur von `bridgenta.de` integriert:

- **Hostname**: `https://becc.bridgenta.de`
- **DNS-Verwaltung**: Managed CNAME-Delegation auf die Cloud-Ingress-Infrastruktur.
- **Edge-Zertifikat**: Automatisch verwaltetes TLS-Zertifikat mit vollständiger SNI-Unterstützung und moderner Cipher-Suite (TLS 1.3).
- **Verifikationsstatus**: Verifiziert ohne Weiterleitungsschleifen oder Hostname-Konflikte.

---

## Betriebstelemetrie & Zustandserkennung

Um den Zustand des Dienstes transparent und automatisiert überwachbar zu machen, implementiert BECC v2 standardisierte Schnittstellen zur Zustandserkennung:

- **Service-Index**: Liefert grundlegende Status- und Routing-Informationen für berechtigte Diagnoseaufrufe.
- **Tiefgehende Liveness-Prüfung**: Verifiziert kontinuierlich die interne Systembereitschaft einschließlich einer aktiven, verifizierten Datenbankverbindung.
- **Readiness-Prüfung**: Signalisiert vorgeschalteten Ingress- und Routing-Komponenten die Bereitschaft zur Verarbeitung eingehender Anfragen.
- **Metadaten- & Versionsidentifikation**: Stellt semantische Versionsangaben und Release-Identifikatoren für das Änderungsmanagement bereit.

Alle Diagnosefunktionen wurden einem Sicherheitsreview unterzogen: Sie liefern verlässliche Statusinformationen, legen jedoch zu keinem Zeitpunkt vertrauliche Umgebungsvariablen, Zugangsdaten oder interne Infrastrukturdetails offen.

---

## Datensicherung, PITR-Fähigkeit & Verifizierter Restore-Drill

Ein Datensicherungskonzept ist erst dann bewährt, wenn die Wiederherstellung in der Praxis erfolgreich getestet wurde.

### Kontinuierliche Datensicherung
Die persistente Datenbankinstanz erstellt automatisierte tägliche Snapshots und unterstützt fortlaufende Transaktionsprotokollierung (WAL). Dies ermöglicht eine zeitpunktgenaue Wiederherstellung (Point-in-Time-Recovery, PITR) über ein rollierendes Zeitfenster von sieben Tagen.

### Der Verifizierte Restore-Drill
Um die Wiederherstellbarkeit des Audit-Ledgers nachzuweisen, ohne unverhältnismäßige Zusatzkosten durch parallele Cloud-Instanzen zu verursachen, wurde ein kontrollierter Restore-Drill durchgeführt:

1. **Initialer Datenbestand**: Testdatensätze wurden mit deterministischen Prüfsummen im Ledger erfasst.
2. **Wiederherstellungspfad**: Die Wiederherstellung erfolgte über einen isolierten logischen Export- und Reimport-Prozess in ein separates Zielschema innerhalb der Datenbank.
3. **Integritätsprüfung**: Alle wiederhergestellten Datensätze wurden mit dem Ausgangsbestand verglichen. Der Vergleich bestätigte vollständige Datenparität und strukturelle Identität ohne Datenverlust.
4. **Bereinigung**: Nach erfolgreicher Verifikation wurden die temporären Wiederherstellungsstrukturen rückstandslos entfernt.

---

## Kostendisziplin & Budgettreue

Eine zentrale Leitlinie des Projekts war der Nachweis, dass eine gehärtete, persistente und kryptografisch abgesicherte Backend-Architektur auch mit minimalen Betriebskosten realisierbar ist:

- **Monatliche Budgetobergrenze**: Festgelegt auf maximal **15,00 € pro Monat**.
- **Effektive Kosten**: Die Kombination aus persistentem Managed SSD-Datenbankspeicher und dediziertem Always-On Container-Compute beläuft sich auf ca. 13,00 € bis 14,00 € pro Monat.
- **Wirtschaftlichkeit**: Das Projekt belegt, dass professionelle Standards (Datenpersistenz, strikte CA-TLS, Backups, Monitoring) ohne kostenintensive Enterprise-Verträge erreicht werden können.

---

## Testabdeckung & Automatisierte Verifikation

Die Verlässlichkeit der BECC-Laufzeit wird durch eine umfassende, automatisierte Testsuite in der Testumgebung sichergestellt:

- **Gesamtzahl Tests**: **Über 300 automatisierte Tests** (31 Test-Suiten).
- **Test-Schwerpunkte**:
  - Dienst-Lebenszyklus und Diagnose-Schnittstellen.
  - Standalone-PostgreSQL-Testbed mit Container-Isolation.
  - Rollentrennung, DDL-Restriktionen und Ledger-Integrität.
  - Multi-Instanz-Zertifizierung und Fehlertoleranz.
  - Strict-TLS-Handshake und Ablehnung unverschlüsselter oder unzertifizierter Verbindungen.
- **Ausführungsstatus**: Vollständig erfolgreich in der lokalen Testumgebung und der Continuous-Integration-Pipeline.

---

## Was nachgewiesen wurde vs. Was explizit nicht beansprucht wird

Zur Wahrung technischer Redlichkeit und Vermeidung irreführender Zusagen gilt folgende klare Abgrenzung:

### Verifizierte Nachweise
- Echte Persistenz auf SSD-Speicher in der Region Frankfurt am Main ohne Ablaufdatum.
- Strikte CA-validierte TLS-Verschlüsselung zur Datenbank ohne Sicherheitsabschwächung (`rejectUnauthorized: true`).
- Kontinuierliche Transaktionsarchivierung (7-Tage-PITR-Fähigkeit) und ein erfolgreich durchgeführter logischer Restore-Drill mit nachgewiesener Datenparität.
- Dauerhafter Container-Betrieb zur Vermeidung von Kaltstartlatenzen.
- Dedizierte Subdomain `becc.bridgenta.de` mit Edge-TLS 1.3.
- Über 300 bestandene automatisierte Tests und strikte Einhaltung der monatlichen Budgetgrenze (< 15,00 €).

### Explizit nicht beansprucht
- **Kein Multi-AZ-Hochverfügbarkeitscluster**: Die Datenbank läuft als robuste Einzelinstanz im Managed-Einstiegstarif ohne automatisierten Multi-Rechenzentrum-Hot-Standby-Failover.
- **Keine formelle Konformitäts- oder DR-Zertifizierung**: Es handelt sich um ein strukturiertes Eigenprojekt; formelle Zertifizierungen wie ISO 27001, SOC 2 oder NIS2 wurden nicht beantragt.
- **Kein externer Penetrationstest**: Die Sicherheitsarchitektur basiert auf anerkannten Prinzipien (Least Privilege, Strict TLS), wurde jedoch keinem externen Red-Teaming unterzogen.
- **Keine absolute Ausfallsicherheit / Kein Zero-Downtime-Versprechen**: Versions-Rollouts und Infrastrukturwartungen des Hosters bedingen minimale Neustartintervalle.

---

## Evidenz- und Prüfgrundlagen

Die in dieser Fallstudie dargestellten Architekturentscheidungen und Testergebnisse basieren auf versionierten, repository-gestützten Prüf- und Auditprotokollen:

- **Architektur- und Anforderungsabgleiche**: Systematische Erfassung der operativen Härtungsanforderungen von flüchtigen Testsystemen hin zu persistenten Datenstrukturen.
- **Evaluierung & Budgetkontrolle**: Dokumentierte Provider- und Architekturentscheidungen unter kontinuierlicher Einhaltung des Kostendeckels.
- **Sicherheits- & TLS-Protokolle**: Verifizierte Nachweise zur Durchsetzung strikter Zertifikatsprüfung und Rollentrennung.
- **Test- & Drill-Dokumentation**: Reproduzierbare Prüfberichte zu Datenparität, Wiederherstellbarkeit und automatisierter Testabdeckung.
