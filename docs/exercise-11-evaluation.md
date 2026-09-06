# GH-600 Practice Exercise 11 — Agentic CI/CD & Automated Quality Gates

## Objective

Introduce automated CI/CD quality gates that independently validate pull requests before they can be merged into `main`.

The exercise demonstrates:

* automated validation
* CI as an independent control
* branch protection concepts
* least privilege
* deterministic quality gates
* agent-to-CI handoff
* failure detection
* human-controlled merge
* traceability

---

## Scope

Add or improve the GitHub Actions workflow so that pull requests targeting `main` automatically execute the repository quality gates.

The CI pipeline must validate at minimum:

1. dependency installation
2. unit tests
3. TypeScript/build validation
4. repository scope/policy checks

The workflow must not deploy the application.

Deployment automation is intentionally outside the scope of Exercise 11.

---

## Required CI Workflow

The workflow should run on:

* pull requests targeting `main`
* pushes to `main`

The workflow must use a supported Node.js version compatible with the repository.

Dependency installation should use the lockfile deterministically.

---

## Required Quality Gates

### Gate 1 — Dependency Installation

CI must install dependencies using the repository lockfile.

Preferred behavior:

npm ci

A failure must stop the pipeline.

---

### Gate 2 — Tests

CI must execute:

npm test

A failing test suite must cause CI failure.

---

### Gate 3 — Build

CI must execute:

npm run build

A build failure must cause CI failure.

---

### Gate 4 — Scope / Policy Check

CI must verify that protected files are not changed by the pull request unless explicitly authorized.

Protected paths:

.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md

The check must also detect unexpected dependency changes:

package.json
package-lock.json

Exercise 11 must not modify dependencies.

---

## Agentic Traceability

The workflow must validate that the expected Exercise 11 development process has occurred.

The PR should contain appropriate evidence from:

* Planner
* Developer
* Tester
* Reviewer

The CI pipeline itself must remain deterministic and must not depend on an AI agent making a subjective approval decision.

---

## Least Privilege

The GitHub Actions workflow must follow least-privilege principles.

The workflow should request only the permissions it requires.

It must not receive unnecessary write permissions.

No deployment credentials are required.

No cloud credentials should be added.

---

## Security Requirements

Do not:

* hard-code secrets
* add credentials to workflow files
* expose tokens
* add deployment credentials
* grant unnecessary write permissions
* execute arbitrary untrusted scripts from pull-request input
* modify repository settings automatically

Pull-request workflows must be treated as untrusted execution contexts.

---

## Failure Handling

If CI fails:

1. Identify the failed gate.
2. Determine whether the failure is:

   * implementation
   * test
   * build
   * scope/policy
   * dependency
   * environment/tooling
3. Do not bypass the failed gate.
4. Do not merge while required CI checks are failing.
5. Human decides whether a correction is required.
6. Developer performs only the approved correction.
7. CI runs again.

---

## Human Control

Agents must not:

* merge pull requests
* modify branch protection
* approve their own pull requests
* bypass failed CI checks
* modify repository security settings

The human remains responsible for the final merge.

---

## Protected Files

The following must not be changed as part of Exercise 11:

.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md

No application dependencies may be added.

---

## Success Criteria

Exercise 11 is complete when:

* CI workflow is implemented.
* CI runs for PRs targeting `main`.
* CI runs for pushes to `main`.
* npm ci succeeds.
* npm test is enforced.
* npm run build is enforced.
* scope/policy validation is enforced.
* CI fails when a required gate fails.
* CI succeeds for the valid Exercise 11 PR.
* least-privilege permissions are configured.
* no secrets or deployment credentials are introduced.
* human performs the final merge.
* local `main` is synchronized after merge.

---

## GH-600 Learning Outcomes

The learner should be able to explain:

1. Why CI is an independent validation layer.
2. Why agents should not be allowed to bypass CI.
3. How automated gates reduce agent failure risk.
4. Why deterministic checks are preferable to subjective AI approval for merge gates.
5. How GitHub Actions permissions implement least privilege.
6. Why pull-request workflows require security boundaries.
7. How CI failures should enter the human escalation workflow.
