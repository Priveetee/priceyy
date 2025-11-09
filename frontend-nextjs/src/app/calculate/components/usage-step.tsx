"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import { QuantityInput } from "@/components/quantity-input";
import { cn } from "@/lib/utils";

interface ResourceOption {
  priceModel: string;
  unitOfMeasure: string;
  pricePerUnit: number;
}

interface UsageInfo {
  selectedOption: ResourceOption | null;
  usageQuantity: number;
  count: number;
}

interface UsageStepProps {
  provider: string;
  region: string;
  resources: string[];
  onComplete: (usages: Record<string, UsageInfo>) => void;
}

const PRESET_USAGE_QUANTITIES = [1, 8, 24, 730];
const PRESET_INSTANCE_QUANTITIES = [1, 2, 4, 8];

const isFixedUnit = (unit: string) => unit === "1";

function ResourceUsageEditor({
  provider,
  region,
  resourceType,
  onUsageChange,
}: {
  provider: string;
  region: string;
  resourceType: string;
  onUsageChange: (usage: UsageInfo) => void;
}) {
  const {
    data: options,
    isLoading,
    isError,
  } = trpc.getResourceOptions.useQuery({ provider, region, resourceType });

  const [usageInfo, setUsageInfo] = useState<UsageInfo>({
    selectedOption: null,
    usageQuantity: 1,
    count: 1,
  });

  const updateUsage = (update: Partial<UsageInfo>) => {
    const newUsage = { ...usageInfo, ...update };
    setUsageInfo(newUsage);
    onUsageChange(newUsage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (isError || !options || options.length === 0) {
    return (
      <div className="text-zinc-500 p-4 text-center">
        No pricing options available for this resource.
      </div>
    );
  }

  const isUsageInputVisible =
    usageInfo.selectedOption &&
    !isFixedUnit(usageInfo.selectedOption.unitOfMeasure);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-zinc-400">Pricing Option</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => (
            <Button
              key={`${opt.priceModel}-${opt.unitOfMeasure}`}
              variant="outline"
              className={cn(
                "h-auto flex flex-col items-start p-2 text-left bg-zinc-950/50 hover:bg-zinc-800/50",
                usageInfo.selectedOption?.priceModel === opt.priceModel &&
                  usageInfo.selectedOption?.unitOfMeasure === opt.unitOfMeasure
                  ? "border-green-500 bg-green-900/30"
                  : "border-zinc-700",
              )}
              onClick={() => updateUsage({ selectedOption: opt })}
            >
              <span className="font-semibold text-zinc-200">
                {opt.priceModel}
              </span>
              <span className="text-xs text-zinc-400">
                ${opt.pricePerUnit.toFixed(4)} / {opt.unitOfMeasure}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {usageInfo.selectedOption && (
        <div className="flex flex-col gap-3 rounded-md bg-zinc-950/50 p-3 border border-zinc-800">
          <QuantityInput
            label={
              isFixedUnit(usageInfo.selectedOption.unitOfMeasure)
                ? "Quantity"
                : "Instances"
            }
            value={usageInfo.count}
            onChange={(count) => updateUsage({ count })}
            presets={PRESET_INSTANCE_QUANTITIES}
          />

          {isUsageInputVisible && (
            <QuantityInput
              label={`Usage (${usageInfo.selectedOption.unitOfMeasure})`}
              value={usageInfo.usageQuantity}
              onChange={(usageQuantity) => updateUsage({ usageQuantity })}
              presets={PRESET_USAGE_QUANTITIES}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function UsageStep({
  provider,
  region,
  resources,
  onComplete,
}: UsageStepProps) {
  const [allUsages, setAllUsages] = useState<Record<string, UsageInfo>>({});

  const handleUsageChange = (resourceType: string, usage: UsageInfo) => {
    setAllUsages((prev) => ({ ...prev, [resourceType]: usage }));
  };

  const isComplete = resources.every(
    (r) =>
      allUsages[r]?.selectedOption &&
      allUsages[r]?.usageQuantity > 0 &&
      allUsages[r]?.count > 0,
  );

  return (
    <motion.div
      key="usage"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col h-[450px] gap-4"
    >
      <ScrollArea className="flex-1 min-h-0 -mr-2 pr-2">
        <div className="flex flex-col gap-4 pr-2">
          {resources.map((r) => (
            <div
              key={r}
              className="p-4 border border-zinc-800 bg-zinc-900/70 rounded-lg"
            >
              <p className="text-base font-semibold text-white mb-3">{r}</p>
              <ResourceUsageEditor
                provider={provider}
                region={region}
                resourceType={r}
                onUsageChange={(usage) => handleUsageChange(r, usage)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button
        onClick={() => onComplete(allUsages)}
        disabled={!isComplete}
        className="mt-auto bg-green-600 text-white hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
      >
        Add to Estimate
      </Button>
    </motion.div>
  );
}
