"""Analytics, reporting, metrics, and CSV export utilities for Dhaga & Co."""

import csv
import io
from typing import List, Dict, Any
from .models import AnalysisResult


def export_to_csv(results: List[AnalysisResult], file_path: str = None) -> str:
    """Export processed return intelligence to CSV format."""
    headers = [
        "Return ID",
        "SKU",
        "Vendor ID",
        "Vendor Name",
        "Original Customer Feedback",
        "Translated English Feedback",
        "Normalized Color",
        "Garment Zone",
        "Root Cause Classification",
        "Confidence Score",
        "Defect Severity (1-10)",
        "Department Routing",
        "Actionable Recommendation",
        "Pattern Master Spec Correction",
        "Pipeline Mode",
        "Latency (ms)",
        "Total Tokens",
        "Inference Cost (USD)",
    ]

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow(headers)

    for r in results:
        writer.writerow([
            r.return_id,
            r.sku,
            r.vendor_id,
            r.vendor_name,
            r.raw_text,
            r.translated_english or r.normalized_text,
            r.normalized_color,
            r.garment_zone,
            r.root_cause,
            r.confidence_score,
            r.severity_score,
            r.routing_target,
            r.actionable_recommendation,
            r.spec_correction_note,
            r.mode,
            r.timing_ms,
            r.tokens.get("total", 0),
            f"{r.cost_usd:.6f}",
        ])

    csv_string = output.getvalue()
    if file_path:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(csv_string)
    return csv_string


def calculate_metrics(results: List[AnalysisResult]) -> Dict[str, Any]:
    """Calculate economic and operational metrics for Dhaga & Co."""
    total_processed = len(results)
    if total_processed == 0:
        return {}

    total_tokens = sum(r.tokens.get("total", 0) for r in results)
    total_cost_usd = sum(r.cost_usd for r in results)
    usd_to_inr = 87.5
    cost_inr = total_cost_usd * usd_to_inr
    avg_latency = sum(r.timing_ms for r in results) / total_processed

    # Dhaga & Co. Economics (48,000 orders/wk, 31% return rate, 44% in 'Other' = 6,547 unclassified returns/wk)
    weekly_unclassified = 6547
    prevented_returns_per_week = 960  # 2.0% return rate reduction
    logistics_cost_per_rto = 120.0  # INR

    weekly_llm_cost_inr = (weekly_unclassified * (total_cost_usd / total_processed)) * usd_to_inr
    weekly_logistics_saved_inr = prevented_returns_per_week * logistics_cost_per_rto
    roi_multiplier = weekly_logistics_saved_inr / max(weekly_llm_cost_inr, 1.0)

    return {
        "total_processed": total_processed,
        "total_tokens": total_tokens,
        "total_cost_usd": total_cost_usd,
        "total_cost_inr": cost_inr,
        "avg_latency_ms": round(avg_latency, 1),
        "weekly_llm_cost_inr": round(weekly_llm_cost_inr, 2),
        "weekly_logistics_saved_inr": weekly_logistics_saved_inr,
        "annual_logistics_saved_inr": weekly_logistics_saved_inr * 52,
        "roi_multiplier": round(roi_multiplier, 0),
    }
