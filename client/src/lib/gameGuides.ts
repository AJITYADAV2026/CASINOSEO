import { EXPANDED_IMAGES } from "./expandedContent";

export type GameGuide = {
  slug: string;
  name: string;
  eyebrow: string;
  dek: string;
  image: string;
  imageAlt: string;
  introduction: string[];
  history: Array<{ period: string; title: string; text: string }>;
  concepts: Array<{ title: string; text: string }>;
  terms: Array<{ term: string; meaning: string }>;
  numbers: string;
  caveat: string;
  sources: Array<{ name: string; detail: string; href: string }>;
};

export const GAME_GUIDES: Record<string, GameGuide> = {
  poker: {
    slug: "poker", name: "Poker", eyebrow: "Cards, uncertainty, and culture",
    dek: "A source-led introduction to poker’s debated ancestry, shared hand structure, major families, and the difference between long-run analysis and short-run uncertainty.",
    image: EXPANDED_IMAGES.poker, imageAlt: "Empty professional poker table showing seating positions, face-down cards, dealer button, and layout notes",
    introduction: [
      "Poker is a family of card games rather than one fixed ruleset. Variants combine chance in the deal with decisions about betting, folding, and interpreting incomplete information.",
      "The game’s ancestry is debated. Historians connect modern poker to several European comparison and bluffing games rather than one proven inventor or single place of origin. CasinooVerse treats romantic origin stories as possibilities, not established fact.",
    ],
    history: [
      { period: "16th–18th centuries", title: "European predecessors", text: "Games including Primero, Brelan, Bouillotte, and Poque developed combinations of ranked hands, betting, and bluffing." },
      { period: "Early 19th century", title: "North American development", text: "Written accounts describe poker in and around New Orleans; river travel helped spread changing forms of the game." },
      { period: "19th–20th centuries", title: "New structures", text: "Draw, stud, and later community-card forms created different ways to distribute private and shared information." },
      { period: "Contemporary era", title: "Many regulated variants", text: "Texas Hold’em, Omaha, draw, and stud use different card distributions and betting rounds, so rules must be checked before play." },
    ],
    concepts: [
      { title: "Hand ranking", text: "Most familiar forms compare five-card combinations, from high card through pairs, straights, flushes, full houses, four of a kind, and straight flushes." },
      { title: "Private and shared information", text: "Some games use only private cards; community-card games combine private cards with a shared board." },
      { title: "Betting rounds", text: "Actions such as check, bet, call, raise, and fold change the pot but do not change the cards already dealt." },
      { title: "Variant rules", text: "Omaha, for example, normally requires exactly two private cards and three board cards; Hold’em uses a different construction rule." },
    ],
    terms: [
      { term: "Blind / ante", meaning: "A compulsory contribution used to begin action." },
      { term: "Board", meaning: "Shared face-up cards in community-card games." },
      { term: "Fold", meaning: "End participation in the current hand and surrender any claim to the pot." },
      { term: "Showdown", meaning: "The comparison of remaining hands after betting is complete." },
      { term: "Variance", meaning: "The extent to which short-run outcomes can differ from a long-run expectation." },
    ],
    numbers: "Card combinations can be counted, but a known probability is not a guarantee for the next deal. Short sessions remain highly variable, and fees or a house collection can change the economic result.",
    caveat: "Poker for money can produce financial and emotional harm. Treat it as paid entertainment, set limits before starting, and do not interpret skill as protection from chance, variance, or loss.",
    sources: [
      { name: "New York University", detail: "Beginner-oriented overview of poker structure and terms.", href: "https://wp.nyu.edu/mind/2023/01/31/beginners-guide-to-poker/" },
      { name: "University of Chicago Law School", detail: "Legal and economic analysis of chance and skill in Texas Hold’em.", href: "https://chicagounbound.uchicago.edu/cgi/viewcontent.cgi?article=1330&context=journal_articles" },
      { name: "Responsible Gambling Council", detail: "Public guidance on budgets, time, and safer participation.", href: "https://responsiblegambling.org/for-the-public/safer-play/safer-gambling-tips/" },
    ],
  },
  blackjack: {
    slug: "blackjack", name: "Blackjack", eyebrow: "Twenty-one, rules, and dependent probability",
    dek: "How the game descended from European twenty-one forms, how a hand is valued, and why table rules materially change the mathematics.",
    image: EXPANDED_IMAGES.blackjack, imageAlt: "Empty blackjack table with dealer shoe, discard tray, demonstration cards, and table-mechanics notes",
    introduction: [
      "Blackjack compares a participant’s hand with a dealer hand. The aim is to finish closer to 21 without exceeding it; a participant who goes over 21 loses immediately under standard rules.",
      "Its precise origin is unresolved, but historians generally connect it to the French game Vingt-et-Un. Stories about a promotional ace-and-black-jack payout are often repeated, yet the history of the modern name is less certain than the legend suggests.",
    ],
    history: [
      { period: "18th century", title: "Vingt-et-Un", text: "French twenty-one games used flexible ace values and the central objective of approaching 21 without passing it." },
      { period: "19th century", title: "Changing house rules", text: "As the game moved between jurisdictions, dealer procedures, payouts, and available player actions varied." },
      { period: "20th century", title: "Standardized casino form", text: "Regulated venues formalized shoes, dealer standing rules, splitting, doubling, and two-card blackjack payouts." },
      { period: "Today", title: "Rules remain decisive", text: "Deck count, dealer action, payout ratios, and restrictions differ, so a generic probability cannot describe every table." },
    ],
    concepts: [
      { title: "Card values", text: "Number cards use face value; tens and face cards count as 10; an ace may count as 1 or 11 when the higher value does not bust the hand." },
      { title: "Hard and soft totals", text: "A soft total counts an ace as 11 without exceeding 21; a hard total either has no ace or must count it as 1." },
      { title: "Dealer procedure", text: "The dealer follows fixed draw and stand rules rather than choosing freely." },
      { title: "Dependent draws", text: "Unlike a wheel spin, the composition of cards remaining changes as cards are dealt from a finite shoe." },
    ],
    terms: [
      { term: "Blackjack / natural", meaning: "A two-card 21, usually an ace with a ten-value card." },
      { term: "Hit", meaning: "Request another card." },
      { term: "Stand", meaning: "Take no further card." },
      { term: "Split", meaning: "Separate an eligible pair into two hands under the table’s rules." },
      { term: "Bust", meaning: "Exceed 21." },
    ],
    numbers: "A standard deck contains sixteen ten-value cards. The probability of a two-card natural is roughly 4.8% before rule variations, but payout ratios and dealer rules determine the actual house advantage.",
    caveat: "Mathematical knowledge does not remove loss risk. Never borrow to play, never chase losses, and stop when a pre-set time or spending boundary is reached.",
    sources: [
      { name: "Encyclopaedia Britannica", detail: "Blackjack rules and general game structure.", href: "https://www.britannica.com/topic/blackjack-card-game" },
      { name: "World Health Organization", detail: "Public-health overview of gambling exposure and harms.", href: "https://www.who.int/news-room/fact-sheets/detail/gambling" },
      { name: "Nevada Gaming Control Board", detail: "Regulatory publications and statistical context.", href: "https://www.gaming.nv.gov/about-us/statistics-and-publications/" },
    ],
  },
  roulette: {
    slug: "roulette", name: "Roulette", eyebrow: "The wheel, its variants, and independent outcomes",
    dek: "A measured guide to roulette’s evolving history, the single-zero and double-zero layouts, common terminology, and the mathematics created by the zero pockets.",
    image: EXPANDED_IMAGES.roulette, imageAlt: "European roulette wheel at rest beside its felt layout, calibration tools, and probability diagram",
    introduction: [
      "Roulette uses a rotating numbered wheel and a ball that comes to rest in one pocket. Bets are settled according to the pocket and the table layout; no previous result changes the probability of the next properly conducted spin.",
      "Blaise Pascal is often named as the game’s inventor, but the modern casino game evolved from several European wheel and number games. CasinooVerse separates that popular story from the documentary record.",
    ],
    history: [
      { period: "17th–18th centuries", title: "Wheel and number-game ancestry", text: "French, Italian, and English games contributed wheel mechanisms and number-betting structures." },
      { period: "Late 18th century", title: "Recognizable roulette", text: "Descriptions of a wheel with numbered pockets, zero, and double zero appear in accounts of Parisian play." },
      { period: "1840s", title: "Single-zero divergence", text: "François and Louis Blanc used a single-zero wheel at Bad Homburg, a form that later became associated with continental Europe and Monte Carlo." },
      { period: "American development", title: "Double-zero standard", text: "The double-zero layout became common in the United States and produces a different house edge." },
    ],
    concepts: [
      { title: "Inside selections", text: "Selections tied to one or a small group of numbered pockets." },
      { title: "Outside selections", text: "Broader groups such as colors, odd/even, dozens, or columns." },
      { title: "Single zero", text: "A 37-pocket wheel with numbers 1–36 and one zero." },
      { title: "Double zero", text: "A 38-pocket wheel that adds 00, increasing the house advantage on standard bets." },
    ],
    terms: [
      { term: "Straight up", meaning: "A selection on one numbered pocket." },
      { term: "Split", meaning: "A selection covering two adjacent layout numbers." },
      { term: "Dozen", meaning: "One of three groups of twelve numbers." },
      { term: "La partage / en prison", meaning: "French-rule treatments that may apply to some even-money bets after zero." },
      { term: "House edge", meaning: "The long-run mathematical advantage created by payout rules and zero pockets." },
    ],
    numbers: "On standard bets, a single-zero wheel has a house edge of about 2.70% and a double-zero wheel about 5.26%. These are long-run expectations, not predictions for a session.",
    caveat: "No progression or pattern system changes the independence of spins or removes the house edge. Use fixed limits and treat every stake as money that may be lost.",
    sources: [
      { name: "PBS Frontline", detail: "Accessible explanation of casino odds and the role of house advantage.", href: "https://www.pbs.org/wgbh/pages/frontline/shows/gamble/odds/odds.html" },
      { name: "First Nations Development Institute", detail: "Educational explanation of casino house edge.", href: "https://www.firstnations.org/dr-per-cap-casino-house-edge/" },
      { name: "Responsible Gambling Council", detail: "Lower-risk guidance and the limits of mathematical control.", href: "https://responsiblegambling.org/for-the-public/safer-play/the-lower-risk-gambling-guidelines/" },
    ],
  },
  baccarat: {
    slug: "baccarat", name: "Baccarat", eyebrow: "Fixed drawing rules and the illusion of trends",
    dek: "A clear account of baccarat’s uncertain origin, Punto Banco mechanics, commission variations, outcome probabilities, and common misreadings of scoreboards.",
    image: EXPANDED_IMAGES.baccarat, imageAlt: "Empty baccarat table with symmetrical Player and Banker zones, card shoe, and score-card grid",
    introduction: [
      "Baccarat describes several related comparing-card games. Punto Banco, the form common in many casinos, deals a Player hand and Banker hand under fixed drawing rules; those labels name the hands, not the person and the casino.",
      "Legends place the game much earlier, but a securely documented printed description appears in the 19th century. Claims of a single 15th-century inventor should therefore be treated cautiously.",
    ],
    history: [
      { period: "1847", title: "Documented print record", text: "Charles Van-Tenac’s Album des jeux included a description and mathematical treatment of Baccara." },
      { period: "19th–20th centuries", title: "European forms", text: "Baccarat en Banque and Chemin de Fer developed participant-banking and drawing traditions." },
      { period: "20th century", title: "Punto Banco", text: "The house-banked fixed-rule form spread from the Americas and became the most widely recognized casino version." },
      { period: "Contemporary variants", title: "Commission changes", text: "No-commission versions change payouts in specific outcomes, which changes the mathematics." },
    ],
    concepts: [
      { title: "Modulo-ten totals", text: "Only the rightmost digit counts: a card total of 15 becomes 5." },
      { title: "Fixed drawing table", text: "Third-card actions are determined by the rules, not by a participant’s choice." },
      { title: "Commission", text: "A standard Banker-hand win often carries a commission; alternative rules may change one payout instead." },
      { title: "Scoreboards", text: "Road maps record past results but do not make the next independent deal more predictable." },
    ],
    terms: [
      { term: "Punto / Player", meaning: "One of the two compared hands." },
      { term: "Banco / Banker", meaning: "The other compared hand; not a label for the participant." },
      { term: "Natural", meaning: "An initial two-card total of 8 or 9." },
      { term: "Tie", meaning: "Both hands finish with the same total." },
      { term: "Shoe", meaning: "The holder from which cards are dealt." },
    ],
    numbers: "For a common eight-deck Punto Banco game, published analyses place Banker and Player outcomes close together and Tie outcomes far less often. Exact house edges depend on commission and payout rules; the Tie selection typically carries a much larger advantage for the house.",
    caveat: "A visible streak does not cause the next result. The fast pace can compress many financial decisions into a short period, so time limits matter as much as budget limits.",
    sources: [
      { name: "UNLV Gaming Research Review", detail: "Historical analysis of baccarat’s documentary record and development.", href: "https://oasis.library.unlv.edu/cgi/viewcontent.cgi?article=1019&context=occ_papers/" },
      { name: "Acta Psychologica", detail: "2025 field-data study of trend-following behavior among baccarat participants.", href: "https://doi.org/10.1016/j.actpsy.2025.105172" },
      { name: "The Lancet Public Health Commission", detail: "Population-level framing of gambling harms.", href: "https://doi.org/10.1016/S2468-2667(24)00167-1" },
    ],
  },
  slots: {
    slug: "slots", name: "Slot Machines", eyebrow: "From mechanical reels to regulated software",
    dek: "How mechanical payout devices became software-driven machines, what RNG, RTP, and volatility mean, and why none predicts a short session.",
    image: EXPANDED_IMAGES.slots, imageAlt: "Opened mechanical slot reel assembly beside a dark modern machine aisle and technical tools",
    introduction: [
      "A slot machine is a game of chance in which a random mechanism selects reel positions or screen symbols and pays according to a disclosed table. Modern appearances can be complex, but the outcome is determined by software and rules tested within a jurisdiction’s regulatory framework.",
      "Mechanical histories often focus on Charles Fey’s late-19th-century San Francisco machines. Earlier and competing devices also existed, so the development is better understood as a sequence of mechanical and commercial innovations.",
    ],
    history: [
      { period: "1890s", title: "Mechanical payout machines", text: "Three-reel mechanisms simplified combinations and enabled automatic coin payouts." },
      { period: "Mid-20th century", title: "Electromechanical transition", text: "Electrical controls expanded presentation and payout mechanisms while retaining physical reels." },
      { period: "Late 20th century", title: "Video and software", text: "Digital displays and random-number software separated the visible reel animation from the underlying outcome selection." },
      { period: "Regulated present", title: "Testing and configuration", text: "Jurisdictions specify technical standards, approval procedures, records, and minimum or configured return requirements." },
    ],
    concepts: [
      { title: "Random number generator", text: "Software continuously produces values; the value selected at activation maps to an outcome under the game’s rules." },
      { title: "Payline / ways", text: "The pattern or combination rule used to evaluate displayed symbols." },
      { title: "Return to player", text: "A theoretical long-run proportion over very large numbers of plays—not a promise to one person." },
      { title: "Volatility", text: "A description of how a game distributes outcomes, commonly contrasting more frequent smaller returns with less frequent larger ones." },
    ],
    terms: [
      { term: "RNG", meaning: "The random-number generator that selects an outcome." },
      { term: "RTP", meaning: "A long-run theoretical return percentage under stated rules." },
      { term: "Paytable", meaning: "The rule set showing which combinations receive which payouts." },
      { term: "Reel strip", meaning: "The ordered symbol positions, physical or virtual, used by the game." },
      { term: "Volatility", meaning: "A statistical description of outcome distribution, not a prediction." },
    ],
    numbers: "An advertised RTP is calculated over an extremely large number of plays. A short session can differ substantially, and a previous loss or win does not make the next random outcome due.",
    caveat: "Rapid repeated play can make spending difficult to track. Use session reminders, loss limits where available, and breaks away from the machine; stop rather than trying to recover a loss.",
    sources: [
      { name: "Immigrant Entrepreneurship", detail: "Scholarly biography of Charles August Fey and mechanical-machine development.", href: "https://www.immigrantentrepreneurship.org/entries/charles-august-fey/" },
      { name: "USC Viterbi School of Engineering", detail: "Technical explainer on components and random outcome generation.", href: "https://illumin.usc.edu/inside-a-slot-machine/" },
      { name: "Virginia Administrative Code", detail: "Example of formal jurisdictional slot-machine requirements.", href: "https://law.lis.virginia.gov/admincode/title11/agency5/chapter90/section150/" },
    ],
  },
};
