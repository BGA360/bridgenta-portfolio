# BRIDGENTA-DE-M5-CROSS-PLATFORM-INTEGRITY-CANONICALIZATION-01
## Canonical LF Integrity Remediation & Cross-Platform Determinism Verification

### Workstream ID
`BRIDGENTA-DE-M5-CROSS-PLATFORM-INTEGRITY-CANONICALIZATION-01`

### Status
`REMEDIATION_IMPLEMENTED_AND_VERIFIED`

---

## 1. Defect Summary & Root Cause

During the initial activation attempt of M5 publication enforcement in PR #341, Linux CI (`ubuntu-latest`) produced a readiness projection of `2_ELIGIBLE` and `12_WITHHELD`, differing from the Windows development environment (`14_ELIGIBLE`).

### Root Cause
1. In PR #339 (`9afe7ed`), `src/data/local_integrity_manifest.json` was populated on a Windows system with `core.autocrlf = true`.
2. 11 text files were checked out with `CRLF` line endings (`\r\n`). Their raw SHA256 hashes recorded in `local_integrity_manifest.json` corresponded to CRLF bytes.
3. On Linux CI, Git checks out text files with canonical `LF` line endings (`\n`).
4. The resolver (`tooling/prag_provenance_resolver.js`) enforces strict raw-byte SHA256 checking against the manifest. On Linux, the computed SHA256 of the LF bytes failed to match the CRLF hashes in the manifest, marking all 11 evidence sources as `FIDELITY_UNCONFIRMED`.
5. Under M5 operational enforcement, 12 learning articles were withheld, causing an unexpected publication/route regression from 30 pages to 18 pages and breaking internal HTML links.

---

## 2. Architectural Decision: Option A (Canonical LF Manifest & `.gitattributes`)

Rather than weakening the resolver to perform runtime line-ending normalization, this workstream establishes a single canonical text representation across all environments:
- **Repository Policy**: Define `.gitattributes` enforcing `* text=auto eol=lf` with explicit binary protections.
- **Strict Byte-Faithful Verification**: The resolver continues to perform strict `SHA256(raw_bytes) == manifest_hash` verification without text modification.
- **Zero Enforcement Activation**: M5 operational enforcement remains strictly `DISABLED` during this remediation workstream. PR #341 remains unmerged and blocked pending this remediation.

---

## 3. Gitattributes Policy & Renormalization

### `.gitattributes`
```gitattributes
* text=auto eol=lf

*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.ico binary
*.pdf binary
*.zip binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
```

### Renormalization Method
The working tree was re-checked out to strictly apply `eol=lf` across all tracked files on Windows, ensuring `hasCRLF === false` for every text file in the working tree.

---

## 4. Affected Integrity Manifest Surface & Before/After Matrix

| Event ID | Source Locator | Old Hash (Windows CRLF) | New Canonical Hash (Canonical LF) | Reason |
|:---|:---|:---|:---|:---|
| `EV-BG-002` | `docs/becc/governance/GOV-FIND-002-AI-GENERATED-HUMAN-EVIDENCE.md` | `6bfc30bf6f649848dd97cf66085a266952cd306706c6f0d007568719b455e75a` | `31d2333af372967fe85d5bef832ec3f3bbde96fe8fe1f2f49900544dd4c8170f` | Remediate CRLF-dependent hash |
| `EV-BG-004` | `src/content/projects/luminapraxisds.md` | `5c7f9fa54be66ef7c4722288753a22cdd97aeb8310e299840df4afe505c75f4d` | `11dcf30457a99a487e5745c7b81d8e989b79b49642d0608d7031c44503f0626e` | Remediate CRLF-dependent hash |
| `EV-BG-005` | `src/styles/styles.css` | `51353836601db14ae3c1072e4b7657bf9c44c3e7784ce1c46fb086c8f80eeb8e` | `f7efaf8610c27e4029184ea31e5398861610bb0471c78dfc4bf38917b54f96ee` | Remediate CRLF-dependent hash |
| `EV-BG-006` | `docs/becc/learning/public-post-memory-vs-evidence-provenance-plan.md` | `cb2cb3f30689520d3c12679b1d1444bfcac88e2e6d4540ed96542c9ab1aecf93` | `48a27a8ad4e1c6596732e309dccf870593b426351789d11f1bba00bc20da3ffa` | Remediate CRLF-dependent hash |
| `EV-BG-007` | `tooling/publish_check_learning_article.js` | `8dfd9e17776ef5848c965c38d4ebf74094cf676f8f97b22fb64c3283ffa4e95c` | `91deacf3b2acd99e2ede7f6a17bd31b1a13a3f1b401420e602896d6c6aaf9567` | Remediate CRLF-dependent hash |
| `EV-BG-008` | `docs/becc/governance/GOV-FIND-001-RECORD.md` | `065ea084fa0c10b964dfdbf3fb60e8eb1454bc1c68666cd492a64dfe5a57a2bb` | `b9d64b12a5d9e4cea7870a802a0d3eef9b6ddc9c1b5f686dbd1a8b3bf090f77c` | Remediate CRLF-dependent hash |
| `EV-BG-009` | `src/pages/lernen/preview/[slug].astro` | `3e47d8d629594996f5a2c534958b29648028157225ff89954d6ae6b4ba15eae7` | `7cd68c92f92722c61bf929daf1f851d20df8ab1e4486b07de6a4435c273906d0` | Remediate CRLF-dependent hash |
| `EV-BG-010` | `docs/becc/standards/BECC-PUBLIC-LEARNING-STANDARD-v1.0.md` | `7eaf616c6bb8519c6104562d119a84100db3470d42f36e9dcde29bac3eff4146` | `d6d0a1eb9d9db872431495a46ab1a77ec8fde9fa5f8e557f63c8ab7d1e0b76e5` | Remediate CRLF-dependent hash |
| `EV-BG-011` | `docs/ECP-WP009-001-PROVIDER-EXECUTION-LIFECYCLE-RESOLUTION.md` | `4ae37e42953f2148fd16937fba5f85511e51c2b1f28044d1dc4e00c7ca560d2c` | `1f0b5860d350616ab020da1f88ee66495c565f2bebcd1a3b15952a1a97bc56ed` | Remediate CRLF-dependent hash |
| `EV-BG-013` | `becc-runtime/evidence/ledger-verification.service.ts` | `a0388d0eacf159e7c22da2b36590c28a45f143232287885433857e9d40cb238e` | `1494eeb9401dfaa02f9e6653dd39aa1309786081c0d5d5e1690816821acff3b0` | Remediate CRLF-dependent hash |
| `EV-BG-014` | `becc-runtime/orchestrator/orchestrator.service.ts` | `0dc60e1cbcdce8c6be6044e328d7c4117aa876a39751e3d894a85406f010ed24` | `5516a9490b28171745195e3f14ac96627c0abc94282940cc2860a489c89c5e4b` | Remediate CRLF-dependent hash |

- **Total Entries in Manifest**: 14
- **Updated Entries**: 11
- **Unaffected Entries**: 3 (`EV-BG-001` already LF, `EV-BG-003` NOT_AVAILABLE, `EV-BG-012` already LF)
- **Unrelated Changes**: 0

---

## 5. Git Repository Canonical Blob Verification

Every updated entry was independently proven against Git repository canonical content via `git cat-file -p HEAD:<path>`.
```text
WORKTREE_CANONICAL_HASH == GIT_REPOSITORY_CONTENT_HASH == MANIFEST_HASH
```
- **Verified Count**: 13 / 13 available entries
- **Failures**: 0

---

## 6. Regression Guard Added

1. **Test Suite**: Created `test/cross_platform_integrity.test.js` (5/5 tests passing):
   - Asserts `.gitattributes` declares `* text=auto eol=lf`.
   - Asserts all local integrity sources in the working tree contain zero CRLF bytes (`0x0D`).
   - Asserts all AVAILABLE manifest entries match working-tree raw SHA256 byte-for-byte.
   - Asserts Git repository blob content matches canonical manifest hash for all tracked sources.
   - Proves CRLF-dependent manifest generation is detected and rejected.
2. **Generator Guard**: Updated `tooling/prag_integrity_generator.js` to immediately throw if `content.includes(13)` (CRLF byte), preventing future generation from non-canonical working trees.

---

## 7. Verification Outcomes

| Suite / Check | Result | Detail |
|:---|:---|:---|
| Project Registry Validate | PASS | 7 registered projects |
| Project Registry Tests | PASS | 12/12 tests passing |
| Cross-Platform Integrity Guard | PASS | 5/5 tests passing |
| M5 Readiness Assessment | PASS | `ENFORCEMENT_READY`, 98/10 observations, determinism PASS |
| M5 Shadow Observation | PASS | `SHADOW_PASS`, 14/14 eligible, 0 withheld |
| Learning Publish Check | PASS | Validated against `code-fakten...` |
| Governed Learning Build & Tests | PASS | 310/310 tests passing |
| BECC Runtime Build & Tests | PASS | 320/320 tests passing |
| Astro Check | PASS | 0 errors, 0 warnings |
| Root Static Build | PASS | 30 pages + sitemap generated |
| Markdown Lint | PASS | Clean across all markdown documentation |
| Link Check | PASS | All relative links resolved |
| Learning Validate | PASS | 14/14 articles valid |
| HTML Link Audit | PASS | 32 HTML files audited, 0 broken links |
| Operational Enforcement | OFF | Kept in advisory shadow mode |
