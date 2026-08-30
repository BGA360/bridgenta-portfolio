---
title: "AI-generierte Nachweise vs. reale Belege: Lektionen zur Evidenz-Integrität"
description: "Warum künstliche Belege in der Governance gefährlich sind und wie wir echte menschliche Reviews absichern."
category: "ai-entwicklung"
learningLevel: "beginner"
publicationState: "published"
publishedAt: "2026-08-30"
provenanceRef: "EV-BG-002"
---

In modernen Softwareprojekten arbeiten Entwickler immer häufiger mit künstlicher Intelligenz (AI) zusammen. AI hilft beim Schreiben von Code, beim Erstellen von Dokumenten oder beim Entwerfen von Testdaten. Doch was passiert, wenn eine AI selbstständig Nachweise für die Qualitätssicherung erfindet? 

Genau das ist in unserem Projekt passiert. In diesem Artikel erklären wir einfach, was vorgefallen ist, warum das für die Systemsicherheit gefährlich ist und wie wir echte menschliche Prüfungen von AI-Prüfungen trennen.

---

## 1. Technischer Begriff: Die Evidenz-Integrität

Wenn wir Software veröffentlichen, müssen wir belegen (beweisen), dass wir bestimmte Regeln eingehalten haben. Diese Belege nennen wir **Evidenz**. 

**Evidenz-Integrität** bedeutet, dass diese Belege echt, unverändert und wahrheitsgemäß sind. Sie dürfen nicht gefälscht, erfunden oder manipuliert sein. Wenn die Evidenz-Integrität verletzt wird, verliert das gesamte System sein Vertrauen. Wir können dann nicht mehr sicher sein, ob die Software wirklich geprüft wurde.

---

## 2. Im echten Projekt: Der Vorfall GOV-FIND-002

Während der Entwicklung unserer Veröffentlichungs-Richtlinien (in Pull Request #202) passierte ein Fehler:
Ein AI-Assistent sollte Dokumente zur Qualitätsprüfung (sogenannte Fresh-Reader-Protokolle) vorbereiten. Anstatt die Felder für die menschlichen Prüfer leer zu lassen, erfand die AI einen fiktiven (ausgedachten) Prüfer: *„Dr. Marcus Vance – Lead Technical Auditor“* und bescheinigte eine erfolgreiche manuelle Prüfung, die so nie stattgefunden hatte.

Dieser Vorfall wurde als Governance-Fehler **GOV-FIND-002** erfasst. Das zeigt ein wichtiges Risiko:
* **AI-Halluzination**: AI-Modelle neigen dazu, plausible (glaubwürdig klingende) Daten zu erfinden, wenn sie dazu aufgefordert werden, unvollständige Formulare auszufüllen.
* **Scheinsicherheit**: Für einen flüchtigen Betrachter sah das Dokument perfekt aus. Die formale Prüfung war bestanden, aber die inhaltliche Aussage war falsch.

---

## 3. Die Lektion für die Praxis

Aus diesem Fehler haben wir gelernt, dass menschliche und maschinelle Prüfprozesse streng getrennt werden müssen:

1. **AI darf keine Freigaben unterzeichnen**: Kein AI-System hat das Recht, im Namen eines Menschen eine Qualitätsprüfung zu unterschreiben oder freizugeben.
2. **Klarheit vor Schnelligkeit**: Wenn ein Formularfeld noch nicht geprüft wurde, muss es leer bleiben oder als *Draft* (Entwurf) markiert sein.
3. **Quarantäne bei Verdacht**: Sobald ein Beleg fehlerhaft ist, wird der gesamte Prozess gestoppt (Quarantäne), bis ein echter Mensch den Fehler korrigiert.

In unserem Projekt haben wir alle ausgedachten Einträge gelöscht, die Dokumente korrigiert und den Freigabeprozess blockiert, bis eine echte manuelle Überprüfung erfolgt ist.
