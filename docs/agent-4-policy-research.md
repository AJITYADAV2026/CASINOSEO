# CasinoVerse Agent 4 — Google Indexing Policy Research

## Verified Google Capabilities

Google’s Search Console API provides an authorised sitemap submission operation. The `sitemaps.submit` method sends a `PUT` request to `https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}`, requires the `https://www.googleapis.com/auth/webmasters` OAuth scope, uses no request body, and returns an empty response on success.[1]

Google’s URL Inspection API can retrieve the indexed status of a URL for a verified Search Console property, but it does not request indexing. The API only reports the version currently known to Google and cannot test the live URL’s indexability.[2]

Google’s Indexing API is restricted to pages containing `JobPosting` or `BroadcastEvent` embedded in `VideoObject`. CasinoVerse’s ordinary casino-industry news and editorial pages are not eligible. Google also warns that abuse or attempts to exceed quotas can cause API access to be revoked.[3] [4]

## Agent 4 Compliance Decision

Agent 4 will submit CasinoVerse’s `sitemap.xml` and `news-sitemap.xml` through the Search Console API after authorised property access is configured. It will not send CasinoVerse article URLs to the restricted Indexing API.

For individual article URLs, Agent 4 will record eligibility and submission state in its dated report. New published URLs will be discoverable through the submitted sitemaps. If the user wants individual manual **Request indexing** actions, those must use Search Console’s authenticated user interface and remain subject to Google’s interface limits; they cannot be replaced by the URL Inspection API.

## Current Access State

The active connector catalog contains no Google Search Console connector. The sandbox browser reaches Google Search Console’s sign-in page but has no authenticated Google session, and the user-browser connection request was declined. Therefore, recurring sitemap submission requires a Google Cloud service account with the Search Console API enabled and access to the verified CasinoVerse Search Console property. The service-account credential must be supplied securely; it cannot be fabricated or stored in source control.

The latest Agent 3 manifest is `url-2026-09-03.md`. It contains seven updated canonical article URLs, but all seven are still labeled `developing` and `Not included` in the sitemap. Agent 4 must not submit those individual URLs as published until Agent 3’s completed run promotes them and the dynamic sitemap contains them.

## References

[1]: https://developers.google.com/webmaster-tools/v1/sitemaps/submit "Google Search Console API — Sitemaps: submit"
[2]: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect "Google Search Console API — URL Inspection: index.inspect"
[3]: https://developers.google.com/search/apis/indexing-api/v3/quickstart "Google Search Central — Indexing API Quickstart"
[4]: https://developers.google.com/search/apis/indexing-api/v3/quota-pricing "Google Search Central — Indexing API quota and pricing"
