---
title: "Layout-Absicherung in mobilen Ansichten: Der mobile Kontakt-Button"
description: "Warum das Entfernen eines Navigationselements auf kleinen Bildschirmen den Zugang zu rechtlichen Pflichtangaben rettete."
category: "softwarearchitektur"
learningLevel: "public"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-005"
---

Wer eine Webseite auf dem Smartphone öffnet, erwartet eine einfache Bedienung. Der Bildschirm ist klein, und jedes Element braucht seinen Platz. Wenn zu viele Knöpfe und Texte gleichzeitig angezeigt werden, kommt es zu Konflikten im Layout (Layout Collisions).

In diesem Artikel erklären wir allgemein verständlich, wie ein kleiner Design-Fehler in unserer mobilen Navigation den Zugang zu wichtigen rechtlichen Dokumenten blockiert hat und wie wir das Problem gelöst haben.

---

## 1. Was ist passiert?

Auf unserer Desktop-Webseite (am Computer) gibt es in der Navigationsleiste oben rechts einen auffälligen blauen Knopf mit der Aufschrift „Kontakt“. Dieser Knopf soll es Besuchern erleichtern, uns schnell eine Nachricht zu schreiben.

Als wir die Navigation für Smartphones anpassten, ließen wir diesen Knopf zunächst unverändert im Menü. Das führte jedoch auf kleineren Displays zu einem schweren Darstellungsfehler: 
Der große Kontakt-Knopf überlagerte die Menü-Links und schob das restliche Menü nach unten aus dem sichtbaren Bereich. Besucher konnten dadurch auf dem Smartphone die rechtlichen Pflichtangaben (wie das Impressum und die Datenschutzerklärung) im Fußbereich der Navigation nicht mehr anklicken.

---

## 2. Warum ist das wichtig?

In Deutschland und Europa gibt es strenge gesetzliche Vorschriften: Rechtliche Angaben wie das Impressum und die Datenschutzerklärung müssen auf einer Webseite jederzeit leicht erreichbar sein – und zwar auf jedem Gerät, auch auf dem Smartphone. 

<div class="learning-evidence-boundary">

Ein Design-Element (wie ein Kontakt-Knopf) darf niemals den Zugriff auf diese rechtlichen Pflichtseiten verhindern. Es ging hier also nicht nur um ein unschönes Aussehen, sondern um ein rechtliches Risiko für die gesamte Webseite.

</div>

---

## 3. Die Lösung (Commit 34989fd)

Um das Problem zu lösen, haben wir eine bewusste Vereinfachung vorgenommen:
* **Entfernung auf Smartphones**: Auf kleinen Bildschirmen wird der Kontakt-Knopf in der Navigation nun komplett ausgeblendet (Commit `34989fd`). Das Menü hat dadurch wieder genug Platz.
* **Erreichbarkeit gesichert**: Der Kontakt-Link ist weiterhin im Menü vorhanden. 
* **Freie Bahn für Pflichtangaben**: Impressum und Datenschutzerklärung sind in diesem Layout wieder für Smartphone-Besucher erreichbar und anklickbar.

---

## Lektionen für die Praxis (Anwenden)

Wenn Sie mobile Benutzeroberflächen gestalten, hilft Ihnen diese Checkliste zur Layout-Absicherung:

*   **Prüfpunkt 1 (Platzsparen):** Blenden Sie unwichtige oder doppelte Design-Elemente auf Smartphones gezielt aus, um Platz für die Hauptnavigation zu schaffen.
*   **Prüfpunkt 2 (Rechtspriorität):** Bei mobilen Layout-Änderungen müssen wichtige Pflicht- und Navigationslinks weiterhin erreichbar bleiben.
*   **Prüfpunkt 3 (Mobiles Testen):** Prüfen Sie Navigationsmenüs auf relevanten mobilen Bildschirmgrößen. Tests auf echten Geräten können zusätzliche Darstellungsprobleme sichtbar machen.

---

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> Mobile Layout-Kollisionen können den Zugriff auf wichtige Seiten erschweren. Im mobilen Layout müssen wichtige Pflichtlinks weiterhin erreichbar bleiben. Zusätzlich sollte die Oberfläche so gestaltet sein, dass Menschen sie mit unterschiedlichen Geräten und Bedürfnissen möglichst gut nutzen können.

---

## Begriffe einfach erklärt

**Layout-Kollision (Layout Collision)**

Ein Darstellungsfehler im Webdesign. Verschiedene Elemente (z. B. Texte und Knöpfe) überlagern sich und verdecken sich gegenseitig.

**Barrierefreiheit**

Barrierefreiheit bedeutet, digitale Inhalte so zu gestalten, dass Menschen mit unterschiedlichen Fähigkeiten sie möglichst gut wahrnehmen, verstehen und bedienen können.

**Impressum**

Ein Impressum enthält Angaben zum Anbieter einer Website. Ob und welche Angaben gesetzlich erforderlich sind, hängt vom jeweiligen Fall ab.
