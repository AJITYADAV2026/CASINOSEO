import { and, desc, eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  dailyDigests,
  digestStories,
  InsertUser,
  siteFindReports,
  stories,
  storySources,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

const publicStoryStatuses = ["published", "developing"] as const;

export async function getHomepageContent() {
  const db = await getDb();
  if (!db) return { categories: [], stories: [], digests: [] };

  const [categoryRows, storyRows, digestRows] = await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db
      .select({ story: stories, category: categories })
      .from(stories)
      .innerJoin(categories, eq(stories.categoryId, categories.id))
      .where(inArray(stories.status, publicStoryStatuses))
      .orderBy(desc(stories.publishedAt)),
    db
      .select()
      .from(dailyDigests)
      .where(inArray(dailyDigests.status, ["published", "developing"]))
      .orderBy(desc(dailyDigests.digestDate))
      .limit(8),
  ]);

  return { categories: categoryRows, stories: storyRows, digests: digestRows };
}

export async function getStoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select({ story: stories, category: categories })
    .from(stories)
    .innerJoin(categories, eq(stories.categoryId, categories.id))
    .where(and(eq(stories.slug, slug), inArray(stories.status, publicStoryStatuses)))
    .limit(1);

  if (!rows[0]) return undefined;
  const sources = await db
    .select()
    .from(storySources)
    .where(eq(storySources.storyId, rows[0].story.id))
    .orderBy(storySources.id);

  return { ...rows[0], sources };
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const categoryRows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  if (!categoryRows[0]) return undefined;

  const storyRows = await db
    .select({ story: stories, category: categories })
    .from(stories)
    .innerJoin(categories, eq(stories.categoryId, categories.id))
    .where(
      and(
        eq(stories.categoryId, categoryRows[0].id),
        inArray(stories.status, publicStoryStatuses),
      ),
    )
    .orderBy(desc(stories.publishedAt));

  return { category: categoryRows[0], stories: storyRows };
}

export async function getArchive() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyDigests)
    .where(inArray(dailyDigests.status, ["published", "developing", "archived"]))
    .orderBy(desc(dailyDigests.digestDate));
}

export async function getDigestByDate(digestDate: string) {
  const db = await getDb();
  if (!db) return undefined;

  const digestRows = await db
    .select()
    .from(dailyDigests)
    .where(eq(dailyDigests.digestDate, digestDate))
    .limit(1);
  if (!digestRows[0]) return undefined;

  const storyRows = await db
    .select({ story: stories, category: categories, position: digestStories.position })
    .from(digestStories)
    .innerJoin(stories, eq(digestStories.storyId, stories.id))
    .innerJoin(categories, eq(stories.categoryId, categories.id))
    .where(eq(digestStories.digestId, digestRows[0].id))
    .orderBy(digestStories.position);

  return { digest: digestRows[0], stories: storyRows };
}

export async function searchStories(query: string) {
  const db = await getDb();
  if (!db || query.trim().length < 2) return [];
  const term = `%${query.trim()}%`;
  return db
    .select({ story: stories, category: categories })
    .from(stories)
    .innerJoin(categories, eq(stories.categoryId, categories.id))
    .where(
      and(
        inArray(stories.status, publicStoryStatuses),
        or(like(stories.title, term), like(stories.dek, term), like(stories.body, term)),
      ),
    )
    .orderBy(desc(stories.publishedAt))
    .limit(24);
}

export function selectLatestAnalyzableDigest<T extends { digestDate: string; status: string; markdownArtifact: string | null; updatedAt: Date }>(rows: T[], includeDeveloping = false) {
  const allowed = includeDeveloping ? new Set(["published", "developing"]) : new Set(["published"]);
  return [...rows]
    .filter(row => allowed.has(row.status) && Boolean(row.markdownArtifact?.trim()))
    .sort((left, right) => right.digestDate.localeCompare(left.digestDate) || right.updatedAt.getTime() - left.updatedAt.getTime())[0];
}

export async function getLatestDigestForAnalysis(includeDeveloping = false) {
  const db = await getDb();
  if (!db) return undefined;
  const allowedStatuses = includeDeveloping ? ["published", "developing"] as const : ["published"] as const;
  const rows = await db
    .select()
    .from(dailyDigests)
    .where(inArray(dailyDigests.status, allowedStatuses))
    .orderBy(desc(dailyDigests.digestDate), desc(dailyDigests.updatedAt))
    .limit(20);
  return selectLatestAnalyzableDigest(rows, includeDeveloping);
}

export async function getStoryCatalogForAnalysis() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: stories.id,
      slug: stories.slug,
      title: stories.title,
      dek: stories.dek,
      status: stories.status,
      contentType: stories.contentType,
      categorySlug: categories.slug,
      categoryName: categories.name,
      publishedAt: stories.publishedAt,
      modifiedAt: stories.modifiedAt,
    })
    .from(stories)
    .innerJoin(categories, eq(stories.categoryId, categories.id))
    .orderBy(desc(stories.publishedAt));
}

export async function getSiteFindReportByDate(reportDate: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(siteFindReports).where(eq(siteFindReports.reportDate, reportDate)).limit(1);
  return rows[0];
}

export async function getLatestSiteFindReport() {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(siteFindReports).orderBy(desc(siteFindReports.reportDate)).limit(1);
  return rows[0];
}
