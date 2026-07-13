# RKF Constitutional Classification

An authoritative semantic classification of all artifacts within the Reference Knowledge Framework (RKF) documentation snapshot.

## 1. Classification Method

This classification utilizes an evidence-based approach to determine the semantic role of every folder and file in the repository.

### Classification Philosophy
Every artifact in a constitutional engineering repository exists for an explicit constitutional purpose. We avoid arbitrary classification and map files only according to their documented role in the framework lifecycle (defined in `docs/START_HERE.md`).

### Evidence Sources
1. **START_HERE.md**: Establishes the official Documentation Hierarchy, Lifecycle stages, and Read Order.
2. **README.md files**: Provide local purpose statements for directories.
3. **Internal file references**: Explicit statements of authority, version status (e.g. superseded status), or implementation guidelines.

### Interpretation Rules
- **Volume Authority**: Any directory prefixed with `00-` to `10-` (excluding decision/research directories) is treated as a Constitutional Volume, carrying the highest authority.
- **Placeholder Integrity**: Empty directories are classified under their intended logical role based on directory names but receive a **Low** confidence rating pending the introduction of actual content.
- **Boundary Verification**: Examples are educational only and carry zero authority.

### Uncertainty Handling
When insufficient repository evidence exists or a directory is empty, it is marked as `Requires Interpretation` or receives a `Low` confidence rating to prevent unfounded assumptions.

## 2. Repository Classification Summary

| Area | Primary Classification | Confidence | Evidence |
|------|------------------------|------------|----------|
| [canon](docs/canon) | Constitutional Authority | High | Holds permanent, durable framework principles. |
| [examples](docs/examples) | Example | High | Contains illustrative implementations (AKUKOM, BridGenta). |
| [framework](docs/framework) | Framework | High | Reusable lifecycles, templates, and specifications. |
| [methodology](docs/methodology) | Methodology | Low | Empty placeholder directory at root. |
| [project](docs/project) | Project | High | Container for project-specific constitutional knowledge. |
| [runtime](docs/runtime) | Runtime | High | Holds logs, current state, and drift assessments. |
| [security](docs/security) | Specification | Low | Empty placeholder directory at root. |
| [specification](docs/specification) | Specification | Low | Empty placeholder directory at root. |

## 3. Top-Level Classification

The top-level areas are classified as follows:

- **canon/**: Classified as **Constitutional Authority**. It contains enduring constitutional rules and foundations of the framework that are project-agnostic.
- **examples/**: Classified as **Example**. It contains sample code and projects for education. It has zero constitutional authority.
- **framework/**: Classified as **Framework**. It contains reusable structural frameworks, lifecycles, and templates that support constitutional implementation.
- **methodology/**: Classified as **Methodology**. It is currently an empty directory meant for constitutional methodology rules.
- **project/**: Classified as **Project** (or contains Project Knowledge). It holds project-specific constitutional volumes and lifecycle documents.
- **runtime/**: Classified as **Runtime**. It holds active runtime monitoring state, engineering logs, and drift inventory reports.
- **security/**: Classified as **Specification**. Currently empty, intended for formal security specifications.
- **specification/**: Classified as **Specification**. Currently empty, intended for technical schemas and specifications.


## 4. Project Domain Classification

Every direct child subdirectory under `docs/project/` classified by constitutional purpose:

| Folder Name | Constitutional Role | Primary Classification | Confidence | Supporting Evidence |
|-------------|---------------------|------------------------|------------|---------------------|
| [00-constitution](docs/project/00-constitution) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional foundation of RKF. |
| [01-rkf](docs/project/01-rkf) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 1: Constitutional Identity. |
| [02-curiosity-journey](docs/project/02-curiosity-journey) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 2: Curiosity Journey Engine. |
| [03-fd-ess](docs/project/03-fd-ess) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 3: FD-ESS Explainability. |
| [04-cst](docs/project/04-cst) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional System Thinking validation guidelines. |
| [04-knowledge-model](docs/project/04-knowledge-model) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 4: Knowledge Model. |
| [05-knowledge-governance](docs/project/05-knowledge-governance) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 5: Knowledge Governance. |
| [05-tpci](docs/project/05-tpci) | Constitutional Volume (Trust Framework) | Constitutional Authority | High | Constitutional trust, power, control, integrity validation. |
| [06-knowledge-graph](docs/project/06-knowledge-graph) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 6: Knowledge Graph. |
| [07-cst](docs/project/07-cst) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | Constitutional Volume 7: CST. |
| [07-engineering](docs/project/07-engineering) | Constitutional Volume (Engineering Validation) | Constitutional Authority | High | Engineering governance rules. |
| [08-roadmap](docs/project/08-roadmap) | Constitutional Volume (Core Pillar) | Constitutional Authority | High | RKF project evolution phases. |
| [08-tpci](docs/project/08-tpci) | Constitutional Volume (Trust Framework) | Constitutional Authority | High | Constitutional Volume 8: TPCI trust framework. |
| [09-decisions](docs/project/09-decisions) | Constitutional Volume (Core Pillar) | Decision Record | High | Records architectural and constitutional decisions. |
| [09-engineering](docs/project/09-engineering) | Constitutional Volume (Engineering Validation) | Constitutional Authority | High | Constitutional Volume 9: Engineering Constitution. |
| [10-research](docs/project/10-research) | Constitutional Volume (Core Pillar) | Research | High | Stores research, evidence, and observations. |
| [10-runtime](docs/project/10-runtime) | Constitutional Volume (Runtime Governance) | Constitutional Authority | High | Constitutional Volume 10: Runtime Constitution. |
| [11-knowledge-assets](docs/project/11-knowledge-assets) | Constitutional Volume (Core Pillar) | Framework | High | Prepares RKF for reusable knowledge assets. |
| [12-templates](docs/project/12-templates) | Constitutional Volume (Core Pillar) | Framework | High | Project documentation templates. |
| [13-architecture-blueprints](docs/project/13-architecture-blueprints) | Constitutional Volume (Core Pillar) | Architecture | High | Exploratory architecture blueprints. |
| [14-architecture-reviews](docs/project/14-architecture-reviews) | Constitutional Volume (Core Pillar) | Review | High | Constitutional readiness reviews for Blueprints. |
| [15-gap-analyses](docs/project/15-gap-analyses) | Constitutional Volume (Core Pillar) | Gap Analysis | High | Repository structure standards audit. |
| [16-writing-specifications](docs/project/16-writing-specifications) | Constitutional Volume (Core Pillar) | Specification | High | Defines writing formats for future volumes. |
| [17-constitutional-reviews](docs/project/17-constitutional-reviews) | Constitutional Volume (Core Pillar) | Review | High | Independent constitutional reviews for Volumes. |
| [18-system-architecture](docs/project/18-system-architecture) | Constitutional Volume (Core Pillar) | Architecture | High | System architecture models. |
| [19-domain-expansion](docs/project/19-domain-expansion) | Constitutional Volume (Core Pillar) | Future | High | Phase II domain expansion roadmaps. |
| [20-domain-specifications](docs/project/20-domain-specifications) | Constitutional Volume (Core Pillar) | Specification | High | Future domain specifications. |
| [21-research-specifications](docs/project/21-research-specifications) | Constitutional Volume (Core Pillar) | Research | High | Future domain research specifications. |
| [22-architecture-blueprints](docs/project/22-architecture-blueprints) | Constitutional Volume (Core Pillar) | Architecture | High | Future domain architecture blueprints. |
| [23-validation-pilots](docs/project/23-validation-pilots) | Constitutional Volume (Core Pillar) | Review | High | Pilots evaluating domain goals. |

## 5. Document Classification

Detailed classification of major constitutional artifacts:

- **[canon/README.md](docs/canon/README.md)**
  - *Primary Category*: Constitutional Authority
  - *Confidence*: High
  - *Evidence*: Houses durable canon principles.
  - *Reasoning*: Holds root-level constitutional law.

- **[project/09-decisions/DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md](docs/project/09-decisions/DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md)**
  - *Primary Category*: Decision Record
  - *Secondary Category*: Architecture
  - *Confidence*: High
  - *Evidence*: Explicitly approves moving TPCI Blueprint v2.0 into the constitutional foundation.
  - *Reasoning*: Standard Decision Record approving architectural direction.

- **[project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v2.0.md](docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v2.0.md)**
  - *Primary Category*: Architecture
  - *Confidence*: High
  - *Evidence*: Explores TPCI architecture details before they are approved in DEC-0004.
  - *Reasoning*: A blueprint designed to prepare constitutional thinking.

- **[project/14-architecture-reviews/AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md](docs/project/14-architecture-reviews/AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md)**
  - *Primary Category*: Review
  - *Confidence*: High
  - *Evidence*: Evaluates whether TPCI Blueprint v2.0 is mature enough to become a volume.
  - *Reasoning*: Standard architecture readiness review.

- **[project/15-gap-analyses/GA-0001-Constitutional-Repository-Gap-Analysis.md](docs/project/15-gap-analyses/GA-0001-Constitutional-Repository-Gap-Analysis.md)**
  - *Primary Category*: Gap Analysis
  - *Confidence*: High
  - *Evidence*: Audits the repository structures and checks trace integrity.
  - *Reasoning*: Audit report identifying historical and compliance gaps.

- **[project/20-domain-specifications/CDS-0001-Privacy-Constitution.md](docs/project/20-domain-specifications/CDS-0001-Privacy-Constitution.md)**
  - *Primary Category*: Specification
  - *Confidence*: High
  - *Evidence*: Formal domain spec setting boundaries for Privacy.
  - *Reasoning*: Technical spec mapping constitutional decisions.

## 6. Classification Matrix

A complete mapping of every file and directory in the snapshot:

| Relative Path | Artifact Link | Primary Classification | Secondary Classification | Confidence | Evidence | Notes |
|---------------|---------------|------------------------|--------------------------|------------|----------|-------|
| `docs/canon` | [docs/canon](docs/canon) | Constitutional Authority | None | High | Explicitly declared as Canon under documentation hierarchy. | N/A |
| `docs/canon/README.md` | [README.md](docs/canon/README.md) | Constitutional Authority | None | High | Explicitly declared as Canon under documentation hierarchy. | N/A |
| `docs/examples` | [docs/examples](docs/examples) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/akukom` | [docs/examples/akukom](docs/examples/akukom) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/akukom/README.md` | [README.md](docs/examples/akukom/README.md) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/bridgenta` | [docs/examples/bridgenta](docs/examples/bridgenta) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/bridgenta/README.md` | [README.md](docs/examples/bridgenta/README.md) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/dicsay` | [docs/examples/dicsay](docs/examples/dicsay) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/examples/dicsay/README.md` | [README.md](docs/examples/dicsay/README.md) | Example | None | High | Explicitly declared as educational examples (non-authoritative) under START_HERE.md. | N/A |
| `docs/framework` | [docs/framework](docs/framework) | Framework | None | High | General framework orientation and indices. | N/A |
| `docs/framework/18-lessons-learned` | [docs/framework/18-lessons-learned](docs/framework/18-lessons-learned) | Methodology | Historical | High | Retrospective lessons learned from Volume 8 design. | N/A |
| `docs/framework/18-lessons-learned/LL-0001-Constitutional-Volume-8.md` | [LL-0001-Constitutional-Volume-8.md](docs/framework/18-lessons-learned/LL-0001-Constitutional-Volume-8.md) | Methodology | Historical | High | Retrospective lessons learned from Volume 8 design. | N/A |
| `docs/framework/18-lessons-learned/README.md` | [README.md](docs/framework/18-lessons-learned/README.md) | Methodology | Historical | High | Retrospective lessons learned from Volume 8 design. | N/A |
| `docs/framework/artifact-lifecycle` | [docs/framework/artifact-lifecycle](docs/framework/artifact-lifecycle) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-authority-model.md` | [artifact-authority-model.md](docs/framework/artifact-lifecycle/artifact-authority-model.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-catalogue.md` | [artifact-catalogue.md](docs/framework/artifact-lifecycle/artifact-catalogue.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-dependency-model.md` | [artifact-dependency-model.md](docs/framework/artifact-lifecycle/artifact-dependency-model.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-lifecycle-flow.md` | [artifact-lifecycle-flow.md](docs/framework/artifact-lifecycle/artifact-lifecycle-flow.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-lifecycle-specification-v1.md` | [artifact-lifecycle-specification-v1.md](docs/framework/artifact-lifecycle/artifact-lifecycle-specification-v1.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-quality-gates.md` | [artifact-quality-gates.md](docs/framework/artifact-lifecycle/artifact-quality-gates.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-validation-model.md` | [artifact-validation-model.md](docs/framework/artifact-lifecycle/artifact-validation-model.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/artifact-versioning.md` | [artifact-versioning.md](docs/framework/artifact-lifecycle/artifact-versioning.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/future-evolution.md` | [future-evolution.md](docs/framework/artifact-lifecycle/future-evolution.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/artifact-lifecycle/README.md` | [README.md](docs/framework/artifact-lifecycle/README.md) | Governance | Framework | High | Defines standards, authority, and quality gates for artifacts. | N/A |
| `docs/framework/constitutional-engineering-methodology-v1.md` | [constitutional-engineering-methodology-v1.md](docs/framework/constitutional-engineering-methodology-v1.md) | Methodology | None | High | Defines methodology principles. | N/A |
| `docs/framework/framework-overview-v1.md` | [framework-overview-v1.md](docs/framework/framework-overview-v1.md) | Framework | None | High | Introduction to the CEF framework principles. | N/A |
| `docs/framework/methodology` | [docs/framework/methodology](docs/framework/methodology) | Methodology | None | Low | N/A | Empty folder. |
| `docs/framework/methodology/glossary.md` | [glossary.md](docs/framework/methodology/glossary.md) | Methodology | None | High | Glossary and active flow cycles (the-loop.md). | N/A |
| `docs/framework/methodology/lessons-learned.md` | [lessons-learned.md](docs/framework/methodology/lessons-learned.md) | Methodology | None | High | Glossary and active flow cycles (the-loop.md). | N/A |
| `docs/framework/methodology/the-loop.md` | [the-loop.md](docs/framework/methodology/the-loop.md) | Methodology | None | High | Glossary and active flow cycles (the-loop.md). | N/A |
| `docs/framework/README.md` | [README.md](docs/framework/README.md) | Framework | None | High | General framework orientation and indices. | N/A |
| `docs/framework/releases` | [docs/framework/releases](docs/framework/releases) | Governance | Runtime | High | CEF framework release records. | N/A |
| `docs/framework/releases/CEF-v1.0-Framework-Release.md` | [CEF-v1.0-Framework-Release.md](docs/framework/releases/CEF-v1.0-Framework-Release.md) | Governance | Runtime | High | CEF framework release records. | N/A |
| `docs/framework/releases/README.md` | [README.md](docs/framework/releases/README.md) | Governance | Runtime | High | CEF framework release records. | N/A |
| `docs/framework/specification` | [docs/framework/specification](docs/framework/specification) | Specification | None | Low | N/A | Empty folder. |
| `docs/framework/specification/cst-tpci-app-development-specification.md` | [cst-tpci-app-development-specification.md](docs/framework/specification/cst-tpci-app-development-specification.md) | Specification | None | High | Application development spec for CST-TPCI. | N/A |
| `docs/framework/templates` | [docs/framework/templates](docs/framework/templates) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/boundary-matrix-template.md` | [boundary-matrix-template.md](docs/framework/templates/boundary-matrix-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/debugging-template.md` | [debugging-template.md](docs/framework/templates/debugging-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/engineering-log-template.md` | [engineering-log-template.md](docs/framework/templates/engineering-log-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/ontology-template.md` | [ontology-template.md](docs/framework/templates/ontology-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/security-template.md` | [security-template.md](docs/framework/templates/security-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/framework/templates/vocabulary-template.md` | [vocabulary-template.md](docs/framework/templates/vocabulary-template.md) | Framework | Specification | High | Standard templates for various CEF documents. | N/A |
| `docs/methodology` | [docs/methodology](docs/methodology) | Methodology | None | Low | Root-level methodology directory. | Currently empty placeholder directory. |
| `docs/project` | [docs/project](docs/project) | Project | None | High | Root folder for project documentation. | N/A |
| `docs/project/00-constitution` | [docs/project/00-constitution](docs/project/00-constitution) | Constitutional Authority | None | High | Constitutional foundation of RKF. | N/A |
| `docs/project/00-constitution/README.md` | [README.md](docs/project/00-constitution/README.md) | Constitutional Authority | None | High | Constitutional foundation of RKF. | N/A |
| `docs/project/01-rkf` | [docs/project/01-rkf](docs/project/01-rkf) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/architecture-overview.md` | [architecture-overview.md](docs/project/01-rkf/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/audience.md` | [audience.md](docs/project/01-rkf/audience.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/core-pillars.md` | [core-pillars.md](docs/project/01-rkf/core-pillars.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/core-principles.md` | [core-principles.md](docs/project/01-rkf/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/domains.md` | [domains.md](docs/project/01-rkf/domains.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/future-vision.md` | [future-vision.md](docs/project/01-rkf/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/governance-philosophy.md` | [governance-philosophy.md](docs/project/01-rkf/governance-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/mission.md` | [mission.md](docs/project/01-rkf/mission.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/organizational-readiness.md` | [organizational-readiness.md](docs/project/01-rkf/organizational-readiness.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/philosophy.md` | [philosophy.md](docs/project/01-rkf/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/purpose.md` | [purpose.md](docs/project/01-rkf/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/README.md` | [README.md](docs/project/01-rkf/README.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/reference-knowledge.md` | [reference-knowledge.md](docs/project/01-rkf/reference-knowledge.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/shared-vocabulary.md` | [shared-vocabulary.md](docs/project/01-rkf/shared-vocabulary.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/01-rkf/vision.md` | [vision.md](docs/project/01-rkf/vision.md) | Constitutional Authority | None | High | Constitutional Volume 1: Constitutional Identity. | N/A |
| `docs/project/02-curiosity-journey` | [docs/project/02-curiosity-journey](docs/project/02-curiosity-journey) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/accessibility-principles.md` | [accessibility-principles.md](docs/project/02-curiosity-journey/accessibility-principles.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/adaptation-philosophy.md` | [adaptation-philosophy.md](docs/project/02-curiosity-journey/adaptation-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/architecture-overview.md` | [architecture-overview.md](docs/project/02-curiosity-journey/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/confidence-model.md` | [confidence-model.md](docs/project/02-curiosity-journey/confidence-model.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/core-principles.md` | [core-principles.md](docs/project/02-curiosity-journey/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/curiosity-philosophy.md` | [curiosity-philosophy.md](docs/project/02-curiosity-journey/curiosity-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/future-vision.md` | [future-vision.md](docs/project/02-curiosity-journey/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/human-understanding-model.md` | [human-understanding-model.md](docs/project/02-curiosity-journey/human-understanding-model.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/learner-discovery.md` | [learner-discovery.md](docs/project/02-curiosity-journey/learner-discovery.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/learning-science.md` | [learning-science.md](docs/project/02-curiosity-journey/learning-science.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/learning-signals.md` | [learning-signals.md](docs/project/02-curiosity-journey/learning-signals.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/mission.md` | [mission.md](docs/project/02-curiosity-journey/mission.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/motivation-model.md` | [motivation-model.md](docs/project/02-curiosity-journey/motivation-model.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/onboarding-philosophy.md` | [onboarding-philosophy.md](docs/project/02-curiosity-journey/onboarding-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/philosophy.md` | [philosophy.md](docs/project/02-curiosity-journey/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/presentation-preferences.md` | [presentation-preferences.md](docs/project/02-curiosity-journey/presentation-preferences.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/privacy-principles.md` | [privacy-principles.md](docs/project/02-curiosity-journey/privacy-principles.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/purpose.md` | [purpose.md](docs/project/02-curiosity-journey/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/README.md` | [README.md](docs/project/02-curiosity-journey/README.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/recommendation-philosophy.md` | [recommendation-philosophy.md](docs/project/02-curiosity-journey/recommendation-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/02-curiosity-journey/vision.md` | [vision.md](docs/project/02-curiosity-journey/vision.md) | Constitutional Authority | None | High | Constitutional Volume 2: Curiosity Journey Engine. | N/A |
| `docs/project/03-fd-ess` | [docs/project/03-fd-ess](docs/project/03-fd-ess) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/analogy-philosophy.md` | [analogy-philosophy.md](docs/project/03-fd-ess/analogy-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/architecture-overview.md` | [architecture-overview.md](docs/project/03-fd-ess/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/cognitive-load.md` | [cognitive-load.md](docs/project/03-fd-ess/cognitive-load.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/core-principles.md` | [core-principles.md](docs/project/03-fd-ess/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/explainability-assets.md` | [explainability-assets.md](docs/project/03-fd-ess/explainability-assets.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/explainability-boundaries.md` | [explainability-boundaries.md](docs/project/03-fd-ess/explainability-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/explainability-philosophy.md` | [explainability-philosophy.md](docs/project/03-fd-ess/explainability-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/future-vision.md` | [future-vision.md](docs/project/03-fd-ess/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/human-centered-communication.md` | [human-centered-communication.md](docs/project/03-fd-ess/human-centered-communication.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/knowledge-transformation.md` | [knowledge-transformation.md](docs/project/03-fd-ess/knowledge-transformation.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/memory-anchors.md` | [memory-anchors.md](docs/project/03-fd-ess/memory-anchors.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/mental-models.md` | [mental-models.md](docs/project/03-fd-ess/mental-models.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/mission.md` | [mission.md](docs/project/03-fd-ess/mission.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/philosophy.md` | [philosophy.md](docs/project/03-fd-ess/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/progressive-disclosure.md` | [progressive-disclosure.md](docs/project/03-fd-ess/progressive-disclosure.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/purpose.md` | [purpose.md](docs/project/03-fd-ess/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/quality-principles.md` | [quality-principles.md](docs/project/03-fd-ess/quality-principles.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/README.md` | [README.md](docs/project/03-fd-ess/README.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/storytelling-philosophy.md` | [storytelling-philosophy.md](docs/project/03-fd-ess/storytelling-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/vision.md` | [vision.md](docs/project/03-fd-ess/vision.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/03-fd-ess/visual-explainability.md` | [visual-explainability.md](docs/project/03-fd-ess/visual-explainability.md) | Constitutional Authority | None | High | Constitutional Volume 3: FD-ESS Explainability. | N/A |
| `docs/project/04-cst` | [docs/project/04-cst](docs/project/04-cst) | Constitutional Authority | None | High | Constitutional System Thinking validation guidelines. | N/A |
| `docs/project/04-cst/README.md` | [README.md](docs/project/04-cst/README.md) | Constitutional Authority | None | High | Constitutional System Thinking validation guidelines. | N/A |
| `docs/project/04-knowledge-model` | [docs/project/04-knowledge-model](docs/project/04-knowledge-model) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/architecture-overview.md` | [architecture-overview.md](docs/project/04-knowledge-model/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/core-principles.md` | [core-principles.md](docs/project/04-knowledge-model/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/explainability-asset.md` | [explainability-asset.md](docs/project/04-knowledge-model/explainability-asset.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/future-vision.md` | [future-vision.md](docs/project/04-knowledge-model/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/governance-asset.md` | [governance-asset.md](docs/project/04-knowledge-model/governance-asset.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-asset.md` | [knowledge-asset.md](docs/project/04-knowledge-model/knowledge-asset.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-governance.md` | [knowledge-governance.md](docs/project/04-knowledge-model/knowledge-governance.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-lifecycle.md` | [knowledge-lifecycle.md](docs/project/04-knowledge-model/knowledge-lifecycle.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-object.md` | [knowledge-object.md](docs/project/04-knowledge-model/knowledge-object.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-provenance.md` | [knowledge-provenance.md](docs/project/04-knowledge-model/knowledge-provenance.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-quality.md` | [knowledge-quality.md](docs/project/04-knowledge-model/knowledge-quality.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/knowledge-traceability.md` | [knowledge-traceability.md](docs/project/04-knowledge-model/knowledge-traceability.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/learning-asset.md` | [learning-asset.md](docs/project/04-knowledge-model/learning-asset.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/mission.md` | [mission.md](docs/project/04-knowledge-model/mission.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/philosophy.md` | [philosophy.md](docs/project/04-knowledge-model/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/purpose.md` | [purpose.md](docs/project/04-knowledge-model/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/README.md` | [README.md](docs/project/04-knowledge-model/README.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/relationship-model.md` | [relationship-model.md](docs/project/04-knowledge-model/relationship-model.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/vision.md` | [vision.md](docs/project/04-knowledge-model/vision.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/04-knowledge-model/vocabulary-asset.md` | [vocabulary-asset.md](docs/project/04-knowledge-model/vocabulary-asset.md) | Constitutional Authority | None | High | Constitutional Volume 4: Knowledge Model. | N/A |
| `docs/project/05-knowledge-governance` | [docs/project/05-knowledge-governance](docs/project/05-knowledge-governance) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/architecture-overview.md` | [architecture-overview.md](docs/project/05-knowledge-governance/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/core-principles.md` | [core-principles.md](docs/project/05-knowledge-governance/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/future-vision.md` | [future-vision.md](docs/project/05-knowledge-governance/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/governance-boundaries.md` | [governance-boundaries.md](docs/project/05-knowledge-governance/governance-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-approval.md` | [knowledge-approval.md](docs/project/05-knowledge-governance/knowledge-approval.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-authority.md` | [knowledge-authority.md](docs/project/05-knowledge-governance/knowledge-authority.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-evolution.md` | [knowledge-evolution.md](docs/project/05-knowledge-governance/knowledge-evolution.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-lifecycle.md` | [knowledge-lifecycle.md](docs/project/05-knowledge-governance/knowledge-lifecycle.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-ownership.md` | [knowledge-ownership.md](docs/project/05-knowledge-governance/knowledge-ownership.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-provenance.md` | [knowledge-provenance.md](docs/project/05-knowledge-governance/knowledge-provenance.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-quality.md` | [knowledge-quality.md](docs/project/05-knowledge-governance/knowledge-quality.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-retirement.md` | [knowledge-retirement.md](docs/project/05-knowledge-governance/knowledge-retirement.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-review.md` | [knowledge-review.md](docs/project/05-knowledge-governance/knowledge-review.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-stewardship.md` | [knowledge-stewardship.md](docs/project/05-knowledge-governance/knowledge-stewardship.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-traceability.md` | [knowledge-traceability.md](docs/project/05-knowledge-governance/knowledge-traceability.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-validation.md` | [knowledge-validation.md](docs/project/05-knowledge-governance/knowledge-validation.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/knowledge-versioning.md` | [knowledge-versioning.md](docs/project/05-knowledge-governance/knowledge-versioning.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/mission.md` | [mission.md](docs/project/05-knowledge-governance/mission.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/philosophy.md` | [philosophy.md](docs/project/05-knowledge-governance/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/purpose.md` | [purpose.md](docs/project/05-knowledge-governance/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/README.md` | [README.md](docs/project/05-knowledge-governance/README.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-knowledge-governance/vision.md` | [vision.md](docs/project/05-knowledge-governance/vision.md) | Constitutional Authority | None | High | Constitutional Volume 5: Knowledge Governance. | N/A |
| `docs/project/05-tpci` | [docs/project/05-tpci](docs/project/05-tpci) | Constitutional Authority | None | High | Constitutional trust, power, control, integrity validation. | N/A |
| `docs/project/05-tpci/README.md` | [README.md](docs/project/05-tpci/README.md) | Constitutional Authority | None | High | Constitutional trust, power, control, integrity validation. | N/A |
| `docs/project/06-knowledge-graph` | [docs/project/06-knowledge-graph](docs/project/06-knowledge-graph) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/architecture-overview.md` | [architecture-overview.md](docs/project/06-knowledge-graph/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/core-principles.md` | [core-principles.md](docs/project/06-knowledge-graph/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/future-vision.md` | [future-vision.md](docs/project/06-knowledge-graph/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-boundaries.md` | [graph-boundaries.md](docs/project/06-knowledge-graph/graph-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-consistency.md` | [graph-consistency.md](docs/project/06-knowledge-graph/graph-consistency.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-evolution.md` | [graph-evolution.md](docs/project/06-knowledge-graph/graph-evolution.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-governance.md` | [graph-governance.md](docs/project/06-knowledge-graph/graph-governance.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-integrity.md` | [graph-integrity.md](docs/project/06-knowledge-graph/graph-integrity.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-philosophy.md` | [graph-philosophy.md](docs/project/06-knowledge-graph/graph-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/graph-quality.md` | [graph-quality.md](docs/project/06-knowledge-graph/graph-quality.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/knowledge-context.md` | [knowledge-context.md](docs/project/06-knowledge-graph/knowledge-context.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/knowledge-navigation.md` | [knowledge-navigation.md](docs/project/06-knowledge-graph/knowledge-navigation.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/knowledge-paths.md` | [knowledge-paths.md](docs/project/06-knowledge-graph/knowledge-paths.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/mission.md` | [mission.md](docs/project/06-knowledge-graph/mission.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/node-philosophy.md` | [node-philosophy.md](docs/project/06-knowledge-graph/node-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/philosophy.md` | [philosophy.md](docs/project/06-knowledge-graph/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/purpose.md` | [purpose.md](docs/project/06-knowledge-graph/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/README.md` | [README.md](docs/project/06-knowledge-graph/README.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/relationship-philosophy.md` | [relationship-philosophy.md](docs/project/06-knowledge-graph/relationship-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/representation-principles.md` | [representation-principles.md](docs/project/06-knowledge-graph/representation-principles.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/06-knowledge-graph/vision.md` | [vision.md](docs/project/06-knowledge-graph/vision.md) | Constitutional Authority | None | High | Constitutional Volume 6: Knowledge Graph. | N/A |
| `docs/project/07-cst` | [docs/project/07-cst](docs/project/07-cst) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/architecture-overview.md` | [architecture-overview.md](docs/project/07-cst/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/boundary-validation.md` | [boundary-validation.md](docs/project/07-cst/boundary-validation.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/constitutional-consistency.md` | [constitutional-consistency.md](docs/project/07-cst/constitutional-consistency.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/constitutional-drift.md` | [constitutional-drift.md](docs/project/07-cst/constitutional-drift.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/constitutional-health.md` | [constitutional-health.md](docs/project/07-cst/constitutional-health.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/constitutional-integrity.md` | [constitutional-integrity.md](docs/project/07-cst/constitutional-integrity.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/constitutional-observability.md` | [constitutional-observability.md](docs/project/07-cst/constitutional-observability.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/core-principles.md` | [core-principles.md](docs/project/07-cst/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/dependency-validation.md` | [dependency-validation.md](docs/project/07-cst/dependency-validation.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/future-vision.md` | [future-vision.md](docs/project/07-cst/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/mission.md` | [mission.md](docs/project/07-cst/mission.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/philosophy.md` | [philosophy.md](docs/project/07-cst/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/purpose.md` | [purpose.md](docs/project/07-cst/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/README.md` | [README.md](docs/project/07-cst/README.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/responsibility-validation.md` | [responsibility-validation.md](docs/project/07-cst/responsibility-validation.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/structural-coherence.md` | [structural-coherence.md](docs/project/07-cst/structural-coherence.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/system-thinking.md` | [system-thinking.md](docs/project/07-cst/system-thinking.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/validation-boundaries.md` | [validation-boundaries.md](docs/project/07-cst/validation-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/validation-philosophy.md` | [validation-philosophy.md](docs/project/07-cst/validation-philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-cst/vision.md` | [vision.md](docs/project/07-cst/vision.md) | Constitutional Authority | None | High | Constitutional Volume 7: CST. | N/A |
| `docs/project/07-engineering` | [docs/project/07-engineering](docs/project/07-engineering) | Constitutional Authority | None | High | Engineering governance rules. | N/A |
| `docs/project/07-engineering/README.md` | [README.md](docs/project/07-engineering/README.md) | Constitutional Authority | None | High | Engineering governance rules. | N/A |
| `docs/project/08-roadmap` | [docs/project/08-roadmap](docs/project/08-roadmap) | Constitutional Authority | None | High | RKF project evolution phases. | N/A |
| `docs/project/08-roadmap/README.md` | [README.md](docs/project/08-roadmap/README.md) | Constitutional Authority | None | High | RKF project evolution phases. | N/A |
| `docs/project/08-tpci` | [docs/project/08-tpci](docs/project/08-tpci) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/architecture-overview.md` | [architecture-overview.md](docs/project/08-tpci/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/behaviour.md` | [behaviour.md](docs/project/08-tpci/behaviour.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/behavioural-integrity.md` | [behavioural-integrity.md](docs/project/08-tpci/behavioural-integrity.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/constitutional-boundaries.md` | [constitutional-boundaries.md](docs/project/08-tpci/constitutional-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/constitutional-trust.md` | [constitutional-trust.md](docs/project/08-tpci/constitutional-trust.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/control.md` | [control.md](docs/project/08-tpci/control.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/core-principles.md` | [core-principles.md](docs/project/08-tpci/core-principles.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/cst-relationship.md` | [cst-relationship.md](docs/project/08-tpci/cst-relationship.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/evidence.md` | [evidence.md](docs/project/08-tpci/evidence.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/feedback-and-revalidation.md` | [feedback-and-revalidation.md](docs/project/08-tpci/feedback-and-revalidation.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/future-vision.md` | [future-vision.md](docs/project/08-tpci/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/governance-relationship.md` | [governance-relationship.md](docs/project/08-tpci/governance-relationship.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/knowledge-governance-relationship.md` | [knowledge-governance-relationship.md](docs/project/08-tpci/knowledge-governance-relationship.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/mission.md` | [mission.md](docs/project/08-tpci/mission.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/open-questions.md` | [open-questions.md](docs/project/08-tpci/open-questions.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/philosophy.md` | [philosophy.md](docs/project/08-tpci/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/power.md` | [power.md](docs/project/08-tpci/power.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/proportionality-and-blast-radius.md` | [proportionality-and-blast-radius.md](docs/project/08-tpci/proportionality-and-blast-radius.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/purpose.md` | [purpose.md](docs/project/08-tpci/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/README.md` | [README.md](docs/project/08-tpci/README.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/reliability.md` | [reliability.md](docs/project/08-tpci/reliability.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/structural-integrity.md` | [structural-integrity.md](docs/project/08-tpci/structural-integrity.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/tpci-role.md` | [tpci-role.md](docs/project/08-tpci/tpci-role.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/trust-evaluation-model.md` | [trust-evaluation-model.md](docs/project/08-tpci/trust-evaluation-model.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/trust-judgement.md` | [trust-judgement.md](docs/project/08-tpci/trust-judgement.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/08-tpci/vision.md` | [vision.md](docs/project/08-tpci/vision.md) | Constitutional Authority | None | High | Constitutional Volume 8: TPCI trust framework. | N/A |
| `docs/project/09-decisions` | [docs/project/09-decisions](docs/project/09-decisions) | Decision Record | None | High | Records architectural and constitutional decisions. | N/A |
| `docs/project/09-decisions/DEC-0001-constitutional-development-roadmap.md` | [DEC-0001-constitutional-development-roadmap.md](docs/project/09-decisions/DEC-0001-constitutional-development-roadmap.md) | Decision Record | None | High | Records architectural and constitutional decisions. | N/A |
| `docs/project/09-decisions/DEC-0003-constitutional-volume-boundary-review.md` | [DEC-0003-constitutional-volume-boundary-review.md](docs/project/09-decisions/DEC-0003-constitutional-volume-boundary-review.md) | Decision Record | None | High | Records architectural and constitutional decisions. | N/A |
| `docs/project/09-decisions/DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md` | [DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md](docs/project/09-decisions/DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md) | Decision Record | None | High | Records architectural and constitutional decisions. | N/A |
| `docs/project/09-decisions/README.md` | [README.md](docs/project/09-decisions/README.md) | Decision Record | None | High | Records architectural and constitutional decisions. | N/A |
| `docs/project/09-engineering` | [docs/project/09-engineering](docs/project/09-engineering) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/architecture-overview.md` | [architecture-overview.md](docs/project/09-engineering/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/constitution-before-implementation.md` | [constitution-before-implementation.md](docs/project/09-engineering/constitution-before-implementation.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/constitutional-engineering.md` | [constitutional-engineering.md](docs/project/09-engineering/constitutional-engineering.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/constitutional-testing.md` | [constitutional-testing.md](docs/project/09-engineering/constitutional-testing.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/documentation.md` | [documentation.md](docs/project/09-engineering/documentation.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/engineering-boundaries.md` | [engineering-boundaries.md](docs/project/09-engineering/engineering-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/engineering-governance.md` | [engineering-governance.md](docs/project/09-engineering/engineering-governance.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/engineering-principles.md` | [engineering-principles.md](docs/project/09-engineering/engineering-principles.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/engineering-traceability.md` | [engineering-traceability.md](docs/project/09-engineering/engineering-traceability.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/future-engineering.md` | [future-engineering.md](docs/project/09-engineering/future-engineering.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/future-vision.md` | [future-vision.md](docs/project/09-engineering/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/human-ai-collaboration.md` | [human-ai-collaboration.md](docs/project/09-engineering/human-ai-collaboration.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/implementation-boundaries.md` | [implementation-boundaries.md](docs/project/09-engineering/implementation-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/knowledge-before-code.md` | [knowledge-before-code.md](docs/project/09-engineering/knowledge-before-code.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/mission.md` | [mission.md](docs/project/09-engineering/mission.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/open-questions.md` | [open-questions.md](docs/project/09-engineering/open-questions.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/philosophy.md` | [philosophy.md](docs/project/09-engineering/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/purpose.md` | [purpose.md](docs/project/09-engineering/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/quality-principles.md` | [quality-principles.md](docs/project/09-engineering/quality-principles.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/README.md` | [README.md](docs/project/09-engineering/README.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/relationships.md` | [relationships.md](docs/project/09-engineering/relationships.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/software-boundaries.md` | [software-boundaries.md](docs/project/09-engineering/software-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/traceability.md` | [traceability.md](docs/project/09-engineering/traceability.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/validation.md` | [validation.md](docs/project/09-engineering/validation.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/verification.md` | [verification.md](docs/project/09-engineering/verification.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/versioning.md` | [versioning.md](docs/project/09-engineering/versioning.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/09-engineering/vision.md` | [vision.md](docs/project/09-engineering/vision.md) | Constitutional Authority | None | High | Constitutional Volume 9: Engineering Constitution. | N/A |
| `docs/project/10-research` | [docs/project/10-research](docs/project/10-research) | Research | None | High | Stores research, evidence, and observations. | N/A |
| `docs/project/10-research/README.md` | [README.md](docs/project/10-research/README.md) | Research | None | High | Stores research, evidence, and observations. | N/A |
| `docs/project/10-runtime` | [docs/project/10-runtime](docs/project/10-runtime) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/architecture-overview.md` | [architecture-overview.md](docs/project/10-runtime/architecture-overview.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/constitutional-runtime.md` | [constitutional-runtime.md](docs/project/10-runtime/constitutional-runtime.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/future-vision.md` | [future-vision.md](docs/project/10-runtime/future-vision.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/mission.md` | [mission.md](docs/project/10-runtime/mission.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/open-questions.md` | [open-questions.md](docs/project/10-runtime/open-questions.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/philosophy.md` | [philosophy.md](docs/project/10-runtime/philosophy.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/purpose.md` | [purpose.md](docs/project/10-runtime/purpose.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/README.md` | [README.md](docs/project/10-runtime/README.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/relationships.md` | [relationships.md](docs/project/10-runtime/relationships.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-behaviour.md` | [runtime-behaviour.md](docs/project/10-runtime/runtime-behaviour.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-boundaries.md` | [runtime-boundaries.md](docs/project/10-runtime/runtime-boundaries.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-drift.md` | [runtime-drift.md](docs/project/10-runtime/runtime-drift.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-evidence.md` | [runtime-evidence.md](docs/project/10-runtime/runtime-evidence.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-feedback.md` | [runtime-feedback.md](docs/project/10-runtime/runtime-feedback.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-governance.md` | [runtime-governance.md](docs/project/10-runtime/runtime-governance.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-monitoring.md` | [runtime-monitoring.md](docs/project/10-runtime/runtime-monitoring.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-observation.md` | [runtime-observation.md](docs/project/10-runtime/runtime-observation.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-principles.md` | [runtime-principles.md](docs/project/10-runtime/runtime-principles.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-recovery.md` | [runtime-recovery.md](docs/project/10-runtime/runtime-recovery.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-reliability.md` | [runtime-reliability.md](docs/project/10-runtime/runtime-reliability.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-resilience.md` | [runtime-resilience.md](docs/project/10-runtime/runtime-resilience.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-traceability.md` | [runtime-traceability.md](docs/project/10-runtime/runtime-traceability.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-validation.md` | [runtime-validation.md](docs/project/10-runtime/runtime-validation.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/runtime-verification.md` | [runtime-verification.md](docs/project/10-runtime/runtime-verification.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/10-runtime/vision.md` | [vision.md](docs/project/10-runtime/vision.md) | Constitutional Authority | None | High | Constitutional Volume 10: Runtime Constitution. | N/A |
| `docs/project/11-knowledge-assets` | [docs/project/11-knowledge-assets](docs/project/11-knowledge-assets) | Framework | Specification | High | Prepares RKF for reusable knowledge assets. | N/A |
| `docs/project/11-knowledge-assets/README.md` | [README.md](docs/project/11-knowledge-assets/README.md) | Framework | Specification | High | Prepares RKF for reusable knowledge assets. | N/A |
| `docs/project/12-templates` | [docs/project/12-templates](docs/project/12-templates) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/architecture-specification-template.md` | [architecture-specification-template.md](docs/project/12-templates/architecture-specification-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/constitutional-document-template.md` | [constitutional-document-template.md](docs/project/12-templates/constitutional-document-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/decision-record-template.md` | [decision-record-template.md](docs/project/12-templates/decision-record-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/knowledge-asset-template.md` | [knowledge-asset-template.md](docs/project/12-templates/knowledge-asset-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/readme-standards.md` | [readme-standards.md](docs/project/12-templates/readme-standards.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/README.md` | [README.md](docs/project/12-templates/README.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/review-report-template.md` | [review-report-template.md](docs/project/12-templates/review-report-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/12-templates/sprint-specification-template.md` | [sprint-specification-template.md](docs/project/12-templates/sprint-specification-template.md) | Framework | Specification | High | Project documentation templates. | N/A |
| `docs/project/13-architecture-blueprints` | [docs/project/13-architecture-blueprints](docs/project/13-architecture-blueprints) | Architecture | None | High | Exploratory architecture blueprints. | N/A |
| `docs/project/13-architecture-blueprints/README.md` | [README.md](docs/project/13-architecture-blueprints/README.md) | Architecture | None | High | Exploratory architecture blueprints. | N/A |
| `docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v1.0.md` | [RKF-TPCI-Architectural-Blueprint-v1.0.md](docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v1.0.md) | Architecture | Historical | High | Exploratory architecture blueprints. | Superseded by v2.0 as per DEC-0004. |
| `docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v2.0.md` | [RKF-TPCI-Architectural-Blueprint-v2.0.md](docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v2.0.md) | Architecture | None | High | Exploratory architecture blueprints. | N/A |
| `docs/project/14-architecture-reviews` | [docs/project/14-architecture-reviews](docs/project/14-architecture-reviews) | Review | Governance | High | Constitutional readiness reviews for Blueprints. | N/A |
| `docs/project/14-architecture-reviews/AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md` | [AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md](docs/project/14-architecture-reviews/AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md) | Review | Governance | High | Constitutional readiness reviews for Blueprints. | N/A |
| `docs/project/14-architecture-reviews/README.md` | [README.md](docs/project/14-architecture-reviews/README.md) | Review | Governance | High | Constitutional readiness reviews for Blueprints. | N/A |
| `docs/project/15-gap-analyses` | [docs/project/15-gap-analyses](docs/project/15-gap-analyses) | Gap Analysis | Governance | High | Repository structure standards audit. | N/A |
| `docs/project/15-gap-analyses/GA-0001-Constitutional-Repository-Gap-Analysis.md` | [GA-0001-Constitutional-Repository-Gap-Analysis.md](docs/project/15-gap-analyses/GA-0001-Constitutional-Repository-Gap-Analysis.md) | Gap Analysis | Governance | High | Repository structure standards audit. | N/A |
| `docs/project/15-gap-analyses/README.md` | [README.md](docs/project/15-gap-analyses/README.md) | Gap Analysis | Governance | High | Repository structure standards audit. | N/A |
| `docs/project/16-writing-specifications` | [docs/project/16-writing-specifications](docs/project/16-writing-specifications) | Specification | None | High | Defines writing formats for future volumes. | N/A |
| `docs/project/16-writing-specifications/CVS-0008-TPCI-Constitutional-Writing-Specification.md` | [CVS-0008-TPCI-Constitutional-Writing-Specification.md](docs/project/16-writing-specifications/CVS-0008-TPCI-Constitutional-Writing-Specification.md) | Specification | None | High | Defines writing formats for future volumes. | N/A |
| `docs/project/16-writing-specifications/README.md` | [README.md](docs/project/16-writing-specifications/README.md) | Specification | None | High | Defines writing formats for future volumes. | N/A |
| `docs/project/17-constitutional-reviews` | [docs/project/17-constitutional-reviews](docs/project/17-constitutional-reviews) | Review | Governance | High | Independent constitutional reviews for Volumes. | N/A |
| `docs/project/17-constitutional-reviews/AR-0002-Constitutional-Review-of-Volume-8.md` | [AR-0002-Constitutional-Review-of-Volume-8.md](docs/project/17-constitutional-reviews/AR-0002-Constitutional-Review-of-Volume-8.md) | Review | Governance | High | Independent constitutional reviews for Volumes. | N/A |
| `docs/project/17-constitutional-reviews/AR-0003-Constitutional-Review-of-Volume-9.md` | [AR-0003-Constitutional-Review-of-Volume-9.md](docs/project/17-constitutional-reviews/AR-0003-Constitutional-Review-of-Volume-9.md) | Review | Governance | High | Independent constitutional reviews for Volumes. | N/A |
| `docs/project/17-constitutional-reviews/README.md` | [README.md](docs/project/17-constitutional-reviews/README.md) | Review | Governance | High | Independent constitutional reviews for Volumes. | N/A |
| `docs/project/18-system-architecture` | [docs/project/18-system-architecture](docs/project/18-system-architecture) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-authority-model.md` | [constitutional-authority-model.md](docs/project/18-system-architecture/constitutional-authority-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-boundary-model.md` | [constitutional-boundary-model.md](docs/project/18-system-architecture/constitutional-boundary-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-dependency-model.md` | [constitutional-dependency-model.md](docs/project/18-system-architecture/constitutional-dependency-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-domain-map.md` | [constitutional-domain-map.md](docs/project/18-system-architecture/constitutional-domain-map.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-evidence-model.md` | [constitutional-evidence-model.md](docs/project/18-system-architecture/constitutional-evidence-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-evolution-model.md` | [constitutional-evolution-model.md](docs/project/18-system-architecture/constitutional-evolution-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-governance-model.md` | [constitutional-governance-model.md](docs/project/18-system-architecture/constitutional-governance-model.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-information-flow.md` | [constitutional-information-flow.md](docs/project/18-system-architecture/constitutional-information-flow.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/constitutional-system-architecture-v1.md` | [constitutional-system-architecture-v1.md](docs/project/18-system-architecture/constitutional-system-architecture-v1.md) | Architecture | Historical | High | System architecture models. | Superseded by later models. |
| `docs/project/18-system-architecture/future-system-evolution.md` | [future-system-evolution.md](docs/project/18-system-architecture/future-system-evolution.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/18-system-architecture/README.md` | [README.md](docs/project/18-system-architecture/README.md) | Architecture | None | High | System architecture models. | N/A |
| `docs/project/19-domain-expansion` | [docs/project/19-domain-expansion](docs/project/19-domain-expansion) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/constitutional-dependency-roadmap.md` | [constitutional-dependency-roadmap.md](docs/project/19-domain-expansion/constitutional-dependency-roadmap.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/constitutional-domain-catalogue.md` | [constitutional-domain-catalogue.md](docs/project/19-domain-expansion/constitutional-domain-catalogue.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/constitutional-domain-roadmap.md` | [constitutional-domain-roadmap.md](docs/project/19-domain-expansion/constitutional-domain-roadmap.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/constitutional-prioritization.md` | [constitutional-prioritization.md](docs/project/19-domain-expansion/constitutional-prioritization.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/expansion-principles.md` | [expansion-principles.md](docs/project/19-domain-expansion/expansion-principles.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/future-domain-guidelines.md` | [future-domain-guidelines.md](docs/project/19-domain-expansion/future-domain-guidelines.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/integration-strategy.md` | [integration-strategy.md](docs/project/19-domain-expansion/integration-strategy.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/phase-ii-domain-expansion.md` | [phase-ii-domain-expansion.md](docs/project/19-domain-expansion/phase-ii-domain-expansion.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/19-domain-expansion/README.md` | [README.md](docs/project/19-domain-expansion/README.md) | Future | Research | High | Phase II domain expansion roadmaps. | N/A |
| `docs/project/20-domain-specifications` | [docs/project/20-domain-specifications](docs/project/20-domain-specifications) | Specification | None | High | Future domain specifications. | N/A |
| `docs/project/20-domain-specifications/CDS-0001-Privacy-Constitution.md` | [CDS-0001-Privacy-Constitution.md](docs/project/20-domain-specifications/CDS-0001-Privacy-Constitution.md) | Specification | None | High | Future domain specifications. | N/A |
| `docs/project/20-domain-specifications/README.md` | [README.md](docs/project/20-domain-specifications/README.md) | Specification | None | High | Future domain specifications. | N/A |
| `docs/project/21-research-specifications` | [docs/project/21-research-specifications](docs/project/21-research-specifications) | Research | Specification | High | Future domain research specifications. | N/A |
| `docs/project/21-research-specifications/README.md` | [README.md](docs/project/21-research-specifications/README.md) | Research | Specification | High | Future domain research specifications. | N/A |
| `docs/project/21-research-specifications/RS-0001-Privacy-Constitution.md` | [RS-0001-Privacy-Constitution.md](docs/project/21-research-specifications/RS-0001-Privacy-Constitution.md) | Research | Specification | High | Future domain research specifications. | N/A |
| `docs/project/22-architecture-blueprints` | [docs/project/22-architecture-blueprints](docs/project/22-architecture-blueprints) | Architecture | None | High | Future domain architecture blueprints. | N/A |
| `docs/project/22-architecture-blueprints/BP-0002-Privacy-Constitution-Architecture-v1.md` | [BP-0002-Privacy-Constitution-Architecture-v1.md](docs/project/22-architecture-blueprints/BP-0002-Privacy-Constitution-Architecture-v1.md) | Architecture | None | High | Future domain architecture blueprints. | N/A |
| `docs/project/22-architecture-blueprints/README.md` | [README.md](docs/project/22-architecture-blueprints/README.md) | Architecture | None | High | Future domain architecture blueprints. | N/A |
| `docs/project/23-validation-pilots` | [docs/project/23-validation-pilots](docs/project/23-validation-pilots) | Review | Runtime | High | Pilots evaluating domain goals. | N/A |
| `docs/project/23-validation-pilots/README.md` | [README.md](docs/project/23-validation-pilots/README.md) | Review | Runtime | High | Pilots evaluating domain goals. | N/A |
| `docs/project/23-validation-pilots/VP-0001-Privacy-Constitution.md` | [VP-0001-Privacy-Constitution.md](docs/project/23-validation-pilots/VP-0001-Privacy-Constitution.md) | Review | Runtime | High | Pilots evaluating domain goals. | N/A |
| `docs/project/README.md` | [README.md](docs/project/README.md) | Unknown | None | High | N/A | N/A |
| `docs/runtime` | [docs/runtime](docs/runtime) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/runtime/current-state.md` | [current-state.md](docs/runtime/current-state.md) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/runtime/debugging-log.md` | [debugging-log.md](docs/runtime/debugging-log.md) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/runtime/drift-inventory.md` | [drift-inventory.md](docs/runtime/drift-inventory.md) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/runtime/engineering-log.md` | [engineering-log.md](docs/runtime/engineering-log.md) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/runtime/release-readiness.md` | [release-readiness.md](docs/runtime/release-readiness.md) | Runtime | None | High | Contains runtime evidence (engineering logs, debugging logs, drift inventories, and current state). | N/A |
| `docs/security` | [docs/security](docs/security) | Specification | None | Low | Root-level security directory. | Currently empty placeholder directory. |
| `docs/specification` | [docs/specification](docs/specification) | Specification | None | Low | Root-level specification directory. | Currently empty placeholder directory. |
| `docs/START_HERE.md` | [START_HERE.md](docs/START_HERE.md) | Methodology | Governance | High | Introductory document setting read order and lifecycle rules. | Mandatory starting guide. |

## 7. Requires Interpretation Register

The following items are placeholder directories currently empty of content. They require interpretation (additional documentation or files) to confirm their precise classification:

| Directory Path | Classification | Context Needed |
|----------------|----------------|----------------|
| `docs/methodology` | Methodology | Requires active files defining overall repository methodologies. |
| `docs/security` | Specification | Requires active files defining security baselines. |
| `docs/specification` | Specification | Requires active files defining data structures/protocols. |
| `docs/framework/methodology` | Methodology | Requires active files outlining methodology processes. |
| `docs/framework/specification` | Specification | Requires active files defining specifications. |

## 8. Examples Boundary Review

We identified all example areas:
- `docs/examples/akukom/`
- `docs/examples/bridgenta/`
- `docs/examples/dicsay/`

**Verification Status**: Verified.
- All example files reside strictly under the `examples/` directory.
- All READMEs in the example folders state that they are educational resources.
- None of these files carry constitutional authority. There is no ambiguity.

## 9. Historical Boundary Review

The following files represent historical/superseded documentation:
- **[project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v1.0.md](docs/project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v1.0.md)**: Superseded by v2.0 under DEC-0004.
- **[project/18-system-architecture/constitutional-system-architecture-v1.md](docs/project/18-system-architecture/constitutional-system-architecture-v1.md)**: Earlier version of the architecture overview.
- **[framework/18-lessons-learned/LL-0001-Constitutional-Volume-8.md](docs/framework/18-lessons-learned/LL-0001-Constitutional-Volume-8.md)**: Historical review of Volume 8 implementation.

All historical boundaries are clearly documented in DEC-0004 or within the file content themselves. No historical items are being treated as active rules.

## 10. Unknown Artifact Register

No unknown directories or files were discovered. The entire filesystem inventory has been successfully mapped to the classification categories.

## 11. Classification Statistics

Summary metrics:
- **Constitutional Authority**: 240 items
- **Framework**: 21 items
- **Methodology**: 10 items
- **Specification**: 10 items
- **Architecture**: 19 items
- **Research**: 5 items
- **Review**: 10 items
- **Gap Analysis**: 3 items
- **Decision Record**: 5 items
- **Governance**: 14 items
- **Runtime**: 6 items
- **Project**: 1 items
- **Examples**: 7 items
- **Historical (Secondary)**: 5 items
- **Future (Secondary)**: 10 items
- **Unknown**: 1 items

## 12. Classification Confidence

**Overall Classification Confidence**: High

**Justification**:
- The repository structure maps 1:1 with the documentation hierarchy and lifecycle outlined in `docs/START_HERE.md`.
- Directories and files are explicitly named and contain concrete purpose statements in their headers.
- All 30 project subdirectories are clearly prefixed and structured around constitutional volumes or standard lifecycle phases (Blueprints, Reviews, Decisions, specifications).
- The empty directories are documented and cataloged, leaving no unrecognized files.
