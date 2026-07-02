# BridGenta Publikations-Governance & Asset-Klassifizierung (BPS)

Dieses Dokument definiert den verfassungsrechtlichen Publikations- und Governance-Rahmen für BridGenta.de. Es regelt, wie zukünftige Projekte, Grafiken, Zertifikate und persönliche Porträts bewertet, klassifiziert und veröffentlicht werden dürfen.

---

## 1. Publikations-Philosophie (Publication Philosophy)

BridGenta.de ist ein professionelles Online-Portfolio und dient ausschließlich dem Nachweis praktischer Kompetenzen des Inhabers.

Es ist ausdrücklich **nicht** der Zweck dieser Plattform, als:
* interne Systemdokumentation,
* Produktdokumentation für unveröffentlichte Anwendungen,
* akademisches Forschungsarchiv oder Wissensdatenbank,
* detailliertes Architektur-Repository
zu fungieren. Jeder öffentliche Inhalt dient als komprimierter Nachweis und Beleg für eine strukturierte, sichere Arbeitsweise.

---

## 2. Progressive Offenlegung (Progressive Disclosure)

Informationen und Belege werden schrittweise, basierend auf dem aktuellen Vertrauensverhältnis, offengelegt:

1. **Öffentlich (Public)**: Allgemein zugängliche Nachweise auf BridGenta.de.
2. **Personalvermittler (Recruiter)**: Vertrauliche, aber allgemein verifizierbare Belege (z. B. CV-Zusendung bei konkreten Anfragen).
3. **Fachliches Interview (Interview)**: Präsentation technischer Details, Architektur-Skizzen und Validierungsdaten im direkten Gespräch.
4. **Vertrauensverhältnis (Trusted Relationship)**: Voller Zugriff auf Codebases, detaillierte Projektpläne, Zertifikatsdokumente und Quellsysteme unter Einhaltung von Geheimhaltungsvereinbarungen (NDA) oder im Rahmen eines Anstellungsverhältnisses.

---

## 3. Klassifizierungsstandard für öffentliche Informationen (PICS)

Alle Informationen und Repository-Assets werden in fünf Sicherheitsklassen eingestuft:

* **P0 – Public by Design**: Vollständig öffentlich. Name, Berufsbiografie, Projekttitel und -kurzzusammenfassungen, anerkannte Zertifikatsnamen (ohne Registrier-IDs), öffentliche Repositories, LinkedIn-Link.
* **P1 – Public with Care**: Öffentlich nach Prüfung. Screenshots, konzeptionelle Ablaufdiagramme, Case Studies, Technologielisten. Müssen vor Release eine Datenschutzprüfung (PEPA) durchlaufen.
* **P2 – Controlled Disclosure**: Nur zur gezielten, privaten Weitergabe. Lebenslauf (CV), vollständige Zertifikats-PDFs (ohne Veröffentlichungs-Erlaubnis), technische Präsentationsfolien.
* **P3 – Confidential**: Vertraulich. Interne Produktdesign-Dokumente, Prompt-Bibliotheken für Generative KI, unveröffentlichte Forschungsergebnisse, kommerzielle Vereinbarungen.
* **P4 – Protected Assets**: Streng geschützte Vermögenswerte (Niemals öffentlich). Proprietäre Codebases, interne AI-Entwickler-Workflows, Personaldokumente (z. B. Personalausweis, Unterschriften), Zertifikats-Registrierungsnummern, geheime API-Schlüssel, sensible Kundendaten.

---

## 4. Die Drei-Artefakte-Regel (Three Artifact Rule)

Jede auf BridGenta.de publizierte Fallstudie darf ausschließlich über genau drei öffentliche Artefakte in dieser Reihenfolge verfügen:

1. **Projekt-Screenshot (oder schematische Visualisierung)**: Visueller Nachweis der Existenz und Funktionalität des Frontends.
2. **High-Level Ablaufdiagramm**: Ein konzeptionelles Diagramm (z. B. als Mermaid-Skizze) zur Veranschaulichung der Systemgrenzen oder logischen Abläufe.
3. **Ergebnis-Visualisierung**: Belegbare Performance-Werte, Vorher-/Nachher-Tabellen oder tabellarische Validierungsergebnisse.

---

## 5. Der Social Media Test

Vor jeder Veröffentlichung eines Bildes, Diagramms oder Texts muss folgende Frage positiv beantwortet werden:
> *"Würde ich dieses Artefakt bedenkenlos öffentlich auf LinkedIn oder X teilen, ohne geistiges Eigentum oder Vertraulichkeiten zu verletzen?"*
Falls **Nein**, darf das Asset nicht auf BridGenta.de hochgeladen werden.

---

## 6. Der Eignungs-Test

Jedes Asset muss einen klaren Nachweiswert haben:
> *"Welche konkrete berufliche Kompetenz (z. B. IT-Sicherheit, Systemadministration, Webmaster-Services, Versionskontrolle) wird durch dieses Artefakt nachgewiesen?"*
Assets ohne nachweisbaren Belegwert werden aus der Repository-Historie entfernt.

---

## 7. Der FDPP-Standard für Porträtfotos (FDPP Rule)

Um die Kontrolle über das persönliche Bildrecht und die Konsistenz des Portfolios zu wahren, gilt für alle Porträtfotos des Inhabers eine strikte Kennzeichnungspflicht:

* **Regel**: Ausschließlich Porträtfotografien, die das offizielle Identifikationskürzel **`FDPP-###`** tragen (z. B. `FDPP-001.webp`, `FDPP-002.webp`), sind für die öffentliche Publikation freigegeben.
* **Geltungsbereich**: Diese Regelung gilt universell für BridGenta.de, das GitHub-Profil des Inhabers sowie LinkedIn- und X-Kanäle des Inhabers.
* **Ausschluss**: Jede Fotografie ohne dieses Präfix im Dateinamen oder in den Metadaten gilt als nicht freigegeben und darf nicht veröffentlicht werden.

---

## 8. Checkliste zur Freigabe von Veröffentlichungen (Publication Review)

Vor dem Mergen eines inhaltsbezogenen Pull Requests in den `main`-Zweig muss der Reviewer folgende Punkte prüfen:

* [ ] **Kompetenzbeleg**: Der Inhalt weist eine echte fachliche Kompetenz nach.
* [ ] **Datenschutz**: Keine personenbezogenen IDs, Adressen, Signaturen oder Matrikelnummern enthalten.
* [ ] **IP-Schutz**: Keine geschützten Quellcodes, Prompt-Bibliotheken oder Rekonstruktionslogiken enthalten.
* [ ] **Drei-Artefakte-Regel**: Es sind genau drei standardisierte Artefakte eingebettet.
* [ ] **Social Media Test**: Alle Elemente sind LinkedIn-tauglich.
* [ ] **Eignungs-Test**: Jedes Element erfüllt einen klaren Belegzweck.
* [ ] **FDPP-Konformität**: Eventuell genutzte Porträtfotos tragen das Kürzel `FDPP-###`.
