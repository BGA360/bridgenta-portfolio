# AEOcortex BECC Pilot 2 — Phase 4 Deployment & Live Verification Plan

This plan outlines the controlled merge, production deployment, and live-page verification procedures for the AEOcortex public project page.

---

## 1. Controlled Merge Strategy
* **Branch Source:** `feature/prr-constitutional-audit`
* **Branch Target:** `main`
* **Pull Request:** [#185](https://github.com/BGA360/bridgenta-portfolio/pull/185)
* **Preconditions for Merge:**
  1. Automated test runs (lints, link checks) must pass.
  2. The Pull Request must receive human approval.
  3. The user must explicitly authorize merging.
* **Merge Method:** squash-and-merge or merge-commit.

---

## 2. Production Deployment
* **Hosting Platform:** GitHub Pages
* **Deployment Trigger:** Automatically triggered by push/merge event to the `main` branch.
* **Build Action:** GitHub Actions build pipeline executing `npm run build` and publishing artifacts to the pages deployment branch.
* **Target Live URL:** `https://bridgenta.de/project-aeocortex/`

---

## 3. Live-Page Verification Checklist
Once deployed, the following live checks must be executed:
* **HTTP Status Check:** Confirm the page returns `200 OK` at `https://bridgenta.de/project-aeocortex/`.
* **Metadata & Headings Audit:** Verify H2 headings are successfully served in German (e.g. `Kurzfassung`, `Ausgangssituation`).
* **Evidence Scoping Audit:** Verify the bounded `Entity-Score: 95% (Pilotlauf)` and the Flesch index footnote render correctly.
* **No Unresolved Warnings:** Inspect the live browser console for any Javascript or asset load errors.
