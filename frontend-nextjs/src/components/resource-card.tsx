"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useCartStore, CartItem } from "@/lib/cartStore";
import { Input } from "./ui/input";
import AwsLogo from "./icons/aws-logo";
import AzureLogo from "./icons/azure-logo";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

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
      return <span className="text-blue-500 font-bold text-sm">GCP</span>;
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
    >
      <Card className="relative bg-zinc-900/50 border-zinc-800 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(resource.id)}
          className="absolute top-2 right-2 text-zinc-500 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base break-all">
            <ProviderIcon provider={resource.provider} />
            {resource.resourceType}
          </CardTitle>
          <p className="text-xs text-zinc-400 pt-1">{resource.region}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseFloat(e.target.value))}
              className="bg-zinc-800 border-zinc-700 text-white w-24 h-9"
            />
            <span className="text-zinc-400 text-sm whitespace-nowrap">
              {unit}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
