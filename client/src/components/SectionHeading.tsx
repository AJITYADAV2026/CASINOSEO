import { Link } from "wouter";

export function SectionHeading({ eyebrow, title, description, href }: { eyebrow: string; title: string; description?: string; href?: string }) {
  return (
    <div className="mb-8 grid gap-5 border-b border-gold/20 pb-6 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl leading-none text-ivory md:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-2xl text-base leading-7 text-ivory/55">{description}</p>}
      </div>
      {href && <Link href={href} className="text-sm text-gold hover:text-gold-light">View all stories →</Link>}
    </div>
  );
}
