# BridGenta Project — Accessibility Evidence Report
## BECC Reference Programme — Post-AEOcortex Remediation

This report documents the local accessibility checks performed on the BridGenta project page (`bridgenta.de/project-bridgenta/`). This audit does **not** claim formal WCAG conformance or independent accessibility certification.

---

## 1. Automated / Source-Level Evidence

*   **Heading Structure:** Verified that the heading hierarchy starts with a single `h1` and descends logically (`h2` -> `h3` -> `h4`). Zero skipped levels found.
*   **Semantic Landmarks:** Checked source HTML for correct semantic wrappers (`<header>`, `<main>`, `<nav>`, `<footer>`). Main content is wrapped in `<main id="main-content">`.
*   **Image Alt Text:** All active images (`BG-PA02`, `BG-PA03`, `BG-PA04`) possess descriptive and literal `alt` attributes. Decorative layouts (like `BG-PA01`) use blank `alt=""` or are injected via CSS background.
*   **Static Contrast Tooling:** Run local HTML validation and basic static analyzer checks. Zero critical structural elements missing accessibility attributes.
*   **Build & Lint Results:** Running `npm run lint` and `npm run build` yields zero accessibility-relevant parsing errors.

---

## 2. Manual Browser Evidence

*   **Keyboard Navigation:** Audited the tab order of all interactive elements. Focus outlines are visible, and navigation flows sequentially from top to bottom.
*   **Visible Focus:** Active links and cards feature explicit `:focus-visible` styling (with a high-contrast ring outline).
*   **200% Zoom & Scaling:** Scaled the page to 200% using standard browser controls. Containers and text reflow inline. No text overlapping, clip-offs, or container overflows detected.
*   **Overflow & Reflow:** Checked wide data tables. Column wrappers support horizontal scrollbars to prevent clipping on mobile viewports.
*   **Responsive Behavior:** Tested layouts at viewports ranging from 320px (mobile) to 1440px (desktop). Column grids collapse to single columns fluidly.
*   **Reduced Motion:** Layout contains no auto-playing or flashing motion. Custom transition durations respect the user's `prefers-reduced-motion` settings.
*   **Console and Network Behavior:** Verification in DevTools console shows zero network blockages, blocked accessibility assets, or console errors on load.

---

## 3. Platform-Specific Assistive-Technology Evidence

*   **NVDA Screen Reader:** **NOT EXECUTED / OPEN** (Markup-only inspection performed; dynamic voice announcement checks are not completed).
*   **VoiceOver Screen Reader:** **NOT EXECUTED / OPEN** (Markup-only inspection performed; dynamic voice announcement checks are not completed).
*   *Note: Platform-specific screen readers are not marked as PASS through static markup inspection alone.*

---

## 4. Independent Assurance Still Open

*   **External Accessibility Audit:** **OPEN** (Requires third-party validation).
*   **Cross-Browser Lab Testing:** **OPEN / NOT EXECUTED**
*   **Real-User Accessibility Group Testing:** **OPEN / NOT EXECUTED**

---
*Report compiled on 2026-07-31.*
