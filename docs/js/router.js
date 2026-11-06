// Hash-based screen switching. Each screen is a <section data-screen="name">,
// shown when the URL hash is #name. Changing the hash never reloads the page.
//
// Guards: setGuard(name, fn) lets a screen redirect elsewhere when it can't be
// shown (fn returns another screen's name, or null to allow). Redirects replace
// the history entry, so the back button doesn't bounce.
//
// After every render, dispatches 'screenchange' (detail: { name }) on window.

export const DEFAULT_SCREEN = 'monitor';

const screens = new Map(
  [...document.querySelectorAll('[data-screen]')].map((el) => [el.dataset.screen, el]),
);
const menuLinks = [...document.querySelectorAll('#menu a')];
const guards = new Map();

export function setGuard(name, fn) {
  guards.set(name, fn);
}

// Follows guard redirects (bounded, in case two guards point at each other).
function resolve(name) {
  for (let i = 0; i < 5; i++) {
    const guard = guards.get(name);
    const target = guard && guard();
    if (!target || target === name) return name;
    name = target;
  }
  return name;
}

export function currentScreen() {
  const name = location.hash.slice(1);
  return screens.has(name) ? name : DEFAULT_SCREEN;
}

export function goTo(name) {
  if (location.hash.slice(1) === name) {
    render();
  } else {
    location.hash = name; // triggers hashchange -> render
  }
}

function render() {
  const name = resolve(currentScreen());
  if (location.hash.slice(1) !== name) {
    history.replaceState(null, '', '#' + name); // unknown hash or redirect: no new history entry
  }
  for (const [screenName, el] of screens) {
    el.hidden = screenName !== name;
  }
  for (const link of menuLinks) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + name);
  }
  window.scrollTo(0, 0);
  window.dispatchEvent(new CustomEvent('screenchange', { detail: { name } }));
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  // The app always opens on Monitor, whatever hash it was loaded with.
  history.replaceState(null, '', '#' + DEFAULT_SCREEN);
  render();
}
