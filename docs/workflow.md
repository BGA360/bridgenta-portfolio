# BridGenta Repository Workflow & Governance Guide

Welcome! This document outlines the professional software engineering standards, Git workflows, and CI/CD practices implemented in this repository.

---

## 1. Branching Strategy
This project follows a strict **feature branch workflow**. Directly committing or pushing to the `main` branch is forbidden by branch protection rules.

### Branch Naming Conventions
* **`feature/<name>`**: For new features or additions (e.g., `feature/tinacms-integration`).
* **`fix/<name>`**: For bug fixes or hotfixes (e.g., `fix/github-pages-artifact`).
* **`docs/<name>`**: For documentation updates (e.g., `docs/update-workflow`).
* **`chore/<name>`**: For dependency updates or configuration changes (e.g., `chore/sync-agents`).

### Branch Setup Workflow
1. **Sync main**: Always start by checking out `main` and pulling the latest changes:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create Branch**: Create and switch to your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 2. Development & Validation
All coding work happens exclusively in your feature branch. Before committing your changes, you must validate them locally:
1. **Install dependencies**: `npm install` (if packages changed).
2. **Build test**: Run `npm run build` to verify the Astro compiler compiles all pages and sitemaps correctly.
3. **Resolve errors**: Do not commit code that fails the build step.

---

## 3. Pull Request Process
Once development is complete and validated, push your branch and open a Pull Request (PR):
1. **Push Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create Pull Request**: Use the GitHub CLI to automatically format and open your PR:
   ```bash
   gh pr create --title "feat: descriptive title" --body-file "path/to/pr-body.md"
   ```
3. **PR Requirements**: Every PR must describe:
   * **Summary**: High-level review of the changes.
   * **Rationale**: Why these changes were made.
   * **Testing Performed**: Local validation results.
   * **Limitations**: Any unresolved issues or notes.

---

## 4. CI/CD Pipeline
Our GitHub Actions pipeline [.github/workflows/deploy.yml](file:///c:/antigravity/statichtmlpro/fdrefs/.github/workflows/deploy.yml) is structured as follows:
* **`build` Job**: Automatically runs on every pull request targeting `main`. It compiles the site to verify that there are no compilation errors.
* **`deploy` Job**: Only runs on direct `push` events to the `main` branch (which occurs when a Pull Request is successfully merged). It publishes the compiled bundle to the production server.
* **Status Enforcement**: The `build` check is required by branch protection. If the build step fails, the merge button is locked.

---

## 5. Code Review & Merge Policy
1. **Wait for CI**: Wait for the green checkmark from GitHub Actions.
2. **Review requirement**: All PRs require at least **1 approving review** from a designated owner before they can be merged.
3. **Conversation Resolution**: All review threads and comments must be marked as "Resolved" before merging.
4. **Explicit Instruction**: Even if approved and CI passes, **never merge automatically**. Merges should only be triggered after the owner explicitly instructs to merge.

---

## 6. Publication Governance & Content Security
All public contributions, content revisions, screenshots, diagrams, and assets must comply with the [BridGenta Publication Governance](file:///c:/antigravity/statichtmlpro/fdrefs/docs/publication-governance.md).

Prior to merging any PR containing content changes, the reviewer must check that:
* It conforms to the **PEPA (Public Evidence, Protected Assets)** principle.
* It follows the **Three Artifact Rule** for project case studies.
* All portraits follow the **FDPP-###** standard.
* The PR passes the **Social Media** and **Evidence** tests as outlined in the governance checklist.
