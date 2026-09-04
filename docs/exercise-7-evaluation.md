# Exercise 7 — Task Categories Evaluation Contract

## Objective

Add an optional `category` property to tasks while preserving all existing task functionality.

The feature must be implemented using the project's existing architecture and validation patterns.

---

## Feature Contract

A task may optionally contain:

```ts
category?: TaskCategory
```

Supported values:

```text
work
personal
learning
development
other
```

The category must be returned by task endpoints when present.

---

## Acceptance Criteria

### 1. Model

The Task model/type contains an optional category property.

### 2. Allowed values

Only these values are accepted:

* `work`
* `personal`
* `learning`
* `development`
* `other`

### 3. Optional behavior

A task can be created without a category.

Existing tasks without a category remain valid.

### 4. Create

POST `/tasks` accepts a valid category.

Example:

```json
{
  "title": "Prepare GH-600",
  "category": "learning"
}
```

### 5. Invalid category

Invalid values must be rejected.

Examples:

```text
"school"
"urgent"
""
null
```

must not be accepted as valid categories.

### 6. Update

PATCH `/tasks/:id` accepts a valid category.

### 7. PATCH omission

When `category` is omitted from PATCH, the existing category must remain unchanged.

### 8. PATCH replacement

When a valid category is supplied through PATCH, the existing category must be replaced.

### 9. Retrieval

GET endpoints must return the category when it exists.

### 10. Regression safety

All existing task functionality must continue working.

Existing tests must continue passing.

### 11. Dependencies

No new npm dependencies may be introduced.

### 12. Architecture

Use the existing NestJS validation and service architecture.

Do not introduce an unrelated architectural pattern.

---

# Validation Requirements

The following must be executed:

```bash
npm test -- --runInBand
```

```bash
npm run test:e2e -- --runInBand
```

```bash
npm run build
```

The implementation and tests must also be inspected manually.

Passing tests alone are not sufficient for approval.

---

# Test Requirements

Tests must cover:

## Service

* creation with category
* creation without category
* valid category
* invalid category handling
* update category
* PATCH omission
* PATCH replacement

## Controller

* valid category request
* invalid category request

## E2E

* create task with category
* retrieve task with category
* update category
* invalid category

---

# Evaluation Rubric

| Category               |   Weight |
| ---------------------- | -------: |
| Functional correctness |      30% |
| Input validation       |      20% |
| Regression safety      |      15% |
| Test quality           |      20% |
| Architecture           |       5% |
| Scope discipline       |      10% |
| **Total**              | **100%** |

---

# Guardrails

The following rules are mandatory:

1. Do not modify `.github/agents/*`.
2. Do not modify `.vscode/mcp.json`.
3. Do not modify `.github/copilot-instructions.md`.
4. Do not add dependencies.
5. Do not perform unrelated refactoring.
6. Do not weaken validation.
7. Do not remove existing tests.
8. Do not commit or push from an agent.
9. Passing tests alone does not constitute approval.
10. Tester and Reviewer must independently inspect the implementation.

---

# Protected Files

```text
.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md
```

---

# Evaluation Procedure

The workflow is:

1. Planner creates implementation plan.
2. Human reviews the plan.
3. Developer implements the feature.
4. Tester independently validates the implementation.
5. Reviewer independently reviews implementation and evaluation criteria.
6. Human makes the final decision.
7. Human commits and pushes.
8. GitHub Actions validates the PR.
9. Human merges the PR.

---

# APPROVE Criteria

The feature may be approved only when:

* all acceptance criteria pass
* required tests exist
* unit tests pass
* E2E tests pass
* build passes
* no protected files changed
* no dependencies were added
* no unrelated refactoring occurred
* Tester returns PASS
* Reviewer returns APPROVE

---

# REQUEST CHANGES Criteria

Request changes when:

* category validation is incomplete
* invalid categories are accepted
* PATCH omission changes existing behavior
* existing functionality regresses
* tests are missing or inadequate
* protected files are modified
* unrelated refactoring is introduced
* dependencies are added unnecessarily
* Tester reports FAIL
* Reviewer reports REQUEST CHANGES