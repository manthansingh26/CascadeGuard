# CascadeGuard 🛡️
### Predictive Failure Modeling, Root Cause Isolation & Automated Recovery Engine
**Orcathon — Track 01: Software & AI**

> **Simulated Runtime Notice:** All telemetry, server metrics, dependency topology, and fault injection cascades are modeled directly in-browser. Zero external API keys, zero paid services, ₹0 cloud bill. Built from scratch with React + Vite and Vanilla CSS for instant, clean Vercel deployments.

---

## 🌐 Live Demo

[PASTE VERCEL URL HERE AFTER DEPLOY]

- **GitHub Repository:** [https://github.com/manthansingh26/CascadeGuard](https://github.com/manthansingh26/CascadeGuard)

---

## 📸 Screenshots

### 1. Healthy Dashboard
<!-- Screenshot Placeholder: 1. Healthy dashboard (Nominal 8-service topology, green indicators) -->
![1. Healthy Dashboard](docs/screenshots/01-healthy-dashboard.png)

### 2. Cascade in Progress
<!-- Screenshot Placeholder: 2. Cascade in progress (Payment Outage injected, Payments ROOT CAUSE, Orders & Gateway CASCADE, blast radius active) -->
![2. Cascade in Progress](docs/screenshots/02-cascade-in-progress.png)

### 3. Recovery Applied
<!-- Screenshot Placeholder: 3. Recovery applied (Circuit breaker engaged, services recovering/green, post-mortem banner visible) -->
![3. Recovery Applied](docs/screenshots/03-recovery-applied.png)

---

## 📌 Executive Summary & Track 01 Mapping

Modern distributed microservice systems rarely crash from a single fatal error; they die from **cascading software failures** — retry storms, thread starvation, and unbounded dependency timeouts. **CascadeGuard** models, predicts, and isolates cascading failures across an 8-service distributed topology before an entire cluster collapses.

| Track 01 Pillar | CascadeGuard Implementation |
| :--- | :--- |
| **1. Predict Failures** | Evaluates real-time risk scores (0–100%) every 2 seconds by fusing error rates, SLA latency deviations, container CPU saturation, and downstream dependency drag. |
| **2. Identify Root Causes** | Isolates the true origin node (e.g. Postgres lock deadlock, Redis cache eviction) from secondary victims (e.g. Gateway timeouts), tagging the origin strictly with a single red `[ROOT CAUSE]` beacon while downstream victims are tagged `CASCADE`. |
| **3. Compare Recovery Strategies** | Evaluates 3 automated recovery strategies (*Pod Restart*, *Blue/Green Rollback*, *Isolate & Reroute Traffic*) side-by-side using expected downtime, success probability, data-loss risk, and aggregate scoring. Automatically tags the optimal choice with **RECOMMENDED** and one-line technical justification. Apply button is enabled only during an active cascade. |
| **4. Live Ops Dashboard** | NOC dark-ops dashboard featuring an interactive SVG topology graph with animated traffic links, blast-radius counter, time-to-crash countdown timer, and scrolling monospace telemetry logs with zero horizontal scroll clipping. |

---

## 🏗️ The System Topology (8 Services)

CascadeGuard models a realistic e-commerce & identity platform with a fixed dependency graph:

```
                  ┌─────────────────┐
                  │   API Gateway   │ (Edge Ingress)
                  └──────┬───┬──────┘
             ┌───────────┘   └───────────┐
             ▼                           ▼
      ┌────────────┐              ┌────────────┐
      │    Auth    │              │   Orders   │ (Core Domain)
      └────┬───┬───┘              └──┬───┬───┬─┘
     ┌─────┘   └───┐        ┌────────┘   │   └────────┐
     ▼             ▼        ▼            │            ▼
┌─────────┐   ┌─────────┐┌──────────┐    │       ┌───────────┐
│  Cache  │   │Database ││ Payments │    │       │ Inventory │ (Subservices)
│ (Redis) │   │(Postgres│└────┬───┬─┘    │       └─────┬─────┘
└─────────┘   └─────────┘     │   └──────┼─────────────┤
     ▲             ▲          │          ▼             │
     └─────────────┴──────────┴──────────┴─────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │ Notifications │ (Leaves / Data Layer)
                      └───────────────┘
```

- **API Gateway** depends on: `Auth`, `Orders`
- **Auth** depends on: `Database`, `Cache`
- **Orders** depends on: `Payments`, `Inventory`, `Database`
- **Payments** depends on: `Database`, `Notifications`
- **Inventory** depends on: `Database`
- **Leaves (Data & Worker layer)**: `Cache`, `Database`, `Notifications`

---

## 📐 How Risk Is Calculated (Heuristic Predictor)

CascadeGuard features an honest, transparent, and mathematically normalized heuristic formula running locally in JavaScript (0–100 scale everywhere):

```
Total Risk % = min(100, Math.round(Direct Stress × 0.70 + Dependency Drag × 0.30))
```

### 1. Direct Service Stress (0–100 pts):
- **Error Rate Score:** `min(45, Error Rate % × 0.50)` (up to 45 pts)
- **Latency SLA Score:** `min(35, (Latency / SLA Target) × 17.5)` (up to 35 pts)
- **CPU Saturation:** `min(20, (CPU % / 100) × 20)` (up to 20 pts)
- `Direct Stress = Error Score + Latency Score + CPU Score` (range: 0–100 pts)

### 2. Downstream Dependency Drag (0–100 pts):
Microservices that call degraded dependencies experience connection pool starvation and retry backlogs:
- `Dependency Drag = (Max Downstream Dep Risk × 0.70) + (Avg Downstream Dep Risk × 0.30)`
- Leaf services with no dependencies evaluate `Dependency Drag = 0`.

### 3. Worked Verification Example (Payments Service during Payment Outage):
- **Telemetry:** Latency = 3200ms (SLA 400ms $\to$ 8.0x SLA), Error Rate = 92%, CPU = 89%.
- **Direct Stress:**
  - Error: `min(45, 92 × 0.50) = 45.0 pts`
  - Latency: `min(35, (3200 / 400) × 17.5) = 35.0 pts`
  - CPU: `min(20, (89 / 100) × 20) = 17.8 pts`
  - **Total Direct Stress:** `45.0 + 35.0 + 17.8 = 97.8 pts`
- **Dependency Drag:**
  - Dependencies: Database (7% risk), Notifications (4% risk)
  - Max Downstream = 7%, Avg Downstream = 5.5%
  - **Dependency Drag:** `(7 × 0.70) + (5.5 × 0.30) = 4.90 + 1.65 = 6.55 pts`
- **Total Risk %:**
  - `min(100, Math.round(97.8 × 0.70 + 6.55 × 0.30)) = Math.round(68.46 + 1.965) = Math.round(70.43) = 70%` (Status: **FAILING**, $\ge 70\%$)

### 4. Health State Thresholds:
- 🟢 **Healthy:** `< 35% Risk` (Nominal SLA, green indicators)
- 🟡 **At-Risk:** `35% – 69% Risk` (Elevated queueing, amber warning)
- 🔴 **Failing:** `≥ 70% Risk` (SLA breach, thread starvation, red alert)
- 🔵 **Recovering:** Active mitigation protocol engaged, telemetry converging back to SLA baseline.

---

## ⚡ 60-Second Live Hackathon Demo Walkthrough

CascadeGuard includes a built-in **`▶ Auto Demo (60s)`** button in the header that automates the entire walkthrough in one take with large on-screen step banners (ideal for screen recording), or you can follow this manual walkthrough:

1. **00:00 – 00:15 | Showcase Healthy Baseline**
   - Direct attention to the live 8-service SVG topology.
   - Point out nominal metrics (20ms latency, 0% error, 28% CPU) and green healthy risk scores.
   - Notice the "Apply Recovery" button is cleanly disabled while healthy with the hint *"Inject a failure to compare recoveries"*.
2. **00:15 – 00:25 | Inject "Payment Outage" Scenario**
   - Click the **⚡ Payment Outage** button in the scenarios bar (or click "⚡ INJECT FAIL" on Payments directly).
   - Show how Payments immediately spikes to 3200ms latency, 92% error rate, and 70% risk.
   - Note the single red **[ROOT CAUSE]** beacon pinned strictly to Payments.
3. **00:25 – 00:40 | Read Cascade Propagation & Blast Radius**
   - Watch the animated red dashed pulses travel up the dependency arrows.
   - Orders Service begins failing (T+2s) as calls to Payments timeout, tagged **CASCADE**.
   - API Gateway degrades (T+4s) as customer checkouts fail.
   - Point out the **Blast Radius: 3 of 8 Services Affected (38%)** and the urgent **Time to Total Crash Countdown** (e.g. `00:26`).
4. **00:40 – 00:50 | Compare Recovery Strategies**
   - Review the 3 side-by-side recovery cards:
     - *Restart Pod*: 12–20s downtime, 68% success (does not fix third-party banking timeout).
     - *Rollback Version*: 45–60s downtime, 82% success.
     - *Isolate & Reroute (Circuit Breaker)*: **RECOMMENDED** (3–5s downtime, 95% success chance, zero data loss via async queue fallback).
   - "Apply Recovery" is now enabled.
5. **00:50 – 01:00 | Apply Recovery & Inspect Post-Mortem**
   - Click **Apply Recovery** on the recommended strategy.
   - Nodes transition to cyan **Recovering** state, and error rates drain to zero.
   - The green Post-Mortem banner appears with the exact saved count from the cascade:
     > `🛡️ Crash prevented in 14s — 3 services saved`
     > `Mitigated via Isolate & Reroute Traffic. Automated remediation successfully restored 100% SLA compliance with zero permanent data loss recorded.`

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24.19.0`)
- npm `v9+` or `v10+`

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview production build
npm run preview
```

### Vercel Deployment
Simply connect the repository to Vercel or deploy using the standard Vite preset:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 📁 Repository Structure & File Guide

```
.
├── index.html                           # App entrypoint with Google Fonts (JetBrains Mono & Inter) and SEO metadata
├── package.json                         # Vite + React 19 configuration with zero external component libraries
├── README.md                            # Complete documentation, Track 01 mapping, and 60s demo script
├── vite.config.js                       # Standard Vite React plugin config
└── src/
    ├── main.jsx                         # React root mount and StrictMode wrapper
    ├── index.css                        # Full Dark Ops design system (tokens, glassmorphism, animations)
    ├── data/
    │   └── topology.js                  # 8-service dependency graph, failure scenarios, and recovery definitions
    ├── utils/
    │   └── cascadeEngine.js             # Heuristic risk calculation, cascade propagation ticks, and telemetry logs
    └── components/
        ├── Header.jsx                   # Clock ticker, Play/Pause, Reset, and Orcathon Track 01 banner
        ├── ServiceGraph.jsx             # Interactive SVG topology graph with dedicated button row and edges behind nodes
        ├── CascadeTrace.jsx             # Single root-cause callout, blast radius meter, time-to-crash timer, and timeline
        ├── RecoveryComparison.jsx       # 3 strategy comparison cards with disabled-when-healthy state and recovery trigger
        ├── LogFeed.jsx                  # Monospace live terminal feed with word-wrap safety and full history search
        ├── RiskRankedList.jsx           # "Most Likely to Fail Next" table ranked by predicted risk score
        ├── RiskFormulaModal.jsx         # Transparent heuristic formula disclosure modal with Payments worked example
        ├── DemoScriptModal.jsx          # Interactive 60-second presenter guide modal with quick triggers
        └── ServiceDetailModal.jsx       # Service deep-dive showing callers, dependencies, and manual injection
```

---

*Built with precision for Orcathon — Track 01: Software & AI.*
