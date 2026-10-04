import React, { useState } from 'react';
import { ReturnRecord, Vendor, SingleAnalysisResult } from '../types';
import { analyzeBatchRecords } from '../api';
import {
  BarChart3,
  Play,
  RefreshCw,
  Building2,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface BatchPipelineViewProps {
  vendors: Vendor[];
  sampleReturns: ReturnRecord[];
  onBatchCompleted: (results: SingleAnalysisResult[]) => void;
}

export const BatchPipelineView: React.FC<BatchPipelineViewProps> = ({
  vendors,
  sampleReturns,
  onBatchCompleted,
}) => {
  const [running, setRunning] = useState(false);
  const [batchData, setBatchData] = useState<{
    results: SingleAnalysisResult[];
    totalTimeMs: number;
    totalTokens: number;
    totalCostUsd: number;
    summaryByRootCause: Record<string, number>;
    summaryByVendor: Record<string, { returns: number; avgSeverity: number; primaryDefect: string }>;
  } | null>(null);

  const [activeFilterHub, setActiveFilterHub] = useState<string>('All');

  const handleRunBatch = async () => {
    setRunning(true);
    try {
      const data = await analyzeBatchRecords(sampleReturns);
      setBatchData(data);
      onBatchCompleted(data.results);
    } catch (err) {
      console.error('Batch analysis failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) => activeFilterHub === 'All' || v.hub === activeFilterHub
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Parallel Batch Pipeline &amp; Vendor Defect Scorecard
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Demonstrates Pattern #2 (Parallelization): Concurrent processing of return batches across Tiruppur and Jaipur manufacturing hubs.
              Discovers systematic pattern cuts, fabric opacity flaws, and neck-ribbing deformation at Dhaga &amp; Co.'s 48k order/wk scale.
            </p>
          </div>

          <button
            onClick={handleRunBatch}
            disabled={running}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shrink-0 shadow-sm"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing Concurrent Batches...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Parallel Batch Analysis ({sampleReturns.length} Records)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Pipeline Telemetry Banner (if run) */}
      {batchData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] block uppercase tracking-wider font-semibold">Total Time</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {(batchData.totalTimeMs / 1000).toFixed(2)}s
            </div>
            <span className="text-[11px] text-slate-400">
              Avg {(batchData.totalTimeMs / batchData.results.length).toFixed(0)}ms / return
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] block uppercase tracking-wider font-semibold">Processed Records</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {batchData.results.length} / {sampleReturns.length}
            </div>
            <span className="text-[11px] text-slate-400">100% Concurrent Concurrency</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] block uppercase tracking-wider font-semibold">Tokens Consumed</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              {batchData.totalTokens.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">
              ~{Math.round(batchData.totalTokens / batchData.results.length)} tokens / call
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-slate-500 text-[11px] block uppercase tracking-wider font-semibold">Total Batch Cost</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              ${batchData.totalCostUsd.toFixed(5)}
            </div>
            <span className="text-[11px] text-slate-400">
              ₹{(batchData.totalCostUsd * 87.5).toFixed(3)} INR total
            </span>
          </div>
        </div>
      )}

      {/* Vendor Scorecard Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Dhaga &amp; Co. Sourcing Hub Audit: Jaipur vs. Tiruppur vs. Surat
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies return rate variance and recurring pattern errors per manufacturing partner
            </p>
          </div>

          {/* Hub filter tabs */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 rounded-lg border border-slate-800 self-start">
            {['All', 'Jaipur', 'Tiruppur', 'Surat', 'Delhi'].map((hub) => (
              <button
                key={hub}
                onClick={() => setActiveFilterHub(hub)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  activeFilterHub === hub
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pr-4">Vendor Partner</th>
                <th className="pb-3 px-3">Hub &amp; Category</th>
                <th className="pb-3 px-3">Lead Time</th>
                <th className="pb-3 px-3">Return Rate</th>
                <th className="pb-3 px-3">Quality Rating</th>
                <th className="pb-3 pl-4">Systematic Defect Identified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredVendors.map((vendor) => {
                const isHighReturn = vendor.returnRate > 30;
                return (
                  <tr key={vendor.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-white">{vendor.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{vendor.id} · {vendor.activeSkus} SKUs</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-medium">{vendor.hub}</div>
                      <div className="text-slate-400 text-[11px]">{vendor.category}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {vendor.leadTimeDays} days
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                          isHighReturn
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {vendor.returnRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-amber-300 font-medium">
                      ★ {vendor.rating}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-300 text-[11px] max-w-sm">
                      {vendor.topDefect}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Economics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-semibold text-white">Womenswear (60% Revenue)</span>
            <span className="font-mono text-amber-400">₹399 - ₹1,499</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Primary source: Jaipur (Anokhi Weaves, Pink City). High return rate (36-38%) driven by bust/armhole grading mismatches and Chanderi pigment bleed.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-semibold text-white">Kidswear (30% Revenue)</span>
            <span className="font-mono text-amber-400">₹399 - ₹949</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Primary source: Tiruppur (Evergreen Cotton). Waist elastic pinching on Anarkalis and dummy drawstrings on joggers cause high mother return complaints.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-semibold text-white">Men's Basics (10% Revenue)</span>
            <span className="font-mono text-amber-400">₹499 - ₹699</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Primary source: Tiruppur (Kongu Knits). Lowest baseline returns (19.8%), but collar ribbing loss after wash hurts repeat purchase rate.
          </p>
        </div>
      </div>
    </div>
  );
};
