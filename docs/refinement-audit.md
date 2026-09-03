# CasinoVerse Multi-Page Refinement Audit

## HTML and Route Architecture

CasinoVerse is already a server-rendered HTML publication with distinct public routes for the homepage, articles, categories, archives, dated digests, games, guides, responsible entertainment, about, search, and the 404 experience. The refinement will preserve this multi-page architecture and strengthen the server-rendered content rather than converting the site into a single landing page.

A current route-class audit verified populated server-rendered HTML for `/`, an article, a category, the archive, a dated digest, Games, Guides, Responsible Entertainment, About, Search, and an unknown-route 404. Every response contained the global main landmark and a page-level H1; public routes returned HTTP 200 and the unknown route returned HTTP 404.

## Repeated Imagery

The editorial database currently assigns only five image assets across fourteen stories. Four market stories share one market image, four culture/travel stories share one resort image, three guide/technology stories share one gaming-equipment image, and two responsible-entertainment stories share one safety still life. Several page templates also reuse those same assets: Games and Guides share one hero; the homepage repeats guide, culture, and responsible images; Archive reuses the market image; About reuses the homepage hero; and article fallbacks reuse the homepage hero.

The new assignment must provide one distinct feature image for every stored story and separate hero visuals for the homepage, Games, Guides, Responsible Entertainment, About, Archive, and search/editorial-method contexts. Article fallbacks may use a neutral publisher texture only when a future story has no image; they must not silently repeat a named story asset.

## Consent and Analytics

The current HTML template loads the Umami analytics script unconditionally from `client/index.html`. This means analytics begins before any visitor choice. The refinement will remove the static script and load it dynamically only after the visitor chooses **Accept analytics**. An **Essential only** choice will persist the decision without loading analytics. The consent panel will be accessible, keyboard operable, visible on first desktop entry, and available on mobile without obscuring the entire page.

## Editorial Depth

The existing pages have strong visual structure and responsible-entertainment framing, but evergreen pages need more primary-source context and explicit references. The research work will cover eight independent content families:

| Research input | Routes improved |
| --- | --- |
| Publication mission, sourcing, corrections, and editorial independence | `/`, `/about` |
| Poker, blackjack, roulette, baccarat, and slots fundamentals | `/games`, guide articles |
| Probability, house edge, randomness, terminology, and beginner learning sequence | `/guides`, `/games` |
| Gambling risk, limits, warning signs, self-exclusion, and help pathways | `/responsible-entertainment` |
| Casino market reporting, operator disclosures, forecasts, and regulatory attribution | market and regulation categories, articles |
| Integrated resorts, destination development, architecture, and cultural coverage | culture/travel category and articles |
| Dated research methodology, developing-story labels, and source transparency | `/archive`, `/archive/:date` |
| Article provenance, source notes, update dates, corrections, and related coverage | `/articles/:slug` |

These eight inputs are independent and suitable for parallel authoritative-source research.

## Route-by-Route Editorial Depth Findings

| Route class | Current strength | Depth gap to address |
| --- | --- | --- |
| Homepage | Strong editorial hierarchy and research positioning | Trending topics, topic descriptions, and fallback states need contextual summaries and methodology cues |
| Article | Strong visible source list, byline, dates, and structured metadata | Body rendering needs richer evidence linkage, update context, and author-methodology framing |
| Category | Clear lead-story and archive structure | Generic descriptions need category-specific reporting principles, subtopics, and evidence standards |
| Archive | Clearly separates completed and developing editions | Needs selection methodology, archive statistics, and clearer source-tracking context |
| Daily digest | Strong dated edition state and linked story collection | Summary needs explicit verification method and stronger connection to primary source material |
| Games | Useful five-game directory | Histories, mathematical concepts, terminology, and external authorities are too brief |
| Guides | Good learning-path structure | Principles need concrete probability examples, evidence links, regional-rule caveats, and help resources |
| Responsible Entertainment | Prominent limits, warning signs, tools, and support links | Needs authoritative health definitions, practical tool explanations, and clearer evidence-based boundaries |
| About | Strong mission, sourcing, uncertainty, corrections, and scope standards | Needs review date, research-team transparency, and examples of how the standards are applied |
| Search | Functional database search with loading and empty states | Needs topic suggestions, filtering guidance, and richer discovery help |
| 404 | Appropriate branded recovery page | Can improve recovery with archive, search, and recent-research pathways without pretending to be editorial content |

The audit distinguishes utility pages from editorial pages: Search and 404 should become better discovery tools rather than being padded with artificial research copy.
