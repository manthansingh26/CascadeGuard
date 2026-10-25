# CascadeGuard — Orcathon Submission Form Pack

Copy and paste these exact fields into the Orcathon submission portal. Fill in the two bracketed URL placeholders (`[PASTE VERCEL URL HERE AFTER DEPLOY]` and `[PASTE VIDEO LINK HERE AFTER RECORDING]`) after you complete your deployment and video recording.

---

## 📋 Hackathon Submission Fields (Copy-Paste Ready)

### Project Name
```text
CascadeGuard
```

### Track
```text
01 | Software & AI — Orcathon
```

### Team
```text
Solo — Manthan Rajpurohit
```

### GitHub Repository URL
```text
https://github.com/manthansingh26/CascadeGuard
```

### Live Demo URL
```text
[PASTE VERCEL URL HERE AFTER DEPLOY]
```

### Video Demo Link (Loom / YouTube / Google Drive)
```text
[PASTE VIDEO LINK HERE AFTER RECORDING]
```

---

### One-Line Pitch
```text
CascadeGuard is a live dashboard that predicts cascading software failures across 8 simulated services, traces the root cause and blast radius, and compares 3 recovery strategies before a total crash.
```

---

### Key Features (3 Bullet Points)
```text
• Predict Next Failure: Computes real-time risk scores (0–100%) every 2 seconds by fusing SLA latency deviation, container error rates, CPU load, and downstream dependency drag to rank services most likely to fail next.
• Trace Cascade & Blast Radius: Pins a single red [ROOT CAUSE] beacon to the true fault origin while isolating secondary [CASCADE] victims, computing live blast radius percentage and time-to-total-crash countdown.
• Compare & Apply Recovery: Evaluates 3 automated recovery strategies (Pod Restart, Version Rollback, Circuit Breaker) side-by-side with predicted downtime, success probability, and a tagged RECOMMENDED strategy that heals the cluster in one click.
```

---

### Problem Solved
```text
In distributed microservice architectures, catastrophic outages rarely originate from isolated service crashes; they occur because failures cascade across dependency graphs through thread exhaustion, retry storms, and connection pool starvation. Traditional monitoring tools only alert engineers after services have already crashed. CascadeGuard solves this by modeling cascading dependency drag before failure occurs, pinpointing the single root-cause service among secondary victims, and recommending the optimal recovery strategy to prevent total cluster collapse.
```

---

### Tech Stack
```text
Vite, React 19, Vanilla CSS (Dark NOC Ops Design System, SVG topology rendering, zero external component libraries, zero backend dependencies).
```

---

### Honest Architecture & Cost Disclosure
```text
SIMULATED DATA: All 8 microservices, telemetry metrics (latency, error rate, CPU saturation), failure cascades, and healing mechanisms run 100% deterministically in the client browser. Zero external backend, zero API keys, zero paid cloud services, and ₹0 total infrastructure cost.
```

---

### How to Demo in 60 Seconds
```text
1. Open the live deployment link in any modern browser.
2. Click the orange "▶ Auto Demo (60s)" button in the top-right header.
3. The dashboard executes a guided 5-step walkthrough with clear on-screen step captions:
   - Step 1: Shows healthy 8-service topology baseline.
   - Step 2: Auto-injects Payment Outage scenario (Payments tagged [ROOT CAUSE]).
   - Step 3: Shows cascade spreading upward to Orders and API Gateway with live blast radius (38%) and countdown timer.
   - Step 4: Compares 3 recovery strategies and selects recommended Circuit Breaker (Isolate & Reroute).
   - Step 5: Applies mitigation, heals cluster, and displays post-mortem banner showing crash prevented with 3 services saved.
```

---

## ✅ Final Pre-Submission Checklist

Before submitting your form, verify each checkbox:

- [ ] **GitHub Repository Public:** Verify `https://github.com/manthansingh26/CascadeGuard` is set to **Public** so judges can view the code.
- [ ] **Live Vercel Link Active:** Open your deployed URL in an **Incognito / Private browser window** and verify it loads without errors.
- [ ] **Video Link Accessible:** Verify your demo video link (YouTube unlisted / public, Loom, or Google Drive set to "Anyone with link can view") plays smoothly.
- [ ] **Form Fields Verified:** Check that the one-line pitch, problem description, features, and links match your submission inputs.
- [ ] **Submission Deadline:** Submit before **3:30 PM IST, October 25, 2026**.
