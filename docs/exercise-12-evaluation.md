# GH-600 Practice Exercise 12 — Agentic CI Failure Diagnosis & Human Escalation

## Objective

Design and validate a controlled workflow in which a Failure Diagnosis Agent reviews a failed CI run, produces an evidence-based failure handoff, and escalates to a human before any correction is made.

This exercise demonstrates:

- evidence-based failure triage
- controlled autonomy
- human-in-the-loop escalation
- least privilege in CI investigations
- agentic diagnosis without remediation authority
- independent validation and review
- traceability from failure to recovery
- auditability for CI decisions

---

## Scope

The exercise is planning-only and must not modify application source code, tests, GitHub Actions workflow definitions, dependency manifests, or repository settings.

The Failure Diagnosis Agent is allowed to inspect CI artifacts and repository state, but it is not allowed to repair the code or bypass the quality gates.

The workflow is intentionally limited to diagnosis, human approval, and the controlled correction process after approval.

---

## Controlled Failure Scenarios

The exercise must use controlled failure scenarios that can be introduced safely and described in a reviewable way without changing production behavior or weakening protection.

Examples of approved failure scenarios for this exercise include:

1. Application/test regression introduced in a temporary branch or local-only reproduction
   - a failing unit or e2e test result that is clearly attributable to code changes
2. TypeScript/build failure
   - a type error or compile error in project code
3. Dependency/install failure
   - lockfile mismatch, missing dependency, package-manager error, or environment issue
4. CI configuration failure
   - workflow syntax, action configuration, or runner issue unrelated to application behavior
5. Policy/scope violation
   - protected file change or dependency manifest change detected by the policy gate
6. Known baseline failure
   - a pre-existing known issue that is unrelated to the selected exercise work
7. Transient/infrastructure failure
   - runner instability, network issue, timeout, or external service unavailability
8. Insufficient evidence
   - the run does not provide enough facts to support a reliable classification

For Exercise 12, the scenario should be intentionally non-destructive and should not permanently weaken the CI gate.

---

## Required Behavior of the Failure Diagnosis Agent

Before making a diagnosis, the agent must inspect evidence and distinguish facts from hypotheses.

### Required evidence sources

The diagnosis agent must inspect, where available:

- CI job name and failing step
- exact command that failed
- exit code
- relevant log output
- changed files in the failing PR or commit
- relevant commit and PR context
- test result summaries
- build output
- policy/scope gate output
- known baseline behavior for the repository
- relevant workflow file or configuration context

### Evidence rules

The agent must clearly separate:

- confirmed facts
- observed symptoms
- inferred cause
- speculative hypotheses

The agent must not present a guess as a diagnosis if the evidence is incomplete.

If evidence is insufficient, the agent must classify the issue as `insufficient evidence` and request human review.

---

## Failure Classification

The diagnosis agent must classify the issue where evidence permits, using the following categories:

- application/test regression
- TypeScript/build failure
- dependency/install failure
- CI configuration failure
- policy/scope violation
- known baseline failure
- transient/infrastructure failure
- insufficient evidence

### Decision rules

- If the failing command is a test or assertion problem and the code or tests changed in the relevant scope, classify as `application/test regression`.
- If the failure occurs in TypeScript compilation or NestJS build execution, classify as `TypeScript/build failure`.
- If the failure occurs during install, lockfile resolution, package resolution, or package-manager setup, classify as `dependency/install failure`.
- If the workflow definition, runner setup, or action configuration is the issue, classify as `CI configuration failure`.
- If protected files or dependency files are changed against policy, classify as `policy/scope violation`.
- If the failure matches a known baseline issue in the repository and is unrelated to the current exercise, classify as `known baseline failure`.
- If the issue is caused by runner instability, a time-out, network interruption, or lost environment state, classify as `transient/infrastructure failure`.
- If key facts are missing or contradictory, classify as `insufficient evidence`.

---

## Diagnosis Output Requirements

The Diagnosis Agent must produce a structured handoff report with the following sections:

1. Failure summary
   - concise description of the failing CI run
2. Classification
   - selected category from the allowed set
3. Evidence
   - facts from the CI logs, job status, changed files, and repository state
4. Suspected root cause
   - the most likely root cause, stated as a hypothesis if not fully proven
5. Confidence
   - high / medium / low
6. Affected files
   - relevant files suspected to be involved
7. Recommended next action
   - the next action the human should consider, without performing it automatically
8. Unresolved questions
   - missing facts or decisions
9. Human decision required
   - explicitly state that a human must decide whether analysis can proceed to a correction

The diagnosis report must be traceable, evidence-based, and risk-aware.

---

## Human Escalation Requirements

The diagnosis agent must not:

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
- authorize or bypass failed gates

A human approval gate is mandatory before any correction is made.

The human decides:

- whether the evidence supports a correction
- whether the issue should be treated as a true regression or a baseline/infrastructure failure
- whether an approved correction is safe, narrow, and within scope
- whether the issue needs a targeted developer/tester/reviewer cycle

---

## Correction Workflow

After human approval:

Human approval
→ Developer Agent
→ Tester Agent
→ Reviewer Agent
→ CI validation

If Tester fails:

- classify the new failure
- request human approval
- apply a targeted correction
- re-run Tester
- then Reviewer
- then CI validation

This workflow ensures failures are not silently ignored and the human remains the final decision-maker.

---

## Traceability Requirement

Every major stage must be traceable:

```text
CI failure
→ diagnosis report
→ human decision
→ approved correction
→ independent testing
→ reviewer validation
→ final CI result
```

The evidence chain must allow a reviewer to answer:

- what failed
- what evidence was inspected
- what was classified
- what human decision was made
- what correction was allowed
- what validation was performed afterward

---

## Protected Boundaries

The exercise must not introduce:

- new application features
- new dependencies
- deployment automation
- automatic merge
- autonomous remediation
- unrelated refactoring

Protected files remain protected:

- .github/agents/*
- .vscode/mcp.json
- .github/copilot-instructions.md
- package.json
- package-lock.json

These files must not be modified as part of the diagnosis process or the correction workflow.

---

## Evaluation Criteria

The exercise is considered successful only if the implementation meets the following measurable pass/fail criteria:

### 1. Failure detection

- The diagnosis agent can identify the failed job and failed step.
- The agent identifies the command that failed and the exit status or equivalent evidence.

### 2. Evidence quality

- The diagnosis agent references actual CI output and repository state, not assumptions.
- The report distinguishes between confirmed facts and hypotheses.

### 3. Correct classification

- The agent chooses an allowed category that matches the evidence.
- The classification is not a guess when the evidence is incomplete.

### 4. Human escalation

- The agent stops before making a modification.
- A human decision is explicitly required before any fix.

### 5. Least privilege

- The diagnosis workflow reads evidence and does not write to the repository or workflow.
- No unnecessary permissions are requested or implied.

### 6. Correction control

- The correction workflow requires explicit human approval.
- The correction is narrow and targeted.
- No automatic remediation occurs.

### 7. Independent testing

- The developer and tester roles are independently invoked after approval.
- The tester validates the actual fix and reports the result.

### 8. Reviewer validation

- A reviewer checks the fix against the contract and the evidence.
- The review confirms the fix is within scope and does not bypass policy gates.

### 9. CI recovery

- CI is re-run after the approved fix.
- Recovery is evidence-based and traceable.

### 10. Traceability

- The full chain from CI failure to review to CI recovery is documented and reviewable.

### 11. Scope discipline

- No unrelated application changes are introduced.
- No dependency, deployment, or workflow bypass changes are made without human approval.

---

## GH-600 Learning Objectives

This exercise connects directly to the course goals:

- agent failure handling
- controlled autonomy
- human-in-the-loop decision making
- least privilege and safe read-only diagnosis
- evidence-based reasoning
- multi-agent coordination across diagnosis, development, testing, and review
- independent validation and reviewer sign-off
- auditability and traceability of corrections
- safe escalation when confidence is low or evidence is incomplete

---

## Success Criteria Summary

Exercise 12 is complete when:

- the diagnosis workflow is clearly defined;
- the failure classification categories are explicit;
- the diagnosis output structure is required and evidence-based;
- human approval is mandatory before any fix;
- the correction workflow is controlled and traceable;
- protected files and dependency files remain protected;
- no implementation or workflow changes are made during planning;
- the plan is ready for human approval before any execution begins.

---

## Final Guidance for the Human

This exercise is about disciplined investigation and escalation, not autonomous remediation. A failure diagnosis agent should be evidence-driven, transparent about uncertainty, and strictly prevented from weakening CI or bypassing policy controls. The human remains the authority for any subsequent correction.
