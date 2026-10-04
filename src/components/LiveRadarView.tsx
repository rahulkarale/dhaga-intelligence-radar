import React, { useState } from 'react';
import { ReturnRecord, SingleAnalysisResult } from '../types';
import { analyzeSingleRecord } from '../api';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  CheckCircle,
  Compass,
  Building2,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface LiveRadarViewProps {
  sampleReturns: ReturnRecord[];
  onAnalysisDone: (result: SingleAnalysisResult) => void;
}

export const LiveRadarView: React.FC<LiveRadarViewProps> = ({
  sampleReturns,
  onAnalysisDone,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ReturnRecord>(
    sampleReturns[0] || {
      id: 'RET-SAMPLE',
      orderId: 'ORD-101',
      orderDate: '2026-09-20',
      deliveredDate: '2026-09-24',
      returnDate: '2026-09-25',
      sku: 'KUR-JPR-402',
      productName: 'Gulabi Hand-block Printed Chanderi Kurti',
      vendorId: 'VEND-JPR-01',
      vendorName: 'Anokhi Weaves & Prints',
      category: 'Womenswear',
      price: 899,
      sizeOrdered: 'M',
      colorRaw: 'rani gulabi',
      officialReturnReason: 'Other',
      freeTextOtherReason: 'Size M mangwaya tha par bust area bohot tight hai, bilkul fit nahi baith raha. Aur kapda ek baar paani lagne pe pink color nikal raha hai.',
      customerLanguage: 'Hinglish',
      cod: true,
      status: 'Initiated',
    }
  );

  const [customText, setCustomText] = useState(selectedRecord.freeTextOtherReason);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SingleAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (record: ReturnRecord) => {
    setSelectedRecord(record);
    setCustomText(record.freeTextOtherReason);
    setResult(null);
    setError(null);
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const recordToAnalyze: ReturnRecord = {
        ...selectedRecord,
        freeTextOtherReason: customText,
      };
      const res = await analyzeSingleRecord(recordToAnalyze);
      setResult(res);
      onAnalysisDone(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Live Return &amp; Feedback Triage Radar
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Solves Neha's (Category Head) bottleneck: 44% of Dhaga &amp; Co. returns land in the unstructured "Other" box.
              This 3-stage prompt chain normalizes vernacular Hinglish, identifies root cause, attributes supplier defect, and outputs pattern fixes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="text-slate-400">Dhaga &amp; Co. Weekly Scale:</span>
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded font-semibold text-slate-200">
              6,547 "Other" returns/wk
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Bench (Left) + 3-Stage Pipeline Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Selector & Custom Input Bench (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Real Client Cases (From Case Study)
              </span>
              <span className="text-[11px] text-slate-400">Click to load</span>
            </div>

            <div className="space-y-2">
              {sampleReturns.slice(0, 4).map((rec) => {
                const isSelected = selectedRecord.id === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => handleSelectPreset(rec)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/60 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{rec.productName}</span>
                      <span className="text-[11px] font-mono text-amber-400">₹{rec.price}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-2">
                      <span>{rec.vendorName}</span>
                      <span>·</span>
                      <span>Size: {rec.sizeOrdered}</span>
                      <span>·</span>
                      <span className="capitalize">{rec.colorRaw}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                      "{rec.freeTextOtherReason}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Return Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Customer Feedback Input (Hinglish/Text)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {selectedRecord.category} · {selectedRecord.sku}
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Customer Unstructured Note:</label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type customer's feedback in Hinglish or English..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Vendor:</span>
                <span className="font-medium text-slate-200">{selectedRecord.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Payment / Return:</span>
                <span className="font-medium text-slate-200">
                  {selectedRecord.cod ? 'Cash on Delivery' : 'Prepaid'} · {selectedRecord.officialReturnReason}
                </span>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={loading || !customText.trim()}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running 3-Stage Pattern Chain...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Pipeline Triage
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 3-Stage Prompt Chaining Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Pipeline Execution Error (Fails Visibly):</div>
                <div className="text-[11px] text-rose-300 font-mono mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Radar Pipeline Idle</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select one of Dhaga &amp; Co.'s verified cases on the left or type custom feedback, then click "Run Pipeline Triage".
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-300 space-y-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-white">Chaining Models: Fast Classifier &rarr; Spec Synthesizer</h4>
                <p className="text-xs text-slate-400 mt-1">
                  1. Translating Hinglish &amp; normalizing color tags &rarr; 2. Root cause attribution &rarr; 3. Pattern master adjustments.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Telemetry pill row */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-medium text-slate-200">Execution Verified</span>
                  <span>·</span>
                  <span className="font-mono text-slate-300">{result.timingMs}ms</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>Tokens: <strong className="text-slate-200 font-mono">{result.tokens.total}</strong></span>
                  <span>Cost: <strong className="text-emerald-400 font-mono">${result.costUsd.toFixed(5)}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                    result.mode === 'live' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {result.mode}
                  </span>
                </div>
              </div>

              {/* Stage 1 Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Stage 1: Ingestion &amp; Vernacular Normalization
                  </span>
                  <span className="text-[11px] text-slate-400">Model: Gemini 2.5 Flash / Fast</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Standardized English Translation:</span>
                    <p className="text-slate-200 font-medium mt-0.5 bg-slate-950 p-2.5 rounded border border-slate-850">
                      {result.translatedEnglish}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Attribute Mapping:</span>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1.5 font-mono text-[11px]">
                      <div>Color: <span className="text-amber-300 font-semibold">{result.normalizedColor}</span> <span className="text-slate-500">(from "{selectedRecord.colorRaw}")</span></div>
                      <div>Garment Zone: <span className="text-cyan-300 font-semibold">{result.garmentZone}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 2 Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Stage 2: Root Cause Classification &amp; Routing
                  </span>
                  <span className="text-[11px] text-slate-400">Confidence: {(result.confidenceScore * 100).toFixed(0)}%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded border border-slate-850">
                    <span className="text-slate-500 block text-[11px]">Classified Root Cause:</span>
                    <span className="text-sm font-semibold text-rose-300 mt-1 block">
                      {result.rootCause}
                    </span>
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Severity:</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">
                        {result.severityScore} / 10
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded border border-slate-850">
                    <span className="text-slate-500 block text-[11px]">Target Department Route:</span>
                    <span className="text-sm font-semibold text-emerald-300 mt-1 block flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                      {result.routingTarget}
                    </span>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Auto-triggers notification to {result.vendorName} sourcing rep.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stage 3 Card */}
              <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-3 bg-gradient-to-br from-slate-900 to-amber-950/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    Stage 3: Pattern Master Adjustment &amp; Spec Fix
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">Ready for Monday Standup</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950/90 p-3 rounded border border-amber-500/20">
                    <span className="text-[11px] text-amber-400/80 font-medium block">Technical Garment Spec Correction:</span>
                    <p className="text-slate-100 font-mono text-xs mt-1 leading-relaxed">
                      {result.specCorrectionNote}
                    </p>
                  </div>

                  <div className="bg-slate-950/90 p-3 rounded border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block">Category Head Action:</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      {result.actionableRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
