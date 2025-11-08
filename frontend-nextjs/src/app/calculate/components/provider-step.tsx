"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

interface ProviderStepProps {
  onSelect: (provider: string) => void;
}

export function ProviderStep({ onSelect }: ProviderStepProps) {
  const [selectedProvider, setSelectedProvider] = useState("aws");
  const providersQuery = trpc.getProviders.useQuery();

  return (
    <motion.div
      key="provider"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-[200px] gap-8"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-56 h-11 text-base text-zinc-200 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 focus:ring-zinc-500"
          >
            {selectedProvider.toUpperCase()}
            <ChevronDown className="ml-auto h-4 w-4 text-zinc-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-700 text-zinc-200">
          {providersQuery.data?.map((p) => (
            <DropdownMenuItem
              key={p}
              onSelect={() => setSelectedProvider(p)}
              className="focus:bg-zinc-800"
            >
              {p.toUpperCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex justify-end w-full px-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelect(selectedProvider)}
          className="border-zinc-700 bg-transparent hover:bg-zinc-800"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
