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

Eine **Sicherheitsgrenze** (Security Boundary) trennt sichere Bereiche eines Systems von unsicheren Bereichen. Daten dürfen diese Grenze nur unter strengen Kontrollen überschreiten.

In unserem Web-Projekt gilt die Regel: **Offline-First und Lokale Hoheit**. 
Das bedeutet: Alle sensiblen Daten und Konfigurationen müssen vollständig auf dem eigenen Rechner laufen. Sie dürfen nicht ungefragt mit Servern im Internet kommunizieren. Die Integration verletzte diese Sicherheitsgrenze, indem sie den Build-Prozess vom Internet abhängig machte.

---

## 3. Die Lektion für die Praxis

Aus dieser Entscheidung lassen sich drei Lehren ziehen:

1.  **Funktionalität ist nicht alles**: Nur weil eine Funktion im Test reibungslos läuft, heißt das nicht, dass sie architektonisch richtig ist.
2.  **Sicherheitsgrenzen schützen**: Weichen Sie Ihre Sicherheitsarchitektur nicht für kleine Bequemlichkeiten (wie eine einfachere Admin-Seite im Web) auf.
3.  **Mut zum Rückbau**: Wenn ein Fehler oder ein Architektur-Verstoß erkannt wird, zögern Sie nicht, den Code sofort wieder zurückzubauen (Revert), anstatt provisorische Flicken („Workarounds“) einzubauen.

---

## Begriffe einfach erklärt

*   **Revert**: Das Zurücksetzen oder Löschen einer Code-Änderung im Git-Verlauf, um zu einem früheren, sicheren Zustand zurückzukehren.
*   **Sicherheitsgrenze (Security Boundary)**: Eine gedachte Linie im System, die vertrauenswürdige Bereiche (wie den eigenen Rechner) von weniger sicheren Bereichen (wie dem Internet) trennt.
*   **Offline-First**: Ein Design-Prinzip, bei dem eine Anwendung so gebaut wird, dass sie auch ohne Verbindung zum Internet voll funktionsfähig ist.
