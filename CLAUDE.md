@.tldr.rules.md

# Heart Rate HIIT Pacer

A browser-based tool for pacing heart-rate-driven HIIT workouts. Detailed specs are still to be written; this is the general outline.

## Platform

- Runs in the browser on Android (Chrome), as plain HTML/JS. No native app.
- Connects to a Polar heart rate monitor over Bluetooth. Likely via Web Bluetooth and the standard BLE Heart Rate Service, which Polar straps support. Web Bluetooth needs HTTPS (or localhost).

## What it does

The user selects a fitness profile and one of the pre-programmed workouts, then runs it with live heart rate from the monitor. Profiles and workouts are written into the app's files; there's no in-app editor.

- **Warm-up:** a target heart rate and a time frame.
- **Exercise cycles:** after the warm-up, the workout moves into the exercise cycles. Time in a cycle only counts while heart rate is at or above that cycle's target heart rate.

## Specs and decisions

`specs/` is the authoritative copy of all current specifications. Start from [specs/README.md](specs/README.md). Design changes go through the ADR process in [specs/adr-process.md](specs/adr-process.md); ADRs live in `specs-ADRs/` as set out in [specs/adr-structure.md](specs/adr-structure.md).
