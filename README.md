# Ad Campaign Creative Auditor & Generator

An end-to-end performance marketing intelligence platform that transforms messy ad export CSVs (Meta Ads, Google Ads, TikTok Ads) into actionable creative insights and high-converting ad variations using Gemini models and algorithmic diagnostic benchmarking.

---

## 📌 Executive Summary

Performance marketing teams often spend hours manually downloading, cleaning, and calculating derived metrics (CPA, ROAS, CTR, CPC, CPM) across ad exports, only to struggle with pinpointing *why* certain ad creatives succeeded while others burned budget.

**Ad Campaign Creative Auditor & Generator** automates this entire pipeline:
1. **Fuzzy CSV Normalization & Sanitization**: Ingests unstructured ad exports, standardizes non-standard column headers, infers missing metrics, and calculates data health scores.
2. **Algorithmic Classification & Diagnostic Benchmarking**: Dynamically classifies ads into **Winners**, **Underperformers**, **Fatigued**, and **Moderate** based on customizable target KPIs (ROAS, CPA, CTR, spend thresholds).
3. **AI Creative Pattern Extraction**: Leverages Google Gemini to extract repeatable linguistic hooks, angles, psychological triggers, and diagnose fatal flaws in underperforming copy.
4. **Ad Copy Workshop**: Generates 5 distinct, psychologically-grounded ad copy variations with editable hooks, body copy, CTAs, and one-click copy/export.
5. **Full Exportability**: Exports cleaned, enriched CSVs containing complete performance classifications and diagnostic audit notes.

---

## 🚀 Key Features

### 1. Robust CSV Cleaner & Ingestion Engine
- **Fuzzy Header Mapping**: Detects synonyms for metrics across Meta, Google, and TikTok exports (e.g., `amount_spent`, `cost`, `spend` → `spend`; `purchases`, `actions:purchase`, `conversions` → `conversions`).
- **Metric Imputation & Repair**: Automatically calculates derived metrics when missing:
  $$\text{CPA} = \frac{\text{Spend}}{\text{Conversions}}$$
  $$\text{ROAS} = \frac{\text{Revenue}}{\text{Spend}}$$
  $$\text{CTR} = \frac{\text{Clicks}}{\text{Impressions}} \times 100$$
- **Data Health Scorecard**: Flags anomalies such as zero spend with clicks, missing copy text, or incomplete attribution windows.

### 2. KPI Diagnostic Overview & Benchmarking
- **Executive Metric Cards**: Total spend, revenue generated, blended ROAS, average CPA, and total conversions.
- **Custom Benchmark Thresholds**: Configure target CPA, minimum ROAS, baseline CTR, and conversion volume to customize winner classification criteria per account or industry.
- **Visual Performance Distribution**: Interactive charts showing spend vs. revenue split and conversion efficiency across creative tiers.

### 3. Gemini Creative Pattern Extractor
- Analyzes winning ad copy to extract actionable creative hooks (e.g., *Direct Problem Callout*, *Social Proof / FOMO*, *Us vs. Them Contrast*).
- Identifies systemic flaws in underperforming ads (e.g., weak value proposition, passive CTAs, cognitive friction).
- **Graceful Quota & Rate-Limit Fallback**: Built-in fallback engine that derives statistical heuristic patterns and actionable copy recommendations even if external API limits are encountered.

### 4. 5-Variation Ad Copy Workshop
- Directly transforms insights into ready-to-test ad variants:
  1. **Direct Problem / Pain-Point Hook**
  2. **Social Proof & Authority Hook**
  3. **Us vs. Them / Reframe Hook**
  4. **Scarcity & Risk-Reversal Hook**
  5. **Curiosity / Pattern Interrupt Hook**
- One-click "Use in Ad Copy Workshop" workflow from any winning creative or pattern card.
- In-place copy editing, character count monitoring, and clipboard export.

### 5. Enriched CSV Export
- Generates clean, ready-to-share CSV files including calculated metrics, performance tiers, classification rationale, and diagnosis notes.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Canvas-Confetti |
| **Backend / Proxy** | Node.js, Express, TSX, Esbuild |
| **AI / LLM** | Google Gemini API (`@google/genai` SDK) |
| **Data Parsing** | PapaParse, custom regex normalization algorithms |

### System Workflow
```
[ Raw CSV Upload / Sample Data ]
              │
              ▼
   [ PapaParse + csvCleaner.ts ]
   • Fuzzy header mapping
   • Currency/numeric sanitization
   • Auto-derive CPA, ROAS, CTR
   • Data health scoring (0-100)
              │
              ▼
  [ KPI Diagnostic Engine ] ──► [ Benchmarking Modal ]
   • Winner / Underperformer       (User custom thresholds)
   • Performance breakdown
              │
              ▼
  [ Gemini Intelligence Engine (/api/analyze-creative-patterns) ]
   • Model cascade with fallback logic
   • Hook extraction & fatigue diagnosis
              │
              ▼
  [ Ad Copy Workshop & Enriched CSV Exporter ]
   • 5 structured ad hook variations
   • Filtered table with drawer details & CSV export
```

---

## 💡 Key Engineering Challenges & Solutions

1. **Handling Inconsistent & Dirty CSV Formats**:
   - *Problem*: Ad networks export headers in wildly different formats (`Campaign name`, `Ad name`, `Ad creative text`, `Primary Text`, `Cost (USD)`).
   - *Solution*: Built an exhaustive dictionary-based fuzzy resolver in `csvCleaner.ts` that strips punctuation, normalizes case, and parses currency strings (`$1,234.50`) into sanitized floating-point numbers.

2. **API Resilience & Rate Limit Mitigation**:
   - *Problem*: Free-tier Gemini limits or network hiccups could interrupt creative audits.
   - *Solution*: Designed a multi-tier fallback architecture:
     1. Primary call using `gemini-3.8-flash` with optimized prompt payloads and structured JSON schema.
     2. Secondary fallback model using `gemini-3.1-flash-lite`.
     3. Algorithmic heuristic analysis fallback that synthesizes top-quartile performance patterns directly from the ingested dataset, ensuring zero app downtime.

3. **High-Performance Client-Side React 19 State**:
   - Real-time reactivity where uploading a new CSV immediately refreshes all diagnostic metrics, benchmarks, and filtered views without full page reloads.

---

## 📋 Portfolio Presentation Points

- **Role**: Full-Stack Engineer & Product Designer
- **Key Metric**: Reduced manual campaign creative auditing and ad copywriting time from hours to seconds.
- **Competencies Demonstrated**: Full-Stack TypeScript development, LLM API integration (`@google/genai`), prompt engineering, data cleaning & normalization algorithms, data visualization, robust defensive error handling.
