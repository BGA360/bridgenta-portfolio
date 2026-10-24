---
subject: "src/content/learning/ki-modell-wechsel-softwareprojekt-source-of-truth-architektur-drift.md"
reviewType: "Source-Fidelity"
result: "PASS"
reviewedAt: "2026-10-24T21:00:00+02:00"
reviewerOrRole: "Publication Steward"
---

# Source-Fidelity Review: Was passiert, wenn mitten im Softwareprojekt das KI-Modell wechselt? (EV-BG-012)

This review evaluates the source fidelity of Article 12 ("Was passiert, wenn mitten im Softwareprojekt das KI-Modell wechselt?") against verified event `EV-BG-012`.

## 1. Verified Evidence Sources

- **Source Event (Provider Broker WP-008 Closure Certificate)**:
  - SOURCE_PROJECT: `bridgenta-core`
  - SOURCE_SYSTEM: `git`
  - SOURCE_LOCATOR: `docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md`
  - HISTORICAL_LOCATOR_STATE: `AVAILABLE`
  - HISTORICAL_LOCATOR: `301799f07a2139ee8eeef4c84a8ff6dcbc48f3fb`
  - Evidence Packet: [article-12-ev-bg-012-source-evidence.md](file:///c:/antigravity/statichtmlpro/fdrefs/stewardship/evidence/article-12-ev-bg-012-source-evidence.md)

---

## 2. Claim-to-Evidence Matrix

### Claim 1: Different AI model providers and services can be abstracted via generic provider adapters.
- **Evidence Location**: `docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md`.
- **Evidence Type**: Architectural certification record.
- **Support**: `DIRECT` (WP-008 certifies generic provider interface isolation).
- **Disposition**: `KEEP`

### Claim 2: Selection of providers and AI services can occur deterministically via configuration.
- **Evidence Location**: `becc-runtime/broker/service-broker.ts` and WP-008 closure certificate.
- **Evidence Type**: Implementation code.
- **Support**: `DIRECT` (The broker routes requests based on configuration rules rather than model recollection).
- **Disposition**: `KEEP`

### Claim 3: System architecture rules must exist in durable project files (SSoT) independent of the AI model.
- **Evidence Location**: `docs/engineering-communication/v2/engineering/certificates/WP-008-WORK-PACKAGE-CLOSURE-CERTIFICATE.md` (Constitutional knowledge principles).
- **Evidence Type**: Specification.
- **Support**: `DIRECT` (The architecture enforces external rule definition to prevent model-induced drift).
- **Disposition**: `KEEP`

### Claim 4: The article explicitly disclaims asserting that every model switch inevitably causes architecture drift or production outages without specific proof.
- **Evidence Location**: Article text (lines 202-206) and `stewardship/evidence/ki-modell-wechsel-softwareprojekt-source-of-truth-architektur-drift.yaml` (Claims CLM-007 to CLM-009).
- **Evidence Type**: Epistemic boundary disclaimers.
- **Support**: `DIRECT` (The text establishes an honest epistemic limit).
- **Disposition**: `KEEP`

---

## 3. Conclusion

All claims are supported by the WP-008 closure certificate and constitutional knowledge architecture. The locator is resolved and verified.

**Final Fidelity Disposition: PASS**
