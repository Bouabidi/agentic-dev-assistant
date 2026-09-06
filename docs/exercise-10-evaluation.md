# GH-600 Practice Exercise 10 — Multi-Agent Coordination & Handoff

## Objective

Introduce a controlled multi-agent workflow in which Planner, Developer, Tester, and Reviewer agents exchange explicit artifacts and operate under least-privilege boundaries.

The exercise must demonstrate:

* multi-agent coordination
* explicit artifact handoff
* human approval gates
* independent validation
* failure classification and escalation
* traceability
* regression safety
* scope discipline

---

## Feature

Add a task reporting endpoint:

GET /tasks/report

The exact response contract must be defined by the Planner Agent and approved by the human before implementation.

The report may aggregate existing task information such as:

* total tasks
* completed tasks
* incomplete tasks
* status counts
* priority counts
* category counts

The Developer must implement only the approved contract.

---

## Required Agent Handoff Artifacts

### Planner

The Planner must produce:

docs/handoffs/exercise-10-plan.md

The artifact must contain:

* objective
* approved API contract proposal
* affected files
* implementation approach
* validation strategy
* risks
* regression considerations
* explicit assumptions
* questions requiring human decisions

The Planner must not modify application source code.

---

### Developer

After implementation, the Developer must produce:

docs/handoffs/exercise-10-developer-report.md

The report must contain:

* implementation summary
* files changed
* tests added or changed
* validation commands
* validation results
* known failures
* scope verification
* protected-file verification

The Developer must not commit, push, or merge.

---

### Tester

The Tester must independently verify the implementation.

The Tester must produce:

docs/handoffs/exercise-10-test-report.md

The report must contain:

* test strategy
* independent validation results
* functional verification
* regression verification
* edge-case verification
* known/pre-existing failures
* PASS or FAIL decision
* explicit blockers if FAIL

The Tester must not modify application code.

---

### Reviewer

The Reviewer must independently inspect:

* approved plan
* implementation
* Developer report
* Tester report
* git diff
* scope boundaries

The Reviewer must produce:

docs/handoffs/exercise-10-review.md

The review must contain:

* contract compliance
* architecture assessment
* test-quality assessment
* scope assessment
* agent-policy compliance
* handoff quality
* final APPROVE or REQUEST CHANGES decision

The Reviewer must not modify application code.

---

# Human Approval Gates

The following actions require human approval:

1. Planner → Developer
2. Tester FAIL → Developer correction
3. Tester PASS → Reviewer
4. Reviewer APPROVE → Commit/PR/Merge

Agents must not bypass these gates.

---

# Protected Files

The following files must remain unchanged unless explicitly authorized:

.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md
package.json
package-lock.json

No dependency changes are permitted.

---

# Functional Requirements

The final implementation must:

1. Expose GET /tasks/report.
2. Follow the human-approved response contract.
3. Use existing Task domain definitions.
4. Correctly aggregate the existing task data.
5. Handle an empty task collection.
6. Preserve all existing task endpoints.
7. Preserve existing status/completed invariants.
8. Preserve existing priority behavior.
9. Preserve existing category behavior.
10. Preserve existing tag behavior.
11. Preserve existing due-date and estimate behavior.
12. Avoid mutating tasks while generating the report.

---

# Regression Requirements

All existing tests must remain valid.

Known baseline failures related to:

description: undefined

must be distinguished from Exercise 10 failures if they are still present.

Agents must not "fix" unrelated baseline failures as part of this exercise.

---

# Validation Requirements

Developer validation should include:

npm test
npm run build

and appropriate focused tests.

Tester must independently execute validation rather than relying only on Developer results.

Reviewer must inspect the evidence rather than assuming PASS.

---

# Failure Handling

If Tester reports FAIL:

1. Tester documents concrete blockers.
2. Human reviews the failure.
3. Human authorizes targeted correction.
4. Developer addresses only approved blockers.
5. Developer updates the handoff report.
6. Tester re-validates independently.
7. Reviewer proceeds only after Tester PASS.

---

# Success Criteria

Exercise 10 is complete only when:

* Planner artifact exists.
* Human approved the plan.
* Developer implemented the approved contract.
* Developer handoff artifact exists.
* Tester independently validates the implementation.
* Tester handoff artifact exists.
* Any failures were handled through the escalation protocol.
* Reviewer independently approves.
* Reviewer handoff artifact exists.
* Human commits and pushes the feature.
* Pull request is created.
* CI passes.
* Pull request is merged.
* Local main is synchronized with origin/main.

---

# Agent Authority Model

Planner:

* read: YES
* modify source: NO
* test: NO
* commit: NO
* push: NO
* merge: NO

Developer:

* read: YES
* modify source/tests: YES
* test: YES
* commit: NO
* push: NO
* merge: NO

Tester:

* read: YES
* modify source: NO
* test: YES
* commit: NO
* push: NO
* merge: NO

Reviewer:

* read: YES
* modify source: NO
* test: YES
* commit: NO
* push: NO
* merge: NO

Human:

* full authority

---

# Traceability

Every agent must reference the previous handoff artifact it consumed.

The chain must be traceable:

exercise-10-plan.md
↓
exercise-10-developer-report.md
↓
exercise-10-test-report.md
↓
exercise-10-review.md

No agent may silently replace or contradict an earlier approved decision.

If a contradiction is discovered, the agent must escalate it rather than silently resolving it.
