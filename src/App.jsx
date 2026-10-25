import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SERVICES,
  FAILURE_SCENARIOS,
  RECOVERY_STRATEGIES,
} from './data/topology';
import {
  calculateServiceRisk,
  propagateCascadeTick,
  simulateNormalTick,
  simulateRecoveryTick,
  generateLogEntries,
  determineStatus,
} from './utils/cascadeEngine';

import { Header } from './components/Header';
import { ServiceGraph } from './components/ServiceGraph';
import { CascadeTrace } from './components/CascadeTrace';
import { RecoveryComparison } from './components/RecoveryComparison';
import { LogFeed } from './components/LogFeed';
import { RiskRankedList } from './components/RiskRankedList';
import { RiskFormulaModal } from './components/RiskFormulaModal';
import { DemoScriptModal } from './components/DemoScriptModal';
import { ServiceDetailModal } from './components/ServiceDetailModal';

// Initialize services with computed risk and healthy baseline
function createInitialServices() {
  const map = {};
  SERVICES.forEach(s => {
    map[s.id] = {
      ...s,
      latency: s.baseMetrics.latency,
      errorRate: s.baseMetrics.errorRate,
      cpu: s.baseMetrics.cpu,
      isRootCause: false,
      status: 'healthy',
      risk: 0,
    };
  });

  return SERVICES.map(s => {
    const item = map[s.id];
    item.risk = calculateServiceRisk(item, map);
    item.status = determineStatus(item.risk);
    return item;
  });
}

export function App() {
  const [services, setServices] = useState(createInitialServices);
  const [tickCount, setTickCount] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Failure & Cascade state
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [rootCauseId, setRootCauseId] = useState(null);
  const [timeToCrashSec, setTimeToCrashSec] = useState(0);
  const [cascadeSteps, setCascadeSteps] = useState([]);
  const [incidentStartTime, setIncidentStartTime] = useState(null);

  // Recovery state
  const [isRecovering, setIsRecovering] = useState(false);
  const [activeRecoveryStrategy, setActiveRecoveryStrategy] = useState(null);
  const [postMortem, setPostMortem] = useState(null);

  // Modals & Inspection
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Logs stream
  const [logs, setLogs] = useState(() => [
    {
      id: 'init-1',
      timestamp: '11:54:02.10',
      service: 'GATEWAY',
      level: 'INFO',
      message: 'Ingress router initialized. 8 downstream services mapped.',
    },
    {
      id: 'init-2',
      timestamp: '11:54:02.45',
      service: 'DATABASE',
      level: 'INFO',
      message: 'Postgres connection pool warm (max_connections: 120, active: 14).',
    },
    {
      id: 'init-3',
      timestamp: '11:54:03.01',
      service: 'CACHE',
      level: 'INFO',
      message: 'Redis cluster healthy. Memory usage 21.4MB / 4096MB.',
    },
  ]);

  const hasActiveIncident = Boolean(rootCauseId || activeScenarioId);

  // Ref to hold latest state for simulation ticks
  const stateRef = useRef({
    services,
    rootCauseId,
    activeScenarioId,
    isRecovering,
    activeRecoveryStrategy,
    timeToCrashSec,
    incidentStartTime,
    cascadeSteps,
    tickCount,
  });

  useEffect(() => {
    stateRef.current = {
      services,
      rootCauseId,
      activeScenarioId,
      isRecovering,
      activeRecoveryStrategy,
      timeToCrashSec,
      incidentStartTime,
      cascadeSteps,
      tickCount,
    };
  }, [services, rootCauseId, activeScenarioId, isRecovering, activeRecoveryStrategy, timeToCrashSec, incidentStartTime, cascadeSteps, tickCount]);

  // Inject failure scenario
  const handleTriggerScenario = useCallback((scenarioKey) => {
    const scenario = FAILURE_SCENARIOS[scenarioKey];
    if (!scenario) return;

    const rootId = scenario.rootCauseId;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setActiveScenarioId(scenarioKey);
    setRootCauseId(rootId);
    setTimeToCrashSec(scenario.timeToCrashSec);
    setIsRecovering(false);
    setIncidentStartTime(Date.now());
    setPostMortem(null);

    setServices(prev => {
      const map = {};
      prev.forEach(s => { map[s.id] = { ...s }; });

      const target = map[rootId];
      if (target) {
        const impact = scenario.initialImpact[rootId] || {};
        target.latency = impact.latency || 2800;
        target.errorRate = impact.errorRate || 85;
        target.cpu = impact.cpu || 95;
        target.isRootCause = true;
        target.risk = calculateServiceRisk(target, map);
        target.status = 'failing';
      }

      return prev.map(s => map[s.id]);
    });

    // Add root step to cascade timeline
    setCascadeSteps([
      {
        id: `step-${Date.now()}`,
        timestamp: `${timeStr} (T+0s)`,
        type: 'ROOT',
        serviceName: scenario.title,
        detail: `Root failure triggered on ${rootId.toUpperCase()}. ${scenario.subtitle}`,
      },
    ]);

    // Append log
    setLogs(prev => [
      ...prev.slice(-150),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: 'CHAOS-ENG',
        level: 'CRIT',
        message: `Scenario '${scenario.title}' injected! Root cause: ${rootId.toUpperCase()}.`,
      },
    ]);
  }, []);

  // Inject manual failure into any single service
  const handleInjectServiceFailure = useCallback((serviceId) => {
    const s = services.find(item => item.id === serviceId);
    if (!s) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setActiveScenarioId('custom_failure');
    setRootCauseId(serviceId);
    setTimeToCrashSec(30);
    setIsRecovering(false);
    setIncidentStartTime(Date.now());
    setPostMortem(null);

    setServices(prev => {
      const map = {};
      prev.forEach(item => { map[item.id] = { ...item }; });

      const target = map[serviceId];
      if (target) {
        target.latency = Math.max(2500, target.slaLatencyMs * 8);
        target.errorRate = 92;
        target.cpu = 96;
        target.isRootCause = true;
        target.risk = calculateServiceRisk(target, map);
        target.status = 'failing';
      }

      return prev.map(item => map[item.id]);
    });

    setCascadeSteps([
      {
        id: `step-${Date.now()}`,
        timestamp: `${timeStr} (T+0s)`,
        type: 'ROOT',
        serviceName: s.name,
        detail: `Manual failure injected. Latency spiked to ${Math.max(2500, s.slaLatencyMs * 8)}ms, error rate 92%.`,
      },
    ]);

    setLogs(prev => [
      ...prev.slice(-150),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: s.shortName,
        level: 'CRIT',
        message: `[MANUAL CHAOS] Injected catastrophic outage into ${s.name}.`,
      },
    ]);
  }, [services]);

  // Apply Recovery Action
  const handleApplyRecovery = useCallback((strategy) => {
    setIsRecovering(true);
    setActiveRecoveryStrategy(strategy);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setCascadeSteps(prev => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        timestamp: `${timeStr}`,
        type: 'HEAL',
        serviceName: strategy.name,
        detail: `Recovery protocol '${strategy.name}' deployed. Isolating bad nodes and draining traffic.`,
      },
    ]);

    setLogs(prev => [
      ...prev.slice(-150),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.10',
        service: 'RECOVERY-CTRL',
        level: 'HEAL',
        message: `Triggered '${strategy.name}'. Estimated downtime: ${strategy.expectedDowntime}.`,
      },
    ]);
  }, []);

  // Apply Recommended Recovery specifically
  const handleApplyRecommendedRecovery = useCallback(() => {
    const activeScenario = FAILURE_SCENARIOS[activeScenarioId] || {};
    const recommendedId = activeScenario.recommendedStrategy || 'reroute';
    const strat = RECOVERY_STRATEGIES.find(s => s.id === recommendedId) || RECOVERY_STRATEGIES[2];
    handleApplyRecovery(strat);
  }, [activeScenarioId, handleApplyRecovery]);

  // Reset to Clean Baseline
  const handleReset = useCallback(() => {
    setServices(createInitialServices());
    setActiveScenarioId(null);
    setRootCauseId(null);
    setTimeToCrashSec(0);
    setCascadeSteps([]);
    setIsRecovering(false);
    setActiveRecoveryStrategy(null);
    setPostMortem(null);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setLogs(prev => [
      ...prev.slice(-150),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: 'SYS-ORCH',
        level: 'INFO',
        message: 'Topology reset to initial healthy baseline. All services reporting nominal SLA.',
      },
    ]);
  }, []);

  // Main 2-Second Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsedSec(sec => sec + 2);
      setTickCount(tick => tick + 1);

      const {
        services: curServices,
        rootCauseId: curRootId,
        isRecovering: curRecovering,
        timeToCrashSec: curCountdown,
        incidentStartTime: curStartTime,
        cascadeSteps: curSteps,
      } = stateRef.current;

      // Case A: System is currently recovering
      if (curRecovering) {
        const { healedServices, isDone } = simulateRecoveryTick(curServices);
        setServices(healedServices);

        if (isDone) {
          setIsRecovering(false);
          setActiveScenarioId(null);
          setRootCauseId(null);
          setTimeToCrashSec(0);

          const durationSec = curStartTime ? Math.round((Date.now() - curStartTime) / 1000) : 14;
          const affectedCount = curServices.filter(s => s.risk > 30).length || 5;

          const stratTitle = stateRef.current.activeRecoveryStrategy?.name || 'Automated Traffic Shedding';
          setPostMortem({
            message: `Crash prevented in ${durationSec}s — ${affectedCount} services saved`,
            subtext: `Mitigated via ${stratTitle}. Automated remediation successfully restored 100% SLA compliance with zero permanent data loss recorded.`,
            savedCount: affectedCount,
            durationSec,
          });

          const now = new Date();
          const timeStr = now.toTimeString().split(' ')[0];
          setCascadeSteps(steps => [
            ...steps,
            {
              id: `step-${Date.now()}`,
              timestamp: `${timeStr}`,
              type: 'HEAL',
              serviceName: 'All Services',
              detail: `Cluster health restored. P99 latency < 60ms, error rate 0.0%.`,
            },
          ]);
        }

        const newLogs = generateLogEntries(healedServices, curRootId, true);
        setLogs(prev => [...prev.slice(-180), ...newLogs]);
        return;
      }

      // Case B: Cascade incident active
      if (curRootId) {
        // Decrement countdown to crash
        if (curCountdown > 0) {
          setTimeToCrashSec(prev => Math.max(0, prev - 2));
        }

        const updated = propagateCascadeTick(curServices, curRootId, stateRef.current.tickCount);
        setServices(updated);

        // Detect newly affected services to add to timeline
        const currentlyAffected = updated.filter(s => (s.status === 'at-risk' || s.status === 'failing') && !s.isRootCause);
        const recordedIds = new Set(curSteps.map(step => step.serviceId));

        currentlyAffected.forEach(s => {
          if (!recordedIds.has(s.id)) {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const elapsedSinceIncident = curStartTime ? Math.round((Date.now() - curStartTime) / 1000) : 2;

            setCascadeSteps(steps => [
              ...steps,
              {
                id: `step-${s.id}-${Date.now()}`,
                serviceId: s.id,
                timestamp: `${timeStr} (T+${elapsedSinceIncident}s)`,
                type: 'CASCADE',
                serviceName: s.name,
                detail: `SLA breach: latency ${s.latency}ms, error rate ${s.errorRate}%. Risk at ${s.risk}%.`,
              },
            ]);
          }
        });

        const newLogs = generateLogEntries(updated, curRootId, false);
        setLogs(prev => [...prev.slice(-180), ...newLogs]);
        return;
      }

      // Case C: Normal healthy operation with natural noise
      const normalUpdated = simulateNormalTick(curServices);
      setServices(normalUpdated);

      const newLogs = generateLogEntries(normalUpdated, null, false);
      setLogs(prev => [...prev.slice(-180), ...newLogs]);

    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Active scenario details
  const activeScenario = FAILURE_SCENARIOS[activeScenarioId] || {};
  const recommendedStrategyId = activeScenario.recommendedStrategy || 'reroute';
  const recommendationReason = activeScenario.recommendationReason ||
    'Minimizes user-facing downtime (< 5s) and preserves in-flight transactions with zero data loss risk.';

  const rootCauseService = services.find(s => s.id === rootCauseId);
  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="app-container">
      {/* Header with Title, Controls, Orcathon Track Badge */}
      <Header
        tickCount={tickCount}
        elapsedSec={elapsedSec}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleReset}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        hasActiveIncident={hasActiveIncident}
      />

      {/* Post-Mortem Alert Banner when Incident is Mitigated */}
      {postMortem && (
        <div className="post-mortem-banner">
          <div className="post-mortem-content">
            <div className="pm-shield-icon">🛡️</div>
            <div className="pm-text-wrap">
              <strong>{postMortem.message}</strong>
              <span>{postMortem.subtext}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-pm"
            onClick={() => setPostMortem(null)}
            title="Dismiss Post-Mortem"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main className="main-layout">
        {/* Left Column: Service Graph & Recovery Strategy Comparison */}
        <section className="left-col">
          {/* Feature 1: Live Service Graph & Scenarios */}
          <ServiceGraph
            services={services}
            scenarios={FAILURE_SCENARIOS}
            activeScenarioId={activeScenarioId}
            onTriggerScenario={handleTriggerScenario}
            onInjectServiceFailure={handleInjectServiceFailure}
            onSelectService={id => setSelectedServiceId(id)}
            selectedServiceId={selectedServiceId}
            isRecovering={isRecovering}
          />

          {/* Feature 4: Recovery Comparison & One-Click Mitigation */}
          <RecoveryComparison
            strategies={RECOVERY_STRATEGIES}
            recommendedStrategyId={recommendedStrategyId}
            recommendationReason={recommendationReason}
            hasActiveIncident={hasActiveIncident}
            isRecovering={isRecovering}
            onApplyRecovery={handleApplyRecovery}
          />

          {/* Feature 5: Risk-Ranked Table */}
          <RiskRankedList
            services={services}
            onInjectServiceFailure={handleInjectServiceFailure}
            onSelectService={id => setSelectedServiceId(id)}
          />
        </section>

        {/* Right Column: Cascade Trace Timeline & Live Monospace Logs */}
        <section className="right-col">
          {/* Feature 3: Cascade Trace & Blast Radius */}
          <CascadeTrace
            services={services}
            rootCauseService={rootCauseService}
            cascadeSteps={cascadeSteps}
            timeToCrashSec={timeToCrashSec}
            hasActiveIncident={hasActiveIncident}
            isRecovering={isRecovering}
          />

          {/* Feature 2: Live Log Feed */}
          <LogFeed logs={logs} />
        </section>
      </main>

      {/* Modals */}
      <RiskFormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

      <DemoScriptModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onTriggerScenario={handleTriggerScenario}
        onApplyRecommendedRecovery={handleApplyRecommendedRecovery}
        onReset={handleReset}
      />

      <ServiceDetailModal
        service={selectedService}
        allServices={services}
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedServiceId(null)}
        onInjectServiceFailure={handleInjectServiceFailure}
      />
    </div>
  );
}

export default App;
