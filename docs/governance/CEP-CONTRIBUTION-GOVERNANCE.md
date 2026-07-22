# CEP — Contribution Governance & Review Protocol

---

| Policy Metadata | Specification |
| :--- | :--- |
| **Document ID** | `POL-CONTRIBUTION-001` |
| **Effective Date** | `2026-07-20` |

---

## 1. Contribution Workflow Rules

All contributions to CEP must follow strict GitHub branching and PR review protocols:
1. **Branching**: Direct pushes to `main` are strictly forbidden. All work must occur in descriptive feature branches.
2. **Validation**: Every PR must pass `npm run build` and 100% of monorepo unit/contract/compliance/regression/acceptance test suites.
3. **Constitutional Review**: Any change impacting platform contracts (`CTR-001` to `CTR-009`) or domain invariants requires explicit Constitutional Engineering Steering Board approval.
