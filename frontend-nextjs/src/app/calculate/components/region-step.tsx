"use client";

import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/lib/useDebounce";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getRegionIcon } from "@/components/icons/provider-icons";
import { ArrowRight } from "lucide-react";

interface RegionStepProps {
  provider: string;
  onSelect: (region: string) => void;
}

export function RegionStep({ provider, onSelect }: RegionStepProps) {
  const { data: regions, isLoading } = trpc.getRegions.useQuery({ provider });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const filteredRegions =
    regions?.filter((r) =>
      r.toLowerCase().includes(debouncedSearch.toLowerCase()),
    ) || [];

  return (
    <motion.div
      key="region"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col h-[350px] gap-4"
    >
      <Input
        placeholder="Search region..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-zinc-950 border-zinc-700"
      />
      <div className="flex-1 min-h-0 border border-zinc-800 rounded-md">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        )}
        <ScrollArea className="h-full">
          <div className="p-1">
            {filteredRegions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`w-full text-left p-2 rounded-md flex items-center gap-3 ${
                  selectedRegion === r
                    ? "bg-zinc-100 text-zinc-900"
                    : "hover:bg-zinc-800"
                }`}
              >
                <div className="flex-shrink-0 w-6 flex items-center justify-center">
                  {getRegionIcon(r)}
                </div>
                <span>{r}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex justify-end">
        <Button
          size="icon"
          onClick={() => onSelect(selectedRegion!)}
          disabled={!selectedRegion}
          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
