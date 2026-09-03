import { ArrowLeft, CalendarDays, Database, FileCheck2, MapPin, ShieldCheck } from "lucide-react";
import { Link, useParams } from "wouter";
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

function displayDate(value: string | null, year: number, precision: string) {
  if (!value || precision === "year") return `${year} · year-level context`;
  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", { day: precision === "exact" ? "numeric" : undefined, month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function HistoricalRecord() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.editorial.historicalRecordBySlug.useQuery({ slug });
  if (isLoading) return <div className="container py-24"><Skeleton className="h-8 w-48 bg-white/5" /><Skeleton className="mt-8 h-48 max-w-5xl bg-white/5" /></div>;
  if (!data) return <section className="container py-24 text-center"><p className="eyebrow text-gold">Historical record unavailable</p><h1 className="mt-4 font-display text-5xl text-ivory">This verified milestone was not found.</h1><Link href="/history/archive" className="button-gold mt-8">Return to timeline</Link></section>;

  const path = `/history/archive/${data.slug}`;
  return (
    <article>
      <Seo title={data.title} description={data.summary} path={path} image={EXPANDED_IMAGES.history} />
      <header className="historical-record-hero border-b border-gold/15"><div className="container py-16 md:py-24"><Link href="/history/archive" className="inline-flex items-center gap-2 text-sm text-ivory/50 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> 2010–2026 timeline</Link><div className="mt-12 max-w-5xl"><div className="flex flex-wrap items-center gap-3"><span className="format-label"><Database className="h-3.5 w-3.5" />Verified internal record</span><span className="eyebrow text-gold">{data.eventYear}</span><span className="eyebrow">{DESK_LABELS[data.desk] ?? data.desk}</span></div><h1 className="mt-6 font-display text-[clamp(3.7rem,8vw,7.2rem)] leading-[.87] tracking-[-.04em] text-ivory">{data.title}</h1><p className="mt-7 max-w-3xl text-xl leading-9 text-ivory/68">{data.summary}</p></div></div></header>

      <section className="section-space"><div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]"><div><div className="source-record-sheet"><p className="eyebrow text-gold">Why this year matters</p><h2 className="mt-3 font-display text-4xl text-ivory">Significance in the record</h2><p className="mt-6 text-lg leading-9 text-ivory/62">{data.significance}</p></div><div className="source-record-sheet mt-6"><p className="eyebrow text-gold">Stored provenance</p><h2 className="mt-3 font-display text-4xl text-ivory">Original source address</h2><p className="mt-5 leading-8 text-ivory/56">CasinoVerse stores the address below as non-clickable evidence data. It is not an external navigation link.</p><code className="source-address mt-7 block">{data.sourceUrl}</code></div></div><aside className="space-y-4"><div className="research-method-card"><CalendarDays className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Chronology</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="eyebrow text-ivory/35">Event date</dt><dd className="mt-1 text-ivory/64">{displayDate(data.eventDate, data.eventYear, data.datePrecision)}</dd></div><div><dt className="eyebrow text-ivory/35">Source published</dt><dd className="mt-1 text-ivory/64">{data.sourcePublishedDate ?? "Not separately stated"}</dd></div></dl></div><div className="research-method-card"><MapPin className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Jurisdiction</h2><p className="mt-4 text-sm leading-7 text-ivory/58">{data.jurisdiction}</p></div><div className="research-method-card"><FileCheck2 className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Source record</h2><p className="mt-4 font-semibold text-ivory/70">{data.sourceName}</p><p className="mt-2 text-sm leading-6 text-ivory/50">{data.sourceTitle}</p><p className="mt-4 text-xs uppercase tracking-[.14em] text-gold">{data.sourceType} · {data.confidence} confidence</p></div><div className="research-method-card"><ShieldCheck className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Editorial status</h2><p className="mt-4 text-sm leading-7 text-ivory/58">{data.verificationStatus === "verified" ? "Verified for publication" : "Review required"}. Cutoff: 3 September 2026.</p></div></aside></div></section>
    </article>
  );
}
