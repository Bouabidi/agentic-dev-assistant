# Exercise 12 Failure Diagnosis Report

## FAILURE SUMMARY

The CI test gate fails in the existing `TasksService` unit suite because a single assertion in the test `should return completed tasks when filtered` was intentionally changed from the expected value `true` to `false`.

The failing command is:

```bash
npm test -- --runInBand
```

Observed failure:

- 1 failed test
- 168 passed tests
- 1 failed suite out of 3 total
- Failure message: `Expected: false` / `Received: true`

## CLASSIFICATION

Classification: application/test regression

Reason: the failing command is a test assertion failure, and the repository evidence shows the issue is isolated to a changed assertion in the test file rather than a build, dependency, workflow, or policy issue.

## FACTS

- The repo is on branch `exercise-12-failure-diagnosis`.
- `git status --short` shows the modified file `src/tasks/tasks.service.spec.ts` and the Exercise 12 docs as the current relevant working-tree changes.
- The test assertion in `src/tasks/tasks.service.spec.ts` was intentionally modified from `expect(tasks[0].completed).toBe(true);` to `expect(tasks[0].completed).toBe(false);`.
- Running `npm test -- --runInBand` fails with 1 failed test and 168 passing tests.
- The failure is in the test case `TasksService › should return completed tasks when filtered`.
- The failure message reports `Expected: false` and `Received: true`.
- The application code in `src/tasks/tasks.service.ts` still sets the task completed state to `true` for the filtered result and the test expectation is inconsistent with the actual service behavior.
- The CI workflow in `.github/workflows/ci.yml` is configured to run `npm test` as a required gate, and there is no evidence of workflow misuse or policy failure in this run.
- No dependency manifest changes or protected-file changes are present in the evidence reviewed for this diagnosis.

## HYPOTHESIS

The most likely cause is that the failing test is intentionally wrong for the exercise and not a product regression in the service implementation. The test expectation appears to have been modified to force a predictable failure for diagnostic practice, while the service implementation continues to perform the expected completed-task filtering logic.

## ROOT CAUSE

Root cause: the intentionally changed assertion in the test file is the direct cause of the failure.

This is not a build issue, dependency issue, workflow issue, policy violation, baseline E2E issue, or transient infrastructure issue based on the evidence inspected.

## SCOPE

Files directly relevant to the failure:

- `src/tasks/tasks.service.spec.ts`
- `src/tasks/tasks.service.ts`
- `.github/workflows/ci.yml`
- `docs/handoffs/exercise-12-developer-report.md`

## CONFIDENCE

Confidence: High

Reason: the evidence directly points to the single modified assertion in the existing test, and the failure reproduces exactly as described by the developer handoff. There is no contradictory evidence suggesting a workflow, dependency, policy, or baseline problem.

## RECOMMENDATION

The minimum corrective action to consider is a targeted, human-approved correction of the intentionally incorrect assertion back to the correct expected value (`true`) after a human decision authorizes the change.

This recommendation is not performed in this diagnosis phase.

## HUMAN DECISION REQUIRED

A human approval is required before any correction is made.

Specifically, the human must authorize:

- whether the diagnosis is accepted as the intended controlled regression
- whether the assertion should be corrected
- whether the correction remains within the Exercise 12 scope and workflow
- whether the next step should proceed to the developer/tester/reviewer cycle

## TRACEABILITY

controlled change
→ observed failure
→ evidence
→ classification
→ root cause
→ recommendation
→ human decision required

This chain is evidenced as follows:

- Controlled change: the assertion in `src/tasks/tasks.service.spec.ts` was intentionally changed to expect `false`.
- Observed failure: `npm test -- --runInBand` fails with one assertion error.
- Evidence: failing Jest output, git status, diff contents, and the developer handoff report.
- Classification: application/test regression.
- Root cause: intentional assertion mismatch in the test file.
- Recommendation: human-approved correction of the assertion back to `true`.
- Human decision required: explicit approval before any correction occurs.
