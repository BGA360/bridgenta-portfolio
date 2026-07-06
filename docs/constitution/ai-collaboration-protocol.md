# AI Collaboration Protocol v1.0

## Status

Approved

Version: 1.0

Owner: Frank Duru

Project: BridGenta

---

## Purpose

This protocol defines the security rules, branching workflows, quality gates, and communication requirements for all AI agents and coding assistants collaborating on the BridGenta codebase. It ensures that AI-assisted contributions remain safe, transparent, auditable, and aligned with our engineering guidelines.

---

## Security & Secrets Policy (Mandatory)

To prevent security vulnerabilities and accidental data leakage:
- **No Secrets in Code**: AI agents must never introduce API keys, tokens, passwords, database credentials, private URLs, or personal secrets in code files, comments, tests, or documentation.
- **Environment Variables**: All configurations, endpoints, or keys must be loaded dynamically via environment variables (`.env`).
- **Input Validation**: Treat all client inputs, form submissions, and external payloads as untrusted and validate them.

---

## Git & Branching Workflow

AI agents must follow a professional branching and merge cycle:
1. **Synchronize**: Sync from `origin/main` before starting any work.
2. **Branch**: Create a descriptive feature/fix/docs branch (e.g. `feature/seo-tweaks`, `fix/service-worker`).
3. **Isolate**: Perform all edits only on the feature branch. Never push directly to `main`.
4. **Pull Requests**: Open a Pull Request from the feature branch to `main` using GitHub CLI (`gh pr create`). Include a descriptive title and body outlining the changes.

---

## Quality Gating & Validation

Before requesting human review or merge:
- **Build Checks**: The AI agent must run the local production build (`npm run build`) to ensure there are no compilation errors, Astro type mismatches, or layout failures.
- **Linting & Formatting**: Ensure code conforms to codebase configurations.
- **CI/CD Integration**: Push changes to trigger GitHub Actions runs, and monitor the build run status to verify all tests pass on the remote container.

---

## Compliance & Documentation

AI agents must document their work in full alignment with BridGenta's Single Source of Truth rules:
- **Task Tracking**: Maintain and update `task.md` checklists as work progresses.
- **Walkthroughs**: Maintain or update `walkthrough.md` to outline precisely what was built, how it was tested, and the outcome.
- **No Automatic Merging**: AI agents must never merge Pull Requests. They must wait for explicit review and manual approval by the human owner.

---

## AI Collaboration Checklist

Before submitting a Pull Request, the AI agent must verify:
- [ ] Are all secrets, tokens, and keys excluded from the changes?
- [ ] Are all modifications isolated on a feature branch?
- [ ] Does the production build (`npm run build`) compile successfully?
- [ ] Has a descriptive Pull Request been opened?
- [ ] Have all CI/CD pipeline checks passed successfully?
- [ ] Are `task.md` and `walkthrough.md` updated?
