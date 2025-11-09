"use client";
import { useEffect } from "react";
import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertTriangle, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydration } from "@/lib/use-hydration";
export default function ResultsPage() {
  const { items } = useCartStore();
  const isHydrated = useHydration();
  const calculateMutation = trpc.calculate.useMutation();
  useEffect(() => {
    if (isHydrated && items.length > 0 && calculateMutation.isIdle) {
      const servicesToCalculate = items.map(({ id, ...rest }) => rest);
      console.log("[results-page] Calling mutate with:", servicesToCalculate);
      calculateMutation.mutate(servicesToCalculate);
    }
  }, [isHydrated, items, calculateMutation]);

  const ResultContent = () => {
    if (!isHydrated) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-12 w-12" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Empty className="bg-transparent">
          <EmptyHeader>
            <EmptyMedia>
              <ServerCrash className="h-16 w-16 text-zinc-500" />
            </EmptyMedia>
            <EmptyTitle className="text-zinc-300">
              No Items to Calculate
            </EmptyTitle>
            <EmptyDescription className="text-zinc-500">
              Your estimate is empty. Add some resources to see the results.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    if (calculateMutation.isPending) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-12 w-12" />
        </div>
      );
    }

    if (calculateMutation.isError) {
      return (
        <Empty className="bg-transparent">
          <EmptyHeader>
            <EmptyMedia>
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </EmptyMedia>
            <EmptyTitle className="text-red-400">Calculation Failed</EmptyTitle>
            <EmptyDescription className="text-zinc-400">
              {calculateMutation.error.message}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    if (calculateMutation.isSuccess) {
      return (
        <Card className="bg-zinc-900/50 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {calculateMutation.data.breakdown.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-md"
                >
                  <div>
                    <p className="font-medium">{item.resourceType}</p>
                    <p className="text-xs text-zinc-400">{item.region}</p>
                  </div>
                  <p className="font-semibold">${item.totalCost.toFixed(2)}</p>
                </div>
              ),
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-zinc-800/50 p-4 mt-4 rounded-b-lg">
            <p className="text-lg font-bold">Estimated Total</p>
            <p className="text-2xl font-bold text-green-400">
              ${calculateMutation.data.totalCost.toFixed(2)}
            </p>
          </CardFooter>
        </Card>
      );
    }

    return null;
  };

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

          <ResultContent />
        </motion.div>
      </div>
    </div>
  );
}
