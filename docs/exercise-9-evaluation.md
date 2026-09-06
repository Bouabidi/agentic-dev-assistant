# Exercise 9 — Planner Implementation Plan

## Objective

Extend the existing NestJS Tasks API with validated, composable filtering for:

```text
GET /tasks
```

The endpoint must support the following optional query parameters:

* `status`
* `completed`
* `priority`
* `category`
* `tag`

The implementation must preserve all existing functionality, including the status/completed behavior introduced in Exercise 8.

---

## 1. Initial Inspection

Before modifying any files, inspect the existing implementation and tests.

Relevant files:

```text
src/tasks/task.ts
src/tasks/tasks.controller.ts
src/tasks/tasks.service.ts
src/tasks/tasks.controller.spec.ts
src/tasks/tasks.service.spec.ts
test/app.e2e-spec.ts
```

The Developer must first understand:

* existing task types
* existing constants
* current GET `/tasks` behavior
* current filtering behavior, if any
* existing validation
* existing Exercise 8 status/completed logic
* existing unit and E2E test structure

No implementation changes should be made during the inspection phase.

---

## 2. Query Contract

The GET `/tasks` endpoint should accept these optional query parameters:

```text
status?
completed?
priority?
category?
tag?
```

Expected values:

### status

```text
todo
in_progress
done
```

### completed

```text
true
false
```

### priority

```text
low
medium
high
```

### category

```text
work
personal
learning
development
other
```

### tag

A non-empty tag string.

---

## 3. Reuse Existing Domain Definitions

Reuse the existing task domain types and constants wherever possible.

Do not duplicate existing definitions such as:

```text
TaskStatus
TASK_STATUSES
TaskPriority
TASK_PRIORITIES
TaskCategory
TASK_CATEGORIES
```

No new dependency is expected.

---

## 4. Query Validation

Validate query parameters at the API boundary.

Invalid values must be rejected with an appropriate `400 Bad Request`.

Examples that must be rejected:

```text
GET /tasks?status=invalid
GET /tasks?priority=urgent
GET /tasks?category=school
GET /tasks?completed=maybe
GET /tasks?completed=1
GET /tasks?completed=0
```

The implementation must explicitly parse the `completed` parameter.

The string:

```text
"false"
```

must become boolean:

```text
false
```

and must not be treated as JavaScript truthy `true`.

---

## 5. Controller Design

Extend the existing `GET /tasks` endpoint to receive the optional query parameters.

The controller should:

1. receive the HTTP query
2. validate/normalize the query
3. pass the resulting query information to `TasksService`

Keep the controller thin.

Business filtering logic should not be duplicated inside the controller.

---

## 6. Service Filtering

Implement the actual filtering logic in `TasksService`.

Start with the complete task collection and apply only the filters supplied by the client.

Conceptually:

```text
All tasks
    ↓
Status filter
    ↓
Completed filter
    ↓
Priority filter
    ↓
Category filter
    ↓
Tag filter
    ↓
Filtered result
```

If no filter is provided:

```text
GET /tasks
```

must return all tasks.

---

## 7. Combined Filters

Multiple filters must use AND semantics.

Example:

```text
GET /tasks?status=todo&priority=high
```

must return tasks satisfying:

```text
status === "todo"
AND
priority === "high"
```

Another example:

```text
GET /tasks?status=in_progress&priority=high&category=development
```

must satisfy all three conditions.

Do not implement OR semantics.

---

## 8. Tag Filtering

For:

```text
GET /tasks?tag=typescript
```

return tasks whose `tags` collection contains the requested tag.

Example:

```json
{
  "tags": ["nestjs", "typescript", "backend"]
}
```

must match:

```text
?tag=typescript
```

Do not introduce fuzzy matching, partial matching, or full-text search.

---

## 9. Empty Results

A valid filter that matches no tasks must return a successful empty collection.

Expected behavior:

```text
HTTP 200 OK
[]
```

An empty result must not be treated as a validation error.

Invalid filter values remain:

```text
HTTP 400 Bad Request
```

---

## 10. Backward Compatibility

Exercise 9 must preserve the behavior from Exercises 1–8.

In particular, Exercise 8 introduced optional `status`.

Legacy tasks may therefore exist without a status.

Filtering must not mutate tasks or automatically add a status to legacy tasks.

The implementation must not change:

* task creation behavior
* PATCH behavior
* status/completed consistency
* completion behavior
* bulk completion behavior
* deletion behavior
* existing task validation

---

## 11. Unit Tests

Add or update unit tests to cover:

### No filters

```text
GET /tasks
```

### Status

```text
status=todo
status=in_progress
status=done
```

### Completed

```text
completed=true
completed=false
```

### Priority

```text
priority=low
priority=medium
priority=high
```

### Category

Test the supported categories.

### Tag

Test:

* matching tag
* non-existing tag
* task without tags

### Combined filters

Test multiple filters and verify AND semantics.

### Empty results

Verify that valid filters can return `[]`.

### Invalid values

Test invalid status, priority, category, and completed values.

---

## 12. E2E Tests

Add HTTP-level E2E coverage for at least:

```text
GET /tasks
GET /tasks?status=todo
GET /tasks?status=in_progress
GET /tasks?status=done
GET /tasks?completed=true
GET /tasks?completed=false
GET /tasks?priority=high
GET /tasks?category=work
GET /tasks?tag=typescript
GET /tasks?status=todo&priority=high
```

Also test invalid requests:

```text
GET /tasks?status=invalid
GET /tasks?priority=invalid
GET /tasks?category=invalid
GET /tasks?completed=maybe
```

Verify the HTTP status codes and returned task collections.

---

## 13. Regression Testing

All existing tests must remain intact.

Exercise 8 behavior must continue to work, including:

* status creation
* status updates
* completed/status consistency
* completion
* bulk completion
* legacy tasks without status

Do not remove existing tests simply to make the new tests pass.

---

## 14. Expected Files

Likely implementation files are:

```text
src/tasks/tasks.controller.ts
src/tasks/tasks.service.ts
src/tasks/tasks.controller.spec.ts
src/tasks/tasks.service.spec.ts
test/app.e2e-spec.ts
```

A dedicated query DTO/type may be introduced if justified by the existing project architecture.

The Developer must not modify unrelated files.

---

## 15. Protected Files

The following files/directories remain protected:

```text
.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md
package.json
package-lock.json
```

No dependency changes are expected.

---

## 16. Scope Restrictions

Do not introduce:

* pagination
* sorting
* full-text search
* fuzzy search
* database changes
* authentication changes
* authorization changes
* frontend changes
* caching
* external services
* unrelated refactoring

The scope is strictly:

> Validated, composable task filtering for GET `/tasks`.

---

## 17. Validation

After implementation, the Tester must execute:

```powershell
npm test -- --runInBand
```

```powershell
npm run test:e2e
```

```powershell
npm run build
```

```powershell
git diff --check
```

Then inspect:

```powershell
git status
```

and:

```powershell
git diff
```

The Tester must verify that protected files and dependency files were not modified.

---

## 18. Agent Workflow

The exercise follows this workflow:

```text
Planner
   ↓
Human Approval
   ↓
Developer
   ↓
Tester
   ↓
Reviewer
   ↓
Human Approval
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
CI
   ↓
Human Merge
```

The Developer must not autonomously commit, push, or merge.

---

## 19. Failure Protocol

If the Tester reports FAIL:

```text
Tester FAIL
    ↓
Analyze evidence
    ↓
Identify root cause
    ↓
Human approval for correction
    ↓
Developer targeted fix
    ↓
Tester revalidation
    ↓
Reviewer
```

Do not make uncontrolled changes after a failed test.

---

## 20. Definition of Done

Exercise 9 is complete only when:

```text
[ ] GET /tasks continues to work
[ ] status filtering works
[ ] completed filtering works
[ ] priority filtering works
[ ] category filtering works
[ ] tag filtering works
[ ] combined filters use AND semantics
[ ] invalid query values are rejected
[ ] valid empty results return 200 with []
[ ] Exercise 8 behavior remains intact
[ ] Unit tests pass
[ ] E2E tests pass
[ ] Build passes
[ ] git diff --check passes
[ ] Protected files remain unchanged
[ ] No dependency changes
[ ] No unrelated refactoring
[ ] Tester returns PASS
[ ] Reviewer returns APPROVE
[ ] Human approves commit
[ ] CI passes
[ ] Human merges the PR
```

## Planner Conclusion

The recommended implementation is to add a validated query model at the API boundary, pass the normalized query to `TasksService`, perform composable AND-based filtering in the service, reuse existing task domain definitions, preserve Exercise 8 behavior, and add comprehensive unit and E2E coverage.

