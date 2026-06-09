# AGENTS.md

Drop-in operating instructions for coding agents. Read this file before every task.

**Working code only. Finish the job. Plausibility is not correctness.**

This file follows the [AGENTS.md](https://agents.md) open standard (Linux Foundation / Agentic AI Foundation). Claude Code, Codex, Cursor, Windsurf, Copilot, Aider, Devin, Amp read it natively. For tools that look elsewhere, symlink:

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

---

## 0. Non-negotiables

These rules override everything else in this file when in conflict:

1. **No flattery, no filler.** Skip openers like "Great question", "You're absolutely right", "Excellent idea", "I'd be happy to". Start with the answer or the action.
2. **Disagree when you disagree.** If the user's premise is wrong, say so before doing the work. Agreeing with false premises to be polite is the single worst failure mode in coding agents.
3. **Never fabricate.** Not file paths, not commit hashes, not API names, not test results, not library functions. If you don't know, read the file, run the command, or say "I don't know, let me check."
4. **Stop when confused.** If the task has two plausible interpretations, ask. Do not pick silently and proceed.
5. **Touch only what you must.** Every changed line must trace directly to the user's request. No drive-by refactors, reformatting, or "while I was in there" cleanups.

---

## 1. Before writing code

**Goal: understand the problem and the codebase before producing a diff.**

- State your plan in one or two sentences before editing. For anything non-trivial, produce a numbered list of steps with a verification check for each.
- Read the files you will touch. Read the files that call the files you will touch. Claude Code: use subagents for exploration so the main context stays clean.
- Match existing patterns in the codebase. If the project uses pattern X, use pattern X, even if you'd do it differently in a greenfield repo.
- Surface assumptions out loud: "I'm assuming you want X, Y, Z. If that's wrong, say so." Do not bury assumptions inside the implementation.
- If two approaches exist, present both with tradeoffs. Do not pick one silently. Exception: trivial tasks (typo, rename, log line) where the diff fits in one sentence.

---

## 2. Writing code: simplicity first

**Goal: the minimum code that solves the stated problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code. No configurability, flexibility, or hooks that were not requested.
- No error handling for impossible scenarios. Handle the failures that can actually happen.
- If the solution runs 200 lines and could be 50, rewrite it before showing it.
- If you find yourself adding "for future extensibility", stop. Future extensibility is a future decision.
- Bias toward deleting code over adding code. Shipping less is almost always better.

The test: would a senior engineer reading the diff call this overcomplicated? If yes, simplify.

---

## 3. Surgical changes

**Goal: clean, reviewable diffs. Change only what the request requires.**

- Do not "improve" adjacent code, comments, formatting, or imports that are not part of the task.
- Do not refactor code that works just because you are in the file.
- Do not delete pre-existing dead code unless asked. If you notice it, mention it in the summary.
- Do clean up orphans created by your own changes (unused imports, variables, functions your edit made obsolete).
- Match the project's existing style exactly: indentation, quotes, naming, file layout.

The test: every changed line traces directly to the user's request. If a line fails that test, revert it.

---

## 4. Goal-driven execution

**Goal: define success as something you can verify, then loop until verified.**

Rewrite vague asks into verifiable goals before starting:

- "Add validation" becomes "Write tests for invalid inputs (empty, malformed, oversized), then make them pass."
- "Fix the bug" becomes "Write a failing test that reproduces the reported symptom, then make it pass."
- "Refactor X" becomes "Ensure the existing test suite passes before and after, and no public API changes."
- "Make it faster" becomes "Benchmark the current hot path, identify the bottleneck with profiling, change it, show the benchmark is faster."

For every task:

1. State the success criteria before writing code.
2. Write the verification (test, script, benchmark, screenshot diff) where practical.
3. Run the verification. Read the output. Do not claim success without checking.
4. If the verification fails, fix the cause, not the test.

---

## 5. Tool use and verification

- Prefer running the code to guessing about the code. If a test suite exists, run it. If a linter exists, run it. If a type checker exists, run it.
- Never report "done" based on a plausible-looking diff alone. Plausibility is not correctness.
- When debugging, address root causes, not symptoms. Suppressing the error is not fixing the error.
- For UI changes, verify visually: screenshot before, screenshot after, describe the diff.
- Use CLI tools (gh, aws, gcloud, kubectl) when they exist. They are more context-efficient than reading docs or hitting APIs unauthenticated.
- When reading logs, errors, or stack traces, read the whole thing. Half-read traces produce wrong fixes.

---

## 6. Session hygiene

- Context is the constraint. Long sessions with accumulated failed attempts perform worse than fresh sessions with a better prompt.
- After two failed corrections on the same issue, stop. Summarize what you learned and ask the user to reset the session with a sharper prompt.
- Use subagents (Claude Code: "use subagents to investigate X") for exploration tasks that would otherwise pollute the main context with dozens of file reads.
- When committing, write descriptive commit messages (subject under 72 chars, body explains the why). No "update file" or "fix bug" commits. No "Co-Authored-By: Claude" attribution unless the project explicitly wants it.

---

## 7. Communication style

- Direct, not diplomatic. "This won't scale because X" beats "That's an interesting approach, but have you considered...".
- Concise by default. Two or three short paragraphs unless the user asks for depth. No padding, no restating the question, no ceremonial closings.
- When a question has a clear answer, give it. When it does not, say so and give your best read on the tradeoffs.
- Celebrate only what matters: shipping, solving genuinely hard problems, metrics that moved. Not feature ideas, not scope creep, not "wouldn't it be cool if".
- No excessive bullet points, no unprompted headers, no emoji. Prose is usually clearer than structure for short answers.

---

## 8. When to ask, when to proceed

**Ask before proceeding when:**

- The request has two plausible interpretations and the choice materially affects the output.
- The change touches something you've been told is load-bearing, versioned, or has a migration path.
- You need a credential, a secret, or a production resource you don't have access to.
- The user's stated goal and the literal request appear to conflict.

**Proceed without asking when:**

- The task is trivial and reversible (typo, rename a local variable, add a log line).
- The ambiguity can be resolved by reading the code or running a command.
- The user has already answered the question once in this session.

---

## 9. Self-improvement loop

**This file is living. Keep it short by keeping it honest.**

After every session where the agent did something wrong:

1. Ask: was the mistake because this file lacks a rule, or because the agent ignored a rule?
2. If lacking: add the rule under "Project Learnings" below, written as concretely as possible ("Always use X for Y" not "be careful with Y").
3. If ignored: the rule may be too long, too vague, or buried. Tighten it or move it up.
4. Every few weeks, prune. For each line, ask: "Would removing this cause the agent to make a mistake?" If no, delete. Bloated AGENTS.md files get ignored wholesale.

Boris Cherny (creator of Claude Code) keeps his team's file around 100 lines. Under 300 is a good ceiling. Over 500 and you are fighting your own config.

---

## 10. Project context

**Fill this in per project. Keep it specific. Delete sections that don't apply.**

**Project**: meal-planning shopping list app (recipes → meal plan → aggregated shopping list). Full spec in `liste-courses-app.md` — read it before any feature work. V1 is front-only, no backend, persistence via `localStorage`. UI text is French; code identifiers are English.

Deliberate deviations from the spec (user-approved): `ShoppingList` is persisted with a `weekStart` and per-item `checked` state (checks survive reload; "Regénérer" resets them); generation is filtered to one week (the plan has prev/next week navigation); `AddRecipeUseCase`/`UpdateRecipeUseCase` are merged into `SaveRecipeUseCase`; ingredients are created inline from the recipe form (find-or-create by name, case-insensitive — no ingredients page); recipes are defined by structured steps (`RecipeStep` = prefilled action from `STEP_ACTIONS` + free detail) instead of the free-text instructions textarea — legacy `instructions` is still rendered in the preview and converted to one "Préparer" step when editing; clicking a recipe (list row, or via the slot modal) opens a read-only preview (`RecipePreview.vue`) with quantities scaled to the slot's servings; the week calendar is 7 horizontal day-columns from 840px up, and a vertical day list (day header + the 2 meal cells side by side) below 840px; Firebase (Firestore + Auth with one shared email/password account) replaces localStorage when `VITE_FIREBASE_*` is set in `.env.local` — repositories in `src/infrastructure/firebase/`, `AuthGateway` port in `src/application/auth/`, login gate in `App.vue`, rules in `firestore.rules`; without config the app falls back to localStorage with no login (this is what tests exercise).

### Stack

- Language: TypeScript 6
- Framework: Vue 3 (Composition API) + Vite 8 + vue-router 5
- Styling: Tailwind CSS v4 (`@tailwindcss/vite` plugin, no tailwind config file; tokens/utilities in `src/style.css`)
- Package manager: npm with `package-lock.json`
- Storage: Firestore (with offline persistent cache) when Firebase is configured, `localStorage` otherwise — both behind the same typed repository interfaces

### Commands

- Install: `npm install`
- Build: `npm run build`
- Test (all): `npm test`
- Test (single file): `npx vitest run path/to/file.test.ts`
- Typecheck: `npm run typecheck` (`vue-tsc -b`, project references)
- Run locally: `npm run dev`

Prefer single-file or single-test runs during iteration. Full suites are for the final verification pass.

### Layout

Layered architecture (see spec §3 for the full tree):

- `src/domain/` — models (`Recipe`, `Ingredient`, `MealPlan`, …), pure services (`ShoppingListService`, …), repository interfaces (ports)
- `src/application/usecases/` — use cases orchestrating services + repositories
- `src/infrastructure/storage/` — `LocalStorage*Repository` implementations (JSON under `mealapp.*` keys; no mappers — domain models are plain JSON-serializable interfaces)
- `src/infrastructure/firebase/` — `Firestore*Repository` implementations + `FirebaseAuthGateway` (lazy init in `firebaseApp.ts`; `toFirestoreData` strips `undefined` before writes — Firestore rejects it)
- `src/ui/` — Vue components, pages, router
- `src/shared/` — cross-cutting utils and types
- Tests: colocated `*.test.ts` files next to the code under test; Vitest default env is `node` — UI tests declare `// @vitest-environment jsdom` at the top of the file
- Composition root: `src/compositionRoot.ts` (`createUseCases()`), wired into the app by `src/main.ts` via `provide(USE_CASES, ...)` from `src/ui/di.ts`
- Do not modify: `dist/`, `node_modules/`, `package-lock.json` unless dependencies changed intentionally

### Conventions specific to this repo

- Naming: `PascalCase` for Vue components and classes, `camelCase` for variables/functions
- Dependency direction: UI → use cases → domain interfaces; concrete repositories injected at the composition root (`src/compositionRoot.ts`) via `provide`/`inject` (`useUseCases()` composable)
- Domain services are pure: no `localStorage`, no DOM, no Vue imports — they take data in, return data out, and are unit-tested in isolation
- Testing: Vitest for domain services and use cases first; UI tests second

### Forbidden

- Do not access `localStorage` outside `src/infrastructure/storage/`
- Do not call repositories directly from Vue components; go through use cases
- Do not add a custom backend or HTTP calls beyond the Firebase SDK (Firebase is a user-approved deviation; the rest is V2 — see spec §10)
- Do not import `firebase/*` outside `src/infrastructure/firebase/`
- Do not import from `infrastructure/` inside `domain/` or `application/` (depend on the interfaces, not the implementations)

---

## 11. Project Learnings

**Accumulated corrections. This section is for the agent to maintain, not just the human.**

When the user corrects your approach, append a one-line rule here before ending the session. Write it concretely ("Always use X for Y"), never abstractly ("be careful with Y"). If an existing line already covers the correction, tighten it instead of adding a new one. Remove lines when the underlying issue goes away (model upgrades, refactors, process changes).

- Do not re-add `erasableSyntaxOnly` to `tsconfig.app.json`: the codebase uses constructor parameter properties (`private readonly repo: X`) throughout services and use cases, as in spec §6.
- Windows PowerShell 5.1 shell: never chain commands with `&&`; use `;` or `if ($?) { ... }`.
- After killing `npm run dev` on Windows, the node child can keep listening; verify the port is actually free (`Get-NetTCPConnection -LocalPort 5173 -State Listen`) and kill the owning PID before trusting test results against that port.
- Never `structuredClone` a Vue prop or anything read from a `ref`/`reactive`: it's a reactive Proxy and throws `DataCloneError` at runtime (typecheck and tests won't catch it). Copy with spread/`.map` instead.
- UI design: the user finds monochrome/pale palettes too bland (rejected two single-accent passes). The validated language is "pop ludique, riche mais maîtrisé": candy colors + emoji on components, sober backgrounds, few animations — see `src/ui/recipeVisual.ts` and the tokens in `src/style.css`.
- The `olive-*` tokens in `src/style.css` hold the **coral** primary scale (historical name kept to avoid churning ~30 class occurrences); do not reintroduce green values under that name.

---
