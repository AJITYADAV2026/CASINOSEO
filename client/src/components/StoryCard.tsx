import { Link } from "wouter";
import { ArrowUpRight, Clapperboard, Clock3, FileText } from "lucide-react";
import { formatDate, STORY_FALLBACK_IMAGE } from "@/lib/site";

export type StoryCardData = {
  story: {
    id: number;
    slug: string;
    title: string;
    dek: string;
    readingMinutes: number;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
    publishedAt: Date | string | null;
    status: "draft" | "developing" | "published" | "archived";
    isLead: boolean;
    isFeatured: boolean;
    contentType?: "news" | "analysis" | "guide" | "culture" | "video";
  };
  category: { slug: string; name: string; accent: string };
};

export function StoryCard({ item, variant = "standard" }: { item: StoryCardData; variant?: "standard" | "compact" | "horizontal" }) {
  const { story, category } = item;
  const isVlog = story.contentType === "video";
  const FormatIcon = isVlog ? Clapperboard : FileText;
  const format = isVlog ? "Vlog" : "Blog";
  if (variant === "compact") {
    return (
      <article className="group border-t border-white/12 py-5 first:border-t-0">
        <Link href={`/articles/${story.slug}`} className="grid grid-cols-[1fr_auto] gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="format-label"><FormatIcon className="h-3 w-3" />{format}</span>
              <span className="eyebrow" style={{ color: category.accent }}>{category.name}</span>
              {story.status === "developing" && <span className="status-dot">Developing</span>}
            </div>
            <h3 className="mt-2 font-display text-xl leading-tight text-ivory transition-colors group-hover:text-gold-light">{story.title}</h3>
            <p className="mt-3 text-xs text-ivory/45">{formatDate(story.publishedAt)} · {story.readingMinutes} min read</p>
          </div>
          <ArrowUpRight className="mt-1 h-5 w-5 text-gold/60 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="story-card group grid overflow-hidden sm:grid-cols-[180px_1fr]">
        <Link href={`/articles/${story.slug}`} className="image-frame min-h-44 sm:min-h-full">
          <img src={story.featuredImageUrl || STORY_FALLBACK_IMAGE} alt={story.featuredImageAlt || "CasinoVerse editorial research image"} />
        </Link>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="format-label"><FormatIcon className="h-3 w-3" />{format}</span><span className="eyebrow" style={{ color: category.accent }}>{category.name}</span></div>
          <Link href={`/articles/${story.slug}`}><h3 className="mt-2 font-display text-2xl leading-tight text-ivory group-hover:text-gold-light">{story.title}</h3></Link>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-ivory/55">{story.dek}</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-ivory/40"><Clock3 className="h-3.5 w-3.5" />{story.readingMinutes} min · {formatDate(story.publishedAt)}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="story-card group overflow-hidden">
      <Link href={`/articles/${story.slug}`} className="image-frame aspect-[3/2]">
        <img src={story.featuredImageUrl || STORY_FALLBACK_IMAGE} alt={story.featuredImageAlt || "CasinoVerse editorial research image"} />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2"><span className="format-label"><FormatIcon className="h-3 w-3" />{format}</span><span className="eyebrow" style={{ color: category.accent }}>{category.name}</span></div>
          {story.status === "developing" && <span className="status-dot">Developing</span>}
        </div>
        <Link href={`/articles/${story.slug}`}><h3 className="mt-3 font-display text-2xl leading-[1.08] text-ivory transition-colors group-hover:text-gold-light">{story.title}</h3></Link>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-ivory/55">{story.dek}</p>
        <p className="mt-5 text-xs text-ivory/40">{formatDate(story.publishedAt)} · {story.readingMinutes} min read</p>
      </div>
    </article>
  );
}
