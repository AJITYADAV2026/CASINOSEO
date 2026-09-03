# CasinoVerse Architecture and Editorial Plan

## Product Definition

CasinoVerse is a **public informational publisher** covering casino-industry research, entertainment history, game education, resort culture, technology, regulation, and responsible participation. It does not provide wagering, deposits, withdrawals, wallets, odds, casino bonuses, or playable real-money games.

The primary user journey begins with a visually strong homepage, moves through a lead story or daily digest, and then enables discovery by **topic**, **content type**, or **publication date**. Source transparency and visible publication metadata are core product requirements rather than optional article decoration.

## Public Sitemap

| Route | Page purpose | Indexing intent | Primary content |
| --- | --- | --- | --- |
| `/` | Establish the publication and surface current coverage | Index | Lead story, curated headlines, topic modules, latest digest, guides, responsible-entertainment panel |
| `/articles/:slug` | Present an individual research or editorial story | Index | Headline, standfirst, byline, publication/update dates, article body, sources, related stories |
| `/category/:slug` | Build topic authority and support focused browsing | Index | Category introduction, current stories, archive list |
| `/archive` | Provide publication-wide date discovery | Index | Available digest dates and monthly groupings |
| `/archive/:date` | Surface a daily research digest and stories associated with that date | Index when complete; developing pages may be `noindex` until finalized | Daily summary, dated stories, source links |
| `/games` | Provide a visual directory of educational game topics | Index | Poker, blackjack, roulette, baccarat, and slots overview cards |
| `/guides` | Present beginner learning paths | Index | Rules, history, terminology, etiquette, and risk-awareness guides |
| `/responsible-entertainment` | Provide safety, age, risk, and support information | Index | Risk education, limits, warning signs, support and self-exclusion resources |
| `/about` | Explain mission and editorial standards | Index | Mission, editorial principles, sourcing method, corrections approach |
| `/search` | Help users discover site content | Noindex | Search results generated from public stories |

The primary navigation will remain concise on desktop and convert to an accessible mobile drawer. The footer will contain About, Games, Guides, Archive, Responsible Entertainment, Editorial Standards, Privacy, Disclaimer, and Contact links.

## Editorial Taxonomy

| Category | Scope | Example content |
| --- | --- | --- |
| Market Intelligence | Operator results, revenue trends, forecasts, investment and operating context | Macau GGR outlook; South Korean operator sales |
| Regulation | Licensing, legislation, court cases, regulator actions | Prediction-market litigation; UAE supplier licences |
| Casino Operations | Properties, suppliers, management strategies, technology | Machine replacement cycles; resort strategy |
| Culture & Travel | Architecture, destinations, entertainment, culinary and tourism partnerships | Philippine resort tourism; regional destination development |
| Game Guides | History, basic concepts, terminology, etiquette | How roulette works; poker fundamentals |
| Responsible Entertainment | Risk awareness, public health, safeguards and support | Self-exclusion, spending limits, treatment capacity |

Each article has one primary category and may appear in one or more curated homepage sections through editorial flags. Daily digests aggregate stories without replacing their individual article URLs.

## Data Model

| Entity | Core fields | Purpose |
| --- | --- | --- |
| `categories` | `id`, `slug`, `name`, `description`, `accent`, timestamps | Defines indexable topic hubs and consistent labels |
| `stories` | `id`, `slug`, `title`, `dek`, `body`, `contentType`, `status`, `categoryId`, `authorName`, `readingMinutes`, visual metadata, `publishedAt`, `modifiedAt`, editorial flags, timestamps | Stores current and archived editorial content |
| `story_sources` | `id`, `storyId`, `publisher`, `sourceTitle`, `sourceUrl`, `sourcePublishedAt`, `accessedAt`, `sourceType` | Preserves clear source attribution and outbound references |
| `daily_digests` | `id`, `digestDate`, `slug`, `title`, `summary`, `body`, `status`, `scheduleCronTaskUid`, `publishedAt`, `modifiedAt`, timestamps | Stores one developing or published digest per calendar date and its recurring-job identity |
| `digest_stories` | `digestId`, `storyId`, `position` | Maintains ordered story membership within each dated digest |

All content timestamps will be stored as UTC-compatible timestamps. `digestDate` is a distinct date field because it represents an editorial archive day rather than an instant. Source URLs will remain outbound, visible, and labeled by publisher.

## Homepage Editorial Hierarchy

The homepage will follow the supplied PDF structure while adapting it to a research publisher. A cinematic hero introduces CasinoVerse and routes readers toward the latest daily digest and game education. Immediately below, a trending strip highlights active topics. The main editorial area uses an asymmetric lead-story composition supported by smaller headlines. Subsequent modules cover market intelligence, regulation, casino culture and travel, game guides, and responsible entertainment.

The visual language uses a near-black canvas, layered charcoal panels, warm ivory copy, restrained gold, and minimal oxblood emphasis. Editorial typography will use a newspaper-inspired serif display face with a highly readable companion serif/sans treatment, reflecting the user’s Times of India-style preference without copying a proprietary publication design.

## Publisher SEO Architecture

CasinoVerse will use permanent descriptive URLs, route-specific titles and descriptions, canonical tags, Open Graph and Twitter metadata, visible dates, and large-image preview permission. Article pages will emit `NewsArticle` or `Article` JSON-LD with `headline`, `description`, `datePublished`, `dateModified`, author, publisher, image metadata, article section, and canonical URL.

The application will use server-rendered first responses for public routes so crawlers and link-preview agents receive meaningful page content and route metadata without depending on client JavaScript. The site will also provide `robots.txt`, an XML sitemap, and a news sitemap limited to recent completed news articles. Developing daily digests will be eligible for `noindex` until finalized so incomplete current-day pages are not treated as stable publication records.

## Accessibility and Interaction

Semantic `header`, `nav`, `main`, `article`, `section`, `aside`, and `footer` landmarks will be used throughout. A skip link will be the first focusable control. Navigation, search, drawers, source links, and gallery interactions will be keyboard operable with visible focus. Text contrast will target WCAG AA, form fields will have persistent labels, and animations will respect `prefers-reduced-motion`.

Motion will be restrained and limited mainly to opacity and transform transitions. The header will become more compact on scroll, cards will use slight hover elevation and image scale, and mobile layouts will preserve readable type and touch targets without forcing desktop density.

## Daily Research Workflow Options

The requested daily process genuinely needs fresh source discovery and editorial judgment. Two viable recurring approaches are retained so the production choice can be made after the public site is deployed.

| Approach | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- |
| Scheduled research agent that browses current sources, composes a cited digest, and posts structured results back to CasinoVerse | Best match for multi-source discovery and synthesis; each run starts without conversation history, so the task prompt and callback contract must be self-contained | Consumes execution credits on each daily run | Moderate; requires deployed callback endpoint, authentication, validation, idempotent writes, and one recurring schedule |
| Lightweight scheduled website handler that ingests a predetermined feed/API list and performs rule-based updates, optionally with one embedded language-model summary | Lower recurring overhead and easy to manage, but less capable when sources change, pages require browsing, or editorial verification is complex | No agent execution per run; model/API usage may still apply | Moderate to high initially because reliable feeds, deduplication, source parsers, and failure handling must be maintained |

The website implementation will include a secure, idempotent `/api/scheduled/daily-digest` callback and persistent job metadata. The actual recurring task will be created only after the site is published, because the scheduling platform must call the deployed production URL. Until then, the dated Markdown digests and database records provide the launch archive.

## Content Integrity Rules

Daily stories must retain the publisher name, original headline, original URL, visible source publication date when available, and an access timestamp. Forecasts and company statements must be labeled as such. Proposals must not be described as enacted policy, licences must not be described more broadly than their documented scope, and developing current-day digests must be visibly labeled.

CasinoVerse summaries will add context rather than imitate or republish source articles. Correction and substantial-update timestamps will be changed only when the content itself materially changes.
