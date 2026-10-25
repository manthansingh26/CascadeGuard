# Screenshot Capture Guide for CascadeGuard

This guide explains how to capture the 3 submission screenshots at 1440px width for hackathon submission forms and README inclusion.

---

## Recommended Setup

1. **Browser Resolution:**
   - Open your browser window at or near **1440px width** (e.g. 1440×900 or 1440×1080).
   - In Chrome/Firefox DevTools (`F12`), toggle Device Toolbar (`Ctrl + Shift + M`), set responsive dimensions to `1440 x 900`, zoom to 100%.
2. **Directory for Saved Images:**
   - Save the images into: `docs/screenshots/`
   - File formats: PNG.

---

## 3 Screenshots to Capture

### Screenshot 1: Healthy Dashboard
- **Filename:** `docs/screenshots/01-healthy-dashboard.png`
- **State to capture:**
  - Fresh load or click **Reset**.
  - All 8 services show green indicators (`< 35% Risk`, Healthy).
  - Top banner shows "SYSTEM STATUS: HEALTHY".
  - "Apply Recovery" button is disabled: *"Inject a failure to compare recoveries"*.
  - Log feed shows normal nominal heartbeat logs.

### Screenshot 2: Cascade in Progress
- **Filename:** `docs/screenshots/02-cascade-in-progress.png`
- **State to capture:**
  - Click **⚡ Payment Outage** in the scenario toolbar.
  - Wait 4–6 seconds for the cascade to propagate up to Orders and API Gateway.
  - Payments service shows red **[ROOT CAUSE]** badge.
  - Orders and API Gateway show red **[CASCADE]** badges.
  - Middle panel shows **Blast Radius: 3 of 8 Services Affected (38%)** and active **Time to Total Crash** countdown.
  - Recovery cards display side-by-side comparison with **RECOMMENDED** tag on *Isolate & Reroute Traffic*.

### Screenshot 3: Recovery Applied
- **Filename:** `docs/screenshots/03-recovery-applied.png`
- **State to capture:**
  - Click **Apply Recovery** on the *Isolate & Reroute Traffic* card.
  - Wait ~2–4 seconds until recovery completes.
  - Top shows green **Post-Mortem banner**:
    `🛡️ Crash prevented in 14s — 3 services saved`
  - Services are transitioning/returned to green Healthy state.
  - Telemetry log feed records mitigation events.

---

## Optional: Adding Screenshots to Git
If the Orcathon submission form requests image uploads or you want them rendered in GitHub's web interface:
1. Place the 3 PNG files in `docs/screenshots/`.
2. Commit and push:
   ```bash
   git add docs/screenshots/
   git commit -m "docs: add high-res screenshots at 1440px"
   git push origin main
   ```
