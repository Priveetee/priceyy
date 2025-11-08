"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface RegionStepProps {
  provider: string;
  onSelect: (region: string) => void;
}

export function RegionStep({ provider, onSelect }: RegionStepProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionSearch, setRegionSearch] = useState("");
  const regionsQuery = trpc.getRegions.useQuery({ provider });

  const filteredRegions = useMemo(() => {
    if (!regionsQuery.data) return [];
    return regionsQuery.data.filter((r) =>
      r.toLowerCase().includes(regionSearch.toLowerCase()),
    );
  }, [regionsQuery.data, regionSearch]);

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
        value={regionSearch}
        onChange={(e) => setRegionSearch(e.target.value)}
        className="bg-zinc-950 border-zinc-700"
      />
      {regionsQuery.isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 rounded-md border border-zinc-700 bg-zinc-950 p-2">
          <div className="flex flex-col gap-1 pr-2">
            {filteredRegions.map((r) => (
              <Button
                key={r}
                variant={selectedRegion === r ? "secondary" : "ghost"}
                className="justify-start h-9"
                onClick={() => setSelectedRegion(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSelect(selectedRegion!)}
          disabled={!selectedRegion}
          className={cn(
            "border-zinc-700 transition-colors",
            !selectedRegion && "bg-transparent hover:bg-zinc-800",
            selectedRegion && "bg-white text-black hover:bg-zinc-200",
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
