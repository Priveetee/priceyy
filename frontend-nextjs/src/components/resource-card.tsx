"use client";

import { useCartStore, CartItem } from "@/lib/cartStore";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "./quantity-input";

interface ResourceCardProps {
  resource: CartItem;
}

const PRESET_USAGE_QUANTITIES = [1, 8, 24, 730];
const PRESET_INSTANCE_QUANTITIES = [1, 2, 4, 8];

const isFixedUnit = (unit: string) => unit === "1";

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { removeFromCart, updateItem } = useCartStore();

  const isFixed = isFixedUnit(resource.unitOfMeasure);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col gap-4 shadow-lg hover:border-zinc-700"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 pr-2">
          <p className="font-semibold text-zinc-200">{resource.resourceType}</p>
          <p className="text-sm text-zinc-500">
            {resource.provider} - {resource.region}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-400 flex-shrink-0"
          onClick={() => removeFromCart(resource.id)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 bg-zinc-950/50 p-3 rounded-md border border-zinc-800">
        <QuantityInput
          label={isFixed ? "Quantity" : "Instances"}
          value={resource.count}
          onChange={(count) => updateItem(resource.id, { count })}
          presets={PRESET_INSTANCE_QUANTITIES}
        />

        {!isFixed && (
          <QuantityInput
            label={`Usage (${resource.unitOfMeasure})`}
            value={resource.usageQuantity}
            onChange={(usageQuantity) =>
              updateItem(resource.id, { usageQuantity })
            }
            presets={PRESET_USAGE_QUANTITIES}
          />
        )}
      </div>
      <div className="flex justify-end">
        <div className="px-2 py-0.5 bg-zinc-700/50 text-xs text-zinc-300 rounded-md">
          {resource.priceModel}
        </div>
      </div>
    </motion.div>
  );
}
