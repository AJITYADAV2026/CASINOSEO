import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, FileSearch, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { bodyParagraphs, formatDate } from "@/lib/site";
import { trpc } from "@/lib/trpc";

export default function Article() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.editorial.storyBySlug.useQuery({ slug });
  const { data: homepage } = trpc.editorial.homepage.useQuery();
  const jsonLd = useMemo(() => {
    if (!data) return undefined;
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const canonical = `${origin}/articles/${data.story.slug}`;
    const image = data.story.featuredImageUrl ? `${origin}${data.story.featuredImageUrl}` : null;
    return {
      "@context": "https://schema.org",
      "@type": data.story.contentType === "news" ? "NewsArticle" : "Article",
      headline: data.story.title,
      description: data.story.dek,
      datePublished: data.story.publishedAt?.toISOString(),
      dateModified: (data.story.modifiedAt || data.story.publishedAt)?.toISOString(),
      mainEntityOfPage: canonical,
      ...(image ? { image: [image] } : {}),
      articleSection: data.category.name,
      author: { "@type": "Organization", name: data.story.authorName },
      publisher: { "@type": "Organization", name: "CasinooVerse", url: origin },
    };
  }, [data]);

  if (isLoading) {
    return <div className="container py-20"><Skeleton className="h-5 w-44 bg-white/5" /><Skeleton className="mt-8 h-20 max-w-4xl bg-white/5" /><Skeleton className="mt-12 aspect-[16/7] w-full rounded-[28px] bg-white/5" /></div>;
  }

  if (!data) {
    return <section className="container py-24 text-center"><p className="eyebrow text-gold">Article not found</p><h1 className="mt-4 font-display text-5xl text-ivory">This story is no longer available.</h1><Link href="/" className="button-gold mt-8">Return to the latest edition</Link></section>;
  }

  const related = ((homepage?.stories || []) as StoryCardData[])
    .filter(item => item.category.slug === data.category.slug && item.story.id !== data.story.id)
    .slice(0, 3);

  return (
    <>
      <Seo
        title={data.story.title}
        description={data.story.dek}
        image={data.story.featuredImageUrl}
        path={`/articles/${data.story.slug}`}
        noIndex={data.story.status === "developing"}
        jsonLd={jsonLd}
      />
      <article>
        <header className="article-header border-b border-gold/15">
          <div className="container py-12 md:py-20">
            <Link href={`/category/${data.category.slug}`} className="inline-flex items-center gap-2 text-sm text-ivory/50 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> Back to {data.category.name}</Link>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="format-label">Blog</span>
              <span className="eyebrow" style={{ color: data.category.accent }}>{data.category.name}</span>
              {data.story.status === "developing" && <span className="status-dot">Developing story</span>}
            </div>
            <h1 className="mt-5 max-w-5xl font-display text-[clamp(3rem,7vw,6.4rem)] leading-[.91] tracking-[-.035em] text-ivory">{data.story.title}</h1>
            <p className="mt-7 max-w-3xl text-xl leading-8 text-ivory/62 md:text-2xl md:leading-9">{data.story.dek}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-ivory/45">
              <span>By <strong className="font-medium text-ivory/75">{data.story.authorName}</strong></span>
              <span>{formatDate(data.story.publishedAt)}</span>
              {data.story.modifiedAt && data.story.publishedAt && new Date(data.story.modifiedAt).getTime() > new Date(data.story.publishedAt).getTime() && <span>Updated {formatDate(data.story.modifiedAt)}</span>}
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {data.story.readingMinutes} min read</span>
            </div>
          </div>
        </header>

        {data.story.featuredImageUrl && <div className="container pt-8 md:pt-12"><div className="image-frame aspect-[16/7] rounded-[28px] border border-gold/15"><img src={data.story.featuredImageUrl} alt={data.story.featuredImageAlt || data.story.title} /></div></div>}

        <div className="container grid gap-12 py-12 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-center lg:py-20">
          <div>
            <div className="article-prose">
              {bodyParagraphs(data.story.body).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>)}
            </div>

            {data.sources.length > 0 && (
              <section className="mt-16 border-t border-gold/20 pt-9" aria-labelledby="sources-heading">
                <p className="eyebrow text-gold">Research transparency</p>
                <h2 id="sources-heading" className="mt-3 font-display text-3xl text-ivory">Original sources</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/50">CasinooVerse summarizes and contextualizes reporting. Open each internal source record to inspect the publisher, title, dates, source type, and stored provenance address without leaving CasinooVerse.</p>
                <ol className="mt-7 space-y-3">
                  {data.sources.map((source, index) => (
                    <li key={source.id}>
                      <Link href={`/sources/story/${source.id}`} className="source-link group">
                        <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
                        <span><strong>{source.publisher}</strong><small>{source.sourceTitle}{source.sourcePublishedAt ? ` · ${formatDate(source.sourcePublishedAt)}` : ""}</small></span>
                        <FileSearch className="h-4 w-4 text-gold/60 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="lg:pt-2" aria-label="Article disclosure">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-[22px] border border-gold/18 bg-card p-6">
                <FileSearch className="h-6 w-6 text-gold" />
                <h2 className="mt-4 font-display text-2xl text-ivory">How this was verified</h2>
                <p className="mt-3 text-sm leading-6 text-ivory/50">This article retains {data.sources.length} original {data.sources.length === 1 ? "source" : "sources"}. Company statements, forecasts, proposals, and unresolved proceedings remain labeled as such rather than being converted into final outcomes.</p>
                <Link href="/about#standards" className="mt-5 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light">Read our standards <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-card p-6">
                <ShieldCheck className="h-6 w-6 text-gold" />
                <h2 className="mt-4 font-display text-2xl text-ivory">Information, not encouragement</h2>
                <p className="mt-3 text-sm leading-6 text-ivory/50">This story covers casino business and policy. It does not recommend gambling, investing, or legal action. Gambling involves financial risk.</p>
                <Link href="/responsible-entertainment" className="mt-5 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light">Responsible entertainment <ArrowUpRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-gold/15 bg-[#11100f] py-20">
          <div className="container">
            <p className="eyebrow text-gold">Continue reading</p>
            <h2 className="mt-3 font-display text-4xl text-ivory">More in {data.category.name}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">{related.map(item => <StoryCard key={item.story.id} item={item} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
