"use client";

import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { motion } from "framer-motion";
import { Calculator, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuantityInput } from "@/components/quantity-input";
import {
  ProviderIconMap,
  getRegionIcon,
} from "@/components/icons/provider-icons";

const PRESET_USAGE_QUANTITIES = [1, 8, 24, 730];
const PRESET_INSTANCE_QUANTITIES = [1, 2, 4, 8];

const isFixedUnit = (unit: string) => unit === "1";

export default function CheckoutPage() {
  const { items, removeFromCart, updateItem } = useCartStore();
  const isHydrated = useHydration();

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
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4"
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
            <>
              <ScrollArea className="h-[450px] rounded-lg border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="space-y-4">
                  {items.map((item) => {
                    const isFixed = isFixedUnit(item.unitOfMeasure);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/50 border border-zinc-700 rounded-lg p-4 flex flex-col gap-4 shadow-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-2 pr-2">
                            <p className="font-semibold text-white">
                              {item.resourceType}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              {ProviderIconMap[item.provider.toLowerCase()]}
                              <div className="flex items-center gap-1.5">
                                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                                  {getRegionIcon(item.region)}
                                </div>
                                <span>{item.region}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-500 hover:text-red-400 flex-shrink-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800">
                          <QuantityInput
                            label={isFixed ? "Quantity" : "Instances"}
                            value={item.count}
                            onChange={(count) => updateItem(item.id, { count })}
                            presets={PRESET_INSTANCE_QUANTITIES}
                          />

                          {!isFixed && (
                            <QuantityInput
                              label={`Usage (${item.unitOfMeasure})`}
                              value={item.usageQuantity}
                              onChange={(usageQuantity) =>
                                updateItem(item.id, { usageQuantity })
                              }
                              presets={PRESET_USAGE_QUANTITIES}
                            />
                          )}
                        </div>
                        <div className="flex justify-end">
                          <div className="px-2.5 py-1 bg-zinc-800 text-xs text-zinc-200 font-medium rounded-full">
                            {item.priceModel}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
