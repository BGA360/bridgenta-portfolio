---
title: "Lumina Praxis"
subtitle: "Praxis-Website & Interaktive Rechner"
description: "Modernes Portal für eine biologische Zahnarztpraxis mit medizinischen SEO-Strukturen und interaktivem Vitality-Score-Rechner."
schemaType: "CreativeWork"
sidebar:
  category: "Praxis-Website / Web-App"
  status: "Abgeschlossen"
  timeline: "Herbst 2025"
  role: "Frontend Engineer & Local SEO Designer"
  technologies: "HTML5, Tailwind CSS, JavaScript, Responsive Layout, Medical SEO"
  devStack:
    - HTML5
    - Tailwind CSS
    - JavaScript (ES6)
    - Responsive Design
    - Medical SEO
    - WCAG Accessibility
  aiBuilders:
    - Claude
    - Antigravity
---

## Kurzfassung
Lumina Praxis ist ein Webportal, dessen Gestaltung auf gute Zugänglichkeit, verständliche Informationsvermittlung und responsive Nutzung ausgerichtet wurde. Die Anwendung kombiniert ein ansprechendes, gut lesbares Informationsangebot mit interaktiven Elementen. Ziel des Projekts war die Etablierung eines digitalen Aufklärungskonzepts, um Orientierung zu bieten, das Patientenvertrauen in biologische Heilverfahren zu stärken und die Online-Terminbuchungsprozesse zu unterstützen.

---

## Ausgangssituation
Biologische Zahnarztpraxen behandeln Patienten unter Berücksichtigung systemischer Zusammenhänge. Solche medizinischen Konzepte bedürfen einer detaillierten und verständlichen Aufklärung auf der Website. Das Vorgängersystem war unübersichtlich, lud auf Mobilgeräten langsam und war für ältere oder sehbehinderte Patienten schwer zugänglich. Zudem fehlte eine optimierte Präsenz für die lokale Suche im Einzugsgebiet.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Medizinische Webseiten müssen komplexe Fachinhalte strukturiert aufbereiten, um sowohl die Anforderungen von Patienten als auch die Kriterien lokaler Suchmaschinen zu erfüllen.</p>
</div>

---

## Problemstellung
Medizinische Aufklärungsangebote sind oft schwer verständlich und unzugänglich für Menschen mit Einschränkungen. Zudem birgt die Implementierung interaktiver Tools (wie medizinischer Rechner) Risiken für den Datenschutz. Wenn Patientendaten zur Berechnung an einen Server übermittelt werden, unterliegen diese strengen regulatorischen Vorgaben (DSGVO). Es fehlte ein Lösungsansatz, der Barrierearmut, schnelle Ladezeiten und eine datenschutzorientierte, clientseitige Verarbeitung sensibler Eingaben miteinander verbindet.

---

## Rahmenbedingungen
Bei der Entwicklung mussten strenge Vorgaben eingehalten werden:
- **Zugänglichkeit (WCAG 2.1 AA-Orientierung)**: Kontraste, Tastaturbedienbarkeit und Screenreader-Unterstützung wurden als Designziele vorgegeben.
- **Datenschutz (DSGVO)**: Für den Vitality-Score-Rechner war keine serverseitige Verarbeitung der eingegebenen Gesundheitswerte vorgesehen.
- **Mobile Performance**: Schnelle Ladezeiten auch bei schlechter mobiler Netzabdeckung waren für Patienten von unterwegs essenziell.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Der Verzicht auf eine serverseitige Verarbeitung der Eingabewerte reduziert eine mögliche Datenübertragung und begrenzt damit einen Teil der datenschutzbezogenen Risiken.</p>
</div>

---

## Technische Überlegungen
Die Lösung basiert auf einem statischen Frontend-Ansatz (Jamstack-Philosophie) kombiniert mit clientseitiger Logik. Der Verzicht auf einen eigenen dynamischen Berechnungs-Backenddienst reduziert die serverseitige Angriffsfläche für diesen Verarbeitungspfad. Nach dem dokumentierten Umsetzungskonzept erfolgt die Auswertung clientseitig im Browser. Dies spart Serverressourcen. Für die Berechnung ist keine Übertragung der eingegebenen Werte an einen serverseitigen Analysedienst vorgesehen.

---

## Architektur
Das dokumentierte Architekturkonzept sieht eine clientseitige Ausführung der Anwendung vor. Die statischen Seiten werden vorgerendert bereitgestellt. Im dokumentierten Architekturkonzept verarbeitet Vanilla JavaScript die Benutzereingaben im DOM und aktualisiert die Ergebnisansicht clientseitig. Für die Berechnung ist nach dem Laden der Seite keine weitere Verbindung zu einem serverseitigen Analysedienst vorgesehen.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Ein rein clientseitiger Berechnungs- und Renderzyklus minimiert Latenzen und entlastet die Hosting-Infrastruktur bei steigenden Nutzerzahlen.</p>
</div>

---

## Technische Entscheidungen
Wesentliche technische Entscheidungen prägten die Architektur von Lumina Praxis:

<div class="decision-grid">
  <div class="decision-card">
    <h3 class="decision-card__title">Layout-System</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Bootstrap oder Custom CSS Grid</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Tailwind CSS für ein konsistentes Design-System und schnelle Anpassbarkeit.</p>
    </div>
  </div>
  <div class="decision-card">
    <h3 class="decision-card__title">Berechnungs-Logik</h3>
    <div class="decision-card__group">
      <span class="decision-card__label">Alternative</span>
      <p class="decision-card__text">Node.js API-Endpunkt</p>
    </div>
    <div class="decision-card__group">
      <span class="decision-card__label">Entscheidung</span>
      <p class="decision-card__text">Vanilla JavaScript für clientseitige Berechnungen zur Einhaltung des Datenschutzes.</p>
    </div>
  </div>
</div>

---

## Umsetzung
Die Entwicklung orientierte sich an barrierearmen Markup-Strukturen. Formularelemente wurden semantisch deklariert und mit entsprechenden ARIA-Attributen versehen. Der Vitality-Score-Rechner wurde in ES6-JavaScript implementiert. Um die lokale Auffindbarkeit der Praxis zu unterstützen, wurden strukturierte JSON-LD-Daten vom Typ Dentist und MedicalBusiness in die Vorlagen integriert.

---

## Öffentliche Projekteinblicke

<figure>
  <img src="/images/lumina-portfolio/lumina-vitality-score-benutzeroberflaeche.jpeg" alt="Rekonstruierte Benutzeroberfläche des mehrstufigen Lumina-Praxis Vitality-Score-Rechners." loading="lazy" width="1293" height="728" />
  <figcaption><strong>Artefakt 1: Benutzeroberfläche des Vitality-Score-Rechners</strong> – Typ: Codebasierte Rekonstruktion. Quelle: Ursprünglicher Lumina-Praxis-Codebestand. Zweck: Darstellung des mehrstufigen Fragebogens und der Benutzerinteraktion. Nachweisstatus: Belegt die aus dem ursprünglichen Code rekonstruierte Interface- und Interaktionsstruktur; kein Nachweis der medizinischen oder klinischen Validität der dargestellten Aussagen.</figcaption>
</figure>

<figure>
  <img src="/images/lumina-portfolio/lumina-vitality-score-berechnungslogik.jpeg" alt="Codebasierte Darstellung der Berechnungs- und Ergebnislogik des Lumina-Praxis Vitality-Score-Rechners." loading="lazy" width="1326" height="791" />
  <figcaption><strong>Artefakt 2: Berechnungs- und Ergebnislogik des Vitality-Score-Rechners</strong> – Typ: Codebasierte Logikrekonstruktion. Quelle: Ursprünglicher Lumina-Praxis-Codebestand. Zweck: Darstellung des dokumentierten Scorebereichs, der Schwellenwerte und der Zuordnung zu Ergebniszuständen. Nachweisstatus: Belegt die im ursprünglichen Code angelegte Softwarelogik; kein Nachweis der klinischen, medizinischen oder diagnostischen Validität der Kategorien.</figcaption>
</figure>

<figure>
  <img src="/images/lumina-portfolio/lumina-vitality-score-verarbeitungsgrenze.svg" alt="Architekturdiagramm zur clientseitigen Verarbeitung und Datenübertragungsgrenze des Vitality-Score-Rechners." loading="lazy" width="800" height="450" />
  <figcaption><strong>Artefakt 3: Verarbeitungsgrenze des Vitality-Score-Rechners</strong> – Typ: Architekturdiagramm. Quelle: Rekonstruktion der dokumentierten Anwendungsarchitektur. Zweck: Darstellung der vorgesehenen clientseitigen Verarbeitung und der Grenze zur serverseitigen Analyse. Nachweisstatus: Architektur- und Implementierungsmodell; kein Laufzeit-, Datenschutz- oder Sicherheits-Audit.</figcaption>
</figure>

<div class="architecture-note">
  <strong>Dokumentationsübersicht (Qualitäts- und Datenschutzziele)</strong> – Zweck: Zusammenfassende Darstellung der im Projekt dokumentierten Zugänglichkeits- und Datenschutzanforderungen.
</div>

<div class="evidence-grid">
  <div class="evidence-card">
    <h4 class="evidence-card__title">Patientendatenschutz</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">Datenschutzorientiertes Verarbeitungskonzept für sensible medizinische Eingaben.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">Clientseitige Auswertung im Browser; eine serverseitige Übertragung der Eingabewerte ist im dokumentierten Konzept nicht vorgesehen.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Visueller Kontrast</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">Orientierung an WCAG 2.1 (AA).</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">Bei der Gestaltung wurde auf ausreichende Kontraste und eine gute Lesbarkeit geachtet.</p>
      </div>
    </div>
  </div>
  <div class="evidence-card">
    <h4 class="evidence-card__title">Navigation</h4>
    <div class="evidence-card__meta">
      <div class="evidence-card__item">
        <span class="evidence-card__label">Soll-Vorgabe</span>
        <p class="evidence-card__value">Unterstützung von Tastatur- und Screenreader-Bedienung.</p>
      </div>
      <div class="evidence-card__item">
        <span class="evidence-card__label">Ist-Zustand</span>
        <p class="evidence-card__value">Semantische Beschriftung, nachvollziehbare Fokusführung und zugängliche Interaktion wurden als Gestaltungsziele berücksichtigt.</p>
      </div>
    </div>
  </div>
</div>

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Durchdachte Tastaturnavigation und Kontrastoptimierung unterstützen die barrierearme Nutzung medizinischer Webportale.</p>
</div>

---

## Ergebnisse

### Implementierte Ergebnisse
- Bereitstellung der statischen Webportal-Struktur zur Präsentation ganzheitlicher Praxisleistungen.
- Integration strukturierter JSON-LD-Suchdaten vom Typ Dentist und MedicalBusiness in das Markup.
- Technische Integration eines clientseitigen JavaScript-Moduls zur Vitality-Score-Berechnung.

### Technische Eigenschaften
- Lokale Berechnung im Browser-DOM zur Verringerung der netzwerkbasierten Datenübertragung.
- Verringerung der serverseitigen Angriffsfläche durch den Verzicht auf dynamische Server-Skripte für diesen Pfad.

### Projektziele
- Strukturierung von Fachinhalten zur Stärkung des Aufklärungsgrades bei Patienten.
- Förderung der barrierearmen Nutzung durch Tastaturbedienbarkeit und Farbkontraste.

> [!NOTE]
> **Nachweisgrenze der Dokumentation**
> Quantitative Conversion-Messungen sowie vollständige Lighthouse-Auditprotokolle sind nicht Bestandteil der vorliegenden technischen Dokumentation dieser Fallstudie.

---

## Erkenntnisse aus der Entwicklung
Die Umsetzung dieses Fachportals unterstrich die Bedeutung einer engen Verzahnung von Informationsarchitektur, Datenschutz und Barrierearmut. Die Entscheidung, den Vitality-Score-Rechner rein clientseitig zu implementieren, war sowohl aus Performance-Gründen als auch zum Schutz vertraulicher Patientendaten eine geeignete Lösung. Zudem zeigte sich, dass eine an WCAG-Vorgaben orientierte, barrierearme Gestaltung und ein ansprechendes Design einander unterstützen können, um ein vertrauenswürdiges Nutzererlebnis zu schaffen.

---

## Nächste Entwicklungsschritte
Für zukünftige Erweiterungen ist die Integration einer Progressive Web App (PWA) Struktur vorgesehen. Dadurch können Notfallkontaktdaten, wichtige Verhaltensregeln nach Operationen und Praxisöffnungszeiten bei unzureichender Netzabdeckung oder offline abgerufen werden.

<div class="engineering-insight">
  <div class="engineering-insight__title">Technische Erkenntnis</div>
  <p class="engineering-insight__text">Service-Worker-Caching kann die Verfügbarkeit wichtiger Inhalte bei eingeschränkter Netzverbindung verbessern.</p>
</div>

---

## Quellen und Referenzen
- [WCAG 2.1 Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG21/)
- [Schema.org Dentist Specification](https://schema.org/Dentist)
- [Schema.org MedicalBusiness Specification](https://schema.org/MedicalBusiness)
