# Working Memory

## Status

This file is intentionally dormant until active coding starts.

Do not treat this document as a static planning doc. It is an implementation memory log that should be updated during development so future chats do not need to re-read the whole codebase.

## When To Start Using It

Start updating this file after the first real coding task begins.

## What To Record

- Current phase and subtask
- Files changed
- Decisions made
- Validation commands run
- Open issues or blockers
- Next recommended step

## Update Format

Use compact dated entries like this:

```text
## 2026-07-24
- Phase: Phase 2 - Checkout
- Completed: Added delivery estimate UI and API wiring.
- Files: frontend/src/features/checkout/..., backend/src/main/java/...
- Validation: npm run type-check, .\gradlew.bat compileJava
- Open: Payment retry UI still pending.
- Next: Wire Razorpay success and failure handling.
```

## When To Start A New Chat

Start a new chat when:

- A phase milestone is complete.
- The current task has become too broad.
- You need a fresh context window after updating this file.

## Rule

Before switching chats after implementation work, update this file first.