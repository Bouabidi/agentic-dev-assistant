# Exercise 6 — Task Estimate Evaluation

## Objective

Evaluate whether a developer implementation correctly adds an optional `estimateMinutes?: number` field to the existing NestJS task-management API while preserving all existing task behavior, validation semantics, and repository constraints.

This evaluation contract is designed to verify implementation quality, not simply whether tests pass. The evaluator must inspect the actual code, the actual diff, and the actual test coverage before making an approval decision.

## Feature Contract

Add an optional task estimate to the existing API contract.

### New field

The task model must support:

```ts
estimateMinutes?: number
```

### POST /tasks

Support a payload like:

```json
{
  "title": "Prepare GH-600",
  "description": "Study agent evaluation",
  "priority": "high",
  "dueDate": "2026-09-10",
  "tags": ["gh-600"],
  "estimateMinutes": 90
}
```

Validation rules:

- `estimateMinutes` is optional.
- When supplied, it must be an integer.
- It must be greater than 0.
- `0` must be rejected.
- Negative values must be rejected.
- Decimal values must be rejected.
- Omitted `estimateMinutes` must preserve existing behavior.

### PATCH /tasks/:id

- Accept optional `estimateMinutes`.
- A valid value replaces the existing value.
- Omitting `estimateMinutes` preserves the existing value.
- Invalid values are rejected.
- Partial update semantics must remain intact.

### Existing behavior that must remain intact

The following behavior must continue to work without regression:

- completed filtering
- priority filtering
- dueDate
- tags
- tag filtering
- search
- stats
- summary
- bulk completion
- create
- update
- delete

## Acceptance Criteria

The implementation passes only if all of the following are true:

1. `estimateMinutes` is accepted only when it is a positive integer.
2. The field is optional on create and update.
3. Omitted values preserve existing behavior.
4. Invalid values are rejected consistently through both controller validation and service behavior.
5. Partial update semantics remain unchanged.
6. Existing task features continue to work without regression.
7. Test coverage is explicit, targeted, and genuinely exercises the new behavior.
8. The patch stays within the task module and does not broaden scope.
9. No agent configuration, MCP configuration, dependency changes, or unrelated refactoring are introduced.
10. No material validation or security regression is present.

## Validation Requirements

The evaluation contract requires the implementation to be validated against the actual repository state, not against assumptions or a summary.

The evaluator must confirm:

- create accepts valid `estimateMinutes`
- create preserves behavior when `estimateMinutes` is omitted
- create rejects invalid values
- update accepts valid values
- update preserves old values when omitted
- update rejects invalid values
- partial update semantics remain intact
- existing task APIs continue to behave as before
- no security issue or validation bypass was introduced

## Test Requirements

The implementation must include or update tests that explicitly cover all required scenarios.

### Service/unit tests

Required coverage includes:

- create with `estimateMinutes`
- create without `estimateMinutes`
- update `estimateMinutes`
- update without `estimateMinutes`
- invalid values
- partial update behavior

### Controller tests

Required coverage includes:

- valid integer
- zero
- negative integer
- decimal
- invalid type
- omitted value

### E2E tests

Required coverage includes:

- POST with `estimateMinutes`
- PATCH with `estimateMinutes`
- PATCH without `estimateMinutes`
- invalid estimate values
- regression behavior

### Minimum quality standard

Tests must not merely assert success on a happy path. They must also assert the failure cases, preserve partial update semantics, and verify that unrelated task capabilities still work.

## Evaluation Rubric

| Dimension              | Weight |
| ---------------------- | -----: |
| Functional correctness |    30% |
| Input validation       |    20% |
| Regression safety      |    15% |
| Test quality           |    20% |
| Architecture           |     5% |
| Scope discipline       |    10% |
| Total                  |   100% |

### Interpretation

- Functional correctness: behavior matches the contract and all required routes and fields work as specified.
- Input validation: values like `0`, negative numbers, decimals, and wrong types are rejected consistently.
- Regression safety: existing task behavior remains intact.
- Test quality: tests are specific, meaningful, and cover both valid and invalid behavior.
- Architecture: implementation respects NestJS boundaries and keeps controller/service responsibilities aligned with the repo.
- Scope discipline: patch remains narrow and avoids unrelated refactoring or config changes.

## Guardrails

The evaluator must explicitly enforce the following guardrails:

- Passing existing tests is insufficient.
- The evaluator must inspect the actual implementation.
- The evaluator must inspect the actual Git diff.
- The evaluator must verify that tests genuinely cover the requirements.
- The evaluator must not trust the Developer Agent's summary.
- The evaluator must not modify files.
- No agent configuration may be changed.
- No MCP configuration may be changed.
- No dependencies may be added.
- No unrelated refactoring is allowed.
- Security or validation regressions require REQUEST CHANGES.

The evaluator must reject any implementation that appears to pass superficially while hiding missing coverage, hidden regressions, or out-of-scope changes.

## Protected Files

These files must not be modified as part of this exercise or evaluation:

- .github/agents
- .vscode/mcp.json

The broader rule is also enforced:

- no other project files may be modified for the implementation being evaluated
- no new dependencies may be introduced
- no unrelated refactors are allowed

## Evaluation Procedure

The evaluator should perform the following steps in order:

1. Read the feature contract and confirm the intended API and validation semantics.
2. Inspect the actual task model, controller, and service implementation for the `estimateMinutes` field and validation logic.
3. Inspect the actual Git diff to confirm the patch is limited to the intended feature and not broader refactoring.
4. Review tests for unit, controller, and E2E coverage to confirm the requirements are genuinely tested.
5. Check whether omitted values preserve legacy behavior and whether all existing task functionality still works.
6. Check for validation flaws, edge cases, and regressions such as:
   - `0` accepted unexpectedly
   - negative values accepted
   - decimal values accepted
   - patch behavior overwriting omitted fields
   - rejected values causing unrelated API breakage
   - task filtering or summary logic regressed
7. Confirm there are no changes to agent configuration, MCP configuration, or dependencies.
8. Apply the rubric and determine whether the implementation merits approval or request for changes.

## APPROVE Criteria

APPROVE only if all of the following are true:

- All critical requirements pass.
- Tests are sufficient and genuinely cover the required scenarios.
- Omitted values preserve prior behavior.
- Invalid values are rejected consistently.
- Existing task functionality remains intact.
- The patch stays within scope.
- No material regression or security issue exists.
- The actual implementation and Git diff are consistent with the intended feature.

## REQUEST CHANGES Criteria

REQUEST CHANGES if any of the following conditions are met:

- Any required criterion fails.
- Required coverage is missing.
- The implementation does not reject invalid `estimateMinutes` values correctly.
- Omitted `estimateMinutes` changes the previous behavior.
- Partial update semantics are broken.
- Existing task features regress.
- The evaluator finds security, validation, or API contract issues.
- The patch violates scope by introducing unrelated refactoring or config changes.
- Dependency changes or agent or MCP configuration changes are present.
- The evaluator cannot verify the implementation from the actual code and diff.
- The Developer Agent's summary cannot be trusted because it does not match the actual repository state.

A single critical failure is enough to require changes.

---

This evaluation contract is intentionally strict: the goal is to validate real behavior and real repository evidence rather than accepting superficial compliance. The implementation must be correct, narrow, and regression-safe.
