import { z } from "zod";
import {
  getArchive,
  getCategoryBySlug,
  getDigestByDate,
  getHomepageContent,
  getStoryBySlug,
  searchStories,
  submitEditorialInquiry,
  subscribeToEditorialBriefing,
} from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const editorialRouter = router({
  homepage: publicProcedure.query(() => getHomepageContent()),
  storyBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(({ input }) => getStoryBySlug(input.slug)),
  categoryBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(96) }))
    .query(({ input }) => getCategoryBySlug(input.slug)),
  archive: publicProcedure.query(() => getArchive()),
  digestByDate: publicProcedure
    .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(({ input }) => getDigestByDate(input.date)),
  search: publicProcedure
    .input(z.object({ query: z.string().trim().min(2).max(120) }))
    .query(({ input }) => searchStories(input.query)),
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().trim().email().max(320),
      consent: z.literal(true),
    }))
    .mutation(({ input }) => subscribeToEditorialBriefing(input.email)),
  contact: publicProcedure
    .input(z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(320),
      topic: z.enum(["correction", "privacy", "newsletter", "general"]),
      message: z.string().trim().min(30).max(4000),
      consent: z.literal(true),
      website: z.string().max(0).optional().default(""),
    }))
    .mutation(({ input }) => submitEditorialInquiry(input)),
});
