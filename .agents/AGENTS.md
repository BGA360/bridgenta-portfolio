# BridGenta Project Workflow Rules

All code changes and development tasks must adhere to a professional GitHub branching and review workflow:

## 1. Environment Capability Check (Mandatory)
Before starting any development task, verify that the environment is fully operational:
- Git is installed and working.
- GitHub CLI (`gh`) is installed and authenticated (`gh auth status`).
- Node.js and npm are installed.
- Astro dependencies are available.
- The repository is a valid Git repository and the working tree is clean.
- If anything is missing, **stop immediately**, report the issue, and wait for confirmation.

## 2. Branching Strategy
- **Never push directly to `main`**. All direct pushes to the main branch are forbidden.
- Always synchronize from the latest `main` before branching.
- Create a descriptive feature/fix/docs branch (e.g., `feature/seo-improvements`, `fix/github-pages`).

## 3. Development & Validation
- Make all changes inside the feature branch.
- Before committing, run standard validation checks:
  - `npm install` (if required)
  - `npm run build`
  - `npm run lint` / `npm run test` (if available)
- Resolve all build/compilation errors before committing.

## 4. Commits & Pull Requests
- Use clear, professional commit messages (e.g., `feat: add dynamic sitemap generation`).
- Push only the feature branch to GitHub.
- Automatically create a Pull Request (PR) from the feature branch to `main` using GitHub CLI (`gh pr create`).
- The PR must include:
  - A meaningful title
  - A complete description (summary, rationale, testing performed, known limitations, screenshots).

## 5. CI/CD & Review Cycle
- Monitor the GitHub Actions run. If CI fails, investigate, push fixes, and repeat until green. Do not bypass checks.
- After CI passes, **STOP** and wait for explicit code review and approval.
- If changes are requested, implement and push them to the same feature branch, then wait again.

## 6. Merge
- Only merge the Pull Request after:
  1. The Pull Request is approved.
  2. GitHub Actions/CI runs pass successfully.
  3. The user explicitly instructs to merge.
- Never merge automatically.
