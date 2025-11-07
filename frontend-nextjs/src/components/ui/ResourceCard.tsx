"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { useCartStore, CartItem } from "@/lib/cartStore";
import { Input } from "./input";
import AwsLogo from "../icons/AwsLogo";
import AzureLogo from "../icons/AzureLogo";

interface ResourceCardProps {
  resource: CartItem;
}

const ProviderIcon = ({ provider }: { provider: string }) => {
  switch (provider.toLowerCase()) {
    case "aws":
      return <AwsLogo className="h-5 w-5" />;
    case "azure":
      return <AzureLogo className="h-5 w-5" />;
    case "gcp":
      return <span className="text-blue-500 font-bold">GCP</span>;
    default:
      return null;
  }
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  const { removeFromCart, updateUsage } = useCartStore();

  const unit = Object.keys(resource.usage)[0] || "N/A";
  const quantity = resource.usage[unit] || 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      updateUsage(resource.id, { [unit]: newQuantity });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-lg flex flex-col justify-between gap-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-white font-medium break-all">
            {resource.resourceType}
          </p>
          <div className="flex items-center gap-2 text-zinc-400 text-sm mt-1">
            <ProviderIcon provider={resource.provider} />
            <span>{resource.region}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(resource.id)}
          className="absolute top-2 right-2 text-zinc-500 hover:text-white"
          aria-label={`Remove ${resource.resourceType}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseFloat(e.target.value))}
          className="bg-zinc-800 border-zinc-700 text-white w-24"
        />
        <span className="text-zinc-400 text-sm whitespace-nowrap">{unit}</span>
      </div>
    </motion.div>
  );
}
