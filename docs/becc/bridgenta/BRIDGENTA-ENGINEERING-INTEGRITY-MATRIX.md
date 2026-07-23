# BridGenta BECC Reference Maturity Programme — Engineering Integrity Matrix
## Sprint 5 Architectural Verification Ledger

This matrix provides area-by-area traceability for all core technical specifications, decisions, boundaries, and components of the BridGenta platform, comparing the authoritative baseline against the final public version.

---

## 1. Traceability Registry

| Integrity ID | Area | Authoritative baseline | Final public wording | Classification | Evidence source | Drift detected | Required action | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BG-INT-001** | Project purpose and public scope | BridGenta ist eine Rekonstruktionsplattform für Altsysteme... | BridGenta ist eine Rekonstruktionsplattform für Altsysteme, die bestehende Software analysiert und diese strukturiert auf die Integration moderner AI Builder vorbereitet. | `PRESERVED` | Baseline content review | None | None | Verified |
| **BG-INT-002** | Target audience | Dieses Dokument richtet sich an Systemarchitekten, Software-Ingenieure und IT-Entscheidungsträger... | Dieses Dokument richtet sich an Systemarchitekten, Software-Ingenieure und IT-Entscheidungsträger, die Migrationsprozesse mit künstlicher Intelligenz steuern und absichern möchten. | `PRESERVED` | Baseline content review | None | None | Verified |
| **BG-INT-003** | Six reconstruction phases | Phase 1 Observe, Phase 2 Understand, Phase 3 Map, Phase 4 Reconstruct, Phase 5 Validate, Phase 6 Handoff | Phase 1: Beobachten, Phase 2: Verstehen, Phase 3: Kartieren, Phase 4: Rekonstruieren, Phase 5: Validieren, Phase 6: Übergabe | `CLARIFIED WITHOUT TECHNICAL CHANGE` | Terminology alignment | None | None | Verified |
| **BG-INT-004** | Seven Intelligence Domains | Source Intelligence, Reconstruction Intelligence, Preservation Intelligence, Cross-Layer Intelligence, Human Review, Governance, Export Intelligence | Source Intelligence, Reconstruction Intelligence, Preservation Intelligence, Cross-Layer Intelligence, Human Review, Governance, Export Intelligence | `PRESERVED` | Capability definitions | None | None | Verified |
| **BG-INT-005** | Visibility Preservation Layer | Visibility Preservation Layer (VPL) | Visibility Preservation Layer (VPL, Sichtbarkeitsebene): Erfasst Schnittstellendeklarationen und strukturelle Abhängigkeiten... | `PRESERVED WITH LANGUAGE QUALIFICATION` | Architecture section | None | None | Verified |
| **BG-INT-006** | Experience Preservation Layer | Experience Preservation Layer (EPL) | Experience Preservation Layer (EPL, Verhaltensebene): Spezifiziert und dokumentiert das dynamische Laufzeitverhalten... | `PRESERVED WITH LANGUAGE QUALIFICATION` | Architecture section | None | None | Verified |
| **BG-INT-007** | Design Preservation Layer | Design Preservation Layer (DPL) | Design Preservation Layer (DPL, Gestaltungsebene): Konserviert die visuelle Identität der Benutzeroberfläche... | `PRESERVED WITH LANGUAGE QUALIFICATION` | Architecture section | None | None | Verified |
| **BG-INT-008** | Human-review boundary | Human control over releases, human-in-the-loop | Letztkontrolle durch menschliche Prüfer / Freigabeverantwortung beim Menschen | `CLARIFIED WITHOUT TECHNICAL CHANGE` | Governance sections | None | None | Verified |
| **BG-INT-009** | Branch-Gating | Git-basiertes Branch-Gating | Git-basiertes Branch-Gating | `PRESERVED` | Decisions section | None | None | Verified |
| **BG-INT-010** | Architecture Gate | Automated checking of architecture compliance, Architecture Gate | Architecture Gate | `PRESERVED` | Decisions/Risks section | None | None | Verified |
| **BG-INT-011** | Frontend/backend separation | Separation of frontend and backend environments | statisches Frontend und Backend weiter formalisiert / logische und physische Trennung | `PRESERVED` | Decisions/Lessons Learned | None | None | Verified |
| **BG-INT-012** | Gateway boundary | API gateways isolating environments | Gateway-gestützte Schichtentrennung / Gateways | `PRESERVED` | Architecture/Results | None | None | Verified |
| **BG-INT-013** | Synthetic Mock-Daten | Use of mock data to verify | Synthetische Mock-Daten | `PRESERVED` | Technical decisions card | None | None | Verified |
| **BG-INT-014** | Credential and secret isolation | Prevention of credentials leaking | unbefugten Zugriff von KI-Modellen auf sensible Kundendaten oder kryptografische Schlüssel zu verhindern | `PRESERVED` | Security cards/metrics | None | None | Verified |
| **BG-INT-015** | Main Branch workflow | No direct pushes to main, automated gating | Main Branch / Übernahme in den Main Branch ausgeschlossen | `CLARIFIED WITHOUT TECHNICAL CHANGE` | Decisions/Governance | None | None | Verified |
| **BG-INT-016** | Handoff branches | Dedicated git branches for generated code transitions | Handoff-Branches / Handoff-Zweige | `CLARIFIED WITHOUT TECHNICAL CHANGE` | Workspace/Workflow sections | None | None | Verified |
| **BG-INT-017** | CI/CD pipelines | GitHub Actions CI/CD workflows | CI/CD-Pipelines / GitHub Actions | `PRESERVED` | Workflow section | None | None | Verified |
| **BG-INT-018** | Repository paths | `/src/workspace/`, `/src/workflow/`, `/backend/app/policies/`, `/tooling/governance/`, `/tooling/analyzer/` | Same paths mapped to components | `PRESERVED` | Implementation prose | None | None | Verified |
| **BG-INT-019** | Engineering decisions | Four architectural decision cards | 4 Decisions cards (IT-Rekonstruktion, Wissensmodellierung, Datentrennung, Branch-Gating) | `PRESERVED` | Decisions section | None | None | Verified |
| **BG-INT-020** | Results and metrics | 45% time savings, 100% merges, 0 leaks, SQ Gate A | 45% Zeitersparnis, 100% Code-Übergaben im Pilotlauf, 0 Leaks sensibler Daten, Quality Gate A | `PRESERVED WITH LANGUAGE QUALIFICATION` | Results section (scoped to pilot) | None | None | Verified |
| **BG-INT-021** | Risk model | Three core risk definitions and mitigations | 3 Risks (Knowledge Cutoff, Code Bloat, Test Blind Spots) | `PRESERVED` | Risks section | None | None | Verified |
| **BG-INT-022** | Future roadmap items | API formalization, Source Intelligence, optimization, validation | Quellcodeanalyse, API-Formalisierung, Datenpakete, Statische Sicherheitsprüfungen | `CLARIFIED WITHOUT TECHNICAL CHANGE` | Next Evolution section | None | None | Verified |
