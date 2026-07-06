# Explainability Standard v1.0

## Status

Approved

Version: 1.0

Owner: Frank Duru

Project: BridGenta

---

## Purpose

The primary goal of BridGenta is to demonstrate engineering thinking and explain complex concepts clearly. This document defines the standards for technical explanation, visual diagrams, and structural presentation. It ensures that every reader leaves our pages with a deeper understanding of *how* and *why* things were built.

---

## The 3-Step Explanation Framework

Every technical component, system design, or code solution described on BridGenta must follow this three-step explainability framework:

1. **Context & Problem**: Describe the background in plain language. What was the exact bottleneck or issue that needed solving? Why did it matter to the user or system?
2. **Thinking & Decision**: Detail the architectural options and the final decision. What were the trade-offs? Why was this specific implementation path selected?
3. **Evidence & Result**: Show how the solution was validated (logs, builds, metrics) and what the outcome was. Provide concrete evidence rather than vague claims.

---

## Visual Explanations & Diagrams

Text alone is often insufficient to explain architecture. Where possible, use structural visual layouts:
- **Mermaid Diagrams**: Use to illustrate state machines, workflows, build loops, and Git branching strategies.
- **Visual Hierarchies**: Use ASCII trees or markdown tables to map folder structures, data collections, and configuration mappings.
- **Screenshot Context**: Every screenshot or asset must have a caption detailing the engineering insight it illustrates. Never insert an image without context.

---

## Demystifying AI Workflows

BridGenta does not treat AI as a "magic black box." When explaining AI-assisted engineering:
- **Define Boundaries**: State exactly where the AI generated code, and where human judgment or manual configurations took over.
- **Explain Prompts**: Highlight the contextual guidelines, system instructions, or prompts used to guide the AI builder safely.
- **Show Validation**: Document the automated gating pipelines (linting, static analysis, unit tests) that verified the AI-generated assets.

---

## Explanation Quality Checklist

When writing a technical explanation, verify:
- [ ] Does this answer *What*, *Why*, and *How*?
- [ ] Are all acronyms and specialized terms expanded on first use?
- [ ] Is there a visual diagram or structured layout if the system has multiple components?
- [ ] Are trade-offs and alternative solutions explained?
- [ ] Is the outcome supported by validation evidence?
- [ ] Can an engineer reproduce this design based on the explanation?
