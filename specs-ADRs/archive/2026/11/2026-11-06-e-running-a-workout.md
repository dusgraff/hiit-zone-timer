# 2026-11-06-e. Running a workout: heart-rate-gated phase timers, sounds and vibration

Status: implementing

## Context

ADR [2026-11-06-c](2026-11-06-c-app-architecture-and-hosting.md) set the screens: choosing a workout on Select workout opens the running workout and starts it. Workouts are pre-programmed data, and the app holds a Screen Wake Lock while a workout runs. ADR [2026-11-06-d](2026-11-06-d-fitness-profiles.md) set three profiles, each defining Zones 0–5 in bpm. It left how workouts set their targets, and what happens with no profile selected, to this ADR.

The point of the app is to pace the workout by heart rate, not by the clock alone. A plain interval timer counts down whether the user is working or not. This app counts time only while the user is actually at the target effort.

The first workout comes from the user's air-bike plan: a 2:00 warm-up, then 30 s of work (Zone 4–5) and 30 s of recovery (Zone 1–2), repeated 12–14 times, then a 2:00 cool-down.

## Decision

1. **A workout is a sequence of phases.** Each workout runs a warm-up, then a work/recovery cycle repeated a set number of times, then a cool-down. Each phase has a duration and a target heart rate.

2. **A phase's timer counts down only while heart rate is at or above its target,** except in the cool-down.
   - **Waiting to start.** When a phase begins, its timer doesn't run until heart rate reaches the target. Starting from rest, the warm-up waits until heart rate climbs to the warm-up target. A work phase waits until heart rate climbs from the recovery level to the work target.
   - **Pausing.** If heart rate drops below the target at any point, the timer stops and holds its remaining time. It resumes when heart rate is back at or above the target.
   - **Phase change.** When the timer reaches zero, the next phase starts right away. After a work phase, heart rate is well above the recovery target, so the recovery timer starts counting immediately.
   - **Cool-down runs on the clock.** Its timer always counts down, whatever the heart rate. Its Zone 1 target is only shown: when heart rate is below it, the screen says "Below target heart rate", with no alarm or vibration.
   - **End.** After the last cool-down second, the workout is complete.
   - **End screen.** The running workout screen shows "Workout complete" with the total time, including time spent below target, and a button back to Select workout.
   - **Leaving mid-way.** Going to any other screen during a workout, by the menu or the back button, ends the workout with no confirmation, and the wake lock is released. Restarting is a couple of taps: Select workout, then the workout.
   - **No heart rate.** While there's no usable reading (during a reconnect attempt, or when the strap reports no skin contact), the timer pauses as if below target (the cool-down's keeps running), but the below-target alarm doesn't sound, since the user isn't slacking. If the connection is lost for good, the workout ends and the app goes to Monitor, as set by ADR 2026-11-06-c.
   - **No workout running.** If the running workout screen is opened when no workout is running (by the forward button after one has ended or been left, or a typed URL), the app goes to Select workout instead, where item 5's redirects apply.

3. **Targets are zones, not bpm.** A phase names a zone (for example "Zone 4"). Its target is that zone's minimum bpm on the active profile. One workout definition then works on all three profiles, and switching profiles changes how hard it is.

4. **Nine workouts, from the air-bike plan,** as data in one JS module, `docs/js/workouts.js` (as set by ADR 2026-11-06-c): a Demo, then two modes, each in four lengths.
   - **Demo,** first in the list: warm-up, one work/recovery cycle and cool-down, all at Moderate targets. It's for trying the app out quickly: the timers, cues and progress bar.
   - **Modes.** The plan gives each phase a zone range (warm-up and recovery Zone 1–2, work Zone 4–5). Moderate targets the low end of each range and Hard the high end:

     | Phase | Duration | Moderate target | Hard target |
     |---|---|---|---|
     | Warm-up | 2:00 | Zone 1 | Zone 2 |
     | Work | 0:30 | Zone 4 | Zone 5 |
     | Recovery | 0:30 | Zone 1 | Zone 2 |
     | Cool-down | 2:00 | Zone 1 (shown only) | Zone 1 (shown only) |

   - **Lengths: 5, 10, 15 and 20 minutes.** The length counts only the work/recovery cycles, not the warm-up and cool-down. One cycle is 30 s work plus 30 s recovery, so the number of cycles equals the minutes: 5, 10, 15 or 20.
   - **Names and order:** "Demo" first, then mode and length, for example "Moderate 10 min" and "Hard 20 min".

5. **Select workout needs a connection and a profile.** Whenever Select workout is opened, from the menu, the Select workout button or the back button:
   - **No device connected:** the app goes to Monitor to connect.
   - **Connected, no profile selected:** the app goes to Select profile.
   - **Connected with a profile:** the screen shows the workouts.

   So a workout can only be chosen when it can actually run.

6. **Running workout screen.** From top to bottom:
   - **Progress bar** across the top, with one segment per phase: light blue for warm-up and cool-down, red for work and yellow for recovery. Each segment's width is proportional to its phase's duration. A dot moves along the bar as counted time passes, so it stands still while the timer is paused.
   - **Phase and cycle,** for example "Work 3 of 10".
   - **Phase timer,** large: the time left in the phase.
   - **Heart rate,** in three parts:
     - **Current:** live bpm and the zone it's in, for example "128 bpm" and "Zone 3 — Moderate".
     - **Heart rate bar,** on a fixed scale for the whole workout: the full bar is the work phase's target bpm plus 20% (for example 132 → 158). A green diamond marks the current phase's target and moves when the phase changes. The fill runs from the left edge to the current heart rate: red below the diamond, green at or above it.
     - **Target:** the phase's target in the same format, for example "132 bpm" and "Zone 4 — Hard".
   - **Timer state,** shown clearly when the timer isn't counting: "Waiting for Zone 4" before heart rate first reaches the target in a phase, and "Paused — below target" after it drops back out, and "Paused — no heart rate" while there's no usable reading. In the cool-down, whose timer never pauses, "Below target heart rate" when heart rate is under Zone 1.

7. **Sounds and vibration cue the workout,** so the user doesn't have to watch the screen. Sounds are generated in code with the Web Audio API, so there are no sound files. Vibration uses `navigator.vibrate()`. Proposed cues:

   | Event | Sound | Vibration |
   |---|---|---|
   | Phase timer ran out (next phase starts) | Two quick rising beeps ("beep-BEEP") | Two short pulses |
   | Below target and not trying (see below) | A short (about 0.5 s), low buzz, distinctly "wrong" | One long buzz |
   | Workout complete | A celebration fanfare (see below) | Three quick pulses, then one longer buzz with the final chord |
   | Any button or menu item tap | A short, subtle click | None |

   - **When the below-target alarm sounds.** The app keeps the last several seconds of heart rate readings, so it can tell whether heart rate is climbing. The rules apply to every phase except the cool-down, which never sounds it:
     - **Warm-up's first 60 s:** no alarm at all, whatever heart rate does, so there's time to tap the workout and get on the bike. After that, the rules below apply as in every other phase.
     - **Before reaching the target in a phase** ("Waiting for Zone 4"): no alarm in the phase's first 5 s (60 s in the warm-up, above). After that, no alarm while heart rate is climbing toward the target; the alarm sounds only when it stalls or falls. Someone pushing toward the target isn't nagged; someone not trying is.
     - **After reaching the target, then dropping below it** ("Paused — below target"): the alarm sounds immediately (except in the warm-up's first 60 s), with no grace and whether or not heart rate is climbing.
     - **Repeat:** while the conditions hold, the alarm repeats every 1 s. A starting value, to be tuned on the bike.
     - **Climbing** means the smoothed heart rate rose by at least 2 bpm over the last 5 s, so normal 1–2 bpm jitter doesn't count. These numbers are a starting point, to be tuned on the bike.
   - **Workout complete fanfare.** A short, original chiptune-style "level clear", about 1.5 s, not copied from any existing tune: four quick notes (about 0.1 s each) climbing a major chord, C–E–G–high C, in a retro square-wave tone; a pause of about 0.1 s; then a bright three-note major chord held for about 0.8 s with a slight wobble, fading out.
   - **Button click.** Every button or menu item tap plays a short, subtle click. This also proves sound works before a workout starts.
   - **Audio unlock.** Chrome only allows sound after a tap on the page. The first button tap (normally Connect) covers this.
   - **Volume.** Sounds play at the phone's media volume.

8. **Version number: a major number, a dot and two digits,** for example `1.00`, still kept in `docs/js/version.js`. Claude bumps the two digits once per pushed batch of app changes (`1.00` → `1.01`); the major number changes only when the user says so. Four digits were more than needed. Builds during this ADR went `0.04`, then `1.00`, the first working version.

9. **What this ADR implements.**
   - **Workout data:** `docs/js/workouts.js` with the nine workouts of item 4.
   - **Select workout screen:** the redirects in item 5, then the workouts as buttons. Tapping one starts it.
   - **Running workout screen:** as in item 6, with the phase timers of item 2 and the wake lock.
   - **Sounds module:** the cues in item 7, including the button click on every button in the app.
   - **Version** `1.00` in `docs/js/version.js`, in the new format (item 8).

## Alternatives considered

- **Plain interval timer (time counts no matter what).** Rejected: it's what every interval app does, and it lets an easy effort pass as a hard one. Gating the timer on heart rate is the point of this app.
- **Targets in bpm per workout.** Rejected: each workout would need a copy per profile, and changing profile wouldn't carry over.
- **A "target reached" cue** (a short beep and a tap of vibration when heart rate reaches the target and the timer starts counting). Not for now: the phase-change cue already says a new phase has started, and the below-target alarm says when the user isn't getting there. Could be added later.
- **Countdown beeps for the last 3 s of each phase.** Not for now: with 30 s phases it would be noisy. Easy to add later.
- **A heart rate bar scaled to each phase's target** (0 to twice the target, target in the middle; or target ± 40 bpm). Rejected: the scale would jump at every phase change. A fixed scale with a moving target marker keeps the bar steady.
- **Sound files instead of generated tones.** Not needed for beeps and buzzes. Files could be added later for something like a voice saying "go."

## Consequences

- **Workouts take longer than their listed time.** Time spent below target doesn't count, so waiting for heart rate to climb adds to the total. A 20-minute plan may run 25 minutes or more.
- **Heart rate lags effort.** Heart rate takes about 20–60 s to climb after the effort starts. On a 30 s work phase, most of the early effort happens before the timer runs, so each work phase lasts longer than 30 s of clock time.
- **Specs change.** A new workout spec is added to `specs/`, and `specs/README.md` adds it to the reading order. In `specs/app-architecture.md`, the Select workout and Running workout screen entries point to it.

## Supersession

### Supersedes
- [2026-11-06-c](2026-11-06-c-app-architecture-and-hosting.md) — "Screens while disconnected," Select workout part only: Select workout can no longer be opened without a connection (or without a profile); the app redirects instead (item 5). Select profile can still be opened without a connection.
- [2026-11-06-c](2026-11-06-c-app-architecture-and-hosting.md) — item 10, version format only: a major number and two digits (`1.00`) instead of `0.` and four digits (item 8).

### Superseded by
- None.

## Loose ends

- No current loose ends.
