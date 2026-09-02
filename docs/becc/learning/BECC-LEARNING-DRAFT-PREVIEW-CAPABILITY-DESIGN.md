# BECC Learning — Governed Draft Preview Capability Design

*   **Dokument-ID:** `BECC-LEARNING-DRAFT-PREVIEW-DESIGN-v1.0`
*   **Status:** `APPROVED_DESIGN / AWAITING_IMPLEMENTATION_AUTHORIZATION`
*   **Datum:** 2026-09-02
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
$$\text{SAME CSS CLASSES} \neq \text{SAME ROUTE}$$

1. **Strikter Entwurfs-Erhalt:** Ein Entwurf bleibt im Frontmatter ausnahmslos `publicationState: "draft"`. Es wird kein `publishedAt` fingiert.
2. **Keine Produktions-Exposition (Fail-Closed):** Die Vorschau-Route wird im Produktions-Build (`import.meta.env.DEV === false`) zu 100 % ausgeschlossen (`getStaticPaths` gibt `[]` zurück).
3. **Keine Suchmaschinen-Sichtbarkeit:** Entwurfs-Vorschauen erscheinen niemals in Sitemap (`sitemap.xml`), RSS-Feeds, der öffentlichen Lernübersicht oder Hauptnavigations-Links.
4. **Exakte Layout-Treue:** Die Vorschau nutzt die identischen Astro-Layouts, Komponenten und CSS-Klassen wie die spätere Veröffentlichung.

---

## 3. Audit der Rendering-Verantwortlichkeiten

Das öffentliche Artikel-Template (`src/pages/lernen/[slug].astro`) erfüllt folgende spezifische Aufgaben:

| Verantwortlichkeit | Öffentliche Artikel-Seite | Entwurfs-Vorschau (`/preview/`) | Wiederverwendung / Abweichung |
| :--- | :--- | :--- | :--- |
| **Page Shell** | `Layout.astro` | Identisch | **Gemeinsam genutzt** |
| **Kategorie-Lookup** | `getEntry('learningCategories', ...)` | Identisch | **Gemeinsam genutzt** |
| **Breadcrumbs** | `Breadcrumbs.astro` | Vorschau-Marker im Titel | **Gemeinsam genutzt** |
| **LearningLevelBadge** | `LearningLevelBadge.astro` | Identisch | **Gemeinsam genutzt** |
| **Lede / Beschreibung** | `<p class="lede">` | Identisch | **Gemeinsam genutzt** |
| **Publikations-Datum** | `formattedPublishDate` | **Nicht gerendert** (`publishedAt` fehlt) | **Abweichend** |
| **Vorschau-Banner** | Kein Banner | `LOKALE ENTWURFS-VORSCHAU` | **Nur Vorschau** |
| **Prose-Wrapper** | `class="learning-prose"` | Identisch | **Gemeinsam genutzt** |
| **Markdown Content** | `<Content />` | Identisch | **Gemeinsam genutzt** |
| **Projekt-Kontext** | `learning-article__project-context` | Identisch | **Gemeinsam genutzt** |
| **Signatur** | `learning-article__signature` | Identisch | **Gemeinsam genutzt** |
| **Footer-Nav** | `learning-footer-nav` | Identisch | **Gemeinsam genutzt** |

---

## 4. Bewertete Architektur-Kandidaten & Drift-Analyse

| Kandidat | Layout-Parität | Drift-Risiko | Refactor-Bedarf | Empfehlung |
| :--- | :---: | :---: | :---: | :---: |
| **Candidate R1: Dedizierte Dev-Route (`src/pages/lernen/preview/[slug].astro`)** | Exakt | Gering | Keiner | **EMPFOHLEN (APPROVE)** |
| **Candidate R2: Shared Article Renderer (`LearningArticlePage.astro`)** | Exakt | Sehr gering | Hoch (Refactor) | Nicht erforderlich |
| **Candidate R3: Shared Helper Functions + Minimal Route** | Exakt | Gering | Moderat | Nicht erforderlich |

### Entkopplungs-Entscheidung:
Ein komplexes Refactoring des öffentlichen Templates (`[slug].astro`) in eine gemeinsame `LearningArticlePage.astro`-Komponente ist **nicht erforderlich**. 

**Begründung:** `[slug].astro` umfasst lediglich ca. 130 Zeilen deklaratives Astro-Markup. `Candidate R1` bindet alle visuellen Komponenten (`Layout.astro`, `Breadcrumbs.astro`, `LearningLevelBadge.astro`, CSS-Klasse `learning-prose`, Signaturen und Footers) direkt wieder ein. Die Trennung in eine isolierte Dev-Datei `src/pages/lernen/preview/[slug].astro` garantiert 100 % Produktions-Sicherheit ohne Regressionsrisiko für bestehende öffentliche Seiten.

---

## 5. Empfohlenes Design: Candidate R1 (`src/pages/lernen/preview/[slug].astro`)

### 5.1 Dev-Only Routen-Guard (Fail-Closed)

```ts
// src/pages/lernen/preview/[slug].astro
import { getCollection, getEntry } from 'astro:content';
import Layout from '../../../layouts/Layout.astro';
import Breadcrumbs from '../../../components/Breadcrumbs.astro';
import LearningLevelBadge from '../../../components/LearningLevelBadge.astro';

export async function getStaticPaths() {
  // Fail-Closed: Im Produktions-Build werden NULL Routen generiert
  if (!import.meta.env.DEV) {
    return [];
  }

  const allArticles = await getCollection('learning');
  const draftArticles = allArticles.filter(
    (art) => art.data.publicationState !== 'published'
  );

  return draftArticles.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}
```

### 5.2 Visuelle Kennzeichnung der Entwurfs-Vorschau

Um Verwechslungen von Screenshots oder Review-Notizen mit Veröffentlichungen auszuschließen, rendert die Vorschau-Route im Header einen deutlichen Warnhinweis:

```html
<div class="learning-draft-preview-banner" style="background-color: #fef3c7; color: #92400e; padding: 0.75rem 1rem; border-radius: 0.375rem; margin-bottom: 1.5rem; font-weight: 600;">
  <span>⚠️ LOKALE ENTWURFS-VORSCHAU — NICHT VERÖFFENTLICHT</span>
</div>
```

---

## 6. Bedrohungs- & Risiko-Analyse

| Risiko | Schweregrad | Schutzmaßnahme |
| :--- | :--- | :--- |
| **Versehentliche Indizierung durch Crawlers** | Hoch | Route existiert im Produktions-Build nicht (`getStaticPaths` gibt `[]` zurück). |
| **Sitemap-Leck** | Hoch | Sitemap-Generator greift nur auf `published` Artikel zu. |
| **Fingiertes Publikationsdatum** | Mittel | Vorschau rendert `LOKALE ENTWURFS-VORSCHAU` statt `Veröffentlicht am <Datum>`. |
| **Parallel-Template Drift** | Niedrig | Verwendet identische CSS-Klassen (`learning-prose`) und Komponenten. |

---

## 7. Zukünftiger Testplan (für Phase C4.3-P2-R1-R3)

1. **Dev-Mode Test:** `npm run dev` erlaubt den Aufruf von `/lernen/preview/erinnerung-vs-beleg-beleg-rueckverfolgbarkeit/`.
2. **Layout-Test:** Überprüfung von Callouts (`learning-evidence-boundary`, `> [!IMPORTANT]`), Typografie und Responsive-Verhalten auf Desktop (1440px), Tablet (768px) und Mobile (390px).
3. **Prod-Build Test:** `npm run build` generiert **0** HTML-Dateien unter `/lernen/preview/`.
4. **Sitemap-Test:** `dist/sitemap.xml` enthält keine Vorschau-Links.
5. **Schema-Test:** Entwurf behält `publicationState: "draft"` ohne `publishedAt`.

---

## 8. Autoritäts- & Entscheidungs-Status

```yaml
DRAFT_PREVIEW_CAPABILITY_DECISION: APPROVE_DESIGN
DECISION_AUTHORITY: GRANTED
IMPLEMENTATION_AUTHORIZATION: NOT_GRANTED
PUBLICATION_AUTHORIZATION: NOT_GRANTED
PROVENANCE_REGISTRY_CHANGE_AUTHORIZATION: NOT_GRANTED
SHARED_RENDER_COMPONENT_REFACTOR_REQUIRED: NO
PARALLEL_TEMPLATE_DRIFT_RISK: MINIMIZED
EXPECTED_IMPLEMENTATION_FILES:
  - src/pages/lernen/preview/[slug].astro
RECOMMENDED_NEXT_PHASE: C4.3-P2-R1-R3 — Governed Draft Preview Capability Implementation
```

*Hinweis: Die Umsetzung dieses Designs erfolgt erst in Phase `C4.3-P2-R1-R3` nach expliziter Freigabe durch den Project Owner.*
