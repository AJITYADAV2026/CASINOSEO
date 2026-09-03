import { Search as SearchIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearch } from "wouter";
import { Seo } from "@/components/Seo";
import { StoryCard, type StoryCardData } from "@/components/StoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function Search() {
  const search = useSearch();
  const initial = new URLSearchParams(search).get("q") || "";
  const [input, setInput] = useState(initial);
  const [query, setQuery] = useState(initial);
  const enabled = query.trim().length >= 2;
  const { data, isLoading } = trpc.editorial.search.useQuery({ query }, { enabled });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = input.trim();
    setQuery(next);
    if (typeof window !== "undefined") window.history.replaceState({}, "", next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <>
      <Seo title="Search" description="Search CasinoVerse research, regulation, culture, game guides, and responsible-entertainment coverage." path="/search" noIndex />
      <header className="search-header border-b border-gold/15">
        <div className="container py-16 md:py-24">
          <p className="eyebrow text-gold">Search the publication</p>
          <h1 className="mt-4 font-display text-[clamp(4rem,9vw,8rem)] leading-[.84] tracking-[-.045em] text-ivory">Find the context.</h1>
          <form onSubmit={submit} className="mt-10 flex max-w-4xl items-center gap-3 rounded-full border border-gold/25 bg-black/20 p-2" role="search">
            <label htmlFor="site-search" className="sr-only">Search CasinoVerse</label>
            <SearchIcon className="ml-4 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <input id="site-search" value={input} onChange={event => setInput(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-lg text-ivory outline-none placeholder:text-ivory/30" placeholder="Search markets, regulation, resorts, or games" autoComplete="off" />
            <button type="submit" className="button-gold">Search</button>
          </form>
        </div>
      </header>

      <section className="section-space min-h-[520px]">
        <div className="container">
          {isLoading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /><Skeleton className="h-96 bg-white/5" /></div> : enabled && data ? (
            <>
              <div className="mb-8 flex items-end justify-between border-b border-gold/20 pb-5"><div><p className="eyebrow text-gold">Results</p><h2 className="mt-2 font-display text-4xl text-ivory">{data.length} {data.length === 1 ? "story" : "stories"} for “{query}”</h2></div></div>
              {data.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{(data as StoryCardData[]).map(item => <StoryCard key={item.story.id} item={item} />)}</div> : <div className="story-card p-12 text-center"><SearchIcon className="mx-auto h-8 w-8 text-gold" /><h2 className="mt-5 font-display text-3xl text-ivory">No matching stories.</h2><p className="mt-3 text-ivory/50">Try a broader topic such as Macau, regulation, tourism, or responsible entertainment.</p></div>}
            </>
          ) : <div className="mx-auto max-w-2xl text-center"><SearchIcon className="mx-auto h-9 w-9 text-gold/70" /><h2 className="mt-5 font-display text-4xl text-ivory">Search the research desk.</h2><p className="mt-4 text-lg leading-8 text-ivory/50">Enter at least two characters to search article headlines, summaries, and reporting.</p></div>}
        </div>
      </section>
    </>
  );
}
