# RKF Documentation Filesystem Inventory

An authoritative recursive structural reference of the Reference Knowledge Framework (RKF) documentation snapshot.

## 1. Inventory Metadata

- **Inventory Title**: Reference Knowledge Framework (RKF) Documentation Filesystem Inventory
- **Inventory Date**: July 12, 2026
- **Source Directory**: `docs/engineering-communication/v2/research/rkf-reference/docs/`
- **Inventory Method**: Automated recursive scanner script (`generate.js`)
- **Operating System**: Windows
- **Total Directories**: 47 (including empty placeholder directories)
- **Total Files**: 315 (all markdown documents)
- **Maximum Directory Depth**: 3

## 2. Top-Level Inventory

Immediate children of `docs/`:

| Name | Type | Relative Path | Immediate Folders | Immediate Files | Recursive Folders | Recursive Files |
|------|------|---------------|-------------------|-----------------|-------------------|-----------------|
| [canon](docs/canon) | Directory | `docs/canon` | 0 | 1 | 0 | 1 |
| [examples](docs/examples) | Directory | `docs/examples` | 3 | 0 | 3 | 3 |
| [framework](docs/framework) | Directory | `docs/framework` | 6 | 3 | 6 | 27 |
| [methodology](docs/methodology) | Directory | `docs/methodology` | 0 | 0 | 0 | 0 |
| [project](docs/project) | Directory | `docs/project` | 30 | 1 | 30 | 278 |
| [runtime](docs/runtime) | Directory | `docs/runtime` | 0 | 5 | 0 | 5 |
| [security](docs/security) | Directory | `docs/security` | 0 | 0 | 0 | 0 |
| [specification](docs/specification) | Directory | `docs/specification` | 0 | 0 | 0 | 0 |
| [START_HERE.md](docs/START_HERE.md) | File | `docs/START_HERE.md` | 0 | 0 | 0 | 0 |

## 3. Complete Recursive Tree

The complete filesystem tree for the RKF documentation snapshot:

```text
docs/
├── canon/
│   └── README.md
├── examples/
│   ├── akukom/
│   │   └── README.md
│   ├── bridgenta/
│   │   └── README.md
│   └── dicsay/
│       └── README.md
├── framework/
│   ├── 18-lessons-learned/
│   │   ├── LL-0001-Constitutional-Volume-8.md
│   │   └── README.md
│   ├── artifact-lifecycle/
│   │   ├── artifact-authority-model.md
│   │   ├── artifact-catalogue.md
│   │   ├── artifact-dependency-model.md
│   │   ├── artifact-lifecycle-flow.md
│   │   ├── artifact-lifecycle-specification-v1.md
│   │   ├── artifact-quality-gates.md
│   │   ├── artifact-validation-model.md
│   │   ├── artifact-versioning.md
│   │   ├── future-evolution.md
│   │   └── README.md
│   ├── constitutional-engineering-methodology-v1.md
│   ├── framework-overview-v1.md
│   ├── methodology/
│   │   ├── glossary.md
│   │   ├── lessons-learned.md
│   │   └── the-loop.md
│   ├── README.md
│   ├── releases/
│   │   ├── CEF-v1.0-Framework-Release.md
│   │   └── README.md
│   ├── specification/
│   │   └── cst-tpci-app-development-specification.md
│   └── templates/
│       ├── boundary-matrix-template.md
│       ├── debugging-template.md
│       ├── engineering-log-template.md
│       ├── ontology-template.md
│       ├── security-template.md
│       └── vocabulary-template.md
├── methodology/
├── project/
│   ├── 00-constitution/
│   │   └── README.md
│   ├── 01-rkf/
│   │   ├── architecture-overview.md
│   │   ├── audience.md
│   │   ├── core-pillars.md
│   │   ├── core-principles.md
│   │   ├── domains.md
│   │   ├── future-vision.md
│   │   ├── governance-philosophy.md
│   │   ├── mission.md
│   │   ├── organizational-readiness.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── reference-knowledge.md
│   │   ├── shared-vocabulary.md
│   │   └── vision.md
│   ├── 02-curiosity-journey/
│   │   ├── accessibility-principles.md
│   │   ├── adaptation-philosophy.md
│   │   ├── architecture-overview.md
│   │   ├── confidence-model.md
│   │   ├── core-principles.md
│   │   ├── curiosity-philosophy.md
│   │   ├── future-vision.md
│   │   ├── human-understanding-model.md
│   │   ├── learner-discovery.md
│   │   ├── learning-science.md
│   │   ├── learning-signals.md
│   │   ├── mission.md
│   │   ├── motivation-model.md
│   │   ├── onboarding-philosophy.md
│   │   ├── philosophy.md
│   │   ├── presentation-preferences.md
│   │   ├── privacy-principles.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── recommendation-philosophy.md
│   │   └── vision.md
│   ├── 03-fd-ess/
│   │   ├── analogy-philosophy.md
│   │   ├── architecture-overview.md
│   │   ├── cognitive-load.md
│   │   ├── core-principles.md
│   │   ├── explainability-assets.md
│   │   ├── explainability-boundaries.md
│   │   ├── explainability-philosophy.md
│   │   ├── future-vision.md
│   │   ├── human-centered-communication.md
│   │   ├── knowledge-transformation.md
│   │   ├── memory-anchors.md
│   │   ├── mental-models.md
│   │   ├── mission.md
│   │   ├── philosophy.md
│   │   ├── progressive-disclosure.md
│   │   ├── purpose.md
│   │   ├── quality-principles.md
│   │   ├── README.md
│   │   ├── storytelling-philosophy.md
│   │   ├── vision.md
│   │   └── visual-explainability.md
│   ├── 04-cst/
│   │   └── README.md
│   ├── 04-knowledge-model/
│   │   ├── architecture-overview.md
│   │   ├── core-principles.md
│   │   ├── explainability-asset.md
│   │   ├── future-vision.md
│   │   ├── governance-asset.md
│   │   ├── knowledge-asset.md
│   │   ├── knowledge-governance.md
│   │   ├── knowledge-lifecycle.md
│   │   ├── knowledge-object.md
│   │   ├── knowledge-provenance.md
│   │   ├── knowledge-quality.md
│   │   ├── knowledge-traceability.md
│   │   ├── learning-asset.md
│   │   ├── mission.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── relationship-model.md
│   │   ├── vision.md
│   │   └── vocabulary-asset.md
│   ├── 05-knowledge-governance/
│   │   ├── architecture-overview.md
│   │   ├── core-principles.md
│   │   ├── future-vision.md
│   │   ├── governance-boundaries.md
│   │   ├── knowledge-approval.md
│   │   ├── knowledge-authority.md
│   │   ├── knowledge-evolution.md
│   │   ├── knowledge-lifecycle.md
│   │   ├── knowledge-ownership.md
│   │   ├── knowledge-provenance.md
│   │   ├── knowledge-quality.md
│   │   ├── knowledge-retirement.md
│   │   ├── knowledge-review.md
│   │   ├── knowledge-stewardship.md
│   │   ├── knowledge-traceability.md
│   │   ├── knowledge-validation.md
│   │   ├── knowledge-versioning.md
│   │   ├── mission.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   └── vision.md
│   ├── 05-tpci/
│   │   └── README.md
│   ├── 06-knowledge-graph/
│   │   ├── architecture-overview.md
│   │   ├── core-principles.md
│   │   ├── future-vision.md
│   │   ├── graph-boundaries.md
│   │   ├── graph-consistency.md
│   │   ├── graph-evolution.md
│   │   ├── graph-governance.md
│   │   ├── graph-integrity.md
│   │   ├── graph-philosophy.md
│   │   ├── graph-quality.md
│   │   ├── knowledge-context.md
│   │   ├── knowledge-navigation.md
│   │   ├── knowledge-paths.md
│   │   ├── mission.md
│   │   ├── node-philosophy.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── relationship-philosophy.md
│   │   ├── representation-principles.md
│   │   └── vision.md
│   ├── 07-cst/
│   │   ├── architecture-overview.md
│   │   ├── boundary-validation.md
│   │   ├── constitutional-consistency.md
│   │   ├── constitutional-drift.md
│   │   ├── constitutional-health.md
│   │   ├── constitutional-integrity.md
│   │   ├── constitutional-observability.md
│   │   ├── core-principles.md
│   │   ├── dependency-validation.md
│   │   ├── future-vision.md
│   │   ├── mission.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── responsibility-validation.md
│   │   ├── structural-coherence.md
│   │   ├── system-thinking.md
│   │   ├── validation-boundaries.md
│   │   ├── validation-philosophy.md
│   │   └── vision.md
│   ├── 07-engineering/
│   │   └── README.md
│   ├── 08-roadmap/
│   │   └── README.md
│   ├── 08-tpci/
│   │   ├── architecture-overview.md
│   │   ├── behaviour.md
│   │   ├── behavioural-integrity.md
│   │   ├── constitutional-boundaries.md
│   │   ├── constitutional-trust.md
│   │   ├── control.md
│   │   ├── core-principles.md
│   │   ├── cst-relationship.md
│   │   ├── evidence.md
│   │   ├── feedback-and-revalidation.md
│   │   ├── future-vision.md
│   │   ├── governance-relationship.md
│   │   ├── knowledge-governance-relationship.md
│   │   ├── mission.md
│   │   ├── open-questions.md
│   │   ├── philosophy.md
│   │   ├── power.md
│   │   ├── proportionality-and-blast-radius.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── reliability.md
│   │   ├── structural-integrity.md
│   │   ├── tpci-role.md
│   │   ├── trust-evaluation-model.md
│   │   ├── trust-judgement.md
│   │   └── vision.md
│   ├── 09-decisions/
│   │   ├── DEC-0001-constitutional-development-roadmap.md
│   │   ├── DEC-0003-constitutional-volume-boundary-review.md
│   │   ├── DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md
│   │   └── README.md
│   ├── 09-engineering/
│   │   ├── architecture-overview.md
│   │   ├── constitution-before-implementation.md
│   │   ├── constitutional-engineering.md
│   │   ├── constitutional-testing.md
│   │   ├── documentation.md
│   │   ├── engineering-boundaries.md
│   │   ├── engineering-governance.md
│   │   ├── engineering-principles.md
│   │   ├── engineering-traceability.md
│   │   ├── future-engineering.md
│   │   ├── future-vision.md
│   │   ├── human-ai-collaboration.md
│   │   ├── implementation-boundaries.md
│   │   ├── knowledge-before-code.md
│   │   ├── mission.md
│   │   ├── open-questions.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── quality-principles.md
│   │   ├── README.md
│   │   ├── relationships.md
│   │   ├── software-boundaries.md
│   │   ├── traceability.md
│   │   ├── validation.md
│   │   ├── verification.md
│   │   ├── versioning.md
│   │   └── vision.md
│   ├── 10-research/
│   │   └── README.md
│   ├── 10-runtime/
│   │   ├── architecture-overview.md
│   │   ├── constitutional-runtime.md
│   │   ├── future-vision.md
│   │   ├── mission.md
│   │   ├── open-questions.md
│   │   ├── philosophy.md
│   │   ├── purpose.md
│   │   ├── README.md
│   │   ├── relationships.md
│   │   ├── runtime-behaviour.md
│   │   ├── runtime-boundaries.md
│   │   ├── runtime-drift.md
│   │   ├── runtime-evidence.md
│   │   ├── runtime-feedback.md
│   │   ├── runtime-governance.md
│   │   ├── runtime-monitoring.md
│   │   ├── runtime-observation.md
│   │   ├── runtime-principles.md
│   │   ├── runtime-recovery.md
│   │   ├── runtime-reliability.md
│   │   ├── runtime-resilience.md
│   │   ├── runtime-traceability.md
│   │   ├── runtime-validation.md
│   │   ├── runtime-verification.md
│   │   └── vision.md
│   ├── 11-knowledge-assets/
│   │   └── README.md
│   ├── 12-templates/
│   │   ├── architecture-specification-template.md
│   │   ├── constitutional-document-template.md
│   │   ├── decision-record-template.md
│   │   ├── knowledge-asset-template.md
│   │   ├── readme-standards.md
│   │   ├── README.md
│   │   ├── review-report-template.md
│   │   └── sprint-specification-template.md
│   ├── 13-architecture-blueprints/
│   │   ├── README.md
│   │   ├── RKF-TPCI-Architectural-Blueprint-v1.0.md
│   │   └── RKF-TPCI-Architectural-Blueprint-v2.0.md
│   ├── 14-architecture-reviews/
│   │   ├── AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md
│   │   └── README.md
│   ├── 15-gap-analyses/
│   │   ├── GA-0001-Constitutional-Repository-Gap-Analysis.md
│   │   └── README.md
│   ├── 16-writing-specifications/
│   │   ├── CVS-0008-TPCI-Constitutional-Writing-Specification.md
│   │   └── README.md
│   ├── 17-constitutional-reviews/
│   │   ├── AR-0002-Constitutional-Review-of-Volume-8.md
│   │   ├── AR-0003-Constitutional-Review-of-Volume-9.md
│   │   └── README.md
│   ├── 18-system-architecture/
│   │   ├── constitutional-authority-model.md
│   │   ├── constitutional-boundary-model.md
│   │   ├── constitutional-dependency-model.md
│   │   ├── constitutional-domain-map.md
│   │   ├── constitutional-evidence-model.md
│   │   ├── constitutional-evolution-model.md
│   │   ├── constitutional-governance-model.md
│   │   ├── constitutional-information-flow.md
│   │   ├── constitutional-system-architecture-v1.md
│   │   ├── future-system-evolution.md
│   │   └── README.md
│   ├── 19-domain-expansion/
│   │   ├── constitutional-dependency-roadmap.md
│   │   ├── constitutional-domain-catalogue.md
│   │   ├── constitutional-domain-roadmap.md
│   │   ├── constitutional-prioritization.md
│   │   ├── expansion-principles.md
│   │   ├── future-domain-guidelines.md
│   │   ├── integration-strategy.md
│   │   ├── phase-ii-domain-expansion.md
│   │   └── README.md
│   ├── 20-domain-specifications/
│   │   ├── CDS-0001-Privacy-Constitution.md
│   │   └── README.md
│   ├── 21-research-specifications/
│   │   ├── README.md
│   │   └── RS-0001-Privacy-Constitution.md
│   ├── 22-architecture-blueprints/
│   │   ├── BP-0002-Privacy-Constitution-Architecture-v1.md
│   │   └── README.md
│   ├── 23-validation-pilots/
│   │   ├── README.md
│   │   └── VP-0001-Privacy-Constitution.md
│   └── README.md
├── runtime/
│   ├── current-state.md
│   ├── debugging-log.md
│   ├── drift-inventory.md
│   ├── engineering-log.md
│   └── release-readiness.md
├── security/
├── specification/
└── START_HERE.md
```

## 4. Area Inventories

Breakdowns and recursive trees for each top-level area:

### Area: canon

- **Total Folders**: 0
- **Total Files**: 1
- **Maximum Depth**: 1 (Absolute: 2)

```text
docs/canon/
└── README.md
```

### Area: examples

- **Total Folders**: 3
- **Total Files**: 3
- **Maximum Depth**: 2 (Absolute: 3)

```text
docs/examples/
├── akukom/
│   └── README.md
├── bridgenta/
│   └── README.md
└── dicsay/
    └── README.md
```

### Area: framework

- **Total Folders**: 6
- **Total Files**: 27
- **Maximum Depth**: 2 (Absolute: 3)

```text
docs/framework/
├── 18-lessons-learned/
│   ├── LL-0001-Constitutional-Volume-8.md
│   └── README.md
├── artifact-lifecycle/
│   ├── artifact-authority-model.md
│   ├── artifact-catalogue.md
│   ├── artifact-dependency-model.md
│   ├── artifact-lifecycle-flow.md
│   ├── artifact-lifecycle-specification-v1.md
│   ├── artifact-quality-gates.md
│   ├── artifact-validation-model.md
│   ├── artifact-versioning.md
│   ├── future-evolution.md
│   └── README.md
├── constitutional-engineering-methodology-v1.md
├── framework-overview-v1.md
├── methodology/
│   ├── glossary.md
│   ├── lessons-learned.md
│   └── the-loop.md
├── README.md
├── releases/
│   ├── CEF-v1.0-Framework-Release.md
│   └── README.md
├── specification/
│   └── cst-tpci-app-development-specification.md
└── templates/
    ├── boundary-matrix-template.md
    ├── debugging-template.md
    ├── engineering-log-template.md
    ├── ontology-template.md
    ├── security-template.md
    └── vocabulary-template.md
```

### Area: methodology

- **Total Folders**: 0
- **Total Files**: 0
- **Maximum Depth**: 0 (Absolute: 1)

```text
docs/methodology/
```

### Area: project

- **Total Folders**: 30
- **Total Files**: 278
- **Maximum Depth**: 2 (Absolute: 3)

```text
docs/project/
├── 00-constitution/
│   └── README.md
├── 01-rkf/
│   ├── architecture-overview.md
│   ├── audience.md
│   ├── core-pillars.md
│   ├── core-principles.md
│   ├── domains.md
│   ├── future-vision.md
│   ├── governance-philosophy.md
│   ├── mission.md
│   ├── organizational-readiness.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── reference-knowledge.md
│   ├── shared-vocabulary.md
│   └── vision.md
├── 02-curiosity-journey/
│   ├── accessibility-principles.md
│   ├── adaptation-philosophy.md
│   ├── architecture-overview.md
│   ├── confidence-model.md
│   ├── core-principles.md
│   ├── curiosity-philosophy.md
│   ├── future-vision.md
│   ├── human-understanding-model.md
│   ├── learner-discovery.md
│   ├── learning-science.md
│   ├── learning-signals.md
│   ├── mission.md
│   ├── motivation-model.md
│   ├── onboarding-philosophy.md
│   ├── philosophy.md
│   ├── presentation-preferences.md
│   ├── privacy-principles.md
│   ├── purpose.md
│   ├── README.md
│   ├── recommendation-philosophy.md
│   └── vision.md
├── 03-fd-ess/
│   ├── analogy-philosophy.md
│   ├── architecture-overview.md
│   ├── cognitive-load.md
│   ├── core-principles.md
│   ├── explainability-assets.md
│   ├── explainability-boundaries.md
│   ├── explainability-philosophy.md
│   ├── future-vision.md
│   ├── human-centered-communication.md
│   ├── knowledge-transformation.md
│   ├── memory-anchors.md
│   ├── mental-models.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── progressive-disclosure.md
│   ├── purpose.md
│   ├── quality-principles.md
│   ├── README.md
│   ├── storytelling-philosophy.md
│   ├── vision.md
│   └── visual-explainability.md
├── 04-cst/
│   └── README.md
├── 04-knowledge-model/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── explainability-asset.md
│   ├── future-vision.md
│   ├── governance-asset.md
│   ├── knowledge-asset.md
│   ├── knowledge-governance.md
│   ├── knowledge-lifecycle.md
│   ├── knowledge-object.md
│   ├── knowledge-provenance.md
│   ├── knowledge-quality.md
│   ├── knowledge-traceability.md
│   ├── learning-asset.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationship-model.md
│   ├── vision.md
│   └── vocabulary-asset.md
├── 05-knowledge-governance/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── future-vision.md
│   ├── governance-boundaries.md
│   ├── knowledge-approval.md
│   ├── knowledge-authority.md
│   ├── knowledge-evolution.md
│   ├── knowledge-lifecycle.md
│   ├── knowledge-ownership.md
│   ├── knowledge-provenance.md
│   ├── knowledge-quality.md
│   ├── knowledge-retirement.md
│   ├── knowledge-review.md
│   ├── knowledge-stewardship.md
│   ├── knowledge-traceability.md
│   ├── knowledge-validation.md
│   ├── knowledge-versioning.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   └── vision.md
├── 05-tpci/
│   └── README.md
├── 06-knowledge-graph/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── future-vision.md
│   ├── graph-boundaries.md
│   ├── graph-consistency.md
│   ├── graph-evolution.md
│   ├── graph-governance.md
│   ├── graph-integrity.md
│   ├── graph-philosophy.md
│   ├── graph-quality.md
│   ├── knowledge-context.md
│   ├── knowledge-navigation.md
│   ├── knowledge-paths.md
│   ├── mission.md
│   ├── node-philosophy.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationship-philosophy.md
│   ├── representation-principles.md
│   └── vision.md
├── 07-cst/
│   ├── architecture-overview.md
│   ├── boundary-validation.md
│   ├── constitutional-consistency.md
│   ├── constitutional-drift.md
│   ├── constitutional-health.md
│   ├── constitutional-integrity.md
│   ├── constitutional-observability.md
│   ├── core-principles.md
│   ├── dependency-validation.md
│   ├── future-vision.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── responsibility-validation.md
│   ├── structural-coherence.md
│   ├── system-thinking.md
│   ├── validation-boundaries.md
│   ├── validation-philosophy.md
│   └── vision.md
├── 07-engineering/
│   └── README.md
├── 08-roadmap/
│   └── README.md
├── 08-tpci/
│   ├── architecture-overview.md
│   ├── behaviour.md
│   ├── behavioural-integrity.md
│   ├── constitutional-boundaries.md
│   ├── constitutional-trust.md
│   ├── control.md
│   ├── core-principles.md
│   ├── cst-relationship.md
│   ├── evidence.md
│   ├── feedback-and-revalidation.md
│   ├── future-vision.md
│   ├── governance-relationship.md
│   ├── knowledge-governance-relationship.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── power.md
│   ├── proportionality-and-blast-radius.md
│   ├── purpose.md
│   ├── README.md
│   ├── reliability.md
│   ├── structural-integrity.md
│   ├── tpci-role.md
│   ├── trust-evaluation-model.md
│   ├── trust-judgement.md
│   └── vision.md
├── 09-decisions/
│   ├── DEC-0001-constitutional-development-roadmap.md
│   ├── DEC-0003-constitutional-volume-boundary-review.md
│   ├── DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md
│   └── README.md
├── 09-engineering/
│   ├── architecture-overview.md
│   ├── constitution-before-implementation.md
│   ├── constitutional-engineering.md
│   ├── constitutional-testing.md
│   ├── documentation.md
│   ├── engineering-boundaries.md
│   ├── engineering-governance.md
│   ├── engineering-principles.md
│   ├── engineering-traceability.md
│   ├── future-engineering.md
│   ├── future-vision.md
│   ├── human-ai-collaboration.md
│   ├── implementation-boundaries.md
│   ├── knowledge-before-code.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── quality-principles.md
│   ├── README.md
│   ├── relationships.md
│   ├── software-boundaries.md
│   ├── traceability.md
│   ├── validation.md
│   ├── verification.md
│   ├── versioning.md
│   └── vision.md
├── 10-research/
│   └── README.md
├── 10-runtime/
│   ├── architecture-overview.md
│   ├── constitutional-runtime.md
│   ├── future-vision.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationships.md
│   ├── runtime-behaviour.md
│   ├── runtime-boundaries.md
│   ├── runtime-drift.md
│   ├── runtime-evidence.md
│   ├── runtime-feedback.md
│   ├── runtime-governance.md
│   ├── runtime-monitoring.md
│   ├── runtime-observation.md
│   ├── runtime-principles.md
│   ├── runtime-recovery.md
│   ├── runtime-reliability.md
│   ├── runtime-resilience.md
│   ├── runtime-traceability.md
│   ├── runtime-validation.md
│   ├── runtime-verification.md
│   └── vision.md
├── 11-knowledge-assets/
│   └── README.md
├── 12-templates/
│   ├── architecture-specification-template.md
│   ├── constitutional-document-template.md
│   ├── decision-record-template.md
│   ├── knowledge-asset-template.md
│   ├── readme-standards.md
│   ├── README.md
│   ├── review-report-template.md
│   └── sprint-specification-template.md
├── 13-architecture-blueprints/
│   ├── README.md
│   ├── RKF-TPCI-Architectural-Blueprint-v1.0.md
│   └── RKF-TPCI-Architectural-Blueprint-v2.0.md
├── 14-architecture-reviews/
│   ├── AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md
│   └── README.md
├── 15-gap-analyses/
│   ├── GA-0001-Constitutional-Repository-Gap-Analysis.md
│   └── README.md
├── 16-writing-specifications/
│   ├── CVS-0008-TPCI-Constitutional-Writing-Specification.md
│   └── README.md
├── 17-constitutional-reviews/
│   ├── AR-0002-Constitutional-Review-of-Volume-8.md
│   ├── AR-0003-Constitutional-Review-of-Volume-9.md
│   └── README.md
├── 18-system-architecture/
│   ├── constitutional-authority-model.md
│   ├── constitutional-boundary-model.md
│   ├── constitutional-dependency-model.md
│   ├── constitutional-domain-map.md
│   ├── constitutional-evidence-model.md
│   ├── constitutional-evolution-model.md
│   ├── constitutional-governance-model.md
│   ├── constitutional-information-flow.md
│   ├── constitutional-system-architecture-v1.md
│   ├── future-system-evolution.md
│   └── README.md
├── 19-domain-expansion/
│   ├── constitutional-dependency-roadmap.md
│   ├── constitutional-domain-catalogue.md
│   ├── constitutional-domain-roadmap.md
│   ├── constitutional-prioritization.md
│   ├── expansion-principles.md
│   ├── future-domain-guidelines.md
│   ├── integration-strategy.md
│   ├── phase-ii-domain-expansion.md
│   └── README.md
├── 20-domain-specifications/
│   ├── CDS-0001-Privacy-Constitution.md
│   └── README.md
├── 21-research-specifications/
│   ├── README.md
│   └── RS-0001-Privacy-Constitution.md
├── 22-architecture-blueprints/
│   ├── BP-0002-Privacy-Constitution-Architecture-v1.md
│   └── README.md
├── 23-validation-pilots/
│   ├── README.md
│   └── VP-0001-Privacy-Constitution.md
└── README.md
```

### Area: runtime

- **Total Folders**: 0
- **Total Files**: 5
- **Maximum Depth**: 1 (Absolute: 2)

```text
docs/runtime/
├── current-state.md
├── debugging-log.md
├── drift-inventory.md
├── engineering-log.md
└── release-readiness.md
```

### Area: security

- **Total Folders**: 0
- **Total Files**: 0
- **Maximum Depth**: 0 (Absolute: 1)

```text
docs/security/
```

### Area: specification

- **Total Folders**: 0
- **Total Files**: 0
- **Maximum Depth**: 0 (Absolute: 1)

```text
docs/specification/
```

## 5. Project Directory Inventory

The `project/` directory represents the largest portion of the RKF repository containing constitutional volumes, architecture blueprints, reviews, and specification materials.

### Direct Subdirectories of project/

| Folder Name | Relative Path | Recursive Folders | Recursive Files | Maximum Depth |
|-------------|---------------|-------------------|-----------------|---------------|
| [00-constitution](docs/project/00-constitution) | `docs/project/00-constitution` | 0 | 1 | 1 (Absolute: 3) |
| [01-rkf](docs/project/01-rkf) | `docs/project/01-rkf` | 0 | 15 | 1 (Absolute: 3) |
| [02-curiosity-journey](docs/project/02-curiosity-journey) | `docs/project/02-curiosity-journey` | 0 | 21 | 1 (Absolute: 3) |
| [03-fd-ess](docs/project/03-fd-ess) | `docs/project/03-fd-ess` | 0 | 21 | 1 (Absolute: 3) |
| [04-cst](docs/project/04-cst) | `docs/project/04-cst` | 0 | 1 | 1 (Absolute: 3) |
| [04-knowledge-model](docs/project/04-knowledge-model) | `docs/project/04-knowledge-model` | 0 | 20 | 1 (Absolute: 3) |
| [05-knowledge-governance](docs/project/05-knowledge-governance) | `docs/project/05-knowledge-governance` | 0 | 22 | 1 (Absolute: 3) |
| [05-tpci](docs/project/05-tpci) | `docs/project/05-tpci` | 0 | 1 | 1 (Absolute: 3) |
| [06-knowledge-graph](docs/project/06-knowledge-graph) | `docs/project/06-knowledge-graph` | 0 | 21 | 1 (Absolute: 3) |
| [07-cst](docs/project/07-cst) | `docs/project/07-cst` | 0 | 20 | 1 (Absolute: 3) |
| [07-engineering](docs/project/07-engineering) | `docs/project/07-engineering` | 0 | 1 | 1 (Absolute: 3) |
| [08-roadmap](docs/project/08-roadmap) | `docs/project/08-roadmap` | 0 | 1 | 1 (Absolute: 3) |
| [08-tpci](docs/project/08-tpci) | `docs/project/08-tpci` | 0 | 26 | 1 (Absolute: 3) |
| [09-decisions](docs/project/09-decisions) | `docs/project/09-decisions` | 0 | 4 | 1 (Absolute: 3) |
| [09-engineering](docs/project/09-engineering) | `docs/project/09-engineering` | 0 | 27 | 1 (Absolute: 3) |
| [10-research](docs/project/10-research) | `docs/project/10-research` | 0 | 1 | 1 (Absolute: 3) |
| [10-runtime](docs/project/10-runtime) | `docs/project/10-runtime` | 0 | 25 | 1 (Absolute: 3) |
| [11-knowledge-assets](docs/project/11-knowledge-assets) | `docs/project/11-knowledge-assets` | 0 | 1 | 1 (Absolute: 3) |
| [12-templates](docs/project/12-templates) | `docs/project/12-templates` | 0 | 8 | 1 (Absolute: 3) |
| [13-architecture-blueprints](docs/project/13-architecture-blueprints) | `docs/project/13-architecture-blueprints` | 0 | 3 | 1 (Absolute: 3) |
| [14-architecture-reviews](docs/project/14-architecture-reviews) | `docs/project/14-architecture-reviews` | 0 | 2 | 1 (Absolute: 3) |
| [15-gap-analyses](docs/project/15-gap-analyses) | `docs/project/15-gap-analyses` | 0 | 2 | 1 (Absolute: 3) |
| [16-writing-specifications](docs/project/16-writing-specifications) | `docs/project/16-writing-specifications` | 0 | 2 | 1 (Absolute: 3) |
| [17-constitutional-reviews](docs/project/17-constitutional-reviews) | `docs/project/17-constitutional-reviews` | 0 | 3 | 1 (Absolute: 3) |
| [18-system-architecture](docs/project/18-system-architecture) | `docs/project/18-system-architecture` | 0 | 11 | 1 (Absolute: 3) |
| [19-domain-expansion](docs/project/19-domain-expansion) | `docs/project/19-domain-expansion` | 0 | 9 | 1 (Absolute: 3) |
| [20-domain-specifications](docs/project/20-domain-specifications) | `docs/project/20-domain-specifications` | 0 | 2 | 1 (Absolute: 3) |
| [21-research-specifications](docs/project/21-research-specifications) | `docs/project/21-research-specifications` | 0 | 2 | 1 (Absolute: 3) |
| [22-architecture-blueprints](docs/project/22-architecture-blueprints) | `docs/project/22-architecture-blueprints` | 0 | 2 | 1 (Absolute: 3) |
| [23-validation-pilots](docs/project/23-validation-pilots) | `docs/project/23-validation-pilots` | 0 | 2 | 1 (Absolute: 3) |

### Complete project/ Recursive Tree

```text
docs/project/
├── 00-constitution/
│   └── README.md
├── 01-rkf/
│   ├── architecture-overview.md
│   ├── audience.md
│   ├── core-pillars.md
│   ├── core-principles.md
│   ├── domains.md
│   ├── future-vision.md
│   ├── governance-philosophy.md
│   ├── mission.md
│   ├── organizational-readiness.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── reference-knowledge.md
│   ├── shared-vocabulary.md
│   └── vision.md
├── 02-curiosity-journey/
│   ├── accessibility-principles.md
│   ├── adaptation-philosophy.md
│   ├── architecture-overview.md
│   ├── confidence-model.md
│   ├── core-principles.md
│   ├── curiosity-philosophy.md
│   ├── future-vision.md
│   ├── human-understanding-model.md
│   ├── learner-discovery.md
│   ├── learning-science.md
│   ├── learning-signals.md
│   ├── mission.md
│   ├── motivation-model.md
│   ├── onboarding-philosophy.md
│   ├── philosophy.md
│   ├── presentation-preferences.md
│   ├── privacy-principles.md
│   ├── purpose.md
│   ├── README.md
│   ├── recommendation-philosophy.md
│   └── vision.md
├── 03-fd-ess/
│   ├── analogy-philosophy.md
│   ├── architecture-overview.md
│   ├── cognitive-load.md
│   ├── core-principles.md
│   ├── explainability-assets.md
│   ├── explainability-boundaries.md
│   ├── explainability-philosophy.md
│   ├── future-vision.md
│   ├── human-centered-communication.md
│   ├── knowledge-transformation.md
│   ├── memory-anchors.md
│   ├── mental-models.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── progressive-disclosure.md
│   ├── purpose.md
│   ├── quality-principles.md
│   ├── README.md
│   ├── storytelling-philosophy.md
│   ├── vision.md
│   └── visual-explainability.md
├── 04-cst/
│   └── README.md
├── 04-knowledge-model/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── explainability-asset.md
│   ├── future-vision.md
│   ├── governance-asset.md
│   ├── knowledge-asset.md
│   ├── knowledge-governance.md
│   ├── knowledge-lifecycle.md
│   ├── knowledge-object.md
│   ├── knowledge-provenance.md
│   ├── knowledge-quality.md
│   ├── knowledge-traceability.md
│   ├── learning-asset.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationship-model.md
│   ├── vision.md
│   └── vocabulary-asset.md
├── 05-knowledge-governance/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── future-vision.md
│   ├── governance-boundaries.md
│   ├── knowledge-approval.md
│   ├── knowledge-authority.md
│   ├── knowledge-evolution.md
│   ├── knowledge-lifecycle.md
│   ├── knowledge-ownership.md
│   ├── knowledge-provenance.md
│   ├── knowledge-quality.md
│   ├── knowledge-retirement.md
│   ├── knowledge-review.md
│   ├── knowledge-stewardship.md
│   ├── knowledge-traceability.md
│   ├── knowledge-validation.md
│   ├── knowledge-versioning.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   └── vision.md
├── 05-tpci/
│   └── README.md
├── 06-knowledge-graph/
│   ├── architecture-overview.md
│   ├── core-principles.md
│   ├── future-vision.md
│   ├── graph-boundaries.md
│   ├── graph-consistency.md
│   ├── graph-evolution.md
│   ├── graph-governance.md
│   ├── graph-integrity.md
│   ├── graph-philosophy.md
│   ├── graph-quality.md
│   ├── knowledge-context.md
│   ├── knowledge-navigation.md
│   ├── knowledge-paths.md
│   ├── mission.md
│   ├── node-philosophy.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationship-philosophy.md
│   ├── representation-principles.md
│   └── vision.md
├── 07-cst/
│   ├── architecture-overview.md
│   ├── boundary-validation.md
│   ├── constitutional-consistency.md
│   ├── constitutional-drift.md
│   ├── constitutional-health.md
│   ├── constitutional-integrity.md
│   ├── constitutional-observability.md
│   ├── core-principles.md
│   ├── dependency-validation.md
│   ├── future-vision.md
│   ├── mission.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── responsibility-validation.md
│   ├── structural-coherence.md
│   ├── system-thinking.md
│   ├── validation-boundaries.md
│   ├── validation-philosophy.md
│   └── vision.md
├── 07-engineering/
│   └── README.md
├── 08-roadmap/
│   └── README.md
├── 08-tpci/
│   ├── architecture-overview.md
│   ├── behaviour.md
│   ├── behavioural-integrity.md
│   ├── constitutional-boundaries.md
│   ├── constitutional-trust.md
│   ├── control.md
│   ├── core-principles.md
│   ├── cst-relationship.md
│   ├── evidence.md
│   ├── feedback-and-revalidation.md
│   ├── future-vision.md
│   ├── governance-relationship.md
│   ├── knowledge-governance-relationship.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── power.md
│   ├── proportionality-and-blast-radius.md
│   ├── purpose.md
│   ├── README.md
│   ├── reliability.md
│   ├── structural-integrity.md
│   ├── tpci-role.md
│   ├── trust-evaluation-model.md
│   ├── trust-judgement.md
│   └── vision.md
├── 09-decisions/
│   ├── DEC-0001-constitutional-development-roadmap.md
│   ├── DEC-0003-constitutional-volume-boundary-review.md
│   ├── DEC-0004-Adopt-TPCI-Blueprint-v2.0-as-Constitutional-Foundation.md
│   └── README.md
├── 09-engineering/
│   ├── architecture-overview.md
│   ├── constitution-before-implementation.md
│   ├── constitutional-engineering.md
│   ├── constitutional-testing.md
│   ├── documentation.md
│   ├── engineering-boundaries.md
│   ├── engineering-governance.md
│   ├── engineering-principles.md
│   ├── engineering-traceability.md
│   ├── future-engineering.md
│   ├── future-vision.md
│   ├── human-ai-collaboration.md
│   ├── implementation-boundaries.md
│   ├── knowledge-before-code.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── quality-principles.md
│   ├── README.md
│   ├── relationships.md
│   ├── software-boundaries.md
│   ├── traceability.md
│   ├── validation.md
│   ├── verification.md
│   ├── versioning.md
│   └── vision.md
├── 10-research/
│   └── README.md
├── 10-runtime/
│   ├── architecture-overview.md
│   ├── constitutional-runtime.md
│   ├── future-vision.md
│   ├── mission.md
│   ├── open-questions.md
│   ├── philosophy.md
│   ├── purpose.md
│   ├── README.md
│   ├── relationships.md
│   ├── runtime-behaviour.md
│   ├── runtime-boundaries.md
│   ├── runtime-drift.md
│   ├── runtime-evidence.md
│   ├── runtime-feedback.md
│   ├── runtime-governance.md
│   ├── runtime-monitoring.md
│   ├── runtime-observation.md
│   ├── runtime-principles.md
│   ├── runtime-recovery.md
│   ├── runtime-reliability.md
│   ├── runtime-resilience.md
│   ├── runtime-traceability.md
│   ├── runtime-validation.md
│   ├── runtime-verification.md
│   └── vision.md
├── 11-knowledge-assets/
│   └── README.md
├── 12-templates/
│   ├── architecture-specification-template.md
│   ├── constitutional-document-template.md
│   ├── decision-record-template.md
│   ├── knowledge-asset-template.md
│   ├── readme-standards.md
│   ├── README.md
│   ├── review-report-template.md
│   └── sprint-specification-template.md
├── 13-architecture-blueprints/
│   ├── README.md
│   ├── RKF-TPCI-Architectural-Blueprint-v1.0.md
│   └── RKF-TPCI-Architectural-Blueprint-v2.0.md
├── 14-architecture-reviews/
│   ├── AR-0001-TPCI-Blueprint-v2.0-Constitutional-Readiness-Review.md
│   └── README.md
├── 15-gap-analyses/
│   ├── GA-0001-Constitutional-Repository-Gap-Analysis.md
│   └── README.md
├── 16-writing-specifications/
│   ├── CVS-0008-TPCI-Constitutional-Writing-Specification.md
│   └── README.md
├── 17-constitutional-reviews/
│   ├── AR-0002-Constitutional-Review-of-Volume-8.md
│   ├── AR-0003-Constitutional-Review-of-Volume-9.md
│   └── README.md
├── 18-system-architecture/
│   ├── constitutional-authority-model.md
│   ├── constitutional-boundary-model.md
│   ├── constitutional-dependency-model.md
│   ├── constitutional-domain-map.md
│   ├── constitutional-evidence-model.md
│   ├── constitutional-evolution-model.md
│   ├── constitutional-governance-model.md
│   ├── constitutional-information-flow.md
│   ├── constitutional-system-architecture-v1.md
│   ├── future-system-evolution.md
│   └── README.md
├── 19-domain-expansion/
│   ├── constitutional-dependency-roadmap.md
│   ├── constitutional-domain-catalogue.md
│   ├── constitutional-domain-roadmap.md
│   ├── constitutional-prioritization.md
│   ├── expansion-principles.md
│   ├── future-domain-guidelines.md
│   ├── integration-strategy.md
│   ├── phase-ii-domain-expansion.md
│   └── README.md
├── 20-domain-specifications/
│   ├── CDS-0001-Privacy-Constitution.md
│   └── README.md
├── 21-research-specifications/
│   ├── README.md
│   └── RS-0001-Privacy-Constitution.md
├── 22-architecture-blueprints/
│   ├── BP-0002-Privacy-Constitution-Architecture-v1.md
│   └── README.md
├── 23-validation-pilots/
│   ├── README.md
│   └── VP-0001-Privacy-Constitution.md
└── README.md
```

## 6. File Extension Inventory

All files discovered within the snapshot grouped by extension:

| Extension | Number of Files | Representative Locations |
|-----------|-----------------|--------------------------|
| .md | 315 | `docs/START_HERE.md` <br> `docs/canon/README.md` <br> `docs/project/00-constitution/README.md` |

## 7. Duplicate Filename Register

Duplicate filenames detected within the snapshot (directories are ignored, content is not compared):

| Filename | Occurrence Count | Locations |
|----------|------------------|-----------|
| README.md | 39 | `docs/canon/README.md`<br>`docs/examples/akukom/README.md`<br>`docs/examples/bridgenta/README.md`<br>`docs/examples/dicsay/README.md`<br>`docs/framework/18-lessons-learned/README.md`<br>`docs/framework/artifact-lifecycle/README.md`<br>`docs/framework/README.md`<br>`docs/framework/releases/README.md`<br>`docs/project/00-constitution/README.md`<br>`docs/project/01-rkf/README.md`<br>`docs/project/02-curiosity-journey/README.md`<br>`docs/project/03-fd-ess/README.md`<br>`docs/project/04-cst/README.md`<br>`docs/project/04-knowledge-model/README.md`<br>`docs/project/05-knowledge-governance/README.md`<br>`docs/project/05-tpci/README.md`<br>`docs/project/06-knowledge-graph/README.md`<br>`docs/project/07-cst/README.md`<br>`docs/project/07-engineering/README.md`<br>`docs/project/08-roadmap/README.md`<br>`docs/project/08-tpci/README.md`<br>`docs/project/09-decisions/README.md`<br>`docs/project/09-engineering/README.md`<br>`docs/project/10-research/README.md`<br>`docs/project/10-runtime/README.md`<br>`docs/project/11-knowledge-assets/README.md`<br>`docs/project/12-templates/README.md`<br>`docs/project/13-architecture-blueprints/README.md`<br>`docs/project/14-architecture-reviews/README.md`<br>`docs/project/15-gap-analyses/README.md`<br>`docs/project/16-writing-specifications/README.md`<br>`docs/project/17-constitutional-reviews/README.md`<br>`docs/project/18-system-architecture/README.md`<br>`docs/project/19-domain-expansion/README.md`<br>`docs/project/20-domain-specifications/README.md`<br>`docs/project/21-research-specifications/README.md`<br>`docs/project/22-architecture-blueprints/README.md`<br>`docs/project/23-validation-pilots/README.md`<br>`docs/project/README.md` |
| architecture-overview.md | 10 | `docs/project/01-rkf/architecture-overview.md`<br>`docs/project/02-curiosity-journey/architecture-overview.md`<br>`docs/project/03-fd-ess/architecture-overview.md`<br>`docs/project/04-knowledge-model/architecture-overview.md`<br>`docs/project/05-knowledge-governance/architecture-overview.md`<br>`docs/project/06-knowledge-graph/architecture-overview.md`<br>`docs/project/07-cst/architecture-overview.md`<br>`docs/project/08-tpci/architecture-overview.md`<br>`docs/project/09-engineering/architecture-overview.md`<br>`docs/project/10-runtime/architecture-overview.md` |
| core-principles.md | 8 | `docs/project/01-rkf/core-principles.md`<br>`docs/project/02-curiosity-journey/core-principles.md`<br>`docs/project/03-fd-ess/core-principles.md`<br>`docs/project/04-knowledge-model/core-principles.md`<br>`docs/project/05-knowledge-governance/core-principles.md`<br>`docs/project/06-knowledge-graph/core-principles.md`<br>`docs/project/07-cst/core-principles.md`<br>`docs/project/08-tpci/core-principles.md` |
| future-vision.md | 10 | `docs/project/01-rkf/future-vision.md`<br>`docs/project/02-curiosity-journey/future-vision.md`<br>`docs/project/03-fd-ess/future-vision.md`<br>`docs/project/04-knowledge-model/future-vision.md`<br>`docs/project/05-knowledge-governance/future-vision.md`<br>`docs/project/06-knowledge-graph/future-vision.md`<br>`docs/project/07-cst/future-vision.md`<br>`docs/project/08-tpci/future-vision.md`<br>`docs/project/09-engineering/future-vision.md`<br>`docs/project/10-runtime/future-vision.md` |
| mission.md | 10 | `docs/project/01-rkf/mission.md`<br>`docs/project/02-curiosity-journey/mission.md`<br>`docs/project/03-fd-ess/mission.md`<br>`docs/project/04-knowledge-model/mission.md`<br>`docs/project/05-knowledge-governance/mission.md`<br>`docs/project/06-knowledge-graph/mission.md`<br>`docs/project/07-cst/mission.md`<br>`docs/project/08-tpci/mission.md`<br>`docs/project/09-engineering/mission.md`<br>`docs/project/10-runtime/mission.md` |
| philosophy.md | 10 | `docs/project/01-rkf/philosophy.md`<br>`docs/project/02-curiosity-journey/philosophy.md`<br>`docs/project/03-fd-ess/philosophy.md`<br>`docs/project/04-knowledge-model/philosophy.md`<br>`docs/project/05-knowledge-governance/philosophy.md`<br>`docs/project/06-knowledge-graph/philosophy.md`<br>`docs/project/07-cst/philosophy.md`<br>`docs/project/08-tpci/philosophy.md`<br>`docs/project/09-engineering/philosophy.md`<br>`docs/project/10-runtime/philosophy.md` |
| purpose.md | 10 | `docs/project/01-rkf/purpose.md`<br>`docs/project/02-curiosity-journey/purpose.md`<br>`docs/project/03-fd-ess/purpose.md`<br>`docs/project/04-knowledge-model/purpose.md`<br>`docs/project/05-knowledge-governance/purpose.md`<br>`docs/project/06-knowledge-graph/purpose.md`<br>`docs/project/07-cst/purpose.md`<br>`docs/project/08-tpci/purpose.md`<br>`docs/project/09-engineering/purpose.md`<br>`docs/project/10-runtime/purpose.md` |
| vision.md | 10 | `docs/project/01-rkf/vision.md`<br>`docs/project/02-curiosity-journey/vision.md`<br>`docs/project/03-fd-ess/vision.md`<br>`docs/project/04-knowledge-model/vision.md`<br>`docs/project/05-knowledge-governance/vision.md`<br>`docs/project/06-knowledge-graph/vision.md`<br>`docs/project/07-cst/vision.md`<br>`docs/project/08-tpci/vision.md`<br>`docs/project/09-engineering/vision.md`<br>`docs/project/10-runtime/vision.md` |
| quality-principles.md | 2 | `docs/project/03-fd-ess/quality-principles.md`<br>`docs/project/09-engineering/quality-principles.md` |
| knowledge-lifecycle.md | 2 | `docs/project/04-knowledge-model/knowledge-lifecycle.md`<br>`docs/project/05-knowledge-governance/knowledge-lifecycle.md` |
| knowledge-provenance.md | 2 | `docs/project/04-knowledge-model/knowledge-provenance.md`<br>`docs/project/05-knowledge-governance/knowledge-provenance.md` |
| knowledge-quality.md | 2 | `docs/project/04-knowledge-model/knowledge-quality.md`<br>`docs/project/05-knowledge-governance/knowledge-quality.md` |
| knowledge-traceability.md | 2 | `docs/project/04-knowledge-model/knowledge-traceability.md`<br>`docs/project/05-knowledge-governance/knowledge-traceability.md` |
| open-questions.md | 3 | `docs/project/08-tpci/open-questions.md`<br>`docs/project/09-engineering/open-questions.md`<br>`docs/project/10-runtime/open-questions.md` |
| relationships.md | 2 | `docs/project/09-engineering/relationships.md`<br>`docs/project/10-runtime/relationships.md` |

## 8. Empty Directory Register

Empty directories discovered within the snapshot:

| Directory | Relative Path |
|-----------|---------------|
| [docs/methodology](docs/methodology) | `docs/methodology` |
| [docs/security](docs/security) | `docs/security` |
| [docs/specification](docs/specification) | `docs/specification` |

## 9. Hidden Files

No hidden files or hidden directory entries (e.g. `.gitkeep`, `.DS_Store`) were found in the snapshot.

## 10. Large Directory Ranking

The top 10 directories in the snapshot ranked by total recursive contents (subfolders + files):

| Rank | Directory | Recursive Folders | Recursive Files | Total Items |
|------|-----------|-------------------|-----------------|-------------|
| 1 | [docs/project](docs/project) | 30 | 278 | 308 |
| 2 | [docs/framework](docs/framework) | 6 | 27 | 33 |
| 3 | [docs/project/09-engineering](docs/project/09-engineering) | 0 | 27 | 27 |
| 4 | [docs/project/08-tpci](docs/project/08-tpci) | 0 | 26 | 26 |
| 5 | [docs/project/10-runtime](docs/project/10-runtime) | 0 | 25 | 25 |
| 6 | [docs/project/05-knowledge-governance](docs/project/05-knowledge-governance) | 0 | 22 | 22 |
| 7 | [docs/project/02-curiosity-journey](docs/project/02-curiosity-journey) | 0 | 21 | 21 |
| 8 | [docs/project/03-fd-ess](docs/project/03-fd-ess) | 0 | 21 | 21 |
| 9 | [docs/project/06-knowledge-graph](docs/project/06-knowledge-graph) | 0 | 21 | 21 |
| 10 | [docs/project/04-knowledge-model](docs/project/04-knowledge-model) | 0 | 20 | 20 |

## 11. Inventory Completeness

I confirm that:
- Every directory in the `docs/` snapshot was recursively scanned.
- Every file in the `docs/` snapshot was recursively scanned.
- No files or folders were intentionally omitted.
- The inventory represents a complete structural snapshot of the RKF documentation.
