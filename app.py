#!/usr/bin/env python3
"""Dhaga & Co. Intelligence Radar — Python Entrypoint & CLI.

Runs the 4-pattern workflow, processes returns, generates fit briefs, and exports CSV.
"""

import os
import sys
import json
from radar.data import load_sample_returns, load_vendors
from radar.pipeline import RadarPipeline
from radar.analysis import export_to_csv, calculate_metrics


def main():
    print("=" * 65)
    print("  DHAGA & CO. RETURN INTELLIGENCE RADAR (PYTHON ENGINE)")
    print("  48,000 orders/wk · 31% Return Rate · 44% in 'Other' Unclassified")
    print("=" * 65)

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if api_key:
        masked = f"sk-or-v1-••••••••{api_key[-4:]}"
        print(f"[*] OpenRouter Key Detected: {masked}")
    else:
        print("[!] No OPENROUTER_API_KEY set. Running in deterministic fallback mode.")

    pipeline = RadarPipeline(api_key=api_key)
    sample_returns = load_sample_returns()
    print(f"\n[1] Loaded {len(sample_returns)} sample return records from Dhaga & Co.")

    print("\n[2] Executing Batch Pipeline (Pattern #2: Parallel Processing)...")
    batch_result = pipeline.analyze_batch(sample_returns)
    print(f"    - Processed {len(batch_result.results)} returns in {batch_result.total_time_ms}ms")
    print(f"    - Total tokens: {batch_result.total_tokens}, Cost: ${batch_result.total_cost_usd:.6f}")

    print("\n[3] Root Cause Classification Breakdown:")
    for cause, count in batch_result.summary_by_root_cause.items():
        print(f"    - {cause}: {count}")

    print("\n[4] Generating Weekly Fit Brief (Pattern #4: Evaluator-Optimizer)...")
    brief = pipeline.generate_weekly_fit_brief(batch_result.results)
    print(f"    - Evaluator Accuracy Score: {brief.evaluator_accuracy_score * 100}%")
    print(f"    - Top Cluster SKU: {brief.top_sku_defect_clusters[0].sku}")
    print(f"    - Exact Pattern Fix: {brief.top_sku_defect_clusters[0].exact_pattern_master_fix}")

    print("\n[5] Exporting Return Intelligence to CSV...")
    csv_file = "dhaga_return_intelligence.csv"
    export_to_csv(batch_result.results, file_path=csv_file)
    print(f"    [+] Saved CSV report to: {csv_file}")

    metrics = calculate_metrics(batch_result.results)
    print("\n[6] Enterprise Economics & ROI:")
    print(f"    - Weekly LLM Cost: ₹{metrics.get('weekly_llm_cost_inr', 0):,.2f}")
    print(f"    - Weekly Logistics Savings (2% return reduction): ₹{metrics.get('weekly_logistics_saved_inr', 0):,.2f}")
    print(f"    - Annual Savings: ₹{metrics.get('annual_logistics_saved_inr', 0):,.2f}")
    print(f"    - ROI Ratio: {metrics.get('roi_multiplier', 0)}x")
    print("=" * 65)


if __name__ == "__main__":
    main()
