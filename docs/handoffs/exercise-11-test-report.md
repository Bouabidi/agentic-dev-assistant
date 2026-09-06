# Exercise 11 Tester Report

## Scope

Independent validation of the Exercise 11 CI quality-gate implementation against the approved plan in `docs/handoffs/exercise-11-plan.md` and the evaluation contract in `docs/exercise-11-evaluation.md`.

## Validation Performed

The workflow in `.github/workflows/ci.yml` was inspected for the required gates and security boundaries:

- `pull_request` targeting `main` is configured.
- `push` to `main` is configured.
- Node.js 22 is explicitly configured via `actions/setup-node@v4`.
- Dependency installation uses `npm ci`.
- The workflow runs `npm test` as a required failing gate.
- The workflow runs `npm run build` as a required failing gate.
- The policy job checks protected paths and dependency-manifest changes.
- The workflow uses only `contents: read` permissions.
- The workflow does not use `pull_request_target`.
- No cloud credentials, deployment credentials, or repository-write permissions are defined.
- No deployment automation is introduced.
- Known baseline E2E failures involving `description: undefined` are excluded from this exercise and are not altered.

## Local Verification

The project scripts were checked locally using the repository's committed toolchain:

- `npm test` passed: 3 test suites passed, 169 tests passed.
- `npm run build` passed.

## Result

TESTER STATUS: PASS TO REVIEWER
