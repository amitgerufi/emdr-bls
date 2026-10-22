Music folder — BLS-VR
==========================

How to add new background music:

1. Get a music file in MP3 format (calm, non-distracting).
2. Put it here, in this folder (music) — any English file name works.
3. Open dashboard/lib/constants.ts and add a line to the MUSIC list
   with the file name (without .mp3), a label, and a duration. For example:
      { id: 'my-track', label: { en: 'My track', he: 'הרצועה שלי' }, dur: '3:20' },
4. Upload the file and the change to GitHub.

Music plays on a loop in the background. Long tracks start immediately —
the player streams them while playing, not downloading everything upfront.

Notes:
- If a button points to a file that doesn't exist, music simply won't play (no error).
- Music volume is controlled from the dashboard.
- Mind copyright — use music you're allowed to use.

Your own music (from the patient's device)
---------------------------------------------
Besides the tracks in this folder, the patient can add their own music files on their device
("Media on this device" on the patient screen); the dashboard then lists them under
"On the patient's device". See README.md.
