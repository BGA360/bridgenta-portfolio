# CEP Ubiquitous Language — Canonical Engineering Vocabulary

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Document Domain** | Platform Engineering — Ubiquitous Language |
| **Project Status** | Platform Engineering |
| **Lifecycle Stage** | Stage B — Platform Engineering |
| **Sprint Reference** | Sprint B1 |
| **Next Authorized Sprint** | Sprint B2 — Platform Contracts & Interface Specifications |
| **Language Mandate** | Single Authoritative Vocabulary, Deprecated Terms & Prohibited Synonyms |

---

## 1. Overview & Semantic Consistency Goal

A primary cause of architectural drift and implementation flaws is semantic ambiguity. When different engineers or components use different terms to describe the same concept (or use a single term to describe multiple distinct concepts), governance discipline fails.

This document establishes the **Canonical Ubiquitous Language** for the **Constitutional Engineering Platform (CEP)**. Every term defined herein has exactly ONE authoritative meaning across all documentation, specifications, contracts, and future implementation codebases.

---

## 2. Canonical Vocabulary Mapping

The table below maps preferred terminology against deprecated terms, prohibited synonyms, and ambiguous wording:

| Preferred Canonical Term | Deprecated / Prohibited Synonyms | Prohibited Ambiguous Wording | Authoritative Domain Meaning |
| :--- | :--- | :--- | :--- |
| **Assessment** | Audit, Check, Test Run, Scan | "Checking the code", "Inspection" | Bounded, deterministic evaluation of project evidence against active framework rules. |
| **Finding** | Issue, Bug, Violation, Defect, Flag | "Problem", "Problem item", "Failure" | Discrete, explainable outcome of evaluating a specific rule against evidence (`PASS`/`WARN`/`FAIL`). |
| **Evidence** | Data, Artifact, Output, Proof, Log | "File", "Scan data", "Metrics" | Standardized, immutable data artifact providing verifiable proof of project state or compliance. |
| **Evidence Bundle** | Package, Zip, Payload, Folder | "Collected files", "Data dump" | Cryptographically sealed aggregation of evidence items for a single assessment run. |
| **Certification** | Approval, Pass, Badge, Sign-Off | "Verification", "OK status", "Clearance" | Formal, immutable certificate validating that an assessment evidence chain satisfies all pass criteria. |
| **Constitutional Framework** | Meta-Framework, Root Policy | "Base system", "Core rules" | CEF meta-framework kernel defining universal meta-rules and evaluation semantics. |
| **Domain Framework** | Framework, Module, Policy Standard | "Rulebook", "Guideline set" | Domain-specific body of rules and standards (e.g., RKF, BGCF, BECC, BPGA). |
| **Decision Record (CDR)** | ADR, RFC, Spec Note, Change Log | "Decision doc", "Proposal file" | Structured, versioned document capturing a binding decision following the CDR Standard. |
| **Governance Level** | Tier, Strictness Level, Profile | "Mode", "Strictness option", "Level" | One of six standardized tiers (Level 0–5) establishing proportional governance requirements. |
| **Repository** | Git Repo, Codebase, Source Folder | "Folder", "Project files", "Directory" | Abstract representation of a target source control location holding project artifacts. |
| **Provider** | Vendor, Plugin, AI Engine, SaaS | "Integration", "External tool", "Service" | Abstract representation of an external processing service (AI, SCM, CI) under neutral contracts. |
| **Platform Component** | Service, Module, Engine, Worker | "Tool", "Subsystem name", "Script" | Subsystem specified under the Component Specification Standard enforcing *Mechanisms Before Labels*. |
| **Attestation** | Approval Signature, Audit Sign-Off | "Steward note", "Human approval" | Explicit cryptographic declaration attached to a decision or certificate by an authorized steward. |

---

## 3. Disambiguation Rules

To eliminate semantic confusion, platform authors and engineers must enforce four strict disambiguation rules:

### 3.1 Disambiguation Rule 1: Assessment vs Validation vs Verification
- **Assessment**: Evaluates project evidence against constitutional rules to produce findings.
- **Validation**: Checks post-implementation results against an approved CDR specification.
- **Verification**: Confirms that a cryptographic evidence hash or schema contract is untampered and valid.

### 3.2 Disambiguation Rule 2: Framework vs Platform
- **Framework**: Declarative body of rules, standards, and authority boundaries (e.g., CEF, BECC).
- **Platform**: Operational substrate, pipelines, and adapters that execute and orchestrate frameworks (CEP).

### 3.3 Disambiguation Rule 3: Policy vs Rule vs Guideline
- **Rule**: Individual, testable constitutional constraint producing binary/explainable findings.
- **Policy**: Operational configuration mapping rules to projects and setting failure thresholds.
- **Guideline**: Non-binding informational advice (forbidden from driving automated build failures).

### 3.4 Disambiguation Rule 4: Certification vs Attestation
- **Certification**: Automated, evidence-backed certificate issued by the platform upon passing all gates.
- **Attestation**: Explicit digital sign-off attached to an artifact by a human steward or auditor.

---

## 4. Terminology Enforcement

In Stage B and all subsequent stages, any PR, specification document, or code comment that utilizes deprecated synonyms (e.g., calling an *Assessment* an "Audit Scan", or calling a *Finding* a "Bug") violates the Ubiquitous Language Standard and must be corrected during review.
