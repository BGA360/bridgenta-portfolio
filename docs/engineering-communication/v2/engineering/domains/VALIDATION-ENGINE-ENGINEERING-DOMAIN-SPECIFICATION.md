# BECC v2.0 — Validation Engine Engineering Domain Specification

An authoritative engineering domain specification defining the validation philosophies, pipelines, audit categories, rule levels, report structures, runtime state behaviors, and security bounds for the Validation Engine.

## 1. Engineering Identity

- **Domain Name**: Validation Engine Domain
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Validation & Compliance Engineering Team
- **Scope**: Structural, terminology, constitutional, publication, and explainability audits on transformed engineering artifacts.

## 2. Purpose

The Validation Engine is the independent quality gate of BECC v2.0. It executes deterministic auditing rules (regular expressions, markdown AST linters, and vocabulary checksum checks) to verify that transformations do not introduce semantic drift, terminology violations, or rule conflicts.

## 3. Responsibilities

1. **Independent Verification**: Evaluates transformed outputs against the active Knowledge Bundle.
2. **Structural Auditing**: Validates document outline hierarchies and markdown structures.
3. **Terminology Compliance**: Audits terminology against Volume 01 vocabulary rules.
4. **Constitutional Enforcement**: Verifies adherence to core foundation constraints (Volumes 00 to 10).
5. **Validation Report Generation**: Compiles structured reports detailing findings, severities, and recommendations.

## 4. Explicit Non-Responsibilities

The Validation Engine explicitly does NOT own:
- **Text Modification**: The engine is strictly read-only; it never writes edits or generates documents.
- **Prompt Engineering**: Prompt assembly and tag injection belong to the Transformation Engine.
- **Provider Interfaces**: Interfacing with LLM endpoints belongs to the Provider Broker.
- **Reviewer Dashboards**: Human action forms are owned by the Review Engine.

## 5. Inputs

Consumes:
- **Transformation Response**: Transformed text, diff outputs, and rationale references.
- **Knowledge Bundle**: Active rules lists, terminology definitions, and hashes.

## 6. Outputs

Produces:
- **Validation Report**: Structured listing of findings, severity metrics, and quality score.

## 7. Validation Philosophy

### Separation of Concerns
Transformation (generation) and Validation (auditing) are separate domains. The engine that writes the text must never evaluate its own compliance. This principle of independent verification prevents self-justification bias and catches hallucinations.

### Deterministic Execution
Validation rules are executed via non-generative, deterministic code pipelines (regex mappings, AST linter rules). AI is never used in the validation phase, assuring strict compliance to repository rules.

## 8. Validation Pipeline

Transformed text moves through these nine evaluation steps:

```text
[Transformation Output] ──► [Structural Audit] ──► [Terminology Check]
                                                            │
    ┌───────────────────────────────────────────────────────┘
    ▼
[Constitutional Validation] ──► [Engineering Quality Check] ──► [Publication Readiness]
                                                                        │
    ┌───────────────────────────────────────────────────────────────────┘
    ▼
[Explainability Complete Check] ──► [Generate Quality Score] ──► [Validation Report]
```

## 9. Validation Categories

The engine audits eight compliance areas:
- **Structural Integrity**: Heading hierarchy, markdown symbol checks.
- **Terminology Consistency**: Verifies zero forbidden words are introduced; vocab terms map to definitions.
- **Constitutional Compliance**: Active rules linked to line hashes are checked.
- **Engineering Quality**: Readability score, sentence length bounds.
- **Publication Readiness**: Resolves relative links; checks asset paths.
- **Explainability Completeness**: Confirms rationales exist for every modification block.
- **Traceability Integrity**: Verifies rule IDs are correctly mapped to source file line ranges.
- **Link Integrity**: Checks that internal hyperlinks resolved correctly.

## 10. Validation Rules

Violations are categorized into four severity tiers:
- **Mandatory**: Critical failures (e.g. broken relative link, constitutional rule violation) that halt the workflow and block publication.
- **Warning**: Non-blocking alerts (e.g. vocabulary warning) requiring reviewer audit.
- **Advisory**: Suggestions for stylistic improvements.
- **Informational**: Trace metrics and runtime metadata logs.

## 11. Validation Reports

The report follows a structured template:
- **Quality Score**: Computed aggregate score (0 to 100).
- **Findings Registry**: Numbered list of violations.
- **Severity**: Tier indicators (Mandatory, Warning, Advisory).
- **Evidence**: Modified text snippets flagged.
- **Rule Reference**: Line-pointer to Volume rule files.
- **Recommendations**: Guidelines to fix warnings.

## 12. Runtime Behaviour

The internal validation loop:
```text
[Input Payload] ──► [Parse Markdown AST] ──► [Execute Rules Audits] ──► [Generate Quality Score]
                                                                                │
                                                                                ▼
                                                                     [Validation Report]
```

## 13. State Management

The engine transitions through these states:
- **Idle**: Ready to receive payload.
- **StructuralAudit**: Parsing markdown headings.
- **TerminologyCheck**: Auditing word registries.
- **ConstitutionalCheck**: Verifying Volume constraints.
- **QualityAudit**: Calculating metrics (readability, link checks).
- **ReportSynthesis**: Formatting findings registry and score.

## 14. Events

- **Consumes**:
  - `Transformation Completed`: Triggers validation flow.
- **Produces**:
  - `Validation Completed`: Publishes the Validation Report.
  - `Validation Failed`: Logs validator configuration or AST parser exceptions.

## 15. Dependencies

- **Upstream**: Communication Transformation Engine.
- **Downstream**: Human Review Engine.

## 16. Interactions

- **Transformation Engine** ──► Supplies transformed text blocks.
- **Human Review Engine** ──► Receives completed validation reports.
- **Runtime Evidence Engine** ──► Receives compliance score telemetry events.

## 17. Failure Handling

- **Incomplete / Malformed Payloads**
  - *Recovery*: Halts job, logs warnings, blocks review form.
- **Conflicting Validation Rules**
  - *Recovery*: Halts run, triggers fallback config loading.
- **Configuration Load Failures**
  - *Recovery*: Re-loads baseline rules schema; if missing, aborts execution.

## 18. Runtime Metrics

Target operational KPIs:
- **Audit Latency**: < 500ms (overhead before review dispatch).
- **Validation Pass Rate**: % of transformations passing structural checks.
- **Terminology Violations**: Count of incorrect vocabulary terms flagged.
- **False Positive Rate**: Target < 1% on style/terminology audits.

## 19. Security

- **Sandboxed Execution**: Validation runs inside a strict, write-restricted sandbox.
- **AST Injection Defense**: Markdown inputs are parsed into sanitised AST node tokens, preventing execution of injected prompt scripts.

## 20. Risks

- **Rule Definition Drift**
  - *Mitigation*: Automatically sync validation rules schema with active CDM specifications.
- **False Positives (Validator Lock)**
  - *Mitigation*: Allow reviewers to override warning alerts manually.

## 21. Readiness Assessment

### Classification: Ready

**Justification**:
- The independent validation pipeline, compliance categories, and severity tiers are fully defined.
- Inputs, outputs, states, and metrics comply with the EDS Standard.
- Satisfies all constraints; no generative rules or SDK configurations are coded.

The specification is complete. Transition to **Phase 2.8: Human Review Engine Engineering Domain Specification** is authorized.
