# Exercise 10 Implementation Plan: Task Report

## Objective

Add a read-only `GET /tasks/report` endpoint that aggregates the in-memory task collection into a deterministic report. The feature demonstrates the Exercise 10 handoff workflow while preserving the existing NestJS controller/service architecture and all Exercise 8 and Exercise 9 behavior.

The Developer must implement only the response contract approved by the human after this plan. No dependency, persistence, authentication, pagination, sorting, or unrelated refactoring is required.

## Proposed API Contract

### Route

`GET /tasks/report`

- Method: `GET`
- Request body: none
- Query parameters: none
- Success status: `200 OK`
- Response: one JSON object
- The endpoint is read-only and must not mutate tasks.

### Proposed response

```json
{
  "total": 4,
  "completed": 1,
  "incomplete": 3,
  "statusCounts": {
    "todo": 1,
    "in_progress": 1,
    "done": 1,
    "withoutStatus": 1
  },
  "priorityCounts": {
    "low": 1,
    "medium": 2,
    "high": 1
  },
  "categoryCounts": {
    "work": 1,
    "personal": 1,
    "learning": 0,
    "development": 1,
    "other": 0,
    "uncategorized": 1
  }
}
```

The response always includes every defined status, priority, and category key, even when its count is zero. `withoutStatus` and `uncategorized` are explicit buckets for optional fields that are absent.

No task records, task details, tags, due dates, or estimates are included in the response. The report is intentionally an aggregate, not a second task-list endpoint.

## Data Semantics

### Totals

- `total` is the number of tasks currently stored.
- `completed` counts tasks whose stored `completed` property is `true`.
- `incomplete` counts tasks whose stored `completed` property is `false`.
- The implementation should preserve the invariant `total = completed + incomplete` for valid task data.

### Status counts

- `todo`, `in_progress`, and `done` count tasks with the corresponding explicit `status` value.
- Tasks with `status === undefined` count under `withoutStatus`.
- A missing status must not be inferred from `completed` and must not be assigned to the task while reporting.
- The status buckets must sum to `total`.

### Priority counts

- Count `low`, `medium`, and `high` using the task's effective priority.
- If a task has no priority at runtime, use the existing `DEFAULT_TASK_PRIORITY` (`medium`) for reporting, matching current retrieval/default behavior.
- Do not mutate the task merely to apply this default.
- The priority buckets must sum to `total`.

### Category counts

- Count explicit values from the existing `TaskCategory` union.
- Tasks with no category count under `uncategorized`.
- Category buckets must sum to `total`.

### Status/completed invariant

Exercise 8 enforces this mapping whenever status is explicitly supplied:

| Status | Completed |
| --- | --- |
| `todo` | `false` |
| `in_progress` | `false` |
| `done` | `true` |

The report must not repair, derive, or mutate either field. It should count `completed` from the stored boolean and status from the stored optional status independently. Existing create, update, and bulk-completion validation remains responsible for maintaining the invariant. Legacy tasks without status remain valid and are counted in `withoutStatus`.

### Empty collection

When no tasks exist, return `200 OK` with the same response shape and zero in every numeric bucket:

```json
{
  "total": 0,
  "completed": 0,
  "incomplete": 0,
  "statusCounts": {
    "todo": 0,
    "in_progress": 0,
    "done": 0,
    "withoutStatus": 0
  },
  "priorityCounts": {
    "low": 0,
    "medium": 0,
    "high": 0
  },
  "categoryCounts": {
    "work": 0,
    "personal": 0,
    "learning": 0,
    "development": 0,
    "other": 0,
    "uncategorized": 0
  }
}
```

No division or percentage is needed, so there is no zero-denominator behavior to define. Existing `GET /tasks/summary` remains unchanged.

## Existing Domain Definitions To Reuse

Use the definitions already in `src/tasks/task.ts`:

- `Task`
- `TaskStatus` and `TASK_STATUSES`
- `TaskPriority`, `TASK_PRIORITIES`, and `DEFAULT_TASK_PRIORITY`
- `TaskCategory` and `TASK_CATEGORIES`

If typed response interfaces are added, keep them in the task domain file and use the existing unions rather than duplicating string literals. A minimal implementation may also use an inline return type consistent with the existing `stats()` and `summary()` methods. Do not add a dependency or a new reporting framework.

## Affected Files

### Minimum application changes

- `src/tasks/tasks.service.ts`: add a read-only report aggregation method, likely `report()`, with fixed bucket initialization and one pass over the task collection.
- `src/tasks/tasks.controller.ts`: add `@Get('report')` before `@Get(':id')` and delegate directly to the service. The controller should contain no aggregation logic.

### Minimum test changes

- `src/tasks/tasks.service.spec.ts`: unit-test totals, grouped counts, legacy fields, empty collections, and non-mutation.
- `src/tasks/tasks.controller.spec.ts`: verify controller delegation/response and route-facing method behavior using the existing testing style.
- `test/app.e2e-spec.ts`: verify the HTTP response, route precedence, populated counts, empty report, and preservation of existing endpoints.

### Optional type-only change

- `src/tasks/task.ts`: add named report response interfaces only if the implementation benefits from an explicit public contract. This is optional and should not duplicate existing domain definitions.

Do not modify `package.json`, `package-lock.json`, `.github/agents/*`, `.vscode/mcp.json`, `.github/copilot-instructions.md`, or unrelated modules.

## Implementation Approach

1. Define the approved response shape and fixed bucket keys before coding.
2. Add a service method that initializes all buckets to zero, iterates over `this.tasks`, increments totals and effective grouped values, and returns the new aggregate object.
3. Use `task.status` directly; increment `withoutStatus` when it is absent. Never call a mutating helper such as `ensureTaskPriority` solely to generate the report.
4. Resolve an undefined priority locally with `DEFAULT_TASK_PRIORITY` so reporting does not alter stored tasks.
5. Treat an undefined category as `uncategorized`.
6. Add the controller route before the dynamic `@Get(':id')` route so `/tasks/report` cannot be interpreted as an ID.
7. Keep existing `stats()`, `summary()`, `findAll()`, create, update, completion, and deletion behavior unchanged.

## Testing Strategy

### Service unit tests

Add focused tests that:

- verify the baseline legacy task produces `total: 1`, `completed: 0`, `incomplete: 1`, `withoutStatus: 1`, `medium: 1`, and `uncategorized: 1`;
- create tasks covering every supported status, priority, and category and verify exact grouped counts;
- verify completed and incomplete totals from mixed tasks;
- verify a task without status is not assigned one by calling `report()` and then inspecting it;
- verify undefined priority uses the default bucket without mutating the task;
- verify an empty collection returns the complete zero-filled response shape;
- verify report generation does not alter task fields, including status, completed, priority, category, tags, due date, and estimate-related fields if present in the current model.

### Controller unit tests

- Verify the controller exposes the report method and returns the service report.
- Prefer a mocked `TasksService` or a focused real-service test consistent with the existing suite; do not duplicate aggregation assertions in the controller test.
- Verify the route takes no query/body input and does not affect existing controller methods.

### E2E tests

- `GET /tasks/report` returns `200` and the exact approved response shape for the initial legacy task.
- Create a mixed set of tasks through the public API, including status-bearing, completed, priority, category, and unclassified tasks, then verify all totals and grouped counts.
- Delete the only task and verify the zero-filled empty report.
- Verify `/tasks/report` is not routed to `GET /tasks/:id`.
- Retain existing Exercise 8 and Exercise 9 HTTP tests and confirm standard task endpoints still behave as before.

## Regression Strategy

The Developer should run focused report tests first, then the complete unit suite and build. The Tester must independently run the required validation rather than rely on the Developer report.

Regression checks must confirm:

- status creation and updates still derive/validate `completed` correctly;
- completion and bulk completion preserve the status/completed invariant;
- legacy tasks without status remain valid and are not changed by reporting;
- existing filtering, search, summary, stats, CRUD, tags, categories, priorities, and due-date behavior remains unchanged;
- the report is read-only and does not affect subsequent `GET /tasks` or `GET /tasks/:id` responses;
- known `description: undefined` E2E serialization failures, if still present, are classified as baseline failures and are not fixed as part of Exercise 10.

## Risks

- An ambiguous bucket name or omitted optional-field bucket could make an otherwise correct implementation fail the approved contract.
- Counting status from `completed` would misclassify legacy tasks or hide invariant violations; status must be counted from the optional status field.
- Calling existing mutating helpers while reporting could silently change task state.
- Forgetting the route order could allow `GET /tasks/report` to reach the ID handler.
- Returning only nonzero keys would make the response shape unstable and make empty reports ambiguous.
- Computing priority directly without the existing default could undercount legacy/undefined-priority tasks.
- Changing `stats()` or `summary()` to share report logic could create unnecessary regression risk; keep the new method local unless duplication is demonstrably material.

## Assumptions

- The current in-memory `Task` model is the complete source of report data.
- `completed` remains a required boolean on `Task` and valid stored tasks therefore partition into completed/incomplete.
- Priority defaults to `medium` according to existing behavior, including for any task whose priority is undefined at runtime.
- Category is optional and missing categories are represented as `uncategorized` in the proposed report.
- Status is optional and missing statuses are represented as `withoutStatus`.
- No percentage, ordering, query parameters, pagination, or task-level detail is required.
- The existing `estimate` field is not present in the current model; if a later branch adds it, the report remains non-mutating and does not need to include it unless the approved contract changes.

## Human Decisions Required

Human approval is required before Developer implementation for:

1. The exact top-level response shape and field names.
2. Approval of the explicit `statusCounts.withoutStatus` bucket.
3. Approval of the explicit `categoryCounts.uncategorized` bucket.
4. Approval that undefined priority is counted as effective `medium`, rather than being given a separate `withoutPriority` bucket.
5. Approval that the report counts stored `completed` independently and does not derive or repair it from status.
6. Approval that empty collections return a zero-filled object with the same keys.
7. Confirmation that no completion percentage or additional grouped dimensions are desired.

If any of these decisions change, the Developer must update the implementation plan or record the approved clarification before coding. The Developer must not silently choose a conflicting contract.

## Traceability to `docs/exercise-10-evaluation.md`

| Exercise 10 requirement | Plan coverage |
| --- | --- |
| Expose `GET /tasks/report` | Proposed API contract and implementation approach |
| Follow human-approved contract | Human Decisions Required; Developer must implement only approved shape |
| Reuse Task domain definitions | Existing Domain Definitions To Reuse |
| Aggregate existing task data | Data Semantics and service approach |
| Handle empty task collection | Empty collection contract and tests |
| Preserve existing endpoints | Affected files and regression strategy |
| Preserve status/completed invariants | Status/completed invariant and regression strategy |
| Preserve priority, category, tag, due-date, and estimate behavior | Data semantics and regression strategy |
| Avoid mutation | Implementation approach and non-mutation tests |
| Explicit Planner handoff | This artifact and approval gate |
| Independent validation and escalation | Testing and regression strategy; Tester handoff follows Developer handoff |
| Protected files and no dependencies | Affected Files and scope constraints |

## Handoff Sequence

This plan is the Planner artifact and must be approved by the human before implementation. The expected chain is:

```text
docs/handoffs/exercise-10-plan.md
    -> human approval
docs/handoffs/exercise-10-developer-report.md
    -> independent Tester validation
docs/handoffs/exercise-10-test-report.md
    -> Reviewer inspection
docs/handoffs/exercise-10-review.md
```

PLANNER STATUS: READY FOR HUMAN APPROVAL

Decisions requiring explicit approval are the response field names and bucket semantics listed in **Human Decisions Required**, especially `withoutStatus`, `uncategorized`, effective `medium` priority, independent completion counting, and the zero-filled empty response.You are the Planner Agent for GH-600 Practice Exercise 10.

Repository:
E:\agentic-dev-assistant

Objective:
Design the implementation plan for a new GET /tasks/report endpoint demonstrating multi-agent coordination and explicit handoff artifacts.

Read first:

* docs/exercise-10-evaluation.md
* docs/agent-evaluation.md
* .github/copilot-instructions.md
* existing task domain, controller, service, and tests
* existing Exercise 8 and Exercise 9 behavior

Your authority:

* READ files: YES
* MODIFY application source code: NO
* MODIFY tests: NO
* RUN tests/build: NO
* COMMIT: NO
* PUSH: NO
* MERGE: NO

Your task:

1. Inspect the current task architecture.
2. Identify the existing domain definitions that can be reused.
3. Propose the exact response contract for GET /tasks/report.
4. Define how totals and grouped counts should be calculated.
5. Explicitly address tasks without status.
6. Explicitly address the existing completed/status invariant.
7. Define empty-task behavior.
8. Identify the minimum files that should change.
9. Define unit, controller, and E2E test coverage.
10. Identify regression risks.
11. Identify any ambiguity requiring human approval.
12. Do not modify application source files.

Write your complete plan to:

docs/handoffs/exercise-10-plan.md

The handoff must contain:

* Objective
* Proposed API contract
* Data semantics
* Affected files
* Implementation approach
* Testing strategy
* Regression strategy
* Risks
* Assumptions
* Human decisions required
* Traceability to docs/exercise-10-evaluation.md

Important:

Do not implement the feature.

Do not modify source code.

Do not modify tests.

Do not change dependencies.

Do not modify .github/agents/*.

Do not modify .vscode/mcp.json.

Do not modify .github/copilot-instructions.md.

At the end, report:

PLANNER STATUS: READY FOR HUMAN APPROVAL

and summarize any decisions that require explicit human approval.
