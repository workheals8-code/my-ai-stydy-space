# Study Space — Personal Edition

A small static study workspace designed to be hosted on GitHub Pages.

## Included in this first version
- Responsive cream/cherry dashboard
- Task checklist
- Drawing whiteboard (pen, eraser, undo, download)
- Notes
- Manual multiple-choice quiz creator and quiz runner
- Local file/link library

## Important limitations
- This is a front-end starter, not a full AI tutor yet.
- Files, tasks, notes, quizzes and whiteboard are stored in this browser on this device. They do not sync to another device and may be lost if browser data is cleared.
- File uploads are stored locally in browser storage (15 MB per-file guard). The browser may impose storage limits.
- The library saves YouTube/Drive links as references. It does not yet transcribe videos, import Drive contents, or extract every document format.
- AI features require a secure backend or a provider integration. Never put an AI API key in public JavaScript or a public GitHub repository.
- GitHub Pages publishes a publicly accessible website. Do not upload private study files, passwords, API keys, or personal information to this repository.

## Publish on GitHub Pages
1. Sign in to GitHub and create a new repository named `study-space`.
2. For GitHub Free, make the repository public if you want to use GitHub Pages.
3. Upload `index.html`, `style.css`, `app.js`, and `.nojekyll` to the repository root.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then Save.
7. Wait for the deployment, then open the URL shown in Settings → Pages.

Your URL will look like `https://YOUR-USERNAME.github.io/study-space/`.

## Files
- `index.html` — app structure
- `style.css` — layout and design
- `app.js` — interactions and local saving
- `.nojekyll` — tells Pages to publish static files directly
