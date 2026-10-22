# Tapline — RFID attendance

A working React + Vite attendance demo. Register students and RFID card IDs, start a class session, simulate card taps, review attendance, and export records. The website contains attendance tools only.

## Present tomorrow without installing anything

Open **`tapline-demo.html`** in a current Chrome, Edge, or Firefox browser. You can also double-click `START-DEMO.cmd` on Windows. The standalone HTML contains the compiled React app, icons, and styles. It needs no npm installation and no external fonts, scripts, or API keys.

Use the included `PRESENTATION-GUIDE.md` for a short walkthrough. For the most predictable saved-data behavior, use the local server or a deployed HTTPS website. Browsers can handle storage for double-clicked `file:` pages differently. Test the same browser and file location you will use during the presentation, and download a JSON backup beforehand.

## Run and edit the React source

Install Node.js **22.12 or newer**. In the folder containing `package.json`, run:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. To verify and build:

```sh
npm test
npm run build
npm run preview
```

`npm run build` creates the deployable `dist/` folder and regenerates `tapline-demo.html`. The single-file demo and the source implement the same app. `vite preview` is for local checking, not production hosting.

## Share through GitHub and Vercel

1. Extract this project and create a GitHub repository, for example `tapline-rfid`.
2. Upload **the contents of this folder**, including `package.json`, `package-lock.json`, `src/`, `public/`, `scripts/`, `tests/`, `.github/`, and the configuration files. Keep `package.json` at the repository root. Do not upload `node_modules/` or private attendance data.
3. In Vercel, choose **Add New → Project**, then import the repository.
4. Use **Vite** as the framework, **`npm run build`** as the build command, and **`dist`** as the output directory. `vercel.json` already declares these settings. No environment variables are required.
5. Deploy and share the resulting HTTPS link with your groupmates.

If you put this folder inside a larger repository, set Vercel's **Root Directory** to the folder containing this project's `package.json`.

Official reference: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

### GitHub Pages alternative

The project includes `.github/workflows/deploy.yml`.

1. Put this project's contents at your repository root and push to the `main` branch.
2. In the repository, open **Settings → Pages**. Select **GitHub Actions** as the source.
3. Open **Actions → Deploy to GitHub Pages → Run workflow**, or push a new commit to `main`.
4. Wait for the workflow to finish and use the URL shown in the deployment.

If your default branch has a different name, update the workflow's `branches` value. Relative build assets and hash navigation support repository subpaths without route rewrites. Your repository/account must support GitHub Pages.

Official reference: [Vite static deployment](https://vite.dev/guide/static-deploy.html).

## What works

- Add and edit students; assign unique card IDs and student numbers; activate or deactivate profiles.
- Start a section session with a saved roster and configurable 0–180 minute late threshold.
- Simulate scans with on-screen cards. Enter an ID manually or use a keyboard-type USB reader in the focused input.
- Record the actual device timestamp and input source for accepted taps.
- Reject invalid, unknown, inactive, out-of-roster, and rapid repeated card inputs.
- Keep one attendance entry per student/session while retaining later accepted taps in the raw log.
- Search and filter attendance by student, session, section, status, and session date.
- Close sessions to finalize absences; export filtered attendance CSVs; print records.
- Export and restore the entire workspace as JSON; export the raw tap log; reset the demo after confirmation.
- Use the responsive interface on laptops and phones.

## Exact attendance rules

The initial eight students and their card IDs are **fictional**. There are **no pre-filled attendance records or invented timestamps**. The first session starts when you press Start session.

Only one session can be open. Its roster is a snapshot of the section's active students at the start. New profiles or section changes apply to future rosters. Current active card assignments determine which card can be scanned. Profile edits do not rewrite historical roster names or card assignments.

The first accepted tap is **Present** if it occurs at or before the configured threshold; later arrivals are **Late**. Example: with a 15-minute threshold, exactly 15:00 is on time and 15:00.001 is late. An unscanned student is **Not scanned** while the session is open and **Absent** after it closes. Present plus Late is the checked-in count.

A repeat tap within 5 seconds of the previous accepted tap is rejected. At exactly 5 seconds or later it is logged, but it never adds a second attendance entry or changes the first-arrival status. Records store ISO UTC timestamps and display/filter dates in **Asia/Manila (UTC+8)**. The session date is its start date in Philippine time. Keep your device clock correct.

## Demo and hardware boundaries

This is a **browser-local presentation demo**, not a connected IoT deployment. A hosted link shares the app; it does **not** synchronize student records between devices. Each browser/site address has its own localStorage workspace. Export and import a JSON backup to move or share the same records. Keep one operator tab open during a presentation; this local store is not a concurrent multi-user database.

The on-screen cards are simulated, and exported records label that source. The app does not claim an RFID reader, Wi-Fi board, cloud database, or institutional login is connected. There is no fabricated accuracy percentage or claim that the system verifies the person holding a card. Card lending remains possible.

A compatible **USB keyboard-emulation RFID reader** can type the UID into Scan console → Manual / USB input and send Enter. Enroll the exact output format first. The app removes spaces, colons, and hyphens and uppercases IDs; it does not convert decimal IDs to hexadecimal. Reader/card frequency and protocol must match. Hardware operation has not been tested here because no reader was supplied.

ESP32/ESP8266 readers need firmware plus an authenticated server endpoint and database. A browser cannot directly receive their Wi-Fi transmissions. That connection and shared cloud storage are future integration work; they are not needed to present this demo.

Browser storage is not an access-controlled student information system. Use fictional data for a shared demo. Keep any real personal data out of the public GitHub repository and out of downloadable public backups.

## Project map

```text
src/App.jsx                React screens and interactions
src/domain.mjs             Scan rules, roster snapshots, validation, CSV
src/styles.css             Responsive interface and print styling
tests/domain.test.mjs      Attendance correctness tests
scripts/standalone.mjs     Builds the offline single-file demo
public/favicon.svg         Local vector icon
.github/workflows/deploy.yml  GitHub Pages deployment
vercel.json                Vercel settings
tapline-demo.html          Ready-to-open offline presentation copy
```

## If something goes wrong

- **Page opened as source code:** open `tapline-demo.html`, not `src/App.jsx` or the development `index.html`.
- **No attendance recorded:** start a session and use a card assigned to an active student in that section's saved roster.
- **A new student is rejected:** close the current session and start another so the new student enters the roster.
- **Empty results:** Attendance → Clear filters.
- **No saved data on a groupmate's laptop:** expected for local storage. Download a backup and import it on the other browser.
- **Vercel cannot find package.json:** set the root directory to the folder containing it.
- **Browser refuses storage:** enable site storage or use the hosted HTTPS version. Preserve/download the existing data before resetting.

The delivered build and rules tests were checked locally. See `VALIDATION.md` for the final verification record.
