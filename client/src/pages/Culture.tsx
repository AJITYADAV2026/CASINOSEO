import { Link } from "wouter";
import { ArrowRight, Building2, Clapperboard, Palette, Shirt } from "lucide-react";
import { Seo } from "@/components/Seo";
import { ResearchReferences } from "@/components/ResearchReferences";
import { SectionHeading } from "@/components/SectionHeading";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";

const themes = [
  { icon: Building2, title: "Architecture as identity", text: "Casino buildings have ranged from civic rooms and spa-town landmarks to roadside neon properties and mixed-use resorts. Their plans reflect transport, land, regulation, tourism, and changing ideas about comfort." },
  { icon: Palette, title: "Art and atmosphere", text: "Fine-art galleries, installations, gardens, restaurants, and theatrical interiors can position a resort as a cultural destination. Atmosphere may influence attention and emotion, but no single design model describes every venue or every visitor." },
  { icon: Shirt, title: "Dress and etiquette", text: "Formal dress shaped early European gaming rooms, while contemporary expectations vary widely. Etiquette is best understood as respect for staff, other visitors, accessibility, local rules, and the pace of a shared table." },
  { icon: Clapperboard, title: "Film and mythology", text: "Cinema often uses casinos as compressed symbols of risk, wealth, secrecy, capitalism, or corruption. Those stories are cultural interpretations—not documentary accounts of ordinary casino work or participation." },
];

export default function Culture() {
  return <>
    <Seo title="Casino culture" description="Explore casino architecture, interior design, art, entertainment, etiquette, fashion, and film as cultural subjects rather than promotional spectacle." path="/culture" image={EXPANDED_IMAGES.culture} />
    <article>
      <header className="relative min-h-[70vh] overflow-hidden border-b border-gold/15"><img src={EXPANDED_IMAGES.culture} alt="Editorial illustration combining a resort model, theatre curtain, fashion sketch, and gallery plinth" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-vignette absolute inset-0" /><div className="container relative flex min-h-[70vh] items-end pb-16 pt-28"><div className="max-w-4xl"><p className="eyebrow">Space, ritual, and representation</p><h1 className="mt-5 font-display text-6xl leading-[.92] text-ivory sm:text-7xl lg:text-9xl">Casino culture beyond the gaming floor.</h1><p className="mt-6 max-w-3xl text-xl leading-9 text-ivory/72">Architecture, performance, dress, art, etiquette, and cinema shape how casino places are imagined—and how they are experienced.</p><p className="mt-6 text-sm text-ivory/45">CasinoVerse Culture Desk · Reviewed 3 September 2026 · Editorial illustration</p></div></div></header>

      <section className="section-pad"><div className="container grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="article-body max-w-3xl"><p>Casino culture is not one global style. A Belle Époque building in Monaco, a neon corridor in Las Vegas, a Portuguese-Chinese street in Macau, and a contemporary Singapore integrated resort each emerge from different civic histories.</p><p>The spaces also carry tension. Design may invite leisure and spectacle, while the activity at their center carries financial and public-health risk. An informative account must hold both ideas at once.</p></div><aside className="research-method-card self-start"><h2 className="font-display text-3xl text-ivory">A critical visual vocabulary</h2><p className="mt-4 text-sm leading-7 text-ivory/58">We use “influence,” “atmosphere,” and “attention” rather than claiming architecture mechanically controls behavior. Research shows relationships, not a universal response.</p></aside></div></section>

      <section className="section-pad border-y border-white/8 bg-white/[.02]"><div className="container"><SectionHeading eyebrow="Four lenses" title="How to read the casino as culture" description="The page treats the venue as architecture, workplace, stage, image, and social space—not only as a set of games." /><div className="mt-12 grid gap-6 md:grid-cols-2">{themes.map(({ icon: Icon, title, text }) => <section key={title} className="editorial-card p-8"><Icon className="h-6 w-6 text-gold" aria-hidden="true" /><h2 className="mt-5 font-display text-4xl text-ivory">{title}</h2><p className="mt-4 leading-8 text-ivory/60">{text}</p></section>)}</div></div></section>

      <section className="section-pad"><div className="container grid gap-12 lg:grid-cols-2"><div><p className="eyebrow">Changing floor plans</p><h2 className="mt-3 font-display text-5xl text-ivory">From enclosure to experience.</h2><p className="mt-6 leading-8 text-ivory/62">Accounts of casino design often contrast dense, inward-looking gaming layouts with later “playground” environments using daylight, art, gardens, generous circulation, and hospitality. The contrast is useful, but real projects combine many approaches and respond to local codes, accessibility, economics, and brand programs.</p></div><div className="border-l border-gold/25 pl-8"><p className="eyebrow">A wider destination</p><h2 className="mt-3 font-display text-5xl text-ivory">Theatre, food, collections, public space.</h2><p className="mt-6 leading-8 text-ivory/62">Modern resort complexes may contain concert halls, galleries, conventions, restaurants, retail, parks, and transport links. Covering those elements explains why a destination matters without turning the article into an advertisement.</p></div></div></section>

      <section className="section-pad border-y border-white/8 bg-black/20"><div className="container grid gap-10 lg:grid-cols-[1fr_1.2fr]"><div><p className="eyebrow">Media literacy</p><h2 className="mt-3 font-display text-5xl text-ivory">The casino on screen is a constructed symbol.</h2></div><div className="space-y-5 text-lg leading-9 text-ivory/62"><p>Films compress risk, glamour, crime, wealth, and surveillance into a recognizable setting. The result may reveal social attitudes, but it should not be used as evidence for everyday operations.</p><p>CasinoVerse distinguishes cultural criticism from factual reporting and labels generated imagery as editorial illustration.</p><Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-light">Open the visual archive <ArrowRight className="h-4 w-4" /></Link></div></div></section>

      <section className="section-pad"><div className="container"><SectionHeading eyebrow="Place and memory" title="Places that shaped the visual language" description="These locations influenced how casino architecture and entertainment are represented, but each has a distinct history, regulatory system, and urban context." /><div className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-5">{[
        ["Venice", "A civic and carnival setting often used to explain the institutional gaming-house tradition."],
        ["Monte Carlo", "Belle Époque architecture linked gaming with theatre, gardens, hotels, and elite tourism."],
        ["Las Vegas", "Roadside neon, themed resorts, modernism, spectacle, and reinvention shaped global popular imagery."],
        ["Macau", "Portuguese and Chinese urban histories meet a contemporary destination and regulatory model."],
        ["Singapore", "Integrated-resort planning connects major architecture with transport, convention, cultural, and public-space systems."],
      ].map(([place, text]) => <div key={place} className="bg-[#0f0e0d] p-7"><h3 className="font-display text-3xl text-ivory">{place}</h3><p className="mt-4 text-sm leading-7 text-ivory/56">{text}</p></div>)}</div><Link href="/destinations" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-light">Research each destination <ArrowRight className="h-4 w-4" /></Link></div></section>

      <ResearchReferences title="Culture and design references" intro="These sources inform the discussion of art, architecture, fashion history, and the influence of spatial design." sources={[
        { name: "Smithsonian Magazine", detail: "Reporting on art exhibitions and gallery programs within casino resorts.", href: "https://www.smithsonianmag.com/smart-news/can-casinos-be-art-galleries-180980407/" },
        { name: "Fashion Institute of Technology", detail: "Fashion History Timeline reference for early-18th-century dress.", href: "https://fashionhistory.fitnyc.edu/1730-1739/" },
        { name: "Electronic Journal of Business Research Methods", detail: "Virtual-reality examination of architecture, emotions, and gambling behavior.", href: "https://academic-publishing.org/index.php/ejbrm/article/view/1332" },
        { name: "UNLV Center for Gaming Research", detail: "Historical paper on architectural competition in Las Vegas.", href: "https://oasis.library.unlv.edu/occ_papers/24/" },
      ]} />
    </article>
  </>;
}
