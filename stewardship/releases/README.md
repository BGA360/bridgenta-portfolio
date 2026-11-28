# BridGenta.de Canonical Release Ledger (`bgde-release-record/1.0`)

This directory holds the **public-safe, Git-tracked release evidence ledger** for BridGenta.de under `BGDE-OPS-001C`.

It implements an **additive BPGA v1.x website-release adapter** (`DEC-OPS-02`, `DEC-OPS-03`, `DEC-OPS-04`, `DEC-OPS-05`). It preserves BPGA v1.0.1 (`EPPS`, `ERR`, `RAG`, `Release Bundle`), CEP v1.0 GA, CEF, and the owner-controlled STRATO deployment model without modification.

---

## 1. Dual-Tier Evidence Model (`DEC-OPS-03`)

Release evidence is strictly separated into two tiers:

| Tier | Location | Purpose | Visibility |
| :--- | :--- | :--- | :--- |
| **Tier 1 — Public-Safe Release Ledger** | `stewardship/releases/<releaseId>/release-record.json` | Traceable metadata, Git SHAs/tree hashes, CI URLs, SHA-256 artifact digests, review independence classification, owner authorization decision, residual risks, rollback reference ID | Public Git (`PUBLIC_SAFE`) |
| **Tier 2 — Protected Operational Archive** | Owner-controlled offline storage outside public Git | Full pre/post SFTP snapshots, full webroot rollback bundles, raw SFTP logs, private operational notes | Private Owner-Only (`PROTECTED_INTERNAL`) |

### Deterministic Public-Safe Projection Rules

Never publish a `PROTECTED_INTERNAL` record to Git. Before committing a release record to `stewardship/releases/<releaseId>/`, project only public-safe fields and exclude:

- Credentials, API keys, tokens, passwords, and private keys
- Session identifiers and cookies
- Private SFTP hostnames, usernames, ports, or connection strings
- Local workstation filesystem paths (for example Windows drive paths or home directories) — use an opaque `archiveReferenceId` (`ARCHIVE-...`) instead
- INTERNAL Learning SSOT references or private workspace paths
- Sensitive infrastructure or customer/account identifiers

`tooling/verify_release_record.mjs` enforces fail-closed disclosure scanning on `PUBLIC_SAFE` records.

---

## 2. Lifecycle States & Allowed Transitions

| State | Meaning | Required Evidence Gate |
| :--- | :--- | :--- |
| `DRAFT` | Pre-release record created on feature branch | Valid source branch & head SHA; no deployment/acceptance claims |
| `VALIDATED` | Required CI & PRAG gates green | `requiredChecks` (`build`, `pragValidationGate`, `postgresCi`, `failureRecoveryCi`) = `PASS` |
| `STAGING_ACCEPTED` | Verified staging artifact accepted on `bridgenta.com` | `staging` block with `basicAuthPreserved: true`, `postUploadSnapshotVerified: true`, SHA-256 digests, and owner acceptance |
| `AUTHORIZED` | Owner authorized exact production artifact digest | Merged `mainSquashSha`, verified `sourceTreeEquivalent: true` (or `reStagedAfterMerge: true`), `productionArtifact` (`verifyOnlyPassed: true`), explicit `ownerAuthorization` bound to `approvedPackageRootSha256 === productionArtifact.packageRootSha256`, and mandatory `bpgaRefs` if required by scope |
| `DEPLOYED_PENDING_VERIFICATION` | Owner uploaded verified artifact to `/bga/production_de` | `productionDeployment` (`OWNER_MANUAL_SFTP_CHROOTED`, `postUploadSnapshotVerified: true`, `missingOrUnexpectedFiles: 0`) |
| `RELEASE_ACCEPTED` | Focused live HTTPS acceptance passed cleanly | `postDeploymentVerification` (`canonicalRedirectsVerified`, `privacyZeroStorageVerified`, `legalPagesVerified`, `consoleErrors: 0`) |
| `RELEASE_ACCEPTED_WITH_LIMITATIONS` | Live acceptance passed with documented residual risks | Same as `RELEASE_ACCEPTED` plus non-empty `residualRisksAndLimitations` |
| `REJECTED` | Release rejected by owner or failed gate | `ownerAuthorization.decision === "REJECTED"` and `finalDisposition === "REJECTED"` |
| `ROLLED_BACK` | Production restored to prior verified release | `rollbackExecution` with `ownerAuthorized: true`, `postRollbackVerified: true`, restored SHA-256, and explicit `sourceCodeDisposition` |

Allowed forward/terminal transitions:

- `DRAFT` -> `VALIDATED`, `REJECTED`
- `VALIDATED` -> `STAGING_ACCEPTED`, `REJECTED`
- `STAGING_ACCEPTED` -> `AUTHORIZED`, `REJECTED`
- `AUTHORIZED` -> `DEPLOYED_PENDING_VERIFICATION`, `REJECTED`
- `DEPLOYED_PENDING_VERIFICATION` -> `RELEASE_ACCEPTED`, `RELEASE_ACCEPTED_WITH_LIMITATIONS`, `ROLLED_BACK`
- `RELEASE_ACCEPTED` -> `ROLLED_BACK`
- `RELEASE_ACCEPTED_WITH_LIMITATIONS` -> `ROLLED_BACK`

---

## 3. BPGA Compatibility Boundary (`DEC-OPS-02`)

Three release scopes are explicitly distinguished:

1. **`ORDINARY_ASTRO_WEBSITE`**: Standard BridGenta.de Astro website changes (copy, layout, legal pages, `.htaccess`, scripts) without private-workspace EPPS packages. `requiresFormalBpgaRag` is `false`; `bpgaRefs` is optional; `bpgaCertified` must be `false`.
2. **`EPPS_INCLUDED_WEBSITE`**: Website release containing one or more BPGA-governed EPPS packages. `requiresFormalBpgaRag` MUST be `true`, and `bpgaRefs` MUST supply valid `errId`, `ragId`, and `ragDecision` (`AUTHORIZED` or `AUTHORIZED WITH OBSERVATIONS`).
3. **`BPGA_FORMAL_EPPS_RELEASE`**: Formal BPGA publication release. `requiresFormalBpgaRag` MUST be `true`, and `bpgaRefs` MUST supply valid `errId`, `ragId`, `ragDecision`, and `bundleId`.

**Hard Governance Invariants:**

- **Procedural owner authorization (`ownerAuthorization`) is NEVER classified as formal BPGA RAG authorization** (`satisfiesFormalBpgaRag` is fixed to `false`).
- An optional `bpgaRefs` field **never weakens** a required BPGA gate.
- Historical releases prior to `BGDE-OPS-001C` must not be retroactively labeled as formally BPGA-certified.

---

## 4. Integrity Model (`DEC-OPS-04`)

- `integrityProofType` is fixed to `SHA256_HASH_MANIFEST`.
- A SHA-256 manifest proves **content integrity and deterministic reproducibility**, not asymmetric cryptographic signing or key-bound non-repudiation.
- `cryptographicSignature` MUST remain `null` until asymmetric signing is formally designed, implemented, and owner-authorized.

---

## 5. Rollback Governance

Rollback is strictly owner-authorized and never automated:

- **File-Level Rollback (`FILE_LEVEL`)**: Restore 1–3 isolated static files from the prior verified offline archive when `.htaccess` and overall manifest integrity remain intact.
- **Full-Release Rollback (`FULL_RELEASE`)**: Restore the entire `/bga/production_de` directory from the prior verified release (`previousReleaseId` / `previousPackageRootSha256`) and verify `100%` SHA-256 snapshot match post-restore.
- **Post-Rollback Verification**: Required before closing a `ROLLED_BACK` record (`postRollbackVerified: true`).
- **Relationship to GitHub Source Control (No Automatic Git Revert)**:
  - A production rollback MUST NOT automatically trigger `git revert` (`autoGitRevertTriggered: false`).
  - The owner records a separate `sourceCodeDisposition` based on root cause:
    - `NO_CODE_CHANGE_DEPLOYMENT_FAILURE` — transfer/hosting error; `main` source code remains valid.
    - `REVERT_PR_REQUIRED_CODE_DEFECT` — code regression; open a standard revert PR through `protect-main`.
    - `FORWARD_FIX_PR_REQUIRED` — targeted fix PR preferred over full revert.

---

## 6. Read-Only Validation CLI

```bash
node tooling/verify_release_record.mjs stewardship/releases/templates/release-record.public.template.json
```

Optional local cross-check flags (never modifies files or calls external networks):

- `--manifest <path>` — verify `productionArtifact.packageRootSha256` and `manifestSha256` against a local `production-artifact-manifest.json`.
- `--git-dir <path>` — verify `featureTreeSha` and `mainTreeSha` against local Git objects when available.
- `--allow-protected` — allow validating a local `PROTECTED_INTERNAL` record outside public Git.
- `--json` — emit machine-readable JSON verdict separating `structuralValidity` from `externalEvidence` (`VERIFIED` vs. `UNVERIFIED` vs. `MISMATCH`).
