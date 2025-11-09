"use client";

import Silk from "@/components/silk";
import AddResourceButton from "@/components/add-resource-button";
import ResourceCard from "@/components/resource-card";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ShoppingCart, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useCartStore, CartItem } from "@/lib/cartStore";
import Link from "next/link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useHydration } from "@/lib/use-hydration";

export default function CalculatePage() {
  const { items: cartItems, addToCart, clearCart } = useCartStore();
  const isHydrated = useHydration();

  const handleAddResource = (resource: CartItem) => {
    console.log("[calculate-page] Received resource to add:", resource);
    addToCart(resource);
  };

  const handleClearAll = () => {
    clearCart();
    toast.info("Your estimate has been cleared.");
  };

  const totalCartItems = cartItems.length;
  const displayCount = totalCartItems > 99 ? "99+" : totalCartItems;

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#360707" noiseIntensity={0.4} scale={1.2} speed={1.5} />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex justify-between items-center pt-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">New Estimate</h1>
              <p className="text-zinc-400 mt-1">
                Start by adding resources to your project.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AddResourceButton onResourceSelect={handleAddResource} />
              <Link href="/checkout" passHref>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  aria-label="View estimate cart"
                >
                  {isHydrated && totalCartItems > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {displayCount}
                    </div>
                  )}
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              {isHydrated && cartItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-red-900/50 text-red-300 hover:bg-red-900/80 hover:text-red-200 border border-red-800/50"
                      aria-label="Clear all resources"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        This will permanently delete all items from your
                        estimate.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white border-zinc-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          {!isHydrated ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Spinner className="h-12 w-12 text-zinc-500" />
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Empty className="border-2 border-dashed border-zinc-700 bg-transparent min-h-[400px]">
              <EmptyHeader>
                <EmptyMedia>
                  <PackageOpen className="h-16 w-16 text-zinc-500" />
                </EmptyMedia>
                <EmptyTitle className="text-zinc-300">
                  No Resources Added
                </EmptyTitle>
                <EmptyDescription className="text-zinc-500">
                  Your selected resources will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </motion.div>
      </div>
    </div>
  );
}
