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

## Lektionen für die Praxis (Anwenden)

Wenn Sie mobile Benutzeroberflächen gestalten, hilft Ihnen diese Checkliste zur Layout-Absicherung:

*   **Prüfpunkt 1 (Platzsparen):** Blenden Sie unwichtige oder doppelte Design-Elemente auf Smartphones gezielt aus, um Platz für die Hauptnavigation zu schaffen.
*   **Prüfpunkt 2 (Rechtspriorität):** Stellen Sie sicher, dass gesetzliche Pflichtangaben (wie Impressum und Datenschutz) in jedem mobilen Layout-Zustand erreichbar und unverdeckt bleiben.
*   **Prüfpunkt 3 (Mobiles Testen):** Testen Sie Navigationsmenüs immer auf echten Mobilgeräten mit unterschiedlichen Bildschirmgrößen, um Layout-Kollisionen frühzeitig zu erkennen.

---

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> Mobile Layout-Kollisionen sind nicht nur optische Mängel, sondern können zum rechtlichen Risiko werden. Rechtliche Pflichtlinks müssen auf jedem Endgerät barrierefrei erreichbar sein. Priorisieren Sie die Erreichbarkeit von Pflichtangaben vor ästhetischen Zusatzfeatures.

---

## Begriffe einfach erklärt

**Layout-Kollision (Layout Collision)**

Ein Darstellungsfehler im Webdesign. Verschiedene Elemente (z. B. Texte und Knöpfe) überlagern sich und verdecken sich gegenseitig.

**Barrierefreiheit**

Das barrierefreie Gestalten von Internetseiten. So können alle Menschen die Webseite ohne Einschränkungen nutzen – unabhängig von ihren körperlichen oder technischen Fähigkeiten.

**Impressum**

Die gesetzlich vorgeschriebene Anbieterkennzeichnung auf einer Internetseite. Sie gibt Auskunft über die Betreiber der Seite.
