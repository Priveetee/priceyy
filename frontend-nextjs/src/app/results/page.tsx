"use client";

import { useEffect } from "react";
import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

export default function ResultsPage() {
  const { items } = useCartStore();
  const calculateMutation = trpc.calculate.useMutation();

  useEffect(() => {
    if (items.length > 0) {
      const servicesToCalculate = items.map(({ id, ...rest }) => rest);
      calculateMutation.mutate(servicesToCalculate);
    }
  }, [items, calculateMutation]);

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#6EE7CF" noiseIntensity={0.3} scale={1.2} speed={1.5} />
      </div>
      <div className="absolute inset-0 z-0 bg-black/70" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <Button
              variant="ghost"
              className="text-zinc-200 hover:text-white mb-4"
              asChild
            >
              <Link href="/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to review
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-white">Estimate Results</h1>
            <p className="text-zinc-200 mt-1">
              Here is the estimated cost based on your selection.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white">Summary</h2>
            </div>
            {calculateMutation.isPending && (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            )}
            {calculateMutation.isError && (
              <div className="p-12 text-center text-red-400 flex flex-col items-center gap-4">
                <AlertTriangle className="h-8 w-8" />
                <p>Calculation failed: {calculateMutation.error.message}</p>
              </div>
            )}
            {calculateMutation.isSuccess && (
              <>
                <ul className="border-t border-b border-zinc-800">
                  {calculateMutation.data.breakdown.map(
                    (item: any, index: number) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-4 border-b border-zinc-800 last:border-b-0"
                      >
                        <div>
                          <span className="text-zinc-200">
                            {item.resourceType}
                          </span>
                          <span className="text-xs text-zinc-500 block">
                            {item.region}
                          </span>
                        </div>
                        <span className="text-white font-medium">
                          ${item.totalCost.toFixed(2)}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
                <div className="p-6 flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">
                    Estimated Total
                  </span>
                  <span className="text-2xl font-bold text-green-400">
                    ${calculateMutation.data.totalCostPerMonth.toFixed(2)} /
                    month
                  </span>
                </div>
              </>
            )}
            {!calculateMutation.isPending && items.length === 0 && (
              <div className="p-12 text-center text-zinc-400">
                No items in the estimate to calculate.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
