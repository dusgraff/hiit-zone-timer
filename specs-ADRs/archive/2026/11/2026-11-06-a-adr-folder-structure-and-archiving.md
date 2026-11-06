# 2026-11-06-a. ADR folder structure and archiving

Status: implemented

## Context

In earlier projects, ADRs were numbered sequentially and kept in folders by status (`current/`, `.archive/`). Two problems came up:

- **Folders grew too long to browse.** Once there were dozens or hundreds of files, the tree view in VS Code or Explorer meant miles of scrolling. Search became the only way to find anything.
- **Status changes moved files.** Each time an ADR went from current to archived, its path changed and every link to it broke.

This project needs a layout where every folder stays small and an accepted ADR never moves. This ADR covers structure only: folders, naming, lifecycle and links. The workflow is in [2026-11-06-b](2026-11-06-b-adr-process.md).

## Decision

### Folders

```
specs/                  living specs: the current design, kept up to date
specs-ADRs/
  candidates/           ideas worth writing down, not yet decisions (temporary)
  proposed/             drafted ADRs, not yet accepted
  archive/              accepted ADRs (any status past proposed), their final home
    YYYY/
      MM/
        YYYY-MM-DD-x-descriptive-name.md
  rejected/             rejected ADRs, their final home (flat)
    YYYY-MM-DD-x-descriptive-name.md
```

`archive/` gets a year folder, then a month folder. No day folder. A year or month folder only exists once it holds an ADR. `rejected/` is flat, since rejections should be rare.

### Naming

ADR files are named `YYYY-MM-DD-x-descriptive-name.md`:

- `YYYY-MM-DD` is a date (see below for which one).
- `x` is a lowercase letter (`a`, `b`, `c`, ...).
- `descriptive-name` is a short kebab-case summary.

**The archive and `rejected/` are the only authority for IDs.** Names in `proposed/` are tentative; the ID is fixed only when the ADR moves to `archive/` or `rejected/`.

- **While proposed, the date is always today.** A new proposal uses the current date. If a proposal is picked back up on a later day, it's re-dated to the current date right away. Its letter is a placeholder: any letter not already used by another file with that date. Placeholder letters never block anything.
- **Moving out of `proposed/` fixes the ID.** The date becomes the day of the move, and the letter becomes the next one not yet used on that date across both `archive/` and `rejected/`. A rejected ADR takes the date it's rejected. Because the letter is assigned against those two folders at the moment of the move, IDs can't collide.
- **Renames update mentions.** When a proposal is re-dated or its name finalized, any companion proposal that mentions it by filename in plain text is updated at the same time.
- **After the move, the name is permanent.**

The ID is the date and letter (e.g. `2026-11-06-a`). The file's heading starts with the ID: `# 2026-11-06-a. Title`.

### Lifecycle

1. **Candidate.** An undecided idea goes in `candidates/`, with any filename. Candidates are temporary. Once their content is turned into a proposed ADR, or the idea is dropped, the candidate file is deleted.
2. **Proposed.** A drafted ADR goes in `proposed/` with `Status: proposed`.
3. **Archived.** When we decide to update specs, the ADR's name is finalized and it moves to `archive/YYYY/MM/`, using the year and month from its final ID. It then moves through the statuses set by [2026-11-06-b](2026-11-06-b-adr-process.md) (`updating specs`, `implementing`, `implemented`). This is the only move an ADR ever makes.
4. **Rejected.** A proposed ADR that isn't adopted is finalized the same way and moves to `rejected/` with `Status: rejected`, so the reasoning is kept. An ADR rejected after archiving is handled manually for now (see [2026-11-06-b](2026-11-06-b-adr-process.md)).
5. **Superseded.** An older ADR stays where it is when a newer one replaces it. The two are linked both ways through their Supersession sections, as set by [2026-11-06-b](2026-11-06-b-adr-process.md).

### Links

**Hard rule: links point only to ADRs in `archive/` or `rejected/`.** Nothing anywhere links to a file in `proposed/` or `candidates/`. Links from a proposed ADR to archived or rejected ADRs are fine.

- An archived ADR's folder follows from its ID: `specs-ADRs/archive/YYYY/MM/<ID>-name.md`. A rejected one is at `specs-ADRs/rejected/<ID>-name.md`.
- Proposals can depend on each other only when they're being worked at the same time and are kept as separate files for organization. While proposed, they refer to each other by full filename in plain text. They're accepted together, and those mentions become links once the files are in the archive.

### Process and format

How ADRs are written, checked and accepted, and how they relate to `specs/`, is set by [2026-11-06-b](2026-11-06-b-adr-process.md), worked alongside this ADR.

## Alternatives considered

- **Sequential numbers (`0001-...`).** Short, but numbers collide when ADRs are written on parallel branches, and a flat numbered folder becomes too long to browse.
- **Folders by status (`current/`, `archive/`).** Every status change moves the file and breaks links. Already tried, and it didn't hold up.
- **Folders by topic.** Readers can browse by subject, but files get misfiled, and topic folders eventually need splitting, which moves files again.
- **Year/month/day folders.** Most days hold one to three ADRs, so a day folder adds a click and a set of TLDR files for very little grouping. Month folders stay small enough to browse.
- **Dot-prefixed folders (`.archive/`, `.candidates/`).** Search tools often skip dot folders by default, and the archive is the folder that most needs to be searchable.

## Consequences

- An archived ADR's path is permanent, and nothing links to files that will move, so links never break.
- `proposed/` and `candidates/` hold work in progress. TLDR is disabled there, and their files are opened directly when they're being discussed.
- Folders stay small: a handful of year folders, at most 12 month folders in each, and one month's ADRs in each month folder.
- The archive isn't grouped by topic. Topic-based lookup goes through the specs and the one-line entries in each month's `.tldr.md`. Those entries name the topic and status of each ADR.
- Each new year or month folder gets its TLDR files (`CLAUDE.md` and `.tldr.md`) when it's created.
- Superseded ADRs stay in the archive next to the others. Each ADR's status shows in its `.tldr.md` entry, so readers don't need to open it to see where it stands.
- Rejected ADRs live in `rejected/`, so the archive holds only decisions that were actually adopted. `rejected/` keeps its TLDR files like the archive does.

## Supersession

### Supersedes

- None.

### Superseded by

- None.

## Loose ends

- No current loose ends.
