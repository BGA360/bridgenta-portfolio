# RKF Dependency & Authority Map

An authoritative guide detailing the relationship model, authority flow, and dependency map of the Reference Knowledge Framework (RKF) repository.

## 1. Mapping Philosophy

To engineer a robust integration of RKF into BECC v2.0, we must formally map the relationship structures governing how knowledge is defined and updated.

### Dependency vs. Authority
- **Dependency** defines which documents must be parsed and loaded to interpret a rule (e.g. Volume 8 depends on Volume 7). It is a logical and semantic requirement.
- **Authority** defines which documents override others in cases of conflict (e.g. Constitutional Volumes override Blueprints; Examples carry zero authority). It establishes systemic truth levels.

### Authority vs. Navigation
- **Authority** represents the level of rule enforcement.
- **Navigation** represents the path sequence a contributor or AI takes to find a rule (e.g. starting at `docs/START_HERE.md` before reading a volume). High navigation visibility does not mean high authority.

### Dependency vs. Knowledge Flow
- **Dependency** is structural and static (linking two completed volumes).
- **Knowledge Flow** is process-oriented and dynamic (describing how an idea matures through the repository lifecycle from Research to Runtime).

### Evidence vs. Governance
- **Evidence** flows *upward* from operational observers into audits, reviews, and decisions to update volumes.
- **Governance** flows *downward*, establishing approval protocols, stewardship ownership, and compliance checks.

## 2. Authority Graph

Constitutional authority determines which files establish enduring truth. 

- **Authority Owner**: Canon (`canon/`) and Constitutional Volumes (`project/00-` to `project/10-`).
- **Authority Consumers**: Specifications, implementation code, and runtime operations.
- **Authority Boundaries**: Architecture Blueprints, Architecture Reviews, Gap Analyses, and Examples have **zero constitutional authority**.
- **Authority Inheritance**: Derived downward from Canon to the Constitution, down to individual volumes, and finally to domain specifications.
- **Authority Termination**: Terminates at code execution, raw research notes, and examples.

### ASCII Authority Graph

```text
         [Canon] (Durable Framework Law)
            │
            ▼
   [Constitutional Volumes] (Volumes 00 to 10)
            │
      ┌─────┴──────────────────────────────────┐
      ▼                                        ▼
 [Engineering Specs] (CDS)             [Runtime Governance]
      │                                        │
      ▼                                        ▼
[Implementation Code]                   [Runtime Operations]
      │                                        │
      ▼                                        ▼
[Examples] (0 Authority)               [Runtime Evidence] (0 Authority)
```

## 3. Dependency Graph

Dependencies dictate the loading and compilation order of RKF knowledge domains. A higher volume depends on lower foundation volumes.

- **Producer**: The source of validation parameters (e.g. Volume 4 defines Knowledge Objects).
- **Consumer**: The domain utilizing those parameters (e.g. Volume 6 uses Knowledge Objects to build a Graph).
- **Dependency Direction**: Strictly acyclic, flowing upward from Vol 00/01.
- **Dependency Strength**: Strong. A failure to load a dependency invalidates the consuming volume.

### ASCII Dependency Graph

```text
   [Canon] ◄── [Vol 00] ◄── [Vol 01] ◄── [Vol 02] ◄── [Vol 03] (FD-ESS)
                               │
                               ├────── [Vol 04] (Knowledge Model)
                               │          ▲    ▲
                               │          │    ├──────────────────┐
                               ├────── [Vol 05] (Governance)      │
                               │          ▲                       │
                               │          ├──────────────┐        │
                               └────── [Vol 07] (CST)    │        │
                                          ▲              │        │
                                          ├──────────────┼────────┼──────┐
                                       [Vol 08] (TPCI) ◄─┘        │      │
                                          ▲                       │      │
                                       [Vol 09] (Engineering) ◄───┘      │
                                          ▲                              │
                                       [Vol 10] (Runtime) ◄──────────────┘
```

## 4. Knowledge Flow

Knowledge Flow describes how raw architectural ideas evolve into permanent constitutional rules. This follows the official RKF documentation lifecycle:

```text
     [Research] (Gathers observations & references)
         │
         ▼
[Architecture Blueprint] (Proposes design models)
         │
         ▼
  [Architecture Review] (Checks design maturity)
         │
         ▼
   [Gap Analysis] (Audits repository compliance)
         │
         ▼
  [Decision Record] (Approves and logs design decisions)
         │
         ▼
[Constitutional Volume] (Establishes enduring rule)
         │
         ▼
 [Engineering Spec] (Creates technical contract)
         │
         ▼
[Implementation Code] (Software execution)
         │
         ▼
 [Runtime Evidence] (Produces log telemetry)
```

## 5. Evidence Flow

Evidence Flow represents the feedback loop: how runtime operational state and audit observations influence and update the constitutional volumes:

```text
  [Runtime Operations] ──► [Runtime Evidence] (Logs & current state)
                                  │
                                  ▼
                           [Gap Analysis] (Audits compliance gaps)
                                  │
                                  ▼
                           [Constitutional Review] (Evaluates rule drift)
                                  │
                                  ▼
                           [Decision Record] (Amends rules & authorizes changes)
                                  │
                                  ▼
                           [Constitutional Volume] (Updated active rules)
```

## 6. Governance Flow

Governance propagates authority and compliance throughout the repository.

- **Approval Authority**: Governed by **Decision Records**. Only approved Decision Records (signed off by the Project Owner) can authorize creation or updates of Constitutional Volumes.
- **Stewardship**: Held by the **Framework Maintainers**. Responsible for templates, directories, and repository validation scripts.
- **Review Authority**: Held by **Independent Constitutional Reviewers**. Checklists in Reviews evaluate volume compliance.
- **Implementation Authority**: Held by **AI Builders / Human Developers**. Must construct software according to specifications without inventing rules.

## 7. Relationship Matrix

Table of key repository relationships and dependencies:

| Source Artifact | Target Artifact | Relationship Type | Direction | Evidence | Confidence |
|-----------------|-----------------|-------------------|-----------|----------|------------|
| `project/01-rkf` | `project/00-constitution` | Dependency | Bi-directional | Volumes define identity based on constitution. | High |
| `project/02-curiosity-journey` | `project/01-rkf` | Dependency | Inward | CJ Engine relies on baseline RKF frameworks. | High |
| `project/03-fd-ess` | `project/02-curiosity-journey` | Dependency | Inward | Explainability engine depends on learning science. | High |
| `project/04-knowledge-model` | `project/01-rkf` | Dependency | Inward | Knowledge objects derive from framework rules. | High |
| `project/05-knowledge-governance` | `project/04-knowledge-model` | Dependency | Inward | Governance rules apply to knowledge assets. | High |
| `project/06-knowledge-graph` | `project/04-knowledge-model` | Dependency | Inward | Graph nodes are instances of knowledge models. | High |
| `project/07-cst` | `project/04-knowledge-model` | Dependency | Inward | System thinking validates knowledge structures. | High |
| `project/08-tpci` | `project/07-cst` | Dependency | Inward | Trust framework depends on CST models. | High |
| `project/09-engineering` | `project/08-tpci` | Dependency | Inward | Code validation depends on trust models. | High |
| `project/10-runtime` | `project/09-engineering` | Dependency | Inward | Runtime drift audits engineering specs. | High |
| `project/09-decisions` | `project/13-architecture-blueprints` | Governance | Inward | DEC-0004 adopts Blueprint v2.0 as volume base. | High |
| `project/14-architecture-reviews` | `project/13-architecture-blueprints` | Review | Inward | Reviews evaluate blueprint maturity. | High |
| `project/15-gap-analyses` | `project` | Review | Outward | Gaps audit repository structure completeness. | High |

## 8. Circular Dependency Review

An audit of the RKF dependency map reveals:
- **No Circular Dependencies**: All dependencies are strictly acyclic. The hierarchy moves from abstract constitutional definitions down to concrete engineering and runtime logs.
- **No Authority Ambiguity**: Confirmed. Permanent volumes override blueprints and reviews, as documented in the lifecycle rules of `docs/START_HERE.md`.
- **Duplicated Ownership**: None. Each subdirectory under `project/` represents a distinct volume domain.
- **Conflicting Relationships**: None. All dependencies align with the layered architecture.

## 9. Constitutional Boundary Review

Verification of core architectural boundaries:
- **Separation of Authority and Implementation**: Verified. Constitutional Volumes contain only rules, ontology, and governance models. Implementation code resides entirely outside the `docs/` directory in the repository root or codebases.
- **Runtime and Constitutional Truth**: Verified. Runtime reports (`drift-inventory.md`, `debugging-log.md`) observe and record states but cannot modify active rules. Only approved Decision Records update volumes.
- **Examples Boundary**: Verified. Files under `examples/` do not establish authority.
- **Reviews Boundary**: Verified. Reviews evaluate blueprints/volumes but do not establish new constitutions.
- **Governance Independence**: Verified. Governance rules apply universally to all volumes.

## 10. Knowledge Resolver Readiness

### Classification: Ready
- **Authority Resolution**: **Ready**. The resolver can deterministically evaluate the override order (Canon > Vol 01-10 > Specs > Code).
- **Dependency Resolution**: **Ready**. Dependency mapping provides the acyclic load order for volumes.
- **Provenance**: **Ready**. The resolver can trace a rule back to its authorizing Decision Record and Blueprint.
- **Deterministic Traversal**: **Ready**. The resolver can route search queries through specific navigation zones.
- **Evidence Traceability**: **Ready**. The resolver can trace runtime errors back to active specifications and volumes.

## 11. Architectural Gaps

We identified the following relationship gaps in the current snapshot:
- **Empty Root Placeholders**: `docs/methodology/`, `docs/security/`, and `docs/specification/` at the root are completely empty. They do not have defined relationships or files, leaving their active authority unverified.
- **Vague File-Level Links**: While the dependency graph between *volumes* is semantically clear, there are few explicit file-to-file hyperlinks in the documentation text itself (e.g. Volume 8 references CST conceptually but doesn't link directly to the CST markdown files).
- **Lack of telemetry flow links**: There are no explicit metadata structures linking `runtime/debugging-log.md` entries back to the specific code modules or engineering specs that caused the errors.
