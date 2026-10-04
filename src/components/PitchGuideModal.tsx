import React from 'react';
import { X, Presentation, Clock, CheckCircle2, AlertOctagon, Lightbulb, Users } from 'lucide-react';

interface PitchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: any) => void;
}

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dhaga &amp; Co. 20-Minute Live Presentation Guide</h2>
            <p className="text-xs text-slate-400">
              Structured to match Phase 3 evaluation criteria for Ritu (CEO), Neha (Category Head), and Dev (CTO)
            </p>
          </div>
        </div>

        {/* 5 Segments */}
        <div className="space-y-3 text-xs">
          {/* Segment 1 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Segment 1: The Problem (3 Minutes)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Speaker: Lead / Strategy</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Open with Neha's exact quote: <em>"Returns are 31% overall. When I read the Other box by hand, most of it is about fit, but I can only read a few hundred at a time."</em>
              Show that 44% of returns (6,547/week) sit unread while RTO costs ₹120 per order.
            </p>
          </div>

          {/* Segment 2 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Segment 2: Why It Matters &amp; Economics (3 Minutes)
              </span>
              <button
                onClick={() => {
                  onSelectTab('cost-roi');
                  onClose();
                }}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Go to Cost &amp; ROI &rarr;
              </button>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Walk through the CTO cost line: Inference is only ₹0.007 per return (~₹50/week).
              Reducing returns by 2% saves <strong>₹59.9 Lakhs/year in logistics</strong> and protects repeat customer GMV (&gt;1,000x ROI).
            </p>
          </div>

          {/* Segment 3 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Segment 3: Live Demo (6 Minutes)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Technical Demo Lead</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
              <li>
                <strong>Prompt Chaining (Live Triage):</strong> Load "Gulabi Kurti" preset. Show Hinglish translation &rarr; root cause classification &rarr; +1.5" bust ease spec.
              </li>
              <li>
                <strong>Parallelization (Vendor Scorecards):</strong> Run batch analysis. Contrast Jaipur vendors (38% return rate) against Tiruppur mills.
              </li>
              <li>
                <strong>Evaluator-Optimizer (Weekly Fit Brief):</strong> Show the Monday morning document audited by the Judge model (98% factual accuracy).
              </li>
              <li>
                <strong className="text-rose-300">Failure Case (Mandatory):</strong> Go to Data Benchmark, run "Temporal Inversion" or "Broken Foreign Key". Show the system <em>fails visibly</em> with a red error card.
              </li>
            </ul>
          </div>

          {/* Segment 4 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Segment 4: What We Would Build Next (2 Minutes)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Product / Engineering</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Automated webhook to Unicommerce and Android app: when 3+ returns cite the same bust/waist defect on a SKU, the app auto-injects a dynamic "Order One Size Up" warning banner.
            </p>
          </div>

          {/* Segment 5 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                Segment 5: Questions &amp; Pushback Handling (6 Minutes)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">All 5 Team Members</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-white block">If Dev (CTO) asks: "Who runs this on Monday?"</span>
                <span className="text-slate-400 mt-0.5 block">
                  "It runs as deterministic scheduled scripts with zero ML maintenance. No ML engineer required."
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="font-semibold text-white block">If Ritu (CEO) asks: "What if it makes a mistake?"</span>
                <span className="text-slate-400 mt-0.5 block">
                  "The Evaluator Judge model audits every spec against factory tolerances before Neha sends it to Jaipur."
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
