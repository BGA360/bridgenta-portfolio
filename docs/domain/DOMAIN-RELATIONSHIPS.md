# Domain Relationships — Conceptual Entity Interconnections

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Domain Relationships |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B1 |
| **Next Authorized Sprint** | Sprint B2 — Platform Contracts & Interface Specifications |
| **Relationship Scope** | Conceptual Interconnections (Ownership, Composition, Dependency) |

---

## 1. Overview & Non-UML Philosophy

This document defines the conceptual relationships connecting all major domain entities within the **Constitutional Engineering Platform (CEP)**.

In strict adherence to engineering constraints, this specification **avoids software implementation UML diagrams**, database foreign key notations, or class inheritance trees. It models purely conceptual business domain relationships categorized by:
- **Ownership** (Primary governance authority)
- **Composition** (Mandatory structural containment where parts cannot exist without the whole)
- **Aggregation** (Loose structural grouping where parts exist independently)
- **Dependency** (Operational requirement where one entity requires another to function)
- **Association** (Conceptual link or reference)

---

## 2. Core Relationship Specifications

### 2.1 Constitutional Framework (CEF) Relationships
- **Composes (Composition)**: *CEF* composes *Meta-Rules* and *Evidence Schema Definitions*. (Meta-rules cannot exist outside CEF).
- **Governs (Dependency)**: *CEF* governs all secondary *Domain Frameworks* (RKF, BGCF, BECC, BPGA). Secondary frameworks depend on CEF for precedence resolution and evidence semantics.
- **Specifies (Association)**: *CEF* specifies standard *Certification Status Models*.

### 2.2 Framework & Rule Relationships
- **Contains (Composition)**: A *Framework* contains one or more *Rules*. (A rule is structurally defined within its parent framework).
- **Configured By (Association)**: A *Rule* is configured by a *Policy* for a specific *Governance Level*.
- **Evaluates (Dependency)**: A *Rule* evaluates ingested *Evidence* to generate a *Finding*.

### 2.3 Assessment & Result Relationships
- **Initiated By (Dependency)**: An *Assessment* is initiated by an *Assessment Request*.
- **Evaluates (Dependency)**: An *Assessment* evaluates a *Project* against a set of *Frameworks*.
- **Consumes (Aggregation)**: An *Assessment* consumes an *Evidence Bundle*.
- **Produces (Composition)**: An *Assessment* produces exactly one *Assessment Result*. (An assessment result cannot exist without its originating assessment).

### 2.4 Evidence & Evidence Bundle Relationships
- **Contains (Aggregation)**: An *Evidence Bundle* aggregates multiple discrete *Evidence* items. (Individual evidence items may exist independently in source logs prior to bundling).
- **Supports (Dependency)**: *Evidence* supports a *Finding*. (Every finding requires supporting evidence).
- **Extracted From (Association)**: *Evidence* is extracted from a *Repository* or *Provider*.

### 2.5 Finding & Result Relationships
- **Grouped In (Composition)**: *Findings* are contained within an *Assessment Result*.
- **Refers To (Association)**: A *Finding* refers to a specific *Rule*, *Severity*, and supporting *Evidence*.

### 2.6 Certification & Attestation Relationships
- **Originates From (Dependency)**: A *Certification* originates from a passing *Assessment Result*. (A certification cannot be created without a valid assessment result).
- **Attests (Association)**: A *Certification* attests the compliance posture of a *Project*.
- **Contains (Aggregation)**: A *Certification* may contain one or more *Attestations* signed by human stewards or auditors.

### 2.7 Decision & Decision Record Relationships
- **Owned By (Ownership)**: A *Decision* is owned by a single Primary Authority Owner.
- **Documented In (Composition)**: A *Decision* is documented in exactly one *Decision Record (CDR)*.
- **Supported By (Dependency)**: A *Decision* is supported by an *Evidence Package*.
- **Alters (Association)**: A *Decision* alters a *Framework*, *Policy*, or *Platform Component*.

### 2.8 Project & Repository Relationships
- **Bound By (Association)**: A *Project* is bound by a *Policy* and assigned a *Governance Level*.
- **Associated With (Aggregation)**: A *Project* is associated with one or more *Repositories*.
- **Holds (Association)**: A *Project* holds zero or more *Certifications*.

---

## 3. Conceptual Relationship Summary Matrix

| Source Entity | Relationship Type | Target Entity | Cardinality | Conceptual Rule |
| :--- | :---: | :--- | :---: | :--- |
| **CEF Kernel** | Governs | Secondary Frameworks | 1 to N | CEF holds absolute meta-rule precedence. |
| **Framework** | Composition | Rules | 1 to N | Rules are contained within framework domains. |
| **Assessment** | Composition | Assessment Result | 1 to 1 | Every assessment produces one immutable result. |
| **Assessment Result**| Composition | Findings | 1 to N | Findings are aggregated within results. |
| **Evidence Bundle** | Aggregation | Evidence | 1 to N | Bundles aggregate discrete evidence items. |
| **Finding** | Dependency | Evidence | N to N | Every finding MUST reference supporting evidence. |
| **Certification** | Dependency | Assessment Result | 1 to 1 | Certifications require a passing assessment result. |
| **Decision** | Composition | Decision Record (CDR)| 1 to 1 | Decisions are formally captured in a CDR. |
| **Project** | Association | Governance Level | N to 1 | Every project operates under one governance level. |
