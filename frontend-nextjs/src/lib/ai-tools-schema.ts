import { z } from "zod";

export const addResourceToEstimateSchema = z.object({
  provider: z.enum(["aws", "azure", "gcp"]),
  region: z.string(),
  resourceType: z.string(),
  priceModel: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  usageQuantity: z.number(),
  count: z.number(),
});

export const removeFromCartSchema = z.object({
  itemId: z.string(),
});

export const updateCartItemSchema = z.object({
  itemId: z.string(),
  usageQuantity: z.number().optional(),
  count: z.number().optional(),
});

export const navigateToPageSchema = z.object({
  page: z.enum(["calculate", "checkout", "results", "home"]),
});

export const searchResourcesSchema = z.object({
  provider: z.enum(["aws", "azure", "gcp"]),
  region: z.string(),
  query: z.string(),
});

export const getResourceInfoSchema = z.object({
  provider: z.enum(["aws", "azure", "gcp"]),
  region: z.string(),
  resourceType: z.string(),
});
