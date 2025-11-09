import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const API_BASE_URL = process.env.INTERNAL_API_URL || "http://localhost:8083";

const isFixedPriceResource = (provider: string, resource: string): boolean => {
  if (provider === "azure") {
    return ["Shipping", "Fee", "Training", "Support", "Setup"].some((term) =>
      resource.includes(term),
    );
  }
  return false;
};

const getApiUnit = (
  provider: string,
  resource: string,
  frontendUnit: string,
): string => {
  if (isFixedPriceResource(provider, resource)) {
    return "1";
  }
  const MAPPING: Record<string, Record<string, string>> = {
    gcp: { Hrs: "h" },
    azure: { Hrs: "1 Hour" },
    aws: { Hrs: "hours" },
  };
  return MAPPING[provider]?.[frontendUnit] || frontendUnit.toLowerCase();
};

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
          count: z.number(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      console.log("[trpc-router] 'calculate' received input:", input);

      const servicesForApi = input.map((item) => {
        const [frontendUnit, quantity] = Object.entries(item.usage)[0];
        const apiUnit = getApiUnit(
          item.provider,
          item.resourceType,
          frontendUnit,
        );

        const totalQuantity = isFixedPriceResource(
          item.provider,
          item.resourceType,
        )
          ? item.count
          : quantity * item.count;

        return {
          provider: item.provider,
          region: item.region,
          resourceType: item.resourceType,
          usage: { [apiUnit]: totalQuantity },
        };
      });

      const body = { services: servicesForApi };
      console.log("[trpc-router] Sending this body to Go API:", body);

      const res = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("[trpc-router] Go API returned an error:", errorBody);
        throw new Error("Calculation failed");
      }

      const data = await res.json();
      console.log("[trpc-router] Go API returned success:", data);
      return data;
    }),
});

export type AppRouter = typeof appRouter;
