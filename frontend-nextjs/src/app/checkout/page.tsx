"use client";

import { useState } from "react";
import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { motion } from "framer-motion";
import {
  Trash2,
  Calculator,
  ArrowLeft,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PackageOpen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useHydration } from "@/lib/use-hydration";
import { Label } from "@/components/ui/label";

const PRESET_QUANTITIES = [1, 8, 24, 730];

const isFixedUnit = (unit: string) => unit === "1";

export default function CheckoutPage() {
  const { items, removeFromCart, updateItem } = useCartStore();
  const isHydrated = useHydration();
  const [customQuantities, setCustomQuantities] = useState<
    Record<string, boolean>
  >({});

  const handleUsageQuantitySelect = (itemId: string, quantity: number) => {
    updateItem(itemId, { usageQuantity: quantity });
    setCustomQuantities((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleCustomUsageQuantityChange = (itemId: string, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    updateItem(itemId, { usageQuantity: isNaN(numValue) ? 0 : numValue });
  };

  const handleCountChange = (itemId: string, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    updateItem(itemId, { count: isNaN(numValue) ? 1 : numValue });
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#360707" noiseIntensity={0.4} scale={1.2} speed={1.5} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <Link href="/calculate" passHref>
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to selection
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Review Your Estimate
            </h1>
            <p className="text-zinc-400 mt-1">
              Confirm your resources before calculating the final cost.
            </p>
          </div>

          {!isHydrated ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Spinner className="h-12 w-12 text-zinc-500" />
            </div>
          ) : items.length === 0 ? (
            <Empty className="border-2 border-dashed border-zinc-700 bg-transparent min-h-[400px]">
              <EmptyHeader>
                <EmptyMedia>
                  <PackageOpen className="h-16 w-16 text-zinc-500" />
                </EmptyMedia>
                <EmptyTitle className="text-zinc-300">
                  Your Estimate is Empty
                </EmptyTitle>
                <EmptyDescription className="text-zinc-500">
                  Add some resources to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isFixed = isFixedUnit(item.unitOfMeasure);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg text-zinc-200 font-medium">
                          {item.resourceType}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {item.provider} - {item.region} - ({item.priceModel})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-end gap-3 pl-8">
                      <Label className="text-zinc-400 text-sm w-24 truncate text-right">
                        {isFixed ? "Quantity" : "Instances"}
                      </Label>
                      <Input
                        type="text"
                        pattern="[0-9]*"
                        value={item.count}
                        onChange={(e) =>
                          handleCountChange(item.id, e.target.value)
                        }
                        className="bg-zinc-950 border-zinc-700 text-zinc-200 w-24 h-9"
                      />
                    </div>

                    {!isFixed && (
                      <div className="flex items-center justify-end gap-3 pl-8">
                        <span className="text-zinc-400 text-sm w-24 truncate text-right">
                          Usage ({item.unitOfMeasure})
                        </span>
                        {customQuantities[item.id] ? (
                          <Input
                            type="text"
                            pattern="[0-9]*"
                            value={item.usageQuantity}
                            onChange={(e) =>
                              handleCustomUsageQuantityChange(
                                item.id,
                                e.target.value,
                              )
                            }
                            className="bg-zinc-950 border-zinc-700 text-zinc-200 w-24 h-9"
                          />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-between bg-zinc-950 border-zinc-700 hover:bg-zinc-800 text-zinc-200 w-24 h-9"
                              >
                                {item.usageQuantity}
                                <ChevronDown className="h-4 w-4 text-zinc-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                              {PRESET_QUANTITIES.map((q) => (
                                <DropdownMenuItem
                                  key={q}
                                  onSelect={() =>
                                    handleUsageQuantitySelect(item.id, q)
                                  }
                                >
                                  {q}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                onSelect={() =>
                                  setCustomQuantities((prev) => ({
                                    ...prev,
                                    [item.id]: true,
                                  }))
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Custom
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div className="flex justify-end pt-8">
                <Link href="/results" passHref>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Calculator className="mr-2 h-5 w-5" /> Calculate Total Cost
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
