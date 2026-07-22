# CEP — Compatibility Guarantee Specification

---

| Policy Metadata | Specification |
| :--- | :--- |
| **Document ID** | `POL-COMPATIBILITY-001` |
| **Effective Date** | `2026-07-20` |
| **Scope** | Public API, Contracts, SDK, Gateways, Serialization |

---

## 1. Public API & SDK Guarantees

- All public exports from `@cep/api-sdk` (`PlatformAPI`, `CEPClient`, request builders, canonical models) are guaranteed backwards-compatible across the entire `1.x` release series.
- Structural schema modifications to `PipelineResponse` or `AssessmentRequest` will never drop existing fields within a MAJOR version.

---

## 2. Contract & Serialization Guarantees

- Platform contracts `CTR-001` through `CTR-009` guarantee 100% loss-free canonical JSON round-trip serialization.
