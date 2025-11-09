"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/lib/cartStore";
import { AnimatePresence } from "framer-motion";
import { ProviderStep } from "@/app/calculate/components/provider-step";
import { RegionStep } from "@/app/calculate/components/region-step";
import { ResourceStep } from "@/app/calculate/components/resource-step";
import { UsageStep } from "@/app/calculate/components/usage-step";

type Step = "provider" | "region" | "resource" | "usage";

export default function AddResourceButton({
  onResourceSelect,
}: {
  onResourceSelect: (resource: CartItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("provider");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const reset = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("provider");
      setSelectedProvider(null);
      setSelectedRegion(null);
      setSelectedResources([]);
    }, 300);
  };

  const handleBack = () => {
    if (step === "usage") setStep("resource");
    if (step === "resource") setStep("region");
    if (step === "region") setStep("provider");
  };

  const onProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setStep("region");
  };

  const onRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setStep("resource");
  };

  const onResourcesSelect = (resources: string[]) => {
    setSelectedResources(resources);
    setStep("usage");
  };

  const onUsagesComplete = (
    usages: Record<string, { unit: string; quantity: number; count: number }>,
  ) => {
    selectedResources.forEach((resourceType) => {
      const usageInfo = usages[resourceType];
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        provider: selectedProvider!,
        region: selectedRegion!,
        resourceType,
        usage: { [usageInfo.unit]: usageInfo.quantity },
        count: usageInfo.count,
      };
      onResourceSelect(cartItem);
    });
    toast.success(`${selectedResources.length} resource(s) added to estimate.`);
    reset();
  };

  const getTitle = () => {
    switch (step) {
      case "provider":
        return "Select Provider";
      case "region":
        return `Select Region`;
      case "resource":
        return `Select Resources`;
      case "usage":
        return "Set Usage";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : reset())}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-300 sm:max-w-lg p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center">
            {step !== "provider" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="p-0">
          <AnimatePresence mode="wait">
            {step === "provider" && (
              <ProviderStep onSelect={onProviderSelect} />
            )}
            {step === "region" && selectedProvider && (
              <RegionStep
                provider={selectedProvider}
                onSelect={onRegionSelect}
              />
            )}
            {step === "resource" && selectedProvider && selectedRegion && (
              <ResourceStep
                provider={selectedProvider}
                region={selectedRegion}
                onSelect={onResourcesSelect}
              />
            )}
            {step === "usage" && selectedProvider && (
              <UsageStep
                provider={selectedProvider}
                resources={selectedResources}
                onComplete={onUsagesComplete}
              />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
