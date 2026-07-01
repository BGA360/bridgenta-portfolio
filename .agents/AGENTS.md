# BridGenta Project Workflow Rules

All code changes and development tasks must adhere to a professional GitHub branching and review workflow:

## 1. Branching Strategy
- **Never push directly to `main`**. All direct pushes to the main branch are forbidden.
- Always create a new descriptive feature/fix/docs branch from the latest `main` before starting any coding task (e.g., `feature/github-pages-workflow`, `fix/favicon-dimensions`).

## 2. Pull Requests
- All changes must be pushed inside the feature branch.
- Once changes are complete, attempt to create the GitHub Pull Request automatically (e.g., using `gh pr create` CLI) if permissions and auth allow it.
- If automatic PR creation is not possible due to lack of CLI or credentials, clearly state it and provide the direct GitHub URL so the user can create/review it.
- Each PR must include:
  - A clear title
  - A summary of changes
  - Context/rationale for the changes
  - Verification steps/testing performed
  - Any known limitations
- After PR creation/notification, monitor the GitHub Actions workflow run. If checks fail, investigate logs, commit fixes to the same feature branch, and push updates. Do not merge.

## 3. Review and Approval Cycle
- **Wait for explicit approval**. Do not merge the Pull Request automatically.
- Wait for user feedback and review approvals.
- If changes are requested during review, make the edits and push them directly to the active feature branch.
- Only merge the Pull Request after:
  1. GitHub Actions/CI runs pass successfully.
  2. The Pull Request is approved.
  3. The user explicitly instructs to merge.
