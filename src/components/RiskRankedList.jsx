import React from 'react';

export function RiskRankedList({
  services,
  onInjectServiceFailure,
  onSelectService,
}) {
  // Sort descending by risk score
  const sorted = [...services].sort((a, b) => b.risk - a.risk);

  const getStatusClass = (status) => {
    switch (status) {
      case 'failing': return 'red';
      case 'at-risk': return 'amber';
      case 'recovering': return 'cyan';
      case 'healthy':
      default:
        return 'green';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Most Likely to Fail Next (Risk Ranking)
          </span>
          <span className="card-subtitle">Predictive Priority Queue</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="risk-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Service</th>
              <th>Risk Score</th>
              <th>Latency / SLA</th>
              <th>Error Rate</th>
              <th>CPU Load</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, index) => {
              const statusClass = getStatusClass(s.status);
              const isFailing = s.status === 'failing';
              const isRoot = s.isRootCause;

              return (
                <tr
                  key={s.id}
                  onClick={() => onSelectService(s.id)}
                  style={{
                    background: isRoot ? 'rgba(239, 68, 68, 0.08)' : undefined,
                    cursor: 'pointer',
                  }}
                  title="Click to view dependencies & callers"
                >
                  <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                    #{index + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {s.name}
                      {isRoot && (
                        <span style={{
                          marginLeft: 6,
                          fontSize: '0.65rem',
                          background: '#ef4444',
                          color: '#fff',
                          padding: '1px 4px',
                          borderRadius: 3,
                        }}>
                          ROOT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {s.tier}
                    </div>
                  </td>
                  <td>
                    <span className={`risk-pill ${statusClass}`}>
                      {s.risk}% {s.risk >= 70 ? 'CRIT' : s.risk >= 35 ? 'WARN' : 'NOMINAL'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: s.latency > s.slaLatencyMs ? '#fca5a5' : '#cbd5e1' }}>
                      {s.latency}ms
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginLeft: 4 }}>
                      / {s.slaLatencyMs}ms
                    </span>
                  </td>
                  <td style={{ color: s.errorRate > 5 ? '#fca5a5' : '#cbd5e1' }}>
                    {s.errorRate}%
                  </td>
                  <td style={{ color: s.cpu > 80 ? '#fca5a5' : '#cbd5e1' }}>
                    {s.cpu}%
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-table-inject"
                      onClick={() => onInjectServiceFailure(s.id)}
                      title={`Inject failure into ${s.name}`}
                    >
                      {isFailing ? 'Re-Spike' : 'Inject Fail'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
