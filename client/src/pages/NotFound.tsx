import { ArrowLeft, FileSearch, Search } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="The requested CasinoVerse page could not be found." noIndex />
      <section className="container flex min-h-[68vh] items-center py-20">
        <div className="grid w-full gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <div>
            <span className="block font-display text-[clamp(7rem,24vw,15rem)] leading-[.7] text-gold/18" aria-hidden="true">404</span>
            <FileSearch className="mt-10 h-10 w-10 text-gold" />
          </div>
          <div className="max-w-3xl">
            <p className="eyebrow text-gold">Page not found</p>
            <h1 className="mt-4 font-display text-5xl leading-none text-ivory md:text-7xl">This trail ends here.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ivory/55">The page may have moved, or the address may be incomplete. Return to the current edition or continue through the dated research archive.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/" className="button-gold"><ArrowLeft className="h-4 w-4" /> Latest edition</Link>
              <Link href="/archive" className="button-ghost">Research archive</Link>
              <Link href="/search" className="button-ghost"><Search className="h-4 w-4" /> Search CasinoVerse</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
