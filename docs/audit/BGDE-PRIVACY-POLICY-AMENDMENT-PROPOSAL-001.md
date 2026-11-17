# BGDE-PRIVACY-POLICY-AMENDMENT-PROPOSAL-001

**Document Type:** Legal & Technical Amendment Proposal (Non-Published)  
**Status:** DRAFT FOR OWNER & LEGAL COUNSEL REVIEW  
**Publication Authority:** Human Owner Only — DO NOT PUBLISH AUTOMATICALLY  
**Target Document:** `src/pages/datenschutz.astro` (`https://bridgenta.de/datenschutz/`)  
**Associated Assessment:** `BGDE-PUBLIC-SECURITY-AUDIT-001` (Finding FIND-04)  
**Associated Remediation:** `BGDE-PUBLIC-TRUST-REMEDIATION-IMPL-001`

---

## 1. Executive Summary & Rationale

During the security and privacy audit (`BGDE-PUBLIC-SECURITY-AUDIT-001`), discrepancies were identified between the published Datenschutzerklärung and the actual technical controls of the BridGenta portfolio website:

1. **Nonexistent Contact Form:** The published policy states that inquiries sent via a contact form are stored. In reality, the website provides direct `mailto:` links and an email copy utility; no contact form exists.
2. **Cookie Consent Banner Contradiction:** The policy stated that no cookie banner is necessary due to Privacy by Default, yet a cookie consent dialog was previously rendered across all pages. Under `BGDE-PUBLIC-TRUST-REMEDIATION-IMPL-001`, the nonfunctional consent dialog has been removed from the layout.
3. **Omission of Browser Cache & Service Worker Details:** The technical implementation uses a Service Worker (`public/service-worker.js`) and Cache Storage (`caches`) for offline availability. This client-side device storage was not documented.
4. **Omission of Conditional External CDN Resource:** Technical diagrams on project case studies conditionally load Mermaid.js from `https://cdn.jsdelivr.net`. The transmission of the visitor's IP address to this external CDN was unmentioned.
5. **Absence of Newsletter Processing:** The former footer newsletter mockup has been replaced with a direct `mailto:` link. The policy should clarify that no newsletter subscription service is operated.

This document presents a proposed, section-by-section replacement text for `src/pages/datenschutz.astro` for review by the Human Owner and qualified legal counsel.

---

## 2. Proposed Amendment (Full Section-by-Section Text)

### Section 1: Datenschutz auf einen Blick

#### Aktuelle Fassung (Auszug):
> **Wie erfassen wir Ihre Daten?**  
> Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).

#### Vorgeschlagene Neufassung:
> **Wie erfassen wir Ihre Daten?**  
> Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei handelt es sich um Daten, die Sie uns per E-Mail übermitteln (z. B. Name, E-Mail-Adresse und Inhalt Ihrer Nachricht). Diese Website verwendet **kein Kontaktformular** und **keinen Newsletter-Dienst**.  
> Andere Daten werden automatisch beim Besuch der Website durch die IT-Systeme unseres Hosting-Providers erfasst. Das sind vor allem technische Verbindungsdaten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).

---

### Section 3.1: Cookies, Lokale Speicherung & Tracking (Privacy by Default)

#### Aktuelle Fassung:
> Diese Website ist nach dem Prinzip **Privacy by Default (Privatsphäre durch Voreinstellung)** konzipiert. Wir speichern **keine analytischen Cookies oder Tracking-Skripte** (wie z.B. Google Analytics oder Facebook-Pixel) auf Ihrem Gerät. Daher ist für die Nutzung dieses Portfolios keine Einwilligung in Form eines Cookie-Banners erforderlich.

#### Vorgeschlagene Neufassung:
> Diese Website ist nach dem Prinzip **Privacy by Default (Privatsphäre durch Voreinstellung)** konzipiert:
> 
> - **Keine Cookies:** Wir setzen weder technisch notwendige noch optionale HTTP-Cookies.
> - **Kein Tracking & keine Web-Analyse:** Es werden keine Analyse-Tools (wie Google Analytics, Matomo o. Ä.) oder Werbe-Pixel eingesetzt.
> - **Kein Cookie-Banner:** Da keine einwilligungspflichtigen Cookies oder Tracking-Dienste verwendet werden, wird auf dieser Website kein Cookie-Banner angezeigt.
> - **Technischer Service Worker & Offline-Cache (Cache Storage):** Zur Gewährleistung eines stabilen und schnellen Aufrufs sowie zur Bereitstellung einer Offline-Ansicht nutzt diese Website einen lokalen Service Worker. Hierbei werden statische Webseitenelemente (HTML, CSS, Schriften, Bilder) im lokalen Cache-Speicher Ihres Browsers hinterlegt (§ 25 Abs. 2 Nr. 2 TDDDG – zwingend erforderlich zur Bereitstellung des vom Nutzer ausdrücklich gewünschten Telemediendienstes). Es werden hierbei keinerlei personenbezogene Daten oder Nutzungsprofile gespeichert.

---

### Section 3.3: Kontaktaufnahme per E-Mail (Ersetzt "Kontaktformular")

#### Aktuelle Fassung (Kontaktformular):
> Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).

#### Vorgeschlagene Neufassung (Kontaktaufnahme per E-Mail):
> Wenn Sie uns per E-Mail Anfragen zukommen lassen (z. B. über die auf der Website verlinkten E-Mail-Adressen), werden Ihre Angaben inklusive Ihrer E-Mail-Adresse und des Nachrichteninhalts zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns verarbeitet und gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung an Dritte weiter.
> 
> Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
> 
> Die von Ihnen an uns per E-Mail übersandten Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihres Anliegens). Zwingende gesetzliche Bestimmungen – insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.

---

### Section 4: Plugins, Tools & Externe Ressourcen

#### Ergänzung 4.2: Externe Einbindung von Mermaid.js über CDN

#### Vorgeschlagener neuer Abschnitt:
> **Diagramm-Darstellung (Mermaid.js via jsDelivr CDN)**  
> Auf einzelnen Projekt-Detailseiten dieses Portfolios werden technische Architektur- und Ablaufdiagramme dynamisch gerendert. Sofern auf einer solchen Seite ein entsprechendes Diagramm enthalten ist, lädt Ihr Browser die Visualisierungs-Bibliothek Mermaid.js von den Servern des Content Delivery Networks (CDN) der **ProspectOne Sp. z o.o.** (Królewska 65A/1, 30-081 Krakau, Polen; Betreiber von jsDelivr).  
> 
> Hierbei wird aus technischen Gründen Ihre IP-Adresse an die Server von jsDelivr übertragen, um die Skript-Datei an Ihren Browser auszuliefern. Die Einbindung erfolgt auf Grundlage unseres berechtigten Interesses an einer ansprechenden und technisch performanten Darstellung unserer Arbeitsproben (Art. 6 Abs. 1 lit. f DSGVO). Weitere Informationen zum Datenschutz bei jsDelivr finden Sie unter: https://www.jsdelivr.com/privacy-policy-jsdelivr-net.

---

## 3. Unresolved Legal Questions Requiring Owner & Legal Review

Before publishing these changes, the following open questions must be formally assessed by legal counsel:

| Question ID | Topic | Specific Legal Consideration | Action / Decision Needed |
| :--- | :--- | :--- | :--- |
| **LQ-01** | **Hosting Provider Identification** | The site is deployed via GitHub Pages (GitHub, Inc., USA / Fastly, Inc.). Does the privacy notice need explicit identification of GitHub Inc. and US data transfer mechanisms (EU-US Data Privacy Framework / Standard Contractual Clauses) under Art. 13(1)(f) DSGVO? | Legal confirmation whether Section 3.2 (Server-Log-Dateien) must explicitly name GitHub, Inc. |
| **LQ-02** | **External CDN jsDelivr** | jsDelivr is operated by ProspectOne Sp. z o.o. (Poland, EU). Does loading Mermaid.js from their CDN require consent under § 25 Abs. 1 TDDDG if cookies/storage are accessed by the CDN, or does it qualify under Art. 6(1)(f) DSGVO / § 25 Abs. 2 Nr. 2 TDDDG? Alternatively, should Mermaid.js be vendored locally to eliminate the external transmission entirely? | Assess vendor preference vs. legal consent obligation. |
| **LQ-03** | **Service Worker Offline Cache (§ 25 TDDDG)** | Is the caching of static assets by the service worker solely justified under § 25 Abs. 2 Nr. 2 TDDDG (strictly necessary for the requested telemedia service)? | Confirm justification under TDDDG / ePrivacy. |
| **LQ-04** | **Email Storage Periods** | Are standard business inquiry retention periods (e.g. 6 to 10 years for tax-relevant pre-contractual records under § 147 AO / § 257 HGB) adequately reflected in the general wording? | Finalize retention policy wording. |
| **LQ-05** | **Legacy `localStorage` State** | Visitors who previously clicked the cookie banner may still have `cookie-consent-status` in their browsers. Since it is inert and no longer read by any script, is disclosure required, or is it treated as legacy harmless storage? | Confirm no active remediation needed. |

---

## 4. Legal Publication Guard & PR Dependency Notice

> [!WARNING]
> **LEGAL PUBLICATION GUARD:**
> The technical pull request resulting from `BGDE-PUBLIC-TRUST-REMEDIATION-IMPL-001` contains the technical removal of the newsletter form and cookie banner.
> 
> **The PR MUST NOT be merged or deployed until this Privacy Policy Amendment Proposal is reviewed, finalized, and approved by the Human Owner.**
> 
> Merging the technical PR prior to updating `src/pages/datenschutz.astro` would leave the published privacy policy referencing a nonexistent contact form. Both changes should be synchronized or coordinated upon owner sign-off.
