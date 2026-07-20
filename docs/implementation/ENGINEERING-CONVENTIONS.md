# Engineering Conventions — Project Conventions & Workflows

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Conventions |
| **Project Status** | Platform Engineering (**CONCLUDED**) |
| **Lifecycle Stage** | Stage B — Platform Engineering (**CONCLUDED**) |
| **Sprint Reference** | Sprint B4 |
| **Next Authorized Stage** | Stage C — Platform Implementation / Sprint C1 — Assessment Core Foundation |
| **Conventions Scope** | Repository Layout, Branching, Versioning, Commits & ADR Workflows |

---

## 1. Overview & Convention Discipline

This document establishes the project-wide **Engineering Conventions** for the **Constitutional Engineering Platform (CEP)** repository. Adhering to standardized conventions ensures predictable collaboration, clean git history, and seamless automated CI/CD pipeline enforcement.

---

## 2. Repository Organization & Layout

The CEP repository is organized into distinct top-level directories:

```
/
├── docs/                               # Single Source of Truth (SSOT) Documentation
│   ├── project/                        # Project Constitution (Sprint A1)
│   ├── architecture/                   # Constitutional Architecture (Sprint A2)
│   ├── decisions/                      # Decision Architecture & CDRs (Sprint A3)
│   ├── domain/                         # Domain Model & Vocabulary (Sprint B1)
│   ├── contracts/                      # Platform Contracts & Models (Sprint B2)
│   ├── runtime/                        # Runtime Architecture & Components (Sprint B3)
│   └── implementation/                 # Implementation Strategy & Specs (Sprint B4)
├── packages/                           # Modular Implementation Packages (Stage C)
│   ├── assessment-core/                # @cep/assessment-core
│   ├── evidence-manager/               # @cep/evidence-manager
│   ├── rule-engine/                    # @cep/rule-engine
│   └── ...                             # Remaining 11 modules
├── src/                                # Portfolio Web Application (Astro Site)
├── public/                             # Public static assets & artifacts
└── .github/                            # CI/CD Workflows & GitHub Actions
```

---

## 3. Branching Strategy & Workflow Rules

CEP strictly enforces the **Feature Branch Workflow** documented in `AGENTS.md`:

1. **Main Branch Protection**: Direct pushes to `main` are forbidden.
2. **Branch Naming Standard**:
   - `feature/sprint-[id]-[short-name]` (e.g., `feature/sprint-c1-assessment-core`)
   - `fix/[short-description]` (e.g., `fix/hash-verification-edge-case`)
   - `docs/[short-description]` (e.g., `docs/update-traceability-matrix`)
3. **Pull Request Protocol**:
   - Synchronize from latest `main` prior to branching.
   - Run `npm run build` locally to verify zero errors.
   - Open PR using GitHub CLI (`gh pr create`).
   - Monitor GitHub Actions CI (`build` and `PRAG Validation Gate`).
   - Await code review approval before merging.

---

## 4. Semantic Versioning (SemVer)

CEP packages and specifications follow **Semantic Versioning 2.0.0 (`MAJOR.MINOR.PATCH`)**:

- **MAJOR (`X.0.0`)**: Breaking changes to Platform Contracts (`CTR-XXX`) or Class III Meta-Constitutional Amendments.
- **MINOR (`0.Y.0`)**: Backward-compatible addition of new rules, domain frameworks, or platform capabilities.
- **PATCH (`0.0.Z`)**: Backward-compatible bug fixes, documentation clarifications, or performance optimizations.

---

## 5. Conventional Commit Message Standard

Commits must follow the **Conventional Commits 1.0.0** specification:

- `feat(scope): add feature description` (e.g., `feat(assessment): implement AssessmentOrchestrator core`)
- `fix(scope): fix bug description` (e.g., `fix(evidence): resolve SHA-256 digest validation bug`)
- `docs(scope): update documentation` (e.g., `docs(contracts): clarify CTR-001 preconditions`)
- `test(scope): add test cases` (e.g., `test(rule-engine): add BGCF directory layout unit test`)
- `chore(scope): repository maintenance` (e.g., `chore(deps): bump Astro dependency version`)

---

## 6. Architectural Decision Records (ADR / CDR Workflow)

1. **Constitutional Decisions**: High-level platform governance decisions are captured as **CDRs** in `docs/decisions/records/` following the CDR Standard (`docs/decisions/DECISION-RECORD-STANDARD.md`).
2. **Technical Implementation Decisions**: Low-level technical implementation choices are captured as **TDRs** in `docs/implementation/TECHNOLOGY-DECISION-RECORD.md`.
3. **Immutability**: Approved decision records are assigned content hashes and logged to the platform audit ledger.
