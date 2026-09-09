import { ArrowLeft, CalendarDays, Database, FileText } from "lucide-react";
import { Link, useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/site";
import { trpc } from "@/lib/trpc";

export default function SourceDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.editorial.sourceBySlug.useQuery({ slug });
  if (isLoading) return <div className="container py-24"><Skeleton className="h-8 w-40 bg-white/5" /><Skeleton className="mt-6 h-28 max-w-4xl bg-white/5" /></div>;
  if (!data) return <section className="container py-24 text-center"><p className="eyebrow text-gold">Source record unavailable</p><h1 className="mt-4 font-display text-5xl text-ivory">This internal record was not found.</h1><Link href="/sources" className="button-gold mt-8">Return to source library</Link></section>;
  return (
    <article>
      <Seo title={`${data.name} source record`} description={data.description} path={`/sources/${data.slug}`} />
      <header className="source-record-hero border-b border-gold/15"><div className="container py-16 md:py-24"><Link href="/sources" className="inline-flex items-center gap-2 text-sm text-ivory/50 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> Source library</Link><div className="mt-12 max-w-5xl"><div className="flex flex-wrap items-center gap-3"><span className="format-label"><Database className="h-3.5 w-3.5" />Internal record</span><span className="eyebrow">{data.sourceType}</span></div><h1 className="mt-6 font-display text-[clamp(3.8rem,8vw,7rem)] leading-[.88] text-ivory">{data.name}</h1>{data.publicationLabel && <p className="mt-5 font-display text-3xl text-gold-light">{data.publicationLabel}</p>}<p className="mt-7 max-w-3xl text-xl leading-9 text-ivory/62">{data.description}</p></div></div></header>
      <section className="section-space"><div className="container grid gap-10 lg:grid-cols-[1fr_360px]"><div className="source-record-sheet"><p className="eyebrow text-gold">Stored provenance address</p><h2 className="mt-3 font-display text-4xl text-ivory">Original location retained as data</h2><p className="mt-5 leading-8 text-ivory/58">The address below is shown as non-clickable text so the record remains auditable without redirecting you away from CasinooVerse.</p><code className="source-address mt-7 block">{data.originalUrl}</code></div><aside className="space-y-4"><div className="research-method-card"><CalendarDays className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Record dates</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="eyebrow text-ivory/35">Accessed</dt><dd className="mt-1 text-ivory/64">{formatDate(data.accessedAt)}</dd></div><div><dt className="eyebrow text-ivory/35">Updated</dt><dd className="mt-1 text-ivory/64">{formatDate(data.updatedAt)}</dd></div></dl></div><div className="research-method-card"><FileText className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Use in reporting</h2><p className="mt-4 text-sm leading-7 text-ivory/55">CasinooVerse uses this record for attribution, fact checking, context, or methodology. The original publisher remains responsible for its own material.</p></div></aside></div></section>
    </article>
  );
}
