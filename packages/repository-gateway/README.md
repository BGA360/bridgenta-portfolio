# `@cep/repository-gateway` — Repository Gateway Foundation Module

---

| Metadata Attribute | Specification |
| :--- | :--- |
| **Package Name** | `@cep/repository-gateway` |
| **Package Version** | `0.1.0` |
| **Package Type** | ES Module (`"type": "module"`) |
| **Project Status** | Platform Implementation |
| **Lifecycle Stage** | Stage C — Platform Implementation (External Integration Foundation) |
| **Sprint Reference** | Sprint C7 |
| **Next Authorized Sprint** | Sprint C8 — AI Provider Gateway Foundation |
| **Governed Contract** | `CTR-007` (Repository Gateway Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`) |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` |

---

## 1. Overview & Module Purpose

The `@cep/repository-gateway` module implements the external SCM repository integration boundary for the **Constitutional Engineering Platform (CEP)**.

In strict compliance with Sprint C7 specifications, this module:
1. Provides a provider-independent abstraction layer over SCM platforms (Local Git, GitHub, GitLab, Azure DevOps).
2. Defines the common `RepositoryProvider` interface (`connect()`, `discoverRepository()`, `enumerateBranches()`, `enumerateFiles()`, `collectMetadata()`, `disconnect()`).
3. Normalizes provider-specific structures into canonical domain models (`Repository`, `Branch`, `Commit`, `File`, `Directory`, `RepositoryMetadata`, `RepositorySnapshot`).
4. Transforms repository file artifacts and metadata into canonical `EvidenceSubmissionModel` objects for direct ingestion into `@cep/evidence-manager`.
5. Emits immutable gateway domain events (`RepositoryConnected`, `RepositoryDiscovered`, `RepositoryIndexed`, `EvidenceGenerated`, `RepositoryDisconnected`).
6. Enforces structured domain error codes (`ERR-REP-001` through `ERR-REP-006`).

This module operates **100% read-only and observationally**. It does **NOT** clone repositories, push commits, create pull requests, delete branches, or alter target repository content.

---

## 2. Provider Architecture & Provider Independence

```
[Repository Provider (GitHub / GitLab / Azure DevOps / Local Git)]
                                │
                                ▼
                       [Repository Adapter]
                                │
                                ▼
                       [Repository Gateway]
                                │
                                ▼
                    [Canonical Repository Model]
                                │
                                ▼
                     [Evidence Manager (Ingestion)]
```

All downstream CEP modules consume **only** canonical models and Evidence submissions, ensuring 100% provider independence.

---

## 3. Public API Summary

- `createRepositoryGatewayService()`: Factory function returning `RepositoryGatewayService`.
- `RepositoryProviderType`: Enum (`LOCAL_GIT`, `GITHUB`, `GITLAB`, `AZURE_DEVOPS`).
- `LocalGitAdapter`: Adapter for local file system git repositories.
- `GitHubAdapter`: Adapter for GitHub SCM host.
- `GitLabAdapter`: Adapter for GitLab SCM host.
- `AzureDevOpsAdapter`: Adapter for Azure DevOps SCM host.
- `RepositoryNormalizer`: Class providing `normalizeSnapshot(...)` and `transformSnapshotToEvidenceSubmissions(...)`.
- `RepositoryTraceabilityManager`: Class verifying repository gateway traceability references.

---

## 4. Domain Events

- `RepositoryConnected`: Emitted when adapter connects to repository URI.
- `RepositoryDiscovered`: Emitted when repository metadata is discovered.
- `RepositoryIndexed`: Emitted when files and head commit are indexed.
- `EvidenceGenerated`: Emitted when snapshot is transformed into Evidence submissions.
- `RepositoryDisconnected`: Emitted when adapter disconnects.

---

## 5. Structured Error Model

| Error Class | Error Code | Trigger Condition |
| :--- | :--- | :--- |
| `RepositoryConnectionError` | `ERR-REP-001` | Connection failure or invalid URI format |
| `ProviderUnavailableError` | `ERR-REP-002` | Unregistered or unavailable provider type requested |
| `RepositoryNotFoundError` | `ERR-REP-003` | Target repository not found |
| `RepositoryContractViolation` | `ERR-REP-004` | CTR-007 boundary or model violation |
| `RepositoryNormalizationError` | `ERR-REP-005` | Normalization failure during snapshot assembly |
| `AdapterRegistrationError` | `ERR-REP-006` | Adapter registration error |

---

## 6. Test Inventory

- **Unit Tests**: Provider adapters (`LocalGitAdapter`, `GitHubAdapter`, `GitLabAdapter`, `AzureDevOpsAdapter`) (`tests/unit/`).
- **Contract Tests**: `CTR-007` contract payload compliance checks (`tests/contract/`).
- **Compliance Tests**: Observational read-only integrity and unregistered adapter rejection (`tests/compliance/`).
- **Regression Tests**: Deterministic snapshot normalization and evidence transformation (`tests/regression/`).
- **Acceptance Tests**: Full chain from repository discovery through evidence generation to `@cep/platform-orchestrator` execution (`tests/acceptance/`).

---

## 7. Explicit Non-Goals

The `@cep/repository-gateway` module explicitly does **NOT**:
- Perform `git clone`, `git push`, or repository file writes.
- Create pull requests, issues, or code comments.
- Perform security, rule evaluation, or policy resolution logic.
- Interact with AI providers or LLMs.
- Expose REST, GraphQL, CLI, or UI endpoints.

---

## 8. Traceability Annotation

- **Constitutional Source**: `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` (External Integration Boundary)
- **Domain Concepts**: `Repository Abstraction`, `Evidence Transformation`, `Provider Independence` (`docs/domain/DOMAIN-MODEL.md`)
- **Governed Contract**: `CTR-007` (Repository Gateway Contract) (`docs/contracts/PLATFORM-CONTRACTS.md`)
- **Runtime Component**: `RepositoryGateway` (`docs/runtime/COMPONENT-CATALOG.md`)
