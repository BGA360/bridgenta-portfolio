# BECC Learning — Governed Draft Preview Capability Design

*   **Dokument-ID:** `BECC-LEARNING-DRAFT-PREVIEW-DESIGN-v1.0`
*   **Phase / Status:** `C4.3-P2-R1-R2-R2 — R2 CURRENT AUTHORITATIVE DESIGN STATE`
*   **Datum der Überarbeitung:** 2026-09-02
*   **Vorheriger Commit (R1-R2-R1):** `f7cf36c483ed361dfe05d9ddd33f167e84981060`
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

## 2. Architektur-Prinzipien

$$\text{DRAFT\_PREVIEW} \neq \text{PUBLICATION}$$
$$\text{PREVIEW\_AUTHORIZATION} \neq \text{PUBLICATION\_AUTHORIZATION}$$
$$\text{LOCAL\_PREVIEW} \neq \text{PRODUCTION\_DEPLOYMENT}$$
$$\text{SAME CSS CLASSES} \neq \text{SAME RENDERING IMPLEMENTATION}$$
$$\text{SHARED PRESENTATION} \neq \text{SHARED PUBLICATION AUTHORITY}$$

1. **Strikter Entwurfs-Erhalt:** Ein Entwurf bleibt im Frontmatter ausnahmslos `publicationState: "draft"`. Es wird kein `publishedAt` fingiert.
2. **Keine Produktions-Exposition (Fail-Closed):** Die Vorschau-Route wird im Produktions-Build (`import.meta.env.DEV === false`) zu 100 % ausgeschlossen (`getStaticPaths` gibt `[]` zurück).
3. **Keine Suchmaschinen-Sichtbarkeit:** Entwurfs-Vorschauen erscheinen niemals in Sitemap (`sitemap.xml`), RSS-Feeds, der öffentlichen Lernübersicht oder Hauptnavigations-Links.
4. **Shared Article Renderer:** Beide Routen (öffentlich und Vorschau) nutzen dieselbe Präsentations-Komponente, um Template-Drift auszuschließen.

---

## 3. Entkopplungs- & Drift-Analyse (R2 Re-Evaluation)

In früheren Entwürfen (R1-R2-R1) wurde erwogen, eine zweite, unabhängige Dev-Route (`src/pages/lernen/preview/[slug].astro`) mit kopierter Seitenstruktur zu erstellen.

### R2 Korrektur der Drift-Klassifizierung:
* Eine zweite unabhängige ~100-Zeilen Routenseite birgt ein **moderates Risiko für parallel-template drift** (`DIRECT_DUPLICATE_PREVIEW_ROUTE_DRIFT_RISK: MODERATE`).
* Wenn die visuelle Vorschau-Verifikation als Evidenz für die spätere öffentliche Darstellung dienen soll, müssen **sowohl die öffentliche Route als auch die Vorschau-Route dieselbe Präsentations-Implementierung durchlaufen**.
* Eine reine Duplikation des Seiten-Templates wird daher **abgelehnt** (`DIRECT_DUPLICATION_RECOMMENDED: NO`).

---

## 4. Ziel-Architektur: Shared Article Renderer Component

Die Präsentations-Logik wird in eine gemeinsame Astro-Komponente extrahiert (`src/components/LearningArticleRenderer.astro`), während Routen-Autorität und Publikations-Semantik strikt getrennt bleiben:

```text
src/pages/lernen/[slug].astro
        │
        │ Öffentliche Routen-Autorität + publishedAt Pflicht
        ▼
src/components/LearningArticleRenderer.astro (Gemeinsame visuelle Hülle)
        ▲
        │ Dev-Only Vorschau-Autorität + Entwurfs-Banner (Fail-Closed)
        │
src/pages/lernen/preview/[slug].astro
```

---

## 5. Aufteilung der Verantwortlichkeiten (Responsibility Split)

### 5.1 Öffentliche Route (`src/pages/lernen/[slug].astro`)
* Auswählen ausschließlich veröffentlichter Artikel (`publicationState === 'published'`).
* Erzeugen öffentlicher URLs (`/lernen/[slug]/`).
* Erzwingen von `publishedAt` und Handling von `updatedAt`.
* Erzeugen öffentlicher kanonischer SEO-Metadaten und `learningArticle` Schema.org-Struktur.

### 5.2 Vorschau-Route (`src/pages/lernen/preview/[slug].astro`)
* Auswählen von Entwürfen (`publicationState !== 'published'`) ausschließlich im Dev-Modus.
* Erzeugen von Vorschau-URLs (`/lernen/preview/[slug]/`).
* Rendern des Entwurfs-Status-Banners (`LOKALE ENTWURFS-VORSCHAU — NICHT VERÖFFENTLICHT`).
* Kein Erfordernis für `publishedAt`.
* Fail-Closed Guard: Im Produktions-Build (`!import.meta.env.DEV`) gibt `getStaticPaths()` ein leeres Array `[]` zurück.

### 5.3 Gemeinsamer Renderer (`src/components/LearningArticleRenderer.astro`)
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

## 6. Schnittstellen-Design des Shared Renderers

```ts
// Interface-Skizze für src/components/LearningArticleRenderer.astro
export interface Props {
  mode: 'published' | 'preview';
  entry: CollectionEntry<'learning'>;
  categoryEntry: CollectionEntry<'learningCategories'>;
  publishedMetadata?: {
    publishedAt: Date;
    updatedAt?: Date;
    publicStatus?: string;
  };
  previewNotice?: string;
}
```

### Modus-spezifisches Verhalten:
* `mode === 'published'`: Rendert das Veröffentlichungsdatum („Veröffentlicht am...“) und das optionale Aktualisierungsdatum.
* `mode === 'preview'`: Blendete Datumsangaben aus und rendert stattdessen das **Vorschau-Banner**.

---

## 7. Evidenz-Grenze der Vorschau (Preview Evidence Boundary)

Eine erfolgreiche visuelle Entwurfs-Prüfung über die Vorschau-Route belegt:
* Korrekten Lesefluss und typografischen Rhythmus.
* Korrektes Rendering von Callout-Elementen (`learning-evidence-boundary`, `> [!IMPORTANT]`).
* Absenz von horizontalem Overflow auf mobilen Viewports (390px).
* Angemessene kognitive Pausen zwischen Absätzen.

Sie belegt **nicht**:
* Die Autorisierung zur Veröffentlichung (`PUBLICATION_AUTHORIZATION: NOT_GRANTED`).
* Die Registrierung im Provenienz-Register (`EV-BG-006`).
* Die Ausführung in der Produktions-Pipeline (`M5`).

---

## 8. Produktions-Sicherheit (Fail-Closed & Discovery Control)

1. **Guaranteed Zero Artifacts:** Im Produktions-Build dürfen keine HTML-Dateien unter `dist/lernen/preview/` erzeugt werden (`PRODUCTION_DIST_PREVIEW_ARTIFACTS: ZERO`).
2. **Sitemap & RSS Exklusion:** Die Vorschau-Route registriert sich niemals im Sitemap-Generator oder in Feeds.
3. **Fail-Closed Code Guard:**
   ```ts
   export async function getStaticPaths() {
     if (!import.meta.env.DEV) {
       return []; // Garantierter Abbruch für Produktions-Builds
     }
     // ... Dev-only Draft Lookup
   }
   ```

---

## 9. Erwarteter Umsetzungsumfang (für Phase C4.3-P2-R1-R3)

Im Rahmen der späteren Umsetzungsphase werden folgende Dateien angepasst bzw. erstellt:
1. `src/components/LearningArticleRenderer.astro` *(Neuer Shared Renderer)*
2. `src/pages/lernen/[slug].astro` *(Refactoring auf Shared Renderer)*
3. `src/pages/lernen/preview/[slug].astro` *(Neue Dev-Only Vorschau-Route)*

### Publikations-Regressions-Gate:
Vor Abschluss der Umsetzung muss durch Stichproben-Builds repräsentativer veröffentlichter Artikel (`layout-absicherung-in-mobilen-ansichten.md`, `code-fakten-vs-strukturelle-korrektheit.md`) nachgewiesen werden, dass das Refactoring des öffentlichen Templates zu keiner visuellen oder funktionellen Regression führt (`PUBLIC_ARTICLE_RENDER_REGRESSION: NONE`).

---

## 10. Historische Entscheidungs-Entwicklung

### R1-R2-R1 Stand (Historisch):
* Evaluierung von 5 Kandidaten-Designs.
* Vorläufige Entscheidung für `Candidate A` (isolierte Dev-Route).

### R2 Stand (Aktueller autoritativer Zustand):
* Befund: Isolierte Dev-Route ohne Shared Renderer führt zu Template-Drift.
* Finale Entscheidung: **`DEV_ONLY_PREVIEW_ROUTE_WITH_SHARED_ARTICLE_RENDERER`**.
* `DIRECT_DUPLICATION_RECOMMENDED: NO`
* `SHARED_RENDER_COMPONENT_REFACTOR_REQUIRED: YES`
* `PARALLEL_TEMPLATE_DRIFT_RISK_AFTER_DESIGN: MINIMIZED`

---

## 11. Autoritäts- & Entscheidungs-Status

```yaml
DRAFT_PREVIEW_CAPABILITY_DECISION: APPROVE_DESIGN
DECISION_AUTHORITY: GRANTED
IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
PUBLICATION_AUTHORIZATION: NOT_GRANTED
PROVENANCE_REGISTRY_CHANGE_AUTHORIZATION: NOT_GRANTED
RECOMMENDED_PREVIEW_ARCHITECTURE: DEV_ONLY_PREVIEW_ROUTE_WITH_SHARED_ARTICLE_RENDERER
SHARED_RENDER_COMPONENT_REFACTOR_REQUIRED: YES
PARALLEL_TEMPLATE_DRIFT_RISK_AFTER_DESIGN: MINIMIZED
PRODUCTION_PREVIEW_GENERATION_TARGET: ZERO
PRODUCTION_DIST_PREVIEW_ARTIFACTS: ZERO
RECOMMENDED_NEXT_PHASE: C4.3-P2-R1-R2-R2-MA-PMV — PR #260 Exact-Head Merge Authorization & Post-Merge Verification
```

*Hinweis: Die Umsetzung dieses Designs erfolgt erst nach Zusammenführung von PR #260 und expliziter Freigabe der Umsetzungsphase `C4.3-P2-R1-R3` durch den Project Owner.*
