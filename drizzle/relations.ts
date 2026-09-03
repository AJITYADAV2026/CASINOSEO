import { relations } from "drizzle-orm";
import { categories, dailyDigests, digestStories, stories, storySources } from "./schema";

export const categoryRelations = relations(categories, ({ many }) => ({
  stories: many(stories),
}));

export const storyRelations = relations(stories, ({ many, one }) => ({
  category: one(categories, {
    fields: [stories.categoryId],
    references: [categories.id],
  }),
  sources: many(storySources),
  digestMemberships: many(digestStories),
}));

export const storySourceRelations = relations(storySources, ({ one }) => ({
  story: one(stories, {
    fields: [storySources.storyId],
    references: [stories.id],
  }),
}));

export const dailyDigestRelations = relations(dailyDigests, ({ many }) => ({
  stories: many(digestStories),
}));

export const digestStoryRelations = relations(digestStories, ({ one }) => ({
  digest: one(dailyDigests, {
    fields: [digestStories.digestId],
    references: [dailyDigests.id],
  }),
  story: one(stories, {
    fields: [digestStories.storyId],
    references: [stories.id],
  }),
}));
