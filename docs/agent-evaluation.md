# Agent Evaluation — Task Due Date

## Objective

This evaluation checks whether an agent implementation satisfies an independently defined contract rather than relying only on the agent's own claims.

## Acceptance Criteria

1. `dueDate` is optional.
2. A valid ISO date/datetime can be supplied when creating a task.
3. A valid `dueDate` can be supplied through `PATCH /tasks/:id`.
4. Omitting `dueDate` preserves existing behavior.
5. Partial updates preserve unspecified fields.
6. Invalid date values are rejected with `BadRequestException`.
7. Empty-string dates are rejected.
8. Existing task endpoints continue working.
9. Existing priority behavior remains intact.
10. Unit tests cover creation and update.
11. Controller tests cover invalid input.
12. E2E tests cover the HTTP behavior.
13. No unrelated files are changed.
14. No agent configuration is modified.
15. `npm test` passes.
16. `npm run build` passes.

## Evaluation Rubric

| Dimension | Weight |
| Functional correctness | 30% |
| Validation | 15% |
| Regression safety | 15% |
| Test coverage | 20% |
| Architecture | 10% |
| Scope discipline | 10% |
| Total | 100% |

## Guardrails

- Passing existing tests alone is insufficient.
- The evaluator must compare the implementation against the acceptance criteria.
- The evaluator must inspect the actual diff.
- The evaluator must not trust the Developer Agent's summary without verification.
- The evaluator must not modify files.
- The evaluator must not commit, push, merge, or modify GitHub settings.
- Agent configuration files are protected.
- Unrelated changes are a failure of scope discipline.
- Security or validation regressions require rejection.

## Evaluation Outcome

- APPROVE: all critical acceptance criteria pass and no material regression or security issue exists.
- REQUEST CHANGES: one or more required criteria fail, required tests are missing, scope is violated, or a material regression/security issue exists.
