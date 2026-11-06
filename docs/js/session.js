// In-memory session state: the selected profile. Nothing is stored in the
// browser, so every page load starts with no profile (specs/profiles.md).
//
// Dispatches 'profilechange' (detail: { profile }) on `session`.

export const session = new EventTarget();

let selectedProfile = null;

export function currentProfile() {
  return selectedProfile;
}

export function selectProfile(profile) {
  selectedProfile = profile;
  session.dispatchEvent(new CustomEvent('profilechange', { detail: { profile } }));
}
