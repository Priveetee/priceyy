"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ChevronDown, Pencil } from "lucide-react";

interface UsageStepProps {
  resources: string[];
  onComplete: (
    usages: Record<string, { unit: string; quantity: number }>,
  ) => void;
}

const PRESET_QUANTITIES = [1, 8, 24, 730];
const PRESET_UNITS = ["Hrs", "GB-Mo", "GiB-Mo", "Requests"];

export function UsageStep({ resources, onComplete }: UsageStepProps) {
  const [usages, setUsages] = useState<
    Record<string, { unit: string; quantity: number | null }>
  >({});
  const [customQuantity, setCustomQuantity] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const initialUsages: Record<
      string,
      { unit: string; quantity: number | null }
    > = {};
    resources.forEach((r) => {
      initialUsages[r] = { unit: "", quantity: null };
    });
    setUsages(initialUsages);
  }, [resources]);

  const handleUnitSelect = (resource: string, unit: string) => {
    setUsages((prev) => ({ ...prev, [resource]: { ...prev[resource], unit } }));
  };

  const handleQuantitySelect = (resource: string, quantity: number) => {
    setUsages((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], quantity },
    }));
    setCustomQuantity((prev) => ({ ...prev, [resource]: false }));
  };

  const handleCustomQuantityChange = (resource: string, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    setUsages((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        quantity: isNaN(numValue) ? null : numValue,
      },
    }));
  };

  const isComplete = resources.every(
    (r) =>
      usages[r]?.unit &&
      usages[r]?.quantity !== null &&
      usages[r]?.quantity! > 0,
  );

  return (
    <motion.div
      key="usage"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col h-[350px] gap-4"
    >
      <ScrollArea className="flex-1 min-h-0 rounded-md border border-zinc-800 bg-zinc-950 p-2">
        <div className="flex flex-col gap-4 pr-2">
          {resources.map((r) => (
            <div
              key={r}
              className="p-4 border-2 border-zinc-800 bg-zinc-900 rounded-lg"
            >
              <p className="text-sm font-medium text-white mb-3">{r}</p>
              <div className="grid grid-cols-2 gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-black border-zinc-700"
                    >
                      {usages[r]?.unit || "Select Unit"}
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black border-zinc-700 text-zinc-200">
                    {PRESET_UNITS.map((unit) => (
                      <DropdownMenuItem
                        key={unit}
                        onSelect={() => handleUnitSelect(r, unit)}
                      >
                        {unit}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {customQuantity[r] ? (
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    placeholder="Quantity"
                    value={usages[r]?.quantity || ""}
                    onChange={(e) =>
                      handleCustomQuantityChange(r, e.target.value)
                    }
                    className="bg-black border-zinc-700"
                  />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between bg-black border-zinc-700"
                      >
                        {usages[r]?.quantity || "Select Quantity"}
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black border-zinc-700 text-zinc-200">
                      {PRESET_QUANTITIES.map((q) => (
                        <DropdownMenuItem
                          key={q}
                          onSelect={() => handleQuantitySelect(r, q)}
                        >
                          {q}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onSelect={() =>
                          setCustomQuantity((prev) => ({ ...prev, [r]: true }))
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Custom
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button
        onClick={() =>
          onComplete(
            usages as Record<string, { unit: string; quantity: number }>,
          )
        }
        disabled={!isComplete}
        className="mt-auto bg-green-600 text-white hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
      >
        Add to Estimate
      </Button>
    </motion.div>
  );
}
