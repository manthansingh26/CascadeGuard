# CascadeGuard — 60-Second Video Demo Recording Guide & Script

**Orcathon Track 01: Software & AI**  
*Author:* Manthan Rajpurohit  
*Project:* CascadeGuard  

---

## 🎥 (A) Ubuntu Recording Setup (One-Take, Zero Editing)

You do **not** need video editing software. Follow these steps to record a flawless demo in a single take:

1. **Deploy first, then record the deployed link:**
   - Record the live Vercel URL (e.g. `https://cascadeguard.vercel.app`), **not** `localhost:5173`.
2. **Browser Setup:**
   - Use Google Chrome or Firefox on Ubuntu.
   - Set zoom level to **100%** (`Ctrl + 0`).
   - Hide the bookmarks bar (`Ctrl + Shift + B`).
   - Press `F11` (or maximize the window) to keep the viewport clean.
   - Recommended resolution: **1920×1080**.
3. **Recording Tool on Ubuntu:**
   - **Option 1 (GNOME Built-in Screen Recorder - Fastest):**
     - Press `Ctrl + Alt + Shift + R` (or `Print Screen` on modern Ubuntu / GNOME 42+).
     - Select **Screen Recording** mode (video icon).
     - Select the browser window or full screen.
     - Click Record (red dot in top tray).
     - To finish, click the red recording indicator in the top right panel.
   - **Option 2 (OBS Studio - If you want microphone audio):**
     - Install via `sudo apt install obs-studio` (if not already installed).
     - Add a "Window Capture (Xcomposite)" or "Screen Capture" source.
     - Set canvas resolution to 1920×1080.
4. **How to Record with 1-Click Auto Demo:**
   - Open the live page.
   - Start your screen recorder.
   - Click the orange **`▶ Auto Demo (60s)`** button in the top right header.
   - The app will automatically run all 5 steps with large, readable captions at the top.
   - At second 70, the post-mortem completes, the caption disappears, and the app cleanly returns to manual mode.
   - Stop your screen recorder. Done!

---

## 🎙️ (B) 75-Second Word-for-Word Narration Script (Voiceover Version)

If you choose to speak during the video, read this script slowly and naturally. It is timed to match the 5 automated steps:

| Time | Auto Demo Step | Word-for-Word Voiceover Script |
| :--- | :--- | :--- |
| **00:00 – 00:10** | **Step 1:** Healthy Baseline | *"Hello, this is CascadeGuard for Orcathon Track 01: Software & AI. Here we have an 8-service distributed microservice topology running in nominal health. All server telemetry is simulated directly in the browser with zero backend cost. Every 2 seconds, our heuristic risk engine computes failure probability based on latency SLA deviation, error rates, and downstream dependency drag. Notice that all services are green and the recovery trigger is disabled while healthy."* |
| **00:10 – 00:25** | **Step 2:** Inject Payment Outage | *"Now, an incident strikes: a Payment Outage is injected. Payments immediately breaches its SLA with 3,200ms latency and 92% error rate. CascadeGuard instantly flags Payments with a red ROOT CAUSE badge, isolating the true failure origin from downstream noise."* |
| **00:25 – 00:40** | **Step 3:** Cascade Spreading | *"Within seconds, the failure cascades upward: Orders Service begins timing out, followed by the API Gateway. Both are tagged CASCADE victims. CascadeGuard measures the blast radius at 38% — 3 of 8 services degraded — and initiates an urgent Time-to-Total-Crash countdown before the entire cluster collapses."* |
| **00:40 – 00:55** | **Step 4:** Evaluate & Apply Recovery | *"CascadeGuard compares 3 recovery strategies in real time: Pod Restart, Version Rollback, and Circuit Breaker isolation. It recommends Isolate and Reroute, which offers a 95% success probability and zero data loss. Let's apply the recommended recovery."* |
| **00:55 – 01:10** | **Step 5:** Healed & Post-Mortem | *"The circuit breaker isolates the failing payment gateway. Calls are queued asynchronously, error rates drop to zero, and the system recovers. Our post-mortem banner confirms: crash prevented, and exactly 3 affected services saved. That is CascadeGuard — predicting, isolating, and healing cascading failures."* |

---

## 🔇 (C) No-Voice Version (Silent Recording)

**You do not have to speak if you prefer not to.**  
The `▶ Auto Demo (60s)` mode was specifically engineered for silent submissions:
- During each step, an on-screen banner appears with step number, animated live indicator, and descriptive text:
  1. `AUTO DEMO • STEP 1 OF 5` — *Healthy system — 8 services, low risk*
  2. `AUTO DEMO • STEP 2 OF 5` — *Injecting Payment Outage — root cause: Payments*
  3. `AUTO DEMO • STEP 3 OF 5` — *Cascade spreading — blast radius growing*
  4. `AUTO DEMO • STEP 4 OF 5` — *Applying recommended recovery: Isolate & Reroute*
  5. `AUTO DEMO • STEP 5 OF 5` — *Crash prevented — system recovered*
- The animated SVG graph, glowing dependency lines, blast-radius counter, and live terminal logs visually narrate the entire incident.
- Reviewers and judges will easily follow along with or without audio.

---

## 🚫 (D) What NOT to Say (Hard Rules)

To keep your submission 100% honest, credible, and compliant with Orcathon guidelines:

1. **DO NOT claim a "trained ML / deep learning model on production logs".**
   - Say: *"A deterministic heuristic risk model fusing SLA deviations, error rates, and dependency drag."*
2. **DO NOT claim "real production data" or "live production cluster".**
   - Say: *"Simulated microservice telemetry running in-browser."*
3. **DO NOT speak URLs aloud.**
   - Do not say *"Go to h-t-t-p-s colon slash slash..."* — just let the screen speak.
4. **DO NOT make win or rank claims.**
   - Avoid *"This is the winning project..."* or *"Best submission in Track 01"*.
5. **DO NOT claim cloud backends or paid infrastructure.**
   - Keep the ₹0 in-browser architecture story front and center.
