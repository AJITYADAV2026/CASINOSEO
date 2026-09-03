import { z } from "zod";
import {
  getArchive,
  getCategoryBySlug,
  getDigestByDate,
  getHomepageContent,
  getStoryBySlug,
  searchStories,
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
});
