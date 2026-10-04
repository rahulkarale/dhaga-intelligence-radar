# Dhaga & Co. Intelligence Radar

> **Mini Project 1: Pattern-Based Workflow — The Dhaga & Co. Engagement**  
> AI-powered return & customer feedback intelligence radar for Dhaga & Co. Automates Hinglish return reason classification, vendor defect attribution, and weekly fit briefs for Category & Merchandising teams.

---

## 1. Executive Summary & Problem Addressed

- **Client:** Dhaga & Co. (D2C apparel brand in Bengaluru, ₹310 Cr GMV, 48,000 orders/week).
- **Core Stakeholder Problem:** Neha (Category Head) & Faizan (Head of Supply Chain):
  - Returns sit at **31% overall** with **44% falling into the unclassified "Other" free-text box** (~6,547 unclassified returns every week).
  - Neha can only manually inspect ~300 entries/week by hand (~4.5% of backlog).
  - Return to Origin (RTO) on Cash-on-Delivery costs **₹120 per order in direct reverse logistics**.
- **Solution:** A 4-pattern intelligence radar that:
  1. **Normalizes messy vernacular Hinglish** (e.g., *"bust area me bohot tight hai aur color utar gaya"*) and standardizes 90+ informal color spellings.
  2. **Classifies root causes** (Sizing Under-spec vs Color Bleed vs Fabric Transparency) and attributes defects directly to Jaipur & Tiruppur vendor lots.
  3. **Generates actionable Weekly Fit Briefs** with precise millimeter/inch pattern master corrections before the Tuesday 400-SKU drop.
  4. **Enforces strict data integrity defenses**, failing visibly on corrupted dates, broken foreign keys, and duplicate return claims.

---

## 2. Security Best Practices for OpenRouter API Key

This repository enforces industry security standards for API key management:

1. **Strict Server-Side Isolation:**
   - The OpenRouter API key (`OPENROUTER_API_KEY`) is **NEVER** exposed to client JavaScript or browser bundles.
   - All LLM invocations route through server-side Express proxy endpoints (`/api/radar/*`).
2. **Environment Variable Configuration:**
   - Keys are loaded strictly from `process.env.OPENROUTER_API_KEY`.
   - `.env` and `*.log` files are ignored in `.gitignore`. A sanitized template is provided in `.env.example`.
3. **Log Sanitization:**
   - The server logging engine uses regular expression scrubbers to automatically redact any strings matching `sk-or-*`, Bearer headers, or secret tokens before logging to console or ring-buffer memory.
4. **Dual Model Partitioning (Cost & Quality Optimization):**
   - **Bulk Classifier (Fast / Low-Cost):** `google/gemini-2.5-flash` (~$0.075 / 1M prompt tokens) for high-volume extraction, translation, and classification (~₹0.007 / return).
   - **Judge & Synthesizer (High-Reasoning):** `anthropic/claude-3.5-sonnet` (~$3.00 / 1M prompt tokens) for strategic Weekly Fit Briefs and hallucination checks.
5. **Safe Fallback & Session Overrides:**
   - If no key is configured in the environment, the app runs in deterministic safe fallback mode with full Dhaga & Co. data so reviewers can test immediately.
   - Reviewers can also supply a transient session key in the UI stored in `sessionStorage` and passed via `x-openrouter-key` header without altering server environment files.

---

## 3. Observability & Logging System

A real-time logging console is built into the application (`/api/logs` and the **Logs** tab):
- **Structured Levels:** `DEBUG`, `INFO`, `WARN`, `ERROR`.
- **Telemetry Tracked:** Request latency (ms), prompt/completion tokens, model role, estimated USD/INR cost.
- **Error Monitoring:** A built-in "Simulate API Error" button triggers a simulated upstream 429/500 error to test alerting, graceful degradation, and UI resilience.
- **Export:** Instant one-click JSON export for triage and audit logs.

---

## 4. Cold Start in 5 Minutes (Local Setup)

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure Environment Variables
cp .env.example .env
# Edit .env and insert your OPENROUTER_API_KEY (optional; fallback mode works out of the box)

# 3. Start Fullstack Application (Server + Vite)
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## 5. Cost Line & Economic Arithmetic

- **Dhaga & Co. Volume:** 48,000 orders/wk &times; 31% return rate &times; 44% in "Other" = **6,547 unclassified returns/week**.
- **LLM Cost Per Return:** ~$0.000085 USD (~₹0.0074 INR) for ~550 tokens.
- **Weekly LLM Bill:** ~$0.57 USD (~₹50 INR/week) = ~₹2,600 INR/year.
- **Financial Return:** Reducing returns by just **2.0% points** prevents **960 RTOs/week** &times; ₹120 logistics cost = **₹1.15 Lakhs/week** (~₹60 Lakhs/year).
- **ROI Ratio:** > **1,000x** return on inference investment.
