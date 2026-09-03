---
title: "Wenn die Route im Code steht, aber die Freigabe noch offen ist"
description: "Eine Zieladresse im Quellcode ist noch keine nachgewiesene Veröffentlichungsfreigabe. Der Artikel trennt technische Quellcode-Fakten von Governance-Entscheidungen."
category: "softwarearchitektur"
learningLevel: "intermediate"
publicationState: "published"
publishedAt: "2026-09-03"
provenanceRef: "EV-BG-008"
---

Eine Projektkennung steht in der Routen-Konfiguration. Dadurch kann sie für die Seitengenerierung ausgewählt werden. Aber damit ist noch nicht nachgewiesen, dass die Veröffentlichungs- und Freigabekriterien für diese Seite erfüllt sind.

In der Softwareentwicklung entsteht an dieser Stelle leicht ein Missverständnis: Quellcode-Einträge werden mit fachlichen Freigaben verwechselt.

## Die Lücke zwischen Quellcode und Freigabe

Bei Webanwendungen können Routen oder Projektkennungen im Quellcode definiert werden. In der Seitengenerierung von BridGenta gab es dafür beispielsweise ein zentrales Array von Projekt-Kennungen (`activeProjectSlugs`), das alle zu erzeugenden Zielseiten auflistete.

Solange dieses Array lediglich steuert, welche HTML-Dateien der Compiler bauen soll, handelt es sich um eine reine technische Konfiguration.

Problematisch wird es, wenn diese Liste ohne weiteren Abgleich direkt als Veröffentlichungsentscheidung verstanden wird. Wenn eine Unterseite im Quellcode hinterlegt ist, bedeutet das zunächst nur: Der Generator kennt diesen Pfad. Es bedeutet nicht automatisch, dass der Inhalt geprüft und die erforderliche Veröffentlichungsfreigabe nachgewiesen wurde.

## Quellcode-Fakt vs. Governance-Entscheidung

Für eine verlässliche Qualitäts- und Release-Sicherung müssen zwei Ebenen sauber getrennt werden:

1. **Quellcode-Fakt (Technical Routing Fact):** Die Route ist im Quellcode hinterlegt. Das Dokument kann technisch erzeugt werden.
2. **Fachliche Freigabe (Governance Clearance):** Der Inhalt wurde geprüft, alle Veröffentlichungs- und Lifecycle-Anforderungen sind erfüllt und der Freigabestatus wurde nachgewiesen.

```text
Route im Code ≠ Freigabe nachgewiesen ≠ Veröffentlichung autorisiert
```

Wenn technische Routen-Konfiguration und Freigabe-Nachweise nicht getrennt geprüft werden, kann aus einem Quellcode-Fakt fälschlich eine Veröffentlichungsentscheidung abgeleitet werden. Das Governance-Finding GOV-FIND-001 hält ausdrücklich fest: Ein beobachteter Quellcode-Fakt ist weder eine Governance-Entscheidung noch eine Veröffentlichungsentscheidung.

## Warum beide Ebenen getrennt werden müssen

Um diese Verwechslung zu verhindern, müssen technische Routen-Erzeugung und Freigabe-Entscheidungen getrennt betrachtet werden:

1. **Technische Routen-Konfiguration:** Zeigt, welche Pfade beim Build technisch berücksichtigt werden können.
2. **Separate Governance-Entscheidung:** Beantwortet separat, ob die Veröffentlichung tatsächlich autorisiert ist.

Die technische Routen-Liste unterscheidet sich von einer fachlichen Veröffentlichungsentscheidung. Ein beobachteter Quellcode-Fakt allein stellt keine Governance-Entscheidung und keine Veröffentlichungsautorisierung dar.

## Übertragbare Erkenntnis für Softwareprojekte

Entwicklerteams sollten technische Pfad-Konfigurationen niemals als Nachweis einer Veröffentlichungsentscheidung interpretieren.

Das Prinzip ist auf andere Webanwendungen übertragbar, wenn technische Routen-Konfiguration und fachliche Veröffentlichungsfreigabe getrennte Entscheidungen sind. Wenn Quellcode-Fakten und fachliche Freigaben getrennt betrachtet werden, lassen sich falsche Ableitungen zwischen technischer Erreichbarkeit und organisatorischer Autorisierung vermeiden.
