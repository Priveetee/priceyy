"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PackageOpen } from "lucide-react";
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
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (isError || !options) {
    return (
      <div className="text-red-400 p-4">Error fetching pricing options.</div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="text-zinc-500 p-4">
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
        <Label className="text-sm text-zinc-400">Pricing Option</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => (
            <Button
              key={`${opt.priceModel}-${opt.unitOfMeasure}`}
              variant="outline"
              className={cn(
                "h-auto flex flex-col items-start p-2 text-left",
                usageInfo.selectedOption?.priceModel === opt.priceModel &&
                  usageInfo.selectedOption?.unitOfMeasure === opt.unitOfMeasure
                  ? "border-green-500 bg-green-900/20"
                  : "border-zinc-700 bg-zinc-950",
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
        <div className="grid grid-cols-2 gap-4 items-center">
          {isUsageInputVisible && (
            <div className="space-y-1">
              <Label className="text-sm text-zinc-400">Usage</Label>
              <Input
                type="number"
                value={usageInfo.usageQuantity}
                onChange={(e) =>
                  updateUsage({
                    usageQuantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="bg-black border-zinc-700"
              />
            </div>
          )}
          <div
            className="space-y-1"
            style={{ gridColumn: isUsageInputVisible ? "span 1" : "span 2" }}
          >
            <Label className="text-sm text-zinc-400">
              {isFixedUnit(usageInfo.selectedOption.unitOfMeasure)
                ? "Quantity"
                : "Instances"}
            </Label>
            <Input
              type="number"
              value={usageInfo.count}
              onChange={(e) =>
                updateUsage({ count: parseInt(e.target.value, 10) || 1 })
              }
              className="bg-black border-zinc-700"
            />
          </div>
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
      <ScrollArea className="flex-1 min-h-0 rounded-md border border-zinc-800 bg-zinc-950 p-2">
        {resources.length > 0 ? (
          <div className="flex flex-col gap-4 pr-2">
            {resources.map((r) => (
              <div
                key={r}
                className="p-4 border-2 border-zinc-800 bg-zinc-900 rounded-lg"
              >
                <p className="text-sm font-medium text-white mb-3">{r}</p>
                <ResourceUsageEditor
                  provider={provider}
                  region={region}
                  resourceType={r}
                  onUsageChange={(usage) => handleUsageChange(r, usage)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <PackageOpen />
              </EmptyMedia>
              <EmptyTitle>No resources selected</EmptyTitle>
              <EmptyDescription>
                Go back to select some resources first.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
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
