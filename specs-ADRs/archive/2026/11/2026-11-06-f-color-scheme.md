# 2026-11-06-f. Color scheme: dark navy with yellow buttons

Status: updating specs

## Context

The app started with a dark gray theme: near-black background, dark gray panels, red primary buttons. Nothing in the specs recorded it; it existed only in `docs/css/app.css`. The user tried a dark navy theme with yellow buttons on the phone, darkened the blues twice, and wants to keep it. Without a spec, a later restyle could drift away from it unnoticed.

Some colors already carry meaning in a workout, set by ADR [2026-11-06-e](2026-11-06-e-running-a-workout.md): the progress bar's phase colors and the heart rate bar's red and green fill. The theme has to leave those readable.

The working tree carries the theme's CSS and version `1.01` (uncommitted) into this ADR on purpose: they're what it records.

## Decision

1. **Dark navy theme.** The app stays dark, in near-black navy rather than gray:

   | Use | Color |
   |---|---|
   | Page background | `#020713` |
   | Raised surfaces: title bar, menu, choice buttons (profiles, workouts) | `#061024` |
   | Borders, selected choice background, heart rate bar track | `#0e2142` |
   | Main text | `#e8eef8` |
   | Secondary text (labels, hints) | `#9aabc8` |

2. **Yellow buttons.**
   - **Primary buttons** (Connect, Select profile, Select workout, the end screen's button): yellow `#f5c518` with bold dark navy text (`#020713`).
   - **Secondary buttons** (Disconnect): a yellow outline with yellow text on a transparent background.
   - **Selection:** the selected profile and the active menu item are marked in the same yellow.

3. **Reconnecting banner: red** (`#c62828`) with white text, so a connection problem stands out from both the navy and the yellow.

4. **Workout colors keep their meaning, separate from the theme.** The phase colors (warm-up and cool-down light blue, work red, recovery yellow), the heart rate bar (red below target, green at or above, green target diamond) and the timer-state colors are set by ADR 2026-11-06-e and don't change with the theme. **One yellow throughout:** recovery and the yellow timer states ("Waiting for …", "Paused — no heart rate") use the button yellow `#f5c518`, so the scheme matches. It isn't confusing in practice: phase colors only appear on the running workout screen, where the only button is the end screen's, after the workout is over.

5. **Where it lives.** The colors are in `docs/css/app.css`. A new "Look" section in `specs/app-architecture.md` holds the tables above.

6. **What this ADR implements.** The theme is in `docs/css/app.css` with version `1.01`, including the red banner (item 3).

## Alternatives considered

- **The original dark gray theme.** Replaced: the user prefers navy.
- **Keeping the orange-brown reconnecting banner** (`#a60`, left over from the gray theme). Replaced by red.
- **Lighter navy shades** (`#0a1730` and `#050d1f` backgrounds). Tried on the way and rejected as not dark enough.
- **A separate recovery yellow** (`#e8c21a`, from the gray theme) or an amber or orange recovery color. Rejected: one yellow keeps the scheme consistent.
- **Leaving the theme only in the CSS.** Rejected: nothing would record it as a decision, so it could drift.

## Consequences

- **Restyles follow the spec.** Changing the theme's colors means a new ADR.
- **Specs change.** `specs/app-architecture.md` gains a "Look" section.

## Supersession

### Supersedes
- None.

### Superseded by
- None.

## Loose ends

- No current loose ends.
