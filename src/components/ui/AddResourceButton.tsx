"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./button";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const resources = [
  "AWS EC2 Instances",
  "AWS S3 Buckets",
  "AWS RDS Database",
  "Azure Virtual Machines",
  "Azure Blob Storage",
  "Azure SQL Database",
];

interface AddResourceButtonProps {
  onResourceSelect: (resource: string) => void;
}

export default function AddResourceButton({
  onResourceSelect,
}: AddResourceButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300">
        <DropdownMenuLabel>Select a service</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {resources.map((resource, index) => (
          <motion.div
            key={resource}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: index * 0.05,
              ease: "easeOut",
            }}
          >
            <DropdownMenuItem
              onSelect={() => onResourceSelect(resource)}
              className="cursor-pointer focus:bg-zinc-800 focus:text-white"
            >
              {resource}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
