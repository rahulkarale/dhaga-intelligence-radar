import React, { useState } from 'react';
import { WeeklyFitBrief, SingleAnalysisResult } from '../types';
import { generateFitBrief } from '../api';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  RefreshCw,
  Building,
  TrendingDown,
  DollarSign,
  Info,
  LineChart as LineChartIcon,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface WeeklyFitBriefViewProps {
  initialBrief: WeeklyFitBrief | null;
  recentResults: SingleAnalysisResult[];
}

const FOUR_WEEK_TREND_DATA = [
  {
    week: 'W36',
    weekLabel: 'W36 (Sep 01 - 07)',
    overallReturnRate: 33.2,
    unclassifiedOtherRate: 45.1,
    jaipurHubReturnRate: 39.8,
    tiruppurHubReturnRate: 21.4,
    sizingDefectsPct: 41.2,
    annotation: 'Pre-Radar Baseline (~300 manual reviews/wk)',
  },
  {
    week: 'W37',
    weekLabel: 'W37 (Sep 08 - 14)',
    overallReturnRate: 32.6,
    unclassifiedOtherRate: 43.8,
    jaipurHubReturnRate: 39.1,
    tiruppurHubReturnRate: 20.8,
    sizingDefectsPct: 40.5,
    annotation: 'Audit detected -1.5" bust under-spec on Chanderi',
  },
  {
    week: 'W38',
    weekLabel: 'W38 (Sep 15 - 21)',
    overallReturnRate: 31.8,
    unclassifiedOtherRate: 28.5,
    jaipurHubReturnRate: 37.2,
    tiruppurHubReturnRate: 19.9,
    sizingDefectsPct: 35.0,
    annotation: 'Prompt chaining pilot launched & vendor alerted',
  },
  {
    week: 'W39',
    weekLabel: 'W39 (Sep 22 - 28 Current)',
    overallReturnRate: 30.7,
    unclassifiedOtherRate: 12.3,
    jaipurHubReturnRate: 34.6,
    tiruppurHubReturnRate: 18.2,
    sizingDefectsPct: 29.4,
    annotation: 'Weekly Fit Brief applied; 2.5% return reduction',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataItem = FOUR_WEEK_TREND_DATA.find((d) => d.week === label || d.weekLabel === label);
    return (
      <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 font-mono">
        <div className="font-bold text-white border-b border-slate-800 pb-1.5 font-sans flex items-center justify-between gap-3">
          <span>{dataItem?.weekLabel || label}</span>
          <span className="text-[10px] text-amber-400 font-mono">Dhaga &amp; Co. Metabase</span>
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-sans" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{entry.value}%</span>
            </div>
          ))}
        </div>
        {dataItem?.annotation && (
          <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-sans italic">
            Note: {dataItem.annotation}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const WeeklyFitBriefView: React.FC<WeeklyFitBriefViewProps> = ({
  initialBrief,
  recentResults,
}) => {
  const [brief, setBrief] = useState<WeeklyFitBrief | null>(initialBrief);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chartView, setChartView] = useState<'all' | 'unclassified' | 'hubs'>('all');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newBrief = await generateFitBrief(recentResults.length > 0 ? recentResults : undefined);
      setBrief(newBrief);
    } catch (err) {
      console.error('Failed to generate brief:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!brief) return;
    const md = `# ${brief.title}
**Date:** ${brief.generationDate} | **ID:** ${brief.briefId}
**Evaluator Factuality Score:** ${brief.evaluatorScore.factualAccuracyScore}% | **Hallucination Check:** ${brief.evaluatorScore.hallucinationCheckPassed ? 'PASSED' : 'FAILED'}

## Executive Summary
${brief.executiveSummary}

## High-Risk SKUs & Pattern Fixes
${brief.highRiskSkus.map((s) => `- **${s.sku}** (${s.productName}): Return Rate ${s.returnRatePercent}%. Primary Issue: ${s.primaryIssue}. Recommended Fix: ${s.recommendedSpecFix}`).join('\n')}

## Vendor Scorecards & Directives
${brief.vendorScorecardSummary.map((v) => `- **${v.vendorName}** (${v.hub}): Defect Rate ${v.fitDefectRate}%. Action: ${v.actionRequired}`).join('\n')}

## Listing Copy Amendments
${brief.listingCopyFixes.map((l) => `- **${l.sku}**: Add to listing: "${l.suggestedAddendum}"`).join('\n')}

## Projected Savings
- Weekly returns prevented: ${brief.financialImpact.estimatedWeeklyReturnsPrevented}
- Weekly logistics savings: ₹${brief.financialImpact.estimatedWeeklyLogisticsSavingsInr.toLocaleString()}
- Annualized savings: ₹${brief.financialImpact.annualizedProjectedSavingsInr.toLocaleString()}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Weekly Category Fit &amp; Sizing Intelligence Brief
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Generated every Monday for Neha (Category Head) &amp; Vivek (Listing Lead) before the Tuesday 400-SKU drop.
              Uses Pattern #4 (Evaluator-Optimizer): Generator synthesizes insights, Judge Auditor checks catalogue veracity, ensuring zero hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {brief && (
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied Markdown' : 'Copy Brief'}
              </button>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Auditing with Evaluator Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {brief ? 'Re-run Evaluator Loop' : 'Generate Weekly Brief'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!brief && !generating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-4">
          <FileText className="w-12 h-12 text-amber-400 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-white">No Brief Generated for This Cycle</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click "Generate Weekly Brief" to run the 2-model Evaluator-Optimizer loop on Dhaga &amp; Co.'s weekly return feedback.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-amber-300 transition-colors"
          >
            Run Evaluator-Optimizer
          </button>
        </div>
      )}

      {generating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-300 space-y-4">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Running Evaluator-Optimizer Synthesis</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            1. Generator Model compiles high-risk SKU defect clusters.<br />
            2. Judge Model audits every SKU number against catalogue records to enforce zero hallucinated specifications.
          </p>
        </div>
      )}

      {brief && !generating && (
        <div className="space-y-6">
          {/* Audit Verification Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-white block">Evaluator Verification Passed</span>
                <span className="text-emerald-300 text-[11px]">
                  Factual Accuracy: <strong className="font-mono text-white">{brief.evaluatorScore.factualAccuracyScore}%</strong> ·
                  Spec Feasibility: <strong className="font-mono text-white">{brief.evaluatorScore.specFeasibilityScore}%</strong> ·
                  Hallucinations: <strong className="font-mono text-white">{brief.evaluatorScore.hallucinationCheckPassed ? '0 Detected' : 'Flagged'}</strong>
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right shrink-0">
              Audit Note: {brief.evaluatorScore.critiqueNotes}
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-amber-400 font-mono font-semibold uppercase tracking-wider block">
                  Confidential · For Category &amp; Merchandising Heads
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">{brief.title}</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Date: {brief.generationDate}</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-850">
              {brief.executiveSummary}
            </p>
          </div>

          {/* 4-Week Return Rate & Defect Velocity Recharts Line Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    4-Week Return Rate &amp; Defect Velocity (W36 - W39)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing return rate compression following automated Hinglish normalization and Jaipur pattern master adjustments
                </p>
              </div>

              {/* View Filter Toggles */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold shrink-0">
                <button
                  onClick={() => setChartView('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    chartView === 'all'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Metrics
                </button>
                <button
                  onClick={() => setChartView('unclassified')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    chartView === 'unclassified'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unclassified 'Other' Drop
                </button>
                <button
                  onClick={() => setChartView('hubs')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    chartView === 'hubs'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jaipur vs Tiruppur
                </button>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Current Return Rate</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-bold text-amber-400 font-mono">30.7%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">(-2.5% pts)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Down from 33.2% in W36</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Unclassified 'Other'</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-bold text-rose-400 font-mono">12.3%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">(-32.8% pts)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Triaged by prompt chain</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Jaipur Kurti Returns</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-bold text-cyan-400 font-mono">34.6%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">(-5.2% pts)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Bust grading spec applied</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Tiruppur Knit Returns</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base font-bold text-emerald-400 font-mono">18.2%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold font-mono">(-3.2% pts)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">5% spandex collar mandate</span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={FOUR_WEEK_TREND_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    unit="%"
                    domain={[10, 50]}
                    tickLine={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />

                  {(chartView === 'all' || chartView === 'unclassified') && (
                    <Line
                      type="monotone"
                      name="Overall Return Rate %"
                      dataKey="overallReturnRate"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {(chartView === 'all' || chartView === 'unclassified') && (
                    <Line
                      type="monotone"
                      name="Unclassified 'Other' Returns %"
                      dataKey="unclassifiedOtherRate"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#f43f5e' }}
                      activeDot={{ r: 6 }}
                    />
                  )}

                  {(chartView === 'all' || chartView === 'hubs') && (
                    <Line
                      type="monotone"
                      name="Jaipur Hub Returns %"
                      dataKey="jaipurHubReturnRate"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#06b6d4' }}
                      activeDot={{ r: 5 }}
                    />
                  )}

                  {(chartView === 'all' || chartView === 'hubs') && (
                    <Line
                      type="monotone"
                      name="Tiruppur Hub Returns %"
                      dataKey="tiruppurHubReturnRate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Insight Badge Footer */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-300">
                  <strong>Key Velocity Takeaway:</strong> Unclassified "Other" returns collapsed from <strong>45.1%</strong> down to <strong>12.3%</strong> in W39 due to 3-stage vernacular prompt chaining.
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-semibold hidden sm:inline">
                Target: &lt;10% by W41
              </span>
            </div>
          </div>

          {/* High-Risk SKUs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                High-Risk SKUs: Immediate Pattern Correction Spec
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sent to Jaipur and Tiruppur sampling masters prior to re-cutting production lots
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">SKU / Product</th>
                    <th className="pb-3 px-3">Vendor</th>
                    <th className="pb-3 px-3">Return %</th>
                    <th className="pb-3 px-3">Root Cause Diagnosis</th>
                    <th className="pb-3 pl-4">Pattern Revision Spec (Inches / Cuts)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {brief.highRiskSkus.map((skuItem) => (
                    <tr key={skuItem.sku} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white">{skuItem.productName}</div>
                        <div className="text-[11px] font-mono text-amber-400">{skuItem.sku}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{skuItem.vendorName}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono font-semibold text-[11px]">
                          {skuItem.returnRatePercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 text-[11px] max-w-xs">
                        {skuItem.primaryIssue}
                      </td>
                      <td className="py-3.5 pl-4 text-emerald-300 font-mono text-[11px] max-w-sm font-medium">
                        {skuItem.recommendedSpecFix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sourcing Directives & Listing Copy Amendments (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Scorecard Directives */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                Vendor Sourcing Directives
              </h3>

              <div className="space-y-3 text-xs">
                {brief.vendorScorecardSummary.map((v, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{v.vendorName}</span>
                      <span className="text-[11px] font-mono text-rose-400">{v.fitDefectRate}% Defect Rate</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{v.actionRequired}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Copy Fixes for Vivek */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Immediate Listing Copy Addendums (Vivek / Tuesday Drop)
              </h3>

              <div className="space-y-3 text-xs">
                {brief.listingCopyFixes.map((l, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div className="font-mono text-amber-400 font-semibold mb-1 text-[11px]">{l.sku}</div>
                    <div className="text-slate-400 text-[11px] mb-1">Current Gap: {l.currentListingFlaw}</div>
                    <div className="text-emerald-300 text-[11px] bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                      "{l.suggestedAddendum}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Impact Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Dhaga &amp; Co. Bottom Line Impact (at ₹120 RTO Logistics Cost)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Returns Prevented/Week:</span>
                <span className="text-lg font-bold text-white">
                  {brief.financialImpact.estimatedWeeklyReturnsPrevented} orders
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Weekly Logistics Savings:</span>
                <span className="text-lg font-bold text-emerald-400">
                  ₹{brief.financialImpact.estimatedWeeklyLogisticsSavingsInr.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Annualized Projected Savings:</span>
                <span className="text-lg font-bold text-amber-400">
                  ₹{brief.financialImpact.annualizedProjectedSavingsInr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
