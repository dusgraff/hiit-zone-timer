# 2026-11-06-b. ADR process

Status: implemented

## Context

Specs and ADRs need a clear split of authority and a fixed path from idea to code. Without one, it's unclear whether the specs or the ADRs describe the current design, conflicting decisions get superseded without anyone noticing, and open questions get lost before code is written.

This ADR is worked alongside [2026-11-06-a](2026-11-06-a-adr-folder-structure-and-archiving.md), which sets the folders, naming, lifecycle and link rules. This one sets how ADRs are written and worked.

## Decision

### Specs vs. ADRs

`specs/` is the authoritative copy of all current specifications. To learn how things work now, read the specs. ADRs record why each decision was made. Readers usually reach them through links in the specs, not by browsing the archive. A spec section that rests on a decision links to its ADR.

**Every ADR changes the specs.** There's no ADR that doesn't end up in `specs/`; if a decision wouldn't change any spec, it doesn't need an ADR. That includes ADRs about the project's own process and structure: their rules go into specs too, so the current process can always be read in one place, even after later ADRs partly supersede earlier ones.

Within the ADR history, newer wins. An archived ADR supersedes any older ADR it conflicts with, and both ADRs record it (see Supersession below). Claude never supersedes silently: when a new ADR conflicts with an earlier decision or the current specs, Claude adds it to the new ADR's Loose ends section ("conflicts with what we decided in X — are we overriding it?") and waits for an answer.

### Process

The ADR's status changes as it moves through the steps. Claude manages the documents: it makes the moves, renames, status changes, links and index updates. Before each status change (steps 4, 7 and 8, and any rejection), Claude checks with the user that we're ready, and makes the change only on the user's go-ahead.

1. **Git check, then draft.** Before starting a new ADR in `proposed/`, Claude checks `git status` and reports what it finds. A clean working tree means we're good to go. If there are uncommitted files, we decide deliberately before moving on: commit them first, or carry them into the ADR on purpose (for example, prototype files that belong to it). The point is to start with a known git state, not necessarily an empty one. Claude doesn't commit as part of this check; committing stays with the user. Then write the ADR in `proposed/` with `Status: proposed`.
2. **Loose-ends check, ADR scope.** Check the ADR on its own: is it clear, complete and consistent? Open questions go in its Loose ends section and are worked through there.
3. **Loose-ends check, ADR vs. specs.** Once the ADR's own loose ends are settled, check it against the current specs and archived ADRs to make sure it's ready to go into the specs. Conflicts go in its Loose ends section. Any older ADRs this one overrides go in its Supersedes list.
4. **Accept.** When we decide to update the specs, the ADR becomes authoritative. Right before the spec update, its name is finalized, it moves to `archive/YYYY/MM/`, and its status changes to `Status: updating specs`. Moving it first lets the specs link to it. Supersession links are written both ways at this point (see Supersession).
5. **Update specs.** Update `specs/` to match the ADR, linking to it in the archive.
6. **Loose-ends check, specs vs. ADR.** Check the updated specs against the ADR to be sure nothing was missed. Anything found goes in the ADR's Loose ends section, which is still editable.
7. **Write code.** When the specs are done and we're ready to code, the status changes to `Status: implementing`. Loose ends found while coding go in the ADR's Loose ends section too, and are resolved in the ADR (and the specs, if the design changes) before moving on.
8. **Done.** `implemented` means the code is written, tests pass, the Loose ends section reads "No current loose ends.", and the work is ready to commit. When we agree it's done, the status changes to `Status: implemented` as the last edit before the commit, so the commit includes it. The user then makes the commit.

An ADR that needs no code (a process or documentation decision, for example) goes straight from `updating specs` to `implemented` once steps 5–6 are done.

Candidates don't need the git check. `candidates/` is a scratch space for dropping ideas so they don't get lost, and a candidate can be started at any time.

### Statuses

| Status | Folder | Steps | Editable? |
|---|---|---|---|
| `proposed` | `proposed/` | 1–3 | Yes |
| `updating specs` | `archive/YYYY/MM/` | 4–6 | Yes |
| `implementing` | `archive/YYYY/MM/` | 7 | Yes |
| `implemented` | `archive/YYYY/MM/` | 8 | No |
| `rejected` | `rejected/` | — | No |

- **Editing before `implemented`.** Until an ADR is `implemented`, problems found along the way are fixed in the ADR itself. Once it's archived, its name and path stay fixed and only the content changes. If a fix during `implementing` changes the design, the specs are updated to match.
- **Locked at `implemented`.** Once an ADR is `implemented`, any change to it needs a new ADR. The one exception is its "Superseded by" list, which can have lines added (see Supersession).
- **Rejected.** An ADR that's dropped gets `Status: rejected`. A proposed ADR is moved to `rejected/` with a finalized name, so its reasoning is kept. An ADR dropped after archiving (while `updating specs` or `implementing`) is handled manually until it happens often enough to need a process. Expected approach: save a copy of the ADR outside git, roll the repo back, then re-add the ADR to `rejected/` as `rejected` with what was tried and why it failed. Since the rollback also undoes any supersession links it added, nothing else needs cleanup.
- **Index upkeep.** Every status change also updates the ADR's entry in its month `.tldr.md` (or in `rejected/.tldr.md`).

### Supersession

Every ADR has a Supersession section with two lists, Supersedes and Superseded by. Each holds "- None." until there's something to record. Together they link the old and new ADRs both ways.

- **Only `implemented` ADRs are superseded.** An ADR at any earlier status can still be edited, so it's changed or rejected instead. A `rejected` ADR was never in force, so it's never superseded; a new ADR can simply revisit it.
- **Say which parts.** Each line names the ADR and what it covers, whole or partial. For example: "[2026-11-06-a](link) — Naming section only."
- **While the new ADR is proposed,** its Supersedes list names the old ADRs in plain text, and the old ADRs aren't touched.
- **At step 4,** when the new ADR moves to the archive, its Supersedes entries become links, and a line is added to each old ADR's Superseded by list: the new ADR's link, what it supersedes, and the date.
- **Superseded isn't a status.** The old ADR keeps `Status: implemented`. Its month `.tldr.md` entry adds "superseded by X (which parts)" so it shows without opening the file.
- **Specs follow the newest ADR.** In step 5, spec links for the affected sections move to the new ADR. After a partial supersession, a spec section may link to both.

### Spec edits without an ADR

Specs can take edits that don't change the design, such as typos, wording and clarifications, without an ADR. Anything that changes behavior or design goes through the process above.

### Specs structure

- **`specs/README.md` is the entry point.** It gives an overview of the project and a reading order, so the specs can be read front to back like a book, starting from the README.
- **Claude owns the rest of the structure:** how specs are split into files and subfolders, their names, and how sections are organized. The user's time goes to ADRs and loose ends; Claude turns each archived ADR into spec changes in step 5 and keeps the specs organized. Restructuring specs is a non-design edit and needs no ADR, as long as what the specs say about behavior or design doesn't change.
- **README and `.tldr.md` do different jobs.** The README is the narrative path for reading the specs through; `specs/.tldr.md` is the index for lookups. Both are updated whenever spec files are added, renamed or moved.

### Loose ends

Every ADR ends with a Loose ends section, and it's always present. **Every loose end found, at any step from drafting through coding, is recorded there as a bullet.** The ADR stays up to date until it's switched to `implemented`, which is when it's locked. Claude may also list them in the chat, but the ADR is where they live, so the list stays in one manageable place and can be worked through one or several at a time. Open questions are added as they come up. Once resolved, the answer is written into the ADR's body (usually Decision, with the losing option in Alternatives considered) and the question is removed. When none remain, the section holds a single bullet: "No current loose ends."

### ADR format

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
Open questions, removed once resolved. When none remain: "- No current loose ends."
```

## Alternatives considered

- **ADRs as the current design.** Keeping a curated set of "current" ADRs as the source of truth means files have to be shuffled between folders as decisions change, and readers have to piece the design together from many records. Specs give one place to read it.
- **Strictly append-only archive.** Every fix to an archived ADR would be a new ADR, even one found an hour later in the final check. That clutters the history with near-duplicates. Locking an ADR only at `implemented` avoids this.
- **A single `accepted` status.** Doesn't say how far along the ADR is. The step-by-step statuses track it all the way to code, and moving to the archive already marks acceptance.
- **Record supersession only in the new ADR.** Keeps old ADRs fully untouched, but someone reading an old ADR can't tell it's been replaced. Allowing only an append to its Superseded by list gives links both ways while leaving the decision text locked.
- **A `superseded` status.** Would mix progress through the process with later history, and a partial supersession doesn't fit a single status. The Supersession section and index entry carry it instead.
- **A separate ADR for specs structure.** Would give the structure its own record, but the rule is small and mostly "Claude manages it", so it lives here.
- **Archive after the final check.** Moving the ADR to the archive only after specs are updated and checked would keep the archive free of ADRs that later need fixes. But the ADR becomes authoritative the moment we decide to update specs, and specs need to link to it, which the link rule only allows once it's archived.

## Consequences

- Every new ADR starts from a known git state.
- Every design change reaches code through an ADR, the specs, and three loose-ends checks.
- Specs always describe the current design, so a reader never needs the ADR history to know how things work now.
- Conflicts with earlier decisions are always confirmed by the user, never resolved by Claude alone.
- An ADR's status always shows where it is in the process, from draft to implemented.
- An ADR can be fixed in place until it's `implemented`. After that it's locked, and changes need a new ADR.
- Small, non-design spec edits don't need the full process.
- Specs always start from `specs/README.md`, and their layout is Claude's to manage.
- Step 5 always applies. For these two ADRs (this one and [2026-11-06-a](2026-11-06-a-adr-folder-structure-and-archiving.md)), it means writing the ADR structure and process into `specs/`, and pointing the root CLAUDE.md at that spec instead of at the ADRs.
- Every supersession is linked both ways, so an old ADR always points to what replaced it and a new one to what it replaced.

## Supersession

### Supersedes

- None.

### Superseded by

- None.

## Loose ends

- No current loose ends.
