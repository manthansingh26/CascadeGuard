import React from 'react';

export function ServiceGraph({
  services,
  scenarios,
  activeScenarioId,
  rootCauseId,
  onTriggerScenario,
  onInjectServiceFailure,
  onSelectService,
  selectedServiceId,
  isRecovering,
}) {
  const serviceMap = {};
  services.forEach(s => {
    serviceMap[s.id] = s;
  });

  // Collect all dependency edges: caller -> callee
  const edges = [];
  services.forEach(src => {
    src.dependsOn.forEach(targetId => {
      const tgt = serviceMap[targetId];
      if (tgt) {
        edges.push({
          id: `${src.id}->${targetId}`,
          from: src,
          to: tgt,
          isCascadeActive: src.status === 'failing' || src.status === 'at-risk' || tgt.status === 'failing' || tgt.status === 'at-risk',
          isRecoveringActive: isRecovering || src.status === 'recovering' || tgt.status === 'recovering',
        });
      }
    });
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'failing': return '#ef4444';
      case 'at-risk': return '#f59e0b';
      case 'recovering': return '#06b6d4';
      case 'healthy':
      default:
        return '#10b981';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'failing': return 'FAILING';
      case 'at-risk': return 'AT-RISK';
      case 'recovering': return 'RECOVERING';
      case 'healthy':
      default:
        return 'HEALTHY';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="2" width="6" height="6" rx="1" />
              <rect x="16" y="2" width="6" height="6" rx="1" />
              <rect x="9" y="16" width="6" height="6" rx="1" />
              <path d="M5 8v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
              <path d="M12 14v2" />
            </svg>
            Live Service Dependency Graph
          </span>
          <span className="card-subtitle">8 Services • Real-time Health &amp; Risk Propagation</span>
        </div>
      </div>

      {/* Quick Scenario Injection Toolbar */}
      <div className="scenarios-toolbar">
        <div className="scenarios-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Inject Failure Scenario:
        </div>
        <div className="scenario-buttons-group">
          {Object.values(scenarios).map(sc => {
            const isActive = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                className={`scenario-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTriggerScenario(sc.id)}
                title={sc.description}
                aria-label={`Trigger scenario: ${sc.title}`}
              >
                <span>⚡</span>
                {sc.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="service-graph-wrapper">
        {/* Comprehensive Graph Legend */}
        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-dot green" />
            <span>Healthy (&lt; 35%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot amber" />
            <span>At-Risk (35 - 69%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot red" />
            <span>Failing (≥ 70%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot cyan" />
            <span>Recovering</span>
          </div>
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
          <div className="legend-item">
            <span style={{ width: 14, height: 2, background: 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
            <span>Solid arrow: depends on</span>
          </div>
          <div className="legend-item">
            <span style={{ width: 14, height: 2, borderTop: '2px dashed #ef4444', display: 'inline-block' }} />
            <span>Dashed red: cascade travel</span>
          </div>
        </div>

        <svg viewBox="0 0 920 570" className="graph-svg">
          <defs>
            {/* Arrowhead marker for normal dependency links */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="14"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(255, 255, 255, 0.45)" />
            </marker>

            {/* Arrowhead marker for cascading failure links */}
            <marker
              id="arrow-cascade"
              viewBox="0 0 10 10"
              refX="14"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
            </marker>

            {/* Arrowhead marker for recovering links */}
            <marker
              id="arrow-recovering"
              viewBox="0 0 10 10"
              refX="14"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#06b6d4" />
            </marker>
          </defs>

          {/* Layer 1: Edges rendered BEHIND nodes */}
          <g className="edges-layer">
            {edges.map(edge => {
              const startX = edge.from.x;
              const startY = edge.from.y + 49;
              const endX = edge.to.x;
              const endY = edge.to.y - 49;

              // Smooth cubic Bezier curve
              const midY = (startY + endY) / 2;
              const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

              let marker = 'url(#arrow-default)';
              let linkClass = 'dep-link';

              if (edge.isRecoveringActive) {
                marker = 'url(#arrow-recovering)';
                linkClass += ' recovering-active';
              } else if (edge.isCascadeActive) {
                marker = 'url(#arrow-cascade)';
                linkClass += ' cascade-active';
              }

              return (
                <path
                  key={edge.id}
                  d={pathD}
                  className={linkClass}
                  markerEnd={marker}
                />
              );
            })}
          </g>

          {/* Layer 2: Render 8 Service Nodes with Solid Backgrounds */}
          <g className="nodes-layer">
            {services.map(s => {
              const nodeW = 180;
              const nodeH = 98;
              const cornerX = s.x - nodeW / 2;
              const cornerY = s.y - nodeH / 2;
              const statusColor = getStatusColor(s.status);
              const statusLabel = getStatusLabel(s.status);
              const isSelected = selectedServiceId === s.id;
              const isRoot = Boolean(rootCauseId && s.id === rootCauseId);
              const isCascadeFailing = !isRoot && s.status === 'failing';
              const isCascadeAtRisk = !isRoot && s.status === 'at-risk';
              const isRecoveringNode = s.status === 'recovering';

              return (
                <g
                  key={s.id}
                  className="node-group"
                  onClick={() => onSelectService(s.id)}
                >
                  {/* Solid Opaque Node Box */}
                  <rect
                    x={cornerX}
                    y={cornerY}
                    width={nodeW}
                    height={nodeH}
                    className={`node-box ${s.status} ${isRoot ? 'root-cause' : ''}`}
                    style={{
                      fill: '#0e1628',
                      stroke: isSelected ? '#ffffff' : undefined,
                      strokeWidth: isSelected ? 2.5 : undefined,
                    }}
                  />

                  {/* Left vertical health status strip */}
                  <rect
                    x={cornerX}
                    y={cornerY}
                    width={4}
                    height={nodeH}
                    rx="2"
                    fill={statusColor}
                  />

                  {/* Badge above card: Single ROOT CAUSE vs CASCADE vs AFFECTED */}
                  {isRoot && (
                    <g>
                      <rect
                        x={cornerX + 10}
                        y={cornerY - 11}
                        width={86}
                        height={16}
                        rx="3"
                        fill="#ef4444"
                      />
                      <text
                        x={cornerX + 53}
                        y={cornerY + 1}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="var(--font-mono)"
                      >
                        ROOT CAUSE
                      </text>
                    </g>
                  )}

                  {isCascadeFailing && (
                    <g>
                      <rect
                        x={cornerX + 10}
                        y={cornerY - 11}
                        width={68}
                        height={16}
                        rx="3"
                        fill="#dc2626"
                      />
                      <text
                        x={cornerX + 44}
                        y={cornerY + 1}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="var(--font-mono)"
                      >
                        CASCADE
                      </text>
                    </g>
                  )}

                  {isCascadeAtRisk && (
                    <g>
                      <rect
                        x={cornerX + 10}
                        y={cornerY - 11}
                        width={72}
                        height={16}
                        rx="3"
                        fill="#d97706"
                      />
                      <text
                        x={cornerX + 46}
                        y={cornerY + 1}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="var(--font-mono)"
                      >
                        AFFECTED
                      </text>
                    </g>
                  )}

                  {isRecoveringNode && (
                    <g>
                      <rect
                        x={cornerX + 10}
                        y={cornerY - 11}
                        width={82}
                        height={16}
                        rx="3"
                        fill="#0891b2"
                      />
                      <text
                        x={cornerX + 51}
                        y={cornerY + 1}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="var(--font-mono)"
                      >
                        RECOVERING
                      </text>
                    </g>
                  )}

                  {/* Row 1: Service Name & Risk Score Badge */}
                  <text
                    x={cornerX + 12}
                    y={cornerY + 20}
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="var(--font-sans)"
                  >
                    {s.name}
                  </text>

                  {/* Risk Badge on Top Right */}
                  <rect
                    x={cornerX + nodeW - 46}
                    y={cornerY + 8}
                    width={36}
                    height={18}
                    rx="4"
                    fill={
                      s.status === 'failing' ? 'rgba(239, 68, 68, 0.25)' :
                      s.status === 'at-risk' ? 'rgba(245, 158, 11, 0.25)' :
                      s.status === 'recovering' ? 'rgba(6, 182, 212, 0.25)' :
                      'rgba(16, 185, 129, 0.18)'
                    }
                    stroke={statusColor}
                    strokeWidth="1"
                  />
                  <text
                    x={cornerX + nodeW - 28}
                    y={cornerY + 21}
                    textAnchor="middle"
                    fill={statusColor}
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {s.risk}%
                  </text>

                  {/* Row 2: Tier Subtitle (Left) & Explicit Health Label (Right) */}
                  <text
                    x={cornerX + 12}
                    y={cornerY + 34}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {s.tier}
                  </text>
                  <text
                    x={cornerX + nodeW - 12}
                    y={cornerY + 34}
                    textAnchor="end"
                    fill={statusColor}
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    {statusLabel}
                  </text>

                  {/* Row 3: Dedicated Clean Metrics Line (Never Overlapped) */}
                  <text
                    x={cornerX + 12}
                    y={cornerY + 52}
                    fill="#cbd5e1"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    {s.latency}ms • {s.errorRate}% err • {s.cpu}% cpu
                  </text>

                  {/* Row 4: Dedicated Full-Width Inject Fail Button */}
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`Inject failure on ${s.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInjectServiceFailure(s.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onInjectServiceFailure(s.id);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={cornerX + 10}
                      y={cornerY + 64}
                      width={nodeW - 20}
                      height={24}
                      rx="4"
                      fill="rgba(239, 68, 68, 0.18)"
                      stroke="rgba(239, 68, 68, 0.55)"
                      strokeWidth="1"
                    />
                    <text
                      x={cornerX + nodeW / 2}
                      y={cornerY + 79}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      ⚡ INJECT FAIL
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
