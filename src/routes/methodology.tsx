import { createFileRoute } from "@tanstack/react-router";
import { NavBar } from "@/components/NavBar";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology & Sources — FabPressure" },
      { name: "description", content: "Full methodology, data sources, confidence flag system, and known limitations behind the FabPressure semiconductor expansion risk atlas." },
      { property: "og:title", content: "Methodology & Sources — FabPressure" },
      { property: "og:description", content: "Methodology, sources, and limitations behind FabPressure." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="mx-auto max-w-[720px] w-full px-5 py-12 space-y-10 text-sm leading-relaxed text-foreground/90">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Methodology & Sources
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            FabPressure v1 · Data current as of June 2026
          </p>
        </header>

        <Section title="1. About This Project">
          <p>
            FabPressure is an exploratory, portfolio-quality data visualization that asks a single question:
            <em> where does global semiconductor fab expansion face the greatest operational and environmental pressure?</em>
            It is not a sustainability leaderboard, a regulatory filing, or an investment-grade analysis.
          </p>
          <p>
            The project surfaces directional signal — not precise ranking — across the largest publicly announced
            front-end fab and back-end packaging projects from six major manufacturers.
          </p>
        </Section>

        <Section title="2. Facility Selection">
          <p>
            FabPressure tracks 24 facilities across 9 countries from six companies:
            Intel, TSMC, Samsung, Micron, Texas Instruments, and GlobalFoundries. These were chosen because they
            represent the bulk of announced post-CHIPS-Act expansion capex and have the most public disclosure.
          </p>
          <p>
            <strong>Front-end fabs</strong> (wafer fabrication) and <strong>back-end assembly/test</strong> facilities
            are tracked separately because their pressure profiles differ markedly: front-end fabs are dramatically
            more water- and energy-intensive per dollar of capex than back-end packaging.
          </p>
          <p className="text-muted-foreground italic">
            Known omission: Samsung Vietnam (backend packaging facility, $1.5–4B, reported April–May 2026) was
            excluded from v1 due to conflicting capex figures across sources and insufficient data maturity at time
            of publication. It will be considered for a future update.
          </p>
        </Section>

        <Section title="3. Pressure Score Methodology">
          <p>
            Each facility's <strong>pressure_score</strong> is the equal-weighted average of three components,
            each normalized to a 0–1 scale:
          </p>
          <ul>
            <li><strong>Water stress</strong> — WRI Aqueduct 4.0 baseline water stress raw score (0–5) divided by 5.</li>
            <li><strong>Grid carbon intensity</strong> — Ember Yearly Electricity Data, country or US-state level, normalized against the maximum observed value in the dataset.</li>
            <li><strong>Disclosure confidence (inverted)</strong> — High = 0, Medium = 0.5, Low = 1. Less transparency = more pressure.</li>
          </ul>
          <p>
            Equal weighting reflects deliberate humility: there is no defensible empirical weighting across these
            three dimensions for portfolio-scale risk assessment. Where any component is null/Unavailable, 0.5
            (neutral) is substituted so disclosure gaps neither penalize nor reward.
          </p>
          <p className="text-muted-foreground italic">
            The pressure_score is a composite heuristic for directional comparison — it is not a validated index.
          </p>
        </Section>

        <Section title="4. Data Confidence Flags">
          <p>Each facility carries a confidence flag per pressure layer:</p>
          <ul>
            <li><strong className="text-teal">Verified</strong> — sourced from the primary dataset with a direct geographic match (e.g., the exact US state or city-level Aqueduct grid cell).</li>
            <li><strong className="text-amber">Modeled</strong> — sourced from a national or regional average rather than facility-specific data.</li>
            <li><strong className="text-muted-foreground">Unavailable</strong> — no reliable source found; treated as neutral (0.5) in the composite.</li>
          </ul>
        </Section>

        <Section title="5. Primary KPI: Pressure vs. Delay">
          <p>
            The headline question tested on the Atlas page: <em>do higher pressure scores correlate with reported
            delay status?</em> A facility is counted as &ldquo;delayed&rdquo; if its delay_status is
            <code className="px-1 mx-1 rounded bg-secondary text-xs">Delayed &gt;1yr</code> or
            <code className="px-1 mx-1 rounded bg-secondary text-xs">Stalled</code>.
          </p>
          <p>
            With n ≈ 24, this is an observational, exploratory comparison. No causal claim is made. A larger sample
            and time-series tracking would be required for any inferential statement.
          </p>
        </Section>

        <Section title="6. Data Sources">
          <ul className="space-y-2">
            <li>WRI Aqueduct 4.0 (2023). Baseline Water Stress. <a className="text-teal hover:underline" target="_blank" rel="noreferrer" href="https://www.wri.org/applications/aqueduct/water-risk-atlas/">wri.org/aqueduct</a></li>
            <li>Ember Yearly Electricity Data (2025/2026). Grid Carbon Intensity by Country and US State. <a className="text-teal hover:underline" target="_blank" rel="noreferrer" href="https://ember-energy.org/data/yearly-electricity-data/">ember-energy.org</a></li>
            <li>SemiEngineering Annual Global IC Fabs and Facilities Report (2024, 2025). <a className="text-teal hover:underline" target="_blank" rel="noreferrer" href="https://semiengineering.com">semiengineering.com</a></li>
            <li>UltraFacility Semiconductor Construction Timelines (April 2026). <a className="text-teal hover:underline" target="_blank" rel="noreferrer" href="https://www.ultrafacilityportal.io">ultrafacilityportal.io</a></li>
            <li>Manufacturing Megaprojects Tracker (April 2026). <a className="text-teal hover:underline" target="_blank" rel="noreferrer" href="https://map.engineered-vision.com/">map.engineered-vision.com</a></li>
            <li>Company press releases and investor relations pages (Intel, TSMC, Samsung, Micron, TI, GlobalFoundries) — cited per facility in the delay_source field.</li>
            <li>Nikkei Asia / TrendForce / Tom's Hardware — Micron Hiroshima sourcing (November–December 2025).</li>
          </ul>
        </Section>

        <Section title="7. Known Limitations">
          <ul>
            <li>Country-level grid data is used where state/regional data is unavailable (non-US).</li>
            <li>Capex figures are publicly announced figures, not verified actuals; some are multi-phase totals rather than single-facility costs.</li>
            <li>Facility coordinates are city- or site-level approximations, not precise GPS.</li>
            <li>Delay status is sourced from trade press; some facilities may have unofficial delays not yet reported.</li>
            <li>n = 24 is small for statistical inference; the primary KPI is exploratory, not definitive.</li>
          </ul>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:break-words">
        {children}
      </div>
    </section>
  );
}
