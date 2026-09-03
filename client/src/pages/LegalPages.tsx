import { Link } from "wouter";
import { Cookie, ExternalLink, FileCheck2, MessageSquareText, Scale, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/Seo";
import { openCookieSettings } from "@/components/CookieConsent";

type LegalSection = { title: string; paragraphs: string[]; items?: string[] };

const pages: Record<string, { title: string; eyebrow: string; description: string; icon: typeof Scale; sections: LegalSection[] }> = {
  privacy: {
    title: "Privacy Policy", eyebrow: "Data and consent", icon: Cookie,
    description: "How CasinoVerse handles cookie choices, consent-gated analytics, newsletter email addresses, infrastructure records, and privacy requests.",
    sections: [
      { title: "What CasinoVerse collects", paragraphs: ["CasinoVerse can be read without creating an account. We collect a newsletter email address only when a visitor submits the subscription form and affirmatively agrees to receive the editorial briefing.", "The subscription record stores the normalized email address, active or unsubscribed status, consent time, signup source, and normal database audit timestamps. It does not store a wagering profile, casino account, payment method, or gambling activity." ] },
      { title: "Analytics and cookie choice", paragraphs: ["Audience analytics is non-essential and does not load until a visitor selects Accept analytics in the cookie panel. Choosing Essential only stores the preference locally and prevents the analytics script from loading."], items: ["The consent choice is saved in the browser so the banner does not reappear on every page.", "Cookie settings can be reopened from the footer.", "CasinoVerse does not use the consent panel to authorize advertising cookies or gambling-affiliate tracking."] },
      { title: "How information is used", paragraphs: ["Newsletter data is used to maintain the requested editorial subscription. Consent records support preference management and compliance. Aggregated audience measurements, when accepted, help understand which pages are useful and where the publication may have technical problems."] },
      { title: "Service providers and security", paragraphs: ["Hosting, database, storage, authentication infrastructure, and consented analytics may be supplied by technical service providers acting on the publication’s instructions. Reasonable safeguards are used, but no internet service can promise absolute security."] },
      { title: "Your choices", paragraphs: ["You may choose Essential only, reopen Cookie settings, request correction or deletion of a newsletter record, or unsubscribe from future editorial mail when delivery functionality is introduced."], items: ["Use the consent-aware form on the About page for privacy and newsletter requests.", "Do not submit passwords, identification documents, banking details, or sensitive gambling histories."] },
      { title: "Policy changes", paragraphs: ["This policy is reviewed when data practices change. Material updates will change the review date and will not be disguised as routine edits."] },
    ],
  },
  disclaimer: {
    title: "Disclaimer", eyebrow: "Publication boundaries", icon: ShieldCheck,
    description: "CasinoVerse is an informational publication, not a casino, wagering service, financial adviser, legal adviser, or treatment provider.",
    sections: [
      { title: "Informational publication only", paragraphs: ["CasinoVerse publishes research, history, game education, culture, destination context, regulation, and responsible-entertainment information. It does not accept wagers, deposits, withdrawals, bets, or payments for gaming and does not operate real-money games." ] },
      { title: "No financial, legal, or medical advice", paragraphs: ["Articles explain public information and should not be treated as advice for investing, gambling, legal compliance, diagnosis, or treatment. Laws and support systems vary by jurisdiction; consult an appropriately qualified local professional for decisions about your circumstances." ] },
      { title: "Probability and game information", paragraphs: ["Rules, payouts, probabilities, return-to-player figures, and house edges depend on the stated game and venue rules. Long-run statistics do not predict a short session and do not create a winning system." ] },
      { title: "External links", paragraphs: ["Links are provided for evidence, verification, and further reading. An external link does not mean CasinoVerse endorses every statement, service, product, or later change on that site. External services control their own availability and privacy practices." ] },
      { title: "Accuracy and developing stories", paragraphs: ["CasinoVerse aims to distinguish confirmed facts, forecasts, proposals, company statements, and unresolved legal developments. A developing edition may change as the reporting window closes. Corrections and material updates are handled under the editorial standards." ] },
      { title: "Responsible entertainment", paragraphs: ["Gambling involves financial and psychological risk and is age-restricted. If participation causes harm, stop and seek local support. CasinoVerse’s safety page provides public resources but is not an emergency service." ] },
    ],
  },
  terms: {
    title: "Terms of Use", eyebrow: "Using CasinoVerse", icon: FileCheck2,
    description: "Terms governing access to CasinoVerse articles, research archives, newsletter signup, external sources, and publication-owned material.",
    sections: [
      { title: "Acceptance and scope", paragraphs: ["By using CasinoVerse, you agree to use the service lawfully and consistently with these terms. If you do not agree, do not use the site or submit a newsletter address." ] },
      { title: "Permitted use", paragraphs: ["You may read, quote briefly with attribution, link to public pages, and use factual references for personal research. You may not disrupt the service, evade access controls, impersonate the publication, or use its presentation to mislead others." ] },
      { title: "Editorial material and intellectual property", paragraphs: ["CasinoVerse’s original writing, layout, branding, generated editorial illustrations, and compiled research presentation are protected by applicable rights. Underlying facts and linked third-party material remain subject to their own rights and terms." ] },
      { title: "Newsletter", paragraphs: ["Submitting the newsletter form requires an accurate email address and affirmative consent. CasinoVerse may suspend duplicate, abusive, automated, or invalid subscriptions. No promise is made about delivery frequency until an email-delivery service is separately launched." ] },
      { title: "Availability and changes", paragraphs: ["Pages, archives, data, and features may change, be corrected, be archived, or become temporarily unavailable. CasinoVerse does not guarantee uninterrupted access or that every external source will remain online." ] },
      { title: "Responsible and lawful use", paragraphs: ["The site may not be used to facilitate unlawful gambling, target minors, promote guaranteed returns, distribute fabricated testimonials, or misrepresent editorial research as a gambling recommendation." ] },
      { title: "Contact and governing context", paragraphs: ["Questions about these terms or editorial corrections may be submitted through the consent-aware contact form on the About page. Applicable legal rights may vary by location; these terms do not remove rights that cannot lawfully be waived." ] },
    ],
  },
};

function LegalPage({ type }: { type: keyof typeof pages }) {
  const page = pages[type];
  const Icon = page.icon;
  return <>
    <Seo title={page.title} description={page.description} path={`/${type}`} />
    <article>
      <header className="legal-page-hero border-b border-gold/15"><div className="container py-24 sm:py-32"><div className="max-w-4xl"><Icon className="h-8 w-8 text-gold" aria-hidden="true" /><p className="eyebrow mt-8">{page.eyebrow}</p><h1 className="mt-4 font-display text-6xl leading-[.94] text-ivory sm:text-7xl lg:text-8xl">{page.title}</h1><p className="mt-6 max-w-3xl text-xl leading-9 text-ivory/68">{page.description}</p><p className="mt-6 text-sm text-ivory/42">Effective and last reviewed: 3 September 2026</p></div></div></header>
      <section className="section-pad"><div className="container grid gap-12 lg:grid-cols-[250px_minmax(0,760px)]"><aside className="self-start lg:sticky lg:top-28"><p className="eyebrow">On this page</p><nav className="mt-5 space-y-3" aria-label={`${page.title} sections`}>{page.sections.map(section => <a key={section.title} href={`#${slugify(section.title)}`} className="block border-l border-white/10 py-1 pl-4 text-sm text-ivory/55 hover:border-gold hover:text-gold-light">{section.title}</a>)}</nav></aside><div className="space-y-12">{page.sections.map(section => <section id={slugify(section.title)} key={section.title} className="scroll-mt-28 border-b border-white/10 pb-10"><h2 className="font-display text-4xl text-ivory sm:text-5xl">{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph} className="mt-5 text-lg leading-9 text-ivory/62">{paragraph}</p>)}{section.items && <ul className="mt-6 space-y-3 text-ivory/60">{section.items.map(item => <li key={item} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /><span className="leading-8">{item}</span></li>)}</ul>}</section>)}</div></div></section>
      <section className="border-y border-white/8 bg-white/[.02]"><div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">Publication contacts</p><p className="mt-2 text-sm text-ivory/55">Questions, privacy requests, and correction notes are handled through the on-site editorial form.</p></div><div className="flex flex-wrap gap-3"><Link href="/about#contact" className="button-ghost"><MessageSquareText className="h-4 w-4" /> Contact the desk</Link>{type === "privacy" && <button type="button" className="button-gold" onClick={openCookieSettings}><Cookie className="h-4 w-4" /> Cookie settings</button>}<Link href="/about#standards" className="button-ghost"><Scale className="h-4 w-4" /> Editorial standards</Link></div></div></section>
      {type === "disclaimer" && <section className="section-pad"><div className="container"><div className="responsible-callout"><ShieldCheck className="h-7 w-7 text-[#95c4d6]" /><div><p className="eyebrow text-[#95c4d6]">Need help?</p><h2 className="mt-2 font-display text-4xl text-ivory">Use a local support service, not an article.</h2><p className="mt-4 max-w-3xl leading-8 text-ivory/64">If gambling is causing financial, emotional, relationship, or safety problems, stop and contact a qualified support service in your jurisdiction.</p><Link href="/responsible-entertainment" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b4d7e4]">Responsible-entertainment resources <ExternalLink className="h-4 w-4" /></Link></div></div></div></section>}
    </article>
  </>;
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const Privacy = () => <LegalPage type="privacy" />;
export const Disclaimer = () => <LegalPage type="disclaimer" />;
export const Terms = () => <LegalPage type="terms" />;
