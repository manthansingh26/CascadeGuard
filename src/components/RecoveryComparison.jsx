import React from 'react';

export function RecoveryComparison({
  strategies,
  recommendedStrategyId,
  recommendationReason,
  hasActiveIncident,
  blastRadius = 0,
  isRecovering,
  onApplyRecovery,
}) {
  const isCascadeActive = (blastRadius > 0 || hasActiveIncident);
  const canApply = isCascadeActive && !isRecovering;

  return (
    <div className="dashboard-card recovery-section">
      <div className="recovery-header-bar">
        <div className="card-title-group">
          <span className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
              <path d="M12 2v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="M12 22v-4" />
              <path d="m19.07 19.07-2.83-2.83" />
              <path d="M22 12h-4" />
              <path d="m19.07 4.93-2.83 2.83" />
            </svg>
            Automated Recovery Strategies Comparison
          </span>
          <span className="card-subtitle">AI Trade-off Engine (Downtime vs Data Loss vs Success Probability)</span>
        </div>

        {hasActiveIncident && !isRecovering && (
          <div className="recovery-badge-alert">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            MITIGATION REQUIRED
          </div>
        )}

        {isRecovering && (
          <div className="recovery-badge-alert" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            MITIGATION IN PROGRESS
          </div>
        )}

        {!hasActiveIncident && !isRecovering && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Idle (Zero Cascade Active)
          </div>
        )}
      </div>

      {/* 3 Strategy Cards Side by Side */}
      <div className="recovery-cards-grid">
        {strategies.map(strat => {
          const isRecommended = strat.id === (recommendedStrategyId || 'reroute');

          return (
            <div
              key={strat.id}
              className={`recovery-card ${isRecommended ? 'is-recommended' : ''}`}
            >
              {isRecommended && (
                <div className="recommended-pill">
                  ★ RECOMMENDED
                </div>
              )}

              <div className="card-top-info">
                <div className="recovery-card-title">{strat.name}</div>
                <div className="recovery-card-badge">{strat.badge}</div>
                <div className="recovery-card-desc">{strat.description}</div>
              </div>

              {/* Trade-off Matrix */}
              <div className="metrics-table">
                <div className="metric-row">
                  <span className="metric-name">Expected Downtime</span>
                  <span className="metric-val">{strat.expectedDowntime}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Success Probability</span>
                  <span className="metric-val" style={{ color: strat.successChance >= 85 ? '#34d399' : '#fbbf24' }}>
                    {strat.successChance}%
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Data-Loss Risk</span>
                  <span className="metric-val" style={{ color: strat.dataLossRisk.includes('Zero') ? '#34d399' : '#f87171' }}>
                    {strat.dataLossRisk}
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Recovery Score</span>
                  <span className={`score-badge ${strat.baseScore >= 80 ? 'score-high' : 'score-mid'}`}>
                    {strat.baseScore} / 100
                  </span>
                </div>
              </div>

              {/* Recommendation Reason Box */}
              {isRecommended && recommendationReason && (
                <div className="recommendation-reason-box">
                  <strong>WHY THIS STRATEGY:</strong> {recommendationReason}
                </div>
              )}

              {/* Action Button: Disabled when no cascade active with explicit hint */}
              <button
                type="button"
                className={`btn-apply-recovery ${isRecommended && canApply ? 'primary-action' : ''}`}
                onClick={() => canApply && onApplyRecovery(strat)}
                disabled={!canApply}
                title={!isCascadeActive ? 'Inject a failure to compare recoveries' : 'Apply this recovery strategy'}
                aria-label={!isCascadeActive ? 'Inject a failure to compare recoveries' : `Apply ${strat.name}`}
                style={{
                  opacity: canApply ? 1 : 0.45,
                  cursor: canApply ? 'pointer' : 'not-allowed',
                }}
              >
                {isRecovering ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ticker-pulse">
                      <line x1="12" y1="2" x2="12" y2="6" />
                      <line x1="12" y1="18" x2="12" y2="22" />
                    </svg>
                    Executing Mitigation...
                  </>
                ) : !isCascadeActive ? (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Inject a failure to compare recoveries
                  </span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Apply Recovery
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
