// The workout's timer logic, with no UI: heart-rate-gated phase timers and the
// below-target alarm rules (specs/workouts.md#timers, #below-target-alarm).
// The screen calls tick() every ~100 ms with the current time and bpm (null
// when there's no usable reading) and acts on the events it returns.

import { buildPhases, PHASE } from './workouts.js';

// Starting values, to be tuned on the bike.
export const WARMUP_QUIET_MS = 60000; // no alarm at all in the warm-up's first minute
export const ALARM_GRACE_MS = 5000; // quiet at the start of other phases, until target is first reached
export const ALARM_REPEAT_MS = 1000;
export const CLIMB_WINDOW_MS = 5000; // climbing = smoothed bpm rose by CLIMB_MIN_BPM over this window
export const CLIMB_MIN_BPM = 2;
const SMOOTH_MS = 2000; // smoothing: mean of the readings in the last 2 s
const HISTORY_MS = CLIMB_WINDOW_MS + SMOOTH_MS + 1000;

// Statuses for the screen.
export const STATUS = {
  COUNTING: 'counting',
  WAITING: 'waiting', // gated phase, target not yet reached in this phase
  PAUSED: 'paused', // gated phase, reached the target then dropped below
  NO_HR: 'no-hr', // gated phase, no usable reading
  BELOW: 'below', // cool-down, below its shown target (timer keeps running)
  COMPLETE: 'complete',
};

export class WorkoutRun {
  constructor(workout, profile, now) {
    this.workout = workout;
    this.phases = buildPhases(workout).map((p) => ({
      ...p,
      targetBpm: profile.zoneMins[p.zone - 1],
    }));
    // Heart rate bar scale: the work phase's target plus 20%, fixed for the workout.
    const work = this.phases.find((p) => p.kind === PHASE.WORK);
    this.hrScaleBpm = Math.round(work.targetBpm * 1.2);
    this.totalMs = this.phases.reduce((sum, p) => sum + p.duration * 1000, 0);
    this.startTime = now;
    this.endTime = null;
    this.history = []; // { t, bpm }
    this.lastTick = now;
    this.lastBpm = null;
    this.startPhase(0, now);
  }

  startPhase(index, now) {
    this.index = index;
    this.remainingMs = this.phases[index].duration * 1000;
    this.phaseStart = now;
    this.reached = false;
    this.lastAlarm = null;
  }

  get phase() {
    return this.phases[this.index];
  }

  get done() {
    return this.endTime !== null;
  }

  addReading(bpm, t) {
    this.history.push({ t, bpm });
    while (this.history.length && this.history[0].t < t - HISTORY_MS) this.history.shift();
  }

  // Mean bpm of readings in (end - SMOOTH_MS, end], or null if there are none.
  smoothedAt(end) {
    const window = this.history.filter((r) => r.t > end - SMOOTH_MS && r.t <= end);
    if (!window.length) return null;
    return window.reduce((sum, r) => sum + r.bpm, 0) / window.length;
  }

  // Is heart rate climbing? Without enough history, give the benefit of the doubt.
  climbing(now) {
    const recent = this.smoothedAt(now);
    const earlier = this.smoothedAt(now - CLIMB_WINDOW_MS);
    if (recent === null || earlier === null) return true;
    return recent - earlier >= CLIMB_MIN_BPM;
  }

  // Advances the run. Returns events: 'phase' (a phase ran out and the next
  // started), 'complete', 'alarm'.
  tick(now, bpm) {
    if (this.done) return [];
    const dt = now - this.lastTick;
    this.lastTick = now;
    this.lastBpm = bpm;
    const events = [];
    const phase = this.phase;

    const atTarget = bpm !== null && bpm >= phase.targetBpm;
    if (phase.gated && atTarget) this.reached = true;
    const counting = !phase.gated || atTarget;

    if (counting) this.remainingMs -= dt;
    if (this.remainingMs <= 0) {
      if (this.index + 1 < this.phases.length) {
        this.startPhase(this.index + 1, now);
        events.push('phase');
      } else {
        this.remainingMs = 0;
        this.endTime = now;
        events.push('complete');
      }
      return events;
    }

    // Below-target alarm: never in the cool-down, never without a reading,
    // never in the warm-up's first minute.
    const warmupQuiet = phase.kind === PHASE.WARMUP && now - this.phaseStart < WARMUP_QUIET_MS;
    let alarm = false;
    if (phase.gated && bpm !== null && !atTarget && !warmupQuiet) {
      alarm = this.reached || (now - this.phaseStart >= ALARM_GRACE_MS && !this.climbing(now));
    }
    if (!alarm) {
      this.lastAlarm = null;
    } else if (this.lastAlarm === null || now - this.lastAlarm >= ALARM_REPEAT_MS) {
      this.lastAlarm = now;
      events.push('alarm');
    }
    return events;
  }

  get status() {
    if (this.done) return STATUS.COMPLETE;
    const { gated, targetBpm } = this.phase;
    const bpm = this.lastBpm;
    if (!gated) return bpm !== null && bpm < targetBpm ? STATUS.BELOW : STATUS.COUNTING;
    if (bpm === null) return STATUS.NO_HR;
    if (bpm >= targetBpm) return STATUS.COUNTING;
    return this.reached ? STATUS.PAUSED : STATUS.WAITING;
  }

  // Counted time so far, as a fraction of the workout (for the progress dot).
  get progress() {
    let counted = 0;
    for (let i = 0; i < this.index; i++) counted += this.phases[i].duration * 1000;
    counted += this.phase.duration * 1000 - this.remainingMs;
    return Math.min(1, counted / this.totalMs);
  }

  // Clock time from start to now (or to the end), including time below target.
  elapsedMs(now) {
    return (this.endTime ?? now) - this.startTime;
  }
}
