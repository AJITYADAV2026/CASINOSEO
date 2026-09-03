import {
  boolean,
  date,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  mediumtext,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  accent: varchar("accent", { length: 16 }).default("#C9A45C").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const stories = mysqlTable(
  "stories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    title: varchar("title", { length: 280 }).notNull(),
    dek: text("dek").notNull(),
    body: text("body").notNull(),
    contentType: mysqlEnum("contentType", ["news", "analysis", "guide", "culture", "video"])
      .default("news")
      .notNull(),
    status: mysqlEnum("status", ["draft", "developing", "published", "archived"])
      .default("draft")
      .notNull(),
    categoryId: int("categoryId").notNull(),
    authorName: varchar("authorName", { length: 160 }).default("CasinoVerse Research Desk").notNull(),
    readingMinutes: int("readingMinutes").default(4).notNull(),
    featuredImageUrl: text("featuredImageUrl"),
    featuredImageAlt: varchar("featuredImageAlt", { length: 280 }),
    isLead: boolean("isLead").default(false).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    publishedAt: timestamp("publishedAt"),
    modifiedAt: timestamp("modifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("stories_category_idx").on(table.categoryId),
    index("stories_status_published_idx").on(table.status, table.publishedAt),
    index("stories_content_type_idx").on(table.contentType),
  ],
);

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

export const storySources = mysqlTable(
  "story_sources",
  {
    id: int("id").autoincrement().primaryKey(),
    storyId: int("storyId").notNull(),
    publisher: varchar("publisher", { length: 180 }).notNull(),
    sourceTitle: text("sourceTitle").notNull(),
    sourceUrl: text("sourceUrl").notNull(),
    sourcePublishedAt: timestamp("sourcePublishedAt"),
    accessedAt: timestamp("accessedAt").defaultNow().notNull(),
    sourceType: mysqlEnum("sourceType", ["official", "regulator", "filing", "trade", "news", "research"])
      .default("news")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("story_sources_story_idx").on(table.storyId)],
);

export type StorySource = typeof storySources.$inferSelect;
export type InsertStorySource = typeof storySources.$inferInsert;

export const dailyDigests = mysqlTable(
  "daily_digests",
  {
    id: int("id").autoincrement().primaryKey(),
    digestDate: date("digestDate", { mode: "string" }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    title: varchar("title", { length: 280 }).notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    markdownArtifact: mediumtext("markdownArtifact"),
    status: mysqlEnum("status", ["developing", "published", "archived"])
      .default("developing")
      .notNull(),
    scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
    publishedAt: timestamp("publishedAt"),
    modifiedAt: timestamp("modifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("daily_digests_date_idx").on(table.digestDate),
    uniqueIndex("daily_digests_cron_uid_idx").on(table.scheduleCronTaskUid),
    index("daily_digests_status_idx").on(table.status, table.digestDate),
  ],
);

export type DailyDigest = typeof dailyDigests.$inferSelect;
export type InsertDailyDigest = typeof dailyDigests.$inferInsert;

export const digestStories = mysqlTable(
  "digest_stories",
  {
    digestId: int("digestId").notNull(),
    storyId: int("storyId").notNull(),
    position: int("position").default(0).notNull(),
  },
  table => [
    primaryKey({ columns: [table.digestId, table.storyId] }),
    index("digest_stories_story_idx").on(table.storyId),
    index("digest_stories_position_idx").on(table.digestId, table.position),
  ],
);

export type DigestStory = typeof digestStories.$inferSelect;
export type InsertDigestStory = typeof digestStories.$inferInsert;

export const publicationJobs = mysqlTable(
  "publication_jobs",
  {
    id: int("id").autoincrement().primaryKey(),
    jobKey: varchar("jobKey", { length: 96 }).notNull().unique(),
    scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
    status: mysqlEnum("status", ["pending_deploy", "active", "paused"])
      .default("pending_deploy")
      .notNull(),
    lastCompletedDigestDate: date("lastCompletedDigestDate", { mode: "string" }),
    lastRunAt: timestamp("lastRunAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("publication_jobs_cron_uid_idx").on(table.scheduleCronTaskUid)],
);

export type PublicationJob = typeof publicationJobs.$inferSelect;
export type InsertPublicationJob = typeof publicationJobs.$inferInsert;

export const siteFindReports = mysqlTable(
  "site_find_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reportDate: date("reportDate", { mode: "string" }).notNull(),
    sourceDigestId: int("sourceDigestId").notNull(),
    sourceDigestDate: date("sourceDigestDate", { mode: "string" }).notNull(),
    sourceDigestUpdatedAt: timestamp("sourceDigestUpdatedAt").notNull(),
    status: mysqlEnum("status", ["draft", "completed", "failed"]).default("completed").notNull(),
    modelId: varchar("modelId", { length: 96 }).notNull(),
    executiveSummary: text("executiveSummary").notNull(),
    decisionsJson: mediumtext("decisionsJson").notNull(),
    markdownArtifact: mediumtext("markdownArtifact").notNull(),
    addCount: int("addCount").default(0).notNull(),
    updateCount: int("updateCount").default(0).notNull(),
    retainCount: int("retainCount").default(0).notNull(),
    archiveCount: int("archiveCount").default(0).notNull(),
    removeCount: int("removeCount").default(0).notNull(),
    scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
    analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("site_find_report_date_idx").on(table.reportDate),
    index("site_find_source_digest_idx").on(table.sourceDigestId),
    index("site_find_source_date_idx").on(table.sourceDigestDate),
    index("site_find_cron_uid_idx").on(table.scheduleCronTaskUid),
  ],
);

export type SiteFindReport = typeof siteFindReports.$inferSelect;
export type InsertSiteFindReport = typeof siteFindReports.$inferInsert;

export const urlManifests = mysqlTable(
  "url_manifests",
  {
    id: int("id").autoincrement().primaryKey(),
    manifestDate: date("manifestDate", { mode: "string" }).notNull(),
    sourceSiteFindId: int("sourceSiteFindId").notNull(),
    sourceSiteFindUpdatedAt: timestamp("sourceSiteFindUpdatedAt").notNull(),
    sourceReportDate: date("sourceReportDate", { mode: "string" }).notNull(),
    status: mysqlEnum("status", ["completed", "partial", "failed"]).default("completed").notNull(),
    actionsJson: mediumtext("actionsJson").notNull(),
    markdownArtifact: mediumtext("markdownArtifact").notNull(),
    createdCount: int("createdCount").default(0).notNull(),
    updatedCount: int("updatedCount").default(0).notNull(),
    retainedCount: int("retainedCount").default(0).notNull(),
    archivedCount: int("archivedCount").default(0).notNull(),
    reviewCount: int("reviewCount").default(0).notNull(),
    scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
    processedAt: timestamp("processedAt").defaultNow().notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("url_manifest_date_idx").on(table.manifestDate),
    index("url_manifest_source_report_idx").on(table.sourceSiteFindId),
    index("url_manifest_source_date_idx").on(table.sourceReportDate),
    index("url_manifest_cron_uid_idx").on(table.scheduleCronTaskUid),
  ],
);

export type UrlManifest = typeof urlManifests.$inferSelect;
export type InsertUrlManifest = typeof urlManifests.$inferInsert;

export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
    consentAt: timestamp("consentAt").defaultNow().notNull(),
    source: varchar("source", { length: 96 }).default("homepage-editorial-briefing").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("newsletter_subscribers_email_idx").on(table.email)],
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const editorialInquiries = mysqlTable(
  "editorial_inquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    topic: mysqlEnum("topic", ["correction", "privacy", "newsletter", "general"]).default("general").notNull(),
    message: text("message").notNull(),
    dedupeKey: varchar("dedupeKey", { length: 64 }).notNull(),
    consentAt: timestamp("consentAt").defaultNow().notNull(),
    status: mysqlEnum("status", ["new", "reviewed", "resolved", "spam"]).default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("editorial_inquiries_dedupe_idx").on(table.dedupeKey),
    index("editorial_inquiries_status_idx").on(table.status, table.createdAt),
  ],
);

export type EditorialInquiry = typeof editorialInquiries.$inferSelect;
export type InsertEditorialInquiry = typeof editorialInquiries.$inferInsert;
