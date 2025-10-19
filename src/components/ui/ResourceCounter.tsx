"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Counter from "./Counter";
import { Button } from "./button";

interface ResourceCounterProps {
  label: string;
}

export default function ResourceCounter({ label }: ResourceCounterProps) {
  const [count, setCount] = useState(1);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between shadow-lg">
      <span className="text-lg text-zinc-300 font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={decrement}
          className="text-zinc-400 hover:text-white hover:bg-zinc-700"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <Counter
          value={count}
          places={[100, 10, 1]}
          fontSize={28}
          padding={4}
          gap={4}
          textColor="white"
          fontWeight={600}
          gradientFrom="#360707"
          gradientTo="transparent"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={increment}
          className="text-zinc-400 hover:text-white hover:bg-zinc-700"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
