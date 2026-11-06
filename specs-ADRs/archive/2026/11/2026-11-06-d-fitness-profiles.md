# 2026-11-06-d. Fitness profiles: three fixed heart rate zone sets

Status: implementing

## Context

The app paces workouts by heart rate, so it needs heart rate targets. ADR [2026-11-06-c](2026-11-06-c-app-architecture-and-hosting.md) planned three fitness profiles (sedentary, average, athletic) that set the heart rate zones, written as data in JS modules, with a Select profile screen. It left what the profiles contain to a later ADR.

The usual way to set zones is from an estimated maximum heart rate, typically from age (220 − age, or 208 − 0.7 × age), and sometimes adjusted for resting heart rate. The user wants something simpler: a few generic profiles that suit most people, with no age or other personal input. They start on the easiest profile and move up as they get fitter.

## Decision

1. **Five standard zones, plus Zone 0.** The app uses the common five-zone model, as used by Polar and most fitness apps, with a Zone 0 for everything below Zone 1:

   | Zone | Name | % of reference max | How it should feel |
   |---|---|---|---|
   | 0 | Resting | Below 50% | Not exercising yet, or fully recovered. Everything below Zone 1. |
   | 1 | Very light | 50–60% | Barely working; full conversation. Warm-up, cool-down, recovery. |
   | 2 | Light | 60–70% | Easy but clearly exercising; full sentences. Base endurance, recovery between intervals. |
   | 3 | Moderate | 70–80% | Steady, comfortable-hard; short sentences. Aerobic fitness. |
   | 4 | Hard | 80–90% | Hard, want to stop soon; a few words at a time. Interval work. |
   | 5 | Maximum | 90–100% | All-out; can't talk. Short max efforts. |

2. **Three fixed profiles, no age or personal input.** Each profile is a fixed set of bpm ranges, made by applying the zone percentages to a reference max heart rate: 165 for Sedentary, 175 for Average and 185 for Athletic. Each step up raises every target by about 10 bpm.

   | Zone | Sedentary (bpm) | Average (bpm) | Athletic (bpm) |
   |---|---|---|---|
   | 0 — Resting | Under 83 | Under 88 | Under 93 |
   | 1 — Very light | 83–98 | 88–104 | 93–110 |
   | 2 — Light | 99–115 | 105–122 | 111–129 |
   | 3 — Moderate | 116–131 | 123–139 | 130–147 |
   | 4 — Hard | 132–148 | 140–157 | 148–166 |
   | 5 — Maximum | 149+ | 158+ | 167+ |

   - **Whole bpm, no gaps.** Each zone starts one bpm above the previous zone's top, so every reading falls in exactly one zone. Zone 0 covers every reading below Zone 1.
   - **Zone 5 has no upper limit.** The app only needs to know whether heart rate is at or above a target.
3. **A profile is a difficulty setting, not a measurement.** Max heart rate is set mostly by age and barely changes with fitness; what fitness changes is how hard someone can push. Moving up a profile makes the same zone ask more effort. The user starts at Sedentary, moves up when its hard zones feel easy, and can move back down at any time. The fit check is the feel column: if a profile's Zone 4 feels hard (a few words at a time), it's the right profile.
4. **Profiles are data in one JS module,** `docs/js/profiles.js`, as set by ADR 2026-11-06-c. Changing the numbers or adding a profile means editing that file and pushing.
5. **Current zone on Monitor.** Once a profile is selected, Monitor shows the zone the live heart rate is in, with its name: for example "Zone 4 — Hard", or "Zone 0 — Resting" below Zone 1. With no profile selected, Monitor shows no zone line. This lets the user check a profile's fit by feel.
6. **Select profile screen.**
   - **On arrival,** the screen lists the three profiles as buttons.
   - **Tapping a profile** selects it and shows that profile's zone bpm ranges, with a **Select workout** button below them to move on.
   - **Changing profile:** opening Select profile again from the menu returns to the list of three buttons, with the active profile's button highlighted. Tapping another changes the profile.
7. **Active profile on Monitor.** Monitor shows which profile is selected, next to the live heart rate and the current zone. With none selected, it says so.
8. **No profile at startup.** Nothing is stored between visits (ADR 2026-11-06-c), and the app doesn't preselect one, so every session starts with no profile and the user chooses one. Getting into a workout is a few taps (connect, profile, workout), so there's nothing worth remembering.
9. **No health warnings.** The app shows no medical cautions or disclaimers, on Select profile or anywhere else. It's a bare-bones tool for someone who has already decided to train.
10. **What this ADR implements.**
    - **Profile data:** `docs/js/profiles.js` with the three profiles and their zones.
    - **Select profile screen, working,** as in item 6. Its Select workout button goes to the Select workout placeholder, which stays "Not implemented."
    - **Monitor additions:** the current zone (item 5) and the active profile (item 7).
    - **Version bump** in `docs/js/version.js`.

## Alternatives considered

- **Zones from age (220 − age, or the Tanaka formula).** The standard approach, and more accurate for an individual. Rejected: it needs personal input, and the user wants generic profiles. Either formula can be off by 10–15 bpm for a given person anyway, so the fit check by feel is needed either way.
- **Heart rate reserve (Karvonen method).** Zones are based on max HR minus resting HR, so they reflect fitness. Rejected: it needs both an age-based max and a measured resting heart rate.
- **A fourth profile between the existing ones.** Rejected for now: the steps are about 10 bpm, already a noticeable change in effort, and a fourth level would be only about 5 bpm from its neighbors. It's an easy data change if a step ever feels too big.
- **"Below Zone 1" (or no zone shown) for readings under Zone 1.** Rejected in favor of Zone 0: it's shorter, and it reads naturally next to Zones 1–5.
- **A color per zone on Monitor.** Not included for now, to keep the app simple. It could be added later.
- **Preselecting Sedentary at startup.** Rejected: choosing is one tap, and a preselected profile could silently run a workout at the wrong level.
- **A one-line health caution on Select profile** (check with a doctor before Zone 4–5 work, especially starting from sedentary or over 40). Rejected: the app doesn't hand-hold.
- **Zone 5 with an upper limit (for example, 149–165 on Sedentary).** Rejected: going over the reference max isn't a problem for pacing, and a cap would make a valid high reading fall outside every zone.

## Consequences

- **The numbers suit some people better than others.** Athletic's reference max of 185 is realistic for younger or well-trained people; an older person may not reach its Zone 5 however fit they are. Sedentary is conservative so most adults can reach its targets.
- **Workouts can target zones instead of bpm.** Because every profile defines the same five zones, a workout that says "Zone 4" works on any profile. (How workouts set their targets belongs to the workout ADR.)
- **Workouts need a profile.** Select workout can be reached from the menu with no profile selected. How that's handled belongs to the workout ADR.
- **Specs change.** A new profiles spec is added to `specs/`, holding the zone model and the three profiles' bpm tables, and `specs/README.md` adds it to the reading order. In `specs/app-architecture.md`, the guided flow and the Monitor and Select profile screen entries are updated to match.

## Supersession

### Supersedes
- [2026-11-06-c](2026-11-06-c-app-architecture-and-hosting.md) — guided flow step 2 only: choosing a profile no longer goes straight to Select workout. It shows the profile's zones, and the user taps Select workout to move on.

### Superseded by
- None.

## Loose ends

- No current loose ends.
