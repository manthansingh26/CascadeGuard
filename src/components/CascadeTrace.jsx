import React from 'react';

export function CascadeTrace({
  services,
  rootCauseService,
  cascadeSteps,
  timeToCrashSec,
  hasActiveIncident,
  isRecovering,
}) {
  const totalServices = services.length;
  const affectedServices = services.filter(s => s.status === 'at-risk' || s.status === 'failing');
  const affectedCount = affectedServices.length;
  const blastPercent = Math.round((affectedCount / totalServices) * 100);

  const formatTimer = (sec) => {
    if (sec <= 0) return '00:00 (TOTAL SYSTEM HALT)';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="dashboard-card cascade-trace-card">
      <div className="card-header" style={{ margin: '-16px -16px 14px -16px' }}>
        <div className="card-title-group">
          <span className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Cascade Analysis &amp; Blast Radius
          </span>
          <span className="card-subtitle">AI-Traced Propagation Path</span>
        </div>
      </div>

      {/* Blast Radius Box */}
      <div className="blast-radius-box">
        <div className="blast-header">
          <span className="blast-title">Blast Radius</span>
          <span className="blast-counter">
            {affectedCount} of {totalServices} Services Affected ({blastPercent}%)
          </span>
        </div>
        <div className="blast-progress-track">
          <div
            className="blast-progress-bar"
            style={{ width: `${blastPercent}%` }}
          />
        </div>

        {/* Time to Crash Countdown */}
        {hasActiveIncident && !isRecovering && (
          <div className="countdown-box">
            <div className="countdown-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6, verticalAlign: -2 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Estimated Time to Total Outage:
            </div>
            <div className="countdown-timer">
              {formatTimer(timeToCrashSec)}
            </div>
          </div>
        )}

        {isRecovering && (
          <div className="countdown-box" style={{ background: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <div className="countdown-label" style={{ color: '#67e8f9' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6, verticalAlign: -2 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Mitigation Protocol Engaged:
            </div>
            <div className="countdown-timer" style={{ color: '#06b6d4' }}>
              HEALING CLUSTER...
            </div>
          </div>
        )}

        {!hasActiveIncident && !isRecovering && (
          <div className="countdown-box" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div className="countdown-label" style={{ color: '#6ee7b7' }}>
              System Equilibrium:
            </div>
            <div className="countdown-timer" style={{ color: '#10b981', animation: 'none' }}>
              ALL SYSTEMS OPTIMAL
            </div>
          </div>
        )}
      </div>

      {/* Root Cause Callout */}
      {rootCauseService && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: '#ef4444', fontWeight: 800 }}>[ORIGIN IDENTIFIED]</span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>{rootCauseService.name}</span>
          <span style={{ color: '#fca5a5' }}>(Initial trigger)</span>
        </div>
      )}

      {/* Sequential Propagation Timeline */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
        Propagation Timeline:
      </div>
      <div className="timeline-steps">
        {cascadeSteps.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', padding: '10px 0' }}>
            No cascade events recorded. All service SLAs within nominal boundaries.
          </div>
        ) : (
          cascadeSteps.map((step, idx) => {
            const isRoot = step.type === 'ROOT';
            const isHeal = step.type === 'HEAL';
            return (
              <div
                key={step.id || idx}
                className={`trace-step-item ${isRoot ? 'root-cause-step' : ''} ${isHeal ? 'healed-step' : 'cascade-hop-step'}`}
              >
                <div className="step-time">{step.timestamp}</div>
                <div className="step-content">
                  <span className={`step-tag ${isRoot ? 'tag-root' : isHeal ? 'tag-heal' : 'tag-hop'}`}>
                    {step.type}
                  </span>
                  <strong>{step.serviceName}</strong>: {step.detail}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
