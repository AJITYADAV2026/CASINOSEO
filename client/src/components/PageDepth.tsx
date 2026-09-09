import { ArrowRight, BookOpenText, CheckCircle2, FileSearch, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

type DepthCard = { title: string; body: string };
type DepthLink = { label: string; href: string };
export type PageDepthEntry = {
  eyebrow: string;
  title: string;
  intro: string;
  cards: [DepthCard, DepthCard, DepthCard];
  checklist: [string, string, string];
  links: [DepthLink, DepthLink, DepthLink];
};

const detail = (
  eyebrow: string,
  title: string,
  intro: string,
  cards: PageDepthEntry["cards"],
  checklist: PageDepthEntry["checklist"],
  links: PageDepthEntry["links"],
): PageDepthEntry => ({ eyebrow, title, intro, cards, checklist, links });

const HOME = detail(
  "Reader orientation",
  "A publication map, not a casino lobby.",
  "CasinooVerse is organized around evidence and explanation. The homepage introduces the main editorial desks; this guide explains how those desks connect and what a reader should expect before opening a story.",
  [
    { title: "Start with the claim", body: "News and analysis pages identify what happened, where it happened, and whether the information is a confirmed result, a proposal, a forecast, or a developing dispute." },
    { title: "Follow the evidence", body: "Article source links remain on CasinooVerse and open stored provenance records showing the publisher, source title, type, dates, and original address as non-clickable audit data." },
    { title: "Keep risk visible", body: "Game mechanics, market reporting, travel context, and resort design are never presented as reasons to gamble. Loss, access controls, and support routes remain part of the editorial frame." },
  ],
  ["Use the Blog for current reporting and long-form explainers.", "Use Daily Research for date-bounded source files and revision status.", "Use Sources and About to inspect provenance, standards, corrections, and scope."],
  [{ label: "Read the complete Blog", href: "/articles" }, { label: "Inspect the source library", href: "/sources" }, { label: "Open the safety guide", href: "/responsible-entertainment" }],
);

const ARTICLES = detail(
  "Reading the Blog",
  "How a CasinooVerse article earns its place.",
  "The Blog index is more than a feed. Each item belongs to an editorial category, carries a publication state, and connects current information to a visible evidence trail and responsible-entertainment boundary.",
  [
    { title: "Event", body: "The article first establishes the observable development: a filing, regulator action, operating result, public-policy change, research finding, destination project, or game-literacy question." },
    { title: "Interpretation", body: "Analysis explains what the development changes and what it does not prove. Company claims, analyst expectations, legal proposals, and audited outcomes are labeled separately." },
    { title: "Verification", body: "The source record identifies the original material and retrieval date. Developing stories may remain noindex until the reporting window and evidence are sufficiently complete." },
  ],
  ["Check the date and publication status before relying on a story.", "Open internal source records to inspect provenance and source type.", "Read related categories for operating, legal, cultural, and harm context."],
  [{ label: "Browse reporting categories", href: "/category/market-intelligence" }, { label: "Review daily editions", href: "/archive" }, { label: "Read editorial standards", href: "/about#standards" }],
);

const ARTICLE = detail(
  "Article reading guide",
  "Separate the reported fact from the surrounding meaning.",
  "Every article should be read in layers. The headline and dek identify the subject; the body explains the evidence and limits; the source records show where the material originated; and related reading adds context without replacing the cited record.",
  [
    { title: "Status and timing", body: "Published and developing labels describe the editorial state, not the importance of a story. Publication and update dates show when the current version entered the record." },
    { title: "Source role", body: "A regulator notice, company filing, trade report, research paper, and public-interest article perform different evidentiary roles. The source type helps readers understand that distinction." },
    { title: "Practical boundary", body: "Market and game information is explanatory. It is not a prediction, recommendation, target price, winning system, or invitation to deposit money." },
  ],
  ["Read the full body before interpreting the headline.", "Use Original sources to inspect each provenance record.", "Use related reading to compare regulation, operations, and responsible-entertainment context."],
  [{ label: "Return to the Blog", href: "/articles" }, { label: "Browse all source records", href: "/sources" }, { label: "Understand the safety boundary", href: "/responsible-entertainment" }],
);

const CATEGORY = detail(
  "Topic depth",
  "A category is a research lens, not a content bucket.",
  "Category pages group stories that share a reporting method. Market evidence, regulation, operations, culture, game literacy, and responsible entertainment require different questions, source types, and interpretation cautions.",
  [
    { title: "Scope", body: "The category description defines what belongs and what does not. A story may touch several topics, but its primary category reflects the evidence and question at the center of the report." },
    { title: "Method", body: "Each topic uses an appropriate evidence hierarchy. Regulation favors statutes and regulator records; markets favor filings and defined-period data; safety coverage favors public-health and support evidence." },
    { title: "Connections", body: "Related categories help prevent narrow interpretation. Operating results need regulatory context, destination stories need local-policy context, and game guides need probability and risk context." },
  ],
  ["Read the category methodology before scanning headlines.", "Compare lead and archive stories across different publication dates.", "Use source records to distinguish primary evidence from contextual reporting."],
  [{ label: "See every Blog story", href: "/articles" }, { label: "Inspect editorial evidence", href: "/sources" }, { label: "Review reporting standards", href: "/about#standards" }],
);

const ARCHIVE = detail(
  "Archive protocol",
  "What a dated research edition preserves.",
  "The Daily Research archive records a defined India Standard Time research window. It keeps the edition date, publication state, source-attributed Markdown, included stories, and later revisions connected in one durable record.",
  [
    { title: "Collection window", body: "Agent 1 researches the immediately preceding IST calendar day. The edition states the window so late reports, timezone differences, and post-window updates are not silently mixed together." },
    { title: "Publication lifecycle", body: "A developing file may still be gathering evidence. A published file has passed the callback schema, story-source checks, and durable database transaction required by downstream agents." },
    { title: "Revision policy", body: "Material corrections update the record and revision history. The archive does not erase the existence of an earlier version or convert an unverified claim into a fact." },
  ],
  ["Confirm the edition date matches the research window you need.", "Check whether the edition is Developing or Published.", "Open story and source records for the current verified version."],
  [{ label: "Read the latest Blog", href: "/articles" }, { label: "Inspect source records", href: "/sources" }, { label: "Review corrections policy", href: "/about#standards" }],
);

const DIGEST = detail(
  "Edition anatomy",
  "How to interpret one daily research file.",
  "A digest is a date-bounded editorial record. Its summary explains the day’s pattern, its story list identifies the verified developments, and its Markdown artifact preserves the complete source-attributed research edition.",
  [
    { title: "What was observed", body: "The edition records developments published or materially updated during the stated window. It does not imply that every casino-related item on the internet was equally credible or relevant." },
    { title: "What was excluded", body: "Promotional offers, affiliate content, unsupported statistics, duplicate rewrites, wagering picks, and claims without a verifiable source trail do not qualify for publication." },
    { title: "What happens next", body: "Agent 2 evaluates site relevance; Agent 3 creates or updates pages only from a completed same-day analysis. Missing upstream output stops the chain instead of reusing stale material." },
  ],
  ["Read the edition summary before individual stories.", "Distinguish confirmed results from forecasts and proposals.", "Use the Markdown artifact when auditing the complete source trail."],
  [{ label: "Return to all editions", href: "/archive" }, { label: "Browse published analysis", href: "/articles" }, { label: "Open the source library", href: "/sources" }],
);

const GAMES = detail(
  "Game-literacy framework",
  "Rules explain the product; probability explains the risk.",
  "CasinooVerse game coverage is educational. It describes how common games are structured, how outcomes are resolved, what common terms mean, and why knowing the rules does not remove randomness or the house advantage.",
  [
    { title: "Mechanism", body: "A useful guide starts with the sequence of play, available decisions, outcome rules, payout structure, and the role of the dealer, machine, or random-number system." },
    { title: "Mathematics", body: "House edge, return percentages, variance, and probability describe repeated events under defined rules. They do not forecast a session or make a loss recoverable." },
    { title: "Behavior", body: "Time limits, spending limits, breaks, and stopping rules matter because faster play and repeated exposure can increase total risk even when the underlying odds stay unchanged." },
  ],
  ["Choose the guide for the exact game and rule set.", "Read the mathematical limitation before strategy terminology.", "Use the responsible-entertainment page before treating play as a budget decision."],
  [{ label: "Open the learning guides", href: "/guides" }, { label: "Check fact-desk explanations", href: "/facts" }, { label: "Set safety boundaries", href: "/responsible-entertainment" }],
);

const GAME_DETAIL = detail(
  "Using this game guide",
  "Terminology is useful only when its limits are explicit.",
  "Individual game guides combine documented history, table or machine structure, plain-language terms, mathematical context, and responsible-entertainment cautions. They do not provide picks, systems, or promises of control.",
  [
    { title: "Rules vary", body: "A familiar game name may cover different layouts, pay tables, decks, drawing rules, or machine configurations. The local rule set determines the relevant probabilities and house advantage." },
    { title: "Strategy has boundaries", body: "Some choices can change expected loss under a defined rule set, but no decision eliminates chance or converts a negative-expectation product into guaranteed income." },
    { title: "Session results vary", body: "Short-run outcomes can differ sharply from long-run percentages. Variance describes dispersion; it does not create a schedule on which a win becomes due." },
  ],
  ["Identify the exact variant before applying a rule explanation.", "Treat percentages as long-run descriptions, not session forecasts.", "Stop if play exceeds the time, money, or emotional boundary set in advance."],
  [{ label: "Compare all game guides", href: "/games" }, { label: "Read probability facts", href: "/facts" }, { label: "Find support and controls", href: "/support" }],
);

const GUIDES = detail(
  "Guide standard",
  "Mechanism, limitation, evidence, and a safe stopping point.",
  "CasinooVerse guides are designed for informed reading before any participation. They explain the product and vocabulary, state what the information cannot accomplish, and connect readers to evidence and risk controls.",
  [
    { title: "Understand the product", body: "Learn the sequence of play, decision points, payout rules, equipment, and common terms before interpreting strategy discussions or marketing claims." },
    { title: "Understand the number", body: "Ask what population, time period, rule set, denominator, and assumptions sit behind a percentage. A headline number without those boundaries is incomplete." },
    { title: "Understand the limit", body: "A guide should make clear that gambling is paid entertainment with a risk of loss. Borrowing, chasing, and increasing stakes to recover losses are not educational strategies." },
  ],
  ["Begin with game structure, not betting technique.", "Check sources and calculation assumptions.", "Set time and spending limits before access to a gambling product."],
  [{ label: "Explore game mechanics", href: "/games" }, { label: "Review evidence records", href: "/sources" }, { label: "Read the safety guide", href: "/responsible-entertainment" }],
);

const HISTORY = detail(
  "Historical method",
  "Institutions change through place, technology, law, and labor.",
  "The History desk uses a selective chronology to explain structural change rather than claiming a complete year-by-year catalogue. It favors documented institutions and mechanisms over origin myths and memorable anecdotes.",
  [
    { title: "Architecture and place", body: "Gaming rooms became civic venues, spa-town attractions, resort anchors, and mixed-use destination systems. Each form reflects transport, tourism, capital, and local regulation." },
    { title: "Technology and work", body: "Cards, wheels, mechanical reels, surveillance, digital accounting, and random-number systems changed pace, staffing, security, and the information available to operators and patrons." },
    { title: "Law and legitimacy", body: "Authorization, prohibition, licensing, tribal sovereignty, technical standards, taxation, and public-health controls developed differently across jurisdictions and periods." },
  ],
  ["Treat dates as documented milestones rather than invention claims.", "Compare game history with destination and regulatory context.", "Use source notes to identify uncertainty and later interpretation."],
  [{ label: "Read game histories", href: "/games" }, { label: "Explore culture and design", href: "/culture" }, { label: "Inspect the source library", href: "/sources" }],
);

const CULTURE = detail(
  "Cultural analysis",
  "The casino is simultaneously a workplace, stage, building, and media symbol.",
  "Culture coverage examines how architecture, art, etiquette, entertainment, labor, and popular media shape the meaning of a casino. It separates designed atmosphere from documented operating reality.",
  [
    { title: "Built environment", body: "Entrances, circulation, lighting, acoustics, signage, surveillance, hotel connections, and non-gaming spaces influence how a venue is perceived and used." },
    { title: "Performance and image", body: "Dress, service rituals, entertainment, and screen portrayals create symbols of glamour, risk, secrecy, or excess that may not reflect ordinary operations." },
    { title: "Critical context", body: "Cultural significance does not erase labor conditions, access rules, local impacts, or gambling harm. Analysis keeps those systems visible alongside aesthetics." },
  ],
  ["Distinguish editorial illustration from documentary evidence.", "Compare media mythology with operating and regulatory records.", "Follow destination and history links for place-specific context."],
  [{ label: "See destination systems", href: "/destinations" }, { label: "Read the history desk", href: "/history" }, { label: "Open the visual gallery", href: "/gallery" }],
);

const DESTINATIONS = detail(
  "Place-led reporting",
  "A casino destination is an urban and regulatory system.",
  "Destination pages do not rank places or direct readers to gambling venues. They examine how transport, hospitality, architecture, local government, licensing, resident safeguards, and public space combine around casino districts.",
  [
    { title: "Urban connection", body: "The analysis asks how visitors and workers arrive, whether the resort connects to surrounding streets, and how infrastructure and land use distribute benefits and disruption." },
    { title: "Economic frame", body: "Revenue or visitor claims require a period, jurisdiction, measurement method, and source. A company forecast is not treated as a realized local outcome." },
    { title: "Safeguards", body: "Entry controls, age rules, self-exclusion, resident restrictions, financial friction, advertising rules, and support systems vary and should be read in local legal context." },
  ],
  ["Read each destination as a distinct jurisdiction.", "Separate resort marketing from independently verified context.", "Consider local safeguards and public impacts alongside design."],
  [{ label: "Explore culture and architecture", href: "/culture" }, { label: "Read regulation reporting", href: "/category/regulation" }, { label: "Check responsible-entertainment guidance", href: "/responsible-entertainment" }],
);

const FACTS = detail(
  "Fact verification",
  "The condition attached to a number is part of the fact.",
  "The Facts desk selects concise claims that can be explained with their date, jurisdiction, rule set, denominator, and source. It avoids records framed as spectacle and statistics stripped of the conditions that produced them.",
  [
    { title: "Definition", body: "Terms such as revenue, handle, visitation, return, participation, and problem gambling measure different things. A fact is not portable until its definition is clear." },
    { title: "Comparison", body: "Comparisons need consistent periods, categories, currencies, and populations. A larger raw number may reflect market size rather than a more meaningful rate." },
    { title: "Update", body: "Market and regulatory facts can change. Publication dates and source records help readers identify whether a statement is historical context or a current measure." },
  ],
  ["Keep the date attached to every changing statistic.", "Keep the jurisdiction and denominator attached to every comparison.", "Open the source record before reusing a claim elsewhere."],
  [{ label: "Inspect source provenance", href: "/sources" }, { label: "Read game mathematics", href: "/games" }, { label: "Review the History desk", href: "/history" }],
);

const GALLERY = detail(
  "Visual journalism",
  "Illustration can explain structure, but it cannot prove an event.",
  "The Gallery uses original editorial images to clarify spaces, mechanisms, research methods, and design themes. Each image is labeled so viewers do not mistake an interpretation for documentary photography or archival evidence.",
  [
    { title: "Explanatory role", body: "A visual can make circulation, surveillance, table layout, mechanical transition, or destination scale easier to understand when the accompanying text states what is being illustrated." },
    { title: "Evidence boundary", body: "An illustration does not verify a date, person, property, or event. Historical and factual claims still require documents, reporting, or institutional sources." },
    { title: "Accessibility", body: "Alternative text describes the meaningful visual content, while captions identify editorial treatment and avoid implying that a generated scene is a real photograph." },
  ],
  ["Read the caption before interpreting an image as evidence.", "Use the linked desk for the underlying written explanation.", "Open source records for factual claims represented visually."],
  [{ label: "Read culture and design", href: "/culture" }, { label: "Explore historical context", href: "/history" }, { label: "Inspect research sources", href: "/sources" }],
);

const ABOUT = detail(
  "Publication governance",
  "Editorial independence is a set of operating rules.",
  "CasinooVerse is an informational publication. Its standards govern sourcing, uncertainty labels, corrections, conflicts, internal navigation, reader data, and the separation between coverage and gambling promotion.",
  [
    { title: "Independence", body: "The site does not publish affiliate casino links, bonus offers, referral calls to action, trade signals, target prices, guaranteed returns, or wallet solicitation." },
    { title: "Corrections", body: "Material factual errors should be corrected promptly and transparently. Updated dates and revision records help readers distinguish a clarified article from its earlier state." },
    { title: "Accountability", body: "Readers can inspect source records, privacy terms, disclaimers, support information, and the contact process without leaving the CasinooVerse domain." },
  ],
  ["Use the standards section to assess reporting choices.", "Use the contact form for factual corrections or privacy requests.", "Use Source records to audit provenance before challenging or reusing a claim."],
  [{ label: "Inspect source records", href: "/sources" }, { label: "Read the Privacy Policy", href: "/privacy" }, { label: "Open support information", href: "/support" }],
);

const SEARCH = detail(
  "Search scope",
  "Search retrieves CasinooVerse reporting, not gambling offers.",
  "The search desk matches terms against publication content and returns internal pages. It does not query casinos, brokers, exchanges, social profiles, affiliate networks, or third-party promotional directories.",
  [
    { title: "Use precise terms", body: "A jurisdiction, regulator, company, game, destination, or policy term generally produces more useful results than a broad phrase such as casino news." },
    { title: "Read result context", body: "Search order is not an endorsement or popularity ranking. Check the result date, category, publication status, and source trail before drawing a conclusion." },
    { title: "Find help directly", body: "If the query concerns loss, debt, self-exclusion, blocking tools, or immediate harm, the support and responsible-entertainment pages provide the fastest internal route." },
  ],
  ["Search for the entity and jurisdiction together.", "Open the article and inspect its date and sources.", "Use support links instead of research search during an immediate safety concern."],
  [{ label: "Browse all articles", href: "/articles" }, { label: "Open daily research", href: "/archive" }, { label: "Find support", href: "/support" }],
);

const SOURCES = detail(
  "Source methodology",
  "A provenance record explains what a source is and how it was used.",
  "The source library stores the publisher, publication label, source type, description, original address, access date, and update state required to audit CasinooVerse reporting without turning provenance into outbound promotion.",
  [
    { title: "Inclusion criteria", body: "Sources must be identifiable, relevant to a published claim, and suitable for the evidentiary role assigned to them. Primary documents are preferred when available." },
    { title: "Source hierarchy", body: "Regulator records, government material, filings, and research can establish facts directly; trade and public-interest reporting can add context, independent observation, or specialist interpretation." },
    { title: "Reading a record", body: "The record shows what the source can support, when it was accessed, and where the original lived. Presence in the library is not an endorsement of every claim by that publisher." },
  ],
  ["Check source type before treating a claim as primary evidence.", "Compare source publication and access dates.", "Return to the citing article to see the exact claim and context."],
  [{ label: "Read the Blog", href: "/articles" }, { label: "Review daily research", href: "/archive" }, { label: "Read editorial standards", href: "/about#standards" }],
);

const SOURCE_DETAIL = detail(
  "Using this source record",
  "Provenance is evidence metadata, not an endorsement.",
  "This page keeps the source identity and original location visible as data while public navigation remains inside CasinooVerse. Readers should evaluate the source type, date, scope, and role in the citing article.",
  [
    { title: "Authority", body: "Ask whether the publisher had direct responsibility for the record, disclosed a business interest, reported independently, or synthesized earlier evidence." },
    { title: "Recency", body: "The source publication date and CasinooVerse access date answer different questions. Later filings, rulings, corrections, or datasets may supersede an older record." },
    { title: "Reporting use", body: "A source may establish one narrow fact without supporting every inference in an article. The citing story explains which claim relied on the record and what context was added." },
  ],
  ["Identify the source type and publisher role.", "Check publication, access, and update dates.", "Return to the citing article before interpreting the record in isolation."],
  [{ label: "Browse source institutions", href: "/sources" }, { label: "Read current reporting", href: "/articles" }, { label: "Review editorial standards", href: "/about#standards" }],
);

const SUPPORT = detail(
  "Using support information",
  "Choose the route that matches the urgency and type of harm.",
  "The support directory organizes emergency guidance, helplines, counselling, self-exclusion, blocking tools, and financial-friction information. CasinooVerse does not provide treatment, legal advice, or emergency services.",
  [
    { title: "Immediate danger", body: "A threat to life, safety, or control requires local emergency services or an appropriate crisis resource. A publication page cannot assess or manage an emergency." },
    { title: "Gambling-specific support", body: "Helplines and counselling services can help assess behavior, plan next steps, involve family support, and identify local treatment or peer options." },
    { title: "Practical barriers", body: "Self-exclusion, payment blocks, account limits, device controls, and financial safeguards can create distance, but availability and legal effect vary by provider and jurisdiction." },
  ],
  ["Match the resource to your current location and urgency.", "Use several layers of protection rather than relying on one tool.", "Seek professional or emergency help when safety, debt, or control is at risk."],
  [{ label: "Read warning signs and limits", href: "/responsible-entertainment" }, { label: "Review the Disclaimer", href: "/disclaimer" }, { label: "Read privacy handling", href: "/privacy" }],
);

const RESPONSIBLE = detail(
  "Risk framework",
  "A limit works best when it is set before access, spending, or distress.",
  "Responsible-entertainment information should not imply that controls make gambling safe or profitable. The purpose is to reduce exposure, recognize harm early, create distance, and connect people with support.",
  [
    { title: "Pre-commitment", body: "Set a maximum spend and time before play, exclude borrowed money and essential expenses, and choose a stopping point that does not depend on winning or recovering losses." },
    { title: "Warning signs", body: "Secrecy, chasing, borrowing, distress, disrupted sleep, conflict, missed responsibilities, and repeated attempts to regain control can indicate that entertainment has become harmful." },
    { title: "Escalation", body: "Increase friction when limits fail: take a break, use self-exclusion or payment blocks, involve a trusted person, and contact qualified support. Immediate danger requires emergency help." },
  ],
  ["Set limits before the first transaction or session.", "Treat chasing and borrowing as stop signals.", "Use the support directory for practical and professional routes."],
  [{ label: "Open the support directory", href: "/support" }, { label: "Read educational game guides", href: "/games" }, { label: "Review the publication disclaimer", href: "/disclaimer" }],
);

const LEGAL = detail(
  "Policy context",
  "Publication rules connect privacy, editorial responsibility, and permitted use.",
  "The legal pages explain how CasinooVerse handles data and consent, defines its informational boundary, protects publication material, and gives readers a route to request clarification, correction, or privacy action.",
  [
    { title: "Data and consent", body: "Essential operation, optional analytics, newsletter consent, contact submissions, and infrastructure records have different purposes. Optional analytics remains consent-gated." },
    { title: "Editorial boundary", body: "CasinooVerse provides information and research, not gambling, investment, legal, medical, financial, or treatment services. Content should not replace qualified local advice." },
    { title: "Access and accountability", body: "Readers can report accessibility barriers, request an alternative format, submit a correction, or raise a privacy question through the internal contact process." },
  ],
  ["Read the policy that matches your question.", "Use cookie settings to revisit optional analytics consent.", "Contact the publication for correction, privacy, or accessibility requests."],
  [{ label: "About the publication", href: "/about" }, { label: "Read responsible guidance", href: "/responsible-entertainment" }, { label: "Find support information", href: "/support" }],
);

const NOT_FOUND = detail(
  "Active publication directory",
  "The requested route is unavailable, but the research desks remain open.",
  "Use these internal paths to find current reporting, dated research, source records, educational guides, and support information. Removed or mistyped routes do not redirect to third-party pages.",
  [
    { title: "Current reporting", body: "The Blog groups current stories and explainers by publication category, date, status, and source trail so readers can return to active reporting without relying on an obsolete address." },
    { title: "Research files", body: "Daily Research preserves date-bounded editions, story lists, publication states, and durable Markdown artifacts for readers who need a chronological evidence file." },
    { title: "Safety and support", body: "Responsible Entertainment explains warning signs, limits, and blocking controls; Support organizes practical help routes for readers who need distance or assistance." },
  ],
  ["Check the spelling of the requested internal path.", "Use Search for a title, jurisdiction, regulator, or topic.", "Use Support directly for urgent gambling-harm information."],
  [{ label: "Browse the Blog", href: "/articles" }, { label: "Search CasinooVerse", href: "/search" }, { label: "Open support information", href: "/support" }],
);

export function getPageDepth(pathname: string): PageDepthEntry {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return HOME;
  if (clean === "/articles") return ARTICLES;
  if (clean.startsWith("/articles/")) return ARTICLE;
  if (clean.startsWith("/category/")) return CATEGORY;
  if (clean === "/archive") return ARCHIVE;
  if (/^\/archive\/\d{4}-\d{2}-\d{2}$/.test(clean)) return DIGEST;
  if (clean === "/games") return GAMES;
  if (clean.startsWith("/games/")) return GAME_DETAIL;
  if (clean === "/guides") return GUIDES;
  if (clean === "/history") return HISTORY;
  if (clean === "/culture") return CULTURE;
  if (clean === "/destinations") return DESTINATIONS;
  if (clean === "/facts") return FACTS;
  if (clean === "/gallery") return GALLERY;
  if (clean === "/about") return ABOUT;
  if (clean === "/search") return SEARCH;
  if (clean === "/sources") return SOURCES;
  if (clean.startsWith("/sources/story/") || clean.startsWith("/sources/")) return SOURCE_DETAIL;
  if (clean === "/support") return SUPPORT;
  if (clean === "/responsible-entertainment") return RESPONSIBLE;
  if (["/privacy", "/disclaimer", "/terms"].includes(clean)) return LEGAL;
  return NOT_FOUND;
}

export function PageDepth({ pathname }: { pathname: string }) {
  const content = getPageDepth(pathname);
  return (
    <section className="section-pad border-t border-gold/15 bg-[#0b0d0c]" aria-labelledby="page-depth-heading">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="eyebrow text-gold">{content.eyebrow}</p>
            <h2 id="page-depth-heading" className="mt-3 max-w-5xl font-display text-5xl leading-[.98] text-ivory md:text-6xl">{content.title}</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ivory/62">{content.intro}</p>
          </div>
          <aside className="research-method-card">
            <BookOpenText className="h-6 w-6 text-gold" aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl text-ivory">How to use this page</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-ivory/58">
              {content.checklist.map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </aside>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {content.cards.map((card, index) => <article key={card.title} className="editorial-card p-7 md:p-8"><span className="font-display text-3xl text-gold/45">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-5 font-display text-3xl text-ivory">{card.title}</h3><p className="mt-4 leading-7 text-ivory/58">{card.body}</p></article>)}
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-ivory/48"><FileSearch className="h-5 w-5 text-gold" aria-hidden="true" /><span>All links stay inside CasinooVerse. Sources, caveats, and corrections remain visible.</span></div>
          <nav className="flex flex-wrap gap-3" aria-label="Detailed related reading">
            {content.links.map(link => <Link key={`${link.href}-${link.label}`} href={link.href} className="button-ghost">{link.label}<ArrowRight className="h-4 w-4" /></Link>)}
          </nav>
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-ivory/35"><ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />Informational publishing only. No wagering, deposits, affiliate offers, or personalized gambling advice.</p>
      </div>
    </section>
  );
}
