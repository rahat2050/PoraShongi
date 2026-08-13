# Git Workflow

Development follows a strict **phase-based** workflow.

## Rules

1. Build **one phase at a time** — never combine or skip phases.
2. Always work on a phase branch — never on `main`.
3. Branch naming is fixed, e.g. `PHASE-1-FOUNDATION-ARCHITECTURE`.
4. Before completing a phase:
   - `npm install`
   - `npm run lint`
   - `npm run build`
   - `npm run typecheck` (if available)
   - fix every error/warning
5. Commit, push, and open a **Pull Request** against `main`.
6. Resolve conflicts if any.
7. **Do NOT merge** the PR — stop after everything works.

## Example (Phase 1)

```bash
git checkout -b PHASE-1-FOUNDATION-ARCHITECTURE
# … work …
npm install
npm run lint
npm run build
npm run typecheck
git add .
git commit -m "feat(phase-1): foundation & architecture"
git push -u origin PHASE-1-FOUNDATION-ARCHITECTURE
# open PR targeting main (do not merge)
```

## Commit conventions

- `feat(phase-N): …` — new functionality
- `fix(phase-N): …` — bug fixes
- `docs: …` — documentation
- `chore: …` — tooling/config
