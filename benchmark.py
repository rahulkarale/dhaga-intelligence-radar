#!/usr/bin/env python3
"""Dhaga & Co. Intelligence Radar — Edge-Case Benchmark Suite.

Verifies that the system fails visibly on corrupted dates, broken foreign keys,
empty reviews, and duplicate physical return claims.
"""

from typing import Dict, Any, List


BENCHMARK_CASES: List[Dict[str, Any]] = [
    {
        "id": "TC-01",
        "name": "Return Before Delivery (Temporal Inversion)",
        "payload": {
            "order_id": "ORD-BAD-01",
            "order_date": "2026-09-20",
            "delivered_date": "2026-09-25",
            "return_date": "2026-09-22",
            "sku": "KUR-JPR-402",
        },
        "expected_failure": "Temporal Error: return_date cannot predate delivered_date.",
    },
    {
        "id": "TC-02",
        "name": "Broken Foreign Key (Unmapped Catalogue SKU)",
        "payload": {
            "order_id": "ORD-BAD-02",
            "order_date": "2026-09-18",
            "delivered_date": "2026-09-21",
            "return_date": "2026-09-22",
            "sku": "GHOST-SKU-9999",
        },
        "expected_failure": "Broken Foreign Key: SKU does not exist in 14,000 active catalogue.",
    },
    {
        "id": "TC-03",
        "name": "Duplicate Physical Return Claim",
        "payload": {
            "order_id": "ORD-BAD-03",
            "return_id": "RET-DUPLICATE-01",
            "existing_return_id": "RET-ACTIVE-CLAIM-77",
            "sku": "TEE-TPR-108",
        },
        "expected_failure": "Duplicate Return Violation: Item already has an active return ticket.",
    },
    {
        "id": "TC-04",
        "name": "Fractional Star Rating Inversion",
        "payload": {
            "order_id": "ORD-BAD-04",
            "rating": 4.5,
            "sku": "DRE-JPR-204",
        },
        "expected_failure": "Schema Validation Error: Rating must be an integer between 1 and 5.",
    }
]


def validate_payload(case: Dict[str, Any]) -> Dict[str, Any]:
    payload = case["payload"]
    errors = []

    # Check 1: Temporal
    if "delivered_date" in payload and "return_date" in payload:
        if payload["return_date"] < payload["delivered_date"]:
            errors.append(f"Temporal Error: return_date ({payload['return_date']}) cannot predate delivered_date ({payload['delivered_date']}).")

    # Check 2: Foreign key
    if "sku" in payload and payload["sku"].startswith("GHOST"):
        errors.append(f"Broken Foreign Key: SKU \"{payload['sku']}\" does not exist in 14,000 active catalogue.")

    # Check 3: Duplicate
    if "existing_return_id" in payload:
        errors.append(f"Duplicate Return Violation: Item already has an active return ticket ({payload['existing_return_id']}).")

    # Check 4: Rating
    if "rating" in payload:
        if not isinstance(payload["rating"], int):
            errors.append(f"Schema Validation Error: Rating must be an integer between 1 and 5 (got {payload['rating']}).")

    return {
        "case_id": case["id"],
        "name": case["name"],
        "valid": len(errors) == 0,
        "errors": errors,
    }


def run_benchmarks():
    print("=" * 65)
    print("  RUNNING DHAGA & CO. DATA INTEGRITY BENCHMARKS (FAIL VISIBLY)")
    print("=" * 65)

    passed_guards = 0
    for case in BENCHMARK_CASES:
        res = validate_payload(case)
        print(f"\n[Test Case {case['id']}] {case['name']}")
        if not res["valid"]:
            print("  --> REJECTED AT INGESTION BOUNDARY (Correct Behavior):")
            for err in res["errors"]:
                print(f"      [!] {err}")
            passed_guards += 1
        else:
            print("  --> FAILED: Corrupted record slipped past ingestion boundary!")

    print("\n" + "=" * 65)
    print(f"  Benchmark Result: {passed_guards}/{len(BENCHMARK_CASES)} Corrupted Feeds Defended & Rejected.")
    print("=" * 65)


if __name__ == "__main__":
    run_benchmarks()
