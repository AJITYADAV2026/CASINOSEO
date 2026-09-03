import { useMemo, useState } from "react";
import { ArrowRight, CalendarRange, Database, Filter, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";
import { trpc } from "@/lib/trpc";

const DESK_LABELS: Record<string, string> = {
  industry_and_regulation: "Industry & regulation",
  operations_and_technology: "Operations & technology",
  games_and_game_literacy: "Games & literacy",
  places_architecture_destinations: "Places & architecture",
  culture_and_media: "Culture & media",
  responsible_play_and_harm: "Responsible play & harm",
};

function displayEventDate(record: { eventYear: number; eventDate: string | null; datePrecision: string }) {
  if (!record.eventDate || record.datePrecision === "year") return String(record.eventYear);
  const date = new Date(`${record.eventDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: record.datePrecision === "exact" ? "numeric" : undefined,
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function HistoricalArchive() {
  const { data = [], isLoading } = trpc.editorial.historicalArchive.useQuery();
  const [year, setYear] = useState("all");
  const [desk, setDesk] = useState("all");

  const years = useMemo(() => Array.from(new Set(data.map(record => record.eventYear))).sort((a, b) => b - a), [data]);
  const desks = useMemo(() => Array.from(new Set(data.map(record => record.desk))), [data]);
  const filtered = useMemo(
    () => data.filter(record => (year === "all" || record.eventYear === Number(year)) && (desk === "all" || record.desk === desk)),
    [data, year, desk],
  );

  return (
    <>
      <Seo
        title="Casino industry timeline: 2010–2026"
        description="Browse CasinoVerse’s verified year-by-year record of casino regulation, operations, technology, destinations, and gambling-harm policy from 2010 through 3 September 2026."
        path="/history/archive"
        image={EXPANDED_IMAGES.history}
      />
      <header className="casino-editorial-hero historical-archive-hero relative min-h-[68vh] overflow-hidden border-b border-gold/15">
        <img src={EXPANDED_IMAGES.history} alt="Casino archive desk with dated ledgers, gaming tokens, and regulatory documents" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-vignette absolute inset-0" />
        <div className="container relative flex min-h-[68vh] items-end pb-14 pt-32">
          <div className="max-w-5xl">
            <div className="flex flex-wrap items-center gap-3"><span className="format-label"><Database className="h-3.5 w-3.5" />Project-owned records</span><span className="eyebrow">2010–3 September 2026</span></div>
            <h1 className="mt-6 font-display text-[clamp(4rem,9vw,8.5rem)] leading-[.84] tracking-[-.045em] text-ivory">Seventeen years.<br />Seventeen verified markers.</h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-ivory/70">A conservative historical baseline for casino regulation, operating systems, destination development, technology, and harm prevention—one sourced milestone for every calendar year.</p>
          </div>
        </div>
      </header>

      <main>
        <section className="section-space border-b border-white/8">
          <div className="container grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="article-body max-w-3xl"><p>This archive is not a claim to contain every event from the period. It establishes continuous, auditable coverage: each year has at least one material record selected after a separate research and validation pass.</p><p>Exact dates are used only when the source supports them. Year-level records remain labeled as year context, and later publication dates are shown separately from the event year.</p></div>
            <aside className="research-method-card"><ShieldCheck className="h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Verification boundary</h2><p className="mt-4 text-sm leading-7 text-ivory/58">Original publisher addresses are preserved as non-clickable provenance. Every navigation link remains inside CasinoVerse.</p></aside>
          </div>
        </section>

        <section className="section-space">
          <div className="container">
            <div className="historical-filter-bar">
              <div><p className="eyebrow text-gold">Timeline controls</p><h2 className="mt-2 font-display text-4xl text-ivory">Filter the record</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="historical-filter"><span><CalendarRange className="h-4 w-4" />Year</span><select value={year} onChange={event => setYear(event.target.value)}><option value="all">All years</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
                <label className="historical-filter"><span><Filter className="h-4 w-4" />Desk</span><select value={desk} onChange={event => setDesk(event.target.value)}><option value="all">All desks</option>{desks.map(value => <option key={value} value={value}>{DESK_LABELS[value] ?? value}</option>)}</select></label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-b border-gold/20 pb-5"><p className="eyebrow">Verified chronology</p><p className="text-sm text-ivory/45">{filtered.length} of {data.length} records</p></div>
            {isLoading ? <div className="mt-8 space-y-4">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-48 rounded-[24px] bg-white/5" />)}</div> : <div className="historical-record-list">{filtered.map(record => <Link key={record.id} href={`/history/archive/${record.slug}`} className="historical-record-row group"><div className="historical-record-year"><strong>{record.eventYear}</strong><span>{displayEventDate(record)}</span></div><div className="historical-record-copy"><div className="flex flex-wrap items-center gap-3"><span className="eyebrow text-gold">{DESK_LABELS[record.desk] ?? record.desk}</span><span className="text-xs text-ivory/35">{record.jurisdiction}</span></div><h2 className="mt-3 font-display text-3xl leading-tight text-ivory transition-colors group-hover:text-gold-light md:text-4xl">{record.title}</h2><p className="mt-4 max-w-4xl leading-7 text-ivory/56">{record.summary}</p><p className="mt-5 text-sm text-ivory/40">Source record: {record.sourceName} · {record.sourceType}</p></div><ArrowRight className="h-5 w-5 self-center text-gold/65 transition-transform group-hover:translate-x-1" /></Link>)}</div>}
            {!isLoading && filtered.length === 0 && <div className="source-record-sheet mt-8 text-center"><h2 className="font-display text-3xl text-ivory">No record matches these filters.</h2><button type="button" className="button-ghost mt-6" onClick={() => { setYear("all"); setDesk("all"); }}>Reset filters</button></div>}
          </div>
        </section>

        <section className="section-space border-y border-white/8 bg-white/[.02]"><div className="container grid gap-8 lg:grid-cols-[1fr_360px]"><div><p className="eyebrow">Automatic handoff</p><h2 className="mt-3 font-display text-5xl text-ivory">The baseline ends where daily research begins.</h2><p className="mt-5 max-w-3xl leading-8 text-ivory/60">This fixed archive covers the period through 3 September 2026. New research is handled by the existing research, analysis, and page-creation agents; it does not rewrite verified historical records silently.</p></div><Link href="/archive" className="research-method-card group"><CalendarRange className="h-6 w-6 text-gold" /><h3 className="mt-4 font-display text-3xl text-ivory group-hover:text-gold-light">Open daily research</h3><p className="mt-4 text-sm leading-7 text-ivory/55">Continue into the dated research editions produced after the historical baseline.</p></Link></div></section>
      </main>
    </>
  );
}
