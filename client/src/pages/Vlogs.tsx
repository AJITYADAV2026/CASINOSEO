import { Link } from "wouter";
import { Captions, FileText, Film, Mic2, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/Seo";
import { ResearchReferences } from "@/components/ResearchReferences";
import { SectionHeading } from "@/components/SectionHeading";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";

const plannedFormats = [
  { title: "Behind the architecture", status: "In development", text: "Source-led visual essays on floor plans, transport, public space, theatre, and the city around a resort." },
  { title: "One rule, clearly explained", status: "In development", text: "Short game-literacy explainers with diagrams, captions, transcripts, and jurisdictional caveats." },
  { title: "The daily dossier", status: "In development", text: "A concise visual briefing that separates confirmed results, forecasts, proposals, and unresolved developments." },
  { title: "Responsible entertainment conversations", status: "In development", text: "Evidence-led discussions of gambling harm, product design, treatment, exclusion, and public policy." },
];

export default function Vlogs() {
  return <>
    <Seo title="Vlogs and video desk" description="CasinoVerse’s transparent video desk: planned research-led formats, caption and transcript standards, source disclosure, and current written coverage." path="/vlogs" image={EXPANDED_IMAGES.vlogs} />
    <article>
      <header className="relative min-h-[68vh] overflow-hidden border-b border-gold/15"><img src={EXPANDED_IMAGES.vlogs} alt="Editorial illustration of a documentary camera, caption monitor, transcript pages, and audio recorder" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-vignette absolute inset-0" /><div className="container relative flex min-h-[68vh] items-end pb-16 pt-28"><div className="max-w-4xl"><div className="flex flex-wrap items-center gap-3"><span className="format-label">Vlog</span><p className="eyebrow">Video desk</p></div><h1 className="mt-5 font-display text-6xl leading-[.92] text-ivory sm:text-7xl lg:text-9xl">A transparent studio, before the first episode.</h1><p className="mt-6 max-w-3xl text-xl leading-9 text-ivory/72">CasinoVerse has not published original video episodes yet. This page documents the formats, sourcing, captions, transcripts, and visual-disclosure standards that must exist first.</p><p className="mt-6 text-sm text-ivory/45">CasinoVerse Video Desk · Standards reviewed 3 September 2026 · Editorial illustration</p></div></div></header>

      <section className="section-pad"><div className="container grid gap-12 lg:grid-cols-[1fr_360px]"><div className="article-body max-w-3xl"><p>A serious video page should not imitate a channel that does not yet exist. We do not invent episode titles, hosts, durations, view counts, thumbnails, or release dates.</p><p>When CasinoVerse publishes video, each item will be attached to a research record. Claims will be source-linked, third-party material will be attributed, re-creations and generated imagery will be labeled, and corrections will remain visible.</p></div><aside className="research-method-card self-start"><ShieldCheck className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">No published episodes</h2><p className="mt-4 text-sm leading-7 text-ivory/58">No CasinoVerse episode is represented as published. Readers can use the Blog archive while the accessible production system is developed.</p><Link href="/articles" className="mt-5 inline-flex text-sm font-semibold text-gold-light">Browse current Blogs →</Link></aside></div></section>

      <section className="section-pad border-y border-white/8 bg-white/[.02]"><div className="container"><SectionHeading eyebrow="Planned formats" title="Four series, no invented catalogue" description="These cards describe production intentions. They are not episode listings and contain no engagement claims." /><div className="mt-12 grid gap-6 md:grid-cols-2">{plannedFormats.map(item => <section key={item.title} className="editorial-card p-8"><div className="flex items-center justify-between gap-4"><Film className="h-6 w-6 text-gold" /><span className="rounded-full border border-gold/20 px-3 py-1 text-[10px] uppercase tracking-[.18em] text-gold-light">{item.status}</span></div><h2 className="mt-6 font-display text-4xl text-ivory">{item.title}</h2><p className="mt-4 leading-8 text-ivory/60">{item.text}</p></section>)}</div></div></section>

      <section className="section-pad"><div className="container"><SectionHeading eyebrow="Publication standard" title="Captions and transcripts are non-negotiable" description="Every genuine CasinoVerse Vlog must remain understandable without sound and must describe essential visual evidence." /><div className="mt-10 grid gap-6 lg:grid-cols-3"><div className="border-t border-gold/30 pt-6"><Captions className="h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Captions</h2><p className="mt-3 leading-7 text-ivory/58">Synchronized captions identify speakers and meaningful non-speech audio rather than reproducing dialogue alone.</p></div><div className="border-t border-gold/30 pt-6"><FileText className="h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Descriptive transcript</h2><p className="mt-3 leading-7 text-ivory/58">A full transcript records spoken content and essential visual information, including charts, locations, and on-screen evidence.</p></div><div className="border-t border-gold/30 pt-6"><Mic2 className="h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Source disclosure</h2><p className="mt-3 leading-7 text-ivory/58">Descriptions link the underlying article, original documents, footage owners, music licenses, and production notes.</p></div></div></div></section>

      <ResearchReferences title="Video accessibility and accuracy standards" intro="These standards shape CasinoVerse’s future video desk and explain why this page does not fabricate a finished media catalogue." sources={[
        { name: "W3C Web Accessibility Initiative", detail: "Captions, audio description, transcripts, and accessible media players.", href: "https://www.w3.org/WAI/media/av/" },
        { name: "PBS Standards", detail: "Transparency, source disclosure, visual context, and audience trust.", href: "https://www.pbs.org/standards/transparency/" },
        { name: "BBC Editorial Guidelines", detail: "Accuracy, attribution, correction, and the treatment of uncertainty.", href: "https://www.bbc.com/editorialguidelines/guidelines/accuracy/guidelines" },
        { name: "American Alliance of Museums", detail: "Accessible communications guidance for public-facing cultural material.", href: "https://www.aam-us.org/2021/07/01/accessible-communications-guidelines/" },
      ]} />
    </article>
  </>;
}
