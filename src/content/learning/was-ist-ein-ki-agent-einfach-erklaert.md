---
title: "Was ist ein KI-Agent? Einfach erklärt"
description: "Was ist ein KI-Agent? Einfach erklärt: Wie sich Agent, KI-Modell, Provider, Chatbot und Automatisierung unterscheiden und welche Rolle Kontext, Werkzeuge und Software-Regeln spielen."
category: "ki-agenten"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-09-10"
provenanceRef: "EV-BG-014"
---
## Was ist ein KI-Agent?

Ein KI-Agent ist mehr als ein einfaches KI-Modell oder ein Chatbot. Während ein KI-Modell lediglich Text auf Basis von Wahrscheinlichkeiten generiert, kombiniert ein KI-Agent dieses Modell mit definierten Abläufen, Schnittstellen und Zielvorgaben, um komplexe Aufgaben schrittweise zu bearbeiten.

Um den Begriff im Alltag und in der Softwareentwicklung richtig einzuordnen, hilft die Unterscheidung zwischen allgemeinen Konzepten und den konkreten Eigenschaften, die in einem Softwaresystem tatsächlich umgesetzt sind.

![Diagramm eines möglichen KI-Agentensystems: Ein KI-Modell ist Teil einer größeren Software mit Auftrag, Kontext, Regeln und möglichen Werkzeugen. Je nach Aufbau kann auch eine menschliche Freigabe vorgesehen sein.](/images/learning/was-ist-ein-ki-agent-einfach-erklaert.webp)

Das KI-Modell kann ein wichtiger Teil eines Agentensystems sein. Das Modell allein ist jedoch noch kein Agent.

## Der Unterschied zwischen KI-Modell, Chatbot und KI-Agent

In der Praxis werden die Begriffe KI-Modell, Provider, Chatbot und KI-Agent häufig verwechselt. Sie beschreiben jedoch unterschiedliche Ebenen eines Gesamtsystems:

- **KI-Modell (z. B. GPT-4, Claude):** Der mathematische Kern, der nach der Eingabe von Text eine Wahrscheinlichkeitsberechnung durchführt und eine Antwort erzeugt. Das Modell selbst trifft keine unabhängigen Entscheidungen und führt von sich aus keine Aktionen aus. Wie Regeln außerhalb des Modells verankert bleiben, [wenn das KI-Modell im Softwareprojekt wechselt](/lernen/ki-modell-wechsel-softwareprojekt-source-of-truth-architektur-drift/), ist für die Stabilität entscheidend.
- **Provider (z. B. OpenAI, Anthropic):** Der Dienstleister oder die technische Infrastruktur, die das KI-Modell bereitstellt, aufruft und die Abrechnung sowie den Zugriff steuert.
- **Chatbot:** Eine Benutzeroberfläche, die Texteingaben an ein KI-Modell weiterleitet und die Antwort an den Nutzer zurückgibt. Der Ablauf beschränkt sich meist auf eine direkte Frage-Antwort-Interaktion.
- **KI-Agent:** Ein Softwaresystem, das ein KI-Modell einbettet und mit Logik, Kontext und Arbeitsfunktionen ausstattet. Ein Agent führt mehrere Schritte nacheinander aus, wertet Zwischenergebnisse aus und arbeitet auf ein festgelegtes Ziel hin.

## Wie funktioniert ein KI-Agent?

Ein KI-Agent arbeitet typischerweise in einem mehrstufigen Kreislauf aus Wahrnehmung, Verarbeitung und Ausführung:

1. **Kontext aufnehmen:** Der Agent erhält eine Aufgabenstellung zusammen mit allen relevanten Informationen (z. B. Dokumenten, Projektregeln oder Datenbeständen).
2. **Schritte planen oder steuern:** Auf Basis des KI-Modells oder vorgegebener Abläufe wird entschieden, welcher nächste Schritt zur Erfüllung der Aufgabe notwendig ist.
3. **Werkzeuge und Schnittstellen nutzen:** Um Aufgaben außerhalb reiner Textgenerierung zu lösen, kann der Agent auf definierte Schnittstellen (APIs), Datenbanken oder Prüfwerkzeuge zugreifen.
4. **Ergebnisse bewerten:** Die Rückmeldungen aus den Schnittstellen oder Prüfschritten fließen zurück in den Kontext, um das Ergebnis zu kontrollieren oder Korrekturen einzuleiten.

## Allgemeine Vorstellungen vs. konkreter Systemstand

In Fachdiskussionen wird der Begriff „KI-Agent“ oft sehr weit ausgelegt. Um Missverständnisse zu vermeiden, unterscheidet diese Übersicht zwischen allgemein denkbaren Prinzipien und den tatsächlich nachgewiesenen Eigenschaften des Systemstands:

### Allgemein denkbare Eigenschaften (Konzeptionell)
Allgemein versteht man unter fortgeschrittenen KI-Agenten oft autonome Systeme, die eigenständig neue Werkzeuge wählen, frei mit der Außenwelt interagieren, ein langfristiges Gedächtnis aufbauen oder sich selbst neue Berechtigungen erteilen.

### Konkret im Systemstand umgesetzte Eigenschaften (Nachgewiesen)
Im aktuellen Systemstand von BridGenta zeigt sich ein präzise geregeltes Bild:
- **Statische Workflows statt freier Autonomie:** Der Gesamtablauf folgt einer festgelegten Zustandsmaschine (`RuntimeStateMachine`), in der [Ausführungsreihenfolge und Schnittstellen-Aufrufe](/lernen/ausfuehrungsreihenfolge-vs-datenabhaengigkeit-schnittstellen-aufruf-ki-entwicklung/) deterministisch geregelt sind.
- **Strikte Identitäts- und Rollentrennung:** Das System unterscheidet eindeutig zwischen Provider-Identität (`providerId`), Modell (`modelId`), Sitzung (`sessionId`) und menschlicher Prüfinstanz (`reviewerId`). Eine eigene, eigenständige „Agenten-Identität“ ist im Systemstand nicht etabliert.
- **Menschliche Freigabegrenzen (Human-in-the-Loop):** Bevor Ergebnisse übernommen oder freigegeben werden, durchlaufen sie definierte Prüf- und Review-Schritte durch autorisierte Personen.

## Fazit: KI-Agenten als strukturierte Softwaresysteme

Ein KI-Agent ist kein magisches, eigenständiges Wesen, sondern ein sorgfältig konstruiertes Softwaresystem. Seine Leistung entsteht durch das Zusammenspiel aus der Sprachkompetenz eines KI-Modells, klaren Leitplanken, strukturierter Kontextbereitstellung und kontrollierter Werkzeugnutzung.

[Erfahre mehr über Identität, Kontrolle und die Governance von KI-Agenten](/lernen/wer-genau-ist-dieser-ki-agent/).
