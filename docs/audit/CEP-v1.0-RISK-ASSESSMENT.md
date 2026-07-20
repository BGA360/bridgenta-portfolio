# CEP v1.0 — Classified Risk Register

---

## 1. Risk Classification Matrix

| Risk ID | Severity | Category | Risk Description | Mitigation / Status |
| :--- | :---: | :--- | :--- | :--- |
| **RSK-001** | **Low** | Transport | Gateway transport defaults use in-memory drivers rather than live network sockets. | **Accepted for v1.0 GA**. Live HTTP drivers scheduled for post-GA deployment wave. |
| **RSK-002** | **Low** | Storage | State persistence relies on immutable in-memory records during pipeline runs. | **Accepted for v1.0 GA**. Database persistence plugins scheduled for Stage E. |
| **RSK-003** | **Medium** | Security | AI provider API keys could be leaked if passed directly in user configuration. | **Mitigated**. Gateway interface isolates credentials, preventing prompt/key storage. |
| **RSK-004** | **Low** | Compatibility | Breaking changes in future platform contracts (CTR-010+). | **Mitigated**. `@cep/api-sdk` enforces semantic versioning (`1.0.0`, `1.x` compatibility). |

---

## 2. Risk Acceptance & Approval

All identified risks are classified as **Low** or **Medium** and have been either fully mitigated by contract isolation or explicitly accepted for the v1.0 GA release.
