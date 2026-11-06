// Fitness profiles and heart rate zones. See specs/profiles.md.
//
// Each profile lists the lowest bpm of Zones 1–5. A zone runs from its own
// minimum up to one below the next zone's minimum; Zone 5 has no upper limit,
// and Zone 0 is everything below Zone 1.

export const ZONE_NAMES = ['Resting', 'Very light', 'Light', 'Moderate', 'Hard', 'Maximum'];

export const PROFILES = [
  { id: 'sedentary', name: 'Sedentary', zoneMins: [83, 99, 116, 132, 149] },
  { id: 'average', name: 'Average', zoneMins: [88, 105, 123, 140, 158] },
  { id: 'athletic', name: 'Athletic', zoneMins: [93, 111, 130, 148, 167] },
];

export function getProfile(id) {
  return PROFILES.find((p) => p.id === id) || null;
}

// Zone number (0–5) for a heart rate on the given profile.
export function zoneFor(profile, bpm) {
  let zone = 0;
  profile.zoneMins.forEach((min, i) => {
    if (bpm >= min) zone = i + 1;
  });
  return zone;
}

// Zones 0–5 as { zone, name, range } for display, e.g. range "132–148" or "149+".
export function zoneRanges(profile) {
  const mins = profile.zoneMins;
  return ZONE_NAMES.map((name, zone) => {
    let range;
    if (zone === 0) range = 'Under ' + mins[0];
    else if (zone === 5) range = mins[4] + '+';
    else range = mins[zone - 1] + '–' + (mins[zone] - 1);
    return { zone, name, range };
  });
}

export function zoneLabel(zone) {
  return 'Zone ' + zone + ' — ' + ZONE_NAMES[zone];
}
