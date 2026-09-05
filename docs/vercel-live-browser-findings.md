# Vercel live browser findings

**Checked:** 5 September 2026  
**Production alias:** `https://casinoseo.vercel.app`

The live homepage rendered the complete CasinoVerse publication shell and database-backed editorial content under the expected title, **CasinoVerse — The world behind the games**. The desktop navigation, lead story, current research edition, article cards, internal source and support navigation, publication image, and cookie-settings control were visible. No visible application error state or incomplete loading shell appeared.

The live search URL `https://casinoseo.vercel.app/search?q=Macau` rendered **3 stories for “Macau”** directly in the initial page content: *Macau operators expected to maintain elevated promotion*, *RGB targets machine replacements and digital services*, and *Macau revenue expected to rebound after a softer August*. The search input retained the query, all result links remained on the CasinoVerse domain, and each result displayed its database-backed summary, desk, status, date, and reading time.

These checks establish browser-visible hydration and database result rendering for the newly deployed commit. The complete sitemap, asset, source-exposure, and runtime-log results are recorded separately in the final Vercel deployment assessment.
