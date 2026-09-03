import { useState } from "react";
import { ArrowRight, CheckCircle2, FileSearch, Mail, Scale, Send, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { ABOUT_HERO_IMAGE } from "@/lib/site";
import { ResearchReferences } from "@/components/ResearchReferences";
import { trpc } from "@/lib/trpc";

const standards = [
  ["Trace the claim", "Research stories retain original publisher names, headlines, URLs, publication dates when visible, and the date CasinoVerse accessed the source."],
  ["Label uncertainty", "Forecasts, company statements, proposals, tenders, and unresolved litigation are identified instead of being presented as completed outcomes."],
  ["Add context", "We compare operators, markets, time periods, and regulatory scope so a single headline is not mistaken for an industry-wide conclusion."],
  ["Separate information from promotion", "CasinoVerse does not publish bonus rankings, winning systems, betting picks, deposit links, or encouragement to chase profit."],
];

export default function About() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general" as "correction" | "privacy" | "newsletter" | "general", message: "", consent: false, website: "" });
  const contact = trpc.editorial.contact.useMutation();
  return (
    <>
      <Seo title="About CasinoVerse" description="Learn how CasinoVerse researches casino-industry news, attributes sources, handles developing stories, and maintains an informational-only editorial standard." path="/about" image={ABOUT_HERO_IMAGE} />
      <header className="about-hero relative overflow-hidden border-b border-gold/15">
        <img src={ABOUT_HERO_IMAGE} alt="Independent publication studio overlooking an empty casino floor with notebook, recorder, floor plan, chip catalogue, and camera" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="container relative flex min-h-[620px] items-end py-16 md:items-center md:py-24">
          <div className="max-w-4xl"><p className="eyebrow text-gold">About the publication</p><h1 className="mt-5 font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">Context before<br /><em className="font-normal text-gold-light">conclusion.</em></h1><p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/62">CasinoVerse is an independent informational publication about casino business, design, regulation, games, destinations, and responsible entertainment.</p></div>
        </div>
      </header>

      <section className="section-space">
        <div className="container grid gap-12 lg:grid-cols-[.6fr_1.4fr]">
          <div><FileSearch className="h-10 w-10 text-gold" /><p className="eyebrow mt-7 text-gold">Our mission</p></div>
          <div><h2 className="font-display text-5xl leading-none text-ivory md:text-6xl">Make a complex global industry easier to understand.</h2><p className="mt-7 max-w-3xl text-xl leading-9 text-ivory/58">Casino coverage often sits between finance, law, tourism, technology, entertainment, and public health. CasinoVerse brings those threads together, keeps original sources visible, and writes for readers who want explanation rather than promotion.</p><p className="mt-5 text-xs uppercase tracking-[.14em] text-ivory/35">Standards last reviewed 3 September 2026 · Research desk: CasinoVerse Editorial</p></div>
        </div>
      </section>

      <section id="standards" className="scroll-mt-28 border-y border-gold/15 bg-[#11100f] py-20">
        <div className="container">
          <div className="max-w-3xl"><p className="eyebrow text-gold">Editorial standards</p><h2 className="mt-3 font-display text-5xl leading-none text-ivory">How a CasinoVerse story is built.</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">{standards.map(([title, text], index) => <article key={title} className="standards-card"><div className="flex items-center justify-between"><span className="text-xs tracking-[.16em] text-ivory/25">0{index + 1}</span><CheckCircle2 className="h-5 w-5 text-gold" /></div><h3 className="mt-10 font-display text-3xl text-ivory">{title}</h3><p className="mt-4 text-base leading-7 text-ivory/52">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="section-space">
        <div className="container grid gap-10 lg:grid-cols-3">
          <article><Scale className="h-7 w-7 text-gold" /><h2 className="mt-5 font-display text-3xl text-ivory">Research window</h2><p className="mt-4 leading-7 text-ivory/52">Daily editions are organized by the date on which source publishers visibly released their coverage. A current-day page remains Developing until the research window closes.</p></article>
          <article><FileSearch className="h-7 w-7 text-gold" /><h2 className="mt-5 font-display text-3xl text-ivory">Corrections and updates</h2><p className="mt-4 leading-7 text-ivory/52">Material changes should update the displayed modification date. Developing labels are removed only when the edition is complete. Minor style edits do not create artificial freshness.</p></article>
          <article><ShieldCheck className="h-7 w-7 text-gold" /><h2 className="mt-5 font-display text-3xl text-ivory">Responsible scope</h2><p className="mt-4 leading-7 text-ivory/52">We cover gambling as an industry and cultural subject. We do not offer real-money play, bonuses, odds, wallets, deposits, or systems that claim to guarantee profit.</p></article>
        </div>
      </section>

      <section className="pb-24">
        <div className="container"><div className="digest-banner rounded-[28px] border border-gold/20 p-8 md:p-11"><p className="eyebrow text-gold">Read the work</p><h2 className="mt-3 max-w-3xl font-display text-4xl text-ivory md:text-5xl">Begin with the latest dated research edition.</h2><div className="mt-7 flex flex-wrap gap-4"><Link href="/archive" className="button-gold">Open the archive <ArrowRight className="h-4 w-4" /></Link><a href="#contact" className="button-ghost">Contact the editorial desk <Mail className="h-4 w-4" /></a></div></div></div>
      </section>

      <section id="contact" className="scroll-mt-28 border-y border-white/8 bg-white/[.02] py-20">
        <div className="container grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="eyebrow text-gold">Contact the desk</p><h2 className="mt-4 font-display text-5xl leading-[.95] text-ivory">Corrections, privacy, newsletter, and general questions.</h2><p className="mt-6 max-w-xl leading-8 text-ivory/58">Use this form instead of sending sensitive personal records. The message, contact address, topic, and consent time are stored for editorial follow-up. CasinoVerse does not provide emergency, legal, financial, or treatment advice.</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/20 p-7 md:p-9">
            {contact.isSuccess ? <div className="flex min-h-[360px] flex-col justify-center" role="status"><CheckCircle2 className="h-8 w-8 text-gold" /><h3 className="mt-5 font-display text-4xl text-ivory">Message recorded.</h3><p className="mt-4 max-w-lg leading-8 text-ivory/60">{contact.data.alreadySubmitted ? "An identical message was already received, so no duplicate was created." : "The editorial desk has received your inquiry."}</p></div> : <form className="grid gap-5 sm:grid-cols-2" onSubmit={event => { event.preventDefault(); contact.mutate({ ...form, consent: true }); }}>
              <div><label htmlFor="contact-name" className="text-sm font-semibold text-ivory">Name</label><input id="contact-name" required minLength={2} maxLength={120} value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="mt-2 h-13 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-ivory focus:border-gold" /></div>
              <div><label htmlFor="contact-email" className="text-sm font-semibold text-ivory">Email</label><input id="contact-email" type="email" required maxLength={320} value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} className="mt-2 h-13 w-full rounded-2xl border border-white/12 bg-black/30 px-4 text-ivory focus:border-gold" /></div>
              <div className="sm:col-span-2"><label htmlFor="contact-topic" className="text-sm font-semibold text-ivory">Topic</label><select id="contact-topic" value={form.topic} onChange={event => setForm(current => ({ ...current, topic: event.target.value as typeof current.topic }))} className="mt-2 h-13 w-full rounded-2xl border border-white/12 bg-[#11100f] px-4 text-ivory focus:border-gold"><option value="general">General question</option><option value="correction">Correction or source note</option><option value="privacy">Privacy request</option><option value="newsletter">Newsletter request</option></select></div>
              <div className="sr-only" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setForm(current => ({ ...current, website: event.target.value }))} /></div>
              <div className="sm:col-span-2"><label htmlFor="contact-message" className="text-sm font-semibold text-ivory">Message</label><textarea id="contact-message" required minLength={30} maxLength={4000} rows={7} value={form.message} onChange={event => setForm(current => ({ ...current, message: event.target.value }))} className="mt-2 w-full resize-y rounded-2xl border border-white/12 bg-black/30 p-4 text-ivory focus:border-gold" /></div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-ivory/58 sm:col-span-2"><input type="checkbox" required checked={form.consent} onChange={event => setForm(current => ({ ...current, consent: event.target.checked }))} className="mt-1 h-4 w-4 accent-[#c9a45c]" /><span>I consent to CasinoVerse storing this inquiry and contact address for editorial follow-up. See the <Link href="/privacy" className="text-gold-light underline underline-offset-4">Privacy Policy</Link>.</span></label>
              <div className="sm:col-span-2"><button type="submit" className="button-gold" disabled={!form.consent || contact.isPending}>{contact.isPending ? "Recording message…" : "Send to the editorial desk"}<Send className="h-4 w-4" /></button>{contact.isError && <p className="mt-4 text-sm text-[#e3aaa0]" role="alert">The message could not be saved. Check the fields and try again.</p>}</div>
            </form>}
          </div>
        </div>
      </section>

      <div className="container pb-24">
        <ResearchReferences
          eyebrow="Standards we consult"
          title="A visible reporting method"
          intro="CasinoVerse’s internal standards reflect established principles of verification, source transparency, labeling, independence, correction, and accountable feedback. These references guide our method; they do not certify or endorse the publication."
          sources={[
            { name: "The Trust Project", detail: "Eight indicators covering best practices, expertise, labels, references, methods, local knowledge, diverse voices, and feedback.", href: "https://thetrustproject.org/trust-indicators/" },
            { name: "Society of Professional Journalists", detail: "Ethics guidance on verification, original sources, context, independence, minimizing harm, and prominent corrections.", href: "https://www.spj.org/spj-code-of-ethics/" },
          ]}
        />
      </div>
    </>
  );
}
