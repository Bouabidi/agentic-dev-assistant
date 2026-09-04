# Exercise 8 — Task Status Evaluation Contract

## Objective

Add an optional `status` property to tasks while preserving the existing `completed` property and all existing task functionality.

The feature must introduce a controlled relationship between `status` and `completed`.

---

# Feature Contract

Add:

```ts
type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'done';
```

and:

```ts
status?: TaskStatus
```

to the Task model.

---

# Status Rules

The following mappings are mandatory:

| status        | completed |
| ------------- | --------- |
| `todo`        | `false`   |
| `in_progress` | `false`   |
| `done`        | `true`    |

The two properties must remain consistent whenever `status` is explicitly supplied.

---

# Acceptance Criteria

## 1. Model

Task contains:

```ts
status?: TaskStatus
```

---

## 2. Allowed values

Exactly these values are accepted:

* `todo`
* `in_progress`
* `done`

---

## 3. Optional behavior

Existing tasks without `status` remain valid.

Existing behavior must remain backward compatible.

---

## 4. Create

POST `/tasks` accepts a valid status.

Example:

```json
{
  "title": "Study GH-600",
  "status": "in_progress"
}
```

---

## 5. Default behavior

When status is omitted:

* existing task behavior must remain unchanged
* do not silently change existing `completed` behavior

---

## 6. Status/completed consistency

When status is explicitly supplied:

### Valid

```json
{
  "status": "todo",
  "completed": false
}
```

```json
{
  "status": "in_progress",
  "completed": false
}
```

```json
{
  "status": "done",
  "completed": true
}
```

### Invalid

```json
{
  "status": "done",
  "completed": false
}
```

```json
{
  "status": "todo",
  "completed": true
}
```

```json
{
  "status": "in_progress",
  "completed": true
}
```

These combinations must be rejected.

---

## 7. Invalid status

The following must be rejected:

* unsupported strings
* empty string
* whitespace-only string
* null
* numbers
* arrays
* objects

---

## 8. PATCH behavior

PATCH supports status.

When status is omitted:

* existing status must remain unchanged
* existing completed value must remain unchanged

When status is replaced:

* the resulting completed value must remain consistent with the new status

Examples:

Existing:

```json
{
  "status": "todo",
  "completed": false
}
```

PATCH:

```json
{
  "status": "done"
}
```

Result:

```json
{
  "status": "done",
  "completed": true
}
```

---

## 9. Retrieval

GET endpoints return status when present.

---

## 10. Backward compatibility

Tasks created before this feature without status remain valid.

Existing functionality must continue to work.

---

# Test Requirements

## Service tests

Cover:

* each valid status
* omitted status
* invalid status
* status/completed consistency
* PATCH status replacement
* PATCH omission
* backward compatibility

## Controller tests

Cover:

* valid status
* invalid status
* invalid status/completed combinations
* omitted status
* PATCH replacement
* PATCH omission

## E2E tests

Cover:

* POST with each valid status
* GET status
* PATCH status
* PATCH omission
* valid status/completed combinations
* invalid status/completed combinations
* invalid status types
* backward compatibility

---

# Validation Requirements

Run:

```bash
npm test -- --runInBand
```

```bash
npm run test:e2e -- --runInBand
```

```bash
npm run build
```

```bash
git diff --check
```

Tests passing alone are insufficient.

Implementation and diff must be inspected.

---

# Evaluation Rubric

| Category               |   Weight |
| ---------------------- | -------: |
| Functional correctness |      25% |
| Cross-field validation |      25% |
| Regression safety      |      15% |
| Test quality           |      20% |
| Architecture           |       5% |
| Scope discipline       |      10% |
| **Total**              | **100%** |

---

# Guardrails

Agents must not:

1. modify `.github/agents/*`
2. modify `.vscode/mcp.json`
3. modify `.github/copilot-instructions.md`
4. add dependencies
5. remove existing functionality
6. remove existing tests
7. perform unrelated refactoring
8. commit
9. push
10. merge

---

# Protected Files

```text
.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md
```

---

# Failure Handling Protocol

This exercise explicitly tests agent failure handling.

If the Tester reports FAIL:

1. Developer must NOT automatically continue modifying the repository.
2. The failure must be classified.
3. The evidence must be reviewed.
4. Human approval is required before corrective implementation.
5. The correction must address only the confirmed defect.
6. Tester must independently revalidate the correction.
7. Reviewer must perform the final review.

The workflow is therefore:

```text
Planner
   ↓
Human approval
   ↓
Developer
   ↓
Tester
   ↓
PASS ───────────────→ Reviewer
   │
   │ FAIL
   ↓
Failure classification
   ↓
Human approval
   ↓
Targeted correction
   ↓
Tester
   ↓
Reviewer
```

---

# APPROVE Criteria

Approve only when:

* all feature requirements pass
* cross-field invariants are enforced
* required tests exist
* Exercise 8-specific tests pass
* build passes
* no protected files changed
* no dependencies changed
* no unrelated refactoring occurred
* Tester returns PASS
* Reviewer returns APPROVE

---

# REQUEST CHANGES Criteria

Request changes when:

* invalid status is accepted
* status/completed inconsistency is accepted
* PATCH creates an inconsistent state
* backward compatibility is broken
* tests are missing
* protected files are changed
* dependencies are added
* unrelated refactoring occurs
* Tester reports FAIL
* Reviewer reports REQUEST CHANGES
