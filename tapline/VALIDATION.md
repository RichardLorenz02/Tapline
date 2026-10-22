# Verification record

- `npm ci` / locked dependency installation: completed.
- `npm run build`: passed. Generated the production `dist/` site and standalone HTML.
- `node --test tests/*.test.mjs`: all 11 tests passed.
- Standalone asset check: no external JavaScript or stylesheet references. Favicon is embedded; no web fonts or external image assets are required.
- Initial data check: eight explicitly fictional students, zero attendance records, zero sessions, zero fabricated timestamps.

The tests cover card-ID normalization, correct student matching, unregistered/inactive/wrong-section rejection, five-second repeated-tap handling, one attendance entry per student/session, late-threshold boundaries, finalizing absences, session roster snapshots, unique card/student assignments, CSV formula escaping, backup validation, and Philippine calendar dates.

The in-app browser could not connect to the local preview (connection timeouts). Interactive browser and visual checks therefore remain unverified. Attempts to launch/stop an alternate preview process were also rejected by automatic approval review. No physical RFID reader was supplied, so actual hardware operation was not tested.

GitHub Pages and Vercel configuration files and instructions are included. The project has not been uploaded to either service and no public deployment URL has been created.

Rehearse the included walkthrough in your presentation browser before presenting.
