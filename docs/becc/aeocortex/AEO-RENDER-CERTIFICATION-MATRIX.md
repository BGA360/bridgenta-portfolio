# AEOcortex BECC Pilot 2 — Render Certification Matrix

This matrix documents the multi-viewport and browser zoom verification audits performed on the AEOcortex public project page.

---

## 1. Viewport and Scaling Audit Ledger

| Audit ID | Target Viewport | Scaling | Expected Layout Behavior | Observed Result / Wrap Status | Verdict |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **AEO-RND-001** | **320 px** (Mobile Small) | 100% | Single-column stack. Main grids wrap vertically. Zero horizontal page scrolling. | Text wraps cleanly inline. Layout containers collapse to full viewport width. | **PASS** |
| **AEO-RND-002** | **375 px** (Mobile Standard) | 100% | Responsive text wrapping. Table elements scroll horizontally. | Layout remains proportional. Footnotes and card text scale smoothly. | **PASS** |
| **AEO-RND-003** | **768 px** (Tablet Portrait) | 100% | Grids wrap to 2 columns maximum. Sidebar elements stack below header content. | Side navigation collapses to top navigation menu bar. Grids align. | **PASS** |
| **AEO-RND-004** | **1024 px** (Tablet Landscape) | 100% | Full multi-column grid layout. Side columns displayed. | Sidebar remains fixed on the left side. Images wrap inline. | **PASS** |
| **AEO-RND-005** | **1440 px** (Desktop Large) | 100% | Standard grid scaling with max-width container bounds. | Centered content layout with clean margin gutters. | **PASS** |
| **AEO-RND-006** | **Any Viewport** | 200% Zoom | Relative font sizes prevent text overlaps or button boundaries cutoffs. | Browser layout wraps layout components inline dynamically. | **PASS** |

---

## 2. Visual Layout Acceptance Indicators

* **Horizontal Scrolling:** Standard viewport page scroll is prohibited. Table wrappers use `overflow-x: auto` to restrict scrolling inside the table block.
* **Text Wrapping:** Word-break rules prevent long URLs or proper nouns from pushing past container margins.
* **Caption Visibility:** Image and code figcaptions remain visible and legible below artifacts.
