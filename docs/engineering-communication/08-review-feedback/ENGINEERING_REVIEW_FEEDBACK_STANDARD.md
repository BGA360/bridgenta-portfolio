# Standard für Review und Feedback (Engineering Communication Review & Feedback Standard)

Dieses Dokument definiert den permanenten Standard für die Durchführung von Reviews und das Geben von Feedback zu technischen Dokumenten, ADRs (Architecture Decision Records) und Fallstudien (Case Studies) im BridGenta-Ökosystem. Es legt fest, wie Fachkollegen Dokumente prüfen und Korrekturen abstimmen, um die Einhaltung der BECC-Verfassung zu sichern.

Dieses Dokument regelt nicht die konkreten Review-Checklisten, sondern definiert die **Review-Governance** von BridGenta.

---

## 1. Konstitutioneller Bezug

Dieser Standard baut direkt auf der [BECC-Mission](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/00-foundation/MISSION.md), den [Leitlinien für technisches Schreiben](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/01-writing-principles/ENGINEERING_WRITING_PRINCIPLES.md), dem [Standard für technische Erklärbarkeit](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/02-explainability/ENGINEERING_EXPLAINABILITY_STANDARD.md), den [Kommunikationszielen](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/03-communication-objectives/ENGINEERING_COMMUNICATION_OBJECTIVES.md), dem [Sprachstandard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/04-language/ENGINEERING_LANGUAGE_STANDARD.md), dem [Terminologie-Standard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/05-terminology/ENGINEERING_TERMINOLOGY_STANDARD.md), dem [Standard für Dokumentenarchitektur](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/06-document-architecture/ENGINEERING_DOCUMENT_ARCHITECTURE_STANDARD.md) und dem [Schreibstandard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/07-writing/ENGINEERING_WRITING_STANDARD.md) auf. 

Zukünftige Review-Checklisten und Audit-Vorlagen leiten ihre Berechtigung aus diesem Dokument ab.

---

## 2. Prinzipien für Review und Feedback

### 2.1 Konstruktives und fachliches Feedback (Constructive & Technical Feedback)
Review-Kommentare müssen konstruktiv, präzise und fachlich begründet sein. Bewertungen dürfen sich niemals auf den persönlichen Geschmack des Reviewers beziehen, sondern müssen sich an den definierten BECC-Standards orientieren.

### 2.2 Vier-Augen-Prinzip (Peer Review)
Kein technisches Dokument wird ohne ein vorheriges Peer-Review durch einen qualifizierten Ingenieur oder Architekten veröffentlicht. Das Review sichert, dass der Inhalt auch für Außenstehende verständlich und nachvollziehbar ist.

### 2.3 Dokumenten-Review als Engineering-Aktivität (Review as an Engineering Activity)
Das Prüfen von Dokumenten ist gleichwertig zur Code-Review-Tätigkeit und wird als feste Arbeitszeit eingeplant. Qualität entsteht nicht nachträglich, sondern durch kontinuierliche, ingenieurmäßige Disziplin im Review-Prozess.

### 2.4 Regelbasierte Kritik (Evidence-based Feedback)
Jeder kritische Kommentar muss auf eine konkrete BECC-Richtlinie verweisen (z. B. fehlender Problemkontext oder Begriffdrift). Dies verhindert willkürliche Korrekturwünsche und stellt eine objektive Diskussionsgrundlage sicher.

### 2.5 Trennung von Kritik und Person (Focus on Content)
Kommentare richten sich ausschließlich gegen das Dokument und dessen Struktur, nicht gegen den Autor. Wir pflegen einen höflichen, wertschätzenden Ton. Technische Kritik dient der kollektiven Qualitätssteigerung.

### 2.6 Direkter Bezug zum Inhalt (Contextual Feedback)
Kritik wird inline, also direkt an der betreffenden Textstelle (z. B. via Git Pull Request Review oder Zeilenreferenz), platziert. Globale, unpräzise Aussagen (z. B. „Der Text liest sich nicht gut“) sind unzulässig und müssen konkretisiert werden.

### 2.7 Eindeutige Rollenverteilung (Clear Roles)
- **Der Autor**: Trägt die Verantwortung für den fachlichen Inhalt und die Umsetzung der Korrekturen. Er hat das Letztentscheidungsrecht für die technische Richtigkeit.
- **Der Reviewer**: Prüft das Dokument auf Verständlichkeit, logischen Aufbau und Konstitutionskonformität. Er dient als Stellvertreter der Leserschaft.

---

## 3. Der Review-Lebenszyklus (Review Lifecycle)

Reviews folgen einem strukturierten Ablauf, um einen geregelten Freigabeprozess zu gewährleisten:

```text
Review-Anforderung (Author reicht Entwurf ein)
       ▼
Dokumenten-Prüfung (Reviewer prüft anhand BECC-Standards)
       ▼
Kommentierung (Reviewer hinterlässt regelbasierte Kommentare)
       ▼
Einarbeitung (Author passt das Dokument an oder begründet Abweichung)
       ▼
Verifikation (Reviewer prüft geänderte Passagen)
       ▼
Freigabe & Dokumenten-Freeze (Veröffentlichung)
```

Abweichungen von Review-Vorgaben müssen vom Autor im Review-Protokoll explizit und fachlich begründet werden.

---

## 4. Review-Anti-Muster (Review Anti-Patterns)

Folgende Verhaltensweisen schaden dem Review-Prozess und sind zu vermeiden:
- **Geschmacksbasierte Korrekturen (Subjective Nitpicking)**: Korrekturwünsche, die auf persönlichem Stil statt auf BECC-Standards basieren.
- **Unklare Begründung**: Kritische Kommentare ohne Verweis auf den konkreten Mangel oder die BECC-Regel.
- **Review-Verschleppung (Review Delays)**: Unnötiges Aufschieben von Dokumenten-Reviews, was den Projektfluss behindert.
- **Geist-Kommentare (Ghost Comments)**: Hinterlassen von vagen, nicht nachvollziehbaren Hinweisen (z. B. „Das hier bitte überarbeiten.“ ohne konkretes Ziel).
- **Gatekeeping**: Nutzung des Review-Prozesses zur Durchsetzung persönlicher Entwurfspräferenzen gegen die begründete Entscheidung des Autors.

---

## 5. Zukünftige operative Standards

Dieses Dokument bildet das verfassungsrechtliche Fundament für folgende nachgelagerte Dokumente in Phase 2:
- Review-Checklisten (Review Checklists)
- Vorlagen für Review-Protokolle (Review Templates)
- Zertifizierungsrichtlinien für Reviewer (Reviewer Certification Guide)

---

[Zurück zur BECC-Übersicht](file:///c:/antigravity/statichtmlpro/fdrefs/docs/engineering-communication/README.md)
