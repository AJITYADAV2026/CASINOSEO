import { BookOpenText, Database, FileSearch, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function Sources() {
  const { data = [], isLoading } = trpc.editorial.sources.useQuery();
  return (
    <>
      <Seo title="Source library" description="Browse CasinoVerse-owned source records with publisher, publication, source type, retrieval date, and stored provenance address." path="/sources" />
      <header className="source-library-hero border-b border-gold/15">
        <div className="container grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_340px] lg:items-end">
          <div><p className="eyebrow text-gold">CasinoVerse internal source library</p><h1 className="mt-4 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">The evidence stays in the house.</h1><p className="mt-7 max-w-3xl text-xl leading-8 text-ivory/62">Every public reference opens a CasinoVerse record. Publisher identity, publication context, source type, retrieval date, and the original address are preserved without redirecting readers to another website.</p></div>
          <aside className="research-method-card"><Database className="h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Project-owned database</h2><p className="mt-4 text-sm leading-7 text-ivory/58">The source catalogue is stored in CasinoVerse’s own application database. Original addresses are provenance text, not clickable outbound links.</p></aside>
        </div>
      </header>
      <main className="section-space">
        <div className="container">
          <div className="flex flex-col gap-5 border-b border-gold/20 pb-7 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Reference register</p><h2 className="mt-3 font-display text-5xl text-ivory">Institutions and publications</h2></div><p className="text-sm text-ivory/42">{data.length} active internal records</p></div>
          {isLoading ? <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-64 rounded-[22px] bg-white/5" />)}</div> : <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.map(entry => <Link key={entry.id} href={`/sources/${entry.slug}`} className="source-catalog-card group"><div className="flex items-center justify-between gap-4"><span className="eyebrow text-gold">{entry.sourceType}</span><BookOpenText className="h-5 w-5 text-gold/60" /></div><h2 className="mt-8 font-display text-3xl leading-tight text-ivory group-hover:text-gold-light">{entry.name}</h2>{entry.publicationLabel && <p className="mt-2 text-sm font-semibold text-ivory/54">{entry.publicationLabel}</p>}<p className="mt-5 line-clamp-3 text-sm leading-7 text-ivory/48">{entry.description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm text-gold-light">Open internal record →</span></Link>)}</div>}
          <div className="mt-14 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-2"><div className="flex gap-4"><FileSearch className="mt-1 h-6 w-6 shrink-0 text-gold" /><div><h2 className="font-display text-2xl text-ivory">Story-level records</h2><p className="mt-2 text-sm leading-7 text-ivory/52">Individual Blog pages link to their own stored source record, including the exact title and date used for that story.</p></div></div><div className="flex gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-gold" /><div><h2 className="font-display text-2xl text-ivory">No endorsement implied</h2><p className="mt-2 text-sm leading-7 text-ivory/52">Listing a source documents provenance. It does not mean the institution certifies, sponsors, or endorses CasinoVerse.</p></div></div></div>
        </div>
      </main>
    </>
  );
}
