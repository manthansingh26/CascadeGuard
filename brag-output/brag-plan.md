# Brag Plan: CascadeGuard 🛡️

**Project:** CascadeGuard  
**Track:** Orcathon — Track 01: Software & AI  
**Author:** Manthan Rajpurohit  
**Target Duration:** 20.0 seconds (1920×1080 @ 30fps)  
**Tone:** `polished` / `cinematic` (High-energy technical NOC monitoring with sleek dark aesthetic)  

---

## 1. Rubric Answers

1. **What is the app?**  
   CascadeGuard is a live dashboard that predicts cascading software failures across an 8-service distributed topology, isolates the true root cause from secondary victims, and automates optimal recovery before total system crash.

2. **What is the most impressive claim?**  
   "Crash prevented in 14s — 3 services saved with zero data loss and ₹0 cloud cost."

3. **What is the visual hook?**  
   The NOC dark-ops topology graph: animated pulsing dependency lines suddenly turning red under simulated failure, showing blast radius and time-to-crash countdown.

4. **What should be shown from the actual UI?**  
   - Real 8-service SVG topology graph with dedicated node cards.
   - Pinned red `[ROOT CAUSE]` badge vs `[CASCADE]` victims.
   - Live Risk Score counter (70% Failing) and Blast Radius meter (38%).
   - 3-card recovery strategy comparison highlighting the RECOMMENDED Circuit Breaker.
   - Green Post-Mortem banner confirming crash prevented.

5. **What is the shortest satisfying video?**  
   20.0 seconds:
   - 0.0s – 3.5s: Hook & Nominal 8-Service Topology
   - 3.5s – 8.0s: Incident Strike (Payment Outage & Root Cause Tagged)
   - 8.0s – 12.5s: Cascade Spreading, Blast Radius & Crash Countdown
   - 12.5s – 16.5s: Recovery Recommendation & Healing Execution
   - 16.5s – 20.0s: Post-Mortem Victory & Launch Outro

6. **What tone fits best?**  
   `polished` — technical, precise, cinematic NOC monitor aesthetic. High contrast, sharp glowing indicators, zero generic SaaS buzzwords.

7. **What should the audio feel like?**  
   A rhythmic electronic music bed (`happy-beats-business-moves-vol-1`) with crisp UI clicks and subtle impact risers synced to incident injection and recovery resolution.

8. **What should the share caption say?**  
   "CascadeGuard models microservice dependency drag in real-time to predict cascading failures, isolate root causes, and heal clusters before a total crash. Built for Orcathon Track 01."

9. **What's the user flow worth showing?**  
   Entry (healthy cluster) → Incident (Payment Outage triggers root cause & cascade) → Mitigation (recommended circuit breaker applied) → Recovery (cluster restored, post-mortem verified).

---

## 2. Storyboard (Total: 20.0s)

| Scene | Time | Duration | Visual Elements | Audio / Music Cue |
| :--- | :--- | :--- | :--- | :--- |
| **Scene 1: Nominal Baseline** | `0.0s – 3.5s` | 3.5s | Dark NOC viewport appears. "CASCADEGUARD" title with glowing shield. 8-service topology rendered with glowing green links and nominal metrics (`<35% Risk`). | Clean synth intro starts. Gentle UI hum. |
| **Scene 2: Incident Injected** | `3.5s – 8.0s` | 4.5s | "INCIDENT DETECTED: PAYMENT OUTAGE". Payments service flashes red. Latency spikes to 3,200ms, Error 92%, Risk 70%. Pinned `[ROOT CAUSE]` badge pulses. | Low impact hit. Alarm ping. Bassline kicks in. |
| **Scene 3: Cascade Spreading** | `8.0s – 12.5s` | 4.5s | Red pulses travel up to Orders and API Gateway, both tagged `[CASCADE]`. Blast Radius counter counts up to 38% (3/8). Urgent "TIME TO CRASH: 00:26" timer countdown. | Rhythmic driving drums. Glitch / warning SFX. |
| **Scene 4: Recovery Comparison** | `12.5s – 16.5s` | 4.0s | 3 recovery strategies appear side-by-side. "Isolate & Reroute Traffic" highlighted with glowing cyan `RECOMMENDED` badge. One-click apply triggered. | Crisp click SFX. Uplifting synth rise. |
| **Scene 5: Healed & Post-Mortem** | `16.5s – 20.0s` | 3.5s | All services turn green. Green post-mortem banner glides in: "Crash prevented in 14s — 3 services saved". Subtitle: "Orcathon Track 01: Software & AI • 100% In-Browser • ₹0 Cost". | Harmonious resolution chord. Music fades smoothly. |
