// Pre-programmed workouts (specs/workouts.md#pre-programmed-workouts).
// Each workout: warm-up, a work/recovery cycle repeated `cycles` times, cool-down.
// Targets are zones; a phase's target bpm is that zone's minimum on the active
// profile. The cool-down runs on the clock: its target is only shown.

export const PHASE = {
  WARMUP: 'warmup',
  WORK: 'work',
  RECOVERY: 'recovery',
  COOLDOWN: 'cooldown',
};

// Seconds per phase, the same in every workout.
const DURATIONS = { warmup: 120, work: 30, recovery: 30, cooldown: 120 };

// Target zone per phase: Moderate takes the low end of each phase's zone
// range, Hard the high end.
const MODES = {
  moderate: { warmup: 1, work: 4, recovery: 1, cooldown: 1 },
  hard: { warmup: 2, work: 5, recovery: 2, cooldown: 1 },
};

const workout = (id, name, mode, cycles) => ({ id, name, mode, cycles });

export const WORKOUTS = [
  workout('demo', 'Demo', 'moderate', 2),
  workout('moderate-5', 'Moderate 5 min', 'moderate', 5),
  workout('moderate-10', 'Moderate 10 min', 'moderate', 10),
  workout('moderate-15', 'Moderate 15 min', 'moderate', 15),
  workout('moderate-20', 'Moderate 20 min', 'moderate', 20),
  workout('hard-5', 'Hard 5 min', 'hard', 5),
  workout('hard-10', 'Hard 10 min', 'hard', 10),
  workout('hard-15', 'Hard 15 min', 'hard', 15),
  workout('hard-20', 'Hard 20 min', 'hard', 20),
];

// The workout as a flat list of phases:
// { kind, label, duration (s), zone, gated (timer counts only at/above target) }
export function buildPhases(w) {
  const zones = MODES[w.mode];
  const phase = (kind, label) => ({
    kind,
    label,
    duration: DURATIONS[kind],
    zone: zones[kind],
    gated: kind !== PHASE.COOLDOWN,
  });
  const phases = [phase(PHASE.WARMUP, 'Warm-up')];
  for (let n = 1; n <= w.cycles; n++) {
    phases.push(phase(PHASE.WORK, `Work ${n} of ${w.cycles}`));
    phases.push(phase(PHASE.RECOVERY, `Recovery ${n} of ${w.cycles}`));
  }
  phases.push(phase(PHASE.COOLDOWN, 'Cool-down'));
  return phases;
}
