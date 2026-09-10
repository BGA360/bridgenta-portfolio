---
title: "Was ist ein KI-Agent? Einfach erklärt"
description: "Was ist ein KI-Agent? Einfach erklärt: Der Unterschied zwischen KI-Modell, Provider, Chatbot und Agent – mit verständlichen Beispielen, Abläufen und Software-Regeln."
category: "ki-agenten"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-09-10"
provenanceRef: "EV-BG-014"
---

Stell dir vor, du gibst einer digitalen Assistenz nicht nur eine Frage, sondern einen Auftrag:

**„Finde drei passende Termine für ein Kundengespräch, prüfe meinen Kalender und bereite eine Einladung vor.“**

Ein normales KI-System könnte dir erklären, wie du dabei vorgehen kannst.

Ein KI-Agent geht einen Schritt weiter. Er kann den Auftrag zerlegen, Informationen prüfen, Werkzeuge verwenden und innerhalb festgelegter Grenzen konkrete Aktionen vorbereiten oder ausführen.

Genau hier beginnt der Unterschied.

> **Ein KI-Agent kann mehr tun, als nur eine Antwort zu erzeugen. Je nach Aufbau kann er einen Auftrag über mehrere Schritte bearbeiten.**


## Was ist ein KI-Agent?

Ein KI-Agent ist ein Softwaresystem, das einen vorgegebenen Auftrag mithilfe von KI verarbeitet, nächste Schritte bestimmen kann und – je nach Architektur – Kontext, Zustände, Werkzeuge oder andere Systeme einbezieht.

Ein KI-Modell kann ein wichtiger Bestandteil davon sein. Das Modell allein ist jedoch noch kein Agent.

![Diagramm eines möglichen KI-Agentensystems: Ein KI-Modell ist Teil einer größeren Software mit Auftrag, Kontext, Regeln und möglichen Werkzeugen. Je nach Aufbau kann auch eine menschliche Freigabe vorgesehen sein.](/images/learning/was-ist-ein-ki-agent-einfach-erklaert.webp)


Das kann zum Beispiel bedeuten, dass ein Agent:

* Informationen aus einer Datenbank abruft,
* eine Schnittstelle (API) aufruft,
* Dateien liest oder erstellt,
* Termine prüft,
* E-Mails vorbereitet,
* Aufgaben anlegt,
* Ergebnisse bewertet,
* oder den nächsten Schritt eines Prozesses auswählt.

Wichtig ist dabei eine klare Unterscheidung:

> **Das KI-Modell allein ist noch kein Agent.**

Ein Sprachmodell kann Texte erzeugen, Fragen beantworten oder Informationen zusammenfassen. Für ein Agentensystem können je nach Architektur weitere Funktionen hinzukommen. Dazu können zum Beispiel Kontext, Zustände, Werkzeuge, Regeln oder andere Systeme gehören.


## Modell, Provider und Agent sind nicht dasselbe

Die drei Begriffe meinen verschiedene Dinge:

### Das Modell
Das Modell verarbeitet Eingaben und erzeugt daraus Ausgaben. Es kann Text verstehen, Inhalte erzeugen, Informationen strukturieren oder mögliche nächste Schritte vorschlagen.

### Der Provider
Der Provider stellt das Modell oder die technische Infrastruktur bereit (zum Beispiel OpenAI oder Anthropic). Er kümmert sich um Server, Zugriff und Abrechnung. Er ist aber nicht automatisch der Agent.

### Der Agent
Der Agent ist das Softwaresystem, das einen Auftrag verfolgt. Er kann ein Modell mit Werkzeugen, Regeln, Zuständen und anderen technischen Komponenten verbinden.

```text
Provider
   ↓
Modell
   ↓
Agentenlogik
   ↓
Werkzeuge
   ↓
Aktionen
```

Deshalb gelten zwei wichtige Grundregeln:

```text
MODEL != AGENT

PROVIDER != AGENT
```


## Ist ein Chatbot ein KI-Agent?

Nicht automatisch.

Ein Chatbot ist ein System für Gespräche mit Nutzern. Manche Chatbots beantworten nur einfache Fragen. Andere Chatbots sind mit weiteren Funktionen ausgestattet.

Ein einfacher Chatbot reagiert meist nur auf eine Nachricht und erzeugt eine direkte Antwort:

```text
Nutzer:   "Wie funktioniert ein VPN?"
Chatbot:  "Ein VPN verschlüsselt Daten..."
```

Hier endet das Gespräch nach der Textantwort.

Ein agentischer Chatbot führt dagegen weitere Schritte aus:

```text
Nutzer:   "Prüfe meine Serverkonfiguration und erstelle eine Aufgabenliste."
Agent:    1. Liest Konfigurationsdaten
          2. Prüft Regeln
          3. Identifiziert Probleme
          4. Erstellt Aufgaben
          5. Speichert das Ergebnis
```

Ein Chatbot kann also Teil eines Agentensystems sein.

> **Chatbot bedeutet nicht automatisch Agent.**


## Ist eine Automatisierung ein KI-Agent?

Auch hier lautet die Antwort: Nicht automatisch.

Bei einer klassischen Automatisierung sind die möglichen Abläufe vorher in der Software festgelegt:

```text
Wenn Formular abgesendet
→ E-Mail senden
→ Eintrag in Datenbank erstellen
→ Aufgabe erzeugen
```

Eine solche Automatisierung kann Bedingungen, Verzweigungen, Schleifen oder Fehlerbehandlungen enthalten. Die Pfade sind jedoch im Code vorgegeben.

In einem agentischen System kann ein KI-Modell zusätzlich helfen, unstrukturierte Informationen zu deuten oder einen passenden nächsten Schritt vorzuschlagen:

```text
Kundenanfrage erhalten
        ↓
Inhalt durch Sprachmodell analysieren
        ↓
Anfragetyp bestimmen
        ↓
Passendes Werkzeug wählen
        ↓
Aktion ausführen
```

Auch bei einem agentischen Prozess braucht die Software klare Grenzen.


## Wie funktioniert ein KI-Agent?

Ein vereinfachter Agentenablauf sieht wie folgt aus:

```text
               AUFTRAG & ZIEL
                     │
                     ▼
           INFORMATIONEN AUFNEHMEN
                     │
                     ▼
             KONTEXT VERSTEHEN
                     │
                     ▼
         NÄCHSTEN SCHRITT BESTIMMEN
                     │
                     ▼
             WERKZEUG AUSWÄHLEN
                     │
                     ▼
              AKTION AUSFÜHREN
                     │
                     ▼
              ERGEBNIS PRÜFEN
                     │
                     ▼
   (Ziel erreicht?) ─── (Nein: Nächster Schritt)
         │
         ▼ (Ja)
  [ AUFTRAG ABGESCHLOSSEN ]
```

Dieser Ablauf kann einmal stattfinden oder sich schrittweise wiederholen. Gehen wir die einzelnen Bausteine durch.


## 1. Ziel oder Auftrag

Ein Agent braucht zunächst eine klare Aufgabenstellung:

* „Finde drei passende Fahrzeuge mit diesen Eigenschaften.“
* „Analysiere diese Support-Anfrage und ordne sie der richtigen Kategorie zu.“
* „Prüfe diese Inhalte vor der Veröffentlichung.“

Das Ziel bestimmt, was der Agent erreichen soll. Ein unklar formuliertes Ziel führt meist zu falschen Schritten.


## 2. Eingaben und Kontext

Der Agent benötigt Informationen, um seinen Auftrag auszuführen:

* Nutzerangaben,
* Dokumente,
* frühere Ergebnisse,
* Datenbankeinträge,
* Antworten von Schnittstellen,
* Systemzustände,
* Regeln oder Anleitungen.

Diese Informationen bilden den **Kontext**. Fehlen wichtige Informationen, kann der Vorschlag falsch oder unvollständig sein.


## 3. Entscheidungslogik

Der Agent muss bestimmen, was als Nächstes passieren soll:

```text
Auftrag: "Bearbeite diese Anfrage."

Mögliche Entscheidung:
→ Weitere Informationen anfordern
oder
→ Datenbank prüfen
oder
→ Anfrage an einen Menschen weitergeben
```

Je nach Architektur kann ein KI-Modell vorschlagen, welcher Schritt sinnvoll ist. Wichtig: Die Entscheidung des KI-Modells ist nicht automatisch die endgültige Systementscheidung. Die umgebende Software kann vorgeschlagene Schritte prüfen, begrenzen oder festlegen.


## 4. Werkzeuge (Tools)

Werkzeuge ermöglichen es einer Software, mit anderen Systemen zu arbeiten. Ein Agentensystem kann solche Werkzeuge nutzen.

Ein Werkzeug kann zum Beispiel sein:

* eine Suchfunktion,
* eine Datenbankabfrage,
* eine Schnittstelle (API),
* ein Dateisystem,
* ein Kalender,
* ein E-Mail-System,
* ein Kundenverwaltungssystem (CRM),
* ein Browser,
* oder eine interne Unternehmensanwendung.

Das Modell selbst öffnet nicht den Kalender. Das Softwaresystem stellt eine Funktion bereit, über die der Kalender aufgerufen werden kann.


## 5. Aktionen: Text erzeugen ist nicht gleich Handeln

Eine Aktion verändert etwas oder löst einen Vorgang außerhalb des Sprachmodells aus.

Diese Unterscheidung ist entscheidend:

```text
VORSCHLAG (KI-Modell):          "Text für E-Mail erzeugen"
TATSÄCHLICHE AKTION (Software): "E-Mail über Server absenden"

VORSCHLAG (KI-Modell):          "SQL-Abfrage erstellen"
TATSÄCHLICHE AKTION (Software): "Datenbankeintrag verändern"
```

Sobald ein KI-System reale Aktionen ausführt, steigen die Anforderungen an Kontrolle, Berechtigungen und Nachvollziehbarkeit deutlich an.


## Autonomie: Ein Spektrum von Stufen

KI-Agenten werden häufig als „autonom“ bezeichnet. In der Praxis ist Autonomie jedoch kein Schalter für „An“ oder „Aus“, sondern ein Spektrum von Stufen.

Man kann Autonomie zum Beispiel vereinfacht in solche Stufen einteilen:

```text
Stufe 1: Nur Vorschläge machen
Stufe 2: Werkzeugaufrufe vorbereiten
Stufe 3: Bestimmte Aktionen ausführen (z. B. Suchen)
Stufe 4: Mehrere Schritte planen
Stufe 5: Längere Prozesse innerhalb eines Rahmens ausführen
```

Mehr Autonomie bedeutet nicht automatisch bessere Software.

> **Sicherheitsregel:**  
> Je mehr ein Agent selbst entscheiden und ausführen darf, desto wichtiger werden technische Grenzen und Sicherheitskontrollen.


## Zustand (State) und Gedächtnis (Memory)

Bei einem Ablauf müssen Informationen oft über mehrere Schritte verfügbar bleiben. Dabei begegnen uns zwei wichtige Begriffe: State und Memory.

### Zustand (State)
Zustand (State) beschreibt, wo sich ein Ablauf gerade befindet. Zum Beispiel: *„Schritt 1 ist fertig. Schritt 2 wartet auf Eingabe.“* Wie lange dieser Zustand gespeichert wird, hängt von der Architektur ab.

### Gedächtnis (Memory)
Memory sind gespeicherte Informationen, die später wieder bereitgestellt werden können. Zum Beispiel Nutzerpräferenzen, frühere Entscheidungen oder Kundenhistorien. Wie lange sie gespeichert werden, hängt vom System ab.

```text
ZUSTAND (State):     Information darüber, wo sich ein Ablauf gerade befindet.
GEDÄCHTNIS (Memory): Gespeicherte Information, die später wieder bereitgestellt werden kann.
```


## Planung (Planning): Vordefiniert oder dynamisch?

Wie bestimmt der Agent die Reihenfolge seiner Schritte?

* **Vordefinierte Planung:** Die Abfolge der Schritte steht fest im Programmcode. Das KI-Modell hilft nur bei Inhalten oder Interpretationen.
* **Dynamischere Planung:** Bei einer dynamischeren Planung kann ein KI-Modell mögliche nächste Schritte oder eine Reihenfolge vorschlagen. Die Software kann diese Vorschläge prüfen oder begrenzen.

Beide Ansätze können auch kombiniert werden:

```text
DETERMINISTISCHE SOFTWARE (Feste Regeln & Grenzen)
+
KI-MODELL (Hilft bei Interpretation & Auswahl)
=
STABILER AGENTISCHER PROZESS
```


## Welche Rolle spielen APIs?

Das Wort **API** steht für *Application Programming Interface*. Auf Deutsch bedeutet das: **Technische Schnittstelle**.

Über Schnittstellen kommuniziert eine Software mit anderer Software:

```text
Kalender-API ──► Freie Termine lesen
CRM-API      ──► Kundendaten abrufen
E-Mail-API   ──► Nachricht vorbereiten
Ticket-API   ──► Aufgabe erstellen
```

Je nach Architektur kann ein KI-Modell vorschlagen, welches Werkzeug benötigt wird. Die eigentliche Ausführung übernimmt die Schnittstelle der Software.


## Wo liegen die Grenzen eines KI-Agenten?

Ein Agent sollte niemals alles tun dürfen, was technisch möglich wäre. Ein sicheres System definiert klare Grenzen:

* **Berechtigungen:** Welche Systeme darf der Agent aufrufen?
* **Autorisierung:** Wer hat erlaubt, dass dieser Auftrag ausgeführt wird?
* **Scope:** Welche Aktionen gehören exakt zu dieser Aufgabe?
* **Human Approval:** Bei welchen kritischen Aktionen muss ein Mensch zustimmen?
* **Technische Regeln:** Welche Aktionen werden unabhängig vom Modell sofort blockiert?

Ein abgesichertes System unterscheidet strikt:

```text
Erlaubt:    ✓ Kundendaten lesen
            ✓ Termine prüfen
            ✓ E-Mail-Entwurf erstellen

Verboten:   ✗ E-Mail ohne Freigabe senden
            ✗ Kundendaten löschen
            ✗ Rechte verändern
```


## Fähigkeit ist nicht gleich Berechtigung

Dieser Unterschied gehört zu den wichtigsten Architektur-Prinzipien:

```text
+-------------------------------------------------------------------+
|                       FÄHIGKEIT (Ability)                         |
|         Was das System technisch tun KÖNNTE.                      |
+-------------------------------------------------------------------+
                                  !=
+-------------------------------------------------------------------+
|                      BERECHTIGUNG (Authorization)                 |
|         Was das System nach den Regeln tun DARF.                  |
+-------------------------------------------------------------------+
```

> **Kernsatz:**  
> Was ein Agent technisch kann, ist nicht automatisch das, was er tun darf.


## Warum Identität wichtig wird

Sobald automatisierte Systeme im Namen von Nutzern handeln, stellt sich die Frage nach Verantwortung und Identität.

Man muss unterscheiden können: Welcher Provider wurde genutzt? Welches Modell war beteiligt? Welcher Nutzer hat den Auftrag gestartet? Wer hat eine Freigabe erteilt?

[Erfahre mehr über Identität, Kontrolle und die Governance von KI-Agenten](/lernen/wer-genau-ist-dieser-ki-agent/).

Ein KI-Modell ist keine handelnde Person. Welche Aktionen möglich sind, bestimmt die umgebende Software. Dort können auch Berechtigungen und Freigaben festgelegt werden.


## Warum Nachvollziehbarkeit wichtig ist

Wenn ein Agent mehrere Schritte ausführt, muss man den Ablauf später prüfen können. Nachvollziehbarkeit (**Traceability**) bedeutet, dass wichtige Schritte und Entscheidungen später geprüft werden können. Ohne gute Nachvollziehbarkeit ist es deutlich schwieriger, Fehler später zu untersuchen. Sie beantwortet sieben Fragen:

1. Was war der genaue Auftrag?
2. Welche Daten lagen im Kontext vor?
3. Welcher Schritt wurde gewählt?
4. Welches Werkzeug wurde aufgerufen?
5. Welche Parameter wurden übergeben?
6. Was war das Ergebnis der Aktion?
7. Gab es eine menschliche Freigabe?


## Was kann bei KI-Agenten schiefgehen?

Auch ein Sprachmodell kann falsche oder ungeeignete Ergebnisse erzeugen. Typische Fehler sind zum Beispiel:

* **Falscher Kontext:** Informationen fehlen oder sind veraltet.
* **Falsche Interpretation:** Das Modell versteht den Auftrag falsch.
* **Falsche Werkzeugauswahl:** Das gewählte Werkzeug passt nicht zur Aufgabe.
* **Falsche Parameter:** Das Werkzeug wird mit fehlerhaften Werten aufgerufen.
* **Halluzination:** Das Modell erfindet Behauptungen ohne Beleg.
* **Zu große Berechtigungen:** Der Agent hat mehr Rechte als notwendig.
* **Schleifen:** Der Agent wiederholt Schritte ohne Fortschritt.
* **Fehlende Nachvollziehbarkeit:** Der Grund für eine Aktion ist nachträglich unklar.
* **Unklare Identität:** Es ist nicht nachweisbar, welches System gehandelt hat.

Diese Beispiele zeigen: Bei einem KI-Agenten geht es nicht nur um KI. Auch die Software rund um die KI muss sicher und gut aufgebaut sein.


## KI-Agenten brauchen normale Softwarearchitektur

KI-Agenten ersetzen normale Softwareentwicklung nicht. Sie sind selbst Teil eines Softwaresystems.

Ein Agenten-System braucht weiterhin:

* Sichere Schnittstellen,
* Benutzeranmeldung und Authentifizierung,
* Rechteverwaltung,
* Fehlerbehandlung,
* Zustandsverwaltung,
* Protokollierung (Logging),
* Automatisierte Tests,
* Systemüberwachung (Monitoring),
* Sicherheitskontrollen,
* Klare Verantwortlichkeiten.

Das KI-Modell ist nur eine Komponente im Gesamtsystem. Der Rest ist bewährte Softwarearchitektur.


## Deterministische Regeln bleiben wichtig

Ein KI-Modell arbeitet probabilistisch (auf Basis von Wahrscheinlichkeiten). Bestimmte wichtige Regeln sollten fest in der Software stehen. Solche Regeln nennt man **deterministisch**:

```text
IF Freigabe_Erhalten == FALSE  ──► AKTION STOPPEN
IF Rolle != "ADMIN"            ──► ZUGRIFF VERWEIGERN
IF Parameter_Ungültig          ──► API-AUFRUF BLOCKIEREN
```

Wie solche festen Regeln zuverlässig verankert bleiben, [wenn das KI-Modell im Softwareprojekt wechselt](/lernen/ki-modell-wechsel-softwareprojekt-source-of-truth-architektur-drift/), ist für die Stabilität des Gesamtsystems entscheidend.


## Human-in-the-Loop: Der Mensch als Prüfinstanz

Das Prinzip **Human-in-the-Loop** bedeutet, dass ein Mensch an kritischen Stellen im Ablauf eingebunden bleibt.

Bei kritischen Aktionen kann die Software eine menschliche Freigabe verlangen (zum Beispiel beim Löschen von Daten, Senden von Nachrichten oder Auslösen von Zahlungen):

```text
Agent analysiert & bereitet vor
              │
              ▼
Menschliche Prüfung & Freigabe  ──►  (Abgelehnt: Stopp / Korrektur)
              │
              ▼ (Genehmigt)
Software führt Aktion aus
```

Der Agent übernimmt die Recherche und Vorbereitung. Die finale Freigabe für kritische Aktionen kann beim Menschen liegen.


## Was sehen wir in unserem eigenen Softwareprojekt?

Unser eigenes Projekt ist hier kein vollständiges Beispiel für einen KI-Agenten. Aber wir können darin einige Bausteine sehen, die auch für Agentensysteme wichtig sind:

1. **Feste Workflows:**  
   Die Software gibt die Reihenfolge der Schritte vor. Dafür nutzt sie feste Regeln für den aktuellen Zustand. Wie [Ausführungsreihenfolge und Schnittstellen-Aufrufe](/lernen/ausfuehrungsreihenfolge-vs-datenabhaengigkeit-schnittstellen-aufruf-ki-entwicklung/) im Detail geregelt werden, bestimmt die Architektur außerhalb des KI-Modells.

2. **Klare Rollen:**  
   Wir unterscheiden strikt zwischen der Identität des Anbieters (`providerId`), der Modell-ID (`modelId`), dem Sitzungs-Zustand (`sessionId`) und der menschlichen Prüfinstanz (`reviewerId`).

3. **Menschliche Freigabegrenzen:**  
   Für bestimmte Ergebnisse gibt es definierte menschliche Prüfschritte. Dabei wird auch geprüft, welche Entscheidungen eine Prüferin oder ein Prüfer treffen darf.


## Ein mögliches Gesamtbild eines KI-Agentensystems

Ein Agentensystem kann zum Beispiel so aufgebaut sein:

```text
┌───────────────────────────────────────────────────────────────────┐
│                    RAHMEN & SICHERHEIT                            │
│  (Identität · Autorisierung · Berechtigungen · Regeln · Logging)  │
└───────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                     EINGABE & KONTEXT                             │
│           (Auftrag · Dokumente · Hintergrunddaten)                │
└───────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                    KI-MODELL (Sprachkern)                         │
│          (Versteht Sprache · Schlägt Schritte vor)                │
└───────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                     WERKZEUGE & APIs                              │
│         (Suchen · Lesen · Datenbanken · Programme)                │
└───────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                    MENSCHLICHE FREIGABE                           │
│            (Prüfung kritischer Aktionen)                          │
└───────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                    ERGEBNIS & RÜCKMELDUNG                         │
│          (Ziel erreicht oder nächsten Schritt starten)            │
└───────────────────────────────────────────────────────────────────┘
```

Das eigentliche Agentensystem besteht aus weit mehr als nur dem KI-Modell in der Mitte.


## Die wichtigsten Begriffe auf einen Blick

| Begriff | Einfache Bedeutung |
|---|---|
| **KI-Modell** | Verarbeitet Eingaben und erzeugt daraus Ausgaben. |
| **Provider** | Stellt Modelle oder KI-Infrastruktur bereit. |
| **KI-Agent** | Softwaresystem, das einen Auftrag mithilfe von KI verarbeitet und je nach Architektur weitere Komponenten oder Systeme einbezieht. |
| **Tool** | Technische Funktion oder Schnittstelle, die ein System nutzen kann. |
| **Aktion** | Eine tatsächliche Änderung oder ein Aufruf in einem anderen System. |
| **Kontext** | Informationen, die für die aktuelle Aufgabe bereitstehen. |
| **State** | Information darüber, wo sich ein Ablauf gerade befindet. |
| **Memory** | Gespeicherte Information, die später wieder bereitgestellt werden kann. |
| **Planning** | Bestimmung oder Vorschlag möglicher nächster Schritte. |
| **Permission** | Technische Erlaubnis für eine Ressource oder Aktion. |
| **Authorization** | Freigabe, eine bestimmte Handlung ausführen zu dürfen. |
| **Identity** | Eindeutige Kennzeichnung eines Akteurs. |
| **Traceability** | Nachvollziehbarkeit wichtiger Schritte und Entscheidungen. |
| **Revocation** | Möglichkeit, Zugriff oder Berechtigungen wieder zu entziehen. |
| **Accountability** | Zuordnung, wer für den Einsatz und den Ablauf verantwortlich ist. |


## Bedeutung für die KI-gestützte Softwareentwicklung

Softwareentwicklung mit KI bedeutet heute weit mehr als nur Prompts zu schreiben.

Wer moderne KI-Systeme baut, verbindet mehrere Ebenen:

```text
Anforderungen
      ↓
Architektur & Regeln
      ↓
Agentenlogik
      ↓
KI-Modell
      ↓
Werkzeuge & APIs
      ↓
Berechtigungen
      ↓
Menschliche Freigabe
      ↓
Nachvollziehbarkeit
```

Die erste Frage bei der Entwicklung eines KI-Agenten sollte deshalb nicht nur lauten: *„Welches Modell verwenden wir?“*

Sondern vor allem:

> **„Was soll das System tun, welche Werkzeuge braucht es, welche Grenzen gelten und wie ist der Ablauf nachvollziehbar?“**


## Die wichtigste Erkenntnis

Ein KI-Agent ist ein Softwaresystem, das einen vorgegebenen Auftrag mithilfe von KI verarbeitet, nächste Schritte bestimmen kann und – je nach Architektur – Kontext, Zustände, Werkzeuge oder andere Systeme einbezieht.

Ein KI-Modell kann ein wichtiger Bestandteil davon sein.

> **Aber das Modell allein ist noch kein Agent.**

Sobald ein System nicht nur antwortet, sondern handelt, werden Identität, Berechtigungen, Kontrolle und Nachvollziehbarkeit zu einem unverzichtbaren Teil der Softwareentwicklung.
``