"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { PlusCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/useDebounce";
import { CartItem } from "@/lib/cartStore";
import { trpc } from "@/lib/trpc/client";

type Step = "provider" | "region" | "resource";

interface AddResourceButtonProps {
  onResourceSelect: (
    resource: Omit<CartItem, "id" | "usage"> & {
      usage: { unit: string; quantity: number };
    },
  ) => void;
}

export default function AddResourceButton({
  onResourceSelect,
}: AddResourceButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("provider");

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedResourceType, setSelectedResourceType] = useState<
    string | null
  >(null);
  const [usage, setUsage] = useState({ unit: "Hrs", quantity: 1 });

  const providersQuery = trpc.getProviders.useQuery(undefined, {
    enabled: open,
  });
  const regionsQuery = trpc.getRegions.useQuery(
    { provider: selectedProvider! },
    { enabled: !!selectedProvider },
  );
  const resourcesQuery = trpc.getResourceTypes.useQuery(
    {
      provider: selectedProvider!,
      region: selectedRegion!,
      query: debouncedQuery,
    },
    { enabled: !!selectedProvider && !!selectedRegion },
  );

  const isLoading =
    providersQuery.isLoading ||
    regionsQuery.isLoading ||
    resourcesQuery.isFetching;

  useEffect(() => {
    if (providersQuery.error) toast.error("Could not load providers.");
    if (regionsQuery.error) toast.error("Could not load regions.");
    if (resourcesQuery.error) toast.error("Could not load resources.");
  }, [providersQuery.error, regionsQuery.error, resourcesQuery.error]);

  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    setStep("region");
  };

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    setStep("resource");
  };

  const handleSelectResource = (resourceType: string) => {
    setSelectedResourceType(resourceType);
  };

  const handleAdd = () => {
    if (!selectedProvider || !selectedRegion || !selectedResourceType) return;
    onResourceSelect({
      provider: selectedProvider,
      region: selectedRegion,
      resourceType: selectedResourceType,
      usage,
    });
    reset();
  };

  const reset = () => {
    setOpen(false);
    setStep("provider");
    setSelectedProvider(null);
    setSelectedRegion(null);
    setSearchQuery("");
    setSelectedResourceType(null);
    setUsage({ unit: "Hrs", quantity: 1 });
  };

  const handleBack = () => {
    if (step === "resource") {
      setStep("region");
      setSelectedResourceType(null);
      setSearchQuery("");
    } else if (step === "region") {
      setStep("provider");
      setSelectedProvider(null);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "provider":
        return "Select a Provider";
      case "region":
        return `Select a Region for ${selectedProvider}`;
      case "resource":
        return `Find a Resource in ${selectedRegion}`;
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
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-300 sm:max-w-md">
        <DialogHeader className="flex flex-row items-center">
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
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isLoading && <Loader2 className="mx-auto animate-spin" />}

          {!isLoading && step === "provider" && (
            <div className="grid grid-cols-3 gap-4">
              {providersQuery.data?.map((p) => (
                <Button key={p} onClick={() => handleSelectProvider(p)}>
                  {p.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {!isLoading && step === "region" && (
            <div className="flex flex-col gap-2">
              {regionsQuery.data?.sort().map((r) => (
                <Button
                  key={r}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleSelectRegion(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          )}

          {!isLoading && step === "resource" && (
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Search for a resource (e.g., t2.micro)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                {resourcesQuery.data?.map((rt) => (
                  <Button
                    key={rt}
                    variant={
                      selectedResourceType === rt ? "secondary" : "ghost"
                    }
                    className="justify-start"
                    onClick={() => handleSelectResource(rt)}
                  >
                    {rt}
                  </Button>
                ))}
              </div>

              {selectedResourceType && (
                <div className="mt-4 p-4 border border-zinc-700 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Set Usage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Unit (e.g., Hrs)"
                      value={usage.unit}
                      onChange={(e) =>
                        setUsage({ ...usage, unit: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={usage.quantity}
                      onChange={(e) =>
                        setUsage({
                          ...usage,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleAdd} className="w-full mt-4">
                    Add to Estimate
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
