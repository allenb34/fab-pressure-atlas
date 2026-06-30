# FabPressure: Semiconductor Expansion Risk Atlas

**Live app:** https://fab-pressure-atlas.lovable.app/

An interactive global intelligence atlas mapping where semiconductor fab expansion faces the greatest operational and environmental pressure — not a sustainability leaderboard, but a spatial risk visualization grounded in a tested, honestly-reported claim.

---

## Core Thesis

Instead of asking *"Which company is most sustainable?"*, this project asks: **"Where does semiconductor expansion face the greatest operational and environmental pressure — and does that pressure predict real-world delays?"**

## Headline Finding

A composite **Pressure Score** was built per facility (water stress + grid carbon intensity + disclosure confidence) and tested against reported construction delay status across 24 facilities in 9 countries.

> **On-schedule facilities averaged a higher pressure score than delayed facilities** (0.38 vs. 0.32, n=24) — a null/counter result relative to the original hypothesis. The most plausible explanation is that geography and market demand drive reported delays more than physical environmental constraint in this sample (e.g., GlobalFoundries Crolles stalled for demand reasons despite a low pressure score; Samsung Gwangju and GlobalFoundries Singapore score highest on pressure while remaining on schedule).

This result is reported as-is in the [Methodology page](https://fab-pressure-atlas.lovable.app/methodology) rather than adjusted to fit the hypothesis — consistent with how I treat null results across my other portfolio projects (see [FabPressure DiD dividend analysis]).

## What's Inside

| Page | Purpose |
|---|---|
| **Atlas** (home) | Interactive global map — 24 fab facilities, color-coded by Pressure Score, sized by capex, with delay-status pulse indicators |
| **Facility Profiles** | Card-based detail view with sub-score breakdowns (water stress, grid intensity, disclosure confidence) and per-layer confidence flags |
| **Methodology & Sources** | Full data transparency — scoring methodology, known omissions, limitations, and citations |

## Data Layers & Sources

| Layer | Source | Coverage |
|---|---|---|
| Facility location, capex, status, delay history | Public trade press (SemiEngineering, UltraFacility, Manufacturing Megaprojects Tracker), company IR pages | Global, all 24 facilities |
| Baseline water stress | [WRI Aqueduct 4.0](https://www.wri.org/applications/aqueduct/water-risk-atlas/) | Verified for all 24 sites |
| Grid carbon intensity | [Ember Yearly Electricity Data](https://ember-energy.org/data/yearly-electricity-data/) (state-level for US, country-level elsewhere) | Verified for all 24 sites |
| Disclosure confidence | Manually assessed per facility based on public reporting depth | High / Medium / Low |

Every facility-layer data point is flagged **Verified**, **Modeled**, or **Unavailable** — missing data is never fabricated or silently estimated as if it were measured.

## Companies Tracked

Intel, TSMC, Samsung Electronics, Micron, Texas Instruments, GlobalFoundries

24 facilities across the United States, Japan, South Korea, Taiwan, Germany, France, Ireland, Singapore, Malaysia, and Vietnam — including both front-end wafer fabrication and back-end assembly/test sites.

## Known Limitations

- n=24 is a small sample; the primary finding is exploratory and observational, not causal
- Capex figures are publicly announced totals, often multi-phase, not verified actuals
- Facility coordinates are city/site-level approximations
- Delay status is sourced from trade press; some unofficial delays may be unreported
- Samsung Vietnam (backend packaging, announced Apr–May 2026) was excluded due to conflicting capex figures across sources and insufficient data maturity at time of publication — noted explicitly in-app rather than silently omitted

Full limitations and methodology: see the in-app [Methodology page](https://fab-pressure-atlas.lovable.app/methodology).

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Mapping:** Leaflet.js + OpenStreetMap (no paid API, no key required)
- **Backend/Data:** Lovable Cloud (Supabase-based managed backend)
- **Build tool:** Lovable

## Why This Project

Built as a portfolio diversification piece alongside sports/finance analytics work — applying the same analytical discipline (test a real claim, report results honestly including nulls, flag data confidence transparently) to a different domain: global semiconductor supply chain and ESG-adjacent risk.

---

*Data current as of June 2026.*
