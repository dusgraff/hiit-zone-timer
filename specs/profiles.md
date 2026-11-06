# Fitness profiles and heart rate zones

The heart rate zone model and the three fixed fitness profiles that set each zone's bpm range. How profiles are chosen and shown is in [app-architecture.md](app-architecture.md#screens-and-menu). How workouts use zones is in [workouts.md](workouts.md).

Decided in [ADR 2026-11-06-d](../specs-ADRs/archive/2026/11/2026-11-06-d-fitness-profiles.md).

## Zones

The standard five-zone model, as used by Polar and most fitness apps, plus a Zone 0 for everything below Zone 1.

| Zone | Name | % of reference max | How it should feel |
|---|---|---|---|
| 0 | Resting | Below 50% | Not exercising yet, or fully recovered. Everything below Zone 1. |
| 1 | Very light | 50–60% | Barely working; full conversation. Warm-up, cool-down, recovery. |
| 2 | Light | 60–70% | Easy but clearly exercising; full sentences. Base endurance, recovery between intervals. |
| 3 | Moderate | 70–80% | Steady, comfortable-hard; short sentences. Aerobic fitness. |
| 4 | Hard | 80–90% | Hard, want to stop soon; a few words at a time. Interval work. |
| 5 | Maximum | 90–100% | All-out; can't talk. Short max efforts. |

## Profiles

Three fixed profiles, with no age or other personal input. Each applies the zone percentages to a reference max heart rate: **165** for Sedentary, **175** for Average and **185** for Athletic.

| Zone | Sedentary (bpm) | Average (bpm) | Athletic (bpm) |
|---|---|---|---|
| 0 — Resting | Under 83 | Under 88 | Under 93 |
| 1 — Very light | 83–98 | 88–104 | 93–110 |
| 2 — Light | 99–115 | 105–122 | 111–129 |
| 3 — Moderate | 116–131 | 123–139 | 130–147 |
| 4 — Hard | 132–148 | 140–157 | 148–166 |
| 5 — Maximum | 149+ | 158+ | 167+ |

- **Whole bpm, no gaps.** Each zone starts one bpm above the previous zone's top, so every reading falls in exactly one zone.
- **Zone 5 has no upper limit.**
- **The data lives in `docs/js/profiles.js`.** Changing the numbers or adding a profile means editing that file and pushing.

## Using the profiles

- **A profile is a difficulty setting, not a measurement.** Each step up raises every target by about 10 bpm, so the same zone asks more effort.
- **Start at Sedentary** and move up when its hard zones feel easy; move down at any time.
- **Fit check by feel:** if a profile's Zone 4 feels hard (a few words at a time), it's the right profile.
- **No profile at startup.** Nothing is stored, and nothing is preselected; the user chooses a profile each session.
- **No health warnings.** The app shows no medical cautions or disclaimers.
