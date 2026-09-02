# BECC Learning — Governed Draft Preview Capability Design

*   **Dokument-ID:** `BECC-LEARNING-DRAFT-PREVIEW-DESIGN-v1.0`
*   **Phase / Status:** `C4.3-P2-R1-R2-R3 — R3 CURRENT AUTHORITATIVE DESIGN STATE`
*   **Datum der Überarbeitung:** 2026-09-02
*   **Vorheriger Commit (R2):** `9a6f73fb1960d53ee5fd7159a7b44699d261c390`
*   **Autorität:** Constitutional Architect / Project Owner
*   **Geltungsbereich:** `bridgenta-portfolio` Learning Architecture

---

## 1. Problemstellung & Zweck

Die BridGenta Learning-Architektur unterstützt Artikel im Entwurfsstadium (`publicationState: "draft"`). Gemäß den strikten Schema-Regeln in `src/content/config.ts` dürfen Entwürfe **kein Publikationsdatum (`publishedAt`)**, kein Aktualisierungsdatum (`updatedAt`) und keinen `publicStatus` enthalten.

In der aktuellen Routen-Konfiguration (`src/pages/lernen/[slug].astro`) werden Entwürfe von der statischen Routen-Generierung ausgeschlossen:

```ts
const publishedArticles = observedArticles.filter(
  (art) => art.data.publicationState === 'published'
);
```

### Die daraus resultierende Lücke:
* Quelltext-Audits, Schema-Validierungen (`npm run lint`), Link-Prüfungen (`npm run check-links`) und M5-Shadow-Beobachtungen (`npm run m5:shadow`) funktionieren einwandfrei für Entwürfe.
* Eine **echte visuelle Inspektion** des gerenderten Entwurfs im tatsächlichen Astro-Learning-Layout (`Layout.astro`, `learning-prose`, Callout-Komponenten, Footer-Signatur, responsive Viewports) ist jedoch lokal nicht möglich, ohne den Entwurf fälschlicherweise auf `published` zu setzen oder ein fiktives `publishedAt` einzufügen.

Dieses Dokument definiert das **governed Design für eine lokale Entwurfs-Vorschau (Draft Preview Capability)**, die Entwürfe lokal gerendert darstellt, ohne sie zu veröffentlichen oder das Produktions-Build zu gefährden.

---

## 2. Architektur-Prinzipien & Zustand-Scope

$$\text{CAPABILITY NAME} == \text{CAPABILITY SCOPE} == \text{ROUTE SELECTOR}$$
$$\text{DRAFT PREVIEW} \neq \text{NON-PUBLISHED PREVIEW}$$
$$\text{draft} \neq \text{review} \neq \text{published}$$

1. **Strikter Entwurfs-Erhalt (Draft State Scope):** Die Vorschau gilt ausnahmslos für Artikel mit `publicationState === 'draft'`.
2. **Review-Zustand ausgeschlossen:** Der Zustand `publicationState: 'review'` ist ein eigener Lifecycle-Zustand und wird durch diese Routen-Konfiguration **nicht** erfasst (`REVIEW_STATE_PREVIEW_AUTHORIZATION: NOT_GRANTED`).
3. **Exakter Selektor:** Der Selektor für die Vorschau lautet exakt `publicationState === 'draft'` (kein amorpher `!== 'published'` Selektor im Umsetzungs-Vertrag).
4. **Keine Produktions-Exposition (Fail-Closed):** Die Vorschau-Route wird im Produktions-Build (`import.meta.env.DEV === false`) zu 100 % ausgeschlossen (`getStaticPaths` gibt `[]` zurück).
5. **Keine Suchmaschinen-Sichtbarkeit:** Entwurfs-Vorschauen erscheinen niemals in Sitemap (`sitemap.xml`), RSS-Feeds, der öffentlichen Lernübersicht oder Hauptnavigations-Links.
6. **Shared Article Renderer:** Beide Routen (öffentlich und Vorschau) nutzen dieselbe Präsentations-Komponente, um Template-Drift auszuschließen.

---

## 3. Lifecycle-Vertragstabelle (Lifecycle Contract Table)

| `publicationState` | Öffentliche Route (`/lernen/[slug]/`) | Entwurfs-Vorschau (`/lernen/preview/[slug]/`) | `publishedAt` Pflicht? | Vorschau-Autorität |
| :--- | :---: | :---: | :---: | :--- |
| `draft` | NEIN | **JA (DEV Mode)** | NEIN | **GRANTED BY DESIGN** |
| `review` | NEIN | **NEIN** | NEIN | **NOT_GRANTED (Out of Scope)** |
| `published` | **JA** | **NEIN** | JA | NOT_APPLICABLE |

---

## 4. Architektur-Vertrags-Zusammenfassung (Architecture Contract Summary)

```text
ÖFFENTLICHE ROUTE:
publicationState === 'published'

ENTWURFS-VORSCHAU ROUTE:
publicationState === 'draft' (Nur DEV-Modus)

REVIEW ZUSTAND:
Nicht in Entwurfs-Vorschau enthalten (Out of scope)

SHARED ARTICLE RENDERER:
Wird sowohl von öffentlicher Route als auch von Entwurfs-Vorschau genutzt

PRODUKTIONS-VORSCHAU-ROUTEN:
Exakt NULL (getStaticPaths gibt [] bei !import.meta.env.DEV zurück)
```

---

## 5. Ziel-Architektur: Shared Article Renderer Component

Die Präsentations-Logik wird in eine gemeinsame Astro-Komponente extrahiert (`src/components/LearningArticleRenderer.astro`), während Routen-Autorität und Publikations-Semantik strikt getrennt bleiben:

```text
src/pages/lernen/[slug].astro
        │
        │ Öffentliche Routen-Autorität (publicationState === 'published')
        ▼
src/components/LearningArticleRenderer.astro (Gemeinsame visuelle Hülle)
        ▲
        │ Dev-Only Entwurfs-Vorschau (publicationState === 'draft')
        │
src/pages/lernen/preview/[slug].astro
```

---

## 6. Aufteilung der Verantwortlichkeiten (Responsibility Split)

### 6.1 Öffentliche Route (`src/pages/lernen/[slug].astro`)
* Auswählen ausschließlich veröffentlichter Artikel (`publicationState === 'published'`).
* Erzeugen öffentlicher URLs (`/lernen/[slug]/`).
* Erzwingen von `publishedAt` und Handling von `updatedAt`.
* Erzeugen öffentlicher kanonischer SEO-Metadaten und `learningArticle` Schema.org-Struktur.

### 6.2 Vorschau-Route (`src/pages/lernen/preview/[slug].astro`)
* Auswählen ausschließlich von Entwürfen (`publicationState === 'draft'`) im Dev-Modus.
* Erzeugen von Vorschau-URLs (`/lernen/preview/[slug]/`).
* Rendern des Entwurfs-Status-Banners (`LOKALE ENTWURFS-VORSCHAU — NICHT VERÖFFENTLICHT`).
* Kein Erfordernis für `publishedAt`.
* Fail-Closed Guard: Im Produktions-Build (`!import.meta.env.DEV`) gibt `getStaticPaths()` ein leeres Array `[]` zurück.

### 6.3 Gemeinsamer Renderer (`src/components/LearningArticleRenderer.astro`)
* `Layout.astro` Hülle.
* Titel und Lede (`description`).
* `LearningLevelBadge` Rendering.
* Breadcrumb-Container.
* Prose-Wrapper (`class="learning-prose"`) & `tina-content` Bereich.
* Rendern des Markdown-Bodys (`<Content />`).
* Callout-Styling (`learning-evidence-boundary`, `> [!IMPORTANT]`).
* Projekt-Kontext-Footer (`learning-article__project-context`).
* Zentrale BridGenta-Signatur (`learning-article__signature`).
* Footer-Navigation (`learning-footer-nav`).

---

## 7. Bedrohungs- & Risiko-Analyse

| Risiko | Schweregrad | Schutzmaßnahme |
| :--- | :--- | :--- |
| **Versehentliche Indizierung durch Crawlers** | Hoch | Route existiert im Produktions-Build nicht (`getStaticPaths` gibt `[]` zurück). |
| **Sitemap-Leck** | Hoch | Sitemap-Generator greift nur auf `published` Artikel zu. |
| **Fingiertes Publikationsdatum** | Mittel | Vorschau rendert `LOKALE ENTWURFS-VORSCHAU` statt `Veröffentlicht am <Datum>`. |
| **Ambiguity / Review-State-Leck** | Mittel | Selektor prüft strikt auf `publicationState === 'draft'`. |
| **Parallel-Template Drift** | Niedrig | Verwendet identische CSS-Klassen (`learning-prose`) und Komponenten via `LearningArticleRenderer.astro`. |

---

## 8. Zukünftiger Testplan & Negativ-Tests (für Phase C4.3-P2-R1-R3)

1. **Draft State Test:** `publicationState === 'draft'` Artikel erzeugt im Dev-Modus eine Vorschau-Route unter `/lernen/preview/[slug]/`.
2. **Review State Negativ-Test:** `publicationState === 'review'` Artikel erzeugt **keine** Vorschau-Route.
3. **Published State Negativ-Test:** `publicationState === 'published'` Artikel erzeugt **keine** Vorschau-Route unter `/lernen/preview/[slug]/`.
4. **Prod-Build Fail-Closed Test:** `npm run build` generiert **0** HTML-Dateien unter `dist/lernen/preview/`.
5. **Layout- & Render-Parität:** Überprüfung von Callouts (`learning-evidence-boundary`, `> [!IMPORTANT]`), Typografie und Responsive-Verhalten auf Desktop (1440px), Tablet (768px) und Mobile (390px).
6. **Publikations-Regressions-Gate:** Veröffentlichte Artikel (`layout-absicherung-in-mobilen-ansichten.md`, `code-fakten-vs-strukturelle-korrektheit.md`) verhalten sich unberührt.

---

## 9. Historische Entscheidungs-Entwicklung

### R1-R2-R1 Stand (Historisch):
* Evaluierung von 5 Kandidaten-Designs. Vorläufige Entscheidung für isolierte Dev-Route.

### R2 Stand (Historisch):
* Refactoring auf Shared Article Renderer (`LearningArticleRenderer.astro`) zur Vermeidung von Template-Drift.

### R3 Stand (Aktueller autoritativer Zustand):
* Exakte Bindung des Selektors auf `publicationState === 'draft'`.
* Expliziter Ausschluss von `publicationState === 'review'`.
* Streichung aller amorphe `!== 'published'` Umsetzungs-Selektoren.

---

## 10. Autoritäts- & Entscheidungs-Status

```yaml
DRAFT_PREVIEW_CAPABILITY_DECISION: APPROVE_DESIGN
DECISION_AUTHORITY: GRANTED
IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
PUBLICATION_AUTHORIZATION: NOT_GRANTED
PROVENANCE_REGISTRY_CHANGE_AUTHORIZATION: NOT_GRANTED
CURRENT_AUTHORITATIVE_DESIGN_STATE: R3
CAPABILITY_NAME: DRAFT_PREVIEW
DRAFT_PREVIEW_STATE_SCOPE: draft only
PREVIEW_SELECTOR: publicationState === 'draft'
REVIEW_STATE_PREVIEW_AUTHORIZATION: NOT_GRANTED
REVIEW_STATE_PREVIEW_CAPABILITY: OUT_OF_SCOPE
RECOMMENDED_PREVIEW_ARCHITECTURE: DEV_ONLY_PREVIEW_ROUTE_WITH_SHARED_ARTICLE_RENDERER
SHARED_RENDER_COMPONENT_REFACTOR_REQUIRED: YES
PARALLEL_TEMPLATE_DRIFT_RISK_AFTER_DESIGN: MINIMIZED
PRODUCTION_PREVIEW_GENERATION_TARGET: ZERO
PRODUCTION_DIST_PREVIEW_ARTIFACTS: ZERO
RECOMMENDED_NEXT_PHASE: C4.3-P2-R1-R2-R3-MA-PMV — PR #260 Exact-Head Merge Authorization & Post-Merge Verification
```

*Hinweis: Die Umsetzung dieses Designs erfolgt erst nach Zusammenführung von PR #260 und expliziter Freigabe der Umsetzungsphase `C4.3-P2-R1-R3` durch den Project Owner.*
