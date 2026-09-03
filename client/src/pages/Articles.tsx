import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, SlidersHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";
import { Seo } from "@/components/Seo";
import { StoryCard } from "@/components/StoryCard";
import { SectionHeading } from "@/components/SectionHeading";
import { ResearchReferences } from "@/components/ResearchReferences";

export default function Articles() {
  const { data, isLoading } = trpc.editorial.homepage.useQuery();
  const [category, setCategory] = useState("all");
  const stories = data?.stories ?? [];
  const categories = data?.categories ?? [];
  const filtered = useMemo(
    () => category === "all" ? stories : stories.filter(item => item.category.slug === category),
    [category, stories],
  );
  const featured = stories.find(item => item.story.isLead) ?? stories[0];
  const editorsSelection = stories.filter(item => item.story.isFeatured && item.story.id !== featured?.story.id).slice(0, 4);

  return (
    <>
      <Seo title="Blog" description="Explore CasinoVerse Blog reporting and explainers on casino markets, regulation, operations, culture, travel, game literacy, and responsible entertainment." path="/articles" image={EXPANDED_IMAGES.articles} />
      <section className="relative min-h-[62vh] overflow-hidden border-b border-gold/15">
        <img src={EXPANDED_IMAGES.articles} alt="CasinoVerse research dossiers and source cards on an editorial desk" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-vignette absolute inset-0" />
        <div className="container relative flex min-h-[62vh] items-end pb-16 pt-28">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3"><span className="format-label">Blog</span><p className="eyebrow">The research ledger</p></div>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[.96] text-ivory sm:text-6xl lg:text-8xl">Blog reporting with sources, context, and restraint.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ivory/72">Daily developments and evergreen explainers are separated, dated, attributed, and written for readers who want to understand the industry rather than be sold a wager.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/archive" className="button-gold">Browse daily editions</Link>
              <Link href="/search" className="button-ghost"><Search className="h-4 w-4" /> Search the publication</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-white/8">
        <div className="container">
          <SectionHeading eyebrow="Lead analysis" title={featured?.story.title ?? "The latest CasinoVerse research"} description={featured?.story.dek ?? "Current sourced coverage will appear here as the research desk publishes it."} />
          {featured && <div className="mt-10"><StoryCard item={featured} variant="horizontal" /></div>}
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow="Complete desk" title="Read by subject" description="Filter the current public story ledger without losing publication dates or category context." />
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-2" aria-label="Filter Blog posts by category">
              <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <button type="button" onClick={() => setCategory("all")} className={`filter-chip ${category === "all" ? "is-active" : ""}`}>All</button>
              {categories.map(item => <button key={item.slug} type="button" onClick={() => setCategory(item.slug)} className={`filter-chip ${category === item.slug ? "is-active" : ""}`}>{item.name}</button>)}
            </div>
          </div>
          {isLoading ? <p className="mt-10 text-ivory/60">Loading the Blog ledger…</p> : filtered.length ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">{filtered.map(item => <StoryCard key={item.story.id} item={item} />)}</div>
          ) : <p className="mt-10 text-ivory/60">No public stories are available in this topic yet.</p>}
        </div>
      </section>

      {editorsSelection.length > 0 && <section className="section-pad border-y border-white/8 bg-white/[.02]">
        <div className="container">
          <SectionHeading eyebrow="Editor’s selection" title="Context worth keeping close" description="A transparent editorial selection—not a popularity ranking and not an engagement claim." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">{editorsSelection.map(item => <StoryCard key={item.story.id} item={item} variant="compact" />)}</div>
        </div>
      </section>}

      <ResearchReferences title="How this index is assembled" intro="CasinoVerse favors original documents, regulators, company disclosures, reputable trade reporting, universities, and public-health sources. Developing stories are visibly labeled and may remain outside indexing until their reporting window closes." sources={[
        { name: "Society of Professional Journalists", detail: "Code of Ethics: verification, attribution, corrections, and minimizing harm.", href: "https://www.spj.org/ethicscode.asp" },
        { name: "Thomson Reuters Trust Principles", detail: "Independence, integrity, freedom from bias, and reliable news service.", href: "https://www.thomsonreuters.com/en/about-us/trust-principles.html" },
        { name: "CasinoVerse editorial standards", detail: "Our sourcing, developing-story, corrections, and informational-only rules.", href: "/about#standards" },
      ]} />
    </>
  );
}
