import { useMemo, useRef, useState } from "react";
import { Expand, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Seo } from "@/components/Seo";
import { ResearchReferences } from "@/components/ResearchReferences";
import { SectionHeading } from "@/components/SectionHeading";
import { EXPANDED_IMAGES } from "@/lib/expandedContent";

const items = [
  { id: "architecture", category: "Architecture", title: "Belle Époque civic theatre", image: EXPANDED_IMAGES.galleryArchitecture, alt: "Editorial illustration of an imagined Belle Époque casino façade and blueprint fragments", caption: "An interpretive architectural study of the civic grandeur associated with late-19th-century European casino destinations. This is not a photograph of a specific surviving building." },
  { id: "interiors", category: "Interiors", title: "A spacious contemporary resort", image: EXPANDED_IMAGES.galleryInteriors, alt: "Editorial illustration of a contemporary resort interior with daylight, art, seating, and wide circulation", caption: "A conceptual interior combining daylight, planting, art, seating, and generous movement routes to examine the shift from enclosed gaming rooms toward mixed-use destination space." },
  { id: "cards", category: "Games", title: "Cards as printed objects", image: EXPANDED_IMAGES.galleryCards, alt: "Editorial illustration of a historical playing-card print workshop with blocks, pigments, and paper", caption: "A fictionalized print workshop used to explain that playing cards became cultural and commercial objects through paper, carving, pigment, craft, and later mass production." },
  { id: "roulette", category: "Games", title: "The geometry of a wheel", image: EXPANDED_IMAGES.galleryRoulette, alt: "Editorial illustration showing roulette wheel geometry and ball-track construction", caption: "A technical visual study of wheel construction and pocket rhythm. It is explanatory art—not evidence for one historic wheel and not a depiction of a live outcome." },
  { id: "entertainment", category: "Entertainment", title: "Before the house opens", image: EXPANDED_IMAGES.galleryEntertainment, alt: "Editorial illustration of an empty theatre stage with curtains, work lights, and seating", caption: "An empty theatre emphasizes the labor, infrastructure, and performance culture that sit beside gaming in many resort complexes." },
  { id: "destination", category: "Destinations", title: "Coastal resort city", image: EXPANDED_IMAGES.galleryDestination, alt: "Editorial illustration of a coastal entertainment city with boardwalk, heritage façades, and modern towers", caption: "A composite cityscape evokes the layers of transport, shoreline leisure, heritage, and contemporary development found in several casino destinations without claiming to document one place." },
  { id: "accessibility", category: "Design", title: "Inclusive circulation", image: EXPANDED_IMAGES.galleryAccessibility, alt: "Editorial isometric illustration of accessible routes, tactile paths, seating clearances, and a low service counter", caption: "A design study of wide routes, clear contrast, tactile guidance, seating choices, low counters, and quieter spaces. Real accessibility depends on codes, maintenance, staff practice, and lived experience." },
  { id: "archive", category: "Research", title: "The evidence room", image: EXPANDED_IMAGES.galleryArchive, alt: "Editorial illustration of conserved dossiers, mechanical diagrams, film negatives, and archival tools", caption: "A conceptual research archive representing the source trails behind CasinoVerse history, game education, and daily reporting." },
];

type GalleryItem = (typeof items)[number];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const categories = ["All", ...Array.from(new Set(items.map(item => item.category)))];
  const visible = useMemo(() => filter === "All" ? items : items.filter(item => item.category === filter), [filter]);

  return <>
    <Seo title="Visual gallery" description="Explore CasinoVerse editorial illustrations of architecture, interiors, games, entertainment, destinations, inclusive design, and archival research." path="/gallery" image={EXPANDED_IMAGES.gallery} />
    <article>
      <header className="relative min-h-[68vh] overflow-hidden border-b border-gold/15"><img src={EXPANDED_IMAGES.gallery} alt="Editorial illustration of a dark museum wall displaying architecture, cards, wheel, theatre, and destination studies" className="absolute inset-0 h-full w-full object-cover" /><div className="hero-vignette absolute inset-0" /><div className="container relative flex min-h-[68vh] items-end pb-16 pt-28"><div className="max-w-4xl"><p className="eyebrow">Visual archive</p><h1 className="mt-5 font-display text-6xl leading-[.92] text-ivory sm:text-7xl lg:text-9xl">Images that explain, not impersonate evidence.</h1><p className="mt-6 max-w-3xl text-xl leading-9 text-ivory/72">Eight publication-owned editorial illustrations explore buildings, objects, systems, and place. Every image is labeled so it cannot be mistaken for a documentary photograph.</p><p className="mt-6 text-sm text-ivory/45">CasinoVerse Visual Desk · Curated 3 September 2026 · Editorial illustrations</p></div></div></header>

      <section className="section-pad"><div className="container grid gap-12 lg:grid-cols-[1fr_360px]"><div className="article-body max-w-3xl"><p>Visual journalism can clarify a floor plan, a mechanical transition, or the relationship between a destination and its transport. It can also mislead when an illustration is presented as an archival object.</p><p>CasinoVerse uses generated images as interpretive editorial art. Captions identify composite scenes, imagined spaces, and explanatory studies; factual claims remain in the sourced text.</p></div><aside className="research-method-card self-start"><ImageIcon className="h-5 w-5 text-gold" /><h2 className="mt-4 font-display text-3xl text-ivory">Labeling rule</h2><p className="mt-4 text-sm leading-7 text-ivory/58">Every gallery item is an **Editorial illustration**. None is presented as a photograph of a named casino, person, artifact, or event.</p></aside></div></section>

      <section className="section-pad border-y border-white/8 bg-white/[.02]"><div className="container"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><SectionHeading eyebrow="Eight studies" title="Browse the visual archive" description="Select an image to open its large-format captioned view. Escape closes the dialog and returns focus to the trigger." /><div className="flex max-w-full gap-2 overflow-x-auto pb-2" aria-label="Filter gallery by category">{categories.map(category => <button key={category} type="button" onClick={() => setFilter(category)} className={`filter-chip ${filter === category ? "is-active" : ""}`}>{category}</button>)}</div></div><div className="mt-12 columns-1 gap-6 md:columns-2 xl:columns-3">{visible.map((item, index) => <button key={item.id} type="button" onClick={event => { lastTriggerRef.current = event.currentTarget; setSelected(item); }} className="group relative mb-6 block w-full break-inside-avoid overflow-hidden rounded-[24px] border border-white/10 bg-black text-left"><img src={item.image} alt={item.alt} className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] ${index % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`} /><span className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" /><span className="absolute inset-x-0 bottom-0 p-6"><span className="flex items-center justify-between gap-4"><span><span className="text-[10px] uppercase tracking-[.2em] text-gold-light">{item.category} · Editorial illustration</span><strong className="mt-2 block font-display text-3xl font-normal text-ivory">{item.title}</strong></span><Expand className="h-5 w-5 text-gold opacity-70" /></span></span></button>)}</div></div></section>

      <ResearchReferences title="Context for the visual archive" intro="The illustrations are shaped by architectural, urban, object-history, and accessibility research. Captions deliberately avoid pretending that generated scenes are historical evidence." sources={[
        { name: "UNLV Center for Gaming Research", detail: "Casino Architecture Wars and the changing competitive language of Las Vegas design.", href: "https://oasis.library.unlv.edu/occ_papers/24/" },
        { name: "MIT DSpace", detail: "Casinos in Context: urban-neighborhood impacts and the built environment.", href: "https://dspace.mit.edu/bitstream/handle/1721.1/42272/231844677-MIT.pdf?sequence=2" },
        { name: "University of Iowa Libraries", detail: "Historical overview of playing cards as printed cultural objects.", href: "https://blog.lib.uiowa.edu/gallery/2025/11/18/students-investigate-a-brief-history-of-cards/" },
        { name: "W3C Web Accessibility Initiative", detail: "Accessibility principles informing captions, alternatives, and interaction.", href: "https://www.w3.org/WAI/" },
      ]} />
    </article>

    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent onCloseAutoFocus={event => { event.preventDefault(); lastTriggerRef.current?.focus(); }} className="max-h-[92vh] max-w-5xl overflow-y-auto border-gold/20 bg-[#100f0e] p-0 text-ivory">
        {selected && <><img src={selected.image} alt={selected.alt} className="max-h-[64vh] w-full bg-black object-contain" /><div className="p-7 sm:p-9"><DialogHeader><p className="eyebrow text-gold">{selected.category} · Editorial illustration</p><DialogTitle className="font-display text-4xl font-normal text-ivory">{selected.title}</DialogTitle><DialogDescription className="pt-3 text-base leading-8 text-ivory/60">{selected.caption}</DialogDescription></DialogHeader></div></>}
      </DialogContent>
    </Dialog>
  </>;
}
