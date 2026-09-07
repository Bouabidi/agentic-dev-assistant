# Exercise 13 — Failure Diagnosis Handoff

## Status

**DIAGNOSIS COMPLETE — HUMAN REMEDIATION APPROVAL REQUIRED**

## Scenario

Exercise 13 used the known controlled Exercise 12 test regression.

The intentionally corrupted assertion was:

```ts
expect(tasks[0].completed).toBe(false);
```

The approved correct expectation is:

```ts
expect(tasks[0].completed).toBe(true);
```

## FACTS

* Branch: `exercise-13-guarded-remediation`
* Affected test: `TasksService › should return completed tasks when filtered`
* File: `src/tasks/tasks.service.spec.ts`
* Location: `src/tasks/tasks.service.spec.ts:29`
* Current corrupted assertion during diagnosis:

```ts
expect(tasks[0].completed).toBe(false);
```

* The relevant diff contained exactly one assertion change from `true` to `false`.
* Independent execution of:

```bash
npm test -- --runInBand
```

produced:

```text
Test Suites: 1 failed, 2 passed, 3 total
Tests:       1 failed, 168 passed, 169 total
```

The failure was:

```text
Expected: false
Received: true
```

* `tasks.service.ts` filters using the task's `completed` value.
* The test creates/uses a task whose `completed` value is `true`.
* Filtering for completed tasks therefore returns a task with `completed: true`.
* `git diff --check` passed.
* No application source, dependency, CI, MCP, or repository-setting change was identified in the tracked diff.

## HYPOTHESIS

The most likely cause was the deliberate Exercise 13 controlled regression: the test expectation was changed from `true` to `false` while the application behavior remained unchanged.

## ROOT CAUSE

The intentionally modified assertion was the direct cause of the test failure.

The service behavior remained correct. The assertion contradicted the actual `completed: true` value returned by the service.

This was not an application implementation regression, dependency failure, or CI failure.

## CONFIDENCE

**High**

The exact one-line diff, reproduced test failure, test location, and unchanged service behavior all agree.

## SCOPE

Directly implicated:

* `src/tasks/tasks.service.spec.ts`
* the single assertion in `TasksService › should return completed tasks when filtered`

Not implicated:

* application source
* dependencies
* CI workflow
* `.vscode/mcp.json`
* `.github/copilot-instructions.md`
* repository settings

The Exercise 13 agent definitions and evaluation artifacts are workflow infrastructure and were not part of the remediation target.

## RECOMMENDATION

After explicit human approval, restore the assertion:

```ts
expect(tasks[0].completed).toBe(false);
```

to:

```ts
expect(tasks[0].completed).toBe(true);
```

No alternative correction is recommended.

## HUMAN DECISION

Human approval was required before the Remediation Agent could execute the proposed correction.

The human subsequently approved the exact remediation.

## Traceability

Workflow:

```text
Controlled Failure
      ↓
Diagnosis Agent
      ↓
Diagnosis Report
      ↓
Human Remediation Approval
      ↓
Remediation Agent
```

The Diagnosis Agent performed no remediation and did not modify the repository.
