## Task N: [Task title from tasks.md]

**Branch:** `task-<n>-<slug>` (e.g. `task-9-api-foundation`)

### Acceptance criteria (copy from tasks.md and check off)

- [ ] _Criterion 1_
- [ ] _Criterion 2_
- [ ] _Add all criteria from the task section_

### Verification

- [ ] `pnpm turbo lint` passes
- [ ] `pnpm turbo type-check` passes
- [ ] `pnpm turbo test` passes
- [ ] `pnpm turbo test:e2e` passes (if E2E relevant)

### Hiccups / findings / success

_Note any major hiccups, findings, or successes (mirrors CHANGELOG.md)._

---

**PR checklist (AGENTS.md §8):**

- [ ] Scoped to one task (or clearly scoped subtask)
- [ ] Acceptance criteria copied from `tasks.md` and checked off
- [ ] Tests added/updated (unit/integration/E2E as appropriate)
- [ ] No contract drift (REST/socket/types) without updating shared types + docs
- [ ] `CHANGELOG.md` updated with progress, decisions, and lessons learned
- [ ] Verified locally with `pnpm turbo lint`, `pnpm turbo type-check`, `pnpm turbo test`
- [ ] If realtime/canvas touched: checked for obvious performance regressions
