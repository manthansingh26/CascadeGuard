import React, { useEffect, useRef } from 'react';

export function LogFeed({
  logs,
  filter = 'ALL',
  onFilterChange,
}) {
  const [autoScroll, setAutoScroll] = React.useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const critCount = logs.filter(log => log.level === 'CRIT').length;
  const warnCount = logs.filter(log => log.level === 'WARN').length;
  const healCount = logs.filter(log => log.level === 'HEAL').length;
  const allCount = logs.length;

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
          <span className="card-subtitle">{allCount} events in buffer (max 200)</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="log-filters-bar">
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => onFilterChange('ALL')}
            aria-label="Filter all logs"
          >
            ALL ({allCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'CRIT' ? 'active' : ''}`}
            onClick={() => onFilterChange('CRIT')}
            aria-label="Filter critical error logs"
          >
            CRIT ({critCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'WARN' ? 'active' : ''}`}
            onClick={() => onFilterChange('WARN')}
            aria-label="Filter warning logs"
          >
            WARN ({warnCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'HEAL' ? 'active' : ''}`}
            onClick={() => onFilterChange('HEAL')}
            aria-label="Filter healing recovery logs"
          >
            HEAL ({healCount})
          </button>
        </div>

        <button
          type="button"
          className="filter-pill"
          onClick={() => setAutoScroll(!autoScroll)}
          style={{ opacity: autoScroll ? 1 : 0.6 }}
          aria-label="Toggle auto-scroll"
        >
          {autoScroll ? 'Auto-scroll: ON' : 'Auto-scroll: PAUSED'}
        </button>
      </div>

      {/* Scrolling Monospace Terminal with word-wrap and zero horizontal clipping */}
      <div className="log-scroll-area" ref={scrollRef}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '14px 4px', fontSize: '0.75rem' }}>
            No {filter} logs yet in this run ({allCount} total events recorded).
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
