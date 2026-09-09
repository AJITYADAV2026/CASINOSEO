import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { dailyDigests, siteFindReports, stories } from "../drizzle/schema";
import { getDb, getDigestByDate, getLatestDigestForAnalysis, getStoryCatalogForAnalysis } from "./db";
import { invokeLLM } from "./_core/llm";

export const AGENT_2_MODEL = "gemini-3-flash-preview";
const actions = ["add", "update", "retain", "archive", "remove"] as const;
const priorities = ["critical", "high", "medium", "low"] as const;
const categories = ["market-intelligence", "regulation", "casino-operations", "culture-travel", "game-guides", "responsible-entertainment"] as const;
const contentTypes = ["news", "analysis", "guide", "culture", "video"] as const;

export const contentDecisionSchema = z.object({
  action: z.enum(actions),
  proposedTitle: z.string().trim().min(4).max(280),
  existingSlug: z.string().trim().max(180).nullable(),
  categorySlug: z.enum(categories),
  contentType: z.enum(contentTypes),
  priority: z.enum(priorities),
  rationale: z.string().trim().min(20).max(2000),
  evidence: z.array(z.string().trim().min(2).max(500)).max(12),
  confidence: z.number().min(0).max(1),
  requiresHumanReview: z.boolean(),
});

export const contentAnalysisSchema = z.object({
  executiveSummary: z.string().trim().min(40).max(3000),
  sourceAssessment: z.string().trim().min(20).max(2000),
  decisions: z.array(contentDecisionSchema).min(1).max(50),
  warnings: z.array(z.string().trim().min(4).max(1000)).max(20),
}).superRefine((analysis, ctx) => {
  analysis.decisions.forEach((decision, index) => {
    if (decision.action !== "retain" && decision.evidence.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["decisions", index, "evidence"], message: "Actionable recommendations require evidence" });
    }
    if (decision.action === "remove" && !decision.requiresHumanReview) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["decisions", index, "requiresHumanReview"], message: "Removal recommendations always require human review" });
    }
  });
});

export type ContentAnalysis = z.infer<typeof contentAnalysisSchema>;
type EditorialDb = NonNullable<Awaited<ReturnType<typeof getDb>>>;
type Analyzer = (digestMarkdown: string, storyCatalog: Awaited<ReturnType<typeof getStoryCatalogForAnalysis>>) => Promise<ContentAnalysis>;
type AnalyzableDigest = NonNullable<Awaited<ReturnType<typeof getLatestDigestForAnalysis>>>;
type AnalysisCatalog = Awaited<ReturnType<typeof getStoryCatalogForAnalysis>>;
type DigestStoryRows = NonNullable<Awaited<ReturnType<typeof getDigestByDate>>>["stories"];

const outputSchema = {
  name: "casinoverse_site_find",
  strict: true,
  schema: {
    type: "object",
    properties: {
      executiveSummary: { type: "string", maxLength: 1200 },
      sourceAssessment: { type: "string", maxLength: 1000 },
      decisions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string", enum: actions },
            proposedTitle: { type: "string", maxLength: 280 },
            existingSlug: { type: ["string", "null"] },
            categorySlug: { type: "string", enum: categories },
            contentType: { type: "string", enum: contentTypes },
            priority: { type: "string", enum: priorities },
            rationale: { type: "string", maxLength: 300 },
            evidence: { type: "array", maxItems: 1, items: { type: "string", maxLength: 180 } },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            requiresHumanReview: { type: "boolean" },
          },
          required: ["action", "proposedTitle", "existingSlug", "categorySlug", "contentType", "priority", "rationale", "evidence", "confidence", "requiresHumanReview"],
          additionalProperties: false,
        },
      },
      warnings: { type: "array", maxItems: 3, items: { type: "string", maxLength: 250 } },
    },
    required: ["executiveSummary", "sourceAssessment", "decisions", "warnings"],
    additionalProperties: false,
  },
} as const;

export async function analyzeDigestContent(digestMarkdown: string, storyCatalog: Awaited<ReturnType<typeof getStoryCatalogForAnalysis>>) {
  const catalog = storyCatalog.map(story => ({
    slug: story.slug,
    title: story.title,
    status: story.status,
    contentType: story.contentType,
    categorySlug: story.categorySlug,
  }));
  const response = await invokeLLM({
    model: AGENT_2_MODEL,
    maxTokens: 3500,
    responseFormat: { type: "json_schema", json_schema: outputSchema },
    messages: [
      {
        role: "system",
        content: "You are CasinooVerse Agent 2, a precise content-analysis editor. Analyze only the supplied Agent 1 research and current story catalog. Return at most 7 decisions, only for content materially affected by this digest; never enumerate unrelated catalog items. Keep the executive summary under 75 words and source assessment under 60 words. Each rationale must be one sentence under 25 words. Each actionable decision must have exactly one compact evidence item under 20 words, preferably with the source citation number. Return at most 3 short warnings. An add decision means a new editorial content item only; never recommend creating a daily digest page, any other page, a URL, an indexing directive, or a sitemap change. The Agent 1 digest already exists and must not be proposed as a new page. Do not invent facts. Preserve uncertainty and source references. Prefer update over add when the same event already exists. Every remove decision must require human review. Return only the requested JSON schema.",
      },
      {
        role: "user",
        content: `AGENT 1 RESEARCH MARKDOWN\n\n${digestMarkdown}\n\nCURRENT CASINOVERSE STORY CATALOG\n\n${JSON.stringify(catalog)}`,
      },
    ],
  });
  const wrapped = response as unknown as { choices?: typeof response.choices; data?: { choices?: typeof response.choices } };
  const content = (wrapped.choices ?? wrapped.data?.choices)?.[0]?.message.content;
  if (typeof content !== "string") throw new Error(`Agent 2 returned an unexpected model response: ${JSON.stringify(response).slice(0, 1200)}`);
  const normalized = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").replace(/,\s*([}\]])/g, "$1");
  return contentAnalysisSchema.parse(JSON.parse(normalized));
}

export function buildDeterministicAnalysis(sourceDigestDate: string, sourceStatus: string, digestStoryRows: DigestStoryRows): ContentAnalysis {
  const decisions = digestStoryRows.slice(0, 12).map(item => {
    const action = sourceStatus === "developing" ? "update" as const : "retain" as const;
    const highPriority = item.category.slug === "regulation" || item.category.slug === "responsible-entertainment";
    return {
      action,
      proposedTitle: item.story.title,
      existingSlug: item.story.slug,
      categorySlug: categories.includes(item.category.slug as (typeof categories)[number])
        ? item.category.slug as (typeof categories)[number]
        : "market-intelligence" as const,
      contentType: contentTypes.includes(item.story.contentType as (typeof contentTypes)[number])
        ? item.story.contentType as (typeof contentTypes)[number]
        : "analysis" as const,
      priority: highPriority ? "high" as const : "medium" as const,
      rationale: action === "update"
        ? "Refresh this developing item after Agent 1 closes the research window and preserve every source qualification."
        : "Retain this completed source-attributed item unless later evidence materially changes the reported facts.",
      evidence: [`Agent 1 ${sourceDigestDate}: ${item.story.title}`],
      confidence: 0.8,
      requiresHumanReview: action === "update",
    };
  });
  return contentAnalysisSchema.parse({
    executiveSummary: `Agent 2 reviewed ${decisions.length} source-linked items from the ${sourceDigestDate} research digest and produced conservative content decisions without page, URL, indexing, or sitemap actions.`,
    sourceAssessment: "The fallback retained Agent 1’s durable story relationships and source-qualified wording; downstream agents should review the original references before publication changes.",
    decisions,
    warnings: [
      "The structured model response was unavailable, so Agent 2 used its deterministic source-linked fallback.",
      "Agent 3 must review every update recommendation before creating or changing a page.",
    ],
  });
}

const tableCell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, character => character.toUpperCase());

function extractReferences(markdown: string) {
  const marker = markdown.match(/^## References\s*$/m);
  return marker?.index === undefined ? "" : markdown.slice(marker.index).trim();
}

export function renderSiteFindMarkdown(input: {
  reportDate: string;
  sourceDigestDate: string;
  sourceDigestStatus: string;
  modelId: string;
  analysis: ContentAnalysis;
  sourceMarkdown: string;
}) {
  const counts = Object.fromEntries(actions.map(action => [action, input.analysis.decisions.filter(decision => decision.action === action).length])) as Record<(typeof actions)[number], number>;
  const sections = actions.map(action => {
    const matching = input.analysis.decisions.filter(decision => decision.action === action);
    const entries = matching.length === 0
      ? "No recommendations in this category."
      : matching.map((decision, index) => `### ${index + 1}. ${decision.proposedTitle}\n\n| Field | Assessment |\n| --- | --- |\n| Existing slug | ${decision.existingSlug ? `\`${tableCell(decision.existingSlug)}\`` : "Not identified"} |\n| Category | ${titleCase(decision.categorySlug)} |\n| Content type | ${titleCase(decision.contentType)} |\n| Priority | ${titleCase(decision.priority)} |\n| Confidence | ${Math.round(decision.confidence * 100)}% |\n| Human review | ${decision.requiresHumanReview ? "Required" : "Not required at analysis stage"} |\n\n**Rationale.** ${decision.rationale}\n\n**Evidence from Agent 1.**\n\n${decision.evidence.map(item => `- ${item}`).join("\n")}`).join("\n\n");
    return `## ${titleCase(action)}\n\n${entries}`;
  }).join("\n\n");
  const warnings = input.analysis.warnings.length ? input.analysis.warnings.map(item => `- ${item}`).join("\n") : "- No additional analysis warnings.";
  const references = extractReferences(input.sourceMarkdown);

  return `---\ntitle: "CasinooVerse Site Find — ${input.reportDate}"\nreportDate: "${input.reportDate}"\nsourceDigestDate: "${input.sourceDigestDate}"\nstatus: "${input.sourceDigestStatus === "published" ? "completed" : "draft"}"\nmodel: "${input.modelId}"\naddCount: ${counts.add}\nupdateCount: ${counts.update}\nretainCount: ${counts.retain}\narchiveCount: ${counts.archive}\nremoveCount: ${counts.remove}\n---\n\n# CasinooVerse Site Find — ${input.reportDate}\n\n> **Agent 2 scope:** Content analysis only. This report does not create pages or URLs and does not modify indexing or sitemap files. Agent 3 and Agent 4 own those later stages.\n\n## Executive Content Assessment\n\n${input.analysis.executiveSummary}\n\n## Source Assessment\n\n${input.analysis.sourceAssessment}\n\n## Decision Summary\n\n| Decision | Count |\n| --- | ---: |\n| Add | ${counts.add} |\n| Update | ${counts.update} |\n| Retain | ${counts.retain} |\n| Archive | ${counts.archive} |\n| Remove | ${counts.remove} |\n\n${sections}\n\n## Analysis Warnings\n\n${warnings}\n\n## Responsible-Entertainment Safeguard\n\nCasinooVerse content must remain informational and non-promotional. No decision in this report should be interpreted as encouragement to gamble. Removal recommendations are never executed by Agent 2 and always require human or downstream editorial review.\n\n${references || "## References\n\nThe source digest did not include a separate reference block."}\n`;
}

function formatIstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function previousIsoCalendarDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) throw new Error(`Invalid ISO calendar date: ${dateString}`);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}

export async function runContentAnalysis(options: {
  includeDeveloping?: boolean;
  reportDate?: string;
  taskUid?: string | null;
  force?: boolean;
  enforceSequence?: boolean;
  db?: EditorialDb;
  analyzer?: Analyzer;
  digest?: AnalyzableDigest;
  storyCatalog?: AnalysisCatalog;
  digestStories?: DigestStoryRows;
} = {}) {
  const db = options.db ?? await getDb();
  if (!db) throw new Error("Database unavailable for Agent 2");
  const reportDate = options.reportDate ?? formatIstDate();
  const expectedDigestDate = previousIsoCalendarDate(reportDate);
  const digest = options.digest ?? await getLatestDigestForAnalysis(options.includeDeveloping ?? false);
  if (!digest?.markdownArtifact) return { skipped: "no-analyzable-digest" as const };
  const enforceSequence = options.enforceSequence ?? options.digest === undefined;
  if (enforceSequence && digest.digestDate !== expectedDigestDate) {
    return {
      skipped: "required-agent-1-digest-missing" as const,
      reportDate,
      expectedDigestDate,
      latestDigestDate: digest.digestDate,
    };
  }
  const [existing] = await db.select().from(siteFindReports).where(eq(siteFindReports.reportDate, reportDate)).limit(1);
  if (!options.force && existing && existing.sourceDigestId === digest.id && existing.sourceDigestUpdatedAt.getTime() >= digest.updatedAt.getTime()) {
    return { skipped: "already-current" as const, report: existing };
  }

  const catalog = options.storyCatalog ?? await getStoryCatalogForAnalysis();
  const analyzer = options.analyzer ?? analyzeDigestContent;
  let modelId = AGENT_2_MODEL;
  let analysis: ContentAnalysis;
  try {
    analysis = await analyzer(digest.markdownArtifact, catalog);
  } catch (error) {
    const digestStoryRows = options.digestStories ?? (await getDigestByDate(digest.digestDate))?.stories ?? [];
    if (digestStoryRows.length === 0) throw error;
    console.warn("[Agent 2] Structured model analysis failed; using deterministic source-linked fallback", error);
    analysis = buildDeterministicAnalysis(digest.digestDate, digest.status, digestStoryRows);
    modelId = `${AGENT_2_MODEL}+deterministic-fallback`;
  }
  const markdownArtifact = renderSiteFindMarkdown({
    reportDate,
    sourceDigestDate: digest.digestDate,
    sourceDigestStatus: digest.status,
    modelId,
    analysis,
    sourceMarkdown: digest.markdownArtifact,
  });
  const count = (action: (typeof actions)[number]) => analysis.decisions.filter(decision => decision.action === action).length;
  const values = {
    reportDate,
    sourceDigestId: digest.id,
    sourceDigestDate: digest.digestDate,
    sourceDigestUpdatedAt: digest.updatedAt,
    status: digest.status === "published" ? "completed" as const : "draft" as const,
    modelId,
    executiveSummary: analysis.executiveSummary,
    decisionsJson: JSON.stringify(analysis),
    markdownArtifact,
    addCount: count("add"),
    updateCount: count("update"),
    retainCount: count("retain"),
    archiveCount: count("archive"),
    removeCount: count("remove"),
    scheduleCronTaskUid: options.taskUid ?? null,
    analyzedAt: new Date(),
    errorMessage: null,
  };
  await db.insert(siteFindReports).values(values).onDuplicateKeyUpdate({ set: values });
  const [report] = await db.select().from(siteFindReports).where(and(eq(siteFindReports.reportDate, reportDate), eq(siteFindReports.sourceDigestId, digest.id))).limit(1);
  if (!report) throw new Error("Agent 2 report was not persisted");
  return { report, analysis };
}

export async function getLatestCatalogSlugs() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: stories.slug }).from(stories).orderBy(desc(stories.publishedAt));
}
