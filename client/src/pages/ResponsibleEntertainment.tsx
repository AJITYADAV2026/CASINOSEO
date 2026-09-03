import { AlarmClock, Ban, CreditCard, ExternalLink, HandHeart, PauseCircle, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { RESPONSIBLE_IMAGE } from "@/lib/site";

const limits = [
  { icon: WalletCards, title: "Set a loss limit", text: "Choose an amount that can be lost without affecting housing, food, bills, debt, savings, or other commitments." },
  { icon: AlarmClock, title: "Set a time limit", text: "Decide when the session ends before it begins. Use a timer and include regular breaks away from the screen or venue." },
  { icon: CreditCard, title: "Do not borrow", text: "Avoid credit, loans, overdrafts, or money belonging to somebody else. Gambling should never be used to solve financial pressure." },
  { icon: Ban, title: "Never chase losses", text: "Increasing stakes to recover earlier losses can accelerate harm. A loss remains part of the predetermined entertainment cost." },
];

const signs = ["Spending more time or money than intended", "Trying to recover losses by gambling again", "Hiding activity, transactions, or debt", "Missing work, study, sleep, or family commitments", "Feeling anxious, irritable, or unable to stop", "Using gambling to escape distress or financial problems"];

export default function ResponsibleEntertainment() {
  return (
    <>
      <Seo title="Responsible entertainment" description="Practical information about gambling risk, time and spending limits, warning signs, blocking tools, self-exclusion, and support." path="/responsible-entertainment" image={RESPONSIBLE_IMAGE} />
      <header className="responsible-hero border-b border-[#7893A6]/25">
        <div className="container grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_.78fr] lg:items-center">
          <div><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#9fb8c9]" /><p className="eyebrow text-[#9fb8c9]">Responsible entertainment</p></div><h1 className="mt-6 font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">Keep the game<br /><em className="font-normal text-[#b4c7d4]">in its place.</em></h1><p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/60">Gambling is a paid form of entertainment with a built-in risk of loss. Limits are most effective when they are decided before play—not while emotions are high.</p></div>
          <div className="image-frame aspect-[4/3] rounded-[28px] border border-[#7893A6]/25"><img src={RESPONSIBLE_IMAGE} alt="Calm lounge still life with a clock, notebook, water, and one gaming chip" /></div>
        </div>
      </header>

      <section className="section-space">
        <div className="container">
          <div className="max-w-3xl"><p className="eyebrow text-gold">Before participation</p><h2 className="mt-3 font-display text-5xl leading-none text-ivory">Four boundaries to set first.</h2></div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{limits.map(item => { const Icon = item.icon; return <article key={item.title} className="limit-card"><Icon className="h-7 w-7 text-[#9fb8c9]" /><h3 className="mt-10 font-display text-2xl text-ivory">{item.title}</h3><p className="mt-3 text-sm leading-6 text-ivory/50">{item.text}</p></article>; })}</div>
        </div>
      </section>

      <section className="border-y border-gold/15 bg-[#11100f] py-20">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div><p className="eyebrow text-gold">Notice the change</p><h2 className="mt-4 font-display text-4xl leading-none text-ivory md:text-5xl">When entertainment starts becoming harm.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-ivory/55">One sign does not diagnose a condition, but repeated loss of control, secrecy, financial pressure, or distress is a reason to stop and seek support.</p></div>
          <ul className="grid gap-3" aria-label="Possible warning signs">{signs.map(sign => <li key={sign} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[.02] p-4 text-ivory/62"><PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><span>{sign}</span></li>)}</ul>
        </div>
      </section>

      <section className="section-space">
        <div className="container grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div><HandHeart className="h-12 w-12 text-[#9fb8c9]" /><p className="eyebrow mt-7 text-[#9fb8c9]">Create distance</p><h2 className="mt-3 font-display text-4xl text-ivory">Tools and support can help.</h2></div>
          <div className="grid gap-4">
            <SupportCard title="Use account or venue controls" text="Set deposit, loss, wager, and session limits where available. Temporary time-outs and permanent self-exclusion create additional distance." />
            <SupportCard title="Add financial friction" text="Ask your bank whether it offers gambling transaction blocks. Remove saved payment methods and avoid carrying cards or cash into a venue." />
            <SupportCard title="Talk to someone early" text="A trusted person, qualified counsellor, or local gambling-harm service can help with practical, emotional, and financial next steps." />
            <div className="grid gap-3 rounded-[20px] border border-[#7893A6]/25 bg-[#14181a] p-6 sm:grid-cols-2">
              <a href="https://www.ncpgambling.org/help-treatment/" target="_blank" rel="noreferrer noopener" className="support-link">National Council on Problem Gambling <ExternalLink className="h-4 w-4" /><small>United States resources</small></a>
              <a href="https://www.gamblingtherapy.org/" target="_blank" rel="noreferrer noopener" className="support-link">Gambling Therapy <ExternalLink className="h-4 w-4" /><small>International online support</small></a>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container">
          <div className="rounded-[26px] border border-gold/20 bg-[#171410] p-8 md:p-10"><p className="eyebrow text-gold">Important disclosure</p><p className="mt-4 max-w-5xl text-lg leading-8 text-ivory/62">CasinoVerse is an informational publication. We do not offer gambling, deposits, withdrawals, bonuses, odds, or real-money games. This page provides general education and is not medical or financial advice. If gambling is causing immediate danger, severe distress, or thoughts of self-harm, contact local emergency services or an appropriate crisis service now.</p><Link href="/" className="mt-6 inline-flex text-sm text-gold">Return to CasinoVerse →</Link></div>
        </div>
      </section>
    </>
  );
}

function SupportCard({ title, text }: { title: string; text: string }) { return <article className="grid gap-3 border-b border-white/10 pb-6 sm:grid-cols-[200px_1fr]"><h3 className="font-display text-2xl text-ivory">{title}</h3><p className="text-base leading-7 text-ivory/52">{text}</p></article>; }
