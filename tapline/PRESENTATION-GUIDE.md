# A 3–5 minute Tapline walkthrough

Open `tapline-demo.html`, or use the deployed website. Use one browser tab for the demonstration.

1. **Show Overview.** Say: “This is our RFID attendance interface. Today we are using simulated card input because the physical reader is not connected yet.” The starting student names and cards are fictional; the attendance counts begin at zero.
2. **Start a session.** Choose **New session**, name it “Class demo,” select **C3A**, and keep the default 15-minute threshold. Six active C3A students are placed on the roster.
3. **Scan two cards.** Choose **Open scanner**, then click Alex Reyes and Jamie Santos. Each accepted input gets the actual device timestamp. The checked-in count becomes 2 of 6, or 33%.
4. **Show duplicate protection.** Click one card twice in quick succession. The second tap within five seconds is rejected. This does not add a second attendance entry. A later accepted tap stays in the tap log.
5. **Show unknown-card handling.** Click **Test an unregistered card**. It is rejected and attendance counts stay unchanged.
6. **Review attendance.** Close the scan console. Go to **Attendance**. Search a student's name or filter Present. Download **Export CSV**. Clear filters to see the whole roster.
7. **Finalize the session.** Go to **Overview → Close session**, then confirm. The four unscanned students become Absent. Previously accepted scans stay saved.
8. **Optional: demonstrate Late.** Create a new C3A session with the late threshold set to **0 minutes**. Scan a card after starting. It is Late because its first tap is after the zero-minute threshold. Explain that this is a deliberately chosen demo setting, not a school policy.
9. **Show card registration.** In Students & cards, add a fictional student with a unique number and card ID. Explain that a new session must be started to include a newly registered student in its roster.
10. **Close with sharing.** A GitHub Pages or Vercel link lets groupmates use the same app. Records remain separate in each browser; JSON backups can be used to share the same demonstration records.

## Rehearse before presenting

- Open the exact file/site and browser you will use.
- Set the laptop's date/time correctly. All displayed attendance times are Philippine time.
- Register any additional demo students **before** starting the session.
- Download a backup after rehearsal if you want to keep it.
- To start clean, use Workspace settings → Reset demo. Download a backup before confirming if needed.
- The standalone file works without internet after you receive it. Keep the ZIP and a copy of `tapline-demo.html` on your presentation laptop.

## Keep the explanation accurate

The demo shows registration, card identification by assigned ID, timestamps, attendance organization, and exports. It does not prove hardware reading accuracy, network transmission, biometric identity, or measured performance. The attendance completion percentage is a count of students who checked in; it is **not an accuracy measurement**.
