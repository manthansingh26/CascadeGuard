import React from 'react';

export function RiskFormulaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Sticky Header with Always-Visible Close Button */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a' }}>
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" style={{ marginRight: 8, verticalAlign: -3 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            How Risk Is Calculated (Heuristic Predictor)
          </h3>
          <button
            type="button"
            className="btn-close-pm"
            onClick={onClose}
            aria-label="Close formula modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: '0.8rem',
            color: '#c7d2fe',
          }}>
            <strong>Transparent Architecture Disclosure:</strong> This system uses a calibrated heuristic predictor running entirely on simulated browser data — not a closed-box ML model trained on external production logs. This guarantees ₹0 cloud infrastructure cost, zero external API keys, and instantaneous zero-latency local execution.
          </div>

          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>The Risk Formula (Normalized 0–100 Everywhere):</h4>
          <div className="code-box">
{`Total Risk % = min(100, Math.round(Direct Stress × 0.70 + Dependency Drag × 0.30))

Where:
1. Direct Stress (0 - 100 pts) =
     Error Rate Score  : min(45, Error Rate % × 0.50)
   + Latency Score     : min(35, (Latency / SLA) × 17.5)
   + CPU Saturation    : min(20, (CPU % / 100) × 20)

2. Dependency Drag (0 - 100 pts, normalized from downstream dependencies) =
     (Max Downstream Dep Risk × 0.70) + (Avg Downstream Dep Risk × 0.30)
     (Leaf services with no dependencies evaluate Dependency Drag = 0)`}
          </div>

          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '14px 0 6px' }}>Worked Verification Example:</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8 }}>
            Simulating <strong>Payments Service</strong> during <em>Payment Outage</em> (SLA = 400ms):
          </p>
          <div className="code-box" style={{ color: '#a5f3fc' }}>
{`Telemetry Input:
• Latency: 3200ms  (SLA: 400ms → 8.0x SLA)
• Error Rate: 92%
• CPU Saturation: 89%
• Downstream Dependencies: Database (7% risk), Notifications (4% risk)

Step 1: Direct Stress (0 - 100 pts)
• Error Score    = min(45, 92 × 0.50)           = 45.0 pts
• Latency Score  = min(35, (3200 / 400) × 17.5)  = 35.0 pts (capped at max SLA breach)
• CPU Score      = min(20, (89 / 100) × 20)     = 17.8 pts
▶ Total Direct Stress = 45.0 + 35.0 + 17.8 = 97.8 pts

Step 2: Dependency Drag (0 - 100 pts)
• Max Downstream Dep Risk = 7% (Database)
• Avg Downstream Dep Risk = (7 + 4) / 2 = 5.5%
▶ Dependency Drag = (7 × 0.70) + (5.5 × 0.30) = 4.90 + 1.65 = 6.55 pts

Step 3: Total Risk Score %
▶ Total Risk = min(100, Math.round(97.8 × 0.70 + 6.55 × 0.30))
             = min(100, Math.round(68.46 + 1.965))
             = min(100, Math.round(70.43))
             = 70%  → FAILING STATUS (≥ 70%)`}
          </div>

          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '14px 0 6px' }}>Health State Thresholds:</h4>
          <ul style={{ paddingLeft: 20, fontSize: '0.8rem', color: '#cbd5e1' }}>
            <li><strong style={{ color: '#10b981' }}>Healthy (&lt; 35% Risk):</strong> Nominal baseline, SLA met, normal traffic jitter.</li>
            <li><strong style={{ color: '#f59e0b' }}>At-Risk (35% - 69% Risk):</strong> Upstream dependency degraded or elevated error rate, thread pool queueing.</li>
            <li><strong style={{ color: '#ef4444' }}>Failing (≥ 70% Risk):</strong> Cascading timeout, SLA breach, connection exhaustion, immediate mitigation needed.</li>
            <li><strong style={{ color: '#06b6d4' }}>Recovering:</strong> Automated recovery active, telemetry converging back to SLA baseline.</li>
          </ul>
        </div>

        {/* Sticky Footer */}
        <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#0b1120' }}>
          <button
            type="button"
            className="ctrl-btn active"
            onClick={onClose}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
