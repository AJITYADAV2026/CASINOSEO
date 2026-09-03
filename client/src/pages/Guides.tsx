import { ArrowRight, BookMarked, Compass, History, Languages, Scale, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { GUIDES_HERO_IMAGE } from "@/lib/site";
import { trpc } from "@/lib/trpc";
import { ResearchReferences } from "@/components/ResearchReferences";

const paths = [
  { icon: History, title: "Start with history", text: "Understand where games came from, how rules evolved, and why different regions developed distinct casino cultures." },
  { icon: Languages, title: "Learn the language", text: "Table terms become easier when they are grouped by action, position, payout structure, and decision point." },
  { icon: Scale, title: "Read the probability", text: "House edge, return-to-player, variance, and volatility describe long-run design—not a promise about a short session." },
  { icon: Compass, title: "Know the etiquette", text: "Venue rules, dealer instructions, chip handling, and table pace can vary. Ask staff rather than guessing." },
  { icon: ShieldCheck, title: "Set limits first", text: "Decide time and spending caps before play, avoid credit or borrowed money, and never chase a loss." },
];

export default function Guides() {
  const { data } = trpc.editorial.homepage.useQuery();
  const guides = ((data?.stories || []) as StoryCardData[]).filter(item => ["game-guides", "responsible-entertainment"].includes(item.category.slug));

  return (
    <>
      <Seo title="Casino guides" description="Beginner-friendly CasinoVerse guides to game history, terminology, probability, etiquette, and responsible entertainment." path="/guides" image={GUIDES_HERO_IMAGE} />
      <header className="guides-header border-b border-gold/15">
        <div className="container grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_.75fr] lg:items-center">
          <div><p className="eyebrow text-gold">The CasinoVerse field guide</p><h1 className="mt-5 font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">Curiosity,<br /><em className="font-normal text-gold-light">properly informed.</em></h1><p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/58">Build a clear foundation before learning any betting layout: origins, vocabulary, probability, etiquette, and limits.</p></div>
          <div className="image-frame aspect-[4/3] rounded-[28px] border border-gold/15"><img src={GUIDES_HERO_IMAGE} alt="Quiet editorial library with probability diagrams, rulebooks, and annotated research notes" /></div>
        </div>
      </header>

      <section className="section-space">
        <div className="container">
          <div className="max-w-3xl"><p className="eyebrow text-gold">A better starting point</p><h2 className="mt-3 font-display text-5xl leading-none text-ivory">Five steps before the first wager.</h2><p className="mt-5 text-lg leading-8 text-ivory/55">The strongest guides explain systems and tradeoffs. They do not promise wins, invent secret strategies, or disguise risk.</p></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 lg:grid-cols-5">
            {paths.map((path, index) => { const Icon = path.icon; return <article key={path.title} className="bg-[#161412] p-7"><span className="text-xs tracking-[.16em] text-ivory/25">0{index + 1}</span><Icon className="mt-12 h-6 w-6 text-gold" /><h3 className="mt-5 font-display text-2xl text-ivory">{path.title}</h3><p className="mt-3 text-sm leading-6 text-ivory/48">{path.text}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="border-y border-gold/15 bg-[#11100f] py-20">
        <div className="container">
          <div className="flex flex-col gap-5 border-b border-gold/20 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-gold">Read and learn</p><h2 className="mt-2 font-display text-4xl text-ivory">Published guides</h2></div><Link href="/games" className="inline-flex items-center gap-2 text-sm text-gold">Explore games <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{guides.map(item => <StoryCard key={item.story.id} item={item} />)}</div>
        </div>
      </section>

      <section className="section-space">
        <div className="container grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-center">
          <BookMarked className="h-20 w-20 text-gold/65" />
          <div><p className="eyebrow text-gold">Our guide standard</p><h2 className="mt-4 font-display text-4xl text-ivory md:text-5xl">Explain the mechanism. State the limitation. Link the evidence.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-ivory/55">CasinoVerse guides distinguish mathematical properties from anecdotes, label regional rule differences, avoid claims that a system can guarantee profit, and connect responsible-entertainment guidance to every subject where financial risk is relevant.</p></div>
        </div>
      </section>

      <div className="container pb-24">
        <ResearchReferences
          title="Evidence before anecdotes"
          intro="Our learning path uses regulator and public-health material to explain randomness, cognitive bias, pre-commitment, and the limits of short-session experience. Regional rules still vary, so a guide is never a substitute for checking the specific venue or regulator."
          sources={[
            { name: "Arizona Responsible Gaming Training", detail: "Gambling literacy, the gambler’s fallacy, pre-commitment, warning signs, and support tools.", href: "https://gaming.az.gov/sites/default/files/files/AZ%20Responsible%20Gaming%20-%20Modules%204-6.pdf" },
            { name: "UK Gambling Commission", detail: "Regulatory guidance on transparent, socially responsible gambling communication.", href: "https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/advertising-marketing-rules-and-regulations" },
          ]}
        />
      </div>
    </>
  );
}
