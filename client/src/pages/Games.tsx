import { ArrowRight, BookOpen, CircleDot, Club, Diamond, Layers3, Spade } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { GAMES_HERO_IMAGE } from "@/lib/site";
import { ResearchReferences } from "@/components/ResearchReferences";

const games = [
  { slug: "poker", name: "Poker", icon: Spade, history: "A family of comparing-card games shaped by riverboats, saloons, clubs, televised tournaments, and online play.", principle: "Players compete against one another rather than a fixed house hand. Skill affects long-term decisions, but chance remains material.", terms: ["Blinds", "Position", "Pot odds", "Showdown"] },
  { slug: "blackjack", name: "Blackjack", icon: Club, history: "A casino banking game descended from European twenty-one games and refined through modern table rules.", principle: "Players compare a hand against the dealer. Published basic strategy reduces avoidable errors but cannot remove the house edge.", terms: ["Hit", "Stand", "Double", "Split"] },
  { slug: "roulette", name: "Roulette", icon: CircleDot, history: "An eighteenth-century French wheel game whose single-zero and double-zero formats create different mathematical edges.", principle: "Every spin is independent. Staking systems change bet size, not the underlying probability of the next outcome.", terms: ["Inside bet", "Outside bet", "Single zero", "House edge"] },
  { slug: "baccarat", name: "Baccarat", icon: Diamond, history: "A comparing-card game with European court origins that later became prominent in Asian VIP and mass-premium rooms.", principle: "The table resolves player, banker, or tie outcomes under fixed drawing rules. Side bets usually carry materially different edges.", terms: ["Player", "Banker", "Tie", "Commission"] },
  { slug: "slots", name: "Slot Machines", icon: Layers3, history: "Mechanical reels evolved into electronic cabinets and digital games governed by certified random-number systems.", principle: "Return-to-player and volatility describe long-run game design, not what a short session will return to an individual player.", terms: ["RTP", "Volatility", "Paytable", "Random number generator"] },
];

export default function Games() {
  return (
    <>
      <Seo title="Casino game guides" description="Learn the history, terminology, probability, and risk fundamentals of poker, blackjack, roulette, baccarat, and slots." path="/games" image={GAMES_HERO_IMAGE} />
      <header className="games-hero relative overflow-hidden border-b border-gold/15">
        <img src={GAMES_HERO_IMAGE} alt="Five-part casino game study table with cards, roulette geometry, a dealing shoe, notation, and reel mechanics" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <div className="container relative flex min-h-[600px] items-end py-16 md:items-center md:py-24">
          <div className="max-w-4xl">
            <p className="eyebrow text-gold">Casino games, decoded</p>
            <h1 className="mt-5 font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">Learn the rules.<br /><em className="font-normal text-gold-light">Respect the odds.</em></h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/65">A history-led guide to how familiar casino games work, the language used at the table, and the mathematical reality behind the experience.</p>
          </div>
        </div>
      </header>

      <section className="section-space">
        <div className="container">
          <div className="grid gap-5 lg:grid-cols-2">
            {games.map((game, index) => {
              const Icon = game.icon;
              return <article key={game.name} className={`game-primer ${index === 0 ? "lg:col-span-2" : ""}`}>
                <div className="flex items-start justify-between gap-5"><span className="game-index">0{index + 1}</span><Icon className="h-7 w-7 text-gold" /></div>
                <h2 className="mt-10 font-display text-5xl text-ivory">{game.name}</h2>
                <div className={`mt-7 grid gap-8 ${index === 0 ? "md:grid-cols-2" : ""}`}>
                  <div><p className="eyebrow text-ivory/35">Origins and culture</p><p className="mt-3 leading-7 text-ivory/58">{game.history}</p></div>
                  <div><p className="eyebrow text-ivory/35">Core principle</p><p className="mt-3 leading-7 text-ivory/58">{game.principle}</p></div>
                </div>
                <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${game.name} key terms`}>{game.terms.map(term => <li key={term} className="term-chip">{term}</li>)}</ul>
                <Link href={`/games/${game.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light">Read the complete {game.name.toLowerCase()} guide <ArrowRight className="h-4 w-4" /></Link>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gold/15 bg-[#11100f] py-20">
        <div className="container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <BookOpen className="h-16 w-16 text-gold/70" />
          <div><p className="eyebrow text-gold">One rule applies everywhere</p><h2 className="mt-4 font-display text-4xl text-ivory md:text-5xl">No system can turn a house edge into a guarantee.</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-ivory/55">Probability describes large numbers of outcomes, not a promise about a particular session. Treat any participation as a capped entertainment expense and never use money needed for essential commitments.</p><Link href="/responsible-entertainment" className="button-ghost mt-7">Read the responsible-entertainment guide <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <div className="container py-20">
        <ResearchReferences
          title="How to read a game guide"
          intro="Rules describe what can happen; probability describes long-run patterns; neither predicts a short session. CasinoVerse separates fixed game mechanisms from venue-specific rules and treats any participation as risk-bearing entertainment."
          sources={[
            { name: "Arizona Department of Gaming", detail: "2026 training on gambling literacy, independent outcomes, myths, limits, and signs of harm.", href: "https://gaming.az.gov/sites/default/files/files/AZ%20Responsible%20Gaming%20-%20Modules%204-6.pdf" },
            { name: "World Health Organization", detail: "Public-health overview of gambling exposure, product risk, prevention, and harm.", href: "https://www.who.int/news-room/fact-sheets/detail/gambling" },
          ]}
        />
      </div>
    </>
  );
}
