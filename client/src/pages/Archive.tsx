import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/components/Seo";
import { ARCHIVE_HERO_IMAGE, formatDate } from "@/lib/site";
import { trpc } from "@/lib/trpc";
import { ResearchReferences } from "@/components/ResearchReferences";

export default function Archive() {
  const { data, isLoading } = trpc.editorial.archive.useQuery();

  return (
    <>
      <Seo title="Daily research archive" description="Browse CasinoVerse casino-industry research editions by publication date, with clear sourcing and developing-story labels." path="/archive" image={ARCHIVE_HERO_IMAGE} />
      <header className="archive-header relative overflow-hidden border-b border-gold/15">
        <img src={ARCHIVE_HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b09] via-[#080b09]/90 to-[#080b09]/45" />
        <div className="container relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="eyebrow text-gold">The research vault · Dated source files</p>
            <h1 className="mt-4 max-w-5xl font-display text-[clamp(4rem,9vw,8rem)] leading-[.83] tracking-[-.045em] text-ivory">The daily casino archive.</h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-ivory/58">Each edition captures a defined research day, separates confirmed facts from forecasts or proposals, and opens its evidence through CasinoVerse-owned provenance records.</p>
          </div>
          <div className="rounded-[22px] border border-gold/20 bg-black/15 p-6">
            <FileText className="h-6 w-6 text-gold" />
            <h2 className="mt-4 font-display text-2xl text-ivory">How the archive works</h2>
            <p className="mt-3 text-sm leading-6 text-ivory/50">Completed editions are marked Published. The current calendar day remains Developing until its research window closes and may receive additional verified stories.</p>
            <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-ivory/48">Each file records its research window, story status, source trail, and revision state. A missing upstream file stops downstream publication rather than allowing stale material to pass.</p>
          </div>
        </div>
      </header>

      <section className="section-space">
        <div className="container">
          <div className="flex items-end justify-between border-b border-gold/20 pb-5">
            <div><p className="eyebrow text-gold">All editions</p><h2 className="mt-2 font-display text-4xl text-ivory">Research by date</h2></div>
            <span className="text-sm text-ivory/35">{data?.length || 0} editions</span>
          </div>

          {isLoading ? <div className="mt-8 grid gap-6 md:grid-cols-2"><Skeleton className="h-72 rounded-[24px] bg-white/5" /><Skeleton className="h-72 rounded-[24px] bg-white/5" /></div> : data && data.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {data.map((digest, index) => (
                <article key={digest.id} className={`archive-card group ${index === 0 ? "lg:col-span-2" : ""}`}>
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-gold/8 text-gold"><CalendarDays className="h-5 w-5" /></div>
                    <span className={digest.status === "developing" ? "status-dot" : "eyebrow text-ivory/35"}>{digest.status}</span>
                  </div>
                  <time className="mt-8 block font-display text-2xl text-gold-light" dateTime={digest.digestDate}>{formatDate(`${digest.digestDate}T12:00:00Z`)}</time>
                  <Link href={`/archive/${digest.digestDate}`}><h2 className={`mt-3 font-display leading-[1] text-ivory transition-colors group-hover:text-gold-light ${index === 0 ? "text-4xl md:text-5xl" : "text-3xl"}`}>{digest.title}</h2></Link>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-ivory/52">{digest.summary}</p>
                  <Link href={`/archive/${digest.digestDate}`} className="mt-8 inline-flex items-center gap-2 text-sm text-gold">Open edition <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </article>
              ))}
            </div>
          ) : <div className="story-card mt-8 p-12 text-center"><h2 className="font-display text-3xl text-ivory">The first daily edition is being prepared.</h2></div>}
        </div>
      </section>

      <div className="container pb-24">
        <ResearchReferences
          eyebrow="Archive method"
          title="What makes an edition complete"
          intro="A dated edition preserves the day’s verified source trail, labels forecasts and proposals, and remains developing until the collection window closes. Material corrections update the record rather than silently rewriting its history."
          sources={[
            { name: "The Trust Project", detail: "Reference and methods indicators for showing readers where information came from and how reporting was built.", href: "https://thetrustproject.org/trust-indicators/" },
            { name: "SPJ Code of Ethics", detail: "Guidance to verify information, provide context, update stories, identify sources, and correct mistakes prominently.", href: "https://www.spj.org/spj-code-of-ethics/" },
          ]}
        />
      </div>
    </>
  );
}
