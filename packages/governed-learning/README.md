# @cep/governed-learning

Physical Zod schema implementation for the Governed Learning domain of the Constitutional Engineering Platform (CEP).

Encodes frozen design baseline `CEP-STAGE-F-GOVERNED-LEARNING-SCHEMA-FINAL-01`.

## Structure

- **57 Canonical Contracts** (`src/contracts/`)
  - References (`LessonRef`, `FrameworkCriteriaRef`, `TargetRef`, etc.)
  - Entities (`Observation`, `VerifiedObservation`, `ApprovedLesson`, etc.)
  - Scopes (`SingleFrameworkScope`, `CrossFrameworkScope`, `SystemWideScope`, `ScopeContract`)
  - Authority (`AuthorityContextContract`, `AttributedDecisionRecord`)
  - Ports (`LessonStorePort`, `ObservationStorePort`, etc.)
  - Envelopes (`GovernanceEventEnvelope`, `GovernanceCommandEnvelope`)
- **34 Registered Schema Helpers** (`src/helpers/`)
  - 7 Event Payload Schemas
  - 16 Command Payload Schemas
  - Event/Command Version Registries & Predicates
  - Historical 3-Branch Preservation Schemas
  - Parser Dispatch Outcome Helpers
- **49 Non-Contract Types & Enums** (`src/types/`)
  - 20 Frozen Domain Enums (including 20 Refusal Codes)
  - 25 Semantic ID & Scalar Aliases
  - Primitive Schemas (`VersionValue`, `TimestampIso`, `OpaquePayload`)

## Validation & Verification

```bash
npm run build
npm test
```
