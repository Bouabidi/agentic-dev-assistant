# Exercise 11 CI/CD Quality-Gate Plan

## Current CI Assessment

The repository already contains `.github/workflows/ci.yml` with:

- `pull_request` runs targeting `main`;
- `push` runs targeting `main`;
- `ubuntu-latest` execution;
- Node.js 22 via `actions/setup-node@v4`;
- npm caching;
- deterministic dependency installation with `npm ci`;
- `npm test`;
- `npm run build`.

The current workflow is a single `test` job and does not explicitly declare permissions. It has no protected-file or dependency-file scope check, and it does not validate the Exercise 11 handoff artifacts. The minimum implementation is therefore to extend the existing workflow rather than create a second competing CI workflow.

## Proposed Workflow

Update `.github/workflows/ci.yml` with one workflow containing:

1. a deterministic `policy` job;
2. a `quality` job that depends on `policy` and runs dependency installation, tests, and build.

The workflow must remain validation-only. It must not deploy, authenticate to a cloud provider, publish packages, modify repository settings, or write to pull requests.

### Triggers

```yaml
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
```

The pull-request trigger must remain `pull_request`, not `pull_request_target`, because the workflow executes repository code and must not expose base-repository secrets or elevated context to untrusted fork code. The push trigger validates changes after they reach `main`.

## Jobs and Gates

### Job 1: Policy and traceability gate

Suggested job properties:

- job id: `policy`;
- runner: `ubuntu-latest`;
- `permissions: contents: read`;
- checkout using the repository revision appropriate to the event;
- no secrets, write tokens, deployment credentials, or external services.

The job should compute the changed-file set deterministically:

- for `pull_request`, compare `${{ github.event.pull_request.base.sha }}` with `${{ github.event.pull_request.head.sha }}`;
- for a normal push, compare `${{ github.event.before }}` with `${{ github.sha }}`;
- handle the all-zero `before` SHA for an initial push by using the current commit's parent or an explicitly defined full-history comparison;
- use `actions/checkout` with sufficient `fetch-depth` for the selected comparison, preferably `fetch-depth: 0` to avoid silently incomplete diffs.

The policy step must fail if the changed files include any protected path:

```text
.github/agents/*
.vscode/mcp.json
.github/copilot-instructions.md
```

It must also fail if either dependency manifest changes:

```text
package.json
package-lock.json
```

The check should use exact path matching for the two files and prefix/glob matching for `.github/agents/`, rather than broad substring matching. It should print the changed paths and the failed policy category so CI failures are diagnosable.

The exercise requires the workflow to detect protected/dependency changes, while the repository does not define an automatic exception mechanism. The deterministic default should be to fail. An explicitly authorized exception must be handled by a human-approved change to the policy/workflow or repository process, not by a PR-controlled label, comment, input, or script.

The same job should verify required Exercise 11 traceability artifacts exist in the checked-out revision:

```text
docs/handoffs/exercise-11-plan.md
docs/handoffs/exercise-11-developer-report.md
docs/handoffs/exercise-11-test-report.md
docs/handoffs/exercise-11-review.md
```

This check should be treated as a deterministic file-presence check. The workflow must not attempt to make a subjective AI approval decision or infer that an artifact is valid from prose. Whether all four artifacts should be mandatory on every ordinary repository PR is a human approval decision below; the Exercise 11 PR itself must contain the Planner artifact before implementation and the later artifacts as the workflow progresses.

### Job 2: Quality gate

The `quality` job should use `needs: policy`, so protected/dependency violations stop quality execution and produce a failed required check. It should declare `permissions: contents: read` and use no secrets.

Steps:

1. checkout the repository;
2. set up Node.js 22;
3. enable npm caching through `actions/setup-node` using the committed lockfile;
4. run `npm ci`;
5. run `npm test`;
6. run `npm run build`.

Each command must be a separate step or otherwise fail the job on a nonzero exit code. No `continue-on-error`, `|| true`, error suppression, or conditional bypass is permitted.

The required gates are therefore:

- dependency gate: `npm ci`;
- test gate: `npm test`;
- build gate: `npm run build`;
- scope/policy gate: protected/dependency path inspection and approved traceability checks.

The current package scripts do not expose a separate typecheck command. `npm run build` is the repository's TypeScript/compiler validation and should remain the required build gate rather than inventing a new script.

## Node.js Version Strategy

Use Node.js 22 because:

- the existing workflow already uses Node 22;
- `package.json` declares `@types/node` 22;
- the project currently builds and tests with the Node 22-compatible toolchain;
- changing the runtime version would expand scope without a stated requirement.

Keep the version explicit rather than using `node-version: latest`. A future Node upgrade should be a separately reviewed dependency/toolchain change.

## Deterministic Dependency Installation

Use `npm ci` from the repository root. This enforces `package-lock.json` consistency and avoids lockfile mutation. The policy job must reject dependency-file changes for this exercise before the quality job installs packages.

Do not use `npm install`, `npm update`, global installs, or generated dependency changes. Do not add credentials or private registries. Any future dependency change must be a separately authorized scope decision.

## Permissions and Security Controls

Set workflow-level or job-level permissions explicitly to the minimum required value:

```yaml
permissions:
  contents: read
```

No `write-all`, pull-request write, issue write, actions administration, deployments, packages, id-token, or repository-settings permissions are required. Job-level declarations are preferred if the policy and quality jobs may later diverge.

Pull-request security controls:

- use `pull_request`, never `pull_request_target` for this code-executing workflow;
- do not pass secrets to any job or step;
- do not use cloud credentials or deployment identities;
- do not execute PR-provided shell scripts as workflow actions;
- use fixed, reviewed action references; pinning actions to full commit SHAs is the strongest option;
- treat `npm ci`, tests, and build as execution of untrusted repository code, with only read-only permissions and no sensitive environment available;
- avoid interpolating PR title, branch name, commit message, or file contents directly into shell source;
- quote or pass GitHub expression values as environment variables when needed;
- do not use `pull_request_target` merely to obtain write access or base-repository files.

`npm ci` can run package lifecycle scripts. The dependency-file policy prevents package manifest changes in this exercise, and no secrets are exposed. Whether to add `--ignore-scripts` is a compatibility/security trade-off requiring approval; the baseline plan keeps the required command as exact `npm ci` unless human policy chooses otherwise.

## Scope and Policy Validation

The policy check should report:

- the event type and comparison range;
- the changed files;
- protected-path violations;
- dependency-file violations;
- missing traceability artifacts, if that check is approved.

It must fail closed when it cannot determine the diff reliably. It must not silently skip checks because a base SHA is unavailable. For the initial push case, use a deterministic full-history or parent comparison and document the selected behavior in the workflow.

The check should not inspect or modify repository settings, branch protection, merge state, labels, comments, or approvals. Required status checks and branch protection remain human-configured controls.

## Failure Handling

Every gate must fail the workflow on failure. CI output should identify the failed category:

- dependency installation;
- test;
- build/type validation;
- scope/policy;
- traceability;
- environment/tooling.

The workflow must not bypass failures or merge automatically. A human classifies the failure and decides whether a correction is authorized. The Developer makes only the approved correction, then CI reruns. Environment failures should be retried or investigated separately, not masked with `continue-on-error`.

## Testing Strategy

Before workflow modification, the Developer should verify the existing local commands:

```text
npm ci
npm test
npm run build
```

Workflow validation should include:

- YAML syntax/action-schema review;
- a PR-targeted run exercising policy, dependency, test, and build gates;
- a push-to-main run exercising the same gates;
- a negative policy check with a protected-path change;
- a negative policy check with `package.json` or `package-lock.json` changed;
- a missing-artifact check if artifact presence is made mandatory;
- confirmation that a failing gate prevents successful completion;
- confirmation that no secrets or write permissions are available.

The workflow itself should not modify application tests or dependencies. Existing known baseline E2E serialization failures involving omitted `description: undefined` must not be silently converted into a passing CI result; because the required CI test command is `npm test`, the current unit gate is unaffected. If E2E is later added to CI, its baseline status requires a separate human decision.

## Rollback Considerations

The implementation should be a small update to `.github/workflows/ci.yml`. Rollback is a human-controlled revert of that workflow change if the workflow is invalid, excessively restrictive, or incompatible with repository policy.

Do not roll back by disabling required checks, adding `continue-on-error`, granting broader permissions, switching to `pull_request_target`, or removing the policy gate. If the workflow blocks a legitimate change, classify the policy result and obtain human approval for a narrowly scoped policy adjustment.

## Human Approval Decisions

The following decisions require explicit human approval before workflow modification:

1. **Traceability enforcement:** whether all four Exercise 11 handoff artifacts must exist for every PR targeting `main`, or whether artifact presence is required only for the Exercise 11 exercise PR.
2. **Protected-file authorization:** whether any exception is allowed, and how a human-authorized exception is represented without trusting PR-controlled labels, comments, inputs, or scripts. The default recommendation is no automatic exception and fail closed.
3. **Action pinning:** whether to retain the current major-version references (`actions/checkout@v4`, `actions/setup-node@v4`) or pin each action to a reviewed full commit SHA.
4. **Dependency policy scope:** confirm that both `package.json` and `package-lock.json` changes must fail this exercise, even if they are synchronized and otherwise valid.
5. **Initial push diff behavior:** approve comparison against the first commit's parent or a full-history diff when `github.event.before` is all zeroes.
6. **Install script policy:** approve exact `npm ci` or `npm ci --ignore-scripts`; the recommendation is exact `npm ci` for alignment with the evaluation contract, with no secrets and no dependency-file changes available to PRs.
7. **E2E CI scope:** confirm that Exercise 11 requires only `npm test` and `npm run build`, as written, and does not add the known-failing `npm run test:e2e` command.
8. **Branch protection:** a human must configure required status checks and prevent merge while CI is failing. The workflow must not attempt this automatically.

## Traceability to `docs/exercise-11-evaluation.md`

| Evaluation requirement                | Plan coverage                                     |
| ------------------------------------- | ------------------------------------------------- |
| PRs targeting `main`                  | Triggers                                          |
| Pushes to `main`                      | Triggers                                          |
| Deterministic dependency installation | Dependency Installation                           |
| Unit test gate                        | Quality Gate, `npm test`                          |
| TypeScript/build gate                 | Quality Gate, `npm run build`                     |
| Scope/policy gate                     | Policy and Traceability Gate                      |
| Protected-file detection              | Scope and Policy Validation                       |
| Dependency-file detection             | Scope and Policy Validation                       |
| Least privilege                       | Permissions and Security Controls                 |
| PR security boundaries                | Pull-request security controls                    |
| No deployment                         | Proposed Workflow and Permissions                 |
| Failure classification/escalation     | Failure Handling                                  |
| Human-controlled merge                | Human Approval Decisions and Rollback             |
| Agent-to-CI traceability              | Traceability artifact check and handoff decisions |

## Planner Handoff

This artifact is read-only planning output. No workflow, source, test, dependency, repository setting, or protected configuration was changed.

PLANNER STATUS: READY FOR HUMAN APPROVAL

Decisions requiring approval are the eight items listed in **Human Approval Decisions**, especially artifact-enforcement scope, protected-file exception policy, action pinning, initial-push comparison, install-script policy, E2E scope, and branch-protection configuration.
