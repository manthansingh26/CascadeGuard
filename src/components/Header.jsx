import React from 'react';

export function Header({
  tickCount,
  elapsedSec,
  isPlaying,
  onTogglePlay,
  onReset,
  onOpenFormula,
  onOpenDemo,
  hasActiveIncident,
}) {
  return (
    <>
      {/* Track & Simulation Indicator Banner */}
      <div className="top-track-banner">
        <div className="track-badge-left">
          <span className="sim-pill">
            <span className="sim-pill-dot" />
            SIMULATED DATA
          </span>
          <span>Track 01 | Software &amp; AI | Orcathon</span>
        </div>
        <div className="banner-right-meta">
          <span className="deploy-ready-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Vercel Ready • ₹0 Cost • In-Browser Model
          </span>
          <span>TICK: every 2.0s</span>
        </div>
      </div>

      {/* Main Operations Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="brand-title-wrap">
            <h1>
              CascadeGuard
              {hasActiveIncident && (
                <span className="sim-pill" style={{ fontSize: '0.65rem' }}>
                  CASCADE ACTIVE
                </span>
              )}
            </h1>
            <div className="brand-sub">Cascading Failure Predictor &amp; Automated Recovery Engine</div>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="header-center-controls">
          <div className="ticker-indicator">
            <span className={`ticker-pulse ${!isPlaying ? 'paused' : ''}`} />
            <span>Tick #{tickCount}</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span>{Math.floor(elapsedSec / 60).toString().padStart(2, '0')}:{(elapsedSec % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            type="button"
            className={`ctrl-btn ${isPlaying ? 'active' : ''}`}
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Simulation Ticks' : 'Resume Simulation Ticks'}
          >
            {isPlaying ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </>
            )}
          </button>

          <button
            type="button"
            className="ctrl-btn ctrl-btn-danger"
            onClick={onReset}
            title="Reset topology to healthy baseline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="header-right-actions">
          <button
            type="button"
            className="btn-formula"
            onClick={onOpenFormula}
            title="View heuristic prediction formula"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: -1 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            How Risk Is Calculated
          </button>

          <button
            type="button"
            className="btn-demo-script"
            onClick={onOpenDemo}
            title="Open 60-Second Presentation Demo Guide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            60s Demo Script
          </button>
        </div>
      </header>
    </>
  );
}
