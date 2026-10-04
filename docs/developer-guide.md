# Developer Guide — Dhaga & Co. Intelligence Radar

## 1. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     PRESENTATION TIER (Browser)                                  │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        React 19 SPA (TypeScript + Tailwind CSS + Recharts)               │   │
│   │                                                                                          │   │
│   │   [Top Nav & Security Modal]  [Where is the Data? Modal (inputs.zip 47.4 KB, DB, CSV)]   │   │
│   │                                                                                          │   │
│   │   Tab 1: Live Triage        Tab 2: Batch Pipeline      Tab 3: Weekly Fit Brief           │   │
│   │   (3-Stage Prompt Chain)    (Parallel Hub Scores)      (Evaluator + 4-Wk Line Chart)     │   │
│   │                                                                                          │   │
│   │   Tab 4: Data Validator     Tab 5: Cost & ROI Model    Tab 6: Observability Logs         │   │
│   │   (Fail Visibly Tests)      (Enterprise Economics)     (Telemetry & Error Simulator)     │   │
│   └─────────────────────────────────────────────┬────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┼────────────────────────────────────────────────┘
                                                  │
                                                  │ HTTPS REST /api/*
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DEFENSIVE BACKEND PROXY (Node / Express)                         │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ server.ts Gateway & Middlewares                                                          │   │
│   │   ├── Ingestion Boundary Validator (TC-01 to TC-04: Fails Visibly before LLM calls)       │   │
│   │   ├── Regex Key Scrubber (Auto-redacts sk-or-*, Bearer tokens from console & ring buffers)   │   │
│   │   ├── Static Asset Distributor (/inputs.zip, /dhaga_returns_template.csv)               │   │
│   │   └── Telemetry Buffer (Tracks latency, token usage, USD/INR costs per endpoint)         │   │
│   └──────────────────────────────┬───────────────────────────────┬───────────────────────────┘   │
└──────────────────────────────────┼───────────────────────────────┼───────────────────────────────┘
                                   │                               │
            In-Memory / Read       │                               │ Secure Server-to-Server
            Replica SQL Calls      │                               │ Authorization: Bearer sk-or-***
                                   ▼                               ▼
┌──────────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
│              DATA STORAGE TIER               │   │              MODEL INFERENCE TIER             │
│                                              │   │                                               │
│  ├── PostgreSQL / Metabase Read-Replica      │   │  OpenRouter Gateway (openrouter.ai/api/v1)   │
│  │   (14,280 Active SKUs, Vendor Masters)    │   │                                               │
│  ├── Ingestion Benchmark Archive             │   │  [Fast Model: google/gemini-2.5-flash]        │
│  │   (inputs.zip - 47.4 KB authentic dumps)  │   │  - Cost: ~$0.075 / 1M tokens (~₹0.007/return) │
│  └── Ring-Buffer Telemetry Store             │   │  - Role: Bulk translation, zoning, routing   │
│      (Latest 500 audit logs & metrics)       │   │                                               │
│                                              │   │  [Judge Model: anthropic/claude-3.5-sonnet]  │
│                                              │   │  - Cost: ~$3.00 / 1M tokens                   │
│                                              │   │  - Role: Evaluator-Optimizer & audit checks   │
└──────────────────────────────────────────────┘   └───────────────────────────────────────────────┘
```

---

## 2. End-to-End Processing Flow Diagram (4-Pattern Intelligence Engine)

```
 [Raw Customer Return Stream]
 (48,000 orders/week · 31% return rate · 44% in unclassified "Other" dropdown)
                 │
                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 0: DEFENSIVE INGESTION VALIDATOR (Code vs. Model Boundary)                                 │
 │                                                                                                 │
 │ Check: return_date >= delivered_date ? SKU exists in 14k catalogue ? Duplicate claim detected?  │
 └───────────────────────────────┬─────────────────────────────────┬───────────────────────────────┘
                                 │                                 │
                     [PASS] Valid Record               [FAIL] Corrupted Record
                                 │                                 │
                                 ▼                                 ▼
 ┌────────────────────────────────────────────────┐   ┌────────────────────────────────────────┐
 │ PATTERN 2: PARALLEL DISPATCHER                 │   │ FAIL VISIBLY BANNER                    │
 │ Partition into concurrent vendor batches       │   │ Halt execution, return 400 Bad Request │
 │ (Jaipur Hub Kurtis vs. Tiruppur Knits)         │   │ Log exception to audit stream          │
 └───────────────────────┬────────────────────────┘   └────────────────────────────────────────┘
                         │
                         ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PATTERN 1: 3-STAGE PROMPT CHAIN (Bulk Fast Model: gemini-2.5-flash)                            │
 │                                                                                                 │
 │   STAGE 1: Vernacular Normalization & Translation                                               │
 │   • Input: "Size M mangwaya tha par bust bohot tight hai aur rani gulabi color utar gaya"      │
 │   • Output: Standardized English + Pantone Normalized Color ("Fuchsia / Rani Pink")             │
 │                                 │                                                               │
 │                                 ▼                                                               │
 │   STAGE 2: Root Cause Classification & Severity Scoring                                         │
 │   • Garment Zone: Bust & Armhole Grading                                                        │
 │   • Root Cause: Sizing Defect (Under-spec) + Secondary Color Fastness Failure                   │
 │   • Defect Severity: 8 / 10 | Confidence: 94%                                                   │
 │                                 │                                                               │
 │                                 ▼                                                               │
 │   STAGE 3: Technical Spec Correction Note                                                       │
 │   • Pattern Master Directive: +1.5 inches bust ease on Size M; enforce ISO Level 4 wash fastness│
 └───────────────────────────────┬─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PATTERN 3: AUTOMATED DEPARTMENT ROUTING                                                         │
 │                                                                                                 │
 │   ├── [Severity >= 8 & Vendor Sizing Under-spec] ──► Vendor Sourcing Penalty & Pattern Hold     │
 │   ├── [Unlined Sheer Georgette]                  ──► Listing Copy Addendum (Vivek)              │
 │   ├── [Major Lot Color Bleed]                    ──► Warehouse Quarantine (Faizan)              │
 │   └── [Subjective Buyer Remorse]                 ──► CX Instant Refund & Retention Voucher      │
 └───────────────────────────────┬─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ PATTERN 4: EVALUATOR-OPTIMIZER LOOP (Weekly Executive Synthesis)                                │
 │                                                                                                 │
 │   ┌──────────────────────────────────────────┐                                                  │
 │   │ Generator Model (gemini-2.5-flash)       │                                                  │
 │   │ Aggregates high-risk SKU defect clusters │                                                  │
 │   └────────────────────┬─────────────────────┘                                                  │
 │                        │ Synthesized Draft Brief                                                │
 │                        ▼                                                                        │
 │   ┌──────────────────────────────────────────┐                                                  │
 │   │ Judge Auditor Model (claude-3.5-sonnet)  │                                                  │
 │   │ Audits draft against 14k SKU catalogue   │                                                  │
 │   │ Checks: Hallucinations? Spec feasibility?│                                                  │
 │   └────────────────────┬─────────────────────┘                                                  │
 │                        │                                                                        │
 │          ┌─────────────┴─────────────┐                                                          │
 │          │ Passed (Accuracy >= 95%)  │ Failed / Flagged                                         │
 │          ▼                           ▼                                                          │
 │   Finalized Brief             Regenerate with feedback critique notes                           │
 └────────────────────────┬────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ DOWNSTREAM EXECUTIVE DELIVERABLES                                                               │
 │                                                                                                 │
 │   1. Live React UI Dashboard & 4-Week Recharts Trend Line (W36 - W39)                           │
 │   2. 1-Click "Export to CSV" (18 parsed intelligence columns for Neha & Vivek)                  │
 │   3. Tuesday 400-SKU Factory Re-cutting Directives (Jaipur & Tiruppur pattern corrections)     │
 │   4. Annual Financial Impact: ₹59.9 Lakhs Logistics Saved vs. ₹2,600 LLM Bill (>1,000x ROI)     │
 └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mermaid Source Code

### System Architecture
```mermaid
graph TD
    subgraph Presentation_Tier [Client Browser - React 19 SPA]
        UI[App.tsx]
        T1[Live Triage: Prompt Chaining]
        T2[Batch Pipeline: Parallelization & CSV Export]
        T3[Weekly Fit Brief: Evaluator-Optimizer & Recharts]
        T4[Data Validator: Fail Visibly Tests]
        T5[Cost & ROI: Enterprise Economics]
        T6[Logs Console: Observability & Telemetry]
        DATA_MODAL[Where is the Data? Modal inputs.zip 47.4KB]
        UI --> T1
        UI --> T2
        UI --> T3
        UI --> T4
        UI --> T5
        UI --> T6
        UI --> DATA_MODAL
    end

    subgraph Backend_Tier [Express Server Gateway server.ts]
        GATEWAY[API Proxy /api/radar/*]
        GUARD[Defensive Gatekeeper TC-01..TC-04]
        SAN[Regex Secret Scrubber sk-or-***]
        LOGGER[Ring-Buffer Telemetry Logger]
        GATEWAY --> GUARD
        GATEWAY --> SAN
        GATEWAY --> LOGGER
    end

    subgraph Data_Tier [Data & Persistence]
        DB[(PostgreSQL / Metabase 14k SKUs)]
        ZIP[inputs.zip 47.4 KB Benchmark Data]
    end

    subgraph Model_Tier [OpenRouter AI Gateway]
        FAST[Bulk Classifier: google/gemini-2.5-flash]
        JUDGE[Judge Evaluator: anthropic/claude-3.5-sonnet]
    end

    Presentation_Tier -->|HTTPS REST JSON| Backend_Tier
    Backend_Tier -->|Catalogue Queries| Data_Tier
    Backend_Tier -->|Bearer sk-or-***| Model_Tier
```

### Pipeline Process Flow
```mermaid
flowchart TD
    RAW[Raw Customer Feedback 48k orders/wk] --> VAL{Ingestion Validator}
    VAL -->|Corrupted Date/SKU| FAIL[Fail Visibly Red Alert 400]
    VAL -->|Valid Record| PAR[Pattern 2: Parallel Batch Dispatcher]
    
    subgraph Pattern1 [Pattern 1: 3-Stage Prompt Chain]
        PAR --> STAGE1[Stage 1: Vernacular Normalization & Hinglish Translation]
        STAGE1 --> STAGE2[Stage 2: Root Cause Classification & Severity 1-10]
        STAGE2 --> STAGE3[Stage 3: Pattern Master Spec Correction Note]
    end

    subgraph Pattern3 [Pattern 3: Automated Department Routing]
        STAGE3 --> ROUTE{Severity & Root Cause}
        ROUTE -->|Sizing Under-spec| VEND[Vendor Sourcing Penalty]
        ROUTE -->|Sheer Fabric| LIST[Listing Copy Addendum]
        ROUTE -->|Color Bleed| QUAR[Warehouse Quarantine]
    end

    subgraph Pattern4 [Pattern 4: Evaluator-Optimizer Loop]
        STAGE3 --> GEN[Generator: Compile Weekly SKU Defect Clusters]
        GEN --> JUDGE[Judge Model: Audit Factuality against 14k SKUs]
        JUDGE -->|Accuracy >= 95%| BRIEF[Weekly Fit Brief & 4-Week Recharts Chart]
        JUDGE -->|Hallucination Detected| REFINE[Optimizer Loop Feedback]
        REFINE --> GEN
    end

    BRIEF --> CSV[1-Click Export to CSV]
    BRIEF --> EXEC[Neha & Vivek Tuesday Drop Approval]
```
