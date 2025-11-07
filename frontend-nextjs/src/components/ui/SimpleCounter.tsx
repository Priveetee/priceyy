"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "./button";

interface SimpleCounterProps {
  value: number;
  onValueChange: (newValue: number) => void;
}

export default function SimpleCounter({
  value,
  onValueChange,
}: SimpleCounterProps) {
  const increment = () => onValueChange(value + 1);
  const decrement = () => onValueChange(Math.max(0, value - 1));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-5xl font-bold text-white tabular-nums">{value}</div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white h-10 w-10"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
