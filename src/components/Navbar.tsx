import React from 'react';
import { TabType, SystemHealth } from '../types';
import { ShieldCheck, ShieldAlert, Activity, FileText, BarChart3, Database, DollarSign, Terminal, Presentation } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  health: SystemHealth | null;
  onOpenSecurityModal: () => void;
  onOpenPitchModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  onOpenSecurityModal,
  onOpenPitchModal,
}) => {
  const isKeyConfigured = health?.openRouter.isConfigured;
  const errorCount = health?.logs.errors || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-sm">
            ध
          </div>
          <button
            onClick={() => setActiveTab('live-radar')}
            className="text-left group cursor-pointer"
          >
            <span className="text-base font-semibold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              Dhaga & Co. Intelligence Radar
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('live-radar')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'live-radar'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Triage
          </button>

          <button
            onClick={() => setActiveTab('batch-pipeline')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'batch-pipeline'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Vendor Scorecards
          </button>

          <button
            onClick={() => setActiveTab('fit-brief')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'fit-brief'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Weekly Fit Brief
          </button>

          <button
            onClick={() => setActiveTab('data-validator')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'data-validator'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Data Benchmark
          </button>

          <button
            onClick={() => setActiveTab('cost-roi')}
            className={`transition-colors flex items-center gap-1.5 py-1 ${
              activeTab === 'cost-roi'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Cost & ROI
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`transition-colors flex items-center gap-1.5 py-1 relative ${
              activeTab === 'logs'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Logs
            {errorCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary action & Security status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSecurityModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              isKeyConfigured
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-700/50 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="OpenRouter API Key Security & Configuration"
          >
            {isKeyConfigured ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">OpenRouter Key:</span>
                <span className="font-mono text-[11px] text-emerald-200">
                  {health?.openRouter.maskedKey || 'Configured'}
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Key Status:</span>
                <span className="font-mono text-[11px]">Fallback Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenPitchModal}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
            title="Open 20-minute Presentation Pitch Guide"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-400" />
            <span>Pitch Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('fit-brief')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap shadow-sm"
          >
            Generate Brief
          </button>
        </div>
      </div>
    </header>
  );
};
