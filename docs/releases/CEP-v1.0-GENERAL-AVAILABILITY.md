# CEP v1.0 — Official General Availability (GA) Declaration

---

| Release Metadata | Specification |
| :--- | :--- |
| **Platform Name** | Constitutional Engineering Platform (CEP) |
| **Release Version** | `CEP v1.0 GA` (`1.0.0`) |
| **Official Release Date**| `2026-07-20` |
| **Release Status** | **GENERAL AVAILABILITY (PRODUCTION SUPPORTED)** |
| **Governed Contracts** | `CTR-001` through `CTR-009` |
| **Constitutional Source** | `docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md` |
| **Next Stage** | **Stage F — Platform Evolution** |

---

## 1. Official GA Declaration

The Constitutional Engineering Steering Board formally declares the **Constitutional Engineering Platform (CEP) v1.0** as a **General Availability (GA)** platform.

CEP v1.0 transitions from an implementation project into a production-ready, long-term maintained, constitutionally governed engineering platform. The underlying architecture is frozen, public contracts (`CTR-001` through `CTR-009`) are stable, and the public SDK interface (`@cep/api-sdk`) is fully supported.

---

## 2. Supported Scope & Package Catalog

CEP v1.0 GA includes 9 production-supported packages:

1. `@cep/assessment-core` (`v0.1.0` / GA): Assessment state machine and aggregate root (`CTR-001`).
2. `@cep/evidence-manager` (`v0.1.0` / GA): Evidence lifecycle & canonical JSON serialization (`CTR-002`).
3. `@cep/rule-engine` (`v0.1.0` / GA): Pure deterministic rule evaluation engine (`CTR-003`).
4. `@cep/policy-resolver` (`v0.1.0` / GA): Governance level resolution & policy decision engine (`CTR-004`).
5. `@cep/certification-engine` (`v0.1.0` / GA): Legal certification issuance & verification hashes (`CTR-005`).
6. `@cep/platform-orchestrator` (`v0.1.0` / GA): 5-stage sequential pipeline orchestrator (`CTR-006`).
7. `@cep/repository-gateway` (`v0.1.0` / GA): Multi-provider SCM repository gateway (`CTR-007`).
8. `@cep/provider-gateway` (`v0.1.0` / GA): Multi-provider AI provider gateway (`CTR-008`).
9. `@cep/api-sdk` (`v0.1.0` / GA): Unified public developer API & `CEPClient` SDK (`CTR-009`).

---

## 3. Supported Use Cases

- Automated constitutional assessment of software repository snapshots.
- Evidence collection, receipt generation, and verification hash auditing.
- Multi-provider AI prompt execution with provider independence (OpenAI, Anthropic, Gemini, xAI, Ollama).
- Multi-provider SCM repository discovery (Local Git, GitHub, GitLab, Azure DevOps).
- Automated legal certification issuance for software releases.

---

## 4. Known Limitations

- Default gateway drivers utilize in-memory mock transport implementations. Production network HTTP/gRPC transport drivers are scheduled for Stage F evolution.
- State persistence operates in memory during pipeline runs. External database persistence adapters (PostgreSQL/Redis) are scheduled for Stage F evolution.

---

## 5. Transition to Long-Term Stewardship

All future platform updates must conform to `docs/governance/CEP-STEWARDSHIP-POLICY.md` and `docs/governance/CEP-VERSIONING-POLICY.md`. Architecture redesigns are forbidden; evolution occurs via formal constitutional amendments.
