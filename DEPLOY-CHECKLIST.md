# CascadeGuard — Deployment Checklist (Self-Service)

Follow these exact steps in order. You run these commands directly in your terminal; the automated assistant has not run any git commit or push commands.

---

## Part 1: Git Push to GitHub

1. **Verify your local git status**
   ```bash
   git status
   ```
   *Confirm that `node_modules/` and `dist/` are NOT listed in the changes.*

2. **Stage all submission files**
   ```bash
   git add .
   ```

3. **Re-check staged files before committing**
   ```bash
   git status
   ```
   *Ensure you only see source code, configs (`vercel.json`, `package.json`, etc.), and documentation markdown files.*

4. **Commit the final submission**
   ```bash
   git commit -m "CascadeGuard final submission - Orcathon Track 01"
   ```

5. **Push to GitHub**
   ```bash
   git push origin main
   ```
   *Verify your repo is updated at: `https://github.com/manthansingh26/CascadeGuard`*

---

## Part 2: Deploy to Vercel (Free, 2 Minutes)

1. **Log in to Vercel**
   - Navigate to [https://vercel.com](https://vercel.com) and sign in (using GitHub).

2. **Add New Project**
   - Click **"Add New..."** > **"Project"**.
   - Import your GitHub repository: `manthansingh26/CascadeGuard`.

3. **Configure Project Settings**
   - **Framework Preset:** `Vite` (Vercel detects this automatically from `vercel.json`).
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** *Leave completely empty* (₹0 cost, zero API keys, 100% in-browser simulation).

4. **Deploy**
   - Click **"Deploy"**.
   - Wait ~30–45 seconds for the build to complete.
   - You will receive your live production URL (e.g. `https://cascadeguard.vercel.app` or similar).

---

## Part 3: Live Verification in Incognito/Private Window

1. Open your new Vercel production URL in an **Incognito / Private browser window**.
2. **Check initial state:**
   - 8 services displayed in green (Nominal).
   - "Apply Recovery" button is disabled: *"Inject a failure to compare recoveries"*.
3. **Test Auto Demo or Manual Cascade:**
   - Click **`▶ Auto Demo (60s)`** in the header.
   - Watch the banner guide through:
     - Step 1: Healthy baseline
     - Step 2: Injected Payment Outage (Payments marked strictly as `[ROOT CAUSE]`)
     - Step 3: Cascade spreads to Orders & Gateway, blast radius shows 3/8 (38%), countdown active
     - Step 4: Recommended recovery highlighted and applied
     - Step 5: Post-mortem banner appears (`Crash prevented in 14s — 3 services saved`)
4. Verify there are no console errors (press `F12` > Console).

---

## Part 4: Update README with Your Live Vercel URL

1. Open `README.md` in your editor.
2. Locate the line under `## 🌐 Live Demo`:
   ```markdown
   [PASTE VERCEL URL HERE AFTER DEPLOY]
   ```
   Replace it with your actual deployed Vercel link (e.g. `https://cascadeguard.vercel.app`).
3. Also update `SUBMISSION.md` with the same live URL.
4. Push the final link update:
   ```bash
   git add README.md SUBMISSION.md
   git commit -m "docs: add live Vercel deployment link"
   git push origin main
   ```
5. Vercel will automatically redeploy the documentation commit within seconds.
