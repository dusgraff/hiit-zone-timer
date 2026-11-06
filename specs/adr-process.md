# ADR process

How decisions are made and carried into the specs and code. Where ADRs live and how they're named is in [adr-structure.md](adr-structure.md).

Decided in [ADR 2026-11-06-b](../specs-ADRs/archive/2026/11/2026-11-06-b-adr-process.md).

## Specs and ADRs

- **`specs/` is the authoritative copy of all current specifications.** To learn how things work now, read the specs. ADRs record why each decision was made; readers reach them mostly through links in the specs. A spec section that rests on a decision links to its ADR.
- **Every ADR changes the specs.** If a decision wouldn't change any spec, it doesn't need an ADR. That includes decisions about the project's own process and structure.
- **Newer wins.** An archived ADR supersedes any older ADR it conflicts with, and both record it (see [Supersession](#supersession)). Claude never supersedes silently: a conflict with an earlier decision or the current specs goes in the new ADR's Loose ends ("conflicts with X — are we overriding it?") until the user answers.
- **Spec edits without an ADR.** Edits that don't change the design — typos, wording, clarifications, reorganizing — need no ADR. Anything that changes behavior or design goes through the process below.

## Who does what

Claude manages the documents: moves, renames, status changes, links, specs and index updates. The user's time goes to the ADRs and their loose ends. Before each status change (steps 4, 7 and 8, and any rejection), Claude checks with the user that we're ready, and makes the change only on the user's go-ahead. Claude never commits; the user does.

## Steps

1. **Git check, then draft.** Before starting a new ADR in `proposed/`, Claude checks `git status` and reports what it finds. A clean tree means go. Uncommitted files need a deliberate decision first: commit them, or carry them into the ADR on purpose (e.g. prototype files that belong to it). Then the ADR is written in `proposed/` with `Status: proposed`.
2. **Loose-ends check, ADR scope.** Is the ADR clear, complete and consistent on its own?
3. **Loose-ends check, ADR vs. specs.** Once its own loose ends are settled, check it against the current specs and archived ADRs. Conflicts go in Loose ends; older ADRs it overrides go in its Supersedes list.
4. **Accept.** When we decide to update the specs, the ADR becomes authoritative. Its ID is finalized, it moves to `archive/YYYY/MM/`, and its status becomes `updating specs`. Supersession links are written both ways now.
5. **Update specs.** Update `specs/` to match the ADR, linking to it in the archive.
6. **Loose-ends check, specs vs. ADR.** Check the updated specs against the ADR so nothing is missed.
7. **Write code.** When we're ready to code, the status becomes `implementing`. Loose ends found while coding are resolved in the ADR (and the specs, if the design changes) before moving on.
8. **Done.** The status becomes `implemented` once the code is written, tests pass, the ADR has no open loose ends, and the work is ready to commit. It's the last edit before the user's commit.

An ADR that needs no code goes from `updating specs` straight to `implemented` once steps 5–6 are done.

Candidates skip all of this. `candidates/` is a scratch space; a candidate can be started at any time, with no git check.

## Statuses

| Status | Folder | Steps | Editable? |
|---|---|---|---|
| `proposed` | `proposed/` | 1–3 | Yes |
| `updating specs` | `archive/YYYY/MM/` | 4–6 | Yes |
| `implementing` | `archive/YYYY/MM/` | 7 | Yes |
| `implemented` | `archive/YYYY/MM/` | 8 | No |
| `rejected` | `rejected/` | — | No |

- **Editable until `implemented`.** Problems found along the way are fixed in the ADR itself. Once archived, its name and path stay fixed; only content changes. If a fix during `implementing` changes the design, the specs are updated to match.
- **Locked at `implemented`.** Any later change needs a new ADR. The one exception: lines can be added to its Superseded by list.
- **Rejected.** A dropped ADR gets `Status: rejected`. A proposed ADR moves to `rejected/` with its ID finalized. An ADR dropped after archiving (while `updating specs` or `implementing`) is handled manually until it happens often enough to need a process. Expected approach: save a copy of the ADR outside git, roll the repo back, then re-add it to `rejected/` with what was tried and why it failed.
- **Index upkeep.** Every status change also updates the ADR's entry in its month `.tldr.md` (or `rejected/.tldr.md`).

## Supersession

Every ADR has a Supersession section with two lists, Supersedes and Superseded by, each holding "- None." until there's something to record. Together they link old and new ADRs both ways.

- **Only `implemented` ADRs are superseded.** An ADR at an earlier status is edited or rejected instead. A `rejected` ADR was never in force, so it's never superseded; a new ADR can simply revisit it.
- **Say which parts.** Each line names the ADR and what it covers, whole or partial, e.g. "[2026-11-06-a](link) — Naming section only."
- **While the new ADR is proposed,** its Supersedes list names old ADRs in plain text, and the old ADRs aren't touched.
- **At step 4,** the new ADR's Supersedes entries become links, and each old ADR's Superseded by list gets a line: the new ADR's link, what it supersedes, and the date.
- **Superseded isn't a status.** The old ADR keeps `Status: implemented`. Its month `.tldr.md` entry adds "superseded by X (which parts)".
- **Specs follow the newest ADR.** In step 5, spec links for the affected sections move to the new ADR. After a partial supersession, a section may link to both.

## Loose ends

Every ADR ends with a Loose ends section, always present.

- **Every loose end found, at any step from drafting through coding, is recorded there as a bullet.** Claude may also list them in chat, but the ADR is where they live, so the list stays in one place and can be worked through one or several at a time.
- **Resolving one** means writing the answer into the ADR body (usually Decision, with the losing option in Alternatives considered) and removing the bullet.
- **When none remain,** the section holds a single bullet: "No current loose ends."

## ADR template

```
# YYYY-MM-DD-x. Title

Status: proposed | updating specs | implementing | implemented | rejected

## Context
What situation or problem forced a decision?

## Decision
What did we decide?

## Alternatives considered
What else was on the table, and why did it lose?

## Consequences
What does this decision commit us to?

## Supersession

### Supersedes
- None. (or: - [ID](link) — which parts)

### Superseded by
- None. (or: - [ID](link) — which parts, as of YYYY-MM-DD)

## Loose ends
- No current loose ends.
```

## Specs structure

- **`specs/README.md` is the entry point.** It gives an overview of the project and a reading order, so the specs can be read front to back like a book.
- **Claude owns the rest of the structure:** files, subfolders, names and section layout. Restructuring is a non-design edit and needs no ADR.
- **README and `.tldr.md` do different jobs.** The README is the reading path; `specs/.tldr.md` is the lookup index. Both are updated whenever spec files are added, renamed or moved.
