---
title: "BECC v2"
subtitle: "Technische Prüfungen, sichere Datenverarbeitung und Cloud-Infrastruktur"
description: "BECC v2 prüft technische Nachweise und bewertet Ergebnisse anhand festgelegter Regeln. Der Backend-Dienst speichert Entscheidungen und Prüfergebnisse in PostgreSQL. Verschlüsselte Verbindungen und begrenzte Zugriffsrechte schützen die Daten. Die Cloud-Infrastruktur unterstützt einen zuverlässigen Betrieb innerhalb der EU."
seoTitle: "BECC v2 – Technische Prüfungen und sichere Cloud-Architektur"
seoDescription: "BECC v2 im Praxisbericht: Prüfregeln, PostgreSQL, sichere Verbindungen und Cloud-Betrieb. Was umgesetzt und getestet wurde – und was noch offen ist."
schemaType: "SoftwareApplication"
sidebar:
  category: "Backend-Entwicklung / Cloud-Infrastruktur"
  status: "In Entwicklung"
  timeline: "Oktober 2026"
  role: "Backend & Cloud Infrastructure Engineer"
  technologies: "Node.js, TypeScript, PostgreSQL, Managed Cloud (EU), TLS"
  devStack:
    - Node.js
    - TypeScript
    - PostgreSQL
    - Managed Cloud (EU)
    - TLS mit Zertifikatsprüfung
    - Datenbank-Zugriffsrechte
    - Automatisierte Tests
  aiBuilders:
    - Antigravity
  notice: "Die beschriebene Entwicklungsphase ist abgeschlossen. Die Fallstudie unterscheidet getestete Funktionen von eingerichteten und noch offenen Prüfungen. Die BECC Operations Console ist ein Interface-Entwurf und kein Nachweis für Live-Monitoring. Interne Zugangsdaten und sicherheitskritische Einstellungen werden nicht veröffentlicht."
---

## Kurzfassung

BECC v2 (*BridGenta Evidence & Constitutional Check*) ist ein regelbasiertes Prüfsystem. Es bewertet technische Nachweise und Ergebnisse anhand festgelegter Regeln und Anforderungen. Die Entscheidungen und Prüfergebnisse werden gespeichert, damit sie später nachvollzogen werden können.

Im Mittelpunkt steht ein Backend-Dienst. Er verarbeitet Prüfungen und nutzt eine PostgreSQL-Datenbank. Für den Betrieb wurde eine Managed-Cloud-Umgebung innerhalb der EU eingerichtet. Dabei waren drei Fragen besonders wichtig: Bleiben die Daten erhalten? Sind die Verbindungen geschützt? Haben Anwendungen nur die Rechte, die sie benötigen?

Für BECC wurde auch eine **Operations Console** entworfen. Sie zeigt, wie sich der Zustand des Dienstes und wichtige Prüfungen darstellen lassen. **Die bisher gezeigte Konsole ist ein Designkonzept.** Ihre Ansichten und Beispielwerte sind kein Nachweis für eine bereits laufende Bedienoberfläche.

Automatisierte Tests prüfen Teile der Anwendung. Zusätzlich wurde ein logischer Export und Import von künstlich erstellten Testdaten erprobt. **Eine vollständige Wiederherstellung aus den Backups des Cloud-Anbieters wurde dagegen noch nicht getestet.** Auch die monatlichen Kosten sind bisher als Kalkulation zu verstehen.

## Warum BECC v2 entstand

Softwareprojekte müssen wichtige Entscheidungen häufig mit Nachweisen begründen. Besonders bei KI-gestützter Entwicklung darf ein überzeugend formulierter Text nicht mit einem geprüften Ergebnis verwechselt werden.

BECC soll technische Ergebnisse mit festgelegten Anforderungen vergleichen und wichtige Entscheidungen dokumentieren. Dabei bedeutet *Constitutional Check*, dass bestimmte Regeln für die Bewertung gelten. Welche konkreten Prüfregeln die aktuelle Version ausführt, muss in der technischen Dokumentation belegt werden.

Die Prüfungen können nur zuverlässig genutzt werden, wenn auch ihre technische Grundlage funktioniert. Deshalb wurde die bisherige Entwicklungsumgebung für einen dauerhaften Betrieb überarbeitet.

## Die fünf Herausforderungen

1. **Daten dauerhaft speichern:** In der früheren Testumgebung konnten Daten nach einer Zeit der Inaktivität verloren gehen.
2. **Backups und Wiederherstellung:** Daten sollten gesichert werden. Zusätzlich musste geklärt werden, welche Wiederherstellung wirklich getestet wurde.
3. **Verbindungen absichern:** Die Anwendung sollte Zertifikate prüfen, bevor sie eine Datenbankverbindung akzeptiert.
4. **Leerlauf vermeiden:** Der Dienst sollte nicht allein wegen längerer Inaktivität automatisch abgeschaltet werden.
5. **Eigene Adresse einrichten:** Der Backend-Dienst sollte unter `becc.bridgenta.de` erreichbar sein.

## Wie die Architektur aufgebaut ist

Für BECC v2 wurde eine Managed-Cloud-Lösung innerhalb der EU gewählt. Sie reduziert den Aufwand, der beim eigenen Betrieb von Servern und Datenbanken entstehen würde. Die Lösung nutzt einen Cloud-Anbieter. Das vereinfacht die Verwaltung, schafft aber auch eine Abhängigkeit von diesem Anbieter.

- **Backend-Dienst:** Führt die Anwendung aus und stellt technische Schnittstellen bereit.
- **PostgreSQL:** Speichert Prüfergebnisse und andere benötigte Datensätze dauerhaft.
- **TLS:** Verschlüsselt Verbindungen. Die Anwendung soll auch die Identität des Datenbankservers über ein gültiges Zertifikat prüfen.
- **Zustandsprüfungen:** Schnittstellen liefern Informationen über den Dienst und seine Bereitschaft für Anfragen.
- **Provider-Backups:** Die Cloud-Plattform stellt Sicherungs- und Wiederherstellungsfunktionen bereit. Ihre tatsächliche Konfiguration und ein vollständiger Wiederherstellungstest werden getrennt bewertet.

Die Architektur wurde bewusst einfach gehalten. Sie ist **kein** hochverfügbares System mit mehreren unabhängigen Rechenzentren.

## Datenbankrechte und Schutz des Audit-Protokolls

BECC nutzt unterschiedliche Datenbankrollen. Die normale Anwendungsrolle erhält nur die Rechte, die sie für ihre Aufgaben benötigt.

In den dokumentierten Rollentests wurden Zugriffe wie `UPDATE`, `DELETE` und `CREATE TABLE` für die eingeschränkte Rolle abgewiesen. Damit soll verhindert werden, dass diese Rolle frühere Einträge verändert oder Tabellen neu anlegt.

Ein solches Audit-Protokoll wird oft *Append-Only* genannt: Neue Einträge werden ergänzt. Bereits gespeicherte Einträge sollen durch die normale Anwendung nicht geändert werden.

**Wichtig:** Diese Regeln machen die Datenbank nicht absolut manipulationssicher. Berechtigte Administratoren, übergeordnete Rollen und Wiederherstellungsprozesse können andere Möglichkeiten haben. BECC verwendet laut bisheriger Fallstudie keine kryptografische Signaturkette, mit der jede nachträgliche Änderung unabhängig erkannt werden könnte.

## Sichere Verbindungen mit TLS

Eine TLS-Verbindung verschlüsselt Daten während der Übertragung. Zusätzlich muss die Anwendung kontrollieren, ob sie wirklich mit dem vorgesehenen Server spricht.

Die BECC-Konfiguration sieht eine strenge Zertifikatsprüfung vor. Der Parameter `rejectUnauthorized: true` ist dabei ein technischer Bestandteil. Ob die vollständige Zertifikatskette des produktiven Cloud-Anbieters geprüft wurde, muss aus den tatsächlichen Verbindungs- und Testnachweisen hervorgehen.

**Technische Erkenntnis:** Verschlüsselung und die Prüfung der Server-Identität sind zwei verschiedene Schutzmaßnahmen. Beides ist wichtig.

## Betrieb und Diagnose

BECC v2 wurde für einen dauerhaft aktiven Betrieb konfiguriert. Das soll Kaltstarts nach längerer Inaktivität vermeiden. Wartung, Neustarts oder neue Versionen können trotzdem zu Unterbrechungen führen.

Unter `becc.bridgenta.de` stellt der Dienst technische Schnittstellen bereit. Dazu gehören `/health`, `/ready` und `/version`.

- **Health:** Gibt Auskunft über den Zustand des Dienstes.
- **Readiness:** Soll zeigen, ob der Dienst Anfragen bearbeiten kann.
- **Version:** Liefert Informationen zur eingesetzten Softwareversion.

Welche Abhängigkeiten die einzelnen Prüfungen tatsächlich testen und wie sie vom Cloud-Anbieter verwendet werden, muss anhand der aktuellen Implementierung bestätigt werden.

## Backups: Was geprüft wurde und was offen ist

Eine vorhandene Backup-Funktion ist noch kein Beweis dafür, dass sich ein verlorenes System vollständig wiederherstellen lässt.

Für BECC wurde nach den vorhandenen Projektberichten ein **logischer Export und Import mit künstlich erstellten Testdaten** durchgeführt. Die Daten wurden innerhalb der vorhandenen Datenbank in einem getrennten Zielschema wieder eingespielt und mit dem Ausgangsbestand verglichen. Die genaue Vergleichsmethode muss noch anhand des Prüfprotokolls bestätigt werden.

Dieser Test zeigt nur die Wiederherstellung über den getesteten Export- und Import-Weg. **Er bestätigt weder eine Wiederherstellung aus Provider-Backups noch eine Point-in-Time-Recovery auf einer neuen Instanz.** Ebenso wurden keine belastbaren Wiederherstellungszeiten (RTO) oder maximalen Datenverluste (RPO) nachgewiesen.

Die vom Anbieter angebotene Wiederherstellung auf einen früheren Zeitpunkt heißt *Point-in-Time-Recovery (PITR)*. Ihr tatsächliches Zeitfenster hängt von Tarif und Konfiguration ab und wird hier bewusst nicht als bereits geprüfter Wert angegeben.

Die vollständige Wiederherstellung aus den Backups des Cloud-Anbieters wurde bisher nicht praktisch getestet. Diese Prüfung bleibt offen und ist in der internen Projektdokumentation festgehalten.

## Automatisierte Tests

In den bisherigen technischen Projektunterlagen werden **mehr als 300 automatisierte Tests in 31 Testsuiten** genannt. Sie betreffen unter anderem Dienststart, Datenbankrechte, TLS-Verbindungen und das Verhalten bei mehreren Dienstinstanzen.

Ein Teil dieser Tests nutzt eine eigenständige PostgreSQL-Testumgebung. Ergebnisse aus einer solchen Umgebung dürfen nicht automatisch als Produktionsnachweis gelten.

Die genaue Zahl der bestandenen, fehlgeschlagenen und übersprungenen Tests sowie der geprüfte Stand der Software müssen aus einem zugeordneten Testbericht übernommen werden. **Die Anzahl von Tests ist nicht dasselbe wie Testabdeckung.**

## Was ist umgesetzt, getestet oder noch offen?

| Bereich | Status | Aussage und Grenze |
|---|---|---|
| Managed-Cloud-Betrieb innerhalb der EU | Umgesetzt | Hosting-Konfiguration laut Projektunterlagen; keine Zusage ohne Unterbrechungen |
| Dauerhafte PostgreSQL-Datenbank | Umgesetzt und betriebsgeprüft | Persistenz im untersuchten Betrieb; kein Beweis für Wiederherstellung nach vollständigem Ausfall |
| Eingeschränkte Datenbankrolle | Lokal getestet | Bestimmte Änderungs- und Verwaltungsbefehle wurden abgewiesen; keine absolute Manipulationssicherheit |
| TLS mit Zertifikatsprüfung | Konfiguriert und teilweise getestet | Lokale Testumgebung und produktive Zertifikatskette getrennt nachweisen |
| Logischer Export und Import | Begrenzt getestet | Künstliche Testdaten innerhalb derselben Datenbank; Vergleichsmethode noch zu belegen |
| Backups des Cloud-Anbieters | Konfiguration zu verifizieren | Vollständige Wiederherstellung nicht getestet |
| Point-in-Time-Recovery | Offen | Tarif, Wiederherstellungsfenster und vollständiger Restore-Test noch zu belegen |
| Mehr als 300 automatisierte Tests | Berichtet | Exakte Ergebnisse und Softwarestand noch mit Prüfbericht verknüpfen |
| Monatliche Betriebskosten | Kalkuliert | Frühere Schätzung: etwa 13–14 €; inklusive Steuern, Speicher und Datenverkehr nicht abschließend geprüft |
| BECC Operations Console | Entwurf | Darstellung eines möglichen Betriebs-Dashboards; angezeigte Beispielwerte sind keine Live-Messungen |

## Welche Grenzen bleiben bestehen?

- **Keine vollständige Wiederherstellungsprüfung:** Ein echter Restore aus einem Provider-Backup auf eine neue Instanz steht aus.
- **Keine garantierte Hochverfügbarkeit:** Der Betrieb umfasst kein belegtes System mit mehreren unabhängigen Rechenzentren und automatischer Umschaltung.
- **Keine externe Sicherheitsprüfung:** Ein externer Penetrationstest ist nicht dokumentiert.
- **Keine formelle Zertifizierung:** Es wird keine ISO-27001-, SOC-2- oder vergleichbare Zertifizierung beansprucht.
- **Kein kryptografisch manipulationssicheres Ledger:** Die vorhandenen Rollenregeln ersetzen keine unabhängige Signatur- oder Hash-Kette.
- **Keine bestätigte Kostenobergrenze:** Die Zahlen sind bisher Schätzungen, keine geprüfte Jahres- oder Monatsabrechnung.

## Was wir aus diesem Projekt gelernt haben

BECC v2 zeigt, dass technische Zuverlässigkeit aus mehreren Teilen besteht: dauerhafte Speicherung, begrenzte Zugriffsrechte, sichere Verbindungen, verständliche Zustandsprüfungen und nachvollziehbare Testergebnisse.

Die wichtigste Erkenntnis lautet: **Eingerichtet bedeutet nicht automatisch getestet. Und ein bestandener Test beweist nur das, was tatsächlich geprüft wurde.**

## Grundlage und Stand der Fallstudie

Diese Fallstudie beschreibt den dokumentierten Entwicklungsstand von BECC v2. Sie basiert auf echten Projektarbeiten und technischen Prüfberichten.

Nicht alle technischen Funktionen sind bereits vollständig geprüft. Offene Nachweise werden im Artikel klar gekennzeichnet. Die Zuordnung einzelner Aussagen zu Testberichten und technischen Versionen wird weiter ergänzt.

Interne Zugangsdaten und sicherheitskritische Informationen werden nicht veröffentlicht.

