---
title: "Wenn die Route existiert, aber die Freigabe fehlt"
description: "Warum die technische Konfiguration einer Zieladresse im Quellcode noch keine fachliche Veröffentlichungsfreigabe darstellt – und wie Architektur-Pipelines den Unterschied absichern."
category: "softwarearchitektur"
learningLevel: "intermediate"
publicationState: "draft"
---

Eine Zieladresse ist im Quellcode eingetragen. Die Seite wird beim Build fehlerfrei erzeugt. Der Link lässt sich im Browser aufrufen. Alles wirkt fertig. Aber damit ist noch nicht bewiesen, dass die Seite auch veröffentlicht werden darf.

In der Softwareentwicklung entsteht an dieser Stelle leicht ein Missverständnis: Quellcode-Einträge werden mit fachlichen Freigaben verwechselt.

## Die Lücke zwischen Quellcode und Freigabe

Beim Erstellen dynamischer oder statischer Unterseiten definieren Entwickler oft Routen-Listen im Quellcode. In der Seitengenerierung von BridGenta gab es dafür beispielsweise ein zentrales Array von Projekt-Kennungen (`activeProjectSlugs`), das alle zu erzeugenden Zielseiten auflistete.

Solange dieses Array lediglich steuert, welche HTML-Dateien der Compiler bauen soll, handelt es sich um eine reine technische Konfiguration.

Problematisch wird es, wenn diese Liste ohne weiteren Abgleich direkt als Veröffentlichungsentscheidung verstanden wird. Wenn eine Unterseite im Quellcode hinterlegt ist, bedeutet das zunächst nur: Der Generator kennt diesen Pfad. Es bedeutet nicht automatisch, dass der Inhalt geprüft, rechtlich freigegeben oder für Suchmaschinen freigeschaltet ist.

## Quellcode-Fakt vs. Governance-Entscheidung

Für eine verlässliche Qualitäts- und Release-Sicherung müssen zwei Ebenen sauber getrennt werden:

1. **Quellcode-Fakt (Technical Routing Fact):** Die Route ist im Quellcode hinterlegt. Die HTML-Datei wird beim Build ohne Syntaxfehler erzeugt.
2. **Fachliche Freigabe (Governance Clearance):** Der Inhalt wurde geprüft, alle Veröffentlichungskriterien sind erfüllt und die Seite ist explizit zur Veröffentlichung zugelassen.

```text
Route im Quellcode hinterlegt ≠ Fachlich geprüft ≠ Zur Veröffentlichung freigegeben
```

Wenn ein Build-Prozess nur prüft, ob die Route im Quellcode existiert, übersieht er den Freigabestatus. Die Seite wird öffentlich bereitgestellt, obwohl wichtige Freigabekriterien noch offen sein können.

## Wie die Architektur beide Ebenen trennt

Um diese Verwechslung zu verhindern, trennt die Verifikations-Pipeline die technische Routen-Erzeugung von der Freigabe-Prüfung:

1. **Routen-Erzeugung:** Der Generator baut die HTML-Seite anhand der technischen Pfadangaben.
2. **Freigabe-Inspektion:** Vor einer Veröffentlichung prüft ein automatisierter Check, ob für diese Zieladresse eine gültige Freigabe im System vorliegt.

Sollte für eine erzeugte Route die erforderliche Freigabe fehlen, meldet der Prüfprozess einen Fehlerstatus. Damit dieser Fehlerstatus das Veröffentlichen bricht, muss der Check verbindlich in das Release-Gate eingebunden sein.

## Übertragbare Erkenntnis für Softwareprojekte

Entwicklerteams sollten technische Pfad-Konfigurationen niemals als Ersatz für inhaltliche oder rechtliche Veröffentlichungsentscheidungen nutzen.

Das Prinzip ist auf alle Webanwendungen übertragbar, bei denen Routen-Generierung und fachliche Veröffentlichungsrechte getrennt verwaltet werden. Indem Verifikations-Pipelines Quellcode-Fakten strikt von fachlichen Freigaben unterscheiden, verhindern sie, dass technisch erreichbare Seiten ohne vollständige Veröffentlichungsfreigabe online gehen.
