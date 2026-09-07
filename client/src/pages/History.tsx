import { Link } from "wouter";
import { ArrowRight, Landmark, Scale, Wrench } from "lucide-react";
import { Seo } from "@/components/Seo";
import { ResearchReferences } from "@/components/ResearchReferences";
import { SectionHeading } from "@/components/SectionHeading";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";

const timeline = [
  { era: "1638", title: "The Ridotto opens in Venice", text: "The Venetian government authorized a controlled gaming house during carnival. Historians often cite it as an early institutional casino, while recognizing that gambling long predated the building." },
  { era: "18th century", title: "European card and wheel games evolve", text: "Twenty-one games, baccarat families, comparison-card games, and number wheels changed across courts, salons, public rooms, and spa towns." },
  { era: "1790s–1840s", title: "Roulette becomes recognizable", text: "Late-18th-century descriptions document a familiar numbered wheel. In the 1840s, the Blanc brothers used a single-zero form at Bad Homburg." },
  { era: "1863", title: "Monte Carlo formalizes destination elegance", text: "The Monte Carlo enterprise linked gaming to theatre, architecture, gardens, hotels, and elite tourism, creating an influential destination model." },
  { era: "1890s", title: "Machines enter the story", text: "Coin-operated mechanical devices culminated in Charles Fey’s compact three-reel payout machines, changing pace, labor, and game presentation." },
  { era: "1931", title: "Nevada legalizes casino gambling", text: "Legalization created the foundation for a regulated Nevada industry; postwar investment later transformed Las Vegas architecture and entertainment." },
  { era: "1976–1978", title: "Atlantic City’s regulated casino era", text: "New Jersey voters approved casino gambling in Atlantic City, and the first property opened in 1978 under a new oversight framework." },
  { era: "1988 onward", title: "Tribal gaming and wider regulatory models", text: "The Indian Gaming Regulatory Act created a federal framework for gaming on Indian lands while other jurisdictions developed distinct commercial regimes." },
  { era: "2000s–today", title: "Integrated resorts and digital systems", text: "Large mixed-use destinations, cashless systems, online channels, machine testing, and public-health regulation reshaped the industry’s boundaries." },
];

export default function History() {
  return (
    <>
      <Seo title="Casino history" description="Trace the documented evolution of casinos, card and wheel games, mechanical machines, regulation, and destination architecture without turning folklore into fact." path="/history" image={EXPANDED_IMAGES.history} />
      <article>
        <header className="casino-editorial-hero relative min-h-[70vh] overflow-hidden border-b border-gold/15">
          <img src={EXPANDED_IMAGES.history} alt="Casino history conservation table with an early roulette wheel, antique cards, mechanical slot reel, dice, blueprint, and archival photographs" className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-vignette absolute inset-0" />
          <div className="container relative flex min-h-[70vh] items-end pb-16 pt-28">
            <div className="max-w-4xl"><p className="eyebrow">An evidence-led timeline</p><h1 className="mt-5 font-display text-6xl leading-[.92] text-ivory sm:text-7xl lg:text-9xl">How casinos became institutions.</h1><p className="mt-6 max-w-3xl text-xl leading-9 text-ivory/72">From regulated carnival rooms and spa-town wheels to mechanical reels, destination resorts, and modern oversight—told with uncertainty where the historical record is incomplete.</p><p className="mt-6 text-sm text-ivory/45">CasinoVerse Research Desk · Reviewed 3 September 2026 · Editorial illustration</p></div>
          </div>
        </header>

        <section className="section-pad"><div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="article-body max-w-3xl"><p>People have played games of chance across many societies, but a casino is more than a game. It is an institution: a designated place, a set of rules, an operator, a revenue model, and—eventually—a regulator.</p><p>The familiar story is not a straight line from one inventor to a global industry. Games moved between languages and jurisdictions, machines changed how outcomes were delivered, and architecture turned gaming rooms into wider entertainment destinations.</p></div>
          <aside className="research-method-card self-start"><Scale className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">History without mythology</h2><p className="mt-4 text-sm leading-7 text-ivory/58">Where origin claims are disputed—especially for poker, baccarat, blackjack, and roulette—we describe documented milestones instead of naming a convenient inventor.</p></aside>
        </div></section>

        <section className="section-pad border-y border-white/8 bg-white/[.02]"><div className="container"><SectionHeading eyebrow="Chronology" title="Nine moments that changed the form" description="The timeline emphasizes institutions, technology, architecture, and law rather than stories of individual wins." /><div className="mt-12 border-l border-gold/30">{timeline.map((item, index) => <div key={item.era} className={`relative grid gap-3 border-b border-white/8 py-8 pl-8 ${index % 2 === 0 ? "md:grid-cols-[150px_1fr]" : "md:grid-cols-[1fr_150px] md:text-right"}`}><span className="absolute -left-[5px] top-10 h-2.5 w-2.5 rounded-full bg-gold" /><p className={`eyebrow ${index % 2 === 0 ? "" : "md:order-2"}`}>{String(index + 1).padStart(2, "0")} · {item.era}</p><div className={index % 2 === 0 ? "" : "md:order-1 md:justify-self-end"}><h3 className="font-display text-3xl text-ivory">{item.title}</h3><p className="mt-3 max-w-3xl leading-7 text-ivory/60">{item.text}</p></div></div>)}</div></div></section>

        <section className="section-pad bg-felt-deep"><div className="container"><SectionHeading eyebrow="How the record is built" title="History needs dates, jurisdictions, mechanisms, and uncertainty." description="CasinoVerse treats historical claims as evidence problems. A date identifies a documented event; a jurisdiction defines the legal setting; a mechanism explains what changed; and a source trail lets readers distinguish an archival record from a repeated legend." /><div className="mt-10 grid gap-6 md:grid-cols-3"><div className="editorial-card p-7"><h3 className="font-display text-3xl text-ivory">Primary record</h3><p className="mt-4 leading-7 text-ivory/58">Legislation, regulator histories, institutional archives, patents, technical documents, and contemporary reporting establish the strongest chronology.</p></div><div className="editorial-card p-7"><h3 className="font-display text-3xl text-ivory">Context layer</h3><p className="mt-4 leading-7 text-ivory/58">Architecture, labor, tourism, technology, and public policy explain why a change mattered beyond a table or machine.</p></div><div className="editorial-card p-7"><h3 className="font-display text-3xl text-ivory">Uncertainty label</h3><p className="mt-4 leading-7 text-ivory/58">When origins are disputed or records are incomplete, the page states the limit instead of converting folklore into certainty.</p></div></div></div></section>

        <section className="section-pad"><div className="container"><SectionHeading eyebrow="Three forces" title="Place, mechanism, oversight" description="The modern casino emerged where destination economics, game technology, and public authority met." /><div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="editorial-card p-8"><Landmark className="h-6 w-6 text-gold" /><h2 className="mt-5 font-display text-4xl text-ivory">Place</h2><p className="mt-4 leading-8 text-ivory/60">Venice, European spa towns, Monte Carlo, Las Vegas, Atlantic City, Macau, and Singapore each connected gaming to a different urban, tourism, and cultural model.</p></div>
          <div className="editorial-card p-8"><Wrench className="h-6 w-6 text-gold" /><h2 className="mt-5 font-display text-4xl text-ivory">Mechanism</h2><p className="mt-4 leading-8 text-ivory/60">Cards, wheels, mechanical reels, electromechanical controls, and random-number software changed speed, scale, and the information visible to participants.</p></div>
          <div className="editorial-card p-8"><Scale className="h-6 w-6 text-gold" /><h2 className="mt-5 font-display text-4xl text-ivory">Oversight</h2><p className="mt-4 leading-8 text-ivory/60">Licensing, technical standards, financial controls, age rules, public-health safeguards, and tribal sovereignty mean there is no single global casino law.</p></div>
        </div></div></section>

        <section className="section-pad border-y border-white/8 bg-white/[.02]"><div className="container grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Historical boundaries</p><h2 className="mt-3 font-display text-5xl text-ivory">What the timeline does not claim</h2></div><div className="article-body"><p>It does not claim that one person invented casino gambling, that modern games appeared in finished form on a single date, or that every jurisdiction followed the same path. Many origin stories were written after the fact, and related games changed as rules moved between languages, venues, and legal systems.</p><p>Dates on this page identify documented institutions, technologies, or regulatory moments. Where the record is contested, the individual game guides describe the uncertainty rather than selecting the most memorable legend.</p></div></div></section>

        <section className="section-pad border-y border-white/8 bg-black/20"><div className="container grid gap-10 lg:grid-cols-2"><div><p className="eyebrow">Continue the chronology</p><h2 className="mt-3 font-display text-5xl text-ivory">Read the games inside the history.</h2><p className="mt-5 max-w-xl leading-8 text-ivory/60">Each guide separates the documented record from familiar legends and adds rule and probability context.</p></div><div className="grid gap-3 sm:grid-cols-2">{["poker","blackjack","roulette","baccarat","slots"].map(slug => <Link key={slug} href={`/games/${slug}`} className="flex items-center justify-between rounded-2xl border border-white/10 p-5 capitalize text-ivory transition-colors hover:border-gold/40 hover:text-gold-light">{slug === "slots" ? "Slot machines" : slug}<ArrowRight className="h-4 w-4" /></Link>)}</div></div></section>

        <ResearchReferences title="Sources for the timeline" intro="These sources support the institutional, technological, architectural, and regulatory milestones. The page avoids claims that rely only on casino folklore." sources={[
          { name: "UNLV Center for Gaming Research", detail: "Occasional papers on casino institutions, technology, capitalism, addiction, and architecture.", href: "https://oasis.library.unlv.edu/occ_papers/" },
          { name: "Immigrant Entrepreneurship", detail: "Scholarly biography of Charles August Fey and the early slot-machine business.", href: "https://www.immigrantentrepreneurship.org/entries/charles-august-fey/" },
          { name: "Georgia State University", detail: "Research overview of how casino institutions changed economies and social organization.", href: "https://news.gsu.edu/2024/01/30/new-research-shows-how-casinos-changed-our-world-and-how-we-think/" },
          { name: "Rutgers — Eagleton Center", detail: "Atlantic City and casino-gambling history in New Jersey.", href: "https://governors.rutgers.edu/atlantic-city-and-casino-gambling-history/" },
        ]} />
      </article>
    </>
  );
}
