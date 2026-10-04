# intelligence-radar

> **Dhaga & Co. Return & Customer Feedback Intelligence Radar**  
> AI-powered intelligence radar for Dhaga & Co. Automates Hinglish return reason classification, vendor defect attribution, and weekly fit briefs for Category & Merchandising teams.

---

## 1. Project Overview & Stakeholder Context

- **Client:** Dhaga & Co. (Bengaluru, India — D2C apparel brand, ₹310 Cr GMV, 48,000 orders/week).
- **Core Problem:** Neha (Category Head) & Faizan (Head of Supply Chain):
  - Return rate is **31% overall** (~14,880 returns/week).
  - **44% of all returns land in the unclassified "Other" free-text dropdown** (~6,547 unclassified returns every single week).
  - Neha manually inspects only ~300 rows/week (~4.5% of incoming backlog), leaving 95%+ of unstructured feedback unanalyzed.
  - Return to Origin (RTO) on Cash-on-Delivery (61% of orders) costs **₹120 per order in direct reverse courier logistics**.
- **Solution:** A 4-pattern enterprise intelligence system that:
  1. Translates & normalizes vernacular Hinglish (*"bust area bohot tight hai aur color utar gaya"*) and standardizes 90+ informal color spellings into pantone equivalents.
  2. Extracts garment zones (*Bust, Neckline, Waist, Fabric*) and attributes root causes directly to vendor manufacturing hubs (Tiruppur vs. Jaipur).
  3. Synthesizes an executive **Weekly Fit Brief** audited by an Evaluator-Optimizer Judge model before the Tuesday 400-SKU drop.
  4. Enforces strict ingestion defenses (temporal sequence, foreign keys, duplicate claims) that **fail visibly** before touching the LLM.

---

## 2. Repository Structure

```
intelligence-radar/
├── app.py                     # Main Python entrypoint & CLI pipeline runner
├── benchmark.py               # Edge-case benchmark suite (fails visibly on bad inputs)
├── schema.sql                 # PostgreSQL / relational database schema
├── requirements.txt           # Python package dependencies
├── pyproject.toml             # Python build configuration
├── server.ts                  # Express backend proxy with security scrubber & Vite middleware
├── package.json               # Node.js dependencies & scripts
├── docs/                      # Course deliverables & technical specifications
│   ├── discovery-note.md      # Phase 1: 1-Page Discovery Note (7 Core Items)
│   ├── build-note.md          # Phase 2: 2-Page Technical Build Note & Architecture
│   ├── developer-guide.md     # Architecture, security & developer manual
│   └── user-guide.md          # 20-minute executive presentation script for Phase 3
├── radar/                     # Core Python Intelligence Radar package
│   ├── __init__.py            # Module exports
│   ├── models.py              # Dataclasses (ReturnRecord, AnalysisResult, WeeklyFitBrief)
│   ├── pipeline.py            # 4 Workflow Patterns (Chaining, Parallel, Routing, Evaluator)
│   ├── data.py                # Sample returns, vendor catalogues, seed data
│   └── analysis.py            # CSV export and economic ROI calculations
├── tests/                     # Automated test suite
│   └── test_radar.py          # Unit tests (single triage, batch, CSV export, metrics)
└── src/                       # Production React SPA Frontend (TypeScript + Tailwind CSS)
    ├── App.tsx                # Main viewport & navigation orchestrator
    ├── api.ts                 # Type-safe client HTTP SDK
    ├── types.ts               # Shared contracts & TypeScript interfaces
    └── components/
        ├── Navbar.tsx         # Executive KPI status bar & presentation triggers
        ├── LiveRadarView.tsx  # Pattern 1: 3-Stage Prompt Chaining live triage
        ├── BatchPipelineView.tsx # Pattern 2: Parallel batch processing & Export to CSV
        ├── WeeklyFitBriefView.tsx # Pattern 4: Evaluator-Optimizer weekly executive brief
        ├── DataValidatorView.tsx  # Defensive benchmark suite (Fails Visibly)
        ├── CostRoiView.tsx    # Financial arithmetic & economics model
        ├── LogsView.tsx       # Live observability console & error simulator
        ├── SecurityKeyModal.tsx # OpenRouter API key governance & validation modal
        └── PitchGuideModal.tsx  # 20-Minute Phase 3 live presentation pitch deck
```

---

## 3. The 4 Workflow Patterns

| Pattern | Component | Purpose & Implementation |
| :--- | :--- | :--- |
| **Pattern 1: Prompt Chaining** | `LiveRadarView.tsx`<br>`radar/pipeline.py` | 3 sequential stages: Stage 1 (Vernacular translation & color normalization) &rarr; Stage 2 (Root cause classification & department routing) &rarr; Stage 3 (Pattern master spec correction note). Prevents hallucination by isolating language comprehension from garment engineering. |
| **Pattern 2: Parallelization** | `BatchPipelineView.tsx`<br>`radar/pipeline.py` | Concurrently processes batches across Tiruppur and Jaipur manufacturing hubs. Discovers systematic pattern cuts, fabric opacity flaws, and neck-ribbing distortion in seconds. |
| **Pattern 3: Routing** | `LiveRadarView.tsx`<br>`server.ts` | Deterministic and model-guided routing dispatching actions to **Vendor Sourcing**, **Listing Copy Fixes**, **Warehouse Quarantine**, or **CX Retention**. |
| **Pattern 4: Evaluator-Optimizer** | `WeeklyFitBriefView.tsx`<br>`radar/pipeline.py` | Generates the Monday morning executive brief synthesized by a Fast model and audited by a High-Reasoning Judge model (`claude-3.5-sonnet`) to ensure 0% hallucination against 14k SKUs. |

---

## 4. 'Export to CSV' Feature

The repository supports exporting processed return intelligence to CSV for reporting to Neha (Category Head) and Vivek (Listing Lead):

### A. Via the Web Frontend (`BatchPipelineView`)
1. Navigate to the **Vendor Scorecards / Batch Pipeline** tab.
2. Click **"Run Parallel Batch Analysis"** to process the return batch concurrently.
3. Click **"Export to CSV"** (with download icon). The browser immediately downloads `dhaga_return_intelligence_YYYY-MM-DD.csv`.

### B. Via Backend API Endpoint
```bash
curl -X POST http://localhost:3000/api/radar/export-csv \
     -H "Content-Type: application/json" \
     -o returns_report.csv
```

### C. Via Python Pipeline
```python
from radar.data import load_sample_returns
from radar.pipeline import RadarPipeline
from radar.analysis import export_to_csv

pipeline = RadarPipeline()
batch_res = pipeline.analyze_batch(load_sample_returns())
export_to_csv(batch_res.results, file_path="dhaga_return_intelligence.csv")
```

### CSV Schema Fields
- `Return ID`, `SKU`, `Vendor ID`, `Vendor Name`
- `Original Customer Feedback` (raw Hinglish/vernacular)
- `Translated English Feedback`
- `Normalized Color` (e.g. `rani gulabi` &rarr; `Fuchsia / Rani Pink`)
- `Garment Zone` (`Bust`, `Neckline`, `Waist`, `Fabric/Transparency`, `Shoulder/Sleeve`)
- `Root Cause Classification` (`Sizing Defect (Under-spec)`, `Collar Ribbing Deformation`, etc.)
- `Confidence Score` & `Defect Severity (1-10)`
- `Department Routing` (`Vendor Sourcing Action`, `Listing Copy Fix`, `Warehouse Quarantine`)
- `Actionable Recommendation`
- `Pattern Master Spec Correction` (+1.5" bust ease, 5% spandex collar ribbing)
- `Pipeline Mode` (`live` / `fallback`)
- `Latency (ms)`, `Total Tokens`, `Inference Cost (USD)`

---

## 5. Defensive Engineering & Fail Visibly Benchmark

Per project guidelines, the system **fails visibly** on corrupted data feeds rather than passing bad data to the LLM:

| Benchmark Case | Bad Input Type | Defensive Behavior |
| :--- | :--- | :--- |
| **TC-01** | Temporal Inversion (`return_date < delivered_date`) | Blocked at ingestion; displays red error card: *"Temporal Error: return_date cannot predate delivered_date"*. |
| **TC-02** | Broken Foreign Key (`GHOST-SKU-9999`) | Blocked against master catalogue of 14k SKUs. |
| **TC-03** | Duplicate Physical Return Claim | Blocked with duplicate ticket alert. |
| **TC-04** | Fractional Star Rating (e.g. `4.5`) | Schema validator rejects non-integer rating bounds. |

---

## 6. How to Run in 5 Minutes

### Option 1: Full-Stack Web Application (Port 3000)
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (Optional — runs in safe fallback if omitted)
cp .env.example .env
# Set OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Option 2: Standalone Python CLI & Pipeline
```bash
# 1. Run main CLI runner (processes batch, generates brief, exports CSV)
python3 app.py

# 2. Run data integrity benchmarks (fails visibly tests)
python3 benchmark.py

# 3. Run automated unit tests
python3 -m unittest discover tests
```

---

## 7. Cost Line & Economic Arithmetic

- **Dhaga & Co. Volume:** 48,000 orders/wk &times; 31% return rate &times; 44% in "Other" = **6,547 unclassified returns/week**.
- **Inference Cost Per Return:** ~$0.000085 USD (~₹0.0074 INR) for ~550 tokens on `google/gemini-2.5-flash`.
- **Weekly LLM Cost:** ~$0.57 USD (~₹50 INR/week) = ~₹2,600 INR/year.
- **Logistics Savings:** Reducing returns by **2.0% points** prevents **960 RTOs/week** &times; ₹120 logistics cost = **₹1.15 Lakhs/week** (~₹60 Lakhs/year).
- **ROI Multiplier:** **> 1,000x** return on inference investment.

---

## 8. Security & Key Governance Best Practices

- **Zero Client Key Exposure:** The API key is stored strictly on the server (`OPENROUTER_API_KEY`) and is never delivered to client-side bundles.
- **Automated Regex Sanitization:** The logger automatically redacts `sk-or-*`, Bearer tokens, and secrets before writing to logs or telemetry buffers.
- **Live Masking:** The UI displays masked key status (`sk-or-v1••••••••49d5`) with a 1-click test ping.
- **Simulate API Error:** The **Logs** tab includes an error injection toggle to test system resilience under rate limits (429) or timeouts (504).
