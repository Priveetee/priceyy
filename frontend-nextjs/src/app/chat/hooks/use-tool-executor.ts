import { trpc } from "@/lib/trpc/client";
import { useCartStore } from "@/lib/cartStore";

export function useToolExecutor() {
  const trpcUtils = trpc.useUtils();
  const { addToCart } = useCartStore();

  const executeToolCall = async (toolName: string, argsStr: string) => {
    const args = JSON.parse(argsStr);

    switch (toolName) {
      case "get_providers":
        const providers = await trpcUtils.getProviders.fetch();
        return {
          success: true,
          data: providers,
        };

      case "get_regions":
        const regions = await trpcUtils.getRegions.fetch({
          provider: args.provider,
        });
        return {
          success: true,
          data: regions,
        };

      case "search_resources":
        const resources = await trpcUtils.getResourceTypes.fetch({
          provider: args.provider,
          region: args.region,
          query: args.query || "",
        });
        return {
          success: true,
          data: resources,
        };

      case "get_pricing_options":
        const options = await trpcUtils.getResourceOptions.fetch({
          provider: args.provider,
          region: args.region,
          resourceType: args.resourceType,
        });
        return {
          success: true,
          data: options,
        };

      case "add_to_cart":
        const cartItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          provider: args.provider,
          region: args.region,
          resourceType: args.resourceType,
          priceModel: args.priceModel,
          unitOfMeasure: args.unitOfMeasure,
          pricePerUnit: args.pricePerUnit,
          usageQuantity: args.usage || 1,
          count: args.quantity,
          estimatedCost: args.pricePerUnit * (args.usage || 1) * args.quantity,
        };
        addToCart(cartItem);
        return {
          success: true,
          data: {
            itemId: cartItem.id,
            message: "Item added to cart successfully",
          },
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  };

  return { executeToolCall };
}
