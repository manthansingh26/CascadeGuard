// Deterministic Cascade Engine & Risk Prediction Logic
// CascadeGuard | Orcathon Track 01

/**
 * Calculates deterministic risk score (0-100) for a service.
 * Formula:
 * Own Risk = (Error Rate * 0.45) + (Normalized Latency * 0.35) + (CPU * 0.15)
 * Dependency Drag = (Max Dep Risk * 0.35) + (Avg Dep Risk * 0.15)
 * Total = min(100, round(Own Risk * 0.65 + Dependency Drag * 0.35))
 */
export function calculateServiceRisk(service, servicesMap) {
  // Direct error rate impact (0 - 45 pts)
  const errorScore = Math.min((service.errorRate || 0) * 0.5, 45);

  // Latency impact normalized against SLA (0 - 35 pts)
  const sla = service.slaLatencyMs || 150;
  const latencyScore = Math.min(((service.latency || 0) / sla) * 18, 35);

  // CPU saturation impact (0 - 20 pts)
  const cpuScore = Math.min(((service.cpu || 0) / 100) * 20, 20);

  const ownRisk = errorScore + latencyScore + cpuScore;

  // Propagated drag from downstream dependencies
  let depDrag = 0;
  const deps = service.dependsOn || [];
  if (deps.length > 0) {
    const depRisks = deps.map(depId => servicesMap[depId]?.risk || 0);
    const maxDep = Math.max(...depRisks, 0);
    const avgDep = depRisks.reduce((acc, curr) => acc + curr, 0) / depRisks.length;
    depDrag = (maxDep * 0.35) + (avgDep * 0.15);
  }

  const combined = Math.round(ownRisk * 0.65 + depDrag * 0.35);
  return Math.min(100, Math.max(0, combined));
}

export function determineStatus(risk, isRecovering = false) {
  if (isRecovering) return 'recovering';
  if (risk >= 70) return 'failing';
  if (risk >= 35) return 'at-risk';
  return 'healthy';
}

/**
 * Propagate failure through dependency graph for one simulation tick
 */
export function propagateCascadeTick(currentServices, rootCauseId, _tickCount) {
  const servicesMap = {};
  currentServices.forEach(s => {
    servicesMap[s.id] = { ...s };
  });

  const rootService = servicesMap[rootCauseId];
  if (!rootService) return currentServices;

  // Identify who depends on what (inverted graph: callee -> callers)
  const callersMap = {};
  currentServices.forEach(s => {
    s.dependsOn.forEach(depId => {
      if (!callersMap[depId]) callersMap[depId] = [];
      callersMap[depId].push(s.id);
    });
  });

  // Calculate upstream impact:
  // Root cause worsens slightly if unmitigated
  rootService.latency = Math.min(4200, Math.round(rootService.latency * 1.05 + 40));
  rootService.errorRate = Math.min(99.4, +(rootService.errorRate * 1.02 + 1.2).toFixed(1));
  rootService.cpu = Math.min(100, Math.round(rootService.cpu + 1));
  rootService.risk = calculateServiceRisk(rootService, servicesMap);
  rootService.status = determineStatus(rootService.risk);

  // Hop 1: Direct callers of root cause
  const hop1Callers = callersMap[rootCauseId] || [];
  hop1Callers.forEach(callerId => {
    const s = servicesMap[callerId];
    if (s && s.status !== 'recovering') {
      s.latency = Math.min(2800, Math.round(s.latency * 1.2 + 65));
      s.errorRate = Math.min(88, +(s.errorRate * 1.25 + 4.5).toFixed(1));
      s.cpu = Math.min(98, Math.round(s.cpu * 1.15 + 5));
      s.risk = calculateServiceRisk(s, servicesMap);
      s.status = determineStatus(s.risk);
    }
  });

  // Hop 2: Callers of Hop 1 callers (e.g. Gateway depending on Orders/Auth)
  hop1Callers.forEach(hop1Id => {
    const hop2Callers = callersMap[hop1Id] || [];
    hop2Callers.forEach(callerId => {
      const s = servicesMap[callerId];
      if (s && s.status !== 'recovering') {
        s.latency = Math.min(2200, Math.round(s.latency * 1.18 + 45));
        s.errorRate = Math.min(76, +(s.errorRate * 1.2 + 3.2).toFixed(1));
        s.cpu = Math.min(95, Math.round(s.cpu * 1.1 + 4));
        s.risk = calculateServiceRisk(s, servicesMap);
        s.status = determineStatus(s.risk);
      }
    });
  });

  // Recalculate remaining services' risk
  return currentServices.map(s => {
    const updated = servicesMap[s.id];
    updated.risk = calculateServiceRisk(updated, servicesMap);
    updated.status = determineStatus(updated.risk);
    return updated;
  });
}

/**
 * Natural noise fluctuation for healthy simulation
 */
export function simulateNormalTick(currentServices) {
  const map = {};
  currentServices.forEach(s => { map[s.id] = { ...s }; });

  return currentServices.map(s => {
    const base = s.baseMetrics;
    // Subtle realistic jitter (+/- 5%)
    const jitter = (Math.random() - 0.48) * 0.1;
    const latency = Math.max(2, Math.round(base.latency * (1 + jitter)));
    const errorRate = Math.max(0, +(base.errorRate + (Math.random() * 0.08 - 0.04)).toFixed(2));
    const cpu = Math.max(10, Math.min(65, Math.round(base.cpu + (Math.random() * 6 - 3))));

    const updated = {
      ...s,
      latency,
      errorRate,
      cpu,
    };
    updated.risk = calculateServiceRisk(updated, map);
    updated.status = 'healthy';
    return updated;
  });
}

/**
 * Step recovery tick towards healthy baselines
 */
export function simulateRecoveryTick(currentServices) {
  const map = {};
  currentServices.forEach(s => { map[s.id] = { ...s }; });

  let allFullyHealed = true;

  const healed = currentServices.map(s => {
    const base = s.baseMetrics;
    const latencyDiff = s.latency - base.latency;
    const errorDiff = s.errorRate - base.errorRate;
    const cpuDiff = s.cpu - base.cpu;

    // Fast convergence (40% decay per tick)
    const newLatency = Math.round(s.latency - latencyDiff * 0.45);
    const newError = +(s.errorRate - errorDiff * 0.5).toFixed(2);
    const newCpu = Math.round(s.cpu - cpuDiff * 0.45);

    const isClose = Math.abs(latencyDiff) < 15 && Math.abs(errorDiff) < 1 && Math.abs(cpuDiff) < 8;
    if (!isClose) allFullyHealed = false;

    const updated = {
      ...s,
      latency: Math.max(base.latency, newLatency),
      errorRate: Math.max(base.errorRate, newError),
      cpu: Math.max(base.cpu, newCpu),
      isRootCause: false,
    };
    updated.risk = calculateServiceRisk(updated, map);
    updated.status = updated.risk < 35 ? 'healthy' : 'recovering';
    return updated;
  });

  return { healedServices: healed, isDone: allFullyHealed };
}

/**
 * Generate context-aware log lines
 */
export function generateLogEntries(services, rootCauseId, isRecovering) {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
  const logs = [];

  if (isRecovering) {
    logs.push({
      id: Math.random().toString(36).slice(2, 9),
      timestamp: timeStr,
      service: 'CascadeGuard-Orchestrator',
      level: 'HEAL',
      message: 'Active mitigation in flight: flushing connection queues & scaling replicas.',
    });
  }

  services.forEach(s => {
    if (s.isRootCause) {
      logs.push({
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr,
        service: s.shortName,
        level: 'CRIT',
        message: `[ROOT CAUSE] Severe degradation: latency=${s.latency}ms, err=${s.errorRate}%, cpu=${s.cpu}%. Pool exhausted!`,
      });
    } else if (s.status === 'failing') {
      logs.push({
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr,
        service: s.shortName,
        level: 'CRIT',
        message: `Cascading timeout: ${s.latency}ms > SLA ${s.slaLatencyMs}ms (err=${s.errorRate}%). Thread pool starved.`,
      });
    } else if (s.status === 'at-risk') {
      logs.push({
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr,
        service: s.shortName,
        level: 'WARN',
        message: `Upstream drag detected: latency elevated to ${s.latency}ms, error rate rising (${s.errorRate}%).`,
      });
    } else {
      // Occasional healthy log (keep feed informative without flooding)
      if (Math.random() > 0.6) {
        const healthySamples = [
          `Heartbeat OK (latency ${s.latency}ms, p99 within SLA)`,
          `Processed 1,240 req/s with 0 dropped frames`,
          `Connection pool healthy (cpu: ${s.cpu}%, err: ${s.errorRate}%)`,
        ];
        const msg = healthySamples[Math.floor(Math.random() * healthySamples.length)];
        logs.push({
          id: Math.random().toString(36).slice(2, 9),
          timestamp: timeStr,
          service: s.shortName,
          level: 'INFO',
          message: msg,
        });
      }
    }
  });

  return logs;
}
