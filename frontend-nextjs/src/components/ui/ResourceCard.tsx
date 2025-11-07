"use client";

import { motion } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import SimpleCounter from "./SimpleCounter";
import { Button } from "./button";

interface Resource {
  id: string;
  name: string;
  count: number;
}

interface ResourceCardProps {
  resource: Resource;
  onRemove: (id: string) => void;
  onCountChange: (id: string, newCount: number) => void;
  onAddToCart: (resource: Resource) => void;
}

export default function ResourceCard({
  resource,
  onRemove,
  onCountChange,
  onAddToCart,
}: ResourceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-lg flex flex-col justify-between items-center gap-6 min-h-[220px]"
    >
      <p className="text-white font-medium absolute top-4 left-6">
        {resource.name}
      </p>

      <div className="flex-grow flex items-center">
        <SimpleCounter
          value={resource.count}
          onValueChange={(newCount) => onCountChange(resource.id, newCount)}
        />
      </div>

      <Button
        onClick={() => onAddToCart(resource)}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Estimate
      </Button>

      <button
        onClick={() => onRemove(resource.id)}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        aria-label={`Remove ${resource.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
