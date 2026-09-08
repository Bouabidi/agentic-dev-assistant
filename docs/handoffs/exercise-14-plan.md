# Exercise 14 — Agent Autonomy Levels & Approval Gates

## Objective

Define and validate explicit autonomy levels for the agentic development workflow.

The exercise demonstrates that agent authority must be proportional to the risk of the requested action and that higher-risk actions require explicit human approval.

## Scope

Exercise 14 focuses on governance, authority boundaries, approval gates, and traceability.

No application feature is required.

No production deployment is required.

No existing security or CI policy will be weakened.

## Autonomy Model

### Level 0 — Read-only

L0 agents may inspect repository content, analyze evidence, execute safe validation commands when explicitly permitted, and produce reports or recommendations.

L0 agents must not modify files.

Agents assigned to L0:

* Planner
* Diagnosis
* Tester
* Reviewer

### Level 1 — Bounded execution

L1 agents may perform a narrowly defined, explicitly allowlisted modification only after human approval.

The Remediation Agent is classified as L1.

L1 restrictions:

* only the human-approved target file may be modified;
* only the approved change may be performed;
* no alternative remediation may be selected autonomously;
* no dependency changes;
* no CI/security-policy changes;
* no protected-file changes;
* no commit;
* no push;
* no merge;
* no deployment;
* no repository-setting changes.

### Level 2 — Multi-step execution

L2 represents multiple related modifications or a broader execution scope.

Exercise 14 does not authorize an L2 agent.

Any future L2 workflow must have an explicitly defined scope, stronger guardrails, and explicit human approval before execution.

## Authority Matrix

| Role        | Autonomy             | Read |           Modify | Test | Commit | Push | Merge | Deploy |
| ----------- | -------------------- | ---: | ---------------: | ---: | -----: | ---: | ----: | -----: |
| Planner     | L0                   |  Yes |               No |   No |     No |   No |    No |     No |
| Diagnosis   | L0                   |  Yes |               No |  Yes |     No |   No |    No |     No |
| Developer   | Controlled execution |  Yes |              Yes |  Yes |     No |   No |    No |     No |
| Tester      | L0                   |  Yes |               No |  Yes |     No |   No |    No |     No |
| Reviewer    | L0                   |  Yes |               No |  Yes |     No |   No |    No |     No |
| Remediation | L1                   |  Yes | Allowlisted only |  Yes |     No |   No |    No |     No |
| Human       | Full authority       |  Yes |              Yes |  Yes |    Yes |  Yes |   Yes |    Yes |

## Approval Gates

### Gate 1 — Planning approval

The Planner produces an implementation plan.

The human reviews and explicitly approves the plan before implementation begins.

### Gate 2 — Remediation approval

Diagnosis produces evidence and a recommendation.

The human must explicitly approve the exact remediation scope before the Remediation Agent executes it.

### Gate 3 — Release approval

Tester independently validates the result.

Reviewer independently evaluates the complete workflow.

The human retains final authority to merge and release.

## Existing Agent Workflow

The Exercise 14 workflow is:

```text
Human request
    ↓
Planner L0
    ↓
Human approval
    ↓
Developer controlled implementation
    ↓
Tester L0
    ↓
Reviewer L0
    ↓
Human release gate
    ↓
GitHub Actions
```

Failure-handling workflow:

```text
Failure
    ↓
Diagnosis L0
    ↓
Human approval
    ↓
Remediation L1
    ↓
Tester L0
    ↓
Reviewer L0
    ↓
Human release gate
```

## Guardrails

The following boundaries remain mandatory:

* protected agent definitions must not be modified without explicit policy authorization;
* MCP permissions must remain least-privilege;
* application dependencies must not be changed unless explicitly required by an approved task;
* CI security and policy gates must not be bypassed;
* agents must not perform Git commit, push, merge, or deployment actions;
* human approval must precede bounded remediation;
* Tester and Reviewer must remain independent from the agent performing remediation;
* all decisions and validation evidence must be traceable through handoff documents.

## Verification Strategy

Exercise 14 will verify:

1. Each agent has an explicit autonomy classification.
2. Each agent has an explicit authority boundary.
3. L0 agents are read-only.
4. Remediation is explicitly classified as L1.
5. L1 execution requires human approval.
6. L1 execution is restricted to an allowlisted scope.
7. No agent receives commit, push, merge, or deployment authority.
8. Tester remains independent.
9. Reviewer remains independent.
10. GitHub Actions remains an automated policy and quality gate.
11. Existing security boundaries are preserved.
12. The workflow provides traceability from request through release.

## Expected Deliverables

* `docs/exercise-14-evaluation.md`
* `docs/handoffs/exercise-14-plan.md`
* Updated agent autonomy documentation or configuration only where required by the evaluation.
* Tester handoff containing independent validation evidence.
* Reviewer decision.
* Hosted CI evidence.
* Final human release decision.

## Success Criteria

Exercise 14 is successful when the repository demonstrates a clearly documented and enforceable autonomy model in which:

* authority is explicitly assigned;
* higher-risk actions require stronger controls;
* human approval is required before bounded remediation;
* agents cannot exceed their defined authority;
* independent validation remains in place;
* security and CI boundaries are preserved;
* the complete workflow is auditable and traceable.

## Out of Scope

The following are explicitly out of scope:

* production deployment;
* autonomous merging;
* autonomous pushing;
* autonomous commits;
* unrestricted agent autonomy;
* weakening CI policy;
* modifying protected security boundaries;
* introducing unnecessary application features.
