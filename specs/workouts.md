# Workouts

What a workout is, how its heart-rate-gated timers run, the pre-programmed workouts, the Select workout and Running workout screens, and the sounds and vibration. How the app is laid out and connects is in [app-architecture.md](app-architecture.md); the zones and profiles that targets come from are in [profiles.md](profiles.md).

Decided in [ADR 2026-11-06-e](../specs-ADRs/archive/2026/11/2026-11-06-e-running-a-workout.md).

## Phases

A workout runs a warm-up, then a work/recovery cycle repeated a set number of times, then a cool-down. Each phase has a duration and a target zone.

- **Targets are zones, not bpm.** A phase's target is its zone's minimum bpm on the active profile. One workout definition works on every profile; a harder profile makes the same workout harder.

## Timers

A phase's timer counts down only while heart rate is at or above its target, except in the cool-down.

- **Waiting to start.** When a phase begins, its timer doesn't run until heart rate reaches the target. From rest, the warm-up waits for heart rate to climb to its target; a work phase waits for heart rate to climb from the recovery level to the work target.
- **Pausing.** If heart rate drops below the target, the timer stops and holds its remaining time. It resumes when heart rate is back at or above the target.
- **Phase change.** When the timer reaches zero, the next phase starts right away. After a work phase, heart rate is well above the recovery target, so recovery usually counts from its first second.
- **Cool-down runs on the clock.** Its timer always counts down, whatever the heart rate. Its Zone 1 target is only shown (see [Running workout screen](#running-workout-screen)).
- **End.** After the last cool-down second, the workout is complete.
- **Longer than listed.** Time below target doesn't count, so a workout takes longer than its listed time. Heart rate lags effort by about 20–60 s, so short work phases in particular run well past their nominal 30 s.

### No heart rate

While there's no usable reading (during a reconnect attempt, or when the strap reports no skin contact), the timer pauses as if below target, except the cool-down's, which keeps running. The below-target alarm doesn't sound. If the connection is lost for good, the workout ends and the app goes to Monitor ([dropped connection](app-architecture.md#dropped-connection)).

### Leaving and returning

- **Leaving mid-way.** Going to any other screen during a workout, by the menu or the back button, ends the workout with no confirmation, and the wake lock is released. Restarting is Select workout, then the workout.
- **No workout running.** If the Running workout screen is opened when no workout is running (the forward button after one has ended or been left, or a typed URL), the app goes to Select workout instead.

## Pre-programmed workouts

Nine workouts, from the air-bike interval plan, defined in `docs/js/workouts.js`. Changing them means editing that file and pushing.

Every phase lasts the same in every workout: warm-up 2:00, work 0:30, recovery 0:30, cool-down 2:00. Two modes set the targets, using the low or high end of each phase's zone range:

| Phase | Duration | Moderate target | Hard target |
|---|---|---|---|
| Warm-up | 2:00 | Zone 1 | Zone 2 |
| Work | 0:30 | Zone 4 | Zone 5 |
| Recovery | 0:30 | Zone 1 | Zone 2 |
| Cool-down | 2:00 | Zone 1 (shown only) | Zone 1 (shown only) |

The list, in order:

| Workout | Mode | Work/recovery cycles |
|---|---|---|
| Demo | Moderate | 2 |
| Moderate 5 min | Moderate | 5 |
| Moderate 10 min | Moderate | 10 |
| Moderate 15 min | Moderate | 15 |
| Moderate 20 min | Moderate | 20 |
| Hard 5 min | Hard | 5 |
| Hard 10 min | Hard | 10 |
| Hard 15 min | Hard | 15 |
| Hard 20 min | Hard | 20 |

- **A workout's minutes count only its cycles,** not the warm-up and cool-down. One cycle is a minute, so the cycles equal the minutes.
- **Demo** is for trying the app out quickly: the timers, cues and progress bar.

## Select workout screen

Select workout needs a connection and a profile. Whenever it's opened (from the menu, the Select workout button or the back button):

- **No device connected:** the app goes to Monitor.
- **Connected, no profile selected:** the app goes to Select profile.
- **Connected with a profile:** the screen lists the workouts as buttons, in the order above. Tapping one opens the Running workout screen and starts it; there's no separate start step.

## Running workout screen

From top to bottom:

- **Progress bar** across the top, one segment per phase: light blue for warm-up and cool-down, red for work, yellow for recovery. Each segment's width is proportional to its phase's duration. A dot moves along the bar as counted time passes, so it stands still while the timer is paused.
- **Phase and cycle,** for example "Work 3 of 10".
- **Phase timer,** large: the time left in the phase.
- **Heart rate:** live bpm, the current zone and the phase's target zone.
- **Timer state,** shown when it applies:
  - "Waiting for Zone 4" (with the phase's target zone) before heart rate first reaches the target in a phase.
  - "Paused — below target" after it drops back out.
  - "Paused — no heart rate" while there's no usable reading.
  - "Below target heart rate" in the cool-down when heart rate is under Zone 1; the timer keeps running.
- **End screen.** When the workout completes, the screen shows "Workout complete" with the total time (clock time, including time spent below target) and a button back to Select workout.

The wake lock is held while a workout runs ([screen sleep](app-architecture.md#screen-sleep-and-foreground-use)).

## Sounds and vibration

Cues let the user follow the workout without watching the screen. Sounds are generated in code with the Web Audio API (no sound files); vibration uses `navigator.vibrate()`.

| Event | Sound | Vibration |
|---|---|---|
| Phase timer ran out (next phase starts) | Two quick rising beeps ("beep-BEEP") | Two short pulses |
| Below-target alarm (rules below) | A short (about 0.5 s), low buzz, distinctly "wrong" | One long buzz |
| Workout complete | Celebration fanfare (below) | Three quick pulses, then one longer buzz with the final chord |
| Any button or menu item tap, anywhere in the app | A short, subtle click | None |

- **Workout complete fanfare.** A short, original chiptune-style "level clear", about 1.5 s, not copied from any existing tune: four quick notes (about 0.1 s each) climbing a major chord, C–E–G–high C, in a retro square-wave tone; a pause of about 0.1 s; then a bright three-note major chord held for about 0.8 s with a slight wobble, fading out.
- **Audio unlock.** Chrome only allows sound after a tap on the page; the first button tap (normally Connect) covers it.
- **Volume.** Sounds play at the phone's media volume.

### Below-target alarm

The app keeps the last several seconds of heart rate readings, including those from just before the workout started, so it can tell whether heart rate is climbing. The alarm applies to every phase except the cool-down, which never sounds it, and never sounds while there's no reading.

- **Before reaching the target in a phase** ("Waiting for …"): no alarm in the phase's first 5 s. After that, no alarm while heart rate is climbing toward the target; the alarm sounds only when it stalls or falls.
- **After reaching the target, then dropping below it** ("Paused — below target"): the alarm sounds immediately, with no grace, whether or not heart rate is climbing. Recovery usually starts above its target, so this rule applies there from the first second.
- **Repeat:** while the conditions hold, the alarm repeats every 2 s.
- **Climbing** means the smoothed heart rate rose by at least 2 bpm over the last 5 s, so normal 1–2 bpm jitter doesn't count.

The 5 s grace, 2 s repeat and 2 bpm / 5 s climbing threshold are starting values, to be tuned on the bike.

## Not included for now

- A "target reached" cue when the timer starts counting.
- Countdown beeps in a phase's last seconds.
