---
title: "Der Revert der TinaCMS Build-Integration: Grenzen lokaler Sicherheitsbereiche"
description: "Warum wir eine funktionierende Cloud-Schnittstelle entfernt haben, um die Offline-First-Garantie des CMS-Adminbereichs zu schützen."
category: "softwarearchitektur"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-003"
---

Eine neue Funktion wird fertiggestellt. Die Funktion ist technisch umgesetzt. Die Admin-Oberfläche zur Bearbeitung von Texten wird beim Bauen der Webseite automatisch erstellt. Der Code funktioniert.

Doch kurz darauf wird die funktionierende Funktion wieder gelöscht und aus dem System ausgebaut. 

Warum sollte man eine funktionierende Funktion absichtlich löschen? 

Genau das haben wir in unserem echten Projekt getan (Zurücksetzen einer Änderung, auch **Revert** genannt, in Commit `50a8c85`). In diesem Artikel erklären wir, warum wir diese Entscheidung getroffen haben, um unsere Sicherheitsgrenzen zu schützen.

---

## 1. Was ist passiert?

In Commit `4f83e40` hatten wir das Redaktionssystem TinaCMS integriert. Beim Bauen der Webseite (`npm run build`) wurde automatisch eine Admin-Seite generiert. Das war bequem.

Doch diese Integration verletzte eine wichtige Architekturregel unseres Projekts:

<div class="learning-evidence-boundary">

*   **Das Problem**: Um die Admin-Seite im Browser anzuzeigen, versuchte das Build-Skript externe Cloud-Bibliotheken und Registrierungs-Token von TinaCMS zu laden. Dadurch entstand eine direkte Verbindung zu einem Server im Internet.
*   **Das Risiko**: Fällt dieser externe Cloud-Dienst aus oder wird er gehackt, bricht auch unser lokaler Build-Prozess zusammen. Zudem könnten interne Metadaten unbeabsichtigt ins Internet abfließen.

</div>

Deshalb haben wir die Integration komplett zurückgesetzt. Die Admin-Oberfläche läuft nun ausschließlich lokal auf dem Rechner des Entwicklers. Beim globalen Bauen der Webseite werden keine Cloud-Schnittstellen mehr geladen.

---

## 2. Der Begriff: Sicherheitsgrenze

Eine **Sicherheitsgrenze** (Security Boundary) trennt verschiedene Vertrauensbereiche (Trust Domains) eines Systems voneinander. Daten dürfen diese Grenze nur nach festgelegten Regeln und Kontrollen überschreiten.

In unserem Web-Projekt gilt das Prinzip: **Offline-First und Lokale Hoheit**.
Für diese Anwendung bedeutet das: Wichtige Konfigurationen und Admin-Dateien sollten auf dem lokalen System verwaltet werden. Die Integration verletzte diese Sicherheitsgrenze, indem sie den Build-Prozess dauerhaft vom Internet abhängig machte.

---

## Lektionen für die Praxis (Anwenden)

Wenn Sie Schnittstellen zu externen Diensten entwerfen, hilft Ihnen dieses Entscheidungsmodell:

*   **Regel 1 (Offline-Garantie):** In diesem Projekt war für den Build ein lokaler, unabhängiger Ablauf vorgesehen. Eine verpflichtende externe Verbindung hätte diese konkrete Architekturgrenze verletzt.
*   **Regel 2 (Sicherheits-Vorzug):** In diesem Projekt hatte die festgelegte Sicherheits- und Unabhängigkeitsgrenze Vorrang vor zusätzlichem Komfort.
*   **Regel 3 (Mut zum Revert):** Zögern Sie nicht, eine fehlerhafte oder unsichere Funktion zurückzubauen, anstatt instabile Behelfslösungen zu entwickeln.

---

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> Eine technisch funktionierende Funktion kann trotzdem ungeeignet sein, wenn sie eine festgelegte Sicherheits- oder Architekturgrenze verletzt.

---

## Begriffe einfach erklärt

**Revert**

Das Rückgängigmachen einer früheren Code-Änderung. Dadurch wird die betreffende Änderung entfernt oder ein früherer Code-Zustand wiederhergestellt. In diesem Projekt wurde damit die problematische Integration entfernt.

**Sicherheitsgrenze (Security Boundary)**

Eine Sicherheitsgrenze trennt Bereiche eines Systems, die unterschiedliche Vertrauens-, Zugriffs- oder Schutzregeln haben.

**Offline-First**

Offline-First bedeutet, dass wichtige Funktionen lokal und ohne dauerhafte Internetverbindung nutzbar bleiben. Welche Funktionen das sind, hängt von der Architektur ab.
