"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProviderIconMap } from "@/components/icons/provider-icons";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface ProviderStepProps {
  onSelect: (provider: string) => void;
}

export function ProviderStep({ onSelect }: ProviderStepProps) {
  const { data: providers, isLoading } = trpc.getProviders.useQuery();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  return (
    <motion.div
      key="provider"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col h-[350px] gap-4"
    >
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="flex-1 space-y-2">
        {providers?.map((p) => (
          <Button
            key={p}
            variant="outline"
            className={`w-full justify-start p-4 h-auto text-base ${
              selectedProvider === p
                ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
            }`}
            onClick={() => setSelectedProvider(p)}
          >
            <div className="flex items-center gap-3">
              {ProviderIconMap[p.toLowerCase()]}
              <span className="font-semibold">{p.toUpperCase()}</span>
            </div>
          </Button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          size="icon"
          onClick={() => onSelect(selectedProvider!)}
          disabled={!selectedProvider}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
