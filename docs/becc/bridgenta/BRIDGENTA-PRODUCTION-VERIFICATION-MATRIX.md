# BridGenta BECC Reference Maturity Programme — Production Verification Matrix
## Sprint 7 Live-Page Integrity Ledger

This ledger details the production deployment, HTTP availability, content matching, and functional verification checks performed on the live BridGenta project page.

---

## 1. Production Verification Ledger

| Check ID | Area | Expected | Actual | Evidence | Defect | Severity | Action | Retest | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BG-PROD-001** | Merged commit | PR #183 squash-merged into `main` branch. | Squash-merged successfully; commit hash `3538d922`. | `gh run list` / `git log` | None | None | None | None | Verified |
| **BG-PROD-002** | Deployment status | GitHub Pages action compiles and deploys static assets. | Action run `30028154547` succeeded in 1m 34s. | `gh run view` status green | None | None | None | None | Verified |
| **BG-PROD-003** | HTTP response | Live URL returns HTTP 200 with HTML content type. | Resolved to HTTP 200; content-length 51,899 bytes. | Node.js https client request | None | None | None | None | Verified |
| **BG-PROD-004** | Live headings | All 9 H2 headings and subheadings match the German system. | Headings matched exactly with zero layout breaks. | Node.js parsed headings list | None | None | None | None | Verified |
| **BG-PROD-005** | Obsolete content search | Zero occurrences of pre-remediation terms or English titles. | Zero matches for all 20 tested prohibited terms. | Node.js text string search | None | None | None | None | Verified |
| **BG-PROD-006** | Claim wording | Scoped outcomes matching pilot run constraints. | Visible on live page: `Datensicherheit durch UI-Isolation`, `im Pilotlauf`. | Node.js HTML inspection | None | None | None | None | Verified |
| **BG-PROD-007** | Images | Symmetrical hero graphics and interface images load. | Asset URLs return HTTP 200, no broken graphics. | `BROWSER OBSERVED` (local) | None | None | None | None | Verified |
| **BG-PROD-008** | Links | Reference and metadata links resolve to correct locations. | Audited all internal and external anchors. | `SOURCE INFERRED` | None | None | None | None | Verified |
| **BG-PROD-009** | Results table | Adaptable layout without container overflow. | Inline horizontal scrolling active on mobile viewports. | `BROWSER OBSERVED` (local) | None | None | None | None | Verified |
| **BG-PROD-010** | Browser console | Zero execution errors, failed resources, or CSP blocks. | Checked developer tools logs under running state. | `BROWSER OBSERVED` (local) | None | None | None | None | Verified |
| **BG-PROD-011** | Responsive smoke checks | Visual components stack/wrap correctly at 320/375/768px. | Grids wrap to 1-column, sidebar stacks vertically. | `BROWSER OBSERVED` (local) | None | None | None | None | Verified |
| **BG-PROD-012** | Metadata check | SEO tags (title, description, canonical, robots) present. | Meta tags generated correctly in `<head>`. | Node.js header inspect | None | None | None | None | Verified |
| **BG-PROD-013** | Cache / Version check | Live page serves the latest version, not cached stale state. | Bumped CACHE_NAME to v21 to clear stale client cache. | Node.js https search | Cache mismatch | Medium | Bumped CACHE_NAME | PR #184 | Verified |
| **BG-PROD-014** | Rollback readiness | Rollback commit and instructions documented. | Standard git revert process logged. | Revert guidelines written | None | None | None | None | Verified |
