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
  const [savedCountAtRecovery, setSavedCountAtRecovery] = useState(0);
  const [postMortem, setPostMortem] = useState(null);

  // Modals & Inspection
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [logFilter, setLogFilter] = useState('ALL');

  // Auto Demo (60s) State
  const [autoDemoState, setAutoDemoState] = useState(null);
  const [demoToast, setDemoToast] = useState(null);
  const autoDemoTimeoutsRef = useRef([]);

  // Logs stream (capped at 200)
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
  const blastRadius = services.filter(s => s.risk >= 35).length;

  // Ref to hold latest state for simulation ticks
  const stateRef = useRef({
    services,
    rootCauseId,
    activeScenarioId,
    isRecovering,
    activeRecoveryStrategy,
    savedCountAtRecovery,
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
      savedCountAtRecovery,
      timeToCrashSec,
      incidentStartTime,
      cascadeSteps,
      tickCount,
    };
  }, [services, rootCauseId, activeScenarioId, isRecovering, activeRecoveryStrategy, savedCountAtRecovery, timeToCrashSec, incidentStartTime, cascadeSteps, tickCount]);

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
      // Ensure ONLY rootId has isRootCause = true
      prev.forEach(s => {
        map[s.id] = { ...s, isRootCause: s.id === rootId };
      });

      const target = map[rootId];
      if (target) {
        const impact = scenario.initialImpact[rootId] || {};
        target.latency = impact.latency || 2800;
        target.errorRate = impact.errorRate || 85;
        target.cpu = impact.cpu || 95;
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

    // Append log (capped at 200 items)
    setLogs(prev => [
      ...prev.slice(-190),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: 'CHAOS-ENG',
        level: 'CRIT',
        message: `Scenario '${scenario.title}' injected! Root cause: ${rootId.toUpperCase()}.`,
      },
    ].slice(-200));
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
      // Enforce single root cause strictly
      prev.forEach(item => {
        map[item.id] = { ...item, isRootCause: item.id === serviceId };
      });

      const target = map[serviceId];
      if (target) {
        target.latency = Math.max(2500, target.slaLatencyMs * 8);
        target.errorRate = 92;
        target.cpu = 96;
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
      ...prev.slice(-190),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: s.shortName,
        level: 'CRIT',
        message: `[ROOT CAUSE] Injected catastrophic outage into ${s.name}.`,
      },
    ].slice(-200));
  }, [services]);

  // Apply Recovery Action
  const handleApplyRecovery = useCallback((strategy) => {
    setIsRecovering(true);
    setActiveRecoveryStrategy(strategy);

    // Save exact blast radius count at the moment Apply Recovery is clicked
    const affectedAtMoment = stateRef.current.services.filter(s => s.risk >= 35).length || 1;
    setSavedCountAtRecovery(affectedAtMoment);

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
      ...prev.slice(-190),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.10',
        service: 'RECOVERY-CTRL',
        level: 'HEAL',
        message: `Triggered '${strategy.name}'. Estimated downtime: ${strategy.expectedDowntime}.`,
      },
    ].slice(-200));
  }, []);

  // Apply Recommended Recovery specifically
  const handleApplyRecommendedRecovery = useCallback(() => {
    const activeScenario = FAILURE_SCENARIOS[activeScenarioId] || {};
    const recommendedId = activeScenario.recommendedStrategy || 'reroute';
    const strat = RECOVERY_STRATEGIES.find(s => s.id === recommendedId) || RECOVERY_STRATEGIES[2];
    handleApplyRecovery(strat);
  }, [activeScenarioId, handleApplyRecovery]);

  // Clean stop for Auto Demo
  const handleStopAutoDemo = useCallback(() => {
    autoDemoTimeoutsRef.current.forEach(clearTimeout);
    autoDemoTimeoutsRef.current = [];
    setAutoDemoState(null);
    setDemoToast('Auto demo stopped — use manual mode');
    setTimeout(() => setDemoToast(null), 4000);
  }, []);

  // Reset to Clean Baseline
  const handleReset = useCallback(() => {
    if (autoDemoTimeoutsRef.current.length > 0) {
      handleStopAutoDemo();
    }

    setServices(createInitialServices());
    setActiveScenarioId(null);
    setRootCauseId(null);
    setTimeToCrashSec(0);
    setCascadeSteps([]);
    setIsRecovering(false);
    setActiveRecoveryStrategy(null);
    setSavedCountAtRecovery(0);
    setPostMortem(null);
    setLogFilter('ALL'); // Reset filter back to ALL

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setLogs(prev => [
      ...prev.slice(-190),
      {
        id: Math.random().toString(36).slice(2, 9),
        timestamp: timeStr + '.00',
        service: 'SYS-ORCH',
        level: 'INFO',
        message: 'Topology reset to initial healthy baseline. All services reporting nominal SLA.',
      },
    ].slice(-200));
  }, [handleStopAutoDemo]);

  // Start Automated 60-Second Video Presentation Demo
  const handleStartAutoDemo = useCallback(() => {
    // 1. Clear any active timeouts and reset state
    autoDemoTimeoutsRef.current.forEach(clearTimeout);
    autoDemoTimeoutsRef.current = [];

    setServices(createInitialServices());
    setActiveScenarioId(null);
    setRootCauseId(null);
    setTimeToCrashSec(0);
    setCascadeSteps([]);
    setIsRecovering(false);
    setActiveRecoveryStrategy(null);
    setSavedCountAtRecovery(0);
    setPostMortem(null);
    setLogFilter('ALL');
    setIsPlaying(true);
    setDemoToast(null);

    // Step 1: 0 - 10s: Healthy Baseline
    setAutoDemoState({
      step: 1,
      caption: 'Healthy system — 8 services, low risk',
      secRemaining: 70,
    });

    // Step 2: 10s - 25s: Auto-inject Payment Outage
    const t2 = setTimeout(() => {
      try {
        handleTriggerScenario('payment_outage');
        setAutoDemoState(prev => prev ? {
          ...prev,
          step: 2,
          caption: 'Injecting Payment Outage — root cause: Payments',
        } : null);
      } catch {
        handleStopAutoDemo();
      }
    }, 10000);

    // Step 3: 25s - 40s: Show Cascade spreading to Orders & Gateway
    const t3 = setTimeout(() => {
      setAutoDemoState(prev => prev ? {
        ...prev,
        step: 3,
        caption: 'Cascade spreading — blast radius growing',
      } : null);
    }, 25000);

    // Step 4: 40s - 55s: Highlight Recommended Recovery & Countdown to Apply
    const t4 = setTimeout(() => {
      setAutoDemoState(prev => prev ? {
        ...prev,
        step: 4,
        caption: 'Applying recommended recovery: Isolate & Reroute (auto-applying in 5s...)',
      } : null);
    }, 40000);

    // Step 4b: 45s: Execute Recovery
    const t4b = setTimeout(() => {
      try {
        const strat = RECOVERY_STRATEGIES.find(s => s.id === 'reroute') || RECOVERY_STRATEGIES[2];
        handleApplyRecovery(strat);
        setAutoDemoState(prev => prev ? {
          ...prev,
          caption: 'Applying recommended recovery: Isolate & Reroute',
        } : null);
      } catch {
        handleStopAutoDemo();
      }
    }, 45000);

    // Step 5: 55s - 70s: Post-mortem banner & healing verification
    const t5 = setTimeout(() => {
      setAutoDemoState(prev => prev ? {
        ...prev,
        step: 5,
        caption: 'Crash prevented — system recovered',
      } : null);
    }, 55000);

    // Finish: 70s: Return cleanly to manual mode
    const tEnd = setTimeout(() => {
      autoDemoTimeoutsRef.current = [];
      setAutoDemoState(null);
      setDemoToast('Auto demo complete — returned to manual mode');
      setTimeout(() => setDemoToast(null), 4000);
    }, 70000);

    autoDemoTimeoutsRef.current = [t2, t3, t4, t4b, t5, tEnd];
  }, [handleTriggerScenario, handleApplyRecovery, handleStopAutoDemo]);

  const handleToggleAutoDemo = useCallback(() => {
    if (autoDemoState) {
      handleStopAutoDemo();
    } else {
      handleStartAutoDemo();
    }
  }, [autoDemoState, handleStopAutoDemo, handleStartAutoDemo]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      autoDemoTimeoutsRef.current.forEach(clearTimeout);
    };
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
        savedCountAtRecovery: curSavedCount,
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
          const finalSaved = curSavedCount || curServices.filter(s => s.risk >= 35).length || 1;

          const stratTitle = stateRef.current.activeRecoveryStrategy?.name || 'Automated Traffic Shedding';
          setPostMortem({
            message: `Crash prevented in ${durationSec}s — ${finalSaved} services saved`,
            subtext: `Mitigated via ${stratTitle}. Automated remediation successfully restored 100% SLA compliance with zero permanent data loss recorded.`,
            savedCount: finalSaved,
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
        setLogs(prev => [...prev.slice(-190), ...newLogs].slice(-200));
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
        const currentlyAffected = updated.filter(s => (s.status === 'at-risk' || s.status === 'failing') && s.id !== curRootId);
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
        setLogs(prev => [...prev.slice(-190), ...newLogs].slice(-200));
        return;
      }

      // Case C: Normal healthy operation with natural noise
      const normalUpdated = simulateNormalTick(curServices);
      setServices(normalUpdated);

      const newLogs = generateLogEntries(normalUpdated, null, false);
      setLogs(prev => [...prev.slice(-190), ...newLogs].slice(-200));

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
      {/* Header with Title, Controls, Orcathon Track Badge, Auto Demo Button */}
      <Header
        tickCount={tickCount}
        elapsedSec={elapsedSec}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleReset}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        isAutoDemoRunning={Boolean(autoDemoState)}
        onToggleAutoDemo={handleToggleAutoDemo}
        hasActiveIncident={hasActiveIncident}
      />

      {/* Large On-Screen Step Caption Banner for Foolproof Video Recording */}
      {autoDemoState && (
        <div className="auto-demo-banner" role="status" aria-live="polite">
          <div className="auto-demo-left">
            <span className="auto-demo-step-badge">
              <span className="sim-pill-dot" />
              AUTO DEMO • STEP {autoDemoState.step} OF 5
            </span>
            <span className="auto-demo-caption">
              {autoDemoState.caption}
            </span>
          </div>
          <button
            type="button"
            className="btn-stop-auto-demo"
            onClick={handleStopAutoDemo}
            aria-label="Stop automated demo"
          >
            ⏹ Stop Demo
          </button>
        </div>
      )}

      {/* Small Toast if Auto Demo was stopped cleanly */}
      {demoToast && (
        <div className="demo-toast-banner" role="status">
          <span>{demoToast}</span>
          <button
            type="button"
            onClick={() => setDemoToast(null)}
            className="btn-close-toast"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

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
            aria-label="Dismiss Post-Mortem"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <main className="main-layout">
        {/* Left Column: Service Graph, Recovery Strategy Comparison, Risk Ranked Table */}
        <section className="left-col">
          {/* Feature 1: Live Service Graph & Scenarios */}
          <ServiceGraph
            services={services}
            scenarios={FAILURE_SCENARIOS}
            activeScenarioId={activeScenarioId}
            rootCauseId={rootCauseId}
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
            blastRadius={blastRadius}
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
          <LogFeed
            logs={logs}
            filter={logFilter}
            onFilterChange={setLogFilter}
          />
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
