# Exercise 12 Planning Handoff: Agentic CI Failure Diagnosis & Human Escalation

## Objective

This plan defines the controlled workflow for diagnosing a failed CI run, producing a failure handoff report, and escalating to a human before any correction is attempted.

The plan is read-only and does not modify application code, tests, workflows, dependencies, or repository settings.

---

## A. Failure Scenarios

The failure diagnosis workflow must support controlled scenarios that are safe for practice and review. The following scenarios are acceptable for this exercise:

1. Application/test regression
   - a unit or e2e test fails in a controlled branch or temporary reproduction
2. TypeScript/build failure
   - a NestJS or TypeScript compile error in application code or configuration
3. Dependency/install failure
   - `npm ci` failure, missing package, lock mismatch, package-manager error, or environment issue
4. CI configuration failure
   - invalid workflow YAML, action misuse, job ordering problem, or runner configuration issue
5. Policy/scope violation
   - protected file or dependency file change blocked by the policy gate
6. Known baseline failure
   - a pre-existing known issue unrelated to the current exercise work
7. Transient/infrastructure failure
   - runner timeout, network loss, infrastructure instability, or external service outage
8. Insufficient evidence
   - the run lacks the necessary evidence to classify with confidence

These failure scenarios are intentionally chosen to exercise safe triage without weakening repository protections or introducing deployment behavior.

---

## B. Failure Classification

The Diagnosis Agent must classify the observed failure using the categories below, where evidence permits:

- application/test regression
- TypeScript/build failure
- dependency/install failure
- CI configuration failure
- policy/scope violation
- known baseline failure
- transient/infrastructure failure
- insufficient evidence

### Classification guidance

- If the failing command is a test assertion or logic regression, classify as `application/test regression`.
- If the build command fails to compile TypeScript or NestJS, classify as `TypeScript/build failure`.
- If installation fails before tests or build execute, classify as `dependency/install failure`.
- If the job definition, action, or runner is misconfigured, classify as `CI configuration failure`.
- If the policy gate rejects protected or dependency files, classify as `policy/scope violation`.
- If the issue matches a known baseline issue and the current change is unrelated, classify as `known baseline failure`.
- If the issue is clearly due to timeout, network instability, or infrastructure instability, classify as `transient/infrastructure failure`.
- If the evidence is incomplete or contradictory, classify as `insufficient evidence`.

The agent must not force a conclusion when the evidence is not strong enough.

---

## C. Evidence Requirements

The diagnosis agent must inspect and report the following evidence before making a conclusion:

- CI job name and failing step
- exact command that failed
- exit code or equivalent status
- relevant log output and error lines
- changed files or diff summary for the failing PR/commit
- recent commit and PR context
- test results and build output
- any policy or scope gate output
- known baseline status for repository issues
- relevant workflow configuration if a CI problem is suspected

### Evidence discipline

The report must distinguish:

- facts: directly observed from job logs or repository state
- hypotheses: probable causes that are not yet proven
- uncertainty: missing evidence or contradictory signals

The diagnosis agent must explicitly say what is known, what is inferred, and what is still unresolved.

---

## D. Diagnosis Output

The diagnosis report must include the following required sections:

1. Failure summary
2. Classification
3. Evidence
4. Suspected root cause
5. Confidence
6. Affected files
7. Recommended next action
8. Unresolved questions
9. Human decision required

### Example structure

```text
Failure summary:
- CI failed during [job/step]
- command: [exact command]
- exit code: [code]

Classification:
- [category]

Evidence:
- Fact: [observed log or diff]
- Fact: [failing command]
- Hypothesis: [possible cause]

Suspected root cause:
- [most likely explanation]

Confidence:
- high | medium | low

Affected files:
- [list]

Recommended next action:
- [human review / targeted correction / add evidence]

Unresolved questions:
- [open questions]

Human decision required:
- [yes/no and why]
```

This output is intentionally structured to support traceable escalation and reviewer evaluation.

---

## E. Human Escalation

The diagnosis agent must never:

- modify application code
- modify tests
- modify CI configuration
- commit
- push
- merge
- disable quality gates
- weaken security or policy checks
- change repository settings
- perform autonomous remediation

A human approval gate is mandatory before any correction occurs.

Human approval is required to decide:

- whether the diagnosis is valid
- whether a targeted correction is allowed
- whether the failure is a real regression or baseline/infrastructure issue
- whether the correction is in scope and safe

---

## F. Correction Workflow

After human approval, the workflow continues as:

Human approval
→ Developer Agent
→ Tester Agent
→ Reviewer Agent
→ CI validation

If the Tester fails after the first correction cycle:

- classify the failure again
- request human approval
- perform a targeted correction only if approved
- re-run Tester
- re-run Reviewer
- verify final CI outcome

No correction is allowed without explicit human approval.

---

## G. Traceability

A complete traceability chain is required:

```text
CI failure
→ diagnosis report
→ human decision
→ approved correction
→ independent testing
→ reviewer validation
→ final CI result
```

Every stage must be reviewable and documented so a reviewer can answer:

- what failed
- what evidence was used
- what decision was made
- what was corrected
- what validation occurred afterward

---

## H. Scope

The exercise must not introduce:

- new application features
- new dependencies
- deployment behavior
- automatic merge
- autonomous remediation
- unrelated refactoring

Protected files remain protected:

- .github/agents/*
- .vscode/mcp.json
- .github/copilot-instructions.md
- package.json
- package-lock.json

---

## I. Evaluation Criteria

The exercise passes only if the workflow meets the following measurable criteria:

1. Failure detection
   - The agent identifies the failing job, step, and command.
2. Evidence quality
   - The agent references actual CI output and repository state.
3. Correct classification
   - The selected category matches the evidence.
4. Distinction between fact and hypothesis
   - The report clearly separates observed facts from inferred causes.
5. Human escalation
   - The agent does not proceed to a correction without a human decision.
6. Least privilege
   - The diagnosis is read-only and does not write to the repository.
7. Correction control
   - Any correction is gated by human approval and scope discipline.
8. Independent testing
   - The tester validates the approved correction independently.
9. Reviewer validation
   - The reviewer confirms that the fix is scoped and justified.
10. CI recovery

- CI is re-run and the final status is reported.

11. Traceability

- The full decision chain is captured from failure to final recovery.

12. Scope discipline

- No unrelated code, dependency, or workflow changes are introduced.

---

## J. GH-600 Learning Objectives

This exercise explicitly supports:

- agent failure handling
- controlled autonomy
- human-in-the-loop governance
- least privilege for diagnosis and remediation
- evidence-based reasoning under uncertainty
- multi-agent coordination across diagnosis, implementation, testing, and review
- independent validation by a tester and reviewer
- auditability of CI decisions and corrections
- safe escalation when evidence is incomplete or conflicting

---

## Planned Workflow Summary

```text
CI failure
→ Failure Diagnosis Agent inspects evidence
→ Classification and report generation
→ Human approval gate
→ Developer Agent (approved correction only)
→ Tester Agent
→ Reviewer Agent
→ Final CI validation
```

This workflow is intentionally conservative: diagnosis cannot repair, bypass, or weaken the CI system without explicit human approval.

---

## Human Approval Items

This plan requires human confirmation on:

1. which controlled failure scenario will be exercised
2. what evidence is sufficient to support a diagnosis
3. whether a suspected failure is a true regression or a known baseline issue
4. whether a targeted correction is approved
5. whether the proposed fix remains within the exercise scope

---

## Final Status

PLANNER STATUS: READY FOR HUMAN APPROVAL

No implementation, workflow modification, dependency change, or repository-setting change is performed in this planning stage.
