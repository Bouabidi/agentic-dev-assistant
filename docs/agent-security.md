# Agent Security & Least Privilege

## Purpose

This repository uses multiple specialized agents to support different parts of the development workflow. Each agent should be given only the capabilities required for its role so that the system remains predictable, auditable, and resistant to accidental misuse.

The guiding principle is simple: a planner should not be able to edit code, a tester should not be able to merge changes, and a human should remain the final authority for any operation with material repository impact.

## Agent Permission Model

| Agent     | Read repository | Modify files | Run tests | GitHub MCP     | Git commit/push/merge |
| --------- | --------------- | ------------ | --------- | -------------- | --------------------- |
| Planner   | Yes             | No           | No        | Read-only      | No                    |
| Developer | Yes             | Yes          | Yes       | Read-only      | No                    |
| Tester    | Yes             | No           | Yes       | Read-only      | No                    |
| Reviewer  | Yes             | No           | Yes       | Read-only      | No                    |
| Human     | Yes             | Yes          | Yes       | Full authority | Yes                   |

## MCP Security

The repository configures a read-only GitHub MCP server in `.vscode/mcp.json`.

- `.vscode/mcp.json` configures the `github-readonly` MCP server.
- The configured GitHub endpoint is read-only.
- No credentials or tokens are stored in the repository.
- The MCP server provides capabilities to the agent, but only exposed capabilities can be used.

This means the development environment grants access only to the exact operations that are explicitly allowed. The repository itself does not include secrets or credential material, and the MCP server does not broaden permissions beyond what is configured for it.

## Least Privilege

Agents should receive only the minimum capabilities required for their role. This reduces the blast radius of mistakes, misconfigurations, and malicious or accidental instructions. For example:

- A planner only needs repository context and planning input.
- A developer needs file modification and test execution access.
- A tester only needs to read the repository and execute validation.
- A reviewer needs to inspect code and run checks, not mutate files or push changes.

Restricting capabilities in this way improves reliability and makes it easier to reason about what a given agent can and cannot do.

## Human-in-the-Loop

Certain operations remain under direct human control:

- commits
- pushes
- pull requests
- merges
- destructive GitHub operations

These actions have meaningful repository and workflow consequences. They should require explicit human intent and review before execution. This keeps operational authority aligned with human responsibility and reduces the risk of unintended repository changes.

## Permission Boundary Test

We successfully validated the repository security model by performing the following read-only checks:

1. Read repository metadata through the readonly MCP connection.
2. Read the latest commit on `main`.
3. Attempted to create a GitHub issue.
4. The issue creation was blocked because the readonly MCP connection exposes no write capability.

This verifies that write operations are outside the effective capability boundary of the configured MCP server.

## Security Principles

This repository follows these principles:

- least privilege
- capability-based access
- read-only by default
- human approval for consequential operations
- separation of planning, implementation, testing and review
- no credentials in source control

These principles work together to keep the agent workflow constrained, observable, and safe.
