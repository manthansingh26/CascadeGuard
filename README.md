# CascadeGuard 🛡️
### Predictive Failure Modeling, Root Cause Isolation & Automated Recovery Engine
**Orcathon — Track 01: Software & AI**

> **Simulated Runtime Notice:** All telemetry, server metrics, dependency topology, and fault injection cascades are modeled directly in-browser. Zero external API keys, zero paid services, ₹0 cloud bill. Built from scratch with React + Vite and Vanilla CSS for instant, clean Vercel deployments.

---

## 📌 Executive Summary & Track 01 Mapping

Modern distributed microservice systems rarely crash from a single fatal error; they die from **cascading software failures** — retry storms, thread starvation, and unbounded dependency timeouts. **CascadeGuard** models, predicts, and isolates cascading failures across an 8-service distributed topology before an entire cluster collapses.

| Track 01 Pillar | CascadeGuard Implementation |
| :--- | :--- |
| **1. Predict Failures** | Evaluates real-time risk scores (0–100%) every 2 seconds by fusing error rates, SLA latency deviations, container CPU saturation, and downstream dependency drag. |
| **2. Identify Root Causes** | Isolates the true origin node (e.g. Postgres lock deadlock, Redis cache eviction) from secondary victims (e.g. Gateway timeouts), tagging the origin with a pulsing red `[ROOT CAUSE]` beacon. |
| **3. Compare Recovery Strategies** | Evaluates 3 automated recovery strategies (*Pod Restart*, *Blue/Green Rollback*, *Isolate & Reroute Traffic*) side-by-side using expected downtime, success probability, data-loss risk, and aggregate scoring. Automatically tags the optimal choice with **RECOMMENDED** and one-line technical justification. |
| **4. Live Ops Dashboard** | NOC dark-ops dashboard featuring an interactive SVG topology graph with animated traffic links, blast-radius counter, time-to-crash countdown timer, and scrolling monospace telemetry logs. |

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

CascadeGuard features a visible, honest, and transparent heuristic formula running locally in JavaScript:

```
Total Risk % = min(100, Math.round(Direct Stress × 0.65 + Upstream Dependency Drag × 0.35))
```

1. **Direct Service Stress (0–100 pts):**
   - **Error Rate Score:** `Error Rate % × 0.50` (up to 45 pts)
   - **Latency SLA Score:** `(Latency / SLA Target) × 18` (up to 35 pts)
   - **CPU Saturation:** `CPU % × 0.20` (up to 20 pts)
2. **Upstream Dependency Drag (0–100 pts):**
   - Microservices that call degraded dependencies experience connection pool starvation and retry backlogs.
   - Calculated as: `(Max Downstream Dep Risk × 0.35) + (Avg Downstream Dep Risk × 0.15)`
3. **Health State Thresholds:**
   - 🟢 **Healthy:** `< 35% Risk` (Nominal SLA, green indicators)
   - 🟡 **At-Risk:** `35% – 69% Risk` (Elevated queueing, amber warning)
   - 🔴 **Failing:** `≥ 70% Risk` (SLA breach, thread starvation, red alert)
   - 🔵 **Recovering:** Active mitigation protocol engaged, converging to baseline.

---

## ⚡ 60-Second Live Hackathon Demo Script

Follow this exact walkthrough during your presentation:

1. **00:00 – 00:15 | Showcase Healthy Baseline**
   - Direct attention to the live 8-service SVG topology.
   - Point out nominal metrics (20ms latency, 0% error, 28% CPU) and green 0–12% risk scores.
   - Highlight the live clock tick (every 2.0s) and the monospace telemetry feed.
2. **00:15 – 00:25 | Inject "Payment Outage" Scenario**
   - Click the **⚡ Payment Outage** button in the scenarios bar (or inject failure on Payments directly).
   - Show how Payments immediately spikes to 3200ms latency and 92% error rate.
   - Note the instant red **[ROOT CAUSE]** beacon pinned to Payments.
3. **00:25 – 00:40 | Read Cascade Propagation & Blast Radius**
   - Watch the animated red dashed pulses travel up the dependency arrows.
   - Orders Service begins failing (T+2s) as calls to Payments timeout.
   - API Gateway degrades (T+4s) as customer checkouts fail.
   - Point out the **Blast Radius: 3 of 8 Services Affected (38%)** and the urgent **Time to Total Crash Countdown** (e.g. `00:26`).
4. **00:40 – 00:50 | Compare Recovery Strategies**
   - Review the 3 side-by-side recovery cards:
     - *Restart Pod*: 12–20s downtime, 68% success (does not fix third-party banking timeout).
     - *Rollback Version*: 45–60s downtime, 82% success.
     - *Isolate & Reroute (Circuit Breaker)*: **RECOMMENDED** (3–5s downtime, 95% success chance, zero data loss via async queue fallback).
5. **00:50 – 01:00 | Apply Recovery & Inspect Post-Mortem**
   - Click **Apply Recovery** on the recommended strategy.
   - Nodes transition to cyan **Recovering** state, and error rates drain to zero.
   - The green Post-Mortem banner appears:
     > `🛡️ Crash prevented in 14s — 3 services saved`
     > `Automated mitigation successfully restored 100% SLA compliance with zero permanent data loss recorded.`

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
        ├── ServiceGraph.jsx             # Interactive SVG topology graph with animated bezier dependency lines
        ├── CascadeTrace.jsx             # Root-cause callout, blast radius meter, time-to-crash timer, and timeline
        ├── RecoveryComparison.jsx       # 3 strategy comparison cards with trade-off table and recovery trigger
        ├── LogFeed.jsx                  # Monospace live terminal feed with severity badges and auto-scroll
        ├── RiskRankedList.jsx           # "Most Likely to Fail Next" table ranked by predicted risk score
        ├── RiskFormulaModal.jsx         # Transparent heuristic formula disclosure modal
        ├── DemoScriptModal.jsx          # Interactive 60-second presenter guide modal with quick triggers
        └── ServiceDetailModal.jsx       # Service deep-dive showing callers, dependencies, and manual injection
```

---

*Built with precision for Orcathon — Track 01: Software & AI.*
