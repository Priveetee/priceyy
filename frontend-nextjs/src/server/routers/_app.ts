import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { chatRouter } from "./chat";

const API_BASE_URL =
  process.env.INTERNAL_API_URL || "https://priceyy.eltux.fr/";

export const appRouter = router({
  // Chat AI routes
  chat: chatRouter,

  // Existing Go API routes
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
      }&region=${encodeURIComponent(input.region)}&q=${encodeURIComponent(
        input.query,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json() as Promise<string[]>;
    }),

  getResourceOptions: publicProcedure
    .input(
      z.object({
        provider: z.string(),
        region: z.string(),
        resourceType: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const url = `${API_BASE_URL}/resource-options?provider=${
        input.provider
      }&region=${encodeURIComponent(input.region)}&resourceType=${encodeURIComponent(
        input.resourceType,
      )}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Failed to fetch resource options:", await res.text());
        throw new Error("Failed to fetch resource options");
      }
      return res.json() as Promise<
        {
          priceModel: string;
          unitOfMeasure: string;
          pricePerUnit: number;
        }[]
      >;
    }),

  calculate: publicProcedure
    .input(
      z.array(
        z.object({
          provider: z.string(),
          region: z.string(),
          resourceType: z.string(),
          priceModel: z.string(),
          unitOfMeasure: z.string(),
          usageQuantity: z.number(),
          count: z.number(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const servicesForApi = input.map((item) => ({
        provider: item.provider,
        region: item.region,
        resourceType: item.resourceType,
        priceModel: item.priceModel,
        unitOfMeasure: item.unitOfMeasure,
        quantity: item.usageQuantity * item.count,
      }));

      const body = { services: servicesForApi };
      const res = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Calculation failed");
      }
      return res.json();
    }),
});

export type AppRouter = typeof appRouter;
