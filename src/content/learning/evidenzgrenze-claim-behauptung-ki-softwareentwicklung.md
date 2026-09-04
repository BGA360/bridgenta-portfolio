---
title: "Wo die Evidenz endet, muss der Claim enden: KI-Diagnosen und Beleggrenzen"
description: "Warum plausible KI-Erklärungen in der Software-Entwicklung keine Belege ersetzen und wie echte Laufzeitevidenz Spekulationen abgrenzt."
category: "ai-entwicklung"
learningLevel: "intermediate"
publicationState: "draft"
provenanceRef: "EV-BG-010"
---

Wo die Evidenz (Beleglage) endet, muss der Claim (die Behauptung) enden.

Etwas, das ich in der KI-gestützten Softwareentwicklung immer wieder beobachte:

Eine KI stößt auf ein ungewöhnliches Symptom und beginnt sofort, mögliche Ursachen anzubieten.

* Beschädigtes Benutzerprofil
* Fehlerhafte Sitzung (Session)
* Fehlende Berechtigungen
* Tenant- oder Workspace-Problem
* Inkonsistenz in der Datenbank

Das sind alles denkbare Möglichkeiten.

Aber denkbar ist nicht dasselbe wie belegt.

![Visualisierung der Evidenzgrenze zwischen spekulativen KI-Erklärungen und verifizierten Laufzeit-Belegen](/images/learning/evidenzgrenze-claim-behauptung-ki-softwareentwicklung.jpg)

## Ein konkretes Beispiel aus der Praxis

Ich habe genau dieses Muster kürzlich in einem eigenen Projekt beobachtet.

Bei einem internen Werkzeug führte ein Aufruf nach dem Login zu einer leeren Seite (Blank Page). Die KI schlug sofort vor, dass die Ursache in einer fehlerhaften Tenant-Zuordnung oder einem beschädigten Profil liegen könnte.

Das Problem dabei:

Das System ist als WordPress-Plugin aufgebaut und stützt sich auf die bekannten Rollen und Rechte von WordPress. In den geprüften Quelltexten und Dokumenten lag kein Beleg dafür vor, dass ein Tenant- oder Workspace-Modell existierte.

Noch entscheidender war die stärkere Beobachtung zur Laufzeit:

Die geschilderten Beobachtungen zeigten, dass der Benutzer sich anmelden, die Detailansicht öffnen, das Formular erreichen und die erwartete Benutzeroberfläche rendern konnte.

Der korrekte Systemzustand lautete daher nicht:

*„Das Benutzerprofil ist beschädigt.“*

oder:

*„Es liegt ein Tenant-Problem vor.“*

Der korrekte Zustand lautete schlicht:

Die historische Ursache der leeren Seite ist derzeit nicht belegt.

## Warum diese Unterscheidung entscheidend ist

Künstliche Intelligenz ist sehr gut darin, plausible Kausalgeschichten zu erzeugen.

Aber in der Qualitätssicherung, Fehlersuche und Systemarchitektur darf die Plausibilität niemals der tatsächlichen Beleglage voraneilen.

Eine nützliche Regel für die tägliche Praxis:

Wo die Evidenz endet, muss der Claim enden.

Manchmal ist die präziseste Antwort keine voreilige Diagnose, sondern eine ehrliche Feststellung:

Wir wissen es noch nicht.

In der Software-Entwicklung ist ein belegtes *„Noch nicht bekannt“* eine weit stärkere ingenieurmäßige Position als eine selbstbewusste Vermutung.
