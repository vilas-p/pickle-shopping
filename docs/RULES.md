# AI Implementation Rules

## Purpose

These rules define how AI should work inside this repository so implementation remains consistent, safe, and aligned with the current stack.

## Core Rules

- Work inside the existing monorepo structure.
- Prefer extending current patterns over introducing new architectures.
- Make the smallest correct change that solves the problem.
- Fix root causes when practical, not surface symptoms.
- Do not rewrite unrelated code.

## Frontend Rules

- Use Next.js 15 App Router patterns already present in the repo.
- Use React 19 with TypeScript.
- Use Tailwind CSS for styling.
- Reuse the existing design tokens, typography, and shared UI patterns.
- Prefer feature-specific code inside `frontend/src/features`.
- Prefer shared code inside `frontend/src/shared`.
- Use built-in `fetch` and existing helpers instead of adding Axios.
- Do not add Redux, MobX, or another state library unless the user explicitly asks.
- Use Zustand only when shared client state is genuinely needed.
- Keep SEO-relevant pages metadata-aware.

## Backend Rules

- Use Spring Boot conventions already present in the repo.
- Keep code inside the existing layered structure: controller, service, repository, domain.
- Use DTOs at API boundaries.
- Use Bean Validation for request validation.
- Use MapStruct for mapping where mapping already follows that pattern.
- Keep business logic in services, not controllers.
- Do not bypass security or validation for convenience.

## Dependency Rules

- Prefer existing dependencies before adding new ones.
- Add a new library only if the current stack does not already solve the problem cleanly.
- Avoid adding libraries for trivial utilities.
- Avoid overlapping libraries that duplicate current capabilities.

## Error Handling Rules

- Fail clearly, not silently.
- Show user-safe error messages on the frontend.
- Preserve detailed operational logging on the backend without leaking secrets.
- Use existing backend exception handling patterns.
- Validate external API responses before trusting them.
- Handle empty, loading, and error states explicitly in the UI.

## Security Rules

- Never hardcode secrets, tokens, or credentials.
- Keep secrets in environment variables only.
- Never expose backend-only secrets to the frontend.
- Maintain separation between admin auth and customer auth.
- Treat all user input as untrusted.
- Keep protected routes guarded on both frontend and backend.

## Data Rules

- Respect current database schema and Flyway migration practices.
- Never modify old migrations that have already been applied.
- Add a new Flyway migration for schema changes.
- Keep API payloads backward-compatible unless a deliberate breaking change is required.

## Styling Rules

- Follow the brand direction: warm, family-made, premium, calm, and trustworthy.
- Reuse the existing palette and font decisions before inventing new ones.
- Avoid generic startup-style UI.
- Keep mobile responsiveness mandatory.
- Keep accessibility part of the default implementation, not an afterthought.

## Testing And Validation Rules

- Validate changes with the narrowest relevant command first.
- For frontend, prefer `npm run type-check`, `npm run lint`, and targeted build checks.
- For backend, prefer Gradle compile or test tasks relevant to the change.
- Do not claim something works if it has not been validated.

## Documentation Rules

- Update docs when architecture, setup, flows, or conventions change.
- Keep docs concrete and repository-specific.
- Do not leave placeholder documentation that contradicts actual code.

## What AI Should Do

- Search locally before assuming patterns.
- Reuse existing files, helpers, and conventions.
- Leave concise, maintainable code.
- Record implementation progress in `docs/MEMORY.md` once coding begins.

## What AI Should Not Do

- Do not introduce a parallel architecture.
- Do not add speculative features the project has not asked for.
- Do not perform destructive git operations unless explicitly requested.
- Do not remove user changes without permission.
- Do not make up APIs, env vars, or business rules without checking the codebase.
- Do not create broad refactors when a local fix is enough.