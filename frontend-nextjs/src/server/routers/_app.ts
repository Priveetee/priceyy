import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const API_BASE_URL = "http://localhost:8083";

export const appRouter = router({
  getProviders: publicProcedure.query(async () => {
    const res = await fetch(`${API_BASE_URL}/providers`);
    if (!res.ok) throw new Error("Failed to fetch providers");
    return res.json() as Promise<string[]>;
  }),

  getRegions: publicProcedure
    .input(z.object({ provider: z.string() }))
    .query(async ({ input }) => {
      const res = await fetch(
        `${API_BASE_URL}/regions?provider=${input.provider}`,
      );
      if (!res.ok) throw new Error("Failed to fetch regions");
      return res.json() as Promise<string[]>;
    }),

  getResourceTypes: publicProcedure
    .input(
      z.object({
        provider: z.string(),
        region: z.string(),
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const url = `${API_BASE_URL}/resources?provider=${
        input.provider
      }&region=${encodeURIComponent(input.region)}&q=${input.query}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json() as Promise<string[]>;
    }),

  calculate: publicProcedure
    .input(
      z.array(
        z.object({
          provider: z.string(),
          region: z.string(),
          resourceType: z.string(),
          usage: z.record(z.string(), z.number()),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const res = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: input }),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || "Calculation failed");
      }
      return res.json();
    }),
});

export type AppRouter = typeof appRouter;
