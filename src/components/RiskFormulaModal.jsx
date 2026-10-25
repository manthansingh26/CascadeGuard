import React from 'react';

export function RiskFormulaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" style={{ marginRight: 8, verticalAlign: -3 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            How Risk Is Calculated
          </h3>
          <button
            type="button"
            className="btn-close-pm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
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

          <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>The Risk Formula:</h4>
          <div className="code-box">
{`Total Risk % = min(100, Math.round(Own Stress × 0.65 + Dependency Drag × 0.35))

Where:
• Own Stress (0 - 100 pts) =
    (Error Rate % × 0.50)         [up to 45 pts]
  + (Latency / SLA × 18)          [up to 35 pts]
  + (CPU % × 0.20)                [up to 20 pts]

• Dependency Drag (0 - 100 pts) =
    (Max Downstream Dep Risk × 0.35)
  + (Avg Downstream Dep Risk × 0.15)`}
          </div>

          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '14px 0 6px' }}>Health State Thresholds:</h4>
          <ul style={{ paddingLeft: 20, fontSize: '0.8rem', color: '#cbd5e1' }}>
            <li><strong style={{ color: '#10b981' }}>Healthy (&lt; 35% Risk):</strong> Nominal baseline, SLA met, normal traffic jitter.</li>
            <li><strong style={{ color: '#f59e0b' }}>At-Risk (35% - 69% Risk):</strong> Upstream dependency degraded or elevated error rate, thread pool queueing.</li>
            <li><strong style={{ color: '#ef4444' }}>Failing (≥ 70% Risk):</strong> Cascading timeout, SLA breach, connection exhaustion, immediate mitigation needed.</li>
          </ul>

          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '14px 0 6px' }}>Recovery Decision Logic:</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            The system ranks 3 automated mitigation strategies by multiplying expected recovery downtime, probability of success, and data-loss safety. Circuit breaker and read-replica traffic shedding are prioritized during database and payment cascades to preserve in-flight transactions without node reboot delays.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="ctrl-btn active"
            onClick={onClose}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
