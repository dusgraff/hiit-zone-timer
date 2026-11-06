# ADR structure

Where architecture decision records (ADRs) live, how they're named, and how they may be linked. How they're worked is in [adr-process.md](adr-process.md).

Decided in [ADR 2026-11-06-a](../specs-ADRs/archive/2026/11/2026-11-06-a-adr-folder-structure-and-archiving.md).

## Folders

```
specs/                  the current design (authoritative)
specs-ADRs/
  candidates/           ideas, not yet decisions (temporary)
  proposed/             drafted ADRs, not yet accepted
  archive/              adopted ADRs, their permanent home
    YYYY/
      MM/
        YYYY-MM-DD-x-descriptive-name.md
  rejected/             rejected ADRs, their permanent home (flat)
    YYYY-MM-DD-x-descriptive-name.md
```

- `archive/` has a year folder, then a month folder. There's no day folder. A year or month folder is created only when it gets its first ADR, along with its TLDR files (`CLAUDE.md` and `.tldr.md`).
- `rejected/` is flat, since rejections should be rare. It's indexed by TLDR like the archive.
- `candidates/` and `proposed/` hold work in progress. TLDR is disabled there; their files are opened directly when they're being discussed.

## Naming

ADR files are named `YYYY-MM-DD-x-descriptive-name.md`: a date, a lowercase letter (`a`, `b`, `c`, ...), and a short kebab-case summary. The ID is the date and letter (e.g. `2026-11-06-a`). The file's heading starts with the ID: `# 2026-11-06-a. Title`.

`archive/` and `rejected/` are the only authority for IDs. A name in `proposed/` is tentative until the ADR leaves it.

- **While proposed, the date is always today.** A new proposal uses the current date. A proposal picked back up on a later day is re-dated to the current date right away. Its letter is a placeholder: any letter not used by another file with that date. Placeholder letters never block anything.
- **Leaving `proposed/` fixes the ID.** The date becomes the day of the move (for a rejected ADR, the day it's rejected). The letter becomes the next one not yet used on that date across both `archive/` and `rejected/`, so IDs can't collide.
- **Renames update mentions.** When a proposal is re-dated or its name finalized, any companion proposal that mentions it by filename is updated at the same time.
- **After the move, the name is permanent.**

## Lifecycle

1. **Candidate.** An undecided idea goes in `candidates/`, with any filename. Once its content becomes a proposed ADR, or the idea is dropped, the candidate file is deleted.
2. **Proposed.** A drafted ADR goes in `proposed/`.
3. **Archived.** When we decide to update the specs, the ADR's ID is finalized and it moves to `archive/YYYY/MM/`, using the year and month from its ID. This is the only move an archived ADR ever makes. Its status then advances in place (see [adr-process.md](adr-process.md)).
4. **Rejected.** A proposed ADR that isn't adopted gets its ID finalized the same way and moves to `rejected/`, so its reasoning is kept. An ADR rejected after archiving is handled manually (see [adr-process.md](adr-process.md#statuses)).
5. **Superseded.** An older ADR stays where it is when a newer one replaces it. The two are linked both ways (see [adr-process.md](adr-process.md#supersession)).

## Links

**Hard rule: links point only to ADRs in `archive/` or `rejected/`.** Nothing anywhere links to a file in `proposed/` or `candidates/`. Links from a proposed ADR to archived or rejected ADRs are fine.

- An archived ADR's path follows from its ID: `specs-ADRs/archive/YYYY/MM/<ID>-name.md`. A rejected one is at `specs-ADRs/rejected/<ID>-name.md`.
- Proposals may depend on each other only when they're worked at the same time and kept as separate files for organization. While proposed, they mention each other by full filename in plain text. They're accepted together, and the mentions become links once both are archived.
