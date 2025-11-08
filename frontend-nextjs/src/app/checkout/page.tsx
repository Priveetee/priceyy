"use client";

import Silk from "@/components/silk";
import { useCartStore } from "@/lib/cartStore";
import { motion } from "framer-motion";
import { Trash2, Calculator, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const { items, removeFromCart, updateUsage } = useCartStore();

  const handleQuantityChange = (
    itemId: string,
    unit: string,
    newQuantity: number,
  ) => {
    if (newQuantity >= 0) {
      updateUsage(itemId, { [unit]: newQuantity });
    }
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to selection
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Review Your Estimate
            </h1>
            <p className="text-zinc-400 mt-1">
              Confirm your resources before calculating the final cost.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-zinc-700 p-12 text-center min-h-[400px] flex items-center justify-center">
              <p className="text-zinc-400">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const unit = Object.keys(item.usage)[0] || "N/A";
                const quantity = item.usage[unit] || 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex flex-col">
                      <span className="text-lg text-zinc-300 font-medium">
                        {item.resourceType}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {item.provider} - {item.region}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            unit,
                            parseFloat(e.target.value),
                          )
                        }
                        className="bg-zinc-800 border-zinc-700 text-white w-24"
                      />
                      <span className="text-zinc-400 text-sm">{unit}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              <div className="flex justify-end pt-8">
                <Link href="/results" passHref>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculate Total Cost
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
