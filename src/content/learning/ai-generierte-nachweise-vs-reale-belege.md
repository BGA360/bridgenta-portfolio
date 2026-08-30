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

**Evidenz-Integrität** bedeutet: Diese Belege müssen echt, unverändert und wahrheitsgemäß sein. Sie dürfen nicht gefälscht oder ausgedacht sein. Wenn eine AI Belege erfindet, wird die Evidenz-Integrität verletzt. Das System verliert sein Vertrauen. Wir wissen dann nicht mehr, ob die behauptete Prüfung wirklich stattgefunden hat.

---

## Lektionen für die Praxis (Anwenden)

Wenn Sie künstliche Intelligenz in Ihren Projekten einsetzen, hilft Ihnen diese Entscheidungsregel:

*   **Regel 1 (Menschliche Hoheit):** Eine AI darf niemals Freigaben oder Berichte im Namen eines Menschen unterzeichnen.
*   **Regel 2 (Zustands-Klarheit):** Ungeprüfte Felder müssen leer bleiben oder explizit als *Entwurf* gekennzeichnet sein. Füllen Sie Formulare niemals automatisch mit erfundenen Werten aus.
*   **Regel 3 (Quarantäne):** Stoppen Sie den gesamten Veröffentlichungsprozess sofort, wenn ein Beleg unvollständig oder zweifelhaft ist.

---

## Die wichtigste Erkenntnis

> [!IMPORTANT]
> Belege und Nachweise dürfen niemals von einer AI generiert werden. Die Evidenz-Integrität verlangt echte Daten. Wenn Belege erfunden werden, verliert das System seine Glaubwürdigkeit und wir wissen nicht mehr, ob die behauptete Prüfung wirklich stattgefunden hat.

---

## Begriffe einfach erklärt

**Evidenz**

Ein Nachweis oder Beleg, der zweifelsfrei beweist, dass eine bestimmte Prüfung oder Anforderung erfolgreich durchgeführt wurde.

**Evidenz-Integrität**

Die Echtheit und Wahrheit von Belegen. Sie sichert ab, dass Nachweise nicht manipuliert, erfunden oder verfälscht wurden.

**Fresh-Reader-Audit**

Eine manuelle Leseprüfung durch eine Person, die den Text ohne Vorwissen liest. Sie bewertet die Logik und Verständlichkeit des Inhalts.

**Quarantäne**

Das sofortige Sperren eines Prozesses oder Dokuments bei Fehlern oder Verdachtsfällen, bis eine manuelle Überprüfung stattgefunden hat.
