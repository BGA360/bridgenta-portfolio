---
title: "Erinnerung vs. Beleg: Lektionen zur Beleg-Rückverfolgbarkeit"
description: "Warum selbst ein echtes Ereignis noch kein belastbarer Projektnachweis ist – und weshalb KI-gestützte Entwicklung dauerhafte Belege braucht."
category: "ai-entwicklung"
learningLevel: "public"
publicationState: "draft"
---

Ein Entwicklungsteam arbeitet intensiv an einem Softwareprojekt. Über Monate hinweg werden neue Funktionen gebaut, Fehler behoben und Anpassungen vorgenommen. Im Entwicklungsalltag hält sich das Team dabei an eine bewährte Praxis: Änderungen an Dateien werden vor dem Speichern im Versionsverwaltungssystem (Git) gezielt und einzeln geprüft, um unbeabsichtigte Nebeneffekte zu vermeiden.

Später entscheidet das Team, diese sinnvolle Arbeitsweise in einem schriftlichen Leitfaden formell festzuhalten.

Während des Verfassens taucht eine berechtigte Frage auf: Wo genau im Projektarchiv ist diese Arbeitsweise früher eigentlich dokumentiert worden?

## Eine Erinnerung im Gespräch

Bei der Erstellung des Leitfadens unterstützt ein KI-Coding-Assistent das Team. Im Verlauf des Gesprächs erinnert sich der KI-Assistent an einen früheren Vorfall aus dem Projekt: Bei einer breiteren Staging-Aktion waren damals versehentlich auch Dateien in einen Commit geraten, die zu einer anderen Aufgabe gehörten.

Der KI-Assistent berichtet weiter, dass der Vorfall damals durch einen technischen Abgleich (einen kryptografischen SHA-256 Hash-Vergleich) geprüft worden sei. Die betroffenen Dateien seien dabei als unverändert und unbeschädigt bestätigt worden.

Diese Schilderung klingt schlüssig. Sie passt zur gemeinsamen Erinnerung der Beteiligten und vermittelt ein beruhigendes Gefühl der Sicherheit.

## Die Suche im Projektarchiv

Das Team möchte diese technische Verifikation im neuen Leitfaden als konkretes Beispiel anführen. Dafür sucht es im Repository nach dem dauerhaften Beleg: Terminal-Protokollen, Testberichten oder Commit-Notizen, die den damaligen Hash-Abgleich dokumentieren.

Das Ergebnis der Nachforschung ist eindeutig: Im definierten Suchbereich existiert kein dauerhafter Eintrag über diese Prüfung.

Das bedeutet nicht zwingend, dass die Prüfung niemals stattfand. Es bedeutet jedoch, dass im Projektarchiv kein zitierbarer Nachweis vorhanden ist.

## Das zentrale Problem: Erinnerung ist kein Nachweis

Hier zeigt sich ein fundamentaler Unterschied im Projektmanagement:

Eine Erinnerung – ob von einem Menschen oder einem KI-System – ist ein wertvoller Hinweis. Sie hilft beim Suchen und Verstehen. Sie ist jedoch selbst kein dauerhafter Projektnachweis.

<div class="learning-evidence-boundary">

**Die epistemische Grenze im Projekt:**
* **Echtes Ereignis**: Etwas kann in der Realität stattgefunden haben.
* **Belegbares Faktum**: Eine Aussage ist erst dann ein Projektnachweis, wenn eine dauerhafte, zitierbare Quelle existiert.

</div>

Wenn eine Erinnerung ohne Beleg als bewiesene Projekttatsache übernommen wird, entsteht eine sogenannte Provenienz-Lücke. In der KI-gestützten Softwareentwicklung ist diese Unterscheidung besonders wichtig, da KI-Modelle Zusammenhänge plausibel formulieren können, ohne dass dafür ein dauerhaftes Protokoll im Dateisystem liegt.

## Der Fachbegriff: Beleg-Rückverfolgbarkeit

Für diese Anforderung gibt es einen klaren Begriff: **Beleg-Rückverfolgbarkeit** (Traceability).

Beleg-Rückverfolgbarkeit bedeutet, dass eine Behauptung oder technische Aussage lückenlos auf eine dauerhafte, überprüfbare und zitierbare Quelle zurückgeführt werden kann.

Eine Quelle kann ein Git-Commit, ein Testprotokoll, ein Freigabedokument oder ein Verzeichniscode sein. Liegt kein dauerhafter Beleg vor, bleibt die Aussage eine Vermutung oder Erinnerung – egal wie überzeugend sie klingt.

## Was der Projektbestand wirklich zeigt

Die detaillierte Untersuchung des Quellprojekts (ein internes WordPress-Plugin-Projekt) ergab folgendes Bild:

* **Staging-Vorfall**: Das Git-Commit-Log belegt durch einen historischen Versionsunterschied (Diff), dass einmalig unbeteiligte Dateien mit einem Batch-Schritt committet wurden.
* **Formeller Leitfaden**: Das neu erstellte Governance-Dokument belegt direkt die Festlegung der Regel.
* **Frühere Praxis**: Die vorhandene Entwicklungshistorie deutet darauf hin, dass gezieltes Staging bereits vor der formellen Dokumentation in der Praxis angewendet wurde.
* **Hash-Verifikation**: Für die angeführte Hash-Prüfung existiert kein dauerhafter Nachweis.

Auch das Fehlen eines Belegs lässt sich präzise beschreiben: Ein fehlender Beleg ist selbst kein Beleg-Objekt. Was jedoch dauerhaft dokumentiert werden kann, ist die durchgeführte Suche und ihr negatives Ergebnis.

## Vier Regeln für den Projektalltag (Anwenden)

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
