# Exercise 11 Developer Report

## Approved Plan Consumed

Implemented the approved plan in `docs/handoffs/exercise-11-plan.md`, with traceability to `docs/exercise-11-evaluation.md`.

## Workflow Implementation Summary

Extended `.github/workflows/ci.yml` with two validation-only jobs:

- `policy`: checks changed paths, protected files, dependency manifests, and required Exercise 11 handoff artifacts.
- `quality`: runs after `policy` and executes dependency installation, tests, and the application build.

No deployment, cloud authentication, package publishing, repository-setting changes, or credentials were introduced.

## Files Changed

- `.github/workflows/ci.yml`
- `docs/handoffs/exercise-11-developer-report.md`

No source files, tests, dependencies, protected files, or repository settings were modified.

## Triggers

- Pull requests targeting `main` through `pull_request`.
- Pushes targeting `main`.

## CI Jobs and Gates

The `policy` job uses a full-history checkout and deterministically computes changed paths for pull requests, normal pushes, and initial pushes. It rejects protected-file changes and changes to `package.json` or `package-lock.json`. It also requires the Planner, Developer, Tester, and Reviewer handoff artifacts.

The dependent `quality` job uses Node.js 22, runs `npm ci`, then `npm test`, then `npm run build`. Each command is a required step and failures stop the job.

## Permissions

Both jobs declare only `contents: read`. No write permissions, pull-request permissions, deployment permissions, package permissions, OIDC permissions, or cloud credentials are configured.

## Security Controls

- Uses `pull_request`, not `pull_request_target`.
- Does not expose secrets or credentials.
- Does not interpolate pull-request text or file contents into shell source.
- Uses fixed major-version references for checkout and Node setup, matching the approved plan.
- Does not bypass failures with `continue-on-error`, error suppression, or automatic repository changes.

## Policy Checks

Protected paths rejected:

- `.github/agents/*`
- `.vscode/mcp.json`
- `.github/copilot-instructions.md`

Dependency manifests rejected:

- `package.json`
- `package-lock.json`

Required traceability artifacts:

- `docs/handoffs/exercise-11-plan.md`
- `docs/handoffs/exercise-11-developer-report.md`
- `docs/handoffs/exercise-11-test-report.md`
- `docs/handoffs/exercise-11-review.md`

## Tests and Build Executed

- `npm test`
- `npm run build`

## Results

The workflow configuration and policy logic were statically inspected. `npm test` passed with 3 test suites and 169 tests passing. `npm run build` completed successfully. Prettier formatting validation passed after formatting the edited files.

## Known Failures

Any failure of the policy job for a missing handoff artifact is intentional and must be resolved by the appropriate approved workflow stage. The policy does not infer approval from artifact prose.

## Baseline Failures

No baseline application failure was identified during the required local validation commands.

## Dependency Verification

No dependency files were modified. The workflow uses deterministic `npm ci` and the policy gate rejects changes to `package.json` and `package-lock.json` for this exercise.

## Protected-File Verification

No protected files were modified. The policy gate uses exact matching for `.vscode/mcp.json` and `.github/copilot-instructions.md`, and prefix matching for `.github/agents/`.

## Scope Verification

The implementation is limited to the existing CI workflow and this Exercise 11 developer report. No deployment automation, cloud credentials, repository settings, source code, tests, or dependencies were changed.
