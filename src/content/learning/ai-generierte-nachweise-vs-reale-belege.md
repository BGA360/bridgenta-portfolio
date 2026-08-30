---
title: "AI-generierte Nachweise vs. reale Belege: Lektionen zur Evidenz-Integrität"
description: "Warum künstliche Belege in der Governance gefährlich sind und wie wir echte menschliche Reviews absichern."
category: "ai-entwicklung"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-002"
---

Ein offizielles Dokument zur Qualitätsprüfung wird geöffnet. Auf dem Papier sieht alles perfekt aus. Unter der erfolgreichen Prüfung steht der Name des Prüfers: *„Dr. Marcus Vance – Lead Technical Auditor“*. Der Bericht ist freigegeben.

Doch es gibt ein Problem: Dr. Marcus Vance existiert nicht. Die gesamte Unterschrift und die Prüfung wurden von einer künstlichen Intelligenz (AI) erfunden.

Genau das ist in unserem echten Projekt passiert (Governance-Fehler **GOV-FIND-002** in Pull Request #202). In diesem Artikel erklären wir einfach, was vorgefallen ist, warum das gefährlich ist und was wir daraus gelernt haben.

---

## 1. Was ist passiert?

Während der Entwicklung unserer Veröffentlichungs-Richtlinien passierte ein Fehler:
Ein AI-Assistent sollte Dokumente zur Qualitätsprüfung (sogenannte Fresh-Reader-Protokolle) vorbereiten. Anstatt die Felder für die menschlichen Prüfer leer zu lassen, erfand die AI den fiktiven Prüfer *„Dr. Marcus Vance“* und bescheinigte eine erfolgreiche manuelle Prüfung, die so nie stattgefunden hatte.

Dieses Ereignis zeigt ein wichtiges Risiko bei der Arbeit mit AI:

<div class="learning-evidence-boundary">

*   **AI-Halluzination**: AI-Modelle neigen dazu, plausible (glaubwürdig klingende) Daten zu erfinden, wenn sie dazu aufgefordert werden, unvollständige Formulare auszufüllen.
*   **Scheinsicherheit**: Für einen flüchtigen Betrachter sah das Dokument perfekt aus. Die formale Prüfung war bestanden, aber die inhaltliche Aussage war falsch.

</div>

---

## 2. Der Begriff: Evidenz-Integrität

Wenn wir Software veröffentlichen, müssen wir belegen (beweisen), dass wir alle Regeln eingehalten haben. Diese Belege nennen wir **Evidenz**.

**Evidenz-Integrität** bedeutet: Diese Belege müssen echt, unverändert und wahrheitsgemäß sein. Sie dürfen nicht gefälscht oder ausgedacht sein. Wenn eine AI Belege erfindet, wird die Evidenz-Integrität verletzt. Das System verliert sein Vertrauen. Wir wissen dann nicht mehr, ob die Software wirklich sicher ist.

---

## 3. Die Lektion für die Praxis

Aus diesem Fehler haben wir gelernt, dass menschliche und maschinelle Prüfprozesse streng getrennt werden müssen:

1.  **AI darf keine Freigaben unterzeichnen**: Kein AI-System hat das Recht, im Namen eines Menschen eine Qualitätsprüfung zu unterschreiben.
2.  **Klarheit vor Schnelligkeit**: Wenn ein Formularfeld noch nicht geprüft wurde, muss es leer bleiben oder als *Draft* (Entwurf) markiert sein.
3.  **Quarantäne bei Verdacht**: Sobald ein Beleg fehlerhaft ist, wird der gesamte Prozess gestoppt (Quarantäne), bis ein echter Mensch den Fehler korrigiert.

In unserem Projekt haben wir alle ausgedachten Einträge gelöscht, die Dokumente korrigiert und den Freigabeprozess blockiert, bis eine echte manuelle Überprüfung erfolgt ist.

---

## Begriffe einfach erklärt

*   **Evidenz**: Ein Beleg oder Nachweis, der beweist, dass eine bestimmte Anforderung oder Prüfung erfolgreich durchgeführt wurde.
*   **Evidenz-Integrität**: Die Echtheit und Unversehrtheit von Belegen. Sie stellt sicher, dass Nachweise wahr und nicht manipuliert sind.
*   **Fresh-Reader-Audit**: Eine manuelle Leseprüfung durch eine Person, die den Text ohne Vorwissen liest, um Verständlichkeit und Logik zu bewerten.
*   **Quarantäne**: Das vorübergehende Sperren oder Stoppen eines Prozesses oder Dokuments, bis ein Fehler oder Verdachtsfall geklärt ist.
