/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, SystemHealth, ReturnRecord, Vendor, ValidationCase, SingleAnalysisResult, WeeklyFitBrief } from './types';
import { fetchHealth, fetchDatasets, fetchMetrics } from './api';
import { Navbar } from './components/Navbar';
import { SecurityKeyModal } from './components/SecurityKeyModal';
import { PitchGuideModal } from './components/PitchGuideModal';
import { WhereIsTheDataModal } from './components/WhereIsTheDataModal';
import { LiveRadarView } from './components/LiveRadarView';
import { BatchPipelineView } from './components/BatchPipelineView';
import { WeeklyFitBriefView } from './components/WeeklyFitBriefView';
import { DataValidatorView } from './components/DataValidatorView';
import { CostRoiView } from './components/CostRoiView';
import { LogsView } from './components/LogsView';
import {
  AlertCircle,
  Activity,
  Layers,
  Terminal,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('live-radar');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [datasets, setDatasets] = useState<{
    vendors: Vendor[];
    sampleReturns: ReturnRecord[];
    validationCases: ValidationCase[];
    businessConstants: any;
  } | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [recentResults, setRecentResults] = useState<SingleAnalysisResult[]>([]);
  const [initialBrief, setInitialBrief] = useState<WeeklyFitBrief | null>(null);

  const loadInitialData = async () => {
    try {
      const [healthData, datasetsData, metricsData] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchDatasets().catch(() => null),
        fetchMetrics().catch(() => null),
      ]);
      if (healthData) setHealth(healthData);
      if (datasetsData) setDatasets(datasetsData);
      if (metricsData) setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefreshHealth = async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
    } catch (err) {
      console.error('Failed to refresh health:', err);
    }
  };

  const handleAnalysisDone = (result: SingleAnalysisResult) => {
    setRecentResults((prev) => [result, ...prev.filter((r) => r.returnId !== result.returnId)]);
  };

  const handleBatchCompleted = (results: SingleAnalysisResult[]) => {
    setRecentResults(results);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onOpenSecurityModal={() => setSecurityModalOpen(true)}
        onOpenPitchModal={() => setPitchModalOpen(true)}
        onOpenDataModal={() => setDataModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <div className="text-sm font-medium text-slate-300">
              Connecting to Dhaga &amp; Co. Intelligence Radar Pipeline...
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'live-radar' && (
              <LiveRadarView
                sampleReturns={datasets?.sampleReturns || []}
                onAnalysisDone={handleAnalysisDone}
              />
            )}

            {activeTab === 'batch-pipeline' && (
              <BatchPipelineView
                vendors={datasets?.vendors || []}
                sampleReturns={datasets?.sampleReturns || []}
                onBatchCompleted={handleBatchCompleted}
                onOpenDataModal={() => setDataModalOpen(true)}
              />
            )}

            {activeTab === 'fit-brief' && (
              <WeeklyFitBriefView
                initialBrief={initialBrief}
                recentResults={recentResults}
              />
            )}

            {activeTab === 'data-validator' && (
              <DataValidatorView
                validationCases={datasets?.validationCases || []}
              />
            )}

            {activeTab === 'cost-roi' && (
              <CostRoiView metrics={metrics} />
            )}

            {activeTab === 'logs' && <LogsView />}
          </>
        )}
      </main>

      {/* Fixed Executive Bottom Context Strip (Subtle metadata & health ticker) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-4 py-2 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">Dhaga &amp; Co. Scale:</span>
            <span>48,000 orders/wk (₹310 Cr GMV)</span>
            <span>·</span>
            <span>31% Return Rate</span>
            <span>·</span>
            <span>44% in "Other" (6,547 unclassified/wk)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Key: {health?.openRouter.maskedKey || 'Fallback Safe Mode'}</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Logs: {health?.logs.total || 0}
                {health?.logs.errors ? (
                  <strong className="text-rose-400 font-bold ml-1">({health.logs.errors} err)</strong>
                ) : (
                  ' (healthy)'
                )}
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* Security Governance Modal */}
      <SecurityKeyModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        health={health}
        onRefreshHealth={handleRefreshHealth}
      />

      {/* Presentation Pitch Guide Modal */}
      <PitchGuideModal
        isOpen={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Ingestion & Data Source Modal */}
      <WhereIsTheDataModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        onLoadSampleData={loadInitialData}
        onCustomDataUploaded={(uploaded) => {
          if (datasets) {
            setDatasets({
              ...datasets,
              sampleReturns: [...uploaded, ...datasets.sampleReturns],
            });
          }
        }}
      />
    </div>
  );
}
