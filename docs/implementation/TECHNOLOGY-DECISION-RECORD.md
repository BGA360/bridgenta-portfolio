# Technology Decision Record — Core Technology Stack Selections

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Technology Decisions |
| **Project Status** | Platform Engineering (**CONCLUDED**) |
| **Lifecycle Stage** | Stage B — Platform Engineering (**CONCLUDED**) |
| **Sprint Reference** | Sprint B4 |
| **Next Authorized Stage** | Stage C — Platform Implementation / Sprint C1 — Assessment Core Foundation |
| **TDR Mandate** | Formal Rationale, Alternatives, Constitutional Impact & Risks for Tech Choices |

---

## 1. Overview & Technology Selection Philosophy

The **Technology Decision Record (TDR)** documents why specific engineering technologies have been selected for the implementation of the **Constitutional Engineering Platform (CEP)** starting in Stage C.

In strict adherence to Principle 5 (*Technology Independence*), **technology choices support constitutional principles rather than define them**. All selected technologies reside behind abstract platform contracts (`docs/contracts/`) and may be replaced without altering constitutional semantics.

---

## 2. Formal Technology Decision Records

### 2.1 TDR-001: Core Programming Language & Runtime Stack
- **Selected Technology**: **TypeScript (Node.js v20+ / ES2022)**.
- **Alternatives Considered**: Rust, Go, Python.
- **Rationale**: TypeScript provides strong static typing, native JSON schema support, excellent AST parsing capabilities, and widespread ecosystem adoption across web and CLI tooling.
- **Constitutional Impact**: Enables technology-independent schema definitions via TypeScript types without binding to native binary runtimes.
- **Risks & Trade-offs**: Slightly higher memory footprint than Rust/Go; mitigated by asynchronous non-blocking event loops and lightweight package design.

### 2.2 TDR-002: Frontend & Documentation Platform
- **Selected Technology**: **Astro (Static SSG) + Vanilla CSS**.
- **Alternatives Considered**: Next.js, React SPA, Hugo, Docusaurus.
- **Rationale**: Astro generates zero-JS static HTML by default, ensuring ultra-fast load times, complete SEO compliance, and complete decoupling from heavy client-side UI frameworks.
- **Constitutional Impact**: Ensures documentation and public audit portals remain lightweight, accessible, and free of heavy runtime dependencies.
- **Risks & Trade-offs**: Limited client-side reactivity; acceptable as CEP UI focus is static audit dashboards and documentation hubs.

### 2.3 TDR-003: Backend & Orchestration Architecture
- **Selected Technology**: **Modular Monorepo (pnpm Workspaces / Node.js Modules)**.
- **Alternatives Considered**: Microservices (Docker/Kubernetes), Serverless Functions.
- **Rationale**: A modular monorepo allows single-command local evaluation without requiring complex cluster orchestration or network latency overhead.
- **Constitutional Impact**: Enables offline, local constitutional assessment execution without requiring cloud hosting infrastructure.
- **Risks & Trade-offs**: Monorepo build tooling requires strict package boundary enforcement; managed via automated linting and dependency checks.

### 2.4 TDR-004: Persistence & Audit Ledger Strategy
- **Selected Technology**: **Git-Backed Immutable JSON Ledgers + SHA-256 Cryptographic Hashes**.
- **Alternatives Considered**: PostgreSQL, MongoDB, Blockchain / Distributed Ledger.
- **Rationale**: Git provides native versioning, cryptographic commit hashing, transparency, offline support, and zero infrastructure cost.
- **Constitutional Impact**: Directly satisfies Principle 2 (*Evidence Before Assertion*) and Principle 7 (*Repository Independence*).
- **Risks & Trade-offs**: Git repository size can grow under high-frequency commits; managed via shallow clones and periodic release archiving.

### 2.5 TDR-005: Event & Messaging Strategy
- **Selected Technology**: **In-Memory Async Event Emitter (Typed Event Contracts)**.
- **Alternatives Considered**: Apache Kafka, RabbitMQ, Redis Pub/Sub.
- **Rationale**: In-memory event emission maintains zero infrastructure dependencies for local CLI/CI runs, while preserving event-driven architecture contracts.
- **Constitutional Impact**: Prevents platform lock-in to external message broker infrastructure.
- **Risks & Trade-offs**: Events are process-scoped; distributed messaging can be introduced at Layer 1 if enterprise scaling requires it.

### 2.6 TDR-006: Security & Authentication Approach
- **Selected Technology**: **Cryptographic HMAC / Ed25519 Key Signatures & Token Verification**.
- **Alternatives Considered**: OAuth2 / OIDC Server, Username/Password DB.
- **Rationale**: Cryptographic signatures provide stateless, verifiable provenance for attestations, certificates, and evidence packages.
- **Constitutional Impact**: Ensures evidence chains are tamper-proof and cryptographically traceable to specific stewards.
- **Risks & Trade-offs**: Key management responsibility lies with stewards; supported by standard key pair generation tools.

---

## 3. Technology Selection Summary Matrix

| Domain Area | Selected Technology | Primary Alternative | Constitutional Rationale |
| :--- | :--- | :--- | :--- |
| **Language** | TypeScript (Node.js) | Go / Rust | Static typing, schema parity, ecosystem reach |
| **Frontend** | Astro + Vanilla CSS | Next.js / React | Zero-JS static HTML, fast performance, SEO |
| **Backend** | Modular Monorepo | Microservices | Offline evaluation, zero cluster dependency |
| **Persistence** | Git-Backed JSON + SHA-256| PostgreSQL | Native versioning, cryptographic auditability |
| **Messaging** | In-Memory Typed Events | Kafka / RabbitMQ | Zero infrastructure lock-in, event contracts |
| **Security** | Ed25519 / HMAC Signatures| OAuth2 Server | Stateless, verifiable cryptographic provenance |
