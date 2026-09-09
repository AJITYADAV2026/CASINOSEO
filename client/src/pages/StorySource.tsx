import { ArrowLeft, CalendarDays, Database, FileSearch } from "lucide-react";
import { Link, useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/site";
import { trpc } from "@/lib/trpc";

export default function StorySource() {
  const { id = "" } = useParams<{ id: string }>();
  const sourceId = Number(id);
  const { data, isLoading } = trpc.editorial.storySourceById.useQuery({ id: Number.isInteger(sourceId) && sourceId > 0 ? sourceId : 1 }, { enabled: Number.isInteger(sourceId) && sourceId > 0 });
  if (isLoading) return <div className="container py-24"><Skeleton className="h-8 w-40 bg-white/5" /><Skeleton className="mt-6 h-28 max-w-4xl bg-white/5" /></div>;
  if (!data) return <section className="container py-24 text-center"><p className="eyebrow text-gold">Story source unavailable</p><h1 className="mt-4 font-display text-5xl text-ivory">This internal source record was not found.</h1><Link href="/articles" className="button-gold mt-8">Return to the Blog</Link></section>;
  const { source, story } = data;
  return (
    <article>
      <Seo title={`${source.publisher} — source record`} description={`CasinooVerse internal provenance record for ${source.sourceTitle}.`} path={`/sources/story/${source.id}`} />
      <header className="source-record-hero border-b border-gold/15"><div className="container py-16 md:py-24"><Link href={`/articles/${story.slug}`} className="inline-flex items-center gap-2 text-sm text-ivory/50 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> Return to Blog article</Link><div className="mt-12 max-w-5xl"><div className="flex flex-wrap items-center gap-3"><span className="format-label"><Database className="h-3.5 w-3.5" />Story source record</span><span className="eyebrow">{source.sourceType}</span></div><h1 className="mt-6 font-display text-[clamp(3.4rem,7vw,6.5rem)] leading-[.9] text-ivory">{source.publisher}</h1><p className="mt-6 max-w-4xl font-display text-3xl leading-tight text-gold-light">{source.sourceTitle}</p></div></div></header>
      <section className="section-space"><div className="container grid gap-10 lg:grid-cols-[1fr_360px]"><div className="source-record-sheet"><p className="eyebrow text-gold">Stored provenance address</p><p className="mt-5 leading-8 text-ivory/58">CasinooVerse stores the original publisher address for verification. It is intentionally displayed as text rather than an outbound link.</p><code className="source-address mt-7 block">{source.sourceUrl}</code><div className="mt-10 border-t border-white/10 pt-8"><p className="eyebrow">Used by this Blog</p><Link href={`/articles/${story.slug}`} className="mt-3 inline-flex max-w-3xl font-display text-3xl leading-tight text-ivory hover:text-gold-light">{story.title}</Link></div></div><aside className="research-method-card"><FileSearch className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-2xl text-ivory">Source details</h2><dl className="mt-6 space-y-5 text-sm"><div><dt className="eyebrow text-ivory/35">Publisher</dt><dd className="mt-1 text-ivory/68">{source.publisher}</dd></div><div><dt className="eyebrow text-ivory/35">Published</dt><dd className="mt-1 text-ivory/68">{source.sourcePublishedAt ? formatDate(source.sourcePublishedAt) : "Date not shown in the stored record"}</dd></div><div><dt className="eyebrow text-ivory/35">Accessed</dt><dd className="mt-1 text-ivory/68">{formatDate(source.accessedAt)}</dd></div></dl></aside></div></section>
    </article>
  );
}
