---
title: "Der Revert der TinaCMS Build-Integration: Grenzen lokaler Sicherheitsbereiche"
description: "Warum wir eine funktionierende Cloud-Schnittstelle entfernt haben, um die Offline-First-Garantie des CMS-Adminbereichs zu schützen."
category: "softwarearchitektur"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-003"
---

Manchmal ist die beste technische Entscheidung nicht das Hinzufügen eines neuen Features, sondern das bewusste Entfernen einer bereits funktionierenden Funktion. In der Softwareentwicklung nennen wir das Zurücksetzen einer Änderung einen **Revert**.

In diesem Artikel besprechen wir, warum wir eine funktionierende TinaCMS Cloud-Integration wieder komplett aus unserer Pipeline ausgebaut haben, um unsere Sicherheitsgrenzen zu wahren.

---

## 1. Technischer Begriff: Die Sicherheitsgrenze (Security Boundary)

Eine **Sicherheitsgrenze** trennt vertrauenswürdige Bereiche eines Systems von weniger vertrauenswürdigen Bereichen. Daten und Zugriffe dürfen diese Grenze nur unter strengen Regeln überschreiten. 

In unserem Web-Projekt gilt das Prinzip: **Offline-First und Lokale Hoheit**. 
Das bedeutet: Alle sensiblen Daten, Admin-Oberflächen und Konfigurationen müssen vollständig lokal (auf dem eigenen Rechner des Entwicklers) laufen und dürfen nicht unkontrolliert mit Cloud-Diensten im Internet kommunizieren.

---

## 2. Im echten Projekt: Die TinaCMS-Integration (Commit 50a8c85)

In Commit `4f83e40` hatten wir TinaCMS (ein Content-Management-System zur Bearbeitung von Texten) so integriert, dass es beim Bauen der Webseite (`npm run build`) automatisch eine Admin-Oberfläche generiert. Das funktionierte technisch einwandfrei.

Doch diese Integration verletzte unsere grundlegende Architekturregel:

<div class="learning-evidence-boundary">

* **Das Problem**: Um die Admin-Seite im Browser anzuzeigen, versuchte das Build-Skript externe Cloud-Bibliotheken und Registrierungs-Token von TinaCMS zu laden. Dadurch entstand eine direkte Abhängigkeit zu einem externen Server im Internet.
* **Das Risiko**: Fällt der externe Cloud-Dienst aus oder wird kompromittiert (gehackt), ist auch unser lokaler Build-Prozess betroffen. Zudem könnten interne Metadaten unbeabsichtigt ins Internet abfließen.

</div>

Deshalb haben wir in Commit `50a8c85` (Revert) die gesamte Build-Integration wieder entfernt. Die Admin-Oberfläche läuft nun ausschließlich im lokalen Entwicklungsmodus auf dem Rechner des Autors, ohne dass beim globalen Bauen der Webseite Cloud-Schnittstellen geladen werden.

---

## 3. Die Lektion für die Praxis

Aus dieser Entscheidung lassen sich drei Lehren ziehen:
1. **Funktionalität ist nicht alles**: Nur weil eine Funktion im Test reibungslos läuft, heißt das nicht, dass sie architektonisch richtig ist.
2. **Sicherheitsgrenzen schützen**: Weichen Sie Ihre Sicherheitsarchitektur nicht für kleine Bequemlichkeiten (wie eine einfachere Admin-Seite im Web) auf.
3. **Mut zum Rückbau**: Wenn ein Fehler oder ein Architektur-Verstoß erkannt wird, zögern Sie nicht, den Code sofort wieder zurückzubauen (Revert), anstatt provisorische Flicken („Workarounds“) einzubauen.
