"""Data models and schemas for Dhaga & Co. Intelligence Radar."""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass
class ReturnRecord:
    id: str
    order_id: str
    order_date: str
    delivered_date: str
    return_date: str
    sku: str
    product_name: str
    vendor_id: str
    vendor_name: str
    category: str
    price: float
    size_ordered: str
    color_raw: str
    official_return_reason: str
    free_text_other_reason: str
    customer_language: str = "Hinglish"
    cod: bool = True
    status: str = "Initiated"


@dataclass
class AnalysisResult:
    return_id: str
    sku: str
    vendor_id: str
    vendor_name: str
    raw_text: str
    normalized_text: str
    translated_english: str
    normalized_color: str
    garment_zone: str
    root_cause: str
    confidence_score: float
    severity_score: int
    routing_target: str
    actionable_recommendation: str
    spec_correction_note: str
    timing_ms: int = 0
    tokens: Dict[str, int] = field(default_factory=lambda: {"prompt": 0, "completion": 0, "total": 0})
    cost_usd: float = 0.0
    mode: str = "live"


@dataclass
class BatchResult:
    results: List[AnalysisResult]
    total_time_ms: int
    total_tokens: int
    total_cost_usd: float
    summary_by_root_cause: Dict[str, int]
    summary_by_vendor: Dict[str, Any]


@dataclass
class SkuDefectCluster:
    sku: str
    product_name: str
    vendor_name: str
    defect_category: str
    occurrences: int
    primary_garment_zone: str
    exact_pattern_master_fix: str
    urgency: str


@dataclass
class WeeklyFitBrief:
    brief_id: str
    generated_at: str
    week_number: int
    year: int
    executive_summary: str
    key_findings: List[str]
    vendor_accountability_actions: List[Dict[str, Any]]
    catalogue_copy_fixes: List[Dict[str, Any]]
    top_sku_defect_clusters: List[SkuDefectCluster]
    evaluator_accuracy_score: float
    evaluator_audit_notes: str
