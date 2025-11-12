import { trpc } from "@/lib/trpc/client";
import { useCartStore } from "@/lib/cartStore";

export function useToolExecutor() {
  const { addToCart } = useCartStore();

  const cleanAndParseJSON = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch (firstError) {
      let cleaned = jsonString;

      cleaned = cleaned.replace(
        /,\s*"quantity":\s*1,\s*"unitOfMeasure":\s*"hour",\s*"resourceType":\s*"[^"]+",\s*"usage":\s*\d+,\s*"pricePerUnit":\s*[\d.]+,\s*"region":\s*"[^"]+",\s*"provider":\s*"[^"]+"}\s*{/g,
        ", ",
      );
      cleaned = cleaned.replace(/}\s*{/g, ", ");
      cleaned = cleaned.replace(/"([^"]+)"\s*,\s*"/g, '"$1", "');
      cleaned = cleaned.replace(/,\s*}/g, "}");
      cleaned = cleaned.replace(/,\s*]/g, "]");
      cleaned = cleaned.replace(/"(\w+)":\s*"([^"]*),\s*"/g, '"$1": "$2", "');

      try {
        return JSON.parse(cleaned);
      } catch (secondError) {
        const priceModelMatch = cleaned.match(/"priceModel":\s*"([^"]+)"/);
        const quantityMatch = cleaned.match(/"quantity":\s*(\d+)/);
        const unitMatch = cleaned.match(/"unitOfMeasure":\s*"([^"]+)"/);
        const resourceMatch = cleaned.match(/"resourceType":\s*"([^"]+)"/);
        const usageMatch = cleaned.match(/"usage":\s*(\d+)/);
        const priceMatch = cleaned.match(/"pricePerUnit":\s*([\d.]+)/);
        const regionMatch = cleaned.match(/"region":\s*"([^"]+)"/);
        const providerMatch = cleaned.match(/"provider":\s*"([^"]+)"/);

        if (priceModelMatch || quantityMatch || resourceMatch) {
          return {
            ...(priceModelMatch && { priceModel: priceModelMatch[1] }),
            ...(quantityMatch && { quantity: parseInt(quantityMatch[1]) }),
            ...(unitMatch && { unitOfMeasure: unitMatch[1] }),
            ...(resourceMatch && { resourceType: resourceMatch[1] }),
            ...(usageMatch && { usage: parseInt(usageMatch[1]) }),
            ...(priceMatch && { pricePerUnit: parseFloat(priceMatch[1]) }),
            ...(regionMatch && { region: regionMatch[1] }),
            ...(providerMatch && { provider: providerMatch[1] }),
          };
        }

        throw secondError;
      }
    }
  };

  const executeToolCall = async (toolName: string, argsStr: string) => {
    try {
      const args = cleanAndParseJSON(argsStr);

      switch (toolName) {
        case "get_providers": {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "https://priceyy.eltux.fr/";
          const res = await fetch(`${API_BASE_URL}/providers`);
          if (!res.ok) throw new Error("Failed to fetch providers");
          const providers = await res.json();
          return {
            success: true,
            data: providers,
          };
        }

        case "get_regions": {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "https://priceyy.eltux.fr/";
          const res = await fetch(
            `${API_BASE_URL}/regions?provider=${args.provider}`,
          );
          if (!res.ok) throw new Error("Failed to fetch regions");
          const regions = await res.json();
          return {
            success: true,
            data: regions,
          };
        }

        case "search_resources": {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "https://priceyy.eltux.fr/";
          const url = `${API_BASE_URL}/resources?provider=${args.provider}&region=${encodeURIComponent(args.region)}&q=${encodeURIComponent(args.query || "")}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch resources");
          const resources = await res.json();
          return {
            success: true,
            data: resources,
          };
        }

        case "get_pricing_options": {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "https://priceyy.eltux.fr/";
          const url = `${API_BASE_URL}/resource-options?provider=${args.provider}&region=${encodeURIComponent(args.region)}&resourceType=${encodeURIComponent(args.resourceType)}`;
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error("Failed to fetch resource options");
          }
          const options = await res.json();
          return {
            success: true,
            data: options,
          };
        }

        case "add_to_cart": {
          const cartItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            provider: args.provider,
            region: args.region,
            resourceType: args.resourceType,
            priceModel: args.priceModel,
            unitOfMeasure: args.unitOfMeasure || "hour",
            pricePerUnit: args.pricePerUnit,
            usageQuantity: args.usage || 1,
            count: args.quantity || 1,
            estimatedCost:
              args.pricePerUnit * (args.usage || 1) * (args.quantity || 1),
          };
          addToCart(cartItem);
          return {
            success: true,
            data: {
              itemId: cartItem.id,
              message: "Item added to cart successfully",
            },
          };
        }

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Tool execution failed",
      };
    }
  };

  return { executeToolCall };
}
