import React, { useState, useEffect, useRef } from 'react';

export function LogFeed({ logs }) {
  const [filter, setFilter] = useState('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'CRIT') return log.level === 'CRIT';
    if (filter === 'WARN') return log.level === 'WARN';
    if (filter === 'HEAL') return log.level === 'HEAL';
    return true;
  });

  return (
    <div className="dashboard-card log-feed-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Live Server Telemetry Feed
          </span>
          <span className="card-subtitle">{logs.length} events logged</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="log-filters-bar">
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            ALL
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'CRIT' ? 'active' : ''}`}
            onClick={() => setFilter('CRIT')}
          >
            CRIT
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'WARN' ? 'active' : ''}`}
            onClick={() => setFilter('WARN')}
          >
            WARN
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'HEAL' ? 'active' : ''}`}
            onClick={() => setFilter('HEAL')}
          >
            HEAL
          </button>
        </div>

        <button
          type="button"
          className="filter-pill"
          onClick={() => setAutoScroll(!autoScroll)}
          style={{ opacity: autoScroll ? 1 : 0.6 }}
        >
          {autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: PAUSED'}
        </button>
      </div>

      {/* Scrolling Monospace Terminal */}
      <div className="log-scroll-area" ref={scrollRef}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
            No logs matching filter {filter}.
          </div>
        ) : (
          filteredLogs.map(log => {
            const isCrit = log.level === 'CRIT';
            const isWarn = log.level === 'WARN';
            const isHeal = log.level === 'HEAL';

            return (
              <div
                key={log.id}
                className={`log-line ${isCrit ? 'is-crit' : isWarn ? 'is-warn' : isHeal ? 'is-heal' : ''}`}
              >
                <span className="log-time">{log.timestamp}</span>
                <span className={`log-badge badge-${log.level}`}>{log.level}</span>
                <span className="log-srv">[{log.service}]</span>
                <span className="log-msg">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
