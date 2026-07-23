# BECC Public-Page Governance — Portfolio Register

This register serves as the authoritative ledger tracking BECC reference maturity states, assessment lifecycles, and governance roles across all public portfolio projects.

---

## 1. Portfolio Maturity Ledger

| Project Name | Source File Path | Pilot Phase | Target Path | Kickoff Date | Closure Date | Certification Verdict | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| **BridGenta** | `src/content/projects/bridgenta.md` | Pilot 1 | Tier 1 (9 Sprints) | 2026-07-20 | 2026-07-23 | `CERTIFIED WITH OBSERVATIONS` | **Closed** |
| **AEOcortex** | `src/content/projects/aeocortex.md` | Pilot 2 | Tier 1 (9 Sprints) | 2026-07-23 | Pending | Pending | **Kickoff** |
| **Lumina Praxis** | `src/content/projects/luminapraxisds.md` | Pilot 3 | Tier 2 (4 Phases) | Pending | Pending | Pending | **Candidate** |
| **Rooted Reality** | `src/content/projects/rootedrealitygarden.md` | Pilot 4 | Tier 2 (4 Phases) | Pending | Pending | Pending | **Candidate** |
| **StarCleaners** | `src/content/projects/starcleaners.md` | Pilot 5 | Tier 2 (4 Phases) | Pending | Pending | Pending | **Candidate** |

---

## 2. Governance Roles and Responsibilities

* **Lead Architect:**
  - Establishes and preserves technical-integrity baselines.
  - Approves the engineering and architecture preservation boundaries.
* **Lead Editor:**
  - Reviews and enforces German B2–C1 translation grammar and style rules.
  - Verifies compound noun capitalization and canonical English term registers.
* **Independent Auditor:**
  - Reviews the live production pages on custom domains.
  - Assesses criteria without pre-packaged conclusions and issues the final certification verdict.
* **Project Owner / Developer:**
  - Authors project drafts and maintains functional code maturity.
  - Provides the initial evidence log draft and applies approved remediations.

---

## 3. Assessment-Path Gates

To progress from kickoff to closure, every project must pass five gates:

```text
[Kickoff Gate] -> [Editorial Gate] -> [Verification Gate] -> [Deployment Gate] -> [Audit Gate]
```

1. **Kickoff Gate:** Verifies eligibility, logs baseline, and registers all metrics to be mapped.
2. **Editorial Gate:** Validates readability register, sentence splitting, and terminology.
3. **Verification Gate:** Audits specs against code base, runs lints, and checks responsive render.
4. **Deployment Gate:** Squash-merges to `main`, deploys to target server, and invalidates Service Worker caches.
5. **Audit Gate:** Independent third-party audit of live production site, followed by manifest sealing.
