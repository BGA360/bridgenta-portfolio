# BridGenta Engineering Evidence Constitution v1.0

This constitution establishes the standards and guidelines for presenting engineering evidence across all public project pages and case studies within the BridGenta portfolio.

---

## Document Status & Dependencies

- **Status**: Active / Mandated
- **Scope**: All public case studies and project pages
- **Dependencies**:
  - [Engineering Philosophy](file:///c:/antigravity/statichtmlpro/fdrefs/docs/constitution/engineering-philosophy.md)
  - [Content Constitution](file:///c:/antigravity/statichtmlpro/fdrefs/docs/constitution/content-constitution.md)
  - [Project Case Study Constitution](file:///c:/antigravity/statichtmlpro/fdrefs/docs/constitution/project-case-study-constitution.md)
  - [Explainability Standard](file:///c:/antigravity/statichtmlpro/fdrefs/docs/constitution/explainability-standard.md)

---

## 1. Mission

The mission of engineering evidence is to demonstrate technical competence, architectural rigor, and engineering logic to the reader. Evidence exists to explain the engineering narrative, not to replace it. Every piece of evidence must support the reader's understanding of:
- **Engineering Reasoning**: Why the project was built the way it was.
- **Architectural Thinking**: How system boundaries and modularity were defined.
- **Design Decisions**: The trade-offs, options, and constraints encountered.
- **Validation**: How code and system structures were verified.
- **Measurable Outcomes**: The concrete improvements and performance metrics achieved.

---

## 2. Core Principles

### Evidence Over Claims
Unsupported claims are forbidden. Any statement regarding system quality, security, performance, or speed must be accompanied by supporting evidence (e.g., architecture diagrams, validation logs, or benchmark results).

### Reasoning Before Implementation
Explain the *why* before the *how*. A technical implementation detail is meaningless without its context in the engineering narrative.

### Understanding Before Complexity
Engineering evidence should simplify and clarify system behaviors. Presenting overly complex configurations or raw code dumps to "prove" capability only creates confusion and is not allowed.

### Public Evidence
All evidence presented on public pages must be understandable to external technical readers. The focus is on high-level system concepts and architecture rather than internal repository naming schemes or private developer details.

### Human Accountability
While generative AI models and tools (AI Builders) may contribute to code generation, human engineers remain explicitly accountable for system design, security verification, code structure, and overall project governance.

---

## 3. Acceptable Evidence

The following formats constitute acceptable engineering evidence on BridGenta pages because they actively build technical trust:

- **Architecture Explanations**: Visual and textual explanations of system components, interfaces, and separation of concerns.
- **Engineering Decisions**: Structured breakdowns of strategy choices, trade-offs, and design rationale.
- **Workflows**: Visual maps of development, integration, and deployment pipelines.
- **Governance Models**: Clear representations of security policies, code review gates, and verification rules.
- **Validation Processes**: Descriptions of test coverage, compile verification, and static analysis checks.
- **Engineering Trade-offs**: Transparent analysis of alternatives considered and why the chosen path was selected.
- **Measurable Improvements**: Before-and-after metrics showing performance, maintainability, or security gains.
- **Screenshots with Explanations**: Screenshots that directly support the narrative, accompanied by text detailing their engineering purpose.
- **Conceptual Diagrams**: Structural illustrations explaining systems without detailing specific implementation code.
- **Lifecycle Illustrations**: Sequential flows showing how data and states transition throughout the application lifecycle.

---

## 4. Evidence to Avoid

Case studies must not expose raw repository-level implementation files. The following items belong in Git repositories, not on public case studies:

- **YAML Files**: Raw configuration manifests (e.g., CI pipelines, project configuration).
- **JSON Configuration**: Raw schemas or local environment files.
- **Git Command Sequences**: Commands showing standard Git usage (e.g., branch creation, commits, status checks).
- **Shell Scripts**: Terminal scripts or installation utilities.
- **Lengthy Source Code**: Large blocks of raw implementation code.
- **Internal File Structures**: Lists of directories and file paths that do not contribute to architectural clarity.
- **Implementation Logs**: Raw build or test terminal outputs.

These structures represent repository documentation, not public-facing engineering analysis.

---

## 5. Artifact Philosophy

Every visual or textual artifact embedded in a case study must explicitly answer three questions:
1. **Why is it included?** (What is its connection to the narrative?)
2. **What engineering concept does it demonstrate?** (What technical pattern or structure does it validate?)
3. **What should the reader understand?** (What is the key takeaway for a technical reviewer?)

Artifacts are functional evidence; they must never be used purely as decoration.

---

## 6. Architecture Philosophy

Architecture documentation must explain system boundaries, information flow, governance boundaries, validation checkpoints, and module responsibilities. 

Architecture diagrams and explanations should enhance global system understanding. They should not document transient implementation details or internal variable mappings.

---

## 7. Engineering Decision Philosophy

Documenting strategic choices shows architectural maturity. Every engineering decision must follow a structured breakdown:
- **Decision**: The selected engineering path.
- **Reason**: The primary technical justification.
- **Alternative Considered**: The alternative option that was analyzed and rejected.
- **Outcome**: The measurable or structural result of the decision.

Documenting alternatives is a core requirement, demonstrating that the decision was made through objective evaluation rather than arbitrary choice.

---

## 8. Engineering Insight Philosophy

Every major section of a case study must conclude with a concise, highlighted **Engineering Insight**. 

An Engineering Insight must be:
- **Practical**: Directly applicable to real-world software engineering.
- **Evidence-Based**: Grounded in the project's actual implementation and outcomes.
- **Memorable**: Stated clearly and concisely.
- **Objective**: Written in factual, neutral language. Avoid motivational, marketing, or promotional phrasing.

---

## 9. Project Boundary Principle

Engineering evidence must describe the project itself (e.g., the BridGenta Reconstruction Platform). It must never document the technologies, routing, styling, or deployment architectures of the portfolio site hosting the page. 

A BridGenta project page is a portal for the project's own engineering evidence.

---

## 10. Public Engineering Presentation

BridGenta case studies are professional engineering publications, not repository browsers. The public-facing content must focus on:
- **Why**: The problem space and business/technical drivers.
- **Decisions**: Strategic and design decisions.
- **Architecture**: Structural boundaries and data flow.
- **Evidence**: Concrete, visual representation of components and workflows.
- **Lessons**: Lessons learned and next evolution steps.

Detailed, line-by-line implementation files belong in remote repositories.

---

## 11. Engineering Evidence Checklist

Before any project page or case study is published, the author must verify:

- [ ] Every major technical claim is supported by visual or narrative evidence.
- [ ] Screenshots directly support the story and have clear caption explanations.
- [ ] Architectural explanations improve understanding of system boundaries.
- [ ] Engineering decisions explain reasoning, outcomes, and alternatives considered.
- [ ] Human accountability for safety, design, and governance is visible.
- [ ] Raw repository configuration files (YAML, JSON, shell commands) are excluded.
- [ ] Factual, evidence-based engineering insights conclude each major section.
- [ ] The presentation style prioritizes readability and strengthens professional trust.

---

## 12. Relationship to BGCF

The Engineering Evidence Constitution bridges the gap between high-level architectural thinking and low-level communication standards. It fits into the BridGenta Governance & Content Framework (BGCF) hierarchy as follows:

```
          [ Engineering Philosophy ]
                      ↓
            [ Content Constitution ]
                      ↓
     [ Project Case Study Constitution ]
                      ↓
    [ Engineering Evidence Constitution ]
                      ↓
           [ Writing Standards ]
                      ↓
         [ Explainability Standard ]
                      ↓
        [ AI Collaboration Protocol ]
```

---

## 13. Closing Principle

> Engineering competence is demonstrated not by revealing every implementation detail, but by making engineering reasoning understandable, verifiable, and trustworthy. A successful engineering case study enables readers to understand both what was built and why it was built that way.
