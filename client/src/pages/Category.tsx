import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { formatDate, HERO_IMAGE } from "@/lib/site";
import { trpc } from "@/lib/trpc";

export default function Category() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.editorial.categoryBySlug.useQuery({ slug });

  if (isLoading) return <div className="container py-20"><Skeleton className="h-8 w-44 bg-white/5" /><Skeleton className="mt-5 h-20 max-w-4xl bg-white/5" /><div className="mt-14 grid gap-6 md:grid-cols-3"><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /></div></div>;
  if (!data) return <section className="container py-24 text-center"><p className="eyebrow text-gold">Topic not found</p><h1 className="mt-4 font-display text-5xl text-ivory">This category is not available.</h1><Link href="/" className="button-gold mt-8">Return home</Link></section>;

  const items = data.stories as StoryCardData[];
  const lead = items[0];
  const latest = items.slice(1, 3);
  const archive = items.slice(3);

  return (
    <>
      <Seo title={data.category.name} description={data.category.description} path={`/category/${data.category.slug}`} image={lead?.story.featuredImageUrl || HERO_IMAGE} />
      <header className="category-header border-b border-gold/15">
        <div className="container py-14 md:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ivory/45 hover:text-gold-light"><ArrowLeft className="h-4 w-4" /> Back to the latest edition</Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow" style={{ color: data.category.accent }}>CasinoVerse topic</p>
              <h1 className="mt-4 font-display text-[clamp(3.6rem,9vw,8.5rem)] leading-[.82] tracking-[-.05em] text-ivory">{data.category.name}</h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/58">{data.category.description}</p>
            </div>
            <div className="border-l border-gold/20 pl-6 text-right"><strong className="block font-display text-5xl text-gold-light">{items.length}</strong><span className="eyebrow text-ivory/35">Published stories</span></div>
          </div>
        </div>
      </header>

      <section className="section-space">
        <div className="container">
          {lead ? (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_.7fr]">
              <article className="group">
                <Link href={`/articles/${lead.story.slug}`} className="image-frame aspect-[16/9] rounded-[28px] border border-gold/15"><img src={lead.story.featuredImageUrl || HERO_IMAGE} alt={lead.story.featuredImageAlt || lead.story.title} /></Link>
                <div className="mt-7 flex flex-wrap items-center gap-3"><span className="eyebrow" style={{ color: data.category.accent }}>Latest in {data.category.name}</span>{lead.story.status === "developing" && <span className="status-dot">Developing</span>}</div>
                <Link href={`/articles/${lead.story.slug}`}><h2 className="mt-4 max-w-4xl font-display text-4xl leading-[.98] text-ivory group-hover:text-gold-light md:text-6xl">{lead.story.title}</h2></Link>
                <p className="mt-5 max-w-3xl text-base leading-7 text-ivory/55">{lead.story.dek}</p>
                <p className="mt-5 text-xs text-ivory/40">{formatDate(lead.story.publishedAt)} · {lead.story.readingMinutes} min read</p>
              </article>
              <aside className="grid content-start gap-6">{latest.map(item => <StoryCard key={item.story.id} item={item} />)}</aside>
            </div>
          ) : <div className="story-card p-12 text-center"><h2 className="font-display text-3xl text-ivory">No stories are published in this topic yet.</h2></div>}
        </div>
      </section>

      {archive.length > 0 && <section className="border-t border-gold/15 bg-[#11100f] py-20">
        <div className="container">
          <div className="flex flex-col gap-4 border-b border-gold/20 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-gold">Complete topic archive</p><h2 className="mt-2 font-display text-4xl text-ivory">More {data.category.name}</h2></div><Link href="/archive" className="inline-flex items-center gap-2 text-sm text-gold">Browse by date <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">{archive.map(item => <StoryCard key={item.story.id} item={item} variant="horizontal" />)}</div>
        </div>
      </section>}
    </>
  );
}
