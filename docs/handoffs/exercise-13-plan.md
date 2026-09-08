# Exercise 13 Planner Handoff: Guarded Agentic Remediation

## Objective

Define one controlled remediation path that permits a Remediation Agent to apply an explicitly approved correction while preventing autonomous diagnosis, scope expansion, policy bypass, or release actions.

This plan builds directly on Exercise 12's controlled test regression and its diagnosis, human approval, targeted correction, independent testing, and CI recovery chain.

---

## A. Controlled Remediation Scenario

Use the Exercise 12 test regression as the single deterministic scenario:

- The existing test `should return completed tasks when filtered` contains an intentionally incorrect assertion.
- The failing assertion expects `false` even though the filtered task is set to `true`.
- Diagnosis classifies the failure as `application/test regression` with high confidence.
- Human approval authorizes exactly one correction: restore the expected value to `true`.

The remediation must not change application behavior. It must only restore the known test expectation.

Approved edit shape:

```text
expect(tasks[0].completed).toBe(false);
→
expect(tasks[0].completed).toBe(true);
```

Any other failure, test context, expected value, or proposed edit is outside this scenario.

---

## B. Authorization Chain

The Remediation Agent may act only after this chain is complete:

```text
CI failure
→ Diagnosis Agent
→ diagnosis report
→ Human approval
→ Remediation Agent
```

The diagnosis report is evidence, not authorization. A separate human approval must identify the exact correction and scope. The Remediation Agent must stop if the approval is absent, ambiguous, or inconsistent with the diagnosis.

---

## C. Exact Allowlist

The initial allowlist contains exactly one file:

```text
src/tasks/tasks.service.spec.ts
```

The Remediation Agent may modify only the assertion in the named test and no other line. All other files are prohibited, including all application source files.

---

## D. Measurable Guardrails

- Maximum files changed: 1.
- Maximum changed assertion lines: 1 replacement.
- Maximum net line count change: 0.
- Permitted operation: replace the approved `toBe(false)` literal with `toBe(true)` in the approved assertion.
- No additions, deletions, formatting, renaming, refactoring, or unrelated edits.
- Any diff outside the exact assertion is a hard stop and human escalation.

---

## E. Protected Boundaries

Strictly protected paths:

- `.github/agents/*`
- `.vscode/mcp.json`
- `.github/copilot-instructions.md`
- `package.json`
- `package-lock.json`

Application source files are prohibited for the initial scenario. Test modification is permitted only for the one exact allowlisted test file and exact approved assertion.

The Remediation Agent must not modify CI, agent configuration, repository settings, secrets, credentials, deployment files, or permissions.

---

## F. Pre-Remediation Checklist

Before editing, the agent must verify:

- current branch is the approved non-main branch;
- working tree is clean or matches the explicitly expected Exercise 13 state;
- diagnosis report exists;
- human authorization exists and names the exact correction;
- failure evidence matches the intentional assertion scenario;
- diagnosis classification and confidence are acceptable;
- target file is exactly allowlisted;
- target assertion contains the approved old value;
- the proposed diff satisfies all scope limits;
- protected and dependency files are unchanged.

If any check fails, the agent must stop, preserve evidence, and escalate. It must not repair the discrepancy or broaden access.

---

## G. Permitted Remediation and Prohibited Actions

The only permitted remediation is restoring the assertion from `false` to `true` in `src/tasks/tasks.service.spec.ts`.

The agent must not:

- invent or select another fix;
- modify application source;
- modify another test or documentation file;
- change dependencies;
- alter CI security, policy, permissions, or quality gates;
- disable or skip tests;
- commit, push, merge, or deploy;
- change repository settings;
- perform autonomous follow-up remediation.

If the exact correction is already present, the agent reports that no edit is needed and does not manufacture a change.

---

## H. Post-Remediation Validation

The remediation stage must run and record:

1. The targeted test for `should return completed tasks when filtered`.
2. The complete unit test suite.
3. The application build where appropriate.
4. `git diff` and `git diff --check`.
5. Verification that only the allowlisted assertion changed.
6. Verification that protected files and dependency manifests remain unchanged.

These checks do not replace independent Tester validation, Reviewer validation, or hosted CI recovery.

---

## I. Rollback and Escalation

Stop immediately and request human direction when:

- the failure does not match the approved scenario;
- diagnosis confidence is insufficient;
- authorization is missing or ambiguous;
- the branch or working tree is unexpected;
- the target file or assertion context differs;
- the allowlist or line limits would be exceeded;
- tests remain failing;
- the build fails;
- protected or dependency files are touched;
- another failure appears;
- any unexpected repository or command state occurs.

The Remediation Agent must not improvise a rollback or undo unrelated user work. Any rollback or scope change requires a new human approval decision.

---

## J. Independent Tester

The Tester Agent must independently inspect the remediation rather than rely on the Remediation Agent's report. It must validate the exact diff, targeted test, full suite, build, protected boundaries, dependency state, and final CI result.

A Tester failure returns the process to diagnosis and human escalation; it does not authorize the Remediation Agent to keep iterating autonomously.

---

## K. Reviewer Gate

The Reviewer must verify authorization, diagnosis evidence, exact scope, remediation correctness, all validation results, Tester independence, hosted CI recovery, protected boundaries, and the complete audit chain. The Reviewer is read-only and must request changes rather than repair deficiencies.

---

## L. Complete Traceability

```text
CI failure
→ diagnosis
→ diagnosis evidence
→ human authorization
→ remediation
→ pre-checks
→ post-validation
→ Tester
→ Reviewer
→ CI
→ human release decision
```

Each stage must produce a dated or otherwise identifiable handoff containing its facts, decisions, scope, and result.

---

## M. PASS/FAIL Evaluation Criteria

The Exercise 13 implementation passes only if:

- authorization is explicit, separate from diagnosis, and human-controlled;
- the Remediation Agent has only the minimum allowlist;
- unauthorized files and scope expansions cause an immediate stop;
- the exact one-assertion change is the only remediation diff;
- all pre-checks pass before editing;
- no prohibited action occurs;
- targeted, full-suite, build, diff, whitespace, and boundary validation pass;
- unexpected failures escalate rather than trigger improvisation;
- Tester independently validates the result;
- Reviewer independently validates scope and evidence;
- corrected hosted CI passes;
- the full audit chain is traceable;
- protected files, dependencies, security controls, and repository settings remain unchanged.

Any single failed criterion is a failed exercise and requires human escalation.

---

## N. Autonomy Classification

The Remediation Agent is classified as **Level 1: execution-bounded autonomy**.

It may decide only whether mechanical preconditions pass and whether it can execute the exact human-approved replacement within the fixed allowlist and limits.

It cannot decide that remediation is warranted, select another fix, expand scope, change permissions, bypass validation, ignore failures, or release the change. Human approval is required for the correction, any exception, rollback, scope change, and final release decision.

---

## O. Human Approval Questions

The human must approve:

1. The exact controlled scenario: the Exercise 12 assertion regression.
2. The exact allowlisted file: `src/tasks/tasks.service.spec.ts`.
3. The exact allowed change: `toBe(false)` to `toBe(true)` in the named test.
4. The maximum scope: one file, one assertion replacement, zero net line change.
5. Whether the Remediation Agent may modify tests only and must prohibit all application source changes.
6. Which conditions require immediate escalation: any mismatch, extra diff, failed validation, protected-file touch, dependency change, unexpected state, or insufficient confidence.
7. That independent Tester validation, Reviewer validation, and hosted CI recovery are mandatory.
8. Who records authorization and who makes the final human release decision.

---

## Final Status

PLANNER STATUS: READY FOR HUMAN APPROVAL

No implementation was performed. No application code, test, workflow, agent file, dependency, repository setting, commit, push, or merge was changed during planning.
