---
title: "Wer genau ist dieser KI-Agent?"
description: "Wenn KI-Systeme eigenständig Aktionen in digitalen Arbeitsumgebungen ausführen, reichen Modellnamen und Infrastruktur-Logs nicht aus. Warum eindeutige Identifikation eine wichtige Grundlage für gezielte Kontrolle ist."
category: "ki-agenten"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-09-06"
provenanceRef: "EV-BG-013"
---

Stell dir vor, eine fremde Person betritt dein Büro. Sie setzt sich an deinen Schreibtisch, öffnet deinen Laptop und beginnt, E-Mails an deine Kunden zu schreiben, Dateien im Firmennetzwerk zu verschieben und Termine in deinem Kalender abzusagen.

Deine erste und wichtigste Frage wäre nicht: „Welche Tastatur benutzt du?“ oder „Aus welchem Land stammst du?“

Deine erste Frage wäre: **„Wer bist du – und wer hat dir erlaubt, das zu tun?“**

In der digitalen Welt begegnen wir immer häufiger KI-Systemen, die Aufgaben ausführen. Doch seltsamerweise stellen wir genau diese grundlegende Frage überraschend selten.

![Illustration zu Identität und Berechtigungen eines KI-Agenten.](/images/learning/wer-genau-ist-dieser-ki-agent.jpg)

## Warum das Ausführen von Aktionen die Fragen verändert

Es macht einen wichtigen Unterschied, ob ein KI-System lediglich Inhalte erzeugt oder ob es externe Aktionen ausführt:

- **Inhaltserzeugung (Content Generation):** Ein KI-System fasst Texte zusammen, beantwortet Fragen oder erstellt Entwürfe.
- **Externe Aktionen (External Action):** Ein KI-Agent führt konkrete Befehle in anderen Systemen aus — er liest, schreibt, löscht oder überträgt Daten über Schnittstellen, Datenbanken oder E-Mail-Programme.

Sobald ein KI-System Aktionen in externen Systemen ausführen darf, entstehen zusätzliche Fragen nach Identität, Autorisierung, Berechtigung und Nachvollziehbarkeit.

## Die Kernfragen der Agenten-Governance

Um einen KI-Agenten kontrolliert einzubinden, müssen mehrere Begriffe klar voneinander unterschieden werden:

### 1. Identität (Identity): Wer handelt?
Identität beantwortet die Frage nach der eindeutigen Kennzeichnung. Handelt Agent A oder Agent B? Ohne eindeutige Identität bleibt ein Akteur im System anonym.

### 2. Autorisierung (Authorization): Wer hat die Freigabe erteilt?
Autorisierung beschreibt, welche menschliche oder organisatorische Stelle dem Agenten die Erlaubnis gegeben hat, tätig zu werden.

### 3. Berechtigung (Permissions): Was genau ist erlaubt?
Berechtigungen definieren die technischen Grenzen. Welche Werkzeuge darf der Agent nutzen? Auf welche Daten darf er zugreifen? Welche Befehle sind gesperrt?

### 4. Nachvollziehbarkeit (Traceability): Wer hat was getan?
Nachvollziehbarkeit sorgt dafür, dass jede Aktion nachträglich einem bestimmten Akteur zugeordnet werden kann.

### 5. Entzug von Zugriff (Revocation): Kann das Handeln gestoppt werden?
Wenn ein Agent fehlerhaft arbeitet oder deaktiviert werden muss, sollte der Zugriff schnell und gezielt entzogen werden können.

### 6. Verantwortlichkeit (Accountability): Wer trägt die Verantwortung?
Die Identität eines Agenten beantwortet noch nicht die Frage, wer für seinen Einsatz verantwortlich ist. Identität ist nicht dasselbe wie Verantwortlichkeit. Das System sollte nachvollziehbar machen, welche menschliche oder organisatorische Stelle den Einsatz freigegeben hat und wie die Verantwortung für diesen Einsatz zugeordnet ist.

## Der Unterschied zwischen Provider, Modell und Agent

In der Praxis werden diese Ebenen oft verwechselt:

- **Der Provider** bezeichnet die technische KI-Quelle oder Anbindung, über die ein Modell genutzt wird.
- **Das Modell** ist die konkrete KI-Modellvariante, die Inhalte erzeugt.
- **Der KI-Agent** ist die konkrete Instanz, die mit Werkzeugen, Rollen und Aufträgen in einem System agiert.

Wenn ein System speichert, welches Sprachmodell genutzt wurde, wissen wir noch lange nicht, welcher KI-Agent mit welchen Berechtigungen gehandelt hat.

## Erkenntnisse aus einem echten Projekt

In diesem Projekt können bereits mehrere technische und menschliche Beteiligte voneinander unterschieden werden:

- Das System erkennt den verwendeten **Provider** (`providerId`).
- Das System erfasst das genaue **Modell** (`modelId`).
- Das System identifiziert die menschliche **Prüferin oder den Prüfer** (`reviewerId`).
- Das System kennt die konkrete **Laufzeitsitzung** (`sessionId`).
- Technische Nachweise können kryptografisch signiert werden.

Das zeigt: Mehrere technische und menschliche Beteiligte rund um die Ausführung können bereits getrennt erfasst und zugeordnet werden.

## Die wichtige Beleggrenze

Aus der Analyse unserer Codebasis ergibt sich jedoch eine klare Beleggrenze, die wir transparent festhalten müssen:

1. **Keine eigenständige Agenten-Identität:** Das Projekt unterscheidet Provider und Reviewer, besitzt derzeit aber noch keine dedizierte, eigene Identität für KI-Agenten (`agentId`).
2. **Keine überprüfbare Agenten-Identität:** Signierte technische Nachweise existieren für Provider-Schlüssel, aber das bedeutet nicht, dass ein einzelner KI-Agent eine eigene überprüfbare Identität besitzt.
3. **Keine Vorfälle in der Historie:** Es gibt in der Projektgeschichte keinen dokumentierten Incident, bei dem ein unbekannter KI-Agent Schaden angerichtet hätte.
4. **Keine vollständige produktive Durchsetzung:** Die überprüften Governance-Mechanismen befinden sich aktuell in einem Beobachtungsmodus (Shadow Mode) und sind noch nicht als vollständige produktive Durchsetzung etabliert.

## Die wichtigste Erkenntnis

**Eindeutige Identifikation ist eine wichtige Grundlage für gezielte Kontrolle.**

Mit einer eigenen Agenten-Identität lassen sich Berechtigungen, Aktionen und Freigaben wesentlich genauer zuweisen, überprüfen und im Bedarfsfall gezielt entziehen.

Wenn KI-Agenten für uns handeln, reicht es nicht mehr zu wissen, was sie können. Wir müssen auch wissen, wer handelt.
