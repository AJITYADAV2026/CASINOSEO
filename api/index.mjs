var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG, OAUTH_STATE_COOKIE, decodeOAuthState;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
    OAUTH_STATE_COOKIE = "__Host-oauth_state";
    decodeOAuthState = (state) => {
      let decoded;
      try {
        decoded = atob(state);
      } catch {
        return { redirectUri: "" };
      }
      try {
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed.redirectUri === "string") return parsed;
      } catch {
      }
      return { redirectUri: decoded };
    };
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      assetOrigin: process.env.MANUS_ASSET_ORIGIN ?? ""
    };
  }
});

// drizzle/schema.ts
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
  varchar
} from "drizzle-orm/mysql-core";
var users, categories, stories, storySources, sourceCatalog, historicalRecords, supportResources, dailyDigests, digestStories, publicationJobs, siteFindReports, urlManifests, newsletterSubscribers, editorialInquiries;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
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
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    categories = mysqlTable("categories", {
      id: int("id").autoincrement().primaryKey(),
      slug: varchar("slug", { length: 96 }).notNull().unique(),
      name: varchar("name", { length: 120 }).notNull(),
      description: text("description").notNull(),
      accent: varchar("accent", { length: 16 }).default("#C9A45C").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    stories = mysqlTable(
      "stories",
      {
        id: int("id").autoincrement().primaryKey(),
        slug: varchar("slug", { length: 180 }).notNull().unique(),
        title: varchar("title", { length: 280 }).notNull(),
        dek: text("dek").notNull(),
        body: text("body").notNull(),
        contentType: mysqlEnum("contentType", ["news", "analysis", "guide", "culture", "video"]).default("news").notNull(),
        status: mysqlEnum("status", ["draft", "developing", "published", "archived"]).default("draft").notNull(),
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
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("stories_category_idx").on(table.categoryId),
        index("stories_status_published_idx").on(table.status, table.publishedAt),
        index("stories_content_type_idx").on(table.contentType)
      ]
    );
    storySources = mysqlTable(
      "story_sources",
      {
        id: int("id").autoincrement().primaryKey(),
        storyId: int("storyId").notNull(),
        publisher: varchar("publisher", { length: 180 }).notNull(),
        sourceTitle: text("sourceTitle").notNull(),
        sourceUrl: text("sourceUrl").notNull(),
        sourcePublishedAt: timestamp("sourcePublishedAt"),
        accessedAt: timestamp("accessedAt").defaultNow().notNull(),
        sourceType: mysqlEnum("sourceType", ["official", "regulator", "filing", "trade", "news", "research"]).default("news").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull()
      },
      (table) => [index("story_sources_story_idx").on(table.storyId)]
    );
    sourceCatalog = mysqlTable(
      "source_catalog",
      {
        id: int("id").autoincrement().primaryKey(),
        slug: varchar("slug", { length: 180 }).notNull().unique(),
        name: varchar("name", { length: 220 }).notNull(),
        publicationLabel: varchar("publicationLabel", { length: 220 }),
        description: text("description").notNull(),
        sourceType: mysqlEnum("sourceType", ["official", "regulator", "research", "journalism", "standards", "industry", "education", "health"]).default("research").notNull(),
        originalUrl: text("originalUrl").notNull(),
        accessedAt: timestamp("accessedAt").defaultNow().notNull(),
        status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [index("source_catalog_type_idx").on(table.sourceType), index("source_catalog_status_idx").on(table.status)]
    );
    historicalRecords = mysqlTable(
      "historical_records",
      {
        id: int("id").autoincrement().primaryKey(),
        slug: varchar("slug", { length: 220 }).notNull().unique(),
        eventYear: int("eventYear").notNull(),
        eventDate: date("eventDate", { mode: "string" }),
        datePrecision: mysqlEnum("datePrecision", ["exact", "month", "year"]).default("year").notNull(),
        title: varchar("title", { length: 280 }).notNull(),
        desk: mysqlEnum("desk", [
          "industry_and_regulation",
          "operations_and_technology",
          "games_and_game_literacy",
          "places_architecture_destinations",
          "culture_and_media",
          "responsible_play_and_harm"
        ]).notNull(),
        jurisdiction: varchar("jurisdiction", { length: 180 }).notNull(),
        summary: text("summary").notNull(),
        significance: text("significance").notNull(),
        sourceCatalogId: int("sourceCatalogId"),
        sourceName: varchar("sourceName", { length: 220 }).notNull(),
        sourceTitle: text("sourceTitle").notNull(),
        sourceUrl: text("sourceUrl").notNull(),
        sourcePublishedDate: date("sourcePublishedDate", { mode: "string" }),
        sourceType: mysqlEnum("sourceType", ["official", "regulator", "legislation", "research", "trade", "news", "filing"]).default("research").notNull(),
        confidence: mysqlEnum("confidence", ["high", "medium"]).default("high").notNull(),
        verificationStatus: mysqlEnum("verificationStatus", ["verified", "review_needed", "rejected"]).default("verified").notNull(),
        cutoffLabel: varchar("cutoffLabel", { length: 80 }).default("through-2026-09-03").notNull(),
        isPublished: boolean("isPublished").default(true).notNull(),
        accessedAt: timestamp("accessedAt").defaultNow().notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        index("historical_records_year_idx").on(table.eventYear, table.eventDate),
        index("historical_records_desk_idx").on(table.desk, table.eventYear),
        index("historical_records_source_idx").on(table.sourceCatalogId),
        index("historical_records_publish_idx").on(table.isPublished, table.verificationStatus)
      ]
    );
    supportResources = mysqlTable(
      "support_resources",
      {
        id: int("id").autoincrement().primaryKey(),
        slug: varchar("slug", { length: 180 }).notNull().unique(),
        name: varchar("name", { length: 220 }).notNull(),
        jurisdiction: varchar("jurisdiction", { length: 180 }).notNull(),
        serviceType: mysqlEnum("serviceType", ["helpline", "counselling", "self_exclusion", "financial_blocking", "emergency", "information"]).default("information").notNull(),
        summary: text("summary").notNull(),
        phone: varchar("phone", { length: 80 }),
        contactInstructions: text("contactInstructions").notNull(),
        originalUrl: text("originalUrl"),
        sortOrder: int("sortOrder").default(0).notNull(),
        isActive: boolean("isActive").default(true).notNull(),
        verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [index("support_resources_jurisdiction_idx").on(table.jurisdiction), index("support_resources_active_idx").on(table.isActive, table.sortOrder)]
    );
    dailyDigests = mysqlTable(
      "daily_digests",
      {
        id: int("id").autoincrement().primaryKey(),
        digestDate: date("digestDate", { mode: "string" }).notNull(),
        slug: varchar("slug", { length: 180 }).notNull().unique(),
        title: varchar("title", { length: 280 }).notNull(),
        summary: text("summary").notNull(),
        body: text("body").notNull(),
        markdownArtifact: mediumtext("markdownArtifact"),
        status: mysqlEnum("status", ["developing", "published", "archived"]).default("developing").notNull(),
        scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
        publishedAt: timestamp("publishedAt"),
        modifiedAt: timestamp("modifiedAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("daily_digests_date_idx").on(table.digestDate),
        uniqueIndex("daily_digests_cron_uid_idx").on(table.scheduleCronTaskUid),
        index("daily_digests_status_idx").on(table.status, table.digestDate)
      ]
    );
    digestStories = mysqlTable(
      "digest_stories",
      {
        digestId: int("digestId").notNull(),
        storyId: int("storyId").notNull(),
        position: int("position").default(0).notNull()
      },
      (table) => [
        primaryKey({ columns: [table.digestId, table.storyId] }),
        index("digest_stories_story_idx").on(table.storyId),
        index("digest_stories_position_idx").on(table.digestId, table.position)
      ]
    );
    publicationJobs = mysqlTable(
      "publication_jobs",
      {
        id: int("id").autoincrement().primaryKey(),
        jobKey: varchar("jobKey", { length: 96 }).notNull().unique(),
        scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
        status: mysqlEnum("status", ["pending_deploy", "active", "paused"]).default("pending_deploy").notNull(),
        lastCompletedDigestDate: date("lastCompletedDigestDate", { mode: "string" }),
        lastRunAt: timestamp("lastRunAt"),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [uniqueIndex("publication_jobs_cron_uid_idx").on(table.scheduleCronTaskUid)]
    );
    siteFindReports = mysqlTable(
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
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("site_find_report_date_idx").on(table.reportDate),
        index("site_find_source_digest_idx").on(table.sourceDigestId),
        index("site_find_source_date_idx").on(table.sourceDigestDate),
        index("site_find_cron_uid_idx").on(table.scheduleCronTaskUid)
      ]
    );
    urlManifests = mysqlTable(
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
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("url_manifest_date_idx").on(table.manifestDate),
        index("url_manifest_source_report_idx").on(table.sourceSiteFindId),
        index("url_manifest_source_date_idx").on(table.sourceReportDate),
        index("url_manifest_cron_uid_idx").on(table.scheduleCronTaskUid)
      ]
    );
    newsletterSubscribers = mysqlTable(
      "newsletter_subscribers",
      {
        id: int("id").autoincrement().primaryKey(),
        email: varchar("email", { length: 320 }).notNull(),
        status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
        consentAt: timestamp("consentAt").defaultNow().notNull(),
        source: varchar("source", { length: 96 }).default("homepage-editorial-briefing").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [uniqueIndex("newsletter_subscribers_email_idx").on(table.email)]
    );
    editorialInquiries = mysqlTable(
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
        updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
      },
      (table) => [
        uniqueIndex("editorial_inquiries_dedupe_idx").on(table.dedupeKey),
        index("editorial_inquiries_status_idx").on(table.status, table.createdAt)
      ]
    );
  }
});

// server/db.ts
import { createHash } from "node:crypto";
import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getHomepageContent() {
  const db = await getDb();
  if (!db) return { categories: [], stories: [], digests: [] };
  const [categoryRows, storyRows, digestRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db.select({ story: stories, category: categories }).from(stories).innerJoin(categories, eq(stories.categoryId, categories.id)).where(inArray(stories.status, publicStoryStatuses)).orderBy(desc(stories.publishedAt)),
    db.select().from(dailyDigests).where(inArray(dailyDigests.status, ["published", "developing"])).orderBy(desc(dailyDigests.digestDate)).limit(8)
  ]);
  return { categories: categoryRows, stories: storyRows, digests: digestRows };
}
async function getStoryBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select({ story: stories, category: categories }).from(stories).innerJoin(categories, eq(stories.categoryId, categories.id)).where(and(eq(stories.slug, slug), inArray(stories.status, publicStoryStatuses))).limit(1);
  if (!rows[0]) return void 0;
  const sources = await db.select().from(storySources).where(eq(storySources.storyId, rows[0].story.id)).orderBy(storySources.id);
  return { ...rows[0], sources };
}
async function getCategoryBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const categoryRows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!categoryRows[0]) return void 0;
  const storyRows = await db.select({ story: stories, category: categories }).from(stories).innerJoin(categories, eq(stories.categoryId, categories.id)).where(
    and(
      eq(stories.categoryId, categoryRows[0].id),
      inArray(stories.status, publicStoryStatuses)
    )
  ).orderBy(desc(stories.publishedAt));
  return { category: categoryRows[0], stories: storyRows };
}
async function getArchive() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyDigests).where(inArray(dailyDigests.status, ["published", "developing", "archived"])).orderBy(desc(dailyDigests.digestDate));
}
async function getDigestByDate(digestDate) {
  const db = await getDb();
  if (!db) return void 0;
  const digestRows = await db.select().from(dailyDigests).where(eq(dailyDigests.digestDate, digestDate)).limit(1);
  if (!digestRows[0]) return void 0;
  const storyRows = await db.select({ story: stories, category: categories, position: digestStories.position }).from(digestStories).innerJoin(stories, eq(digestStories.storyId, stories.id)).innerJoin(categories, eq(stories.categoryId, categories.id)).where(eq(digestStories.digestId, digestRows[0].id)).orderBy(digestStories.position);
  return { digest: digestRows[0], stories: storyRows };
}
async function searchStories(query) {
  const db = await getDb();
  if (!db || query.trim().length < 2) return [];
  const term = `%${query.trim()}%`;
  return db.select({ story: stories, category: categories }).from(stories).innerJoin(categories, eq(stories.categoryId, categories.id)).where(
    and(
      inArray(stories.status, publicStoryStatuses),
      or(like(stories.title, term), like(stories.dek, term), like(stories.body, term))
    )
  ).orderBy(desc(stories.publishedAt)).limit(24);
}
async function getSourceCatalog() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sourceCatalog).where(eq(sourceCatalog.status, "active")).orderBy(sourceCatalog.name, sourceCatalog.publicationLabel);
}
async function getSourceCatalogEntry(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(sourceCatalog).where(and(eq(sourceCatalog.slug, slug), eq(sourceCatalog.status, "active"))).limit(1);
  return rows[0];
}
async function getStorySourceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select({ source: storySources, story: { slug: stories.slug, title: stories.title, status: stories.status } }).from(storySources).innerJoin(stories, eq(storySources.storyId, stories.id)).where(and(eq(storySources.id, id), inArray(stories.status, publicStoryStatuses))).limit(1);
  return rows[0];
}
async function getSupportDirectory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportResources).where(eq(supportResources.isActive, true)).orderBy(supportResources.sortOrder, supportResources.name);
}
async function getHistoricalArchive() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(historicalRecords).where(
    and(
      eq(historicalRecords.isPublished, true),
      eq(historicalRecords.verificationStatus, "verified")
    )
  ).orderBy(desc(historicalRecords.eventYear), desc(historicalRecords.eventDate));
}
async function getHistoricalRecordBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(historicalRecords).where(
    and(
      eq(historicalRecords.slug, slug),
      eq(historicalRecords.isPublished, true),
      eq(historicalRecords.verificationStatus, "verified")
    )
  ).limit(1);
  return rows[0];
}
async function subscribeToEditorialBriefing(email) {
  const db = await getDb();
  if (!db) throw new Error("Newsletter database is unavailable");
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalizedEmail)).limit(1);
  if (existing[0]?.status === "active") {
    return { success: true, alreadySubscribed: true };
  }
  const now = /* @__PURE__ */ new Date();
  await db.insert(newsletterSubscribers).values({
    email: normalizedEmail,
    status: "active",
    consentAt: now,
    source: "homepage-editorial-briefing"
  }).onDuplicateKeyUpdate({
    set: { status: "active", consentAt: now, source: "homepage-editorial-briefing" }
  });
  return { success: true, alreadySubscribed: false };
}
async function submitEditorialInquiry(input) {
  const db = await getDb();
  if (!db) throw new Error("Editorial contact database is unavailable");
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().replace(/\s+/g, " ");
  const message = input.message.trim().replace(/\s+/g, " ");
  const dedupeKey = createHash("sha256").update(`${email}
${input.topic}
${message.toLowerCase()}`).digest("hex");
  const existing = await db.select({ id: editorialInquiries.id }).from(editorialInquiries).where(eq(editorialInquiries.dedupeKey, dedupeKey)).limit(1);
  if (existing.length) return { success: true, alreadySubmitted: true };
  await db.insert(editorialInquiries).values({ name, email, topic: input.topic, message, dedupeKey, status: "new", consentAt: /* @__PURE__ */ new Date() });
  return { success: true, alreadySubmitted: false };
}
function selectLatestAnalyzableDigest(rows, includeDeveloping = false) {
  const allowed = includeDeveloping ? /* @__PURE__ */ new Set(["published", "developing"]) : /* @__PURE__ */ new Set(["published"]);
  return [...rows].filter((row) => allowed.has(row.status) && Boolean(row.markdownArtifact?.trim())).sort((left, right) => right.digestDate.localeCompare(left.digestDate) || right.updatedAt.getTime() - left.updatedAt.getTime())[0];
}
async function getLatestDigestForAnalysis(includeDeveloping = false) {
  const db = await getDb();
  if (!db) return void 0;
  const allowedStatuses = includeDeveloping ? ["published", "developing"] : ["published"];
  const rows = await db.select().from(dailyDigests).where(inArray(dailyDigests.status, allowedStatuses)).orderBy(desc(dailyDigests.digestDate), desc(dailyDigests.updatedAt)).limit(20);
  return selectLatestAnalyzableDigest(rows, includeDeveloping);
}
async function getStoryCatalogForAnalysis() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: stories.id,
    slug: stories.slug,
    title: stories.title,
    dek: stories.dek,
    status: stories.status,
    contentType: stories.contentType,
    categorySlug: categories.slug,
    categoryName: categories.name,
    publishedAt: stories.publishedAt,
    modifiedAt: stories.modifiedAt
  }).from(stories).innerJoin(categories, eq(stories.categoryId, categories.id)).orderBy(desc(stories.publishedAt));
}
async function getSiteFindReportByDate(reportDate) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(siteFindReports).where(eq(siteFindReports.reportDate, reportDate)).limit(1);
  return rows[0];
}
function selectLatestSiteFindForPublishing(rows, includeDraft = false) {
  const allowed = includeDraft ? /* @__PURE__ */ new Set(["completed", "draft"]) : /* @__PURE__ */ new Set(["completed"]);
  return [...rows].filter((row) => allowed.has(row.status) && Boolean(row.markdownArtifact.trim())).sort((left, right) => right.reportDate.localeCompare(left.reportDate) || right.updatedAt.getTime() - left.updatedAt.getTime())[0];
}
async function getLatestSiteFindForPublishing(includeDraft = false) {
  const db = await getDb();
  if (!db) return void 0;
  const allowedStatuses = includeDraft ? ["completed", "draft"] : ["completed"];
  const rows = await db.select().from(siteFindReports).where(inArray(siteFindReports.status, allowedStatuses)).orderBy(desc(siteFindReports.reportDate), desc(siteFindReports.updatedAt)).limit(20);
  return selectLatestSiteFindForPublishing(rows, includeDraft);
}
async function getUrlManifestByDate(manifestDate) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(urlManifests).where(eq(urlManifests.manifestDate, manifestDate)).limit(1);
  return rows[0];
}
var _db, publicStoryStatuses;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
    publicStoryStatuses = ["published", "developing"];
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/sdk.ts
var sdk_exports = {};
__export(sdk_exports, {
  createOAuthHttpClient: () => createOAuthHttpClient,
  sdk: () => sdk
});
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var isNonEmptyString2, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, OAuthService, createOAuthHttpClient, SDKServer, CRON_OPEN_ID_PREFIX, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        return decodeOAuthState(state).redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = (baseUrl = ENV.oAuthServerUrl) => ({
      async post(path2, payload) {
        if (!baseUrl) {
          throw new Error("OAUTH_SERVER_URL is not configured");
        }
        const response = await fetch(new URL(path2, `${baseUrl.replace(/\/+$/, "")}/`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(AXIOS_TIMEOUT_MS)
        });
        if (!response.ok) {
          const detail = (await response.text().catch(() => "")).slice(0, 500);
          throw new Error(
            `OAuth request failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`
          );
        }
        return { data: await response.json() };
      }
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new SignJWT({
          openId: payload.openId,
          appId: payload.appId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, appId, name } = payload;
          if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        let sessionToken = cookies.get(COOKIE_NAME);
        if (!sessionToken) {
          const authHeader = req.headers.authorization;
          if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            sessionToken = authHeader.slice(7);
          }
        }
        const session = await this.verifySession(sessionToken);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
          const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
          const taskUid = userInfo.taskUid ?? null;
          if (!taskUid) {
            throw ForbiddenError("Cron session missing task_uid");
          }
          return buildCronUser(userInfo);
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
        if (!user) {
          throw ForbiddenError("User not found");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    CRON_OPEN_ID_PREFIX = "cron_";
    sdk = new SDKServer();
  }
});

// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
init_const();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
init_const();
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/editorial.ts
init_db();
import { z as z2 } from "zod";
var editorialRouter = router({
  homepage: publicProcedure.query(() => getHomepageContent()),
  storyBySlug: publicProcedure.input(z2.object({ slug: z2.string().min(1).max(180) })).query(({ input }) => getStoryBySlug(input.slug)),
  categoryBySlug: publicProcedure.input(z2.object({ slug: z2.string().min(1).max(96) })).query(({ input }) => getCategoryBySlug(input.slug)),
  archive: publicProcedure.query(() => getArchive()),
  digestByDate: publicProcedure.input(z2.object({ date: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).query(({ input }) => getDigestByDate(input.date)),
  search: publicProcedure.input(z2.object({ query: z2.string().trim().min(2).max(120) })).query(({ input }) => searchStories(input.query)),
  sources: publicProcedure.query(() => getSourceCatalog()),
  sourceBySlug: publicProcedure.input(z2.object({ slug: z2.string().trim().min(1).max(180) })).query(({ input }) => getSourceCatalogEntry(input.slug)),
  storySourceById: publicProcedure.input(z2.object({ id: z2.number().int().positive() })).query(({ input }) => getStorySourceById(input.id)),
  support: publicProcedure.query(() => getSupportDirectory()),
  historicalArchive: publicProcedure.query(() => getHistoricalArchive()),
  historicalRecordBySlug: publicProcedure.input(z2.object({ slug: z2.string().trim().min(1).max(220) })).query(({ input }) => getHistoricalRecordBySlug(input.slug)),
  subscribe: publicProcedure.input(z2.object({
    email: z2.string().trim().email().max(320),
    consent: z2.literal(true)
  })).mutation(({ input }) => subscribeToEditorialBriefing(input.email)),
  contact: publicProcedure.input(z2.object({
    name: z2.string().trim().min(2).max(120),
    email: z2.string().trim().email().max(320),
    topic: z2.enum(["correction", "privacy", "newsletter", "general"]),
    message: z2.string().trim().min(30).max(4e3),
    consent: z2.literal(true),
    website: z2.string().max(0).optional().default("")
  })).mutation(({ input }) => submitEditorialInquiry(input))
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  editorial: editorialRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// server/publicationRoutes.ts
init_schema();
init_db();
import { and as and4, eq as eq4 } from "drizzle-orm";
import { z as z5 } from "zod";

// server/_core/context.ts
init_const();
function hasAuthenticationMaterial(req) {
  const authorization = req.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return true;
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== "string") return false;
  return cookieHeader.split(";").some((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`));
}
async function createContext(opts) {
  let user = null;
  if (hasAuthenticationMaterial(opts.req)) {
    try {
      const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
      user = await sdk2.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/contentAnalysis.ts
init_schema();
init_db();
import { and as and2, desc as desc2, eq as eq2 } from "drizzle-orm";
import { z as z3 } from "zod";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema: outputSchema2,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema2 || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
var RETRY_MAX_RETRIES = 4;
var RETRY_BASE_DELAY_MS = 500;
var RETRY_MAX_DELAY_MS = 3e4;
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var parseRetryAfter = (value) => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const at = Date.parse(value);
  return Number.isNaN(at) ? void 0 : Math.max(0, at - Date.now());
};
var computeBackoffDelay = (attempt, retryAfterMs) => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};
var fetchWithBackoff = async (url, init) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }
      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("LLM request failed after exhausting retries");
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema: outputSchema2,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens
  } = params;
  const payload = {
    messages: messages.map(normalizeMessage)
  };
  if (model) {
    payload.model = model;
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }
  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema: outputSchema2,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/contentAnalysis.ts
var AGENT_2_MODEL = "gemini-3-flash-preview";
var actions = ["add", "update", "retain", "archive", "remove"];
var priorities = ["critical", "high", "medium", "low"];
var categories2 = ["market-intelligence", "regulation", "casino-operations", "culture-travel", "game-guides", "responsible-entertainment"];
var contentTypes = ["news", "analysis", "guide", "culture", "video"];
var contentDecisionSchema = z3.object({
  action: z3.enum(actions),
  proposedTitle: z3.string().trim().min(4).max(280),
  existingSlug: z3.string().trim().max(180).nullable(),
  categorySlug: z3.enum(categories2),
  contentType: z3.enum(contentTypes),
  priority: z3.enum(priorities),
  rationale: z3.string().trim().min(20).max(2e3),
  evidence: z3.array(z3.string().trim().min(2).max(500)).max(12),
  confidence: z3.number().min(0).max(1),
  requiresHumanReview: z3.boolean()
});
var contentAnalysisSchema = z3.object({
  executiveSummary: z3.string().trim().min(40).max(3e3),
  sourceAssessment: z3.string().trim().min(20).max(2e3),
  decisions: z3.array(contentDecisionSchema).min(1).max(50),
  warnings: z3.array(z3.string().trim().min(4).max(1e3)).max(20)
}).superRefine((analysis, ctx) => {
  analysis.decisions.forEach((decision, index2) => {
    if (decision.action !== "retain" && decision.evidence.length === 0) {
      ctx.addIssue({ code: z3.ZodIssueCode.custom, path: ["decisions", index2, "evidence"], message: "Actionable recommendations require evidence" });
    }
    if (decision.action === "remove" && !decision.requiresHumanReview) {
      ctx.addIssue({ code: z3.ZodIssueCode.custom, path: ["decisions", index2, "requiresHumanReview"], message: "Removal recommendations always require human review" });
    }
  });
});
var outputSchema = {
  name: "casinoverse_site_find",
  strict: true,
  schema: {
    type: "object",
    properties: {
      executiveSummary: { type: "string", maxLength: 1200 },
      sourceAssessment: { type: "string", maxLength: 1e3 },
      decisions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string", enum: actions },
            proposedTitle: { type: "string", maxLength: 280 },
            existingSlug: { type: ["string", "null"] },
            categorySlug: { type: "string", enum: categories2 },
            contentType: { type: "string", enum: contentTypes },
            priority: { type: "string", enum: priorities },
            rationale: { type: "string", maxLength: 300 },
            evidence: { type: "array", maxItems: 1, items: { type: "string", maxLength: 180 } },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            requiresHumanReview: { type: "boolean" }
          },
          required: ["action", "proposedTitle", "existingSlug", "categorySlug", "contentType", "priority", "rationale", "evidence", "confidence", "requiresHumanReview"],
          additionalProperties: false
        }
      },
      warnings: { type: "array", maxItems: 3, items: { type: "string", maxLength: 250 } }
    },
    required: ["executiveSummary", "sourceAssessment", "decisions", "warnings"],
    additionalProperties: false
  }
};
async function analyzeDigestContent(digestMarkdown, storyCatalog) {
  const catalog = storyCatalog.map((story) => ({
    slug: story.slug,
    title: story.title,
    status: story.status,
    contentType: story.contentType,
    categorySlug: story.categorySlug
  }));
  const response = await invokeLLM({
    model: AGENT_2_MODEL,
    maxTokens: 3500,
    responseFormat: { type: "json_schema", json_schema: outputSchema },
    messages: [
      {
        role: "system",
        content: "You are CasinooVerse Agent 2, a precise content-analysis editor. Analyze only the supplied Agent 1 research and current story catalog. Return at most 7 decisions, only for content materially affected by this digest; never enumerate unrelated catalog items. Keep the executive summary under 75 words and source assessment under 60 words. Each rationale must be one sentence under 25 words. Each actionable decision must have exactly one compact evidence item under 20 words, preferably with the source citation number. Return at most 3 short warnings. An add decision means a new editorial content item only; never recommend creating a daily digest page, any other page, a URL, an indexing directive, or a sitemap change. The Agent 1 digest already exists and must not be proposed as a new page. Do not invent facts. Preserve uncertainty and source references. Prefer update over add when the same event already exists. Every remove decision must require human review. Return only the requested JSON schema."
      },
      {
        role: "user",
        content: `AGENT 1 RESEARCH MARKDOWN

${digestMarkdown}

CURRENT CASINOVERSE STORY CATALOG

${JSON.stringify(catalog)}`
      }
    ]
  });
  const wrapped = response;
  const content = (wrapped.choices ?? wrapped.data?.choices)?.[0]?.message.content;
  if (typeof content !== "string") throw new Error(`Agent 2 returned an unexpected model response: ${JSON.stringify(response).slice(0, 1200)}`);
  const normalized = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").replace(/,\s*([}\]])/g, "$1");
  return contentAnalysisSchema.parse(JSON.parse(normalized));
}
function buildDeterministicAnalysis(sourceDigestDate, sourceStatus, digestStoryRows) {
  const decisions = digestStoryRows.slice(0, 12).map((item) => {
    const action = sourceStatus === "developing" ? "update" : "retain";
    const highPriority = item.category.slug === "regulation" || item.category.slug === "responsible-entertainment";
    return {
      action,
      proposedTitle: item.story.title,
      existingSlug: item.story.slug,
      categorySlug: categories2.includes(item.category.slug) ? item.category.slug : "market-intelligence",
      contentType: contentTypes.includes(item.story.contentType) ? item.story.contentType : "analysis",
      priority: highPriority ? "high" : "medium",
      rationale: action === "update" ? "Refresh this developing item after Agent 1 closes the research window and preserve every source qualification." : "Retain this completed source-attributed item unless later evidence materially changes the reported facts.",
      evidence: [`Agent 1 ${sourceDigestDate}: ${item.story.title}`],
      confidence: 0.8,
      requiresHumanReview: action === "update"
    };
  });
  return contentAnalysisSchema.parse({
    executiveSummary: `Agent 2 reviewed ${decisions.length} source-linked items from the ${sourceDigestDate} research digest and produced conservative content decisions without page, URL, indexing, or sitemap actions.`,
    sourceAssessment: "The fallback retained Agent 1\u2019s durable story relationships and source-qualified wording; downstream agents should review the original references before publication changes.",
    decisions,
    warnings: [
      "The structured model response was unavailable, so Agent 2 used its deterministic source-linked fallback.",
      "Agent 3 must review every update recommendation before creating or changing a page."
    ]
  });
}
var tableCell = (value) => value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
var titleCase = (value) => value.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
function extractReferences(markdown) {
  const marker = markdown.match(/^## References\s*$/m);
  return marker?.index === void 0 ? "" : markdown.slice(marker.index).trim();
}
function renderSiteFindMarkdown(input) {
  const counts = Object.fromEntries(actions.map((action) => [action, input.analysis.decisions.filter((decision) => decision.action === action).length]));
  const sections = actions.map((action) => {
    const matching = input.analysis.decisions.filter((decision) => decision.action === action);
    const entries = matching.length === 0 ? "No recommendations in this category." : matching.map((decision, index2) => `### ${index2 + 1}. ${decision.proposedTitle}

| Field | Assessment |
| --- | --- |
| Existing slug | ${decision.existingSlug ? `\`${tableCell(decision.existingSlug)}\`` : "Not identified"} |
| Category | ${titleCase(decision.categorySlug)} |
| Content type | ${titleCase(decision.contentType)} |
| Priority | ${titleCase(decision.priority)} |
| Confidence | ${Math.round(decision.confidence * 100)}% |
| Human review | ${decision.requiresHumanReview ? "Required" : "Not required at analysis stage"} |

**Rationale.** ${decision.rationale}

**Evidence from Agent 1.**

${decision.evidence.map((item) => `- ${item}`).join("\n")}`).join("\n\n");
    return `## ${titleCase(action)}

${entries}`;
  }).join("\n\n");
  const warnings = input.analysis.warnings.length ? input.analysis.warnings.map((item) => `- ${item}`).join("\n") : "- No additional analysis warnings.";
  const references = extractReferences(input.sourceMarkdown);
  return `---
title: "CasinooVerse Site Find \u2014 ${input.reportDate}"
reportDate: "${input.reportDate}"
sourceDigestDate: "${input.sourceDigestDate}"
status: "${input.sourceDigestStatus === "published" ? "completed" : "draft"}"
model: "${input.modelId}"
addCount: ${counts.add}
updateCount: ${counts.update}
retainCount: ${counts.retain}
archiveCount: ${counts.archive}
removeCount: ${counts.remove}
---

# CasinooVerse Site Find \u2014 ${input.reportDate}

> **Agent 2 scope:** Content analysis only. This report does not create pages or URLs and does not modify indexing or sitemap files. Agent 3 and Agent 4 own those later stages.

## Executive Content Assessment

${input.analysis.executiveSummary}

## Source Assessment

${input.analysis.sourceAssessment}

## Decision Summary

| Decision | Count |
| --- | ---: |
| Add | ${counts.add} |
| Update | ${counts.update} |
| Retain | ${counts.retain} |
| Archive | ${counts.archive} |
| Remove | ${counts.remove} |

${sections}

## Analysis Warnings

${warnings}

## Responsible-Entertainment Safeguard

CasinooVerse content must remain informational and non-promotional. No decision in this report should be interpreted as encouragement to gamble. Removal recommendations are never executed by Agent 2 and always require human or downstream editorial review.

${references || "## References\n\nThe source digest did not include a separate reference block."}
`;
}
function formatIstDate(date2 = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date2);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function previousIsoCalendarDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) throw new Error(`Invalid ISO calendar date: ${dateString}`);
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}
async function runContentAnalysis(options = {}) {
  const db = options.db ?? await getDb();
  if (!db) throw new Error("Database unavailable for Agent 2");
  const reportDate = options.reportDate ?? formatIstDate();
  const expectedDigestDate = previousIsoCalendarDate(reportDate);
  const digest = options.digest ?? await getLatestDigestForAnalysis(options.includeDeveloping ?? false);
  if (!digest?.markdownArtifact) return { skipped: "no-analyzable-digest" };
  const enforceSequence = options.enforceSequence ?? options.digest === void 0;
  if (enforceSequence && digest.digestDate !== expectedDigestDate) {
    return {
      skipped: "required-agent-1-digest-missing",
      reportDate,
      expectedDigestDate,
      latestDigestDate: digest.digestDate
    };
  }
  const [existing] = await db.select().from(siteFindReports).where(eq2(siteFindReports.reportDate, reportDate)).limit(1);
  if (!options.force && existing && existing.sourceDigestId === digest.id && existing.sourceDigestUpdatedAt.getTime() >= digest.updatedAt.getTime()) {
    return { skipped: "already-current", report: existing };
  }
  const catalog = options.storyCatalog ?? await getStoryCatalogForAnalysis();
  const analyzer = options.analyzer ?? analyzeDigestContent;
  let modelId = AGENT_2_MODEL;
  let analysis;
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
    sourceMarkdown: digest.markdownArtifact
  });
  const count = (action) => analysis.decisions.filter((decision) => decision.action === action).length;
  const values = {
    reportDate,
    sourceDigestId: digest.id,
    sourceDigestDate: digest.digestDate,
    sourceDigestUpdatedAt: digest.updatedAt,
    status: digest.status === "published" ? "completed" : "draft",
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
    analyzedAt: /* @__PURE__ */ new Date(),
    errorMessage: null
  };
  await db.insert(siteFindReports).values(values).onDuplicateKeyUpdate({ set: values });
  const [report] = await db.select().from(siteFindReports).where(and2(eq2(siteFindReports.reportDate, reportDate), eq2(siteFindReports.sourceDigestId, digest.id))).limit(1);
  if (!report) throw new Error("Agent 2 report was not persisted");
  return { report, analysis };
}

// server/pageCreation.ts
init_schema();
import { and as and3, desc as desc3, eq as eq3, ne, or as or2 } from "drizzle-orm";
import { z as z4 } from "zod";
init_db();

// server/imagePublicationPolicy.ts
var KNOWN_TYPOGRAPHY_IMAGE_URLS = /* @__PURE__ */ new Set([
  "/manus-storage/cv-casino-editorial-home-master_dd528b70.jpg",
  "/manus-storage/cv-casino-editorial-floor-report_efb69f8c.jpg",
  "/manus-storage/cv-casino-editorial-industry_37397fe6.jpg",
  "/manus-storage/cv-casino-editorial-archive_118ba0e9.jpg",
  "/manus-storage/casinooverse-malaysia-gaming-child-safety-2026-09-11_2eb3bdd8.jpg",
  "/manus-storage/casinooverse-macau-tourism-tax-2026-09-11_bfd4d5db.jpg",
  "/manus-storage/pennsylvania-charitable-gaming-policy-editorial_119ef299.png",
  "/manus-storage/cv-redesign-story-virginia-v3_a162da61.jpg",
  "/manus-storage/cv-casino-editorial-blog-v2_e8bdb7f7.jpg",
  "/manus-storage/casinooverse-new-zealand-community-funds-2026-09-11_b172bfc3.jpg",
  "/manus-storage/casinooverse-fatf-gambling-risk-indicators-2026-09-11_e56c4039.jpg",
  "/manus-storage/cv-redesign-story-macau-promo-v3_378a5e1c.jpg",
  "/manus-storage/cv-redesign-story-newport-v3_6c4544d7.jpg",
  "/manus-storage/cv-redesign-story-uae-v3_7842f0be.jpg",
  "/manus-storage/cv-redesign-story-kangwon-v3_bf87c0c6.jpg",
  "/manus-storage/cv-redesign-story-gkl-v4_fc1a8e20.jpg",
  "/manus-storage/cv-redesign-story-hokkaido-v4_4377d0e6.jpg",
  "/manus-storage/cv-casino-story-philippines-visa_00e3c52c.jpg",
  "/manus-storage/cv-casino-story-rgb-machines_4f50affa.jpg",
  "/manus-storage/cv-casino-story-court-authority_1cbfe059.jpg",
  "/manus-storage/cv-casino-story-paradise-revenue_5da7f8d5.jpg",
  "/manus-storage/cv-casino-story-roulette-guide_416909f1.jpg",
  "/manus-storage/casinoverse-daily-research-archive-unique_189cac85.jpg",
  "/manus-storage/cv-casino-editorial-games-v2_112c40b6.jpg",
  "/manus-storage/cv-casino-editorial-history_ccc4b2ef.jpg",
  "/manus-storage/cv-casino-editorial-culture_5603c3fa.jpg",
  "/manus-storage/cv-casino-editorial-gallery_1b96ffcc.jpg",
  "/manus-storage/cv-redesign-gallery-archive-v3_6f28d974.jpg",
  "/manus-storage/cv-casino-editorial-responsible-v2_56db7e17.jpg",
  "/manus-storage/cv-casino-editorial-about-v2_da3ac0f6.jpg",
  "/manus-storage/casinooverse-textfree-012_eb3e70bf.jpg",
  "/manus-storage/casinooverse-textfree-051_17996e96.jpg",
  "/manus-storage/casinooverse-textfree-051-v2_ce325409.jpg"
]);
function isKnownTypographyImage(url) {
  return Boolean(url && KNOWN_TYPOGRAPHY_IMAGE_URLS.has(url));
}

// server/pageCreation.ts
var outcomes = ["created", "updated", "retained", "archived", "review-required"];
var pageActionSchema = z4.object({
  decision: z4.enum(["add", "update", "retain", "archive", "remove"]),
  outcome: z4.enum(outcomes),
  title: z4.string().min(1).max(280),
  storySlug: z4.string().max(180).nullable(),
  canonicalUrl: z4.string().url().nullable(),
  pageStatus: z4.enum(["draft", "developing", "published", "archived"]).nullable(),
  sitemapIncluded: z4.boolean(),
  note: z4.string().min(1).max(1e3)
});
var origin = () => (process.env.CANONICAL_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
function formatIstDate2(date2 = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date2);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
var tableCell2 = (value) => value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
function renderUrlManifest(input) {
  const count = (outcome) => input.actions.filter((action) => action.outcome === outcome).length;
  const rows = input.actions.length ? input.actions.map((action) => `| ${action.decision} | ${action.outcome} | ${tableCell2(action.title)} | ${action.storySlug ? `\`${tableCell2(action.storySlug)}\`` : "Not resolved"} | ${action.canonicalUrl ? `[Open page](${action.canonicalUrl})` : "Not created"} | ${action.pageStatus ?? "Not changed"} | ${action.sitemapIncluded ? "Included" : "Not included"} | ${tableCell2(action.note)} |`).join("\n") : "| \u2014 | retained | No material page actions | \u2014 | \u2014 | \u2014 | Not changed | Agent 2 supplied no actionable page decision. |";
  const status = input.sourceReportStatus === "completed" && count("review-required") === 0 ? "completed" : "partial";
  return `---
title: "CasinooVerse URL Manifest \u2014 ${input.manifestDate}"
manifestDate: "${input.manifestDate}"
sourceSiteFindDate: "${input.sourceReportDate}"
status: "${status}"
createdCount: ${count("created")}
updatedCount: ${count("updated")}
retainedCount: ${count("retained")}
archivedCount: ${count("archived")}
reviewCount: ${count("review-required")}
---

# CasinooVerse URL Manifest \u2014 ${input.manifestDate}

> **Agent 3 scope:** Page creation, page updates, permanent URL recording, and dynamic sitemap state only. No search-engine indexing submission was performed.

## Processing Summary

| Outcome | Count |
| --- | ---: |
| Created | ${count("created")} |
| Updated | ${count("updated")} |
| Retained | ${count("retained")} |
| Archived | ${count("archived")} |
| Review required | ${count("review-required")} |

## Page and URL Actions

| Decision | Outcome | Title | Story slug | Canonical URL | Page status | Sitemap | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Sitemap Result

CasinooVerse generates \`sitemap.xml\` dynamically from durable publication data. Published pages are included automatically, archived pages are excluded, and updated pages receive a refreshed modification timestamp.

## Indexing Boundary

Agent 3 did not submit URLs to Google, Bing, IndexNow, Search Console, or any other indexing service. Indexing submission remains reserved for Agent 4.
`;
}
async function runPageCreation(options = {}) {
  const db = options.db ?? await getDb();
  if (!db) throw new Error("Database unavailable for Agent 3");
  const manifestDate = options.manifestDate ?? formatIstDate2();
  const expectedDigestDate = previousIsoCalendarDate(manifestDate);
  const siteFind = options.siteFind ?? await getLatestSiteFindForPublishing(options.includeDraft ?? false);
  if (!siteFind) return { skipped: "no-publishable-site-find" };
  const enforceSequence = options.enforceSequence ?? options.siteFind === void 0;
  if (enforceSequence && (siteFind.reportDate !== manifestDate || siteFind.sourceDigestDate !== expectedDigestDate || siteFind.status !== "completed")) {
    return {
      skipped: "required-agent-2-report-missing",
      manifestDate,
      expectedReportDate: manifestDate,
      expectedDigestDate,
      latestReportDate: siteFind.reportDate,
      latestSourceDigestDate: siteFind.sourceDigestDate,
      latestReportStatus: siteFind.status
    };
  }
  const [existing] = await db.select().from(urlManifests).where(eq3(urlManifests.manifestDate, manifestDate)).limit(1);
  if (!options.force && existing && existing.sourceSiteFindId === siteFind.id && existing.sourceSiteFindUpdatedAt.getTime() >= siteFind.updatedAt.getTime()) {
    return { skipped: "already-current", manifest: existing };
  }
  const analysis = contentAnalysisSchema.parse(JSON.parse(siteFind.decisionsJson));
  const [sourceDigest] = await db.select().from(dailyDigests).where(eq3(dailyDigests.id, siteFind.sourceDigestId)).limit(1);
  if (!sourceDigest) throw new Error(`Agent 3 source digest not found: ${siteFind.sourceDigestId}`);
  const result = await db.transaction(async (tx) => {
    const digestStoryRows = await tx.select({ story: stories, category: categories }).from(digestStories).innerJoin(stories, eq3(digestStories.storyId, stories.id)).innerJoin(categories, eq3(stories.categoryId, categories.id)).where(eq3(digestStories.digestId, sourceDigest.id)).orderBy(digestStories.position);
    const bySlug = new Map(digestStoryRows.map((item) => [item.story.slug, item]));
    const byTitle = new Map(digestStoryRows.map((item) => [item.story.title.trim().toLowerCase(), item]));
    const actions2 = [];
    for (const decision of analysis.decisions) {
      const resolved = (decision.existingSlug ? bySlug.get(decision.existingSlug) : void 0) ?? byTitle.get(decision.proposedTitle.trim().toLowerCase());
      if (decision.action === "remove") {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: decision.proposedTitle,
          storySlug: resolved?.story.slug ?? decision.existingSlug,
          canonicalUrl: resolved ? `${origin()}/articles/${resolved.story.slug}` : null,
          pageStatus: resolved?.story.status ?? null,
          sitemapIncluded: resolved?.story.status === "published",
          note: "No deletion performed. Removal decisions require downstream editorial review."
        }));
        continue;
      }
      if (!resolved) {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: decision.proposedTitle,
          storySlug: decision.existingSlug,
          canonicalUrl: null,
          pageStatus: null,
          sitemapIncluded: false,
          note: "No sourced Agent 1 story record matched this decision, so Agent 3 did not invent a page."
        }));
        continue;
      }
      if (decision.action === "archive") {
        if (siteFind.status !== "completed") {
          actions2.push(pageActionSchema.parse({
            decision: decision.action,
            outcome: "review-required",
            title: resolved.story.title,
            storySlug: resolved.story.slug,
            canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
            pageStatus: resolved.story.status,
            sitemapIncluded: resolved.story.status === "published",
            note: "Draft Site Find reports cannot archive public pages."
          }));
          continue;
        }
        await tx.update(stories).set({ status: "archived", modifiedAt: /* @__PURE__ */ new Date() }).where(eq3(stories.id, resolved.story.id));
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "archived",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: "archived",
          sitemapIncluded: false,
          note: "Archived without deleting the story or its source records."
        }));
        continue;
      }
      if (decision.action === "retain") {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "retained",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: "No page mutation was required."
        }));
        continue;
      }
      const targetStatus = siteFind.status === "completed" ? "published" : "developing";
      if (!resolved.story.featuredImageUrl || !resolved.story.featuredImageAlt) {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: "Publication stopped because this story does not have its own featured image and accessible alt description."
        }));
        continue;
      }
      if (isKnownTypographyImage(resolved.story.featuredImageUrl)) {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: "Publication stopped because the featured image is on the verified embedded-typography blocklist and must be replaced with a text-free unique image."
        }));
        continue;
      }
      const [imageConflict] = await tx.select({ id: stories.id, slug: stories.slug }).from(stories).where(and3(
        eq3(stories.featuredImageUrl, resolved.story.featuredImageUrl),
        ne(stories.id, resolved.story.id),
        or2(eq3(stories.status, "published"), eq3(stories.status, "developing"))
      )).limit(1);
      if (imageConflict) {
        actions2.push(pageActionSchema.parse({
          decision: decision.action,
          outcome: "review-required",
          title: resolved.story.title,
          storySlug: resolved.story.slug,
          canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
          pageStatus: resolved.story.status,
          sitemapIncluded: resolved.story.status === "published",
          note: `Publication stopped because the featured image is already assigned to /articles/${imageConflict.slug}.`
        }));
        continue;
      }
      await tx.update(stories).set({
        status: targetStatus,
        modifiedAt: /* @__PURE__ */ new Date(),
        publishedAt: resolved.story.publishedAt ?? (targetStatus === "published" ? /* @__PURE__ */ new Date() : null)
      }).where(eq3(stories.id, resolved.story.id));
      actions2.push(pageActionSchema.parse({
        decision: decision.action,
        outcome: decision.action === "add" ? "created" : "updated",
        title: resolved.story.title,
        storySlug: resolved.story.slug,
        canonicalUrl: `${origin()}/articles/${resolved.story.slug}`,
        pageStatus: targetStatus,
        sitemapIncluded: targetStatus === "published",
        note: decision.action === "add" ? "Published the full source-attributed Agent 1 story without creating a duplicate slug." : "Preserved the permanent slug and sourced story body while refreshing publication state and modification time."
      }));
    }
    const markdownArtifact = renderUrlManifest({
      manifestDate,
      sourceReportDate: siteFind.reportDate,
      sourceReportStatus: siteFind.status,
      actions: actions2
    });
    const outcomeCount = (outcome) => actions2.filter((action) => action.outcome === outcome).length;
    const values = {
      manifestDate,
      sourceSiteFindId: siteFind.id,
      sourceSiteFindUpdatedAt: siteFind.updatedAt,
      sourceReportDate: siteFind.reportDate,
      status: siteFind.status === "completed" && outcomeCount("review-required") === 0 ? "completed" : "partial",
      actionsJson: JSON.stringify(actions2),
      markdownArtifact,
      createdCount: outcomeCount("created"),
      updatedCount: outcomeCount("updated"),
      retainedCount: outcomeCount("retained"),
      archivedCount: outcomeCount("archived"),
      reviewCount: outcomeCount("review-required"),
      scheduleCronTaskUid: options.taskUid ?? null,
      processedAt: /* @__PURE__ */ new Date(),
      errorMessage: null
    };
    await tx.insert(urlManifests).values(values).onDuplicateKeyUpdate({ set: values });
    return { actions: actions2, markdownArtifact };
  });
  const [manifest] = await db.select().from(urlManifests).where(and3(eq3(urlManifests.manifestDate, manifestDate), eq3(urlManifests.sourceSiteFindId, siteFind.id))).limit(1);
  if (!manifest) throw new Error("Agent 3 URL manifest was not persisted");
  return { manifest, actions: result.actions, markdownArtifact: result.markdownArtifact };
}

// server/publicationRoutes.ts
var xml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
function publicationOrigin() {
  return (process.env.CANONICAL_ORIGIN || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "")).replace(/\/$/, "");
}
function buildSitemapDocument(origin2, data) {
  const staticPaths = [
    "/",
    "/articles",
    "/archive",
    "/games",
    "/games/poker",
    "/games/blackjack",
    "/games/roulette",
    "/games/baccarat",
    "/games/slots",
    "/guides",
    "/history",
    "/culture",
    "/destinations",
    "/facts",
    "/gallery",
    "/sources",
    "/support",
    "/responsible-entertainment",
    "/about",
    "/privacy",
    "/disclaimer",
    "/terms"
  ];
  const urls = [
    ...staticPaths.map((path2) => ({ path: path2, modified: void 0 })),
    ...data.categories.map((category) => ({ path: `/category/${category.slug}`, modified: category.updatedAt })),
    ...data.stories.filter((item) => item.story.status === "published").map((item) => ({ path: `/articles/${item.story.slug}`, modified: item.story.modifiedAt ?? item.story.publishedAt ?? void 0 })),
    ...data.digests.filter((digest) => digest.status !== "developing").map((digest) => ({ path: `/archive/${digest.digestDate}`, modified: digest.modifiedAt ?? digest.publishedAt ?? void 0 }))
  ];
  const body = urls.map((item) => `<url><loc>${xml(origin2 + item.path)}</loc>${item.modified ? `<lastmod>${item.modified.toISOString()}</lastmod>` : ""}</url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}
var sourceSchema = z5.object({
  publisher: z5.string().trim().min(1).max(180),
  sourceTitle: z5.string().trim().min(1).max(1e3),
  sourceUrl: z5.string().url().max(2e3),
  sourcePublishedAt: z5.string().datetime().optional(),
  sourceType: z5.enum(["official", "regulator", "filing", "trade", "news", "research"]).default("news")
});
var storySchema = z5.object({
  slug: z5.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  title: z5.string().trim().min(8).max(280),
  dek: z5.string().trim().min(20).max(1200),
  body: z5.string().trim().min(80).max(2e4),
  contentType: z5.enum(["news", "analysis", "guide", "culture", "video"]).default("news"),
  categorySlug: z5.string().trim().min(1).max(96),
  authorName: z5.string().trim().min(2).max(160).default("CasinooVerse Research Desk"),
  readingMinutes: z5.number().int().min(1).max(30).default(4),
  featuredImageUrl: z5.string().max(2e3).optional(),
  featuredImageAlt: z5.string().max(280).optional(),
  publishedAt: z5.string().datetime(),
  sources: z5.array(sourceSchema).min(1).max(12)
});
var digestPayloadSchema = z5.object({
  digestDate: z5.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z5.string().trim().min(8).max(280),
  summary: z5.string().trim().min(30).max(1500),
  body: z5.string().trim().min(80).max(15e3),
  markdownArtifact: z5.string().trim().min(200).max(5e5),
  status: z5.enum(["developing", "published"]),
  stories: z5.array(storySchema).min(1).max(30)
});
function formatIstDate3(date2 = /* @__PURE__ */ new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date2);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
async function persistScheduledDigest(db, job, cronTaskUid, payload) {
  await db.transaction(async (tx) => {
    await tx.insert(dailyDigests).values({
      digestDate: payload.digestDate,
      slug: `daily-digest-${payload.digestDate}`,
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      markdownArtifact: payload.markdownArtifact,
      status: payload.status,
      publishedAt: payload.status === "published" ? /* @__PURE__ */ new Date() : null,
      modifiedAt: /* @__PURE__ */ new Date()
    }).onDuplicateKeyUpdate({ set: {
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      markdownArtifact: payload.markdownArtifact,
      status: payload.status,
      publishedAt: payload.status === "published" ? /* @__PURE__ */ new Date() : null,
      modifiedAt: /* @__PURE__ */ new Date()
    } });
    const [digest] = await tx.select().from(dailyDigests).where(eq4(dailyDigests.digestDate, payload.digestDate)).limit(1);
    if (!digest) throw new Error("Digest upsert did not return a durable record");
    await tx.delete(digestStories).where(eq4(digestStories.digestId, digest.id));
    for (let position = 0; position < payload.stories.length; position += 1) {
      const item = payload.stories[position];
      const [category] = await tx.select().from(categories).where(eq4(categories.slug, item.categorySlug)).limit(1);
      if (!category) throw new Error(`Unknown category slug: ${item.categorySlug}`);
      await tx.insert(stories).values({
        slug: item.slug,
        title: item.title,
        dek: item.dek,
        body: item.body,
        contentType: item.contentType,
        status: payload.status,
        categoryId: category.id,
        authorName: item.authorName,
        readingMinutes: item.readingMinutes,
        featuredImageUrl: item.featuredImageUrl ?? null,
        featuredImageAlt: item.featuredImageAlt ?? null,
        isLead: false,
        isFeatured: position < 4,
        publishedAt: new Date(item.publishedAt),
        modifiedAt: /* @__PURE__ */ new Date()
      }).onDuplicateKeyUpdate({ set: {
        title: item.title,
        dek: item.dek,
        body: item.body,
        contentType: item.contentType,
        status: payload.status,
        categoryId: category.id,
        authorName: item.authorName,
        readingMinutes: item.readingMinutes,
        featuredImageUrl: item.featuredImageUrl ?? null,
        featuredImageAlt: item.featuredImageAlt ?? null,
        isFeatured: position < 4,
        publishedAt: new Date(item.publishedAt),
        modifiedAt: /* @__PURE__ */ new Date()
      } });
      const [story] = await tx.select().from(stories).where(eq4(stories.slug, item.slug)).limit(1);
      if (!story) throw new Error(`Story upsert failed: ${item.slug}`);
      await tx.delete(storySources).where(eq4(storySources.storyId, story.id));
      await tx.insert(storySources).values(item.sources.map((source) => ({
        storyId: story.id,
        publisher: source.publisher,
        sourceTitle: source.sourceTitle,
        sourceUrl: source.sourceUrl,
        sourcePublishedAt: source.sourcePublishedAt ? new Date(source.sourcePublishedAt) : null,
        accessedAt: /* @__PURE__ */ new Date(),
        sourceType: source.sourceType
      })));
      await tx.insert(digestStories).values({ digestId: digest.id, storyId: story.id, position: position + 1 });
    }
    await tx.update(publicationJobs).set({
      status: "active",
      lastCompletedDigestDate: payload.status === "published" ? payload.digestDate : job.lastCompletedDigestDate,
      lastRunAt: /* @__PURE__ */ new Date()
    }).where(and4(eq4(publicationJobs.id, job.id), eq4(publicationJobs.scheduleCronTaskUid, cronTaskUid)));
  });
}
var UnifiedPipelineStageError = class extends Error {
  constructor(stage, message) {
    super(message);
    this.stage = stage;
    this.name = "UnifiedPipelineStageError";
  }
};
var unifiedPipelineDependencies = {
  persistDigest: persistScheduledDigest,
  analyze: runContentAnalysis,
  publishPages: runPageCreation
};
async function runUnifiedDailyPipeline(options) {
  const currentIstDate = options.currentIstDate ?? formatIstDate3();
  const expectedDigestDate = previousIsoCalendarDate(currentIstDate);
  const dependencies = options.dependencies ?? unifiedPipelineDependencies;
  if (options.payload.status !== "published") {
    throw new UnifiedPipelineStageError("research", "unified-pipeline-requires-published-digest");
  }
  if (options.payload.digestDate !== expectedDigestDate) {
    throw new UnifiedPipelineStageError(
      "research",
      `required-digest-date-${expectedDigestDate}-received-${options.payload.digestDate}`
    );
  }
  try {
    await dependencies.persistDigest(options.db, options.job, options.taskUid, options.payload);
  } catch (error) {
    throw new UnifiedPipelineStageError(
      "research",
      error instanceof Error ? error.message : "digest-persistence-failed"
    );
  }
  const analysis = await dependencies.analyze({
    taskUid: options.taskUid,
    db: options.db,
    reportDate: currentIstDate,
    enforceSequence: true
  });
  if (!("report" in analysis) || !analysis.report || analysis.report.status !== "completed") {
    throw new UnifiedPipelineStageError(
      "content-analysis",
      ("skipped" in analysis ? analysis.skipped : void 0) ?? "completed-site-find-not-persisted"
    );
  }
  const publication = await dependencies.publishPages({
    taskUid: options.taskUid,
    db: options.db,
    manifestDate: currentIstDate,
    enforceSequence: true
  });
  if (!("manifest" in publication) || !publication.manifest || publication.manifest.status !== "completed") {
    throw new UnifiedPipelineStageError(
      "page-creation",
      ("skipped" in publication ? publication.skipped : void 0) ?? "completed-url-manifest-not-persisted"
    );
  }
  return {
    pipelineStatus: "completed",
    currentIstDate,
    digestDate: options.payload.digestDate,
    storiesSaved: options.payload.stories.length,
    reportDate: analysis.report.reportDate,
    manifestDate: publication.manifest.manifestDate,
    stages: {
      research: "completed",
      contentAnalysis: "completed",
      pageCreation: "completed"
    }
  };
}
async function scheduledDailyDigest(req, res) {
  let taskUid;
  try {
    if (!hasAuthenticationMaterial(req)) {
      return res.status(403).json({ error: "cron-only" });
    }
    let user;
    try {
      const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
      user = await sdk2.authenticateRequest(req);
    } catch {
      return res.status(403).json({ error: "cron-only" });
    }
    const cronTaskUid = user.taskUid;
    taskUid = cronTaskUid;
    if (!user.isCron || !cronTaskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });
    const [job] = await db.select().from(publicationJobs).where(eq4(publicationJobs.scheduleCronTaskUid, cronTaskUid)).limit(1);
    if (!job || job.jobKey !== "casinoverse-daily-research") return res.json({ ok: true, skipped: "orphan" });
    const payload = digestPayloadSchema.parse(req.body);
    const result = await runUnifiedDailyPipeline({ db, job, taskUid: cronTaskUid, payload });
    return res.json({
      ok: true,
      ...result,
      artifacts: {
        research: `/research/${result.digestDate}.md`,
        siteFind: `/site-find/${result.reportDate}.md`,
        urlManifest: `/url-manifests/${result.manifestDate}.md`,
        sitemap: "/sitemap.xml"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown unified daily pipeline error";
    const status = error instanceof z5.ZodError ? 400 : error instanceof UnifiedPipelineStageError ? 409 : 500;
    return res.status(status).json({
      error: message,
      pipelineStatus: "failed",
      failedStage: error instanceof UnifiedPipelineStageError ? error.stage : "unknown",
      details: error instanceof z5.ZodError ? error.issues : void 0,
      stack: error instanceof Error ? error.stack : void 0,
      context: { url: req.originalUrl, taskUid },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}
function registerPublicationRoutes(app2) {
  app2.get("/robots.txt", (_req, res) => {
    const origin2 = publicationOrigin();
    const sitemap = origin2 ? `
Sitemap: ${origin2}/sitemap.xml
Sitemap: ${origin2}/news-sitemap.xml` : "";
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /search${sitemap}
`);
  });
  app2.get("/sitemap.xml", async (_req, res) => {
    const origin2 = publicationOrigin();
    if (!origin2) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const [{ categories: categoryRows, stories: storyRows }, digests] = await Promise.all([getHomepageContent(), getArchive()]);
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(buildSitemapDocument(origin2, { categories: categoryRows, stories: storyRows, digests }));
  });
  app2.get("/news-sitemap.xml", async (_req, res) => {
    const origin2 = publicationOrigin();
    if (!origin2) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const cutoff = Date.now() - 48 * 60 * 60 * 1e3;
    const recent = storyRows.filter((item) => item.story.status === "published" && item.story.publishedAt && item.story.publishedAt.getTime() >= cutoff);
    const body = recent.map((item) => `<url><loc>${xml(origin2 + `/articles/${item.story.slug}`)}</loc><news:news><news:publication><news:name>CasinooVerse</news:name><news:language>en</news:language></news:publication><news:publication_date>${item.story.publishedAt.toISOString()}</news:publication_date><news:title>${xml(item.story.title)}</news:title></news:news></url>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${body}</urlset>`);
  });
  app2.get("/rss.xml", async (_req, res) => {
    const origin2 = publicationOrigin();
    if (!origin2) return res.status(503).type("text/plain").send("CANONICAL_ORIGIN is not configured");
    const { stories: storyRows } = await getHomepageContent();
    const items = storyRows.filter((item) => item.story.status === "published").slice(0, 30).map((item) => `<item><title>${xml(item.story.title)}</title><link>${xml(origin2 + `/articles/${item.story.slug}`)}</link><guid>${xml(origin2 + `/articles/${item.story.slug}`)}</guid><description>${xml(item.story.dek)}</description>${item.story.publishedAt ? `<pubDate>${item.story.publishedAt.toUTCString()}</pubDate>` : ""}<category>${xml(item.category.name)}</category></item>`).join("");
    res.set("Cache-Control", "public, max-age=900").type("application/rss+xml").send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CasinooVerse</title><link>${xml(origin2)}</link><description>${xml("Independent casino-industry research, culture, regulation, and responsible entertainment.")}</description>${items}</channel></rss>`);
  });
  app2.get("/research/:date.md", async (req, res) => {
    const date2 = z5.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date2.success) return res.status(404).type("text/plain").send("Research edition not found");
    const data = await getDigestByDate(date2.data);
    if (!data?.digest.markdownArtifact) return res.status(404).type("text/plain").send("Research edition not found");
    res.set("Cache-Control", data.digest.status === "developing" ? "no-cache" : "public, max-age=900").set("Content-Disposition", `inline; filename="CasinooVerse-${date2.data}.md"`).type("text/markdown; charset=utf-8").send(data.digest.markdownArtifact);
  });
  app2.get("/site-find/:date.md", async (req, res) => {
    const date2 = z5.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date2.success) return res.status(404).type("text/plain").send("Site Find report not found");
    const report = await getSiteFindReportByDate(date2.data);
    if (!report?.markdownArtifact) return res.status(404).type("text/plain").send("Site Find report not found");
    return res.set("Cache-Control", report.status === "completed" ? "public, max-age=900" : "no-cache").set("Content-Disposition", `inline; filename="SITE FIND ${date2.data}.md"`).type("text/markdown; charset=utf-8").send(report.markdownArtifact);
  });
  app2.get("/url-manifests/:date.md", async (req, res) => {
    const date2 = z5.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.params.date);
    if (!date2.success) return res.status(404).type("text/plain").send("URL manifest not found");
    const manifest = await getUrlManifestByDate(date2.data);
    if (!manifest?.markdownArtifact) return res.status(404).type("text/plain").send("URL manifest not found");
    return res.set("Cache-Control", manifest.status === "completed" ? "public, max-age=900" : "no-cache").set("Content-Disposition", `inline; filename="URL+${date2.data}.md"`).type("text/markdown; charset=utf-8").send(manifest.markdownArtifact);
  });
  app2.post("/api/scheduled/daily-digest", scheduledDailyDigest);
}

// server/_core/oauth.ts
init_const();
init_db();
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
      const tokenResponse = await sdk2.exchangeCodeForToken(code, state);
      const userInfo = await sdk2.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk2.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key || key.includes("..") || !/^[A-Za-z0-9._/-]+$/.test(key)) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      if (!ENV.assetOrigin) {
        res.status(500).send("Storage proxy not configured");
        return;
      }
      try {
        const assetUrl = new URL(`/manus-storage/${key}`, ENV.assetOrigin);
        const assetResp = await fetch(assetUrl, { redirect: "follow" });
        if (!assetResp.ok) {
          console.error(`[StorageProxy] public asset error: ${assetResp.status}`);
          res.status(assetResp.status === 404 ? 404 : 502).send("Storage asset unavailable");
          return;
        }
        const contentType = assetResp.headers.get("content-type");
        const etag = assetResp.headers.get("etag");
        const lastModified = assetResp.headers.get("last-modified");
        if (contentType) res.set("Content-Type", contentType);
        if (etag) res.set("ETag", etag);
        if (lastModified) res.set("Last-Modified", lastModified);
        res.set("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
        res.set("X-Content-Type-Options", "nosniff");
        res.status(200).send(Buffer.from(await assetResp.arrayBuffer()));
      } catch (err) {
        console.error("[StorageProxy] public asset fallback failed:", err);
        res.status(502).send("Storage asset unavailable");
      }
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/app.ts
function createCasinoVerseApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app2);
  registerOAuthRoutes(app2);
  registerPublicationRoutes(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app2;
}

// server/_core/staticSsr.ts
import express2 from "express";
import fs from "fs";
import path from "path";
import superjson2 from "superjson";

// server/_core/ssrCaller.ts
async function buildSsrPrefetch(req, res) {
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  return {
    homepage: () => caller.editorial.homepage(),
    storyBySlug: (slug) => caller.editorial.storyBySlug({ slug }),
    categoryBySlug: (slug) => caller.editorial.categoryBySlug({ slug }),
    archive: () => caller.editorial.archive(),
    digestByDate: (date2) => caller.editorial.digestByDate({ date: date2 }),
    search: (query) => caller.editorial.search({ query }),
    sources: () => caller.editorial.sources(),
    sourceBySlug: (slug) => caller.editorial.sourceBySlug({ slug }),
    storySourceById: (id) => caller.editorial.storySourceById({ id }),
    support: () => caller.editorial.support(),
    historicalArchive: () => caller.editorial.historicalArchive(),
    historicalRecordBySlug: (slug) => caller.editorial.historicalRecordBySlug({ slug })
  };
}

// server/_core/staticSsr.ts
var CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN ?? "").replace(/\/$/, "");
var SITE_NAME = process.env.SITE_NAME ?? "CasinooVerse";
var DEFAULT_DESCRIPTION = "Independent casino-industry research, culture, regulation, destinations, and responsible-entertainment guides.";
var escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var clampText = (value, max) => {
  const text2 = value.replace(/\s+/g, " ").trim();
  if (text2.length <= max) return text2;
  const cut = text2.lastIndexOf(" ", max);
  return `${text2.slice(0, cut > max * 0.6 ? cut : max)}\u2026`;
};
function absoluteUrl(value) {
  if (!value) return void 0;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return CANONICAL_ORIGIN ? `${CANONICAL_ORIGIN}${value}` : void 0;
  return value;
}
function buildHeadTags(head) {
  const title = escapeHtml(clampText(head.title, 70) || SITE_NAME);
  const description = escapeHtml(clampText(head.description.replace(/[#*_`~]+/g, ""), 200));
  const canonical = head.canonicalPath && CANONICAL_ORIGIN ? `${CANONICAL_ORIGIN}${head.canonicalPath}` : void 0;
  const image = absoluteUrl(head.ogImage);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="${head.ogType ?? "website"}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`
  ];
  if (canonical) {
    const safe = escapeHtml(canonical);
    tags.push(`<meta property="og:url" content="${safe}" />`, `<link rel="canonical" href="${safe}" />`);
  }
  if (image) {
    const safe = escapeHtml(image);
    tags.push(`<meta property="og:image" content="${safe}" />`, `<meta name="twitter:image" content="${safe}" />`);
    if (head.ogImageAlt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(head.ogImageAlt)}" />`);
  }
  if (head.ogType === "article") {
    if (head.publishedTime) tags.push(`<meta property="article:published_time" content="${escapeHtml(head.publishedTime)}" />`);
    if (head.modifiedTime) tags.push(`<meta property="article:modified_time" content="${escapeHtml(head.modifiedTime)}" />`);
  }
  if (head.noindex || head.notFound) tags.push(`<meta name="robots" content="noindex, follow" />`);
  else tags.push(`<meta name="robots" content="index, follow, max-image-preview:large" />`);
  if (head.jsonLd) {
    const json = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script id="casino-verse-json-ld" type="application/ld+json">${json}</script>`);
  }
  return tags.join("\n");
}
function composeHtml(template, appHtml, head, dehydratedState) {
  const state = JSON.stringify(superjson2.serialize(dehydratedState)).replace(/</g, "\\u003c");
  const stateScript = `<script>window.__RQ_STATE__ = ${state}</script>`;
  return template.replace("</body>", () => `${stateScript}</body>`).replace("<!--app-head-->", () => buildHeadTags(head)).replace("<!--app-html-->", () => appHtml);
}
function serveStatic(app2) {
  const publicCandidates = [
    path.resolve(process.cwd(), "vercel-public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "../..", "dist", "public")
  ];
  const publicPath = publicCandidates.find((candidate) => fs.existsSync(candidate)) ?? publicCandidates[0];
  if (!fs.existsSync(publicPath)) console.error(`Could not find the public asset directory: ${publicPath}`);
  app2.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/g.test(req.path)) {
      const query = req.originalUrl.slice(req.path.length);
      const target = (req.path.replace(/\/+$/, "") || "/").replace(/^\/{2,}/, "/");
      return res.redirect(301, `${target}${query}`);
    }
    next();
  });
  app2.use(express2.static(publicPath, { index: false, redirect: false }));
  const templateCandidates = [
    path.resolve(process.cwd(), "vercel-ssr", "index.html"),
    path.resolve(process.cwd(), "dist", "public", "index.html"),
    path.resolve(process.cwd(), "public", "index.html"),
    path.resolve(import.meta.dirname, "index.html"),
    path.resolve(import.meta.dirname, "../..", "dist", "public", "index.html")
  ];
  const templatePath = templateCandidates.find((candidate) => fs.existsSync(candidate)) ?? templateCandidates[0];
  const serverEntryCandidates = [
    path.resolve(process.cwd(), "vercel-ssr", "server-ssr", "entry-server.js"),
    path.resolve(process.cwd(), "dist", "server-ssr", "entry-server.js"),
    path.resolve(import.meta.dirname, "server-ssr", "entry-server.js"),
    path.resolve(import.meta.dirname, "../..", "dist", "server-ssr", "entry-server.js")
  ];
  const serverEntryPath = serverEntryCandidates.find((candidate) => fs.existsSync(candidate)) ?? serverEntryCandidates[0];
  app2.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const { render } = await import(serverEntryPath);
      const prefetch = await buildSsrPrefetch(req, res);
      const { html, dehydratedState, head } = await render(req.originalUrl, prefetch);
      res.status(head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, html, head, dehydratedState));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const fallback = buildHeadTags({ title: SITE_NAME, description: DEFAULT_DESCRIPTION });
      res.status(200).set("Cache-Control", "no-cache").type("html").end(template.replace("<!--app-head-->", () => fallback).replace("<!--app-html-->", () => ""));
    }
  });
}

// vercel/query.ts
function installVercelQuery(req) {
  const query = /* @__PURE__ */ Object.create(null);
  const requestUrl = new URL(req.url || "/", "http://casinoverse.internal");
  for (const [key, value] of requestUrl.searchParams) {
    const current = query[key];
    if (current === void 0) query[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else query[key] = [current, value];
  }
  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: query
  });
}

// vercel/entry.ts
var app = createCasinoVerseApp();
var ready = null;
function ensureReady() {
  ready ??= serveStatic(app);
  return ready;
}
async function handler(req, res) {
  installVercelQuery(req);
  await ensureReady();
  return app(req, res);
}
export {
  handler as default
};
