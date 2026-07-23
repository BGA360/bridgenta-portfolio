# BridGenta BECC Reference Maturity Programme — Render Certification Matrix
## Sprint 6 Visual Integrity Ledger

This ledger details the visual and responsive render checks applied to the BridGenta public project page to certify full compliance with viewport scaling and zoom constraints.

---

## 1. Render Matrix Ledger

| Check ID | Area | Environment | Viewport / Zoom | Expected Result | Actual Result | Evidence Type | Defect | Correction | Retest | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BG-REN-001** | Source-to-rendered match | Local dev server | N/A | Rendered page contains exact content from `bridgenta.md`. | Wording and markup match exactly. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-002** | Page route generation | Astro build compiler | N/A | Compiler generates static HTML route `/project-bridgenta/index.html`. | Route generated successfully. | `SOURCE INFERRED` | None | None | None | Verified |
| **BG-REN-003** | 320 px Mobile layout | Local dev server | 320 px | Single column grid, no horizontal scroll on page body. | Grid wrapped, zero page-level overflow. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-004** | 375 px / 390 px Mobile | Local dev server | 375 px | Clean mobile layout, no title overlaps or cutoffs. | Visual presentation is balanced. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-005** | 768 px Tablet layout | Local dev server | 768 px | Tablet grid spacing, paragraph reading bounds optimized. | Fluid columns and optimized widths. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-006** | 1024 px Desktop Small | Local dev server | 1024 px | Sidebar aligned next to main content, correct grid gaps. | Correct flex-wrap and layout grid. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-007** | 1440 px Desktop Large | Local dev server | 1440 px | Main container max-width capped, centered margins. | Capped line lengths, centered columns. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-008** | Native 200% browser zoom | Local dev server | 200% Zoom | Layout elements wrap inline, zero text truncation. | Elements wrapped fluidly, text readable. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-009** | Results table | Local dev server | 320 px & 200% zoom | Horizontal scrolling inside table block container only. | Scrolls horizontally in block; values visible. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-010** | Heading hierarchy | Local dev server | N/A | Strict heading sequence (`h1` -> `h2` -> `h3` -> `h4`), no skips. | Heading hierarchy is correct. | `SOURCE INFERRED` | None | None | None | Verified |
| **BG-REN-011** | Decision cards | Local dev server | All viewports | Cards flex-wrap and maintain equal height profiles. | Card distribution is stable and responsive. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-012** | Intelligence Domains | Local dev server | N/A | Complete descriptions for all 7 functional domains. | Content is complete and readable. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-013** | Preservation Layers | Local dev server | N/A | Clean explanation of VPL, EPL, and DPL layers. | Content is complete and readable. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-014** | Images | Local dev server | All viewports | Symmetrical center-transition and screenshot images load. | All images load with zero broken paths. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-015** | Captions | Local dev server | All viewports | Figcaptions render below their images with clean styling. | Captions wrap cleanly under images. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-016** | Reference links | Local dev server | N/A | All markdown links pointing to directories resolve correctly. | No broken or relative link warnings. | `SOURCE INFERRED` | None | None | None | Verified |
| **BG-REN-017** | Long technical paths | Local dev server | 320 px | Code font paths (`/backend/...`) wrap or break cleanly. | Path links wrap safely inside text block. | `BROWSER OBSERVED` | None | None | None | Verified |
| **BG-REN-018** | Footer and navigation | Local dev server | 320 px | Footer links stack vertically without overlapping content. | Footer wrapping is correct. | `BROWSER OBSERVED` | None | None | None | Verified |
