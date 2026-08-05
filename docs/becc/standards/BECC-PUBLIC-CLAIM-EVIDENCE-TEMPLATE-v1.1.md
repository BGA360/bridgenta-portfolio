# BECC Public Claim-Evidence Map Template v1.1

*   **Template Status**: `DRAFT — NOT EVIDENCE`
*   **Standard Status**: `BECC v1.1 CANDIDATE — PROPOSED — PENDING REVIEW`
*   **Effective Date**: PENDING AUTHORIZATION
*   **Current Governance Effect**: `NONE`
*   **Certification Effect**: `NONE`
*   **Publication Effect**: `NONE`
*   **Supersession Effect**: `NONE`

> [!IMPORTANT]
> **Shared Status & Separation Boundary**
> *   This template candidate has no active enforcement, certification, publication, or supersession effect until formally approved.
> *   Completion of this template does not establish truth, human verification, certification, publication authorization, amendment approval, or activation.
>
> ```text
> Machine validation
> ≠ author or engineering self-review
> ≠ authorized semantic fresh-reader review
> ≠ independent certification review
> ≠ constitutional or designated approval
> ≠ merge authorization
> ≠ publication authorization
> ≠ activation
> ```

Use this map to register, scope, and track all quantitative metrics and performance claims published on public project pages under the BECC Reference Standard v1.1.

---

## 1. Claim Registry

| Claim ID | Project or Page | Section | Public Claim Wording | Claim Category | Evidence Repository | Evidence Path | Evidence Commit SHA | Evidence SHA-256 | Generation Workflow or Run ID | Generation Command or Method | Evidence Date | Environment Scope | Evidence Owner | Verification Status | Human Verifier | Limitations | Supersession Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| | | | | | | | | | | | | | | | | | |

*Note: All evidence commit SHA references must record the full 40-character commit SHA. Short SHAs are not permitted.*

---

## 2. Controlled Claim Categories
The registry controls all substantiation-sensitive claims including:
*   **quantitative**: numerical measurements, ratios, percentages, counts, or resource constraints.
*   **performance**: speeds, load times, accessibility scores, benchmarks, or throughput metrics.
*   **outcome**: operational results, success rates, or transactional completions.
*   **accessibility**: WCAG checkpoints, screen reader compatibility, and device support statements.
*   **security**: patch levels, cryptographic algorithms, vulnerability scan results, and authorization states.
*   **conformance**: compliance with specifications, guidelines, or standards.
*   **certification**: statements of external audit, vetting, or verification.
*   **categorical absence-of-event**: claims of absolute events not occurring (e.g. "no failures", "zero downtime", "no outages").
*   **other substantiation-sensitive claims**: any statement requiring empirical backing.

### Treatment of Special Categories:
*   **future targets**: must be clearly labeled as aspirational targets, not verified facts.
*   **estimates**: must describe the estimation model and variables.
*   **illustrative examples**: must state that they are mockups or examples, not live page results.
*   **historical claims**: must state the historical boundary dates and target version.
*   **third-party quotations**: must cite the source and state that the quotation is not independent assurance.
*   **source-language evidence**: must identify the original source file and translation mapping.

*None of these special categories may be silently treated as verified evidence.*

---

## 3. Controlled Statuses
The only permitted values for the Verification Status field are:
*   `DRAFT`: The claim record is being prepared; no verification has occurred.
*   `MACHINE-MAPPED`: The claim has been linked to an evidence file by an automated system.
*   `PENDING-HUMAN-VERIFICATION`: The machine mapping is complete, and the record is queued for human review.
*   `HUMAN-VERIFIED`: The claim has been personally checked, verified, and signed off by an authorized human reviewer.
*   `REJECTED`: The claim is found to be incorrect, unbounded, or lacking evidence.
*   `SUPERSEDED`: The claim is historical and has been replaced by a newer verified record.

> [!WARNING]
> Automated systems may assign only `DRAFT`, `MACHINE-MAPPED`, or `PENDING-HUMAN-VERIFICATION`.
> Automated systems must not assign `HUMAN-VERIFIED`.

---

## 4. Human Verification Controls
Setting the verification status to `HUMAN-VERIFIED` requires:
*   known human verifier identity;
*   appointment or authorization reference;
*   exact evidence artifact;
*   exact evidence commit (full 40-character SHA);
*   review date;
*   declared scope;
*   relationship disclosure;
*   limitations;
*   reviewer-controlled submission reference.

---

## 5. Bounding and Hash Limitations

### Hash Verification Limitation
A SHA-256 value proves byte identity only when the corresponding evidence artifact is available. It does not prove factual truth, methodological validity, reviewer independence, or certification.

### Absolute-Claim Boundary
Naming a pilot, test, staging, or limited environment does not make an absolute warranty acceptable.
*   **Unsafe**: "The system was failure-free."
*   **Potentially supportable**: "No failures were observed during the defined run identified by the evidence record."
