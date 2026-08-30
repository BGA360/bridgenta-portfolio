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
* **Erreichbarkeit gesichert**: Der Kontakt-Link ist weiterhin als normaler Text-Link im Menü vorhanden. 
* **Freie Bahn für Pflichtangaben**: Impressum und Datenschutzerklärung sind nun wieder für jeden Smartphone-Besucher sofort sichtbar und barrierefrei anklickbar.

---

## 4. Was können wir daraus lernen?

1. **Weniger ist mehr**: Auf mobilen Geräten müssen Sie Prioritäten setzen. Blenden Sie unwichtige oder doppelte Elemente aus, um Platz für das Wesentliche zu schaffen.
2. **Pflichten gehen vor**: Gesetzliche Pflichtseiten (wie Datenschutz und Impressum) müssen bei jedem Layout-Entwurf oberste Priorität haben. Sie dürfen niemals durch Design-Features verdeckt werden.
3. **Immer auf echten Geräten testen**: Ein Layout, das im Editor gut aussieht, kann auf einem echten Smartphone-Bildschirm unbrauchbar sein. Regelmäßiges Testen auf kleinen Displays verhindert solche Layout-Konflikte.

---

## Begriffe einfach erklärt

*   **Layout-Kollision (Layout Collision)**: Ein Darstellungsfehler im Webdesign, bei dem sich verschiedene Elemente (z. B. Texte und Knöpfe) überlagern und gegenseitig verdecken.
*   **Barrierefreiheit**: Das Gestalten von Webseiten, sodass sie von allen Menschen – unabhängig von ihren körperlichen oder technischen Möglichkeiten – ohne Einschränkungen genutzt werden können.
*   **Impressum**: Die gesetzlich vorgeschriebene Anbieterkennzeichnung auf einer Webseite, die Auskunft über die Betreiber der Seite gibt.
