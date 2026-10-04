import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calculator, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

interface CostRoiViewProps {
  metrics: any;
}

export const CostRoiView: React.FC<CostRoiViewProps> = ({ metrics }) => {
  const [returnReductionPct, setReturnReductionPct] = useState<number>(2.0); // 2 percentage points

  // Dhaga & Co. baseline numbers from brief
  const weeklyOrders = 48000;
  const aovInr = 840;
  const overallReturnRate = 0.31; // 31%
  const otherShare = 0.44; // 44% in Other
  const weeklyReturns = weeklyOrders * overallReturnRate; // 14,880
  const weeklyOtherReturns = weeklyReturns * otherShare; // ~6,547
  const rtoCostInr = 120; // Faizan: ₹120 in logistics per RTO

  // Cost line per LLM call
  // Gemini 2.5 Flash: $0.075 / 1M prompt, $0.30 / 1M completion
  // Prompt ~400 tokens = $0.000030
  // Completion ~150 tokens = $0.000045
  // Fast model cost: $0.000075 (~₹0.0065)
  // Claude 3.5 Sonnet Judge (Batch Fit Brief): ~$0.015 / weekly run (~₹1.30 / week)
  const costPerReturnUsd = 0.000085;
  const costPerReturnInr = costPerReturnUsd * 87.5; // ~₹0.0074

  const weeklyInferenceCostUsd = weeklyOtherReturns * costPerReturnUsd + 0.015; // ~$0.57 / week
  const weeklyInferenceCostInr = weeklyInferenceCostUsd * 87.5; // ~₹50 / week
  const annualInferenceCostInr = weeklyInferenceCostInr * 52; // ~₹2,600 / year

  // Savings calculation from return reduction
  const preventedOrdersPerWeek = Math.round(weeklyOrders * (returnReductionPct / 100));
  const weeklyLogisticsSavingsInr = preventedOrdersPerWeek * rtoCostInr;
  const annualLogisticsSavingsInr = weeklyLogisticsSavingsInr * 52;

  // Repeat purchase / customer retention uplift
  // Ritu: "Repeat purchase rate stuck at 22%."
  // If 960 customers don't churn due to bad fit:
  const annualGmvRetainedInr = preventedOrdersPerWeek * aovInr * 52;

  const netAnnualBenefitInr = annualLogisticsSavingsInr - annualInferenceCostInr;
  const roiRatio = Math.round(annualLogisticsSavingsInr / (annualInferenceCostInr || 1));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cost Line &amp; CTO Economics Arithmetic
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Fulfills Ground Rule "Cost Line": Dev (CTO) requires rigorous arithmetic on unit inference cost and enterprise volume at 48,000 orders/week.
              A rupee is a rupee.
            </p>
          </div>

          <div className="px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-700/60 rounded-lg text-emerald-300 font-mono text-xs flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            ROI Multiplier: ~{roiRatio.toLocaleString()}x
          </div>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Cost Per Single Return Run</span>
          <div className="text-xl font-bold text-amber-400 mt-1">₹{costPerReturnInr.toFixed(3)}</div>
          <span className="text-[11px] text-slate-400">($0.000085 USD / ~550 tokens)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Weekly Pipeline Cost (6,547 Runs)</span>
          <div className="text-xl font-bold text-amber-400 mt-1">₹{Math.round(weeklyInferenceCostInr).toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">(${weeklyInferenceCostUsd.toFixed(2)} USD / week)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Annual Reverse Logistics Saved</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">₹{(annualLogisticsSavingsInr / 100000).toFixed(1)} Lakhs</div>
          <span className="text-[11px] text-slate-400">At {returnReductionPct}% return reduction</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Annual Net Margin Addition</span>
          <div className="text-xl font-bold text-emerald-300 mt-1">₹{(netAnnualBenefitInr / 100000).toFixed(1)} Lakhs</div>
          <span className="text-[11px] text-slate-400">Logistics savings - LLM cost</span>
        </div>
      </div>

      {/* Interactive ROI Simulation Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Sensitivity Analysis: Return Rate Reduction Scenario
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate Dhaga &amp; Co. bottom line when pattern fixes reduce overall return rate (baseline: 31%)
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
            {returnReductionPct}% Points Reduction &rarr; {preventedOrdersPerWeek} Orders/Wk
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>0.5% (240 returns/wk)</span>
            <span className="text-amber-300 font-bold">{returnReductionPct}%</span>
            <span>5.0% (2,400 returns/wk)</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={returnReductionPct}
            onChange={(e) => setReturnReductionPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850">
            <span className="text-slate-500 block text-[11px]">Weekly RTO Logistics Savings:</span>
            <span className="text-base font-bold text-white font-mono">
              ₹{weeklyLogisticsSavingsInr.toLocaleString()}
            </span>
            <p className="text-slate-400 text-[11px] mt-1">
              Based on {preventedOrdersPerWeek} fewer RTOs @ ₹120 direct courier &amp; warehouse cost.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850">
            <span className="text-slate-500 block text-[11px]">Annualized Logistics Savings:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ₹{annualLogisticsSavingsInr.toLocaleString()}
            </span>
            <p className="text-slate-400 text-[11px] mt-1">
              52 weeks of operational savings straight to EBITDA.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850">
            <span className="text-slate-500 block text-[11px]">Annual GMV Protected (AOV ₹840):</span>
            <span className="text-base font-bold text-amber-300 font-mono">
              ₹{(annualGmvRetainedInr / 10000000).toFixed(2)} Crores
            </span>
            <p className="text-slate-400 text-[11px] mt-1">
              Customers who keep their order instead of churning to competing D2C brands.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Model Architecture Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Ground Rule Architecture: Two Models Minimum Justification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defends why a single model cannot satisfy both cost constraints and deep evaluative rigor
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 pr-4">Model Role</th>
                <th className="pb-3 px-3">Selected Model</th>
                <th className="pb-3 px-3">Primary Responsibility</th>
                <th className="pb-3 px-3">Latency &amp; Temperature</th>
                <th className="pb-3 px-3">Cost / 1M Tokens</th>
                <th className="pb-3 pl-4">Weekly Budget at Dhaga &amp; Co.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3.5 pr-4">
                  <span className="font-semibold text-white">Bulk Classifier</span>
                  <div className="text-[11px] text-slate-400">High Volume Worker</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-cyan-300 font-medium">
                  google/gemini-2.5-flash
                </td>
                <td className="py-3.5 px-3 text-slate-300 text-[11px]">
                  Translates Hinglish, maps 90 color variants, extracts anatomical zone, classifies root cause.
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-300">
                  ~180ms · temp 0.1
                </td>
                <td className="py-3.5 px-3 font-mono text-amber-300">
                  $0.075 / $0.30
                </td>
                <td className="py-3.5 pl-4 font-mono text-emerald-300 font-semibold">
                  $0.55 / week (₹48/wk)
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-4">
                  <span className="font-semibold text-white">Judge &amp; Auditor</span>
                  <div className="text-[11px] text-slate-400">Low Volume Reasoner</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-amber-300 font-medium">
                  anthropic/claude-3.5-sonnet
                </td>
                <td className="py-3.5 px-3 text-slate-300 text-[11px]">
                  Synthesizes Weekly Fit Brief, audits pattern master instructions, verifies facts against 14k SKU catalogue.
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-300">
                  ~1,400ms · temp 0.2
                </td>
                <td className="py-3.5 px-3 font-mono text-amber-300">
                  $3.00 / $15.00
                </td>
                <td className="py-3.5 pl-4 font-mono text-emerald-300 font-semibold">
                  $0.04 / week (₹3.5/wk)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
