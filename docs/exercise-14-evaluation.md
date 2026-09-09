# Exercise 14 — Agent Autonomy Levels & Approval Gates

## Evaluation Objective

Evaluate whether the repository demonstrates a clearly defined and controlled agent autonomy model.

The evaluation focuses on authority boundaries, human approval gates, least privilege, independent validation, and traceability.

No application feature implementation is required.

---

## Criterion 1 — Autonomy Levels

**Requirement**

The workflow must explicitly define:

* L0 — Read-only
* L1 — Bounded execution
* L2 — Multi-step execution

**Expected result**

Each autonomy level has a clearly defined capability boundary.

**Pass condition**

The autonomy model is documented and distinguishes read-only, bounded execution, and broader multi-step execution.

---

## Criterion 2 — Agent Classification

**Requirement**

Agents must have an explicit autonomy classification.

Expected classification:

| Agent       | Level |
| ----------- | ----- |
| Planner     | L0    |
| Diagnosis   | L0    |
| Tester      | L0    |
| Reviewer    | L0    |
| Remediation | L1    |
| Developer   | L1    |

**Pass condition**

Every participating agent has an explicit autonomy level and the classification is consistent with its responsibilities.

---

## Criterion 3 — L0 Read-Only Boundary

**Requirement**

L0 agents must not modify repository files.

L0 agents may:

* inspect files;
* analyze evidence;
* execute permitted validation commands;
* produce plans, reports, or recommendations.

**Pass condition**

Planner, Diagnosis, Tester, and Reviewer have no modification authority.

---

## Criterion 4 — L1 Bounded Execution

**Requirement**

The Remediation Agent must be classified as L1.

L1 execution must be limited to:

* a human-approved target;
* an explicitly allowlisted change;
* the exact approved remediation.

**Pass condition**

The Remediation Agent cannot autonomously expand the scope or select an alternative remediation.

---

## Criterion 5 — Human Approval Gate

**Requirement**

Human approval must occur before L1 remediation.

The approval must identify:

* the target;
* the authorized change;
* the permitted scope.

**Pass condition**

No L1 remediation is authorized without explicit human approval.

---

## Criterion 6 — Git Authority Boundary

**Requirement**

Agents must not have authority to:

* commit;
* push;
* merge;
* deploy;
* modify repository settings.

**Pass condition**

Git and release authority remains under human control.

---

## Criterion 7 — Protected Boundaries

**Requirement**

The workflow must preserve existing protected boundaries.

Protected areas include:

* `.github/agents/*`;
* `.vscode/mcp.json`;
* `.github/copilot-instructions.md`;
* dependency configuration;
* CI/security policy.

**Pass condition**

The autonomy model does not weaken, bypass, or redefine these protections.

---

## Criterion 8 — Least-Privilege MCP Access

**Requirement**

MCP access must remain least-privilege.

The existing GitHub MCP configuration must remain read-only where configured for Exercise 3.

**Pass condition**

No broader MCP write/admin authority is introduced as part of Exercise 14.

---

## Criterion 9 — Independent Tester

**Requirement**

Testing must remain independent of implementation or remediation.

The Tester:

* may inspect;
* may execute validation;
* must not repair the implementation.

**Pass condition**

Tester validation provides independent evidence.

---

## Criterion 10 — Independent Reviewer

**Requirement**

The Reviewer must independently evaluate the final workflow.

The Reviewer must not modify files or perform release operations.

**Pass condition**

Reviewer provides an explicit:

* `APPROVE`
* or `REQUEST CHANGES`

decision.

---

## Criterion 11 — Automated CI Gates

**Requirement**

GitHub Actions must remain an automated policy and quality gate.

**Pass condition**

The workflow demonstrates that:

* policy validation executes;
* quality validation executes when permitted by the workflow;
* policy violations are not bypassed;
* failed gates block successful completion.

---

## Criterion 12 — Traceability

**Requirement**

The complete workflow must be traceable.

Expected flow:

```text
Request
→ Planner
→ Human approval
→ Developer
→ Tester
→ Reviewer
→ Human release gate
→ CI
```

Failure/remediation flow:

```text
Failure
→ Diagnosis
→ Human approval
→ Remediation
→ Tester
→ Reviewer
→ Human release gate
```

**Pass condition**

The handoff documents provide evidence for the relevant stages.

---

## Criterion 13 — No Unnecessary Autonomy

**Requirement**

Exercise 14 must not introduce broader autonomy merely for convenience.

**Pass condition**

No agent receives permissions beyond those required for its defined responsibility.

---

## Criterion 14 — No Policy Bypass

**Requirement**

A failing policy gate must be treated as a control signal rather than something to bypass.

**Pass condition**

The workflow preserves the existing policy and uses diagnosis and human approval to resolve legitimate issues.

---

## Criterion 15 — Final Repository Integrity

**Requirement**

The final repository must have:

* no unauthorized application changes;
* no unauthorized dependency changes;
* no unauthorized CI changes;
* no unauthorized MCP changes;
* no unauthorized repository-setting changes;
* clean validation results.

**Pass condition**

Independent validation confirms repository integrity.

---

# Evidence Requirements

The final Exercise 14 evidence must include:

1. Exercise 14 evaluation contract.
2. Exercise 14 implementation plan.
3. Agent autonomy classifications.
4. Human approval evidence.
5. Tester validation report.
6. Reviewer decision.
7. Hosted GitHub Actions evidence.
8. Final repository state.

---

# Final Decision

The Exercise 14 result is:

**PASS** — all applicable evaluation criteria are satisfied.

or:

**FAIL** — one or more required criteria are not satisfied.

Any failure must identify:

* criterion number;
* observed evidence;
* expected behavior;
* blocking issue.

---

# Governance Principle

Exercise 14 demonstrates:

> Agent autonomy must be proportional to risk, explicitly bounded, and subject to human control at appropriate approval gates.

Higher autonomy must never be granted merely because it makes the workflow faster.
