import { BookOpenText, ChevronRight, Menu, Search, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CookieConsent, openCookieSettings } from "@/components/CookieConsent";

const primaryNavigation = [
  ["Blog", "/articles", "Latest reporting"],
  ["Casino floor", "/games", "Games and mechanics"],
  ["Industry", "/category/market-intelligence", "Business and operations"],
  ["Places & design", "/destinations", "Resorts and culture"],
  ["Research", "/archive", "Dated source files"],
  ["Vlog", "/vlogs", "Genuine video only"],
] as const;

const secondaryNavigation = [
  ["Games", "/games"],
  ["History", "/history"],
  ["2010–2026", "/history/archive"],
  ["Culture", "/culture"],
  ["Destinations", "/destinations"],
  ["Facts", "/facts"],
  ["Gallery", "/gallery"],
  ["Guides", "/guides"],
  ["Responsible", "/responsible-entertainment"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = (href: string) => location === href || location.startsWith(`${href}/`);

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
        <div className="site-header-main">
          <div className="container flex h-[82px] items-center justify-between gap-4">
            <Link href="/" className="brand-mark" aria-label="CasinoVerse home">
              <span className="brand-orbit" aria-hidden="true">C</span>
              <span>
                Casino<span className="text-gold">Verse</span>
                <small>The world behind the games</small>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
              {primaryNavigation.map(([label, href]) => (
                <Link key={href} href={href} className={`nav-link ${isActive(href) ? "is-active" : ""}`}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/archive" className="edition-link hidden 2xl:inline-flex"><BookOpenText className="h-3.5 w-3.5" />Latest edition</Link>
              <Link href="/search" className="icon-link" aria-label="Search CasinoVerse"><Search className="h-5 w-5" /></Link>
              <Sheet>
                <SheetTrigger asChild><button className="icon-link xl:hidden" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button></SheetTrigger>
                <SheetContent className="overflow-y-auto border-gold/20 bg-[#11100f] text-ivory">
                  <SheetHeader>
                    <SheetTitle className="font-display text-3xl text-ivory">Casino<span className="text-gold">Verse</span></SheetTitle>
                    <p className="text-sm leading-6 text-ivory/48">A research-led publication about the casino floor, the industry around it, and the risks within it.</p>
                  </SheetHeader>
                  <nav className="mt-8" aria-label="Mobile navigation">
                    <p className="eyebrow text-gold">Publication desks</p>
                    <div className="mt-3 border-t border-white/10">
                      {primaryNavigation.map(([label, href, detail]) => (
                        <SheetClose asChild key={href}>
                          <Link href={href} className={`mobile-primary-link ${isActive(href) ? "is-active" : ""}`}>
                            <span><strong>{label}</strong><small>{detail}</small></span><ChevronRight className="h-4 w-4" />
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    <p className="eyebrow mt-8 text-gold">Explore the house</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {secondaryNavigation.map(([label, href]) => (
                        <SheetClose asChild key={href}>
                          <Link href={href} className={`mobile-secondary-link ${isActive(href) ? "is-active" : ""}`}>{label}</Link>
                        </SheetClose>
                      ))}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <SheetClose asChild><Link href="/sources" className={`mobile-secondary-link ${isActive("/sources") ? "is-active" : ""}`}>Source library</Link></SheetClose>
                      <SheetClose asChild><Link href="/support" className={`mobile-secondary-link ${isActive("/support") ? "is-active" : ""}`}>Support directory</Link></SheetClose>
                    </div>
                    <SheetClose asChild><Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm text-gold-light">About the publication <ChevronRight className="h-4 w-4" /></Link></SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="casino-nav-rail hidden xl:block">
          <div className="container flex h-11 items-center justify-between gap-6">
            <span className="casino-nav-kicker">Explore the house</span>
            <nav className="flex flex-1 items-center justify-center gap-7" aria-label="Casino topics">
              {secondaryNavigation.map(([label, href]) => <Link key={href} href={href} className={`casino-rail-link ${isActive(href) ? "is-active" : ""}`}>{label}</Link>)}
            </nav>
            <Link href="/about" className={`casino-rail-link ${isActive("/about") ? "is-active" : ""}`}>About</Link>
          </div>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="casino-footer border-t border-gold/15 bg-[#0a0908]">
        <div className="casino-footer-rule" aria-hidden="true" />
        <div className="container grid gap-12 py-16 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <Link href="/" className="brand-mark">
              <span className="brand-orbit" aria-hidden="true">C</span>
              <span>Casino<span className="text-gold">Verse</span><small>The world behind the games</small></span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-ivory/55">Independent reporting from the casino floor to the regulatory file: games, operations, design, destinations, history, and harm.</p>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Publication principles"><span className="footer-chip">Source-led</span><span className="footer-chip">No wagering</span></div>
          </div>
          <FooterGroup title="Editorial" links={[["Blog", "/articles"], ["Floor report", "/games"], ["Daily research", "/archive"], ["Vlog studio", "/vlogs"], ["Casino facts", "/facts"]]} />
          <FooterGroup title="Casino world" links={[["Game laboratory", "/games"], ["History", "/history"], ["2010–2026 timeline", "/history/archive"], ["Culture & design", "/culture"], ["Destinations", "/destinations"], ["Visual gallery", "/gallery"]]} />
          <FooterGroup title="Publication" links={[["About CasinoVerse", "/about"], ["Editorial standards", "/about#standards"], ["Source library", "/sources"], ["Guides", "/guides"], ["Privacy", "/privacy"], ["Disclaimer", "/disclaimer"], ["Terms", "/terms"], ["Contact", "/about#contact"]]} />
          <div>
            <h2 className="eyebrow">Responsible play desk</h2>
            <p className="mt-4 text-sm leading-6 text-ivory/55">Gambling is not a way to make money. Set time and spending limits, never chase losses, and seek local support if play causes harm.</p>
            <div className="mt-5 flex flex-col items-start gap-3"><Link href="/responsible-entertainment" className="inline-flex text-sm text-gold hover:text-gold-light">Read the safety guide →</Link><Link href="/support" className="inline-flex text-sm text-gold hover:text-gold-light">Open support directory →</Link></div>
          </div>
        </div>
        <div className="border-t border-white/8">
          <div className="container flex flex-col gap-3 py-6 text-xs text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CasinoVerse. Informational content only.</p>
            <div className="flex flex-wrap items-center gap-3"><p>No wagering, deposits, bonuses, or real-money games are offered.</p><button type="button" className="text-gold hover:text-gold-light" onClick={openCookieSettings}>Cookie settings</button></div>
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
