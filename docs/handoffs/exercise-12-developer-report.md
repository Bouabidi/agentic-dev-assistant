# Exercise 12 Developer Report

## Branch

`exercise-12-failure-diagnosis`

## Files Changed

- `src/tasks/tasks.service.spec.ts`

## Controlled Failure Introduced

A single intentional assertion regression was added in the existing `TasksService` unit test named `should return completed tasks when filtered`:

```ts
expect(tasks[0].completed).toBe(false);
```

This was changed from the expected value `true` to the deliberately incorrect value `false` to create a predictable, isolated test failure that simulates an application regression for diagnosis and escalation.

The change is intentionally narrow, clearly documented in-line, and limited to one assertion. It does not introduce a dependency, does not disable CI, does not weaken the workflow, and does not alter repository settings or protected files.

## Expected Failing Test / Check

The expected failing command is:

```bash
npm test
```

The failure is expected in:

- `src/tasks/tasks.service.spec.ts`
- the test case `TasksService › should return completed tasks when filtered`

## Evidence that the Failure Is Reproducible

Local validation was run with:

```bash
npm test -- --runInBand
```

Observed result:

- 1 failed test
- 168 passed tests
- 1 failed suite out of 3 total
- failure message: `Expected: false` / `Received: true`

This demonstrates the failure is deterministic, isolated, and matches the deliberate regression introduced for Exercise 12.

## Validation Results

The controlled failure was confirmed as follows:

- `npm test` exits with code 1
- the regression is isolated to the intentionally modified assertion in the tasks service test suite
- the remaining tests continue to run as expected
- no application code or workflow definitions were changed for this controlled failure

## Protected Files Confirmed Unchanged

The following protected files were verified as unchanged:

- `.github/agents/*`
- `.vscode/mcp.json`
- `.github/copilot-instructions.md`
- `package.json`
- `package-lock.json`

## Dependencies Confirmed Unchanged

- No dependencies were added.
- No dependency manifests were modified.
- The repository intentionally remained on the existing dependency set.

## Known Limitations

- This is an intentional controlled regression for training and diagnosis practice.
- The failure is not intended to be fixed as part of this implementation stage.
- The exercise is intentionally designed to pause before diagnosis and remediation.

## Next Recommended Action

The next agent should independently diagnose the failed CI result, classify the issue as an application/test regression, and produce an evidence-based failure handoff for human review before any correction is attempted.

## Human-Approved Correction

- Human approval: granted
- Exact correction: restore the intentionally modified assertion in `src/tasks/tasks.service.spec.ts` to expect `true`
- Correction applied: `expect(tasks[0].completed).toBe(true);`

## Validation Results After Correction

- Relevant unit test: passed
- Full test suite: passed (`3` suites, `169` tests)
- Build: passed (`npm run build`)
- Confirmed controlled failure is resolved
- Confirmed no unrelated failures were introduced

## Files Changed

- `src/tasks/tasks.service.spec.ts`

## Protected Files and Dependencies Confirmed Unchanged

- Protected files remained unchanged:
  - `.github/agents/*`
  - `.vscode/mcp.json`
  - `.github/copilot-instructions.md`
  - `package.json`
  - `package-lock.json`
- Dependencies remained unchanged
- No workflow, repository-setting, or application-source changes were introduced outside the single approved assertion correction
