# App architecture

How the app is built, hosted and laid out: the single page, its screens and navigation, the Bluetooth connection, screen sleep, data and storage. What happens inside a workout is for the workout spec, which isn't written yet.

Decided in [ADR 2026-11-06-c](../specs-ADRs/archive/2026/11/2026-11-06-c-app-architecture-and-hosting.md).

## Hosting and folder layout

- **Plain HTML, JS and CSS with no build step.** The files in the repo are exactly the files the browser runs.
- **The app lives in `docs/`.** Only that folder is published. It's named `docs/` because GitHub Pages requires that name; it holds the app, not documentation. Specs live in `specs/` and ADRs in `specs-ADRs/`.
- **GitHub Pages serves it** from `main`, folder `/docs` ("Deploy from a branch"), over HTTPS, which Web Bluetooth requires. Every push to `main` publishes the app; there's no separate release step.
- **`docs/index.html` is the entry page.**
- **Everything in `docs/` is public,** including prototype pages and the folder's TLDR files. Nothing private goes there.
- **Paths inside the app are relative** (`app.js`, not `/app.js`), because the site is served from the repo's subpath.

## Single page

- **The whole app is one HTML document.** A Web Bluetooth connection belongs to the page that opened it, so the app never loads another page. Links between screens are hash links or JavaScript, never links to other HTML pages.
- **Screens are sections of the page** that JavaScript shows and hides.
- **Hash-based navigation.** Each screen has a URL hash (for example `#monitor`, `#workout`). Changing the hash doesn't reload the page, so the back button moves between screens without dropping the connection.
- **A reload ends everything.** A refresh or a killed tab drops the connection and all state; the app starts again on Monitor.

## Code

- **ES modules.** JavaScript is written as ES modules, loaded with `<script type="module">`. Each file imports what it uses and exports what it offers. Code and styles may be split across several files, all loaded by the one page.
- **Served over HTTP, never opened from disk.** Chrome won't load modules from `file://`. Local testing uses a local server, such as VS Code's Live Server extension or `python -m http.server` run in `docs/`. Web Bluetooth treats `localhost` as secure.

## Screens and menu

A menu bar at the top shows the app name, the version number and a hamburger menu.

- **Version number.** Shown after the app name with a dash, for example `HR HIIT Pacer - 0.0001`. The format is `0.` plus four digits, defined once in `docs/js/version.js`. It's incremented with every change to the app's files in `docs/` that will be pushed, so the user can tell when a new build has reached the phone (GitHub Pages takes a little while to publish, and phones may show a cached copy).

| Screen | In the menu | What it does |
|---|---|---|
| Monitor | Yes | Connection and live heart rate. With no device connected: a Connect button that opens the device picker. Once connected: connection status, live heart rate and stats, a Disconnect button, and a **Select profile** button at the bottom. |
| Select profile | Yes | Choose a fitness profile. |
| Select workout | Yes | Choose a pre-programmed workout. |
| Running workout | No | The workout in progress. Opened by choosing a workout. |

- **The app opens on Monitor,** and returns to it when a connection is lost (see [Dropped connection](#dropped-connection)).
- **Guided flow.** A normal session never needs the menu: connect on Monitor and tap **Select profile**; choosing a profile goes straight to Select workout; choosing a workout opens the running workout and starts it.
- **Screens while disconnected.** Select profile and Select workout can be opened without a connection. Choosing a workout needs one; without it, the app goes to Monitor instead of starting the workout.
- **Not yet specified:** what each screen shows in detail, and what happens when the user leaves the running workout mid-workout.

## Bluetooth connection

- **Web Bluetooth with the standard BLE Heart Rate Service,** in Chrome on Android.
- **Connected once per page load.** The connection stays up while the user moves between screens.

### Dropped connection

This applies whenever a connected strap drops, on any screen, whether or not a workout is running:

1. Heart rate stops arriving. If a workout is running, how each of its phases handles that belongs to the workout spec.
2. The app makes **one** automatic attempt to reconnect to the same device. No picker is needed while the page is still loaded.
3. During the attempt, the app stays on the current screen and shows that it's reconnecting.
4. The app sets no timeout of its own; the browser's standard Bluetooth connection timeout applies.
5. If the attempt fails, the app goes to Monitor, where the user can connect again.

Tapping **Disconnect** just disconnects, with no reconnect attempt.

## Screen sleep and foreground use

- **Wake lock during a workout.** While a workout is running, the app holds a Screen Wake Lock so the phone doesn't sleep. Android releases the lock when the page is hidden, so the app requests it again when the page becomes visible. It's released when the workout ends.
- **Foreground use only.** The app is meant to stay open with the screen on for the whole workout. Locking the phone or switching apps mid-workout is best effort and untested; if the connection drops while hidden, the dropped-connection handling applies when the user returns.

## Data and storage

- **Profiles and workouts are pre-programmed** as data in JS modules in `docs/`. Planned profiles are sedentary, average and athletic; a profile sets the heart rate zones. Changing either means editing those files and pushing. There's no in-app editor.
- **Selecting a workout starts it.** There's no separate start step.
- **Nothing is stored in the browser.** No `localStorage`, IndexedDB, cookies or other storage. The selected profile and workout progress exist only in the page's memory.

## Prototype pages

Standalone test pages are named `prototype-*.html` and live in `docs/` alongside the app. They stay until the user deletes them by hand; nothing removes them automatically.
