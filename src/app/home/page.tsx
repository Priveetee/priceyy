"use client";

import { useState } from "react";
import Silk from "@/components/ui/Silk";
import AddResourceButton from "@/components/ui/AddResourceButton";
import ResourceCard from "@/components/ui/ResourceCard";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ShoppingCart } from "lucide-react";
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

interface Resource {
  id: string;
  name: string;
  count: number;
}

export default function HomePage() {
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [cartItems, setCartItems] = useState<Resource[]>([]);

  const handleAddResource = (resourceName: string) => {
    const newResource: Resource = {
      id: `${resourceName}-${Date.now()}`,
      name: resourceName,
      count: 1,
    };
    setSelectedResources((prev) => [...prev, newResource]);
  };

  const handleRemoveResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.filter((resource) => resource.id !== resourceId),
    );
  };

  const handleCountChange = (resourceId: string, newCount: number) => {
    setSelectedResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId
          ? { ...resource, count: newCount }
          : resource,
      ),
    );
  };

  const handleClearAll = () => {
    setSelectedResources([]);
    setCartItems([]);
    toast.info("Your estimate has been cleared.");
  };

  const handleAddToCart = (resourceToAdd: Resource) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.name === resourceToAdd.name,
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.name === resourceToAdd.name
            ? { ...item, count: item.count + resourceToAdd.count }
            : item,
        );
      } else {
        return [...prevCart, resourceToAdd];
      }
    });

    toast.success(
      `Added ${resourceToAdd.count}x "${resourceToAdd.name}" to your estimate.`,
    );
  };

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.count,
    0,
  );
  const displayCount = totalCartItems > 10 ? "10+" : totalCartItems;

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
          <div className="flex justify-between items-start pt-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">New Estimate</h1>
              <p className="text-zinc-400 mt-1">
                Start by adding resources to your project.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AddResourceButton onResourceSelect={handleAddResource} />

              <Button
                variant="outline"
                size="icon"
                className="relative border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                aria-label="View estimate cart"
              >
                {totalCartItems > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {displayCount}
                  </div>
                )}
                <ShoppingCart className="h-5 w-5" />
              </Button>

              {(selectedResources.length > 0 || cartItems.length > 0) && (
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
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        This will permanently delete all selected resources and
                        clear your cart.
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

          {selectedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {selectedResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onRemove={handleRemoveResource}
                    onCountChange={handleCountChange}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-zinc-700 p-12 text-center min-h-[400px] flex items-center justify-center">
              <p className="text-zinc-400">
                Your selected resources will appear here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
