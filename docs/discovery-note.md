# Phase 1: Discovery Note — Dhaga & Co.

**Date:** September 28, 2026  
**Client:** Dhaga & Co. (Bengaluru, India)  
**Author:** FDE Academy Team — Mini Project 1  

---

## 1. The Problem in One Sentence (Client's Language)
> *"Returns are 31% overall. When I read the Other box by hand, most of it is about fit, but I can only read a few hundred at a time."* — Neha, Category Head

## 2. Who Owns It Today Inside the Company & What They Currently Do Instead
- **Owner:** Neha (Category Head), supported by Vivek (Listing Lead) and Faizan (Head of Supply Chain).
- **Current Workaround:** Neha manually reads a few hundred free-text "Other" return complaints each week out of 6,547 unclassified returns. The remaining 95%+ of unstructured feedback sits unanalyzed in Metabase. Meanwhile, merchandisers guess catalogue order each morning by instinct, and the drop calendar slips weekly because pattern sizing errors repeat across drops.

## 3. Evidence from the Case Study
1. **Unclassified Volume:** 44% of all returns land in the "Other" free-text dropdown option (Section 04).
2. **Untouched Data:** 410,000 product reviews with star ratings and free text sit 18 months deep; *"Nobody reads them. They are displayed and never analysed"* (Section 04).
3. **Severe Financial Waste:** Cash-on-Delivery (COD) represents 61% of orders, with a 26% Return to Origin (RTO) rate. Each RTO costs ₹120 in wasted courier freight and burned warehouse slots (Faizan, Section 05).
4. **Repeat Purchase Stagnation:** Repeat rate has been flat at 22% for six consecutive quarters (*"Every quarter we buy the same customer twice"*, Ritu, Section 05), heavily driven by disappointing fit and sizing inconsistencies across Jaipur and Tiruppur vendors.

## 4. What It Costs Them Today
- **Weekly Volume:** 48,000 orders/week &times; 31% return rate = 14,880 returns/week.
- **Unstructured "Other" Backlog:** 14,880 &times; 44% = **6,547 unclassified returns every single week**.
- **Logistics Bleed:** 6,547 returns &times; ₹120 RTO logistics cost = **₹7.85 Lakhs/week** (~₹4.08 Crore/year) in reverse logistics drain on the "Other" cohort alone.
- **Manual Labor Waste:** Neha spends ~6–8 hours/week manually reading ~300 rows, covering only 4.5% of incoming feedback while generating zero systematic pattern feedback for vendors.

## 5. What Success Looks Like & How to Measure It
- **Primary Metric:** Reduction in the overall return rate from 31% to 29% (a 2.0 percentage point reduction).
  - Measurement: 48,000 orders &times; 2% = **960 fewer returns/week** = **₹115,200/week (₹59.9 Lakhs/year) saved in direct logistics**.
- **Secondary Metrics:**
  - Automated triage coverage of 100% of "Other" returns (6,547/week) with <200ms latency.
  - Zero recurring sizing defects across consecutive Tuesday/Friday drops for corrected SKUs.
  - Increase in 90-day repeat purchase rate from 22% to 26%.

## 6. Ranked Shortlist of At Least Four Problems
1. **Rank 1 — Unclassified "Other" Returns & Sizing Defect Blindness (Selected Problem):**
   - *Why #1:* Directly addresses the 6,547 weekly return flood, reduces ₹120/order RTO losses, unblocks Neha, and provides actionable pattern fixes for Jaipur/Tiruppur vendors.
2. **Rank 2 — Customer Support WISMO ("Where Is My Order") Ticket Volume:**
   - *Why #2:* 58% of 9,000 weekly tickets are WISMO with 9-hour response times (Arpita, CX). However, WISMO is a symptom of patchy 4–7 day carrier delivery and COD verification, not the core business margin bleed.
3. **Rank 3 — Sourcing WhatsApp & Spreadsheet Disorganization:**
   - *Why #3:* 40 vendors with inconsistent Google Sheets. Important, but changing vendor communication habits requires operational change management rather than customer-facing AI workflow.
4. **Rank 4 — Listing Copy & Sample-to-Live Latency (6–9 Days):**
   - *Why #4:* Vivek loses Tuesday spikes when drops slip. However, generating descriptions faster without fixing pattern sizing issues only accelerates customer returns.

## 7. Biggest Assumption & Evidence That Would Prove It Wrong
- **Assumption:** Customers selecting "Other" and writing free-text in Hinglish are predominantly complaining about garment fit, sizing grading, and fabric quality discrepancies that can be corrected at the vendor pattern level.
- **Falsification Evidence:** If parsing 5,000+ "Other" entries reveals that returns are actually driven by external delivery delays, impulsive COD buyer remorse, or courier fraud rather than garment construction.
