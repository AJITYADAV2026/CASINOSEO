import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, ShieldCheck } from "lucide-react";
import { GAME_GUIDES } from "@/lib/gameGuides";
import { Seo } from "@/components/Seo";
import { ResearchReferences } from "@/components/ResearchReferences";
import { SectionHeading } from "@/components/SectionHeading";
import NotFound from "./NotFound";

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>();
  const guide = GAME_GUIDES[slug];
  if (!guide) return <NotFound />;

  return (
    <>
      <Seo title={`${guide.name} guide`} description={guide.dek} path={`/games/${guide.slug}`} image={guide.image} jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `${guide.name}: history, concepts and probability`, description: guide.dek, articleSection: "Game Guides", author: { "@type": "Organization", name: "CasinooVerse Research Desk" } }} />
      <article>
        <header className="relative min-h-[72vh] overflow-hidden border-b border-gold/15">
          <img src={guide.image} alt={guide.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-vignette absolute inset-0" />
          <div className="container relative flex min-h-[72vh] items-end pb-16 pt-28">
            <div className="max-w-4xl">
              <Link href="/games" className="eyebrow inline-flex items-center gap-2 text-gold"><ArrowLeft className="h-4 w-4" /> All game guides</Link>
              <p className="mt-8 text-xs uppercase tracking-[.24em] text-ivory/50">{guide.eyebrow}</p>
              <h1 className="mt-4 font-display text-6xl leading-[.92] text-ivory sm:text-7xl lg:text-9xl">{guide.name}</h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-ivory/72">{guide.dek}</p>
              <p className="mt-6 text-sm text-ivory/45">CasinooVerse Research Desk · Reviewed 3 September 2026 · Educational reference</p>
            </div>
          </div>
        </header>

        <section className="section-pad">
          <div className="container grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="article-body max-w-3xl">
              {guide.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <aside className="research-method-card self-start">
              <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
              <h2 className="mt-4 font-display text-3xl text-ivory">How to read this guide</h2>
              <p className="mt-4 text-sm leading-7 text-ivory/58">It explains history, structure, and mathematical context. It does not offer a winning system, recommendation to play, or claim that knowledge removes risk.</p>
            </aside>
          </div>
        </section>

        <section className="section-pad border-y border-white/8 bg-white/[.02]">
          <div className="container">
            <SectionHeading eyebrow="Documented development" title={`A measured history of ${guide.name}`} description="Dates are used only where the record is reasonably clear; uncertain origin stories are labeled rather than repeated as fact." />
            <div className="mt-12 grid gap-6 lg:grid-cols-2">{guide.history.map(item => <div key={item.period} className="editorial-card p-7"><p className="eyebrow">{item.period}</p><h3 className="mt-3 font-display text-3xl text-ivory">{item.title}</h3><p className="mt-4 leading-7 text-ivory/60">{item.text}</p></div>)}</div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <SectionHeading eyebrow="Core structure" title="Concepts before terminology" description="Rules vary by jurisdiction and venue. These are durable concepts, not a substitute for checking the actual rules in front of you." />
            <div className="mt-10 grid gap-6 md:grid-cols-2">{guide.concepts.map(item => <div key={item.title} className="border-t border-gold/25 pt-6"><h3 className="font-display text-3xl text-ivory">{item.title}</h3><p className="mt-3 leading-7 text-ivory/58">{item.text}</p></div>)}</div>
          </div>
        </section>

        <section className="section-pad border-y border-white/8 bg-black/20">
          <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.7fr)]">
            <div>
              <p className="eyebrow">Plain-language glossary</p>
              <h2 className="mt-3 font-display text-5xl text-ivory">Terms worth knowing</h2>
              <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">{guide.terms.map(item => <div key={item.term} className="grid gap-2 py-5 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-gold-light">{item.term}</dt><dd className="leading-7 text-ivory/60">{item.meaning}</dd></div>)}</dl>
            </div>
            <aside className="rounded-[24px] border border-gold/20 bg-gold/[.06] p-8">
              <Calculator className="h-6 w-6 text-gold" aria-hidden="true" />
              <h2 className="mt-5 font-display text-4xl text-ivory">What the numbers mean</h2>
              <p className="mt-5 leading-8 text-ivory/64">{guide.numbers}</p>
            </aside>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="responsible-callout">
              <ShieldCheck className="h-7 w-7 text-[#95c4d6]" aria-hidden="true" />
              <div><p className="eyebrow text-[#95c4d6]">Responsible entertainment</p><h2 className="mt-2 font-display text-4xl text-ivory">Understanding is not control</h2><p className="mt-4 max-w-3xl leading-8 text-ivory/64">{guide.caveat}</p><Link href="/responsible-entertainment" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b4d7e4]">Read the full safety guide <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-white/8 bg-white/[.02]">
          <div className="container">
            <SectionHeading eyebrow="Continue reading" title="Related reading" description={`Place ${guide.name} in the wider history, research, and responsible-entertainment context.`} />
            <div className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 md:grid-cols-3">
              <Link href={guide.slug === "roulette" ? "/articles/roulette-a-measured-introduction" : "/articles"} className="group bg-[#0f0e0d] p-7"><p className="eyebrow">Current research</p><h3 className="mt-4 font-display text-3xl text-ivory group-hover:text-gold-light">{guide.slug === "roulette" ? "A measured roulette introduction" : "Browse the article desk"}</h3><span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">Read next <ArrowRight className="h-4 w-4" /></span></Link>
              <Link href="/history" className="group bg-[#0f0e0d] p-7"><p className="eyebrow">Historical context</p><h3 className="mt-4 font-display text-3xl text-ivory group-hover:text-gold-light">How casino games evolved</h3><span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">Open the timeline <ArrowRight className="h-4 w-4" /></span></Link>
              <Link href="/guides" className="group bg-[#0f0e0d] p-7"><p className="eyebrow">Learning path</p><h3 className="mt-4 font-display text-3xl text-ivory group-hover:text-gold-light">Probability, rules, and risk</h3><span className="mt-6 inline-flex items-center gap-2 text-sm text-gold">View all guides <ArrowRight className="h-4 w-4" /></span></Link>
            </div>
          </div>
        </section>

        <ResearchReferences title={`${guide.name} research references`} intro="These sources support the historical, regulatory, mathematical, or public-health context in this guide. Rules can vary; primary venue and regulator documents take precedence." sources={guide.sources} />
      </article>
    </>
  );
}
