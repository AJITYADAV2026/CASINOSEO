const urlRules: Array<[string, string]> = [
  ["industry-statistics", "uk-gambling-commission-statistics"],
  ["advertising-marketing", "uk-gambling-commission-advertising"],
  ["occ_papers/24", "unlv-architecture-wars"],
  ["occ_papers", "unlv-center-gaming-research"],
  ["grrj/", "unlv-gaming-research-review"],
  ["/WAI/media/", "w3c-media-accessibility"],
  ["/WAI/", "w3c-web-accessibility"],
  ["AZ%20Responsible%20Gaming", "arizona-department-of-gaming"],
  ["who.int/news-room/fact-sheets/detail/gambling", "world-health-organization"],
  ["gaming.nv.gov", "nevada-gaming-control-board"],
  ["spj.org", "society-professional-journalists"],
  ["trustproject.org", "trust-project"],
  ["fincen.gov", "fincen-casino-compliance"],
];

const nameRules: Record<string, string> = {
  "arizona responsible gaming training": "arizona-department-of-gaming",
  "electronic journal of business research methods": "electronic-journal-business-research-methods",
  "national council on problem gambling": "national-council-problem-gambling",
  "spj code of ethics": "society-professional-journalists",
  "the trust project": "trust-project",
  "u.s. census bureau": "us-census-bureau",
  "usc viterbi school of engineering": "usc-viterbi",
  "university of iowa libraries": "university-iowa-libraries",
  "casinoverse editorial standards": "about#standards",
  "casinoverse research desk": "about#standards",
};

export function internalReferencePath(name: string, href = "") {
  if (href.startsWith("/")) return href;
  const byName = nameRules[name.trim().toLowerCase()];
  if (byName) return byName.startsWith("about") ? `/${byName}` : `/sources/${byName}`;
  const byUrl = urlRules.find(([fragment]) => href.includes(fragment))?.[1];
  if (byUrl) return `/sources/${byUrl}`;
  return `/sources/${slugify(name)}`;
}

export function slugifySource(value: string) {
  return slugify(value);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
