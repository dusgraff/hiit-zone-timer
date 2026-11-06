# Specs

The authoritative description of the Heart Rate HIIT Pacer as it currently stands: what it does, how it's built, and how the project itself is run. If the specs and anything else disagree, the specs win. They change through the ADR process described below. Why each decision was made is recorded in the ADRs these specs link to.

## The project

A browser-based tool for pacing heart-rate-driven HIIT workouts, planned to run in Chrome on Android and read live heart rate from a Polar monitor. The working outline is in the root [CLAUDE.md](../CLAUDE.md).

The app's architecture is specified: hosting, the single page, screens and navigation, the Bluetooth connection, screen sleep, and data and storage. The fitness profiles and heart rate zones are specified. What happens inside a workout (warm-up, exercise cycles) isn't specified yet.

## Reading order

Read these in order to go through the specs like a book.

1. [adr-structure.md](adr-structure.md) — where decisions live: the `specs-ADRs/` folders, how ADRs are named and dated, their lifecycle, and the link rules.
2. [adr-process.md](adr-process.md) — how a decision gets made: from draft through spec update and code, statuses, supersession, loose ends, the ADR template, and how specs are organized.
3. [app-architecture.md](app-architecture.md) — how the app is built and hosted: GitHub Pages from `docs/`, the single page, screens and menu, the guided flow, Bluetooth connection and dropped-connection handling, screen sleep, data and storage, prototype pages.
4. [profiles.md](profiles.md) — the heart rate zone model (Zones 0–5) and the three fixed fitness profiles (Sedentary, Average, Athletic) with their bpm ranges, and how to use them.
