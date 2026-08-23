# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Project overview

- This repository contains an Obsidian community plugin that imports Kindle notebook exports and converts them into Markdown notes.
- The plugin entry point is `main.ts`.
- Source code is organized under `src/`:
  - `src/components/` contains Obsidian modal and UI helper components.
  - `src/processing/` contains parsing, Goodreads lookup, and Markdown export logic.
  - `src/settings/` contains plugin settings defaults and types.
- Tests live under `tests/` and mirror the relevant source areas.

## Tooling and commands

Use npm scripts from `package.json`:

- Install dependencies with `npm install` when needed.
- Run the full test suite with `npm test`.
- Run type-checking and production bundling with `npm run build`.
- Run linting/format checks with `npm run biome:check`.
- Apply formatter/linter fixes with `npm run biome:fix`.

Before committing code changes, run at least:

```bash
npm test
npm run biome:check
npm run build
```

If a command cannot run because of an environment limitation, note the exact error in your final response or PR notes.

## Code style

- This is a TypeScript project using Biome.
- Use 2-space indentation, double quotes, trailing commas, and semicolons, matching `biome.json`.
- Keep lines at or below the configured 120-column width where practical.
- Prefer explicit types for exported APIs and public-facing data structures.
- Use existing path aliases such as `src/...` where they are already used.
- Do not wrap imports in `try`/`catch` blocks.

## Testing expectations

- Add or update Jest tests for behavior changes.
- Prefer focused unit tests in the matching `tests/processing/` or `tests/components/` area.
- Keep Obsidian API interactions isolated behind mocks in `tests/__mocks__/obsidian.ts`.
- For parser changes, include representative Kindle export snippets or fixtures that exercise the new behavior.
- For Markdown export changes, assert the generated Markdown structure and file paths, not just that a write occurred.

## Obsidian plugin considerations

- Avoid Node-only APIs in runtime plugin code unless the existing Obsidian environment already supports the usage.
- Keep UI changes compatible with Obsidian's plugin APIs and existing modal patterns.
- Normalize vault paths with Obsidian's `normalizePath` when storing or constructing user-facing file paths.
- Avoid overwriting existing vault files unless the change explicitly implements and tests that behavior.
- Use `Notice` for user-facing status messages and console output only for diagnostic details.

## Dependency and generated-file guidance

- Do not commit `node_modules/`, coverage output, or build artifacts such as `main.js` unless explicitly required by the release workflow.
- Keep `package-lock.json` in sync when changing dependencies.
- Do not add new runtime dependencies unless they are necessary for plugin users and the tradeoff is documented.

## Git and PR guidance

- Keep commits focused and use clear imperative commit messages.
- Mention the tests and checks run in PR descriptions.
- If behavior changes affect users, update `README.md` or other documentation in the same change.
