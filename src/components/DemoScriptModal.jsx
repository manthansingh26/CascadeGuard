import React from 'react';

export function DemoScriptModal({
  isOpen,
  onClose,
  onTriggerScenario,
  onApplyRecommendedRecovery,
  onReset,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ marginRight: 8, verticalAlign: -3 }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            60-Second Hackathon Demo Script (Orcathon Track 01)
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
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 16 }}>
            Follow this 5-step narrative during your live judge presentation to demonstrate predictive failure modeling, root-cause isolation, and automated cascade recovery in exactly 60 seconds:
          </p>

          {/* Step 1 */}
          <div className="demo-step">
            <div className="demo-step-num">1</div>
            <div className="demo-step-content" style={{ flex: 1 }}>
              <strong>00:00 - 00:15 | Show Healthy Baseline Topology</strong>
              <p>
                Point out the 8 microservices, fixed dependency graph, live 2s simulation ticks, and green health status (&lt; 35% risk). Note the transparent heuristic risk formula banner.
              </p>
              <div className="demo-step-action">
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                >
                  ↺ Reset to Clean Baseline
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="demo-step">
            <div className="demo-step-num">2</div>
            <div className="demo-step-content" style={{ flex: 1 }}>
              <strong>00:15 - 00:25 | Inject "Payment Outage" Scenario</strong>
              <p>
                Click "Payment Outage". Show how Payments Service immediately spikes error rate (92%) and latency (3200ms). Notice the instant [ROOT CAUSE] red badge.
              </p>
              <div className="demo-step-action">
                <button
                  type="button"
                  className="scenario-btn"
                  onClick={() => {
                    onTriggerScenario('payment_outage');
                    onClose();
                  }}
                  style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }}
                >
                  ⚡ Trigger "Payment Outage"
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="demo-step">
            <div className="demo-step-num">3</div>
            <div className="demo-step-content" style={{ flex: 1 }}>
              <strong>00:25 - 00:40 | Read Cascade Propagation &amp; Blast Radius</strong>
              <p>
                Explain how failure propagates upward: Payments &rarr; Orders Service &rarr; API Gateway. Highlight the Blast Radius meter (e.g. 3 of 8 services compromised) and the real-time "Time to Total Outage" countdown.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="demo-step">
            <div className="demo-step-num">4</div>
            <div className="demo-step-content" style={{ flex: 1 }}>
              <strong>00:40 - 00:50 | Compare 3 Recovery Strategies</strong>
              <p>
                Direct attention to the 3 side-by-side recovery cards: Restart Pod (slow, doesn't fix external banking API), Rollback (slow), and Isolate + Reroute (RECOMMENDED — trips circuit breaker to async queues in 3s with 95% success).
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="demo-step">
            <div className="demo-step-num">5</div>
            <div className="demo-step-content" style={{ flex: 1 }}>
              <strong>00:50 - 01:00 | Apply Recovery &amp; Show Post-Mortem</strong>
              <p>
                Click "Apply Recovery". Watch nodes transition to cyan "Recovering", then return to 100% healthy green. The incident prevention banner summarizes downtime averted and saved services.
              </p>
              <div className="demo-step-action">
                <button
                  type="button"
                  className="ctrl-btn active"
                  onClick={() => {
                    onApplyRecommendedRecovery();
                    onClose();
                  }}
                  style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', color: '#fff' }}
                >
                  🛡️ Apply Recommended Mitigation
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="ctrl-btn"
            onClick={onClose}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
