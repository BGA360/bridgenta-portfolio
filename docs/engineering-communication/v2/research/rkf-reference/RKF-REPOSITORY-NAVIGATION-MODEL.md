# RKF Repository Navigation Model

An authoritative guide defining the navigation architecture and exploration traversal patterns for the Reference Knowledge Framework (RKF) repository.

## 1. Purpose

Repository navigation must be engineered because modern constitutional repositories are large, nested, and semantically dense. If a human or AI system attempts to explore a repository without a formal navigation model, it risks unbounded recursive scanning, consuming non-authoritative examples, or mixing historical and active rules.

### Navigation vs. Authority
Navigation defines **how** to traverse the filesystem structure to find information. Authority defines **which** documents establish durable constitutional truth (e.g. Constitutional Volumes vs. Blueprints). A document may be high in the navigation path (like `docs/START_HERE.md`) but carry zero constitutional authority.

### Navigation vs. Dependency
Dependency defines how different parts of the system rely on each other (e.g. Volume 8 depends on Volume 7). Navigation provides the directory traversal flow to locate those dependent documents.

### Requirement Before Knowledge Resolution
Before a Knowledge Resolver (such as the one planned for BECC v2.0) can resolve a query, it must navigate the repository structure deterministically. This model provides the traversal blueprint for that resolver.

## 2. Navigation Philosophy

The RKF Repository Navigation Model is guided by the following principles:
- **Repository-First Discovery**: All discovery begins with repository structure, not chat memory or external hints.
- **Predictable Navigation**: Folder structures and paths must follow strict, well-known naming patterns.
- **Constitutional Progression**: Traversal moves from high-level orientation down to specific project volumes.
- **Explicit Entry Points**: Exploration always starts at designated root files.
- **Deterministic Traversal**: Traversal routes must be repeatable and consistent for both humans and AI.
- **Evidence-Based Navigation**: Navigation paths are determined solely by active documentation files.

## 3. Repository Entry Points

The repository establishes four official entry points:

1. **[docs/START_HERE.md](docs/START_HERE.md)**
   - *Purpose*: The mandatory first-read document.
   - *Audience*: All human builders, developers, and AI agents.
   - *Navigation Role*: The root entry point. Provides the official Documentation Hierarchy and Read Order.

2. **[docs/framework/README.md](docs/framework/README.md)**
   - *Purpose*: Entry point for reusable framework rules.
   - *Audience*: Developers needing base components and templates.
   - *Navigation Role*: Framework orientation.

3. **[docs/project/README.md](docs/project/README.md)**
   - *Purpose*: Entry point for project-specific volumes.
   - *Audience*: Developers working on specific project code.
   - *Navigation Role*: Project orientation.

4. **[docs/runtime/current-state.md](docs/runtime/current-state.md)**
   - *Purpose*: Entry point for operational status.
   - *Audience*: Operations and deployment auditors.
   - *Navigation Role*: Runtime evidence orientation.

## 4. Navigation Layers

Exploration sequence proceeds through the following layers:

```text
Repository Entry (docs/START_HERE.md)
   │
   ▼
Repository Orientation (Area READMEs, e.g. docs/framework/README.md)
   │
   ▼
Constitution (Canon / Permanent Constitutional Volumes)
   │
   ▼
Framework (reusable lifecycles and templates)
   │
   ▼
Methodology (rules for how engineering is performed)
   │
   ▼
Specifications (formal schemas and boundaries)
   │
   ▼
Projects (project-specific volumes and domain structures)
   │
   ▼
Runtime (debugging, engineering, and drift logs)
   │
   ▼
Examples (educational material)
```

## 5. Navigation Graph

Traversal flow chart for humans and AI agents exploring the RKF snapshot:

```text
       [docs/START_HERE.md] (First Entry)
               │
               ├──────────────────────┐
               ▼                      ▼
        [docs/canon/]          [docs/framework/] (CEF Rules)
               │                      │
               │                      ├───────────────┐
               │                      ▼               ▼
               │              [templates/]      [methodology/]
               │                      │
               ▼                      ▼
        [docs/project/] ◄─────────────┘ (Injects templates)
               │
               ├──────────────────────┬──────────────────────┐
               ▼                      ▼                      ▼
        [Vol 00 to 10]         [Blueprints]           [Decisions]
               │                      │                      │
               │                      ▼                      │
               │               [Reviews & Gaps]              │
               │                      │                      │
               ▼                      ▼                      ▼
        [docs/runtime/] ◄─────────────┴──────────────────────┘
        (Current State / Logs)
               │
               ▼
        [docs/examples/] (Non-authoritative examples)
```

## 6. Human Navigation

For human developers, the learning and exploration sequence is structured as:
1. **Onboarding**: Start at `docs/START_HERE.md`. Understand the read order.
2. **Discovery**: Read `docs/canon/README.md` to understand the enduring framework laws.
3. **Framework Rules**: Browse `docs/framework/framework-overview-v1.md` and `docs/framework/constitutional-engineering-methodology-v1.md`.
4. **Architectural Understanding**: Navigate to `docs/project/18-system-architecture/` to understand the relationships and boundary models.
5. **Implementation Understanding**: Review templates under `docs/framework/templates/` before starting development, then map project-specific volumes.

## 7. AI Navigation

AI systems must follow strict traversal protocols:
- **Preferred Entry Points**: Always begin context acquisition with `docs/START_HERE.md`. Do not jump directly to project folders.
- **Prohibited Shortcuts**: Do not bypass reviews, decision records, or specifications when determining active rules. Do not use example files under `docs/examples/` as active source rules.
- **Deterministic Traversal**: Walk folders sequentially by prefix (e.g. Volume 01 to Volume 10) to build a consistent mental model of constitutional authority.
- **Context Acquisition**: When evaluating a rule, read the corresponding Decision Record in `project/09-decisions/` to obtain context and design rationale.
- **Stopping Conditions**: Terminate exploration when an empty directory is reached, or when a file explicitly marks a boundary as non-applicable.

## 8. Navigation Boundaries

To maintain system integrity, the following zones must not be used as entry points:
- **examples/**: Educational files only.
- **project/13-architecture-blueprints/RKF-TPCI-Architectural-Blueprint-v1.0.md**: Historical document (superseded by v2.0).
- **project/18-system-architecture/constitutional-system-architecture-v1.md**: Historical document.
- **runtime/debugging-log.md**: Contains evidence logs, not architectural rules.

## 9. Navigation Zones

The repository is organized into six navigation zones:

1. **Orientation Zone** (`START_HERE.md`, READMEs): Guides the reader on how to read the repository.
2. **Constitutional Zone** (`canon/`, `project/00-` to `project/10-`): Contains active constitutional volumes.
3. **Methodology Zone** (`framework/methodology/`, `framework/18-lessons-learned/`): Contains engineering methodologies.
4. **Project Zone** (`project/`): Domain-specific subfolders, blueprints, reviews, and decision records.
5. **Runtime Zone** (`runtime/`): Active operational logs and status indicators.
6. **Example Zone** (`examples/`): Educational examples only.

## 10. Navigation Rules

1. **Rule 1**: Always begin traversal at `docs/START_HERE.md`.
2. **Rule 2**: Do not use files under `docs/examples/` to establish constitutional rules.
3. **Rule 3**: Do not infer authority from folder name alone; check the document headers for explicit Volume or status declarations.
4. **Rule 4**: Follow the documented Read Order in `START_HERE.md` when onboarding.
5. **Rule 5**: Avoid recursive directory scanning without an explicit target.

## 11. Navigation Anti-Patterns

Avoid the following behaviors:
- **Scanning Every File**: Scanning all 315 files to resolve a simple query increases context bloating.
- **Beginning with Examples**: Using examples as the source of truth causes incorrect rule formulation.
- **Bypassing START_HERE**: Jumping straight to project volumes without reading orientation guides.
- **Mixing Historical and Active**: Treating superseded blueprints (v1.0) as active system rules.
- **Treating READMEs as Constitutional Truth**: Reading directory indexes rather than the constitutional volumes themselves.

## 12. Navigation Readiness

### Assessment: Partially Ready
- **Clear Entry Points**: **Ready**. `docs/START_HERE.md` is extremely clear.
- **Predictable Navigation**: **Ready**. Subdirectories in `project/` are numbered and clearly named.
- **Sufficient Orientation**: **Ready**. Overview and metadata files provide good baseline context.
- **Discoverability**: **Partially Ready**. There is currently no master index file mapping file paths to their classification categories. This is solved by the newly created `RKF-DOCS-STRUCTURE-INVENTORY.md` and `RKF-CONSTITUTIONAL-CLASSIFICATION.md`.
- **Scalability**: **Partially Ready**. As the number of project subdirectories grows (currently 30), a flat listing under `project/` will become harder to navigate without nested categories.

## 13. Navigation Recommendations

- **Recommendation 1**: Add a `docs/README.md` that redirects directly to `docs/START_HERE.md` for users arriving at the root.
- **Recommendation 2**: Categorize the flat `project/` subdirectory. Group volumes (`00-constitution` to `10-runtime`) into a `volumes/` subfolder, and process files (`blueprints`, `reviews`, `decisions`) into a `lifecycle/` subfolder.
- **Recommendation 3**: Maintain the JSON and Markdown inventories dynamically using automated pre-commit hooks.

## 14. Relationship to Future Knowledge Resolver

The Repository Navigation Model provides the path resolution logic for the future **BECC v2.0 Knowledge Resolver**:
- **Path Resolution**: The resolver will use the navigation zones to narrow search scope (e.g. skipping `examples/` and `runtime/` when looking for constitutional rules).
- **Resolver Routing**: It maps queries directly to active volumes or decision records.
- **Provider Independence**: By formalizing entry points and navigation boundaries, the resolver can navigate the repository using basic file operations, remaining independent of specific AI models or vendor platforms.
