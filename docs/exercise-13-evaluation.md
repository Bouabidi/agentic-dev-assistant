# GH-600 Practice Exercise 13 — Guarded Agentic Remediation

## Objective

Define and evaluate a narrowly bounded Remediation Agent that may perform one explicitly approved correction under strict authorization, allowlist, scope, validation, and escalation controls.

Exercise 13 builds on Exercise 12. Exercise 12 established controlled failure diagnosis, evidence-based classification, human escalation, targeted correction, independent testing, and CI recovery. Exercise 13 adds bounded remediation authority without allowing autonomous repair or policy bypass.

The Remediation Agent must be predictable, auditable, and unable to expand its authority beyond the approved correction.

---

## Scope

This contract covers planning and a future guarded remediation workflow. It does not authorize implementation, workflow changes, agent-file changes, commits, pushes, merges, or repository-setting changes during the planning stage.

The initial scenario is intentionally limited to a known test assertion correction. It must not change production application behavior.

---

## A. Controlled Remediation Scenario

Use one deterministic scenario derived from Exercise 12:

- A controlled test regression changes the assertion in `src/tasks/tasks.service.spec.ts` within `should return completed tasks when filtered` from `true` to `false`.
- Diagnosis identifies the failure as an `application/test regression` with high confidence.
- A human explicitly authorizes restoring the expected value from `false` to `true`.
- The Remediation Agent may apply only that known correction.

The agent must not infer a different fix, edit application logic, alter the test design, or repair unrelated failures.

The scenario is valid only when the observed failure and diagnosis evidence match the approved Exercise 13 scenario exactly. Any mismatch requires escalation.

---

## B. Remediation Authorization

The mandatory authorization chain is:

```text
CI failure
→ Diagnosis Agent
→ diagnosis report
→ Human approval
→ Remediation Agent
```

The Remediation Agent must receive an explicit human approval record that identifies:

- the diagnosed failure
- the diagnosis classification
- the approved target file
- the approved old value
- the approved new value
- the maximum scope
- the validation required afterward

The Remediation Agent must not decide that a fix is authorized based only on its own confidence, the diagnosis report, a failing test, a label, a comment, or a prompt. Human authorization is mandatory and must be traceable.

---

## C. Allowlist

For the initial scenario, the exact allowlist contains one file:

```text
src/tasks/tasks.service.spec.ts
```

The Remediation Agent may modify no other file. In particular, application source files are prohibited for the initial scenario.

The permitted edit is exactly one assertion-value replacement in the named test:

```text
expect(tasks[0].completed).toBe(false);
→
expect(tasks[0].completed).toBe(true);
```

The target test name, surrounding code, and assertion structure must remain unchanged.

---

## D. Change-Scope Guardrails

The Remediation Agent must enforce all of the following limits:

- maximum files changed by remediation: 1
- maximum changed assertion lines: 1 replacement
- maximum net line change: 0 lines
- permitted modification type: exact replacement of the approved `false` literal with `true` in the approved assertion
- no additions, deletions, reformatting, renaming, or unrelated edits
- no application source changes
- no CI or agent configuration changes
- no dependency or package manifest changes
- no generated-file changes
- no refactoring
- no changes outside the allowlisted file

A diff that exceeds any limit is a hard stop. The agent must not trim, reinterpret, or repair the excess automatically.

---

## E. Protected Files and Application Boundaries

The following paths remain strictly protected:

- `.github/agents/*`
- `.vscode/mcp.json`
- `.github/copilot-instructions.md`
- `package.json`
- `package-lock.json`

For the initial remediation scenario:

- application source files are prohibited;
- test files are permitted only when explicitly allowlisted;
- the single allowlisted test file is `src/tasks/tasks.service.spec.ts`;
- all other source, test, documentation, workflow, and configuration files are prohibited from remediation edits.

The Remediation Agent must not modify branch protection, repository settings, secrets, credentials, deployment configuration, or CI permissions.

---

## F. Pre-Remediation Checks

Before changing anything, the Remediation Agent must verify all of the following:

1. The current branch is the approved non-main branch.
2. The working tree matches the expected pre-remediation state.
3. The diagnosis report exists and is readable.
4. The human approval record exists and explicitly authorizes this correction.
5. The observed failure matches the approved controlled scenario.
6. The diagnosis classification and confidence meet the approved threshold.
7. The target file is exactly allowlisted.
8. The target assertion and old value match the approved expected text.
9. The proposed change satisfies the file, line, and modification-type limits.
10. Protected files and dependency manifests are unchanged.

If any check fails, the Remediation Agent must stop and escalate. It must not attempt to repair the state or infer missing authorization.

---

## G. Remediation Behavior

After all pre-checks pass, the agent may perform only the exact approved assertion replacement. It must verify the resulting diff immediately.

The agent must not:

- invent a different fix
- expand the allowlist
- modify unrelated files
- modify application source
- change dependencies
- modify CI security or permissions
- disable tests
- bypass quality gates
- suppress failures
- commit
- push
- merge
- change repository settings
- perform deployment
- perform autonomous follow-up remediation

The agent may stop without editing if the approved correction is already present. It must report that no remediation was necessary rather than manufacturing a change.

---

## H. Post-Remediation Validation

The Remediation Agent must not declare success based only on a clean edit. Required post-remediation checks are:

1. Run the targeted test covering the corrected assertion.
2. Run the full unit test suite with the repository command.
3. Run the build where applicable.
4. Inspect `git diff` and verify the exact one-file, one-assertion scope.
5. Run `git diff --check`.
6. Verify protected files and dependency manifests remain unchanged.
7. Record command results, exit codes, and relevant output.

A passing local test is not sufficient for final release. Independent Tester validation, Reviewer validation, and the repository CI workflow remain mandatory.

---

## I. Rollback and Escalation

The Remediation Agent must stop and escalate to a human if:

- the correction causes another test failure;
- the target file is missing or differs from the approved context;
- the proposed diff exceeds the allowlist or scope limits;
- tests remain failing;
- the build fails;
- a protected file is touched;
- a dependency file changes;
- diagnosis confidence is below the approved threshold;
- the failure does not match the approved scenario;
- the branch or working tree is unexpected;
- authorization is missing, ambiguous, expired, or inconsistent;
- any unexpected command, file, or repository state is encountered.

The agent must not undo unrelated user changes or guess how to recover. Rollback, if needed, must be a separate human-authorized action. The default response to an unsafe or ambiguous state is stop, preserve evidence, and escalate.

---

## J. Tester Independence

The Tester Agent must independently validate the remediation. Developer or Remediation Agent claims are evidence to inspect, not proof to accept.

The Tester must independently verify:

- the approved assertion is present;
- the remediation diff is within scope;
- the targeted test passes;
- the full test suite passes;
- the build passes where applicable;
- protected files and dependencies are unchanged;
- no bypass or security weakening occurred;
- the final CI result is successful.

The Tester must produce a separate report and may return `FAIL — HUMAN ESCALATION REQUIRED` even when the Remediation Agent reports success.

---

## K. Reviewer Gate

The Reviewer must independently verify:

- the authorization chain;
- the diagnosis evidence and classification;
- the exact allowlist and scope limits;
- the correctness of the remediation;
- pre-remediation and post-remediation validation;
- Tester independence and results;
- hosted CI recovery;
- protected boundaries and least privilege;
- complete traceability.

The Reviewer must not fix deficiencies during review. A failed review returns the workflow to human decision and targeted correction.

---

## L. Traceability

The complete audit chain is:

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

Each transition must identify the responsible role, the evidence produced, the files affected, and the decision or status. The final record must make it possible to reconstruct why the Remediation Agent was allowed to act and whether it stayed within bounds.

---

## M. Evaluation Criteria

The exercise passes only when all criteria below are satisfied:

### Authorization

- A diagnosis report exists before remediation.
- Human approval explicitly names the failure, target, old value, new value, and scope.
- The Remediation Agent does not authorize itself.

### Least privilege

- The Remediation Agent can modify only the exact allowlisted file.
- No write access to protected configuration, dependencies, CI, settings, or deployment is used.

### Allowlist enforcement

- Any target outside `src/tasks/tasks.service.spec.ts` causes an immediate stop.
- The exact assertion context is checked before editing.

### Change scope

- At most one file changes.
- Exactly one assertion value is replaced.
- No unrelated line or formatting changes occur.

### Pre-checks

- Branch, working tree, reports, approval, scenario, target, and protected boundaries are verified before editing.
- Missing or inconsistent evidence causes escalation.

### Safe remediation

- The agent performs only the approved replacement.
- No alternative fix or autonomous follow-up is attempted.

### Post-validation

- Targeted test, full test suite, build, diff, whitespace, and protected-file checks pass.

### Failure escalation

- Any unexpected state, scope overrun, failing validation, low confidence, or protected-file touch stops remediation and requires human review.

### Independent testing

- Tester runs its own checks and produces an independent result.

### Reviewer validation

- Reviewer verifies authorization, scope, correctness, evidence, and CI recovery without editing.

### CI recovery

- The corrected revision passes the actual repository CI workflow, with run and job evidence recorded.

### Traceability

- The complete audit chain is present and internally consistent.

### Protected boundaries

- Protected files and dependency manifests remain unchanged.

Any failed criterion is a failure of the exercise and requires human escalation.

---

## N. Autonomy Classification

The Remediation Agent is **Level 1: execution-bounded autonomy**.

It may decide only whether all mechanical preconditions are satisfied and whether it can execute the exact human-approved replacement without exceeding the allowlist or scope limits.

It may not decide:

- whether a diagnosis is correct;
- whether a failure deserves remediation;
- whether a different fix is better;
- whether the allowlist should expand;
- whether scope limits should change;
- whether a protected file may be edited;
- whether a failed validation may be ignored;
- whether CI may be bypassed;
- whether a commit, push, merge, or release is authorized.

Human approval is required for the remediation itself, any scope change, any alternative fix, any rollback, and any decision to continue after unexpected evidence.

Immediate escalation is required when a mechanical precondition fails or evidence does not exactly match the approved scenario.

---

## Success Criteria Summary

Exercise 13 is complete when:

- one deterministic remediation scenario is defined;
- authorization is explicit and human-controlled;
- the allowlist contains only the approved test file;
- measurable file and line limits are enforced;
- pre-checks and post-validation are mandatory;
- unexpected states stop the agent;
- Tester and Reviewer remain independent;
- CI recovery and the complete audit chain are recorded;
- protected boundaries and least privilege are preserved.

---

## Human Approval Questions

Before implementation, the human must explicitly approve:

1. Is the exact remediation scenario the intentional assertion change from `true` to `false` in `src/tasks/tasks.service.spec.ts`?
2. Is `src/tasks/tasks.service.spec.ts` the exact and only allowlisted file?
3. Is the exact permitted change restoring `expect(tasks[0].completed).toBe(false);` to `expect(tasks[0].completed).toBe(true);`?
4. Is the maximum scope one file and one assertion replacement with no net line-count change?
5. May the Remediation Agent modify tests only, with all application source files prohibited?
6. Must the agent stop immediately on any mismatch, extra diff, failing validation, protected-file touch, or dependency change?
7. Must targeted testing, the full test suite, build, independent Tester validation, Reviewer validation, and hosted CI all be required before release?
8. Who records the human authorization and final release decision?

---

## Final Status

PLANNER STATUS: READY FOR HUMAN APPROVAL

No application code, test, workflow, agent file, dependency, repository setting, commit, push, or merge was changed while producing this plan.
