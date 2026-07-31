# BridGenta BECC Reference Programme — Published-Page Evidence Record

This record documents the raw evidence compiled from the live production website during the Sprint 8 independent audit.

---

## 1. File and Network Metadata
* **Target URL:** `https://bridgenta.de/project-bridgenta/`
* **HTTP Status Code:** `200 OK`
* **Response Content-Length:** `51,899` bytes
* **Deployed Git Commit:** `a330ce677ec5329cf329158c54c34cb94cb6fef5`
* **GitHub Actions Run ID:** `30032223285`
* **Verification Timestamp:** 2026-07-23T19:07:30Z

---

## 2. Heading Inventory Matches (Live HTML)
The following headings were verified directly on the live production DOM:
* **H1:** `BridGenta` (1 instance)
* **H2:**
  - `Kurzfassung`
  - `Warum dieses Projekt entstand`
  - `Ausgangssituation`
  - `Problemstellung`
  - `Rahmenbedingungen`
  - `Rekonstruktionsstrategie`
  - `Technische Überlegungen`
  - `Fähigkeitsbereiche und Intelligence Domains`
  - `Architektur und Preservation Layers`
  - `Technische Entscheidungen`
  - `Umsetzung`
  - `Validierung`
  - `Öffentliche Projekteinblicke`
  - `Ergebnisse`
  - `Risiken`
  - `Erkenntnisse aus der Entwicklung`
  - `Nächste Entwicklungsschritte`
  - `Quellen und Referenzen`
* **H3:**
  - `Inkrementelle IT-Rekonstruktion`
  - `Kontextreiche Wissensmodellierung`
  - `Logische Datentrennung (Gateway)`
  - `Git-basiertes Branch-Gating`
  - `Arbeitsbereich: Systemanalyse und Isolierung`
  - `Arbeitsablauf: Strukturierte Codegenerierung`
  - `Governance: Validierung und Qualitätskontrolle`
  - `Handoff-Stabilität`
  - `Sicherheit`
  - `Wartbarkeit`

---

## 3. Evidence-Scoped Text Snippets (Live HTML)
Verified that absolute guarantees are removed and scoped to the pilot context:
1. **Decision Card 3 (UI Isolation):**
   `Risikominimierung durch UI-Isolation: Die KI agiert ausschließlich auf der UI-Ebene.`
2. **Results Section:**
   `Durch den strukturierten Prozess wurden im Rahmen des Testlaufs messbare quantitative Erfolge erzielt:`
3. **Results Grid - Card 1 (Handoff):**
   `100% der Code-Übergaben im Pilotlauf wurden über isolierte Branches konfliktfrei integriert.`
4. **Results Grid - Card 2 (Security):**
   `In den protokollierten Prüfungen der kontrollierten Pilotumgebung wurden keine Datenübertragungen außerhalb der definierten Gateway-Regeln festgestellt.`
5. **Results Grid - Card 3 (Maintainability):**
   `Manuelle Reviews begleiteten die Prüfung, in deren dokumentiertem Pilotlauf Quality Gate A bestanden wurde und die Modulkomplexität innerhalb des erfassten Prüfumfangs bewertet wurde.`

---

## 4. Asset Availability
* **Layout Hero Image:** `/images/bga-portfolio/BG-PA01-Hero.webp` (HTTP 200, SHA-256: `D35E51B70CFF5E4B60BFE617AD2320DEB27A2DE89DFF2CE060956BB7BAF66EC9`, Dimensions: 1672 x 941, Role: Active page hero / layout asset)
* **Showcase Image 1 (Workspace):** `/images/bga-portfolio/BG-PA02-Workspace.webp` (HTTP 200, SHA-256: `0B3FE0913BA3B8E5FB414D0FD815D2838BDE5E8C1DDA4DED3320157483ACD9FD`, Dimensions: 1600 x 900, Role: Active figure image)
* **Showcase Image 2 (Workflow):** `/images/bga-portfolio/BG-PA03-Workflow.webp` (HTTP 200, SHA-256: `3F5228F25BB1DD72672D03D0681C75C28F4A7F26B51EDCCA20D375F2BAAC82DB`, Dimensions: 1600 x 900, Role: Active figure image)
* **Showcase Image 3 (Governance):** `/images/bga-portfolio/BG-PA04-Governance.webp` (HTTP 200, SHA-256: `CA5FF1EDA2F75E32F81A9B3FAB2A8BAA38561437B5D1B9AF6CA04CA28BB0D071`, Dimensions: 1600 x 900, Role: Active figure image)
* **Preloaded Fonts:** `/fonts/inter-latin.woff2`, `/fonts/fraunces-latin.woff2` (HTTP 200)
* **Service Worker Script:** `/service-worker.js` (HTTP 200, verified `bridgenta-portfolio-v21` version)
