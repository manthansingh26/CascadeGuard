import React from 'react';

export function ServiceDetailModal({
  service,
  allServices,
  isOpen,
  onClose,
  onInjectServiceFailure,
}) {
  if (!isOpen || !service) return null;

  const serviceMap = {};
  allServices.forEach(s => { serviceMap[s.id] = s; });

  // Downstream dependencies (who this service calls)
  const downstream = (service.dependsOn || []).map(id => serviceMap[id]).filter(Boolean);

  // Upstream callers (who calls this service)
  const upstream = allServices.filter(s => (s.dependsOn || []).includes(service.id));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div>
            <h3>{service.name}</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {service.tier} • ID: {service.id}
            </span>
          </div>
          <button
            type="button"
            className="btn-close-pm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 14 }}>
            {service.description}
          </p>

          {/* Current Live Metrics */}
          <div className="metrics-table" style={{ marginBottom: 14 }}>
            <div className="metric-row">
              <span className="metric-name">Current Health Status</span>
              <span className="metric-val" style={{
                color: service.status === 'failing' ? '#ef4444' : service.status === 'at-risk' ? '#f59e0b' : '#10b981',
                textTransform: 'uppercase',
              }}>
                {service.status} ({service.risk}% Risk)
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Average Latency / SLA Target</span>
              <span className="metric-val">{service.latency}ms / {service.slaLatencyMs}ms</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">HTTP Error Rate (4xx / 5xx)</span>
              <span className="metric-val">{service.errorRate}%</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Container CPU Saturation</span>
              <span className="metric-val">{service.cpu}%</span>
            </div>
          </div>

          {/* Topology Connections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ fontSize: '0.75rem', color: '#c7d2fe', display: 'block', marginBottom: 6 }}>
                Depends On (Calls &rarr;)
              </strong>
              {downstream.length === 0 ? (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Leaf service (no dependencies)</span>
              ) : (
                downstream.map(dep => (
                  <div key={dep.id} style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: dep.status === 'failing' ? '#ef4444' : dep.status === 'at-risk' ? '#f59e0b' : '#10b981',
                    }} />
                    {dep.name}
                  </div>
                ))
              )}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ fontSize: '0.75rem', color: '#c7d2fe', display: 'block', marginBottom: 6 }}>
                Called By (&larr; Ingress)
              </strong>
              {upstream.length === 0 ? (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top edge service</span>
              ) : (
                upstream.map(caller => (
                  <div key={caller.id} style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: caller.status === 'failing' ? '#ef4444' : caller.status === 'at-risk' ? '#f59e0b' : '#10b981',
                    }} />
                    {caller.name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            className="btn-apply-recovery"
            onClick={() => {
              onInjectServiceFailure(service.id);
              onClose();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderColor: '#ef4444',
              color: '#fca5a5',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Inject Failure Into {service.name}
          </button>
        </div>
      </div>
    </div>
  );
}
