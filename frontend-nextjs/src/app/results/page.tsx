"use client";

import { useEffect } from "react";
import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { trpc } from "@/lib/trpc/client";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ProviderIconMap,
  getRegionIcon,
} from "@/components/icons/provider-icons";

interface BreakdownItem {
  resourceType: string;
  region: string;
  totalCost: number;
}

interface CalculationResult {
  totalCost: number;
  breakdown: BreakdownItem[];
}

export default function ResultsPage() {
  const { items: cartItems } = useCartStore();

  const {
    data: result,
    isPending,
    isError,
    mutate,
    reset,
  } = trpc.calculate.useMutation();

  useEffect(() => {
    const itemsToCalculate = cartItems.map((item) => ({
      provider: item.provider,
      region: item.region,
      resourceType: item.resourceType,
      priceModel: item.priceModel,
      unitOfMeasure: item.unitOfMeasure,
      usageQuantity: item.usageQuantity,
      count: item.count,
    }));
    if (itemsToCalculate.length > 0) {
      mutate(itemsToCalculate);
    }
  }, [cartItems, mutate]);

  const handleRetry = () => {
    reset();
    const itemsToCalculate = cartItems.map((item) => ({
      provider: item.provider,
      region: item.region,
      resourceType: item.resourceType,
      priceModel: item.priceModel,
      unitOfMeasure: item.unitOfMeasure,
      usageQuantity: item.usageQuantity,
      count: item.count,
    }));
    mutate(itemsToCalculate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getProviderForItem = (resourceType: string, region: string) => {
    const item = cartItems.find(
      (i) => i.resourceType === resourceType && i.region === region,
    );
    return item ? item.provider : "unknown";
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#073622" noiseIntensity={0.3} scale={1.5} speed={1} />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <Link href="/checkout" passHref>
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to review
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Estimate Results</h1>
            <p className="text-zinc-400 mt-1">
              Here is the estimated cost based on your selection.
            </p>
          </div>

          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <Spinner className="h-10 w-10 text-green-400" />
              <p className="text-zinc-400">Calculating your estimate...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-900/30 border border-red-800 rounded-lg text-center">
              <ServerCrash className="h-10 w-10 text-red-400" />
              <p className="text-red-300 font-semibold">Calculation Failed</p>
              <p className="text-red-400/80 text-sm">
                There was an error while trying to calculate the cost.
              </p>
              <Button
                onClick={handleRetry}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          ) : (
            result && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-900/70 to-green-800/50 border border-green-700 rounded-lg p-6 text-center">
                  <p className="text-lg text-green-300">Total Estimated Cost</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {formatCurrency(result.totalCost)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    Cost Breakdown
                  </h2>
                  <ScrollArea className="h-[400px] rounded-lg border border-zinc-800 bg-zinc-950/20 p-2">
                    <div className="space-y-2">
                      {result.breakdown.map(
                        (item: BreakdownItem, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-800/50 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 flex items-center justify-center">
                                {
                                  ProviderIconMap[
                                    getProviderForItem(
                                      item.resourceType,
                                      item.region,
                                    ).toLowerCase()
                                  ]
                                }
                              </div>
                              <div className="flex flex-col">
                                <span className="text-zinc-200">
                                  {item.resourceType}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <div className="flex-shrink-0 w-4 flex items-center justify-center">
                                    {getRegionIcon(item.region)}
                                  </div>
                                  <span>{item.region}</span>
                                </div>
                              </div>
                            </div>
                            <span className="font-semibold text-white">
                              {formatCurrency(item.totalCost)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
