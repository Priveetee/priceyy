"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/lib/useDebounce";
import { cn } from "@/lib/utils";

interface ResourceStepProps {
  provider: string;
  region: string;
  onSelect: (resources: string[]) => void;
}

export function ResourceStep({
  provider,
  region,
  onSelect,
}: ResourceStepProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resourceSearch, setResourceSearch] = useState("");
  const debouncedResourceSearch = useDebounce(resourceSearch, 300);

  const resourcesQuery = trpc.getResourceTypes.useQuery({
    provider,
    region,
    query: debouncedResourceSearch,
  });

  const toggleResourceSelection = (resource: string) => {
    setSelectedResources((prev) =>
      prev.includes(resource)
        ? prev.filter((r) => r !== resource)
        : [...prev, resource],
    );
  };

  return (
    <motion.div
      key="resource"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col h-[350px] gap-4"
    >
      <Input
        placeholder="Search resource..."
        value={resourceSearch}
        onChange={(e) => setResourceSearch(e.target.value)}
        className="bg-zinc-950 border-zinc-700"
      />
      {resourcesQuery.isFetching && !resourcesQuery.data ? (
        <div className="flex-grow flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 rounded-md border border-zinc-700 bg-zinc-950 p-2">
          <div className="flex flex-col gap-1 pr-2">
            {resourcesQuery.data?.map((r) => (
              <label
                key={r}
                htmlFor={r}
                className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 cursor-pointer"
              >
                <Checkbox
                  id={r}
                  checked={selectedResources.includes(r)}
                  onCheckedChange={() => toggleResourceSelection(r)}
                  className="data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-black"
                />
                <span className="text-sm select-none flex-grow">{r}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      )}
      <div className="flex justify-end pt-2">
        <Button
          onClick={() => onSelect(selectedResources)}
          disabled={selectedResources.length === 0}
          className={cn(
            "transition-colors",
            selectedResources.length > 0 &&
              "bg-white text-black hover:bg-zinc-200",
          )}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Next ({selectedResources.length})
        </Button>
      </div>
    </motion.div>
  );
}
