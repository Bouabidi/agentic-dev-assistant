# Agentic Dev Assistant - Copilot Instructions

## Project

This repository contains a small NestJS TypeScript task-management API.

The project is intentionally simple and is used as a learning project
for agentic software development.

## Architecture

Follow the existing NestJS architecture:

- Controllers handle HTTP requests.
- Services contain application logic.
- Interfaces/types define data structures.
- Tests validate behavior.

Do not introduce a new architectural pattern unless explicitly requested.

## Development Principles

- Keep changes small and focused.
- Prefer simple solutions.
- Follow existing project conventions.
- Use strict TypeScript.
- Avoid unnecessary dependencies.
- Do not rewrite unrelated code.
- Preserve existing behavior unless the requirement explicitly changes it.

## Testing

Every new behavior should have automated tests.

Before considering a task complete:

1. Run the relevant tests.
2. Run the complete test suite.
3. Run the application build when appropriate.
4. Investigate failures instead of ignoring them.

## Git

Development work must be performed on a feature branch.

Do not directly modify the main branch for feature development.

Before committing:

- Inspect the diff.
- Verify that only relevant files changed.
- Ensure tests pass.

Use clear conventional commit messages.

## Pull Requests

A completed feature should normally be delivered through a pull request.

The pull request should contain:

- Summary
- Important implementation details
- Testing performed
- Any known limitations

## Security

Never:

- expose secrets
- hard-code credentials
- modify production infrastructure
- delete repositories
- disable security controls
- bypass required reviews

Do not access production resources unless explicitly authorized.

## Agent Behavior

Before making substantial changes:

1. Understand the requirement.
2. Inspect the relevant code.
3. Create an implementation plan.
4. Identify affected files.
5. Implement the smallest reasonable change.
6. Validate the result.
7. Report what was changed and how it was validated.

If requirements are ambiguous, identify the ambiguity rather than inventing unnecessary behavior.