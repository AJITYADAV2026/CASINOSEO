import { BookOpenText } from "lucide-react";
import { Link } from "wouter";
import { internalReferencePath } from "@/lib/internalSources";

export type ResearchReference = {
  name: string;
  detail: string;
  href: string;
};

export function ResearchReferences({ eyebrow = "Research references", title = "Sources behind this guide", intro, sources }: { eyebrow?: string; title?: string; intro: string; sources: ResearchReference[] }) {
  return (
    <section className="research-references" aria-labelledby={`references-${slugify(title)}`}>
      <div className="max-w-3xl">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 id={`references-${slugify(title)}`} className="mt-3 font-display text-4xl leading-none text-ivory md:text-5xl">{title}</h2>
        <p className="mt-5 text-lg leading-8 text-ivory/55">{intro}</p>
      </div>
      <ol className="mt-9 grid gap-4 md:grid-cols-2">
        {sources.map((source, index) => (
          <li key={`${source.name}-${source.href}`}>
            <Link href={internalReferencePath(source.name, source.href)} className="research-reference group">
              <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{source.name}</strong><small>{source.detail}</small></span>
              <BookOpenText className="h-4 w-4 text-gold/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
