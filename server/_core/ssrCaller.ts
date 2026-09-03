import type { Request, Response } from "express";
import type { SsrPrefetch } from "../../client/src/ssr/prefetch";
import { appRouter } from "../routers";
import { createContext } from "./context";

export async function buildSsrPrefetch(req: Request, res: Response): Promise<SsrPrefetch> {
  const ctx = await createContext({ req, res } as never);
  const caller = appRouter.createCaller(ctx);
  return {
    homepage: () => caller.editorial.homepage(),
    storyBySlug: slug => caller.editorial.storyBySlug({ slug }),
    categoryBySlug: slug => caller.editorial.categoryBySlug({ slug }),
    archive: () => caller.editorial.archive(),
    digestByDate: date => caller.editorial.digestByDate({ date }),
    search: query => caller.editorial.search({ query }),
    sources: () => caller.editorial.sources(),
    sourceBySlug: slug => caller.editorial.sourceBySlug({ slug }),
    storySourceById: id => caller.editorial.storySourceById({ id }),
    support: () => caller.editorial.support(),
  };
}
