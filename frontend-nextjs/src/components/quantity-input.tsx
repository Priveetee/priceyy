"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil } from "lucide-react";

interface QuantityInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  presets: number[];
}

export function QuantityInput({
  label,
  value,
  onChange,
  presets,
}: QuantityInputProps) {
  const [isCustom, setIsCustom] = useState(false);

  const handleSelect = (quantity: number) => {
    onChange(quantity);
    setIsCustom(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    onChange(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-zinc-400">{label}</Label>
      {isCustom ? (
        <Input
          type="text"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          className="bg-zinc-900 border-zinc-700 h-9 w-24"
          autoFocus
          onBlur={() => {
            if (value === 0 || value === null) onChange(1);
          }}
        />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="justify-between bg-zinc-900 border-zinc-700 h-9 w-24 text-white"
            >
              {value}
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
            {presets.map((q) => (
              <DropdownMenuItem key={q} onSelect={() => handleSelect(q)}>
                {q}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={() => setIsCustom(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Custom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
