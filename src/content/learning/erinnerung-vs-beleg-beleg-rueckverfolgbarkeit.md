---
title: "Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit"
description: "Warum selbst ein echtes Ereignis noch kein belastbarer Projektnachweis ist – und weshalb KI-gestützte Entwicklung dauerhafte Belege braucht."
category: "ai-entwicklung"
learningLevel: "public"
publicationState: "published"
publishedAt: "2026-09-02"
provenanceRef: "EV-BG-006"
---

In einem laufenden Softwareprojekt entstand im Zuge der Entwicklung eine nützliche Arbeitsweise: Änderungen an Dateien wurden vor dem Speichern im Versionsverwaltungssystem (Git) möglichst gezielt und einzeln geprüft, um unbeabsichtigte Nebeneffekte zu vermeiden.

Später entschied das Team, diese Arbeitsweise erstmals schriftlich in einem Leitfaden festzuhalten.

Während des Verfassens tauchte eine berechtigte Frage auf: Wo genau im Projektarchiv ist diese Arbeitsweise früher eigentlich dokumentiert worden?

## Eine Erinnerung im Gespräch

Bei der Erstellung des Leitfadens unterstützte ein KI-Coding-Assistent das Team. Im Verlauf des Gesprächs erinnerte sich der KI-Assistent an einen früheren Vorfall aus dem Projekt: Bei einer breiteren Staging-Aktion waren damals versehentlich auch Dateien in einen Commit geraten, die zu einer anderen Aufgabe gehörten.

Der KI-Assistent berichtete weiter, dass der Vorfall damals durch einen technischen Abgleich (einen kryptografischen SHA-256 Hash-Vergleich) geprüft worden sei. Die betroffenen Dateien seien dabei als unverändert und unbeschädigt bestätigt worden.

Diese Schilderung klingt schlüssig und passt zum bisherigen Gesprächskontext. Sie vermittelt zunächst ein beruhigendes Gefühl der Sicherheit.

## Die Suche im Projektarchiv

Das Team wollte diese technische Verifikation im neuen Leitfaden als konkretes Beispiel anführen. Dafür suchte es im Repository nach dem dauerhaften Beleg: Terminal-Protokollen, Testberichten oder Commit-Notizen, die den damaligen Hash-Abgleich dokumentieren.

Das Ergebnis der Nachforschung war eindeutig: Im definierten Suchbereich existiert kein dauerhafter Eintrag über diese Prüfung.

Das bedeutet nicht zwingend, dass die Prüfung niemals stattfand. Es bedeutet jedoch, dass im Projektarchiv kein zitierbarer Nachweis vorhanden ist.

## Das zentrale Problem: Erinnerung ist kein Nachweis

Hier zeigt sich ein fundamentaler Unterschied im Projektmanagement:

Eine Erinnerung – ob von einem Menschen oder einem KI-System – ist ein wertvoller Hinweis. Sie hilft beim Suchen und Verstehen. Sie ist jedoch selbst kein dauerhafter Projektnachweis.

<div class="learning-evidence-boundary">

**Die epistemische Grenze im Projekt:**
* **Echtes Ereignis**: Etwas kann in der Realität stattgefunden haben.
* **Gesicherte Projektaussage**: Eine Aussage sollte erst dann als gesicherte Projekttatsache behandelt werden, wenn sie durch eine dauerhafte, überprüfbare Quelle gestützt wird.

</div>

Wenn eine Erinnerung ohne Beleg als bewiesene Projekttatsache übernommen wird, entsteht eine sogenannte Provenienz-Lücke. In der KI-gestützten Softwareentwicklung ist diese Unterscheidung besonders wichtig, da KI-Modelle Zusammenhänge plausibel formulieren können, ohne dass dafür ein dauerhaftes Protokoll im Dateisystem liegt.

## Der Fachbegriff: Beleg-Rückverfolgbarkeit

Für diese Anforderung gibt es einen klaren Begriff: **Beleg-Rückverfolgbarkeit** (Traceability).

Beleg-Rückverfolgbarkeit bedeutet, dass eine Behauptung oder technische Aussage lückenlos auf eine dauerhafte, überprüfbare und zitierbare Quelle zurückgeführt werden kann.

Eine Quelle kann ein Git-Commit, ein Testprotokoll, ein Freigabedokument oder ein Repository-Eintrag sein. Liegt kein ausreichender dauerhafter Beleg vor, darf die Aussage im Projekt nicht als gesicherte Tatsache behandelt werden.

## Was der Projektbestand wirklich zeigt

Die detaillierte Untersuchung des Quellprojekts (ein internes WordPress-Plugin-Projekt) ergab folgendes Bild:

* **Staging-Vorfall**: Das Git-Commit-Log belegt durch einen historischen Versionsunterschied (Diff), dass einmalig unbeteiligte Dateien mit einem Batch-Schritt committet wurden.
* **Formeller Leitfaden**: Das neu erstellte Governance-Dokument belegt direkt die Festlegung der Regel.
* **Frühere Praxis**: Die vorhandene Entwicklungshistorie deutet darauf hin, dass gezieltes Staging bereits vor der formellen Dokumentation in der Praxis angewendet wurde.
* **Hash-Verifikation**: Für die angeführte Hash-Prüfung existiert kein dauerhafter Nachweis.

Auch das Fehlen eines Belegs lässt sich präzise beschreiben: Ein fehlender Beleg ist selbst kein Beleg-Objekt. Was jedoch dauerhaft dokumentiert werden kann, ist die durchgeführte Suche und ihr negatives Ergebnis.

## Vier Regeln für den Projektalltag

Um Beleg-Rückverfolgbarkeit in KI-gestützten Projekten sicherzustellen, helfen vier einfache Grundsätze:

* **Regel 1 (Erinnerung prüfen):** Behandeln Sie Aussagen aus Chat-Protokollen oder der eigenen Erinnerung als Such-Hinweise, nicht als belegte Projekttatsachen.
* **Regel 2 (Ergebnisse sichern):** Wenn eine wichtige technische Prüfung (wie ein Hash-Vergleich oder Sicherheitstest) durchgeführt wird, speichern Sie das Protokoll als Datei im Projektarchiv.
* **Regel 3 (Evidenzlücken benennen):** Wenn für eine Behauptung kein Beleg gefunden wird, benennen Sie diese Lücke offen, anstatt die Aussage als gesichert darzustellen.
* **Regel 4 (Quellen verknüpfen):** Verbinden Sie Dokumentationsregeln stets mit konkreten Commit-SHAs, Log-Dateien oder Testberichten.

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> **Etwas kann wirklich passiert sein und trotzdem nicht ausreichend belegbar sein.**
> Für ein professionelles Qualitätsmanagement zählt nicht nur, was vermutlich geschehen ist, sondern was dauerhaft nachgewiesen und nachvollzogen werden kann.

## Begriffe einfach erklärt

**Beleg-Rückverfolgbarkeit (Traceability)**  
Die Eigenschaft eines technischen Projekts, dass jede wesentliche Aussage oder Regel auf eine dauerhafte, zitierbare und überprüfbare Quelle zurückgeführt werden kann.

**Provenienz (Provenance)**  
Die Herkunft und Entstehungsgeschichte von Code, Daten oder Dokumenten. Sie beantwortet die Frage, wer etwas wann und auf welcher Grundlage erstellt oder geprüft hat.

**Abwesenheits-Zustand (Absence State)**  
Der Zustand, dass bei einer gezielten Nachforschung im definierten Suchbereich kein Nachweis gefunden wurde. Das Ergebnis der Suche wird dokumentiert, ohne die historische Existenz des Ereignisses pauschal zu bestreiten.
