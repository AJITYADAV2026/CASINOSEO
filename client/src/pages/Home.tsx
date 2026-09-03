import { ArrowRight, BookOpen, CalendarDays, Globe2, Landmark, Scale, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/SectionHeading";
import { ResearchReferences } from "@/components/ResearchReferences";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { trpc } from "@/lib/trpc";
import { CULTURE_IMAGE, GUIDES_IMAGE, HERO_IMAGE, RESPONSIBLE_IMAGE, formatDate } from "@/lib/site";

const topicIcons = { "market-intelligence": Globe2, regulation: Scale, "casino-operations": Landmark, "culture-travel": Globe2, "game-guides": BookOpen, "responsible-entertainment": ShieldCheck };

export default function Home() {
  const { data, isLoading, error } = trpc.editorial.homepage.useQuery();
  const items = (data?.stories || []) as StoryCardData[];
  const lead = items.find(item => item.story.isLead) || items[0];
  const secondary = items.filter(item => item.story.id !== lead?.story.id).slice(0, 4);
  const featured = items.filter(item => item.story.isFeatured).slice(0, 6);
  const guides = items.filter(item => item.category.slug === "game-guides");
  const culture = items.filter(item => item.category.slug === "culture-travel").slice(0, 3);
  const latestDigest = data?.digests[0];

  return (
    <>
      <Seo image={HERO_IMAGE} />
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,7,6,.96) 0%, rgba(8,7,6,.78) 42%, rgba(8,7,6,.18) 78%), linear-gradient(0deg, #0d0c0b 0%, transparent 34%), url(${HERO_IMAGE})` }}>
        <div className="container flex min-h-[760px] items-end pb-20 pt-32 lg:min-h-[820px] lg:items-center lg:pb-10">
          <div className="max-w-3xl">
            <p className="eyebrow text-gold">Independent research · Culture · Responsibility</p>
            <h1 className="mt-5 font-display text-[clamp(3.7rem,8vw,7.7rem)] leading-[.84] tracking-[-.045em] text-ivory">
              The world<br />behind <em className="font-normal text-gold-light">the games.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ivory/65 md:text-xl">
              CasinoVerse examines the business, design, regulation, history, and human impact of casino entertainment—without the hype.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              {latestDigest && <Link href={`/archive/${latestDigest.digestDate}`} className="button-gold">Read today’s digest <ArrowRight className="h-4 w-4" /></Link>}
              <Link href="/games" className="button-ghost">Explore game guides</Link>
            </div>
            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs uppercase tracking-[.16em] text-ivory/40">
              <span>No wagering</span><span>Primary-source links</span><span>Daily dated research</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gold/15 bg-[#11100f]" aria-label="Trending topics">
        <div className="container flex items-center gap-7 overflow-x-auto py-4 text-sm whitespace-nowrap">
          <span className="eyebrow text-gold">Trending</span>
          {data?.categories.map(category => <Link key={category.id} href={`/category/${category.slug}`} className="text-ivory/55 hover:text-ivory">{category.name}</Link>)}
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <SectionHeading eyebrow="The daily edition" title="What matters now" description="Verified developments, placed in context and linked to their original sources." href="/archive" />
          {isLoading ? <HomeSkeleton /> : error ? <ErrorState /> : lead ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.62fr)_minmax(320px,.78fr)]">
              <article className="lead-story group relative min-h-[560px] overflow-hidden rounded-[28px] border border-gold/15">
                <img src={lead.story.featuredImageUrl || HERO_IMAGE} alt={lead.story.featuredImageAlt || "CasinoVerse lead story"} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-11">
                  <span className="eyebrow text-gold">Lead story · {lead.category.name}</span>
                  <Link href={`/articles/${lead.story.slug}`}><h2 className="mt-4 max-w-3xl font-display text-4xl leading-[.98] text-white md:text-6xl">{lead.story.title}</h2></Link>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">{lead.story.dek}</p>
                  <p className="mt-5 text-xs text-white/45">{formatDate(lead.story.publishedAt)} · {lead.story.readingMinutes} min read</p>
                </div>
              </article>
              <aside className="rounded-[28px] border border-white/10 bg-card px-6 py-2" aria-label="Latest headlines">
                {secondary.map(item => <StoryCard key={item.story.id} item={item} variant="compact" />)}
              </aside>
            </div>
          ) : <EmptyState />}
        </div>
      </section>

      {latestDigest && (
        <section className="pb-8">
          <div className="container">
            <div className="digest-banner grid gap-8 rounded-[28px] border border-gold/20 p-7 md:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold"><CalendarDays className="h-7 w-7" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-3"><span className="eyebrow text-gold">Daily research digest</span>{latestDigest.status === "developing" && <span className="status-dot">Developing</span>}</div>
                <h2 className="mt-3 font-display text-3xl text-ivory md:text-4xl">{latestDigest.title}</h2>
                <p className="mt-3 max-w-3xl leading-7 text-ivory/55">{latestDigest.summary}</p>
              </div>
              <Link href={`/archive/${latestDigest.digestDate}`} className="button-gold justify-center">Open edition <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="section-space bg-[#11100f]">
        <div className="container">
          <SectionHeading eyebrow="Across the industry" title="Research by topic" description="Follow the numbers, rules, operating decisions, and destination trends shaping casino entertainment." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.categories.map(category => {
              const Icon = topicIcons[category.slug as keyof typeof topicIcons] || Globe2;
              const count = items.filter(item => item.category.slug === category.slug).length;
              return <Link key={category.id} href={`/category/${category.slug}`} className="topic-card group">
                <Icon className="h-6 w-6" style={{ color: category.accent }} />
                <div><h3 className="font-display text-2xl text-ivory group-hover:text-gold-light">{category.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-ivory/50">{category.description}</p></div>
                <span className="text-xs text-ivory/35">{count} {count === 1 ? "story" : "stories"}</span>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <SectionHeading eyebrow="Editor’s selection" title="Research worth your time" href="/archive" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map(item => <StoryCard key={item.story.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="section-space border-y border-gold/15 bg-[#151310]">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div className="image-frame aspect-[4/3] rounded-[28px]"><img src={CULTURE_IMAGE} alt="Integrated-resort atrium focused on architecture, art, dining, and entertainment" /></div>
          <div>
            <p className="eyebrow text-gold">Casino culture & travel</p>
            <h2 className="mt-4 font-display text-5xl leading-[.95] text-ivory md:text-6xl">Beyond the gaming floor.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ivory/58">Architecture, performance, food, regional history, and destination strategy are central to the modern integrated-resort story.</p>
            <div className="mt-8 space-y-1">{culture.map(item => <StoryCard key={item.story.id} item={item} variant="compact" />)}</div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <SectionHeading eyebrow="Learn the fundamentals" title="Games, explained without the hype" description="History, terminology, probability, etiquette, and risk—written for curious readers and beginners." href="/guides" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Link href="/games" className="image-panel group" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.92), rgba(0,0,0,.1)), url(${GUIDES_IMAGE})` }}><span className="eyebrow text-gold">Explore by game</span><h3 className="mt-3 max-w-xl font-display text-4xl text-white md:text-5xl">From the first rule to the house edge.</h3><span className="mt-5 inline-flex items-center gap-2 text-sm text-gold-light">Browse all games <ArrowRight className="h-4 w-4" /></span></Link>
            <div className="grid gap-5">{guides.map(item => <StoryCard key={item.story.id} item={item} variant="horizontal" />)}{guides.length === 0 && <div className="story-card p-8 text-ivory/55">New learning guides are being prepared.</div>}</div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <ResearchReferences
            eyebrow="The evidence desk"
            title="Research before recommendation"
            intro="CasinoVerse combines primary regulator material, original trade reporting, public-health evidence, and visible source links. We label uncertainty and keep information separate from gambling promotion."
            sources={[
              { name: "Nevada Gaming Control Board", detail: "Primary monthly revenue, quarterly statistics, licensing, and regulatory publications.", href: "https://www.gaming.nv.gov/about-us/statistics-and-publications/" },
              { name: "World Health Organization", detail: "Global public-health evidence on gambling exposure, harm, prevention, and support.", href: "https://www.who.int/news-room/fact-sheets/detail/gambling" },
              { name: "Society of Professional Journalists", detail: "Verification, context, source attribution, independence, and correction principles.", href: "https://www.spj.org/spj-code-of-ethics/" },
            ]}
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="responsible-panel grid overflow-hidden rounded-[30px] border border-[#7893A6]/30 lg:grid-cols-[1fr_1.1fr]">
            <div className="p-8 md:p-12">
              <p className="eyebrow text-[#9fb8c9]">Responsible entertainment</p>
              <h2 className="mt-4 font-display text-4xl leading-none text-ivory md:text-5xl">Know the limits before the game begins.</h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-ivory/60">Gambling is a paid form of entertainment with a built-in risk of loss. Set firm time and spending limits, never borrow to gamble, and step away when play is no longer enjoyable.</p>
              <Link href="/responsible-entertainment" className="button-ghost mt-8">Read the complete guide <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="image-frame min-h-[340px]"><img src={RESPONSIBLE_IMAGE} alt="Calm responsible-entertainment still life with a clock, notebook, water, and one chip" /></div>
          </div>
        </div>
      </section>
    </>
  );
}

function HomeSkeleton() { return <div className="grid gap-8 lg:grid-cols-[1.6fr_.8fr]"><Skeleton className="h-[560px] rounded-[28px] bg-white/5" /><Skeleton className="h-[560px] rounded-[28px] bg-white/5" /></div>; }
function ErrorState() { return <div className="story-card p-10 text-center"><h2 className="font-display text-3xl text-ivory">The newsroom could not be reached.</h2><p className="mt-3 text-ivory/50">Please refresh the page in a moment.</p></div>; }
function EmptyState() { return <div className="story-card p-10 text-center"><h2 className="font-display text-3xl text-ivory">The first edition is being prepared.</h2><p className="mt-3 text-ivory/50">Verified research will appear here shortly.</p></div>; }
