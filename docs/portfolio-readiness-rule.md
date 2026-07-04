# BridGenta Portfolio-Readiness-Regel (Portfolio Readiness Rule)

Diese Richtlinie definiert die Kriterien, unter denen ein Software- oder Webprojekt als aktive Fallstudie auf der öffentlichen Portfolio-Webseite (BridGenta.de) gelistet werden darf. Sie dient dem Schutz von geistigem Eigentum (IP), der Gewährleistung eines hohen Qualitätsstandards und der Professionalität der öffentlichen Repräsentation.

---

## 1. Die Bereitschafts-Kriterien (Readiness Thresholds)

Ein Projekt darf nur dann als aktive Fallstudie öffentlich sichtbar sein, wenn es alle folgenden Bedingungen vollständig erfüllt:

1. **Reifegrad von mindestens 50% (50% Development Maturity)**:
   Das Projekt muss sich mindestens in einer fortgeschrittenen Implementationsphase befinden. Reine Ideen, unvollständige Entwürfe oder experimentelle Konzepte ohne funktionierende Codebasis erfüllen dieses Kriterium nicht.
2. **Klarer professioneller Zweck (Clear Professional Purpose)**:
   Das Projekt muss einen nachvollziehbaren Zweck erfüllen und relevante technische Qualifikationen des Inhabers (z. B. IT-Sicherheit, Systemadministration, Webmaster-Services oder moderne Softwarearchitektur) klar belegen.
3. **Visuelle Belege vorhanden (Visual Evidence Available)**:
   Es müssen aussagekräftige visuelle Nachweise (z. B. Benutzeroberflächen-Screenshots, schematische Visualisierungen oder aussagekräftige Systemdiagramme) zur Verfügung stehen.
4. **Verteidigbarkeit im Interview (Interview Defensibility)**:
   Der Inhaber muss in der Lage sein, die getroffenen Architekturentscheidungen, Herausforderungen und Lösungen in einem fachlichen Interview detailliert zu erklären und zu verteidigen.
5. **Freigabe zur Veröffentlichung (Publication Standard Compliance)**:
   Das Projekt darf keine vertraulichen Kundendaten, proprietären Code, unvollständige interne Frameworks, Sicherheitsdaten oder geheime API-Schlüssel offenlegen (Konformität mit dem *BridGenta Publication Standard (BPS)*).

---

## 2. Aktive Portfolio-Projekte (Active Portfolio Projects)

Zum aktuellen Zeitpunkt erfüllen ausschließlich die folgenden fünf Fallstudien diese Kriterien und sind für die öffentliche Anzeige freigegeben:

* **BridGenta Reconstruction Platform** (Entwicklungsansatz zur Modernisierung von Altsystemen)
* **AEOcortex** (Strukturierung von Webinhalten für KI-Suchmaschinen, AEO und GEO)
* **Lumina Praxis** (Performante, barrierefreie Praxiswebsite auf statischer HTML-Basis)
* **Rooted Reality Gardens** (Suchmaschinenoptimierte Unternehmens-Website mit Entity SEO)
* **StarCleaners** (Progressive Web App mit Offline-Funktionalitäten und lokalem SEO)

---

## 3. Umgang mit inaktiven Projekten (Inactive Project Handling)

Projekte, die die Kriterien der Portfolio-Readiness-Regel nicht oder nicht mehr erfüllen (wie z. B. *BuildDaddy*, *FD-ESS* oder experimentelle Entwürfe):

* **Keine Löschung interner Arbeitsdateien**: Arbeitsdateien und Markdown-Inhalte verbleiben zu Entwicklungs- und Dokumentationszwecken im Git-Repository, sofern sie keine sensiblen Daten enthalten.
* **Ausschluss aus der öffentlichen Präsenz**: Diese Projekte müssen konsequent aus allen öffentlichen Listen, Homepage-Bereichen, Menüs, Fußzeilen und dynamischen Sitemap-Generierungen ausgeschlossen werden.
* **Deaktivierung des Routings**: Um unautorisierte Zugriffe oder fehlerhafte Indizierungen durch Suchmaschinen zu verhindern, werden für inaktive Projekte keine statischen HTML-Routen generiert (Ausschluss aus `getStaticPaths()`).
* **Sicherheits- und SEO-Ausschluss**: Inaktive Projekte dürfen weder in der `sitemap.xml` noch in strukturierten JSON-LD-Metadaten oder Schema-Graphen auftauchen.
