# User & Presenter Guide — Dhaga & Co. Intelligence Radar

## Presentation Flow (Phase 3: 20-Minute Live Pitch)

### 1. The Problem (3 Minutes)
- **Speaker:** Lead Presenter
- Open with Neha's exact words: *"Returns are 31% overall. When I read the Other box by hand, most of it is about fit, but I can only read a few hundred at a time."*
- Highlight that 44% of returns (6,547/week) sit unread while RTO costs ₹120 per order.

### 2. Why It Matters & Economics (3 Minutes)
- **Speaker:** Financial / ROI Lead
- Navigate to the **Cost & ROI** tab.
- Walk through the arithmetic: At ₹840 AOV and ₹120 RTO logistics cost, reducing returns by 2% saves **₹59.9 Lakhs/year** against **~₹2,600/year in LLM costs** (>1,000x ROI).

### 3. Live Demo (6 Minutes)
- **Speaker:** Technical Demo Lead
- **A. Live Triage (Prompt Chaining):**
  - Select preset *"Gulabi Hand-block Printed Chanderi Kurti"*.
  - Show how Hinglish text is normalized and translated.
  - Show the 3 stages: Normalization &rarr; Root Cause (Color Bleed + Sizing Under-spec) &rarr; Pattern Master Fix.
- **B. Vendor Scorecards (Parallel Processing):**
  - Switch to **Vendor Scorecards** tab.
  - Click *"Run Parallel Batch Analysis"*. Show concurrent batch completion in <1 second.
  - Point out Jaipur vendors (Anokhi Weaves 38.4% returns, bust allowance tight) vs Tiruppur (Kongu Knits 19.8%, collar ribbing stretch).
- **C. Weekly Fit Brief (Evaluator-Optimizer):**
  - Switch to **Weekly Fit Brief** tab.
  - Click *"Generate Weekly Brief"*.
  - Show the Evaluator Verification Banner: 98% factual accuracy score, 0 hallucinations detected against 14k SKU catalogue.
- **D. Failure Case (Mandatory Ground Rule):**
  - Switch to **Data Benchmark** tab.
  - Select *"Return Before Delivery (Temporal Inversion)"* or *"Broken Foreign Key"*.
  - Click *"Validate Payload"*.
  - **Show that the system FAILS VISIBLY**: It rejects corrupted records with an explicit red banner before touching the LLM.

### 4. What We Would Build Next (2 Minutes)
- Direct ERP integration with Unicommerce & Metabase to automatically adjust size charts on the Android app when 3+ returns cite the same SKU.

### 5. Questions & Pushback (6 Minutes)
- **CTO Dev Pushback:** *"Who operates this on Monday?"*
  - Answer: It runs as an automated batch with deterministic code guards. No ML engineer needed.
- **CEO Ritu Pushback:** *"What if the model is wrong?"*
  - Answer: The Evaluator-Optimizer loop audits every brief against the catalogue, and data integrity benchmarks reject bad feeds.
