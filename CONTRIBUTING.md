# Contributing to BridGenta

Thank you for contributing to BridGenta! To maintain repository stability, code quality, and constitutional governance, all contributions must adhere to the rules outlined below.

---

## 1. Branching Strategy
Direct pushes or commits to the `main` branch are strictly forbidden. All development and documentation work must happen in dedicated branches following our naming conventions:
- **`feature/<name>`**: New feature implementations.
- **`fix/<name>`**: Bug fixes and hotfixes.
- **`docs/<name>`**: Documentation changes (including verfassungsrechtliche updates).
- **`chore/<name>`**: Dependency updates and configuration tweaks.

Before starting any branch, ensure you pull the latest changes from `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

---

## 2. Local Validation
Before committing and pushing your changes, you must validate them locally:
- Run `npm install` if dependencies were modified.
- Run `npm run build` to verify there are no compilation, static site generation, or sitemap errors.
- Run `npm run lint` and `npm run check-links` (once integrated) to ensure document syntax and link integrity.
- Do not commit changes that fail local validation steps.

---

## 3. Commit Guidelines
Use clear, professional, and descriptive commit messages (e.g. `docs: update branching strategy guidelines`).
If your changes are related to a governance remediation plan or decision record, include the IDs in the commit message (e.g. `remedy: resolve EDR-RC2-001 relative links in RC1`).

---

## 4. Pull Requests
Open a Pull Request (PR) from your feature branch to `main` using the GitHub CLI:
```bash
gh pr create --title "feat: descriptive title" --body "Describe changes here"
```

Every Pull Request must include:
- **Summary**: High-level explanation of modifications.
- **Rationale**: The engineering basis and justification for the change.
- **Testing Performed**: Local validation commands and their results.
- **Scope Alignment**: Confirmation that no scope creep or unrelated changes are introduced.

---

## 5. Review & Merge Policy
- **CI Enforcement**: PRs cannot be merged until all GitHub Actions checks (build, validation gates) pass.
- **Reviewer Approval**: Every PR requires at least **1 approving review** from a designated code/document owner.
- **No Automatic Merges**: Do not merge the PR immediately after approval. Merges must only be executed after the owner explicitly instructs to merge.
