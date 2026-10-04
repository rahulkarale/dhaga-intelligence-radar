# Phase 2: Build Note — Dhaga & Co. Intelligence Radar

**Product:** Dhaga & Co. Intelligence Radar  
**Version:** 1.0-MVP (Deployed)  
**Deliverable:** 2-Page Technical Architectural Justification  

---

## 1. Code vs. Model Line (Deterministic vs. Probabilistic Split)

| Step / Boundary | Implementation Type | Justification |
| :--- | :--- | :--- |
| **Ingestion & Payload Validation** | **Deterministic Code** | Temporal checks (`return_date >= delivered_date`), foreign key verification against 14k SKU catalogue, and schema constraints must be exact and zero-cost. A model should never do arithmetic or date comparisons. |
| **Hinglish Translation & Normalization** | **Model Call (Fast)** | Messy vernacular text (*"bust area bohot tight hai aur color utar gaya"*) and 90 informal color spellings (*"rani gulabi"*, *"haldi yellow"*) require semantic language comprehension. |
| **Garment Zone & Root Cause Tagging** | **Model Call (Fast)** | Multi-label extraction mapping complaints to specific garment zones (Bust, Sleeve, Waist) and root cause categories. |
| **Department Routing Decision** | **Deterministic Code** | Rules-based routing maps high-severity vendor defects to Sourcing, copy discrepancies to Listing, and pigment bleeding to Warehouse Quarantine. |
| **Weekly Fit Brief Synthesis** | **Model Call (Fast)** | Creative clustering of weekly defect patterns into executive narrative for Category & Listing leads. |
| **Evaluator-Optimizer Factuality Audit** | **Model Call (Judge)** | Deep reasoning model audits the synthesized brief against live SKU database to detect any hallucinated specifications. |
| **Log Scrubbing & Metrics Accounting** | **Deterministic Code** | Regex redaction of API keys, latency tracking, token arithmetic, and ROI calculation are 100% deterministic code. |

---

## 2. Why Each Pattern Is There

### Pattern 1: Prompt Chaining (Stage 1 &rarr; Stage 2 &rarr; Stage 3)
- **Why it is needed:** An all-in-one single prompt trying to translate Hinglish, classify root cause, attribute vendor fault, and prescribe pattern master grading in one step suffers from high variance and hallucination.
- **What breaks without it:** The model frequently hallucinates garment measurements when trying to parse Hinglish slang at the same time. Chaining isolates normalization (Stage 1) from classification (Stage 2) and technical spec correction (Stage 3).

### Pattern 2: Parallelization (Batch Concurrent Processing)
- **Why it is needed:** At Dhaga & Co.'s scale of 6,547 unclassified returns per week, sequential processing would take 25+ minutes per batch.
- **What breaks without it:** Latency explodes and the listing team cannot triage the Monday morning batch before the Tuesday 400-SKU drop. Concurrent asynchronous calls process batches in seconds.

### Pattern 3: Routing (Automated Department Dispatch)
- **Why it is needed:** Complaints need fundamentally different operational interventions (Vendor Sourcing vs. Listing Copy vs. Warehouse Quarantine vs. Customer Retention).
- **What breaks without it:** Complaints get dumped into a single generic queue, reproducing the Freshdesk bottleneck where agents copy-paste canned replies.

### Pattern 4: Evaluator-Optimizer (Weekly Fit Brief)
- **Why it is needed:** Fabric masters and garment pattern makers in Tiruppur and Jaipur will reject any spec adjustments that contradict actual factory tolerances or cite non-existent SKU numbers.
- **What breaks without it:** The CTO and Category Head cannot trust an un-audited model output to halt vendor payments or alter production blocks. The Judge model critiques and verifies factuality before executive presentation.

---

## 3. The Cost Line & Enterprise Volume Arithmetic

- **Dhaga & Co. Volume:** 48,000 orders/wk &times; 31% return rate &times; 44% in "Other" = **6,547 unclassified returns/week**.
- **Model Pricing:**
  - Fast Model (`google/gemini-2.5-flash`): $0.075 / 1M prompt tokens, $0.30 / 1M completion tokens.
  - Judge Model (`anthropic/claude-3.5-sonnet`): $3.00 / 1M prompt tokens, $15.00 / 1M completion tokens.
- **Unit Economics Per Return:**
  - Prompt: ~400 tokens ($0.000030)
  - Completion: ~150 tokens ($0.000045)
  - Cost per run: **$0.000075 USD (~₹0.0065 INR)**.
- **Weekly & Annual Infrastructure Cost:**
  - Weekly bulk triage: 6,547 &times; $0.000075 = **$0.49 USD/week (~₹43/week)**.
  - Weekly Judge brief audit: **$0.05 USD/week (~₹4.4/week)**.
  - Total Annual LLM Cost: **~$28 USD/year (~₹2,450 INR/year)**.
- **Return on Investment (ROI):**
  - Reducing returns by just **2.0% points** prevents **960 RTOs/week**.
  - Logistics savings: 960 &times; ₹120 = **₹115,200/week (₹59.9 Lakhs/year)**.
  - ROI Ratio: **> 1,000x**.

---

## 4. The Thing That Broke That We Did Not Expect

**The Failure:**
When testing the live system, we observed an error:
`Failed to load logs: Unexpected token '<', "<!doctype "... is not valid JSON`.

**Why it broke:**
The frontend observability console (`LogsView`) polls `/api/logs` every 3 seconds to stream live telemetry. During transient server restarts or before the Express server finished binding to port 3000, Vite's SPA fallback interceptor returned `index.html` (starting with `<!doctype html>`) instead of JSON. The browser's `res.json()` threw a syntax error when parsing the HTML.

**How we fixed it:**
1. Added an explicit catch-all JSON 404 handler (`app.all('/api/*', ...)`) in `server.ts` before the Vite middleware, guaranteeing that no API endpoint ever falls through to HTML.
2. Built `safeJsonFetch` on the client to inspect `Content-Type` headers before calling `.json()`.
3. Added visibility checks (`!document.hidden`) so polling pauses when the tab is backgrounded.
