import { ArrowLeft, CalendarDays, CheckCircle2, CircleDot } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { bodyParagraphs, formatDate, MARKET_IMAGE } from "@/lib/site";
import { trpc } from "@/lib/trpc";

export default function Digest() {
  const { date = "" } = useParams<{ date: string }>();
  const { data, isLoading } = trpc.editorial.digestByDate.useQuery({ date });
  const jsonLd = useMemo(() => data ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.digest.title,
    description: data.digest.summary,
    datePublished: data.digest.publishedAt?.toISOString(),
    dateModified: data.digest.modifiedAt?.toISOString(),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.stories.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${typeof window === "undefined" ? "" : window.location.origin}/articles/${item.story.slug}`,
        name: item.story.title,
      })),
    },
    publisher: { "@type": "Organization", name: "CasinoVerse" },
  } : undefined, [data]);

  if (isLoading) return <div className="container py-20"><Skeleton className="h-6 w-48 bg-white/5" /><Skeleton className="mt-8 h-28 max-w-5xl bg-white/5" /><Skeleton className="mt-12 h-80 rounded-[28px] bg-white/5" /></div>;
  if (!data) return <section className="container py-24 text-center"><p className="eyebrow text-gold">Edition not found</p><h1 className="mt-4 font-display text-5xl text-ivory">No research digest is filed for this date.</h1><Link href="/archive" className="button-gold mt-8">Browse the archive</Link></section>;

  const items = data.stories.map(({ story, category }) => ({ story, category })) as StoryCardData[];
  const isDeveloping = data.digest.status === "developing";

  return (
    <>
      <Seo title={data.digest.title} description={data.digest.summary} path={`/archive/${data.digest.digestDate}`} image={items[0]?.story.featuredImageUrl || MARKET_IMAGE} noIndex={isDeveloping} jsonLd={jsonLd} />
      <header className="digest-header border-b border-gold/15">
        <div className="container py-14 md:py-24">
          <Link href="/archive" className="inline-flex items-center gap-2 text-sm text-ivory/45 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> Back to the research archive</Link>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <span className="eyebrow text-gold">Daily research digest</span>
            {isDeveloping ? <span className="status-dot">Developing edition</span> : <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[.13em] text-[#91af98]"><CheckCircle2 className="h-4 w-4" /> Published edition</span>}
          </div>
          <time className="mt-7 block font-display text-2xl text-gold-light" dateTime={data.digest.digestDate}>{formatDate(`${data.digest.digestDate}T12:00:00Z`)}</time>
          <h1 className="mt-4 max-w-6xl font-display text-[clamp(3.5rem,8vw,7.5rem)] leading-[.86] tracking-[-.045em] text-ivory">{data.digest.title.replace(/^CasinoVerse Daily Research Digest — /, "")}</h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-ivory/60">{data.digest.summary}</p>
        </div>
      </header>

      <div className="container grid gap-12 py-14 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-center lg:py-20">
        <div>
          <section className="article-prose" aria-label="Edition summary">
            {bodyParagraphs(data.digest.body).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
          </section>

          <section className="mt-16" aria-labelledby="edition-stories">
            <div className="border-b border-gold/20 pb-6">
              <p className="eyebrow text-gold">Filed in this edition</p>
              <h2 id="edition-stories" className="mt-3 font-display text-4xl text-ivory">{items.length} verified developments</h2>
            </div>
            <div className="mt-8 grid gap-6">{items.map(item => <StoryCard key={item.story.id} item={item} variant="horizontal" />)}</div>
          </section>
        </div>

        <aside>
          <div className="sticky top-28 rounded-[22px] border border-gold/18 bg-card p-6">
            <CalendarDays className="h-6 w-6 text-gold" />
            <h2 className="mt-4 font-display text-2xl text-ivory">Edition status</h2>
            <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-ivory/55"><CircleDot className="mt-1 h-4 w-4 shrink-0 text-gold" /><p>{isDeveloping ? "This current-day edition may receive additional verified developments before the calendar-day window closes." : "This edition represents the completed research file for its publication date."}</p></div>
            <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-5 text-ivory/38">All summaries are informational. Follow article source links to review the original reporting and official material.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
