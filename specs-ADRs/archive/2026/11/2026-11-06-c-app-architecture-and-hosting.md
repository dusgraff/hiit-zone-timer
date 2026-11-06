# 2026-11-06-c. App architecture and hosting: single page, connection and screen-sleep handling, GitHub Pages

Status: implementing

## Context

The app is plain HTML and JavaScript running in Chrome on Android. Web Bluetooth only works over HTTPS (or `localhost`), so the app needs HTTPS hosting. The repo also holds project files that aren't part of the app (specs, ADRs, CLAUDE.md, TLDR files), and those shouldn't be published.

The app reads heart rate over Web Bluetooth. A Web Bluetooth connection belongs to the page that opened it: loading any other page, even one on the same site, unloads the current page and drops the connection.

Getting the connection back on a new page means showing Chrome's device picker again, which needs a user tap. Chrome has an API for reconnecting to a previously chosen device without the picker (`navigator.bluetooth.getDevices()`), but it's still behind an experimental flag, so the app can't rely on it.

A prototype page (`docs/prototype-hr-connect.html`) confirmed that the basic connection works: in Chrome on Android, it connected to a Polar strap through the device picker and showed live heart rate.

During a workout the phone sits untouched for long stretches. If the screen turns off, Chrome may throttle the page or drop the Bluetooth connection, and the workout would stop tracking heart rate.

## Decision

1. **One page for the whole app.** The app is a single HTML document. It's connected once and stays connected while the user moves between screens.
2. **Screens are sections of that page.** Each screen is a section of the one page, which JavaScript shows and hides. A menu bar with the app name and a hamburger menu switches between screens. The planned screens are:
   - **Monitor:** connection and live heart rate on one screen. With no device connected, it shows a Connect button that opens the device picker. Once connected, it shows the connection status, the live heart rate and stats, and a Disconnect button. The app opens on this screen, and comes back to it when a connection is lost (see item 4).
   - **Select profile.**
   - **Select workout.**
   - **The running workout.**

   **Screens while disconnected.** Select profile and Select workout can be opened without a connection, so the user can look around and pick a profile. Choosing a workout needs a connection: without one, the app goes to Monitor instead of starting the workout.

   **Menu.** The hamburger menu holds Monitor, Select profile and Select workout. The running workout screen isn't a menu item; selecting a workout opens it.

   **Guided flow.** The screens also lead into each other, so a normal session never needs the menu:
   1. On Monitor, once a device is connected, a **Select profile** button appears at the bottom of the screen.
   2. Choosing a profile on Select profile goes straight to Select workout.
   3. Choosing a workout on Select workout opens the running workout screen and starts the workout.

   What each screen does in detail belongs to the future app specs. Code and styles may be split across several JS and CSS files, all loaded by that one page.
3. **Hash-based navigation.** Each screen has a URL hash (for example `#monitor`, `#workout`). Changing the hash doesn't reload the page, so the phone's back button can move between screens without dropping the connection.
4. **Handling a dropped connection.** The same handling applies whenever a connected strap drops, on any screen, whether or not a workout is running. It doesn't apply when the user taps Disconnect: that simply disconnects, with no reconnect attempt.
   - Heart rate stops arriving. If a workout is running, how each of its phases handles that (for example, whether the warm-up clock keeps running) belongs to the future workout spec.
   - The app makes one automatic attempt to reconnect to the same device, which needs no picker while the page is still loaded. During the attempt the app stays on the current screen and shows that it's reconnecting; it doesn't jump to Monitor yet.
   - The app sets no timeout of its own. The attempt runs until it succeeds or the browser's standard Bluetooth connection timeout ends it.
   - If that one attempt fails, the app goes to the Monitor screen, where the user can connect again.
5. **Keeping the screen on.** While a workout is running, the app holds a Screen Wake Lock so the phone doesn't sleep. Android releases the lock when the page is hidden, so the app requests it again when the page becomes visible. The lock is released when the workout ends.
   - **The app is designed for foreground use only.** The intended use is that the app stays open with the screen on for the whole workout, which is short by design. Locking the phone or switching to another app mid-workout is best effort: the app makes no special attempt to keep working while hidden, and it isn't tested. If the connection drops while hidden, the disconnect handling in item 4 applies when the user returns.
6. **Prototype pages stay until the user deletes them.** Standalone test pages such as `docs/prototype-hr-connect.html` are named with a `prototype-` prefix and live alongside the app. They're kept while the app is being built, and the user deletes them by hand once they're no longer needed. Nothing removes them automatically when the app gains the same feature.
7. **ES modules.** The app's JavaScript is written as ES modules, loaded with `<script type="module">`. Each file imports what it uses and exports what it offers. No build step is involved.
8. **Everything is pre-programmed; nothing is stored in the browser.**
   - **Profiles and workouts are JavaScript files in `docs/`.** Fitness profiles (planned: sedentary, average, athletic, which set heart rate zones) and the workouts are written as data in JS modules served with the app. Adding or changing one means editing those files and pushing. There's no in-app editor.
   - **Selecting a workout starts it.** There's no separate start step.
   - **No browser storage.** The app uses no `localStorage`, IndexedDB, cookies or other browser storage. The selected profile and workout progress exist only in the page's memory, so a reload or a killed tab ends the workout, and the user selects the profile and workout again.
9. **Hosting and folder layout.**
   - **No build step.** The files in the repo are exactly the files the browser runs.
   - **The app lives in `docs/`.** Its HTML, JS and CSS go there, and nothing else in the repo is published. The folder is named `docs/` only because GitHub Pages requires that name; it holds the app, not documentation. Specs live in `specs/` and ADRs in `specs-ADRs/`.
   - **GitHub Pages serves it,** using "Deploy from a branch" with `main` and `/docs`. Every push to `main` publishes the app over HTTPS at the repo's Pages address. `docs/index.html` is the app's entry page.
   - **Paths inside the app are relative** (`app.js`, not `/app.js`), because the site is served from the repo's subpath, not the domain root.
10. **What this ADR implements.** The code written under this ADR builds the app's shell and its first real screen:
    - **Title bar and menu:** the menu bar with the app name and the hamburger menu, switching screens through hash navigation.
    - **Monitor screen, fully working:** Connect (device picker), connection status, live heart rate and stats, Disconnect, the one-attempt automatic reconnect, opening on Monitor and returning to it when the connection is lost, and the Select profile button that appears once connected.
    - **Select profile and Select workout:** menu entries that open a placeholder screen saying "Not implemented."
    - **Left for later ADRs:** the running workout screen, profile and workout data, workout logic and the wake lock (which is only held during a workout). That includes what happens when the user leaves the running workout screen mid-workout, through the menu or the back button. It will be decided once the app is working and can be tried.

## Alternatives considered

- **Multiple pages, showing the device picker on each one.** Every page change would make the user pick the strap again. Rejected: too much friction, and it's impossible mid-workout.
- **Multiple pages, reconnecting with `getDevices()`.** This would avoid the picker, but the API is behind a flag in Chrome. Rejected for now. It could be revisited if Chrome ships it by default.
- **A single-page-app framework (React, Vue and similar).** These normally need a build step. The app is plain HTML/JS served as-is, with no build, and the app is small enough to manage without a framework.
- **Path-based routing with the History API (`/setup`, `/workout`).** GitHub Pages has no server-side routing, so reloading or opening a deep link would return a 404 unless a fallback is set up. Hash routing avoids that.
- **No wake lock; ask the user to change the phone's screen timeout.** This relies on the user remembering, and it changes the setting for the whole phone. Rejected.
- **Classic scripts.** These would work for an app this small, but every file shares one global scope, and the `<script>` tags must be listed in dependency order by hand. Modules make dependencies explicit, keep each file's names private, and run deferred and in strict mode by default, at no extra cost in Chrome.
- **Several automatic reconnection attempts, or an app-defined timeout.** Rejected as unnecessary for now: one attempt using the standard timeout keeps the logic simple, and the Monitor screen covers the rest.
- **An in-app workout editor.** Rejected: the app is meant to be bare bones, select-and-go. Workouts change rarely, and editing a JS file and pushing is enough.
- **Saving workout progress in browser storage so it survives a reload.** Rejected: the app is meant to be select-and-go, workouts are short, and starting over is acceptable. Keeping no stored state also means nothing can go stale or need clearing.
- **Supporting background use (phone locked, or another app open) now.** Deferred: it would need testing how Chrome on Android throttles or freezes hidden pages and how that affects Bluetooth, and possibly a different timing design. Getting the core app working comes first. It can be taken up in a later ADR.
- **Publishing from the repo root.** Simplest Pages setup, but it would publish specs, ADRs and all other project files alongside the app. Rejected.
- **Publishing from `app/` with a GitHub Actions workflow.** Pages' branch deploy only offers the root or `/docs`, so any other folder needs an Actions workflow. Rejected: `docs/` gets the same separation with no workflow to maintain. The cost is a folder name that doesn't describe its contents, which the folder's index notes.
- **A build tool (Vite or similar) with a `src/` to `dist/` build.** Not needed for an app this size, and it would add tooling and a deploy step.
- **Deleting each prototype page once the app covers its feature.** Rejected: the prototypes stay useful as isolated tests until the app is working, and the app isn't expected to change much after that.

## Consequences

- **The page must never navigate away mid-workout.** Links between screens have to be hash links or JavaScript, never links to other HTML pages.
- **A reload still disconnects.** An accidental refresh, or Android killing the tab, needs the device picker again. The app has to handle that cleanly instead of failing silently.
- **Disconnect handling becomes part of the workout logic.** The workout logic has to react when heart rate stops arriving, so the Bluetooth layer and the workout timer are connected.
- **The app must be served over HTTP.** Chrome won't load modules from a file opened directly from disk (`file://`). Local testing needs a local server, such as VS Code's Live Server extension or `python -m http.server` run in `docs/`. Web Bluetooth already treats `localhost` as secure, so it works there.
- **Everything in `docs/` is public.** That includes prototype pages and the folder's TLDR files (`CLAUDE.md`, `.tldr.md`), which only hold index text. Nothing private belongs there.
- **Pushing to `main` deploys.** There's no separate release step; a push is a release.
- **Specs change.** A new app-architecture spec is added to `specs/`, covering hosting and folder layout, the single page, screens and menu, hash navigation, script loading, disconnect handling, wake lock, foreground-only use, pre-programmed profiles and workouts with no browser storage, and prototype pages. `specs/README.md` drops its "app specs not yet written" note for this area.

## Supersession

### Supersedes
- None.

### Superseded by
- None.

## Loose ends

- No current loose ends.
