# CEP — Semantic Version Governance Policy

---

| Policy Metadata | Specification |
| :--- | :--- |
| **Document ID** | `POL-VERSIONING-001` |
| **Effective Date** | `2026-07-20` |
| **Versioning Standard** | Semantic Versioning 2.0.0 (`MAJOR.MINOR.PATCH`) |

---

## 1. Version Numbering Rules

- **MAJOR (`x.0.0`)**: Incompatible API or contract breaking changes. Requires a formal constitutional amendment.
- **MINOR (`1.x.0`)**: Backwards-compatible new platform features, new gateway adapters, or extended SDK capabilities.
- **PATCH (`1.0.x`)**: Backwards-compatible bug fixes, performance optimizations, or documentation updates.

---

## 2. Deprecation & End-of-Life (EOL) Timelines

- Features or APIs marked for deprecation MUST remain supported for at least **12 months** or **1 MAJOR version cycle** with explicit deprecation notices.
