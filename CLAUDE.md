@.tldr.rules.md

# Heart Rate HIIT Pacer

A browser-based tool for pacing heart-rate-driven HIIT workouts. Detailed specs are still to be written; this is the general outline.

## Platform

- Runs in the browser on Android (Chrome), as plain HTML/JS. No native app.
- Connects to a Polar heart rate monitor over Bluetooth. Likely via Web Bluetooth and the standard BLE Heart Rate Service, which Polar straps support. Web Bluetooth needs HTTPS (or localhost).

## What it does

The user programs a workout, then runs it with live heart rate from the monitor.

- **Warm-up:** a target heart rate and a time frame.
- **Exercise cycles:** after the warm-up, the workout moves into the exercise cycles. Time in a cycle only counts while heart rate is at or above that cycle's target heart rate.
