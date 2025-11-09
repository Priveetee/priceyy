"use client";

import { motion } from "framer-motion";
import { useCartStore, CartItem } from "@/lib/cartStore";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface ResourceCardProps {
  resource: CartItem;
}

const isFixedUnit = (unit: string) => unit === "1";

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { removeFromCart } = useCartStore();

  const isFixed = isFixedUnit(resource.unitOfMeasure);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 shadow-lg"
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <div className="px-2 py-0.5 bg-zinc-700/50 text-zinc-300 rounded-md">
          {resource.priceModel}
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span>{isFixed ? "Quantity:" : "Instances:"}</span>
          <span className="font-bold text-zinc-200">{resource.count}</span>
        </div>
        {!isFixed && (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Usage:</span>
            <span className="font-bold text-zinc-200">
              {resource.usageQuantity} {resource.unitOfMeasure}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
