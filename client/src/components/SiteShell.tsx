import { Menu, Search, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CookieConsent, openCookieSettings } from "@/components/CookieConsent";

const navigation = [
  ["Blog", "/articles"],
  ["Games", "/games"],
  ["History", "/history"],
  ["Culture", "/culture"],
  ["Destinations", "/destinations"],
  ["Vlogs", "/vlogs"],
  ["Facts", "/facts"],
  ["Gallery", "/gallery"],
  ["About", "/about"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="responsible-bar">
        <div className="container flex items-center justify-center gap-2 py-2 text-center text-xs tracking-wide text-ivory/80">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          <span>Informational publication only. Casino gambling involves risk and is age-restricted.</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Link href="/" className="brand-mark" aria-label="CasinoVerse home">
            <span className="brand-orbit" aria-hidden="true">C</span>
            <span>
              Casino<span className="text-gold">Verse</span>
              <small>The world behind the games</small>
            </span>
          </Link>

          <nav className="hidden items-center gap-4 xl:flex" aria-label="Primary navigation">
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`nav-link text-xs ${location === href || location.startsWith(`${href}/`) ? "is-active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/search" className="icon-link" aria-label="Search CasinoVerse">
              <Search className="h-5 w-5" />
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button className="icon-link xl:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent className="border-gold/20 bg-[#11100f] text-ivory">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-ivory">CasinoVerse</SheetTitle>
                </SheetHeader>
                <nav className="mt-10 flex flex-col" aria-label="Mobile navigation">
                  {navigation.map(([label, href]) => (
                    <Link key={href} href={href} className="border-b border-white/10 py-4 text-xl text-ivory/85">
                      {label}
                    </Link>
                  ))}
                  <Link href="/guides" className="border-b border-white/10 py-4 text-xl text-ivory/85">Guides</Link>
                  <Link href="/archive" className="border-b border-white/10 py-4 text-xl text-ivory/85">Research archive</Link>
                  <Link href="/responsible-entertainment" className="py-4 text-xl text-gold">Responsible entertainment</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="border-t border-gold/15 bg-[#0a0908]">
        <div className="container grid gap-12 py-16 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <div className="font-display text-3xl">Casino<span className="text-gold">Verse</span></div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-ivory/55">
              Independent reporting and education on the business, culture, regulation, and social impact of casino entertainment.
            </p>
          </div>
          <FooterGroup title="Editorial" links={[["Blog", "/articles"], ["Daily research", "/archive"], ["Vlogs", "/vlogs"], ["Interesting facts", "/facts"]]} />
          <FooterGroup title="Explore" links={[["Game guides", "/games"], ["History", "/history"], ["Culture", "/culture"], ["Destinations", "/destinations"], ["Gallery", "/gallery"]]} />
          <FooterGroup title="Publication" links={[["About CasinoVerse", "/about"], ["Editorial standards", "/about#standards"], ["Guides", "/guides"], ["Privacy", "/privacy"], ["Disclaimer", "/disclaimer"], ["Terms", "/terms"], ["Contact", "/about#contact"]]} />
          <div>
            <h2 className="eyebrow">Responsible entertainment</h2>
            <p className="mt-4 text-sm leading-6 text-ivory/55">Gambling is not a way to make money. Set time and spending limits, never chase losses, and seek local support if play causes harm.</p>
            <Link href="/responsible-entertainment" className="mt-5 inline-flex text-sm text-gold hover:text-gold-light">Read the safety guide →</Link>
          </div>
        </div>
        <div className="border-t border-white/8">
          <div className="container flex flex-col gap-3 py-6 text-xs text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CasinoVerse. Informational content only.</p>
            <div className="flex flex-wrap items-center gap-3">
              <p>No wagering, deposits, bonuses, or real-money games are offered.</p>
              <button type="button" className="text-gold hover:text-gold-light" onClick={openCookieSettings}>Cookie settings</button>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}

function FooterGroup({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-ivory/60">
        {links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-gold-light">{label}</Link></li>)}
      </ul>
    </div>
  );
}
