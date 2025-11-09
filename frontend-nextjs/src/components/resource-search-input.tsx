"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ResourceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ResourceSearchInput({
  value,
  onChange,
  className,
}: ResourceSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search resources..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer bg-zinc-900 border-zinc-700 pr-14 text-white placeholder:text-zinc-400"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
        <kbd className="text-zinc-300 bg-zinc-800 inline-flex h-6 items-center rounded border border-zinc-600 px-2 font-sans text-xs">
          Ctrl+K
        </kbd>
      </div>
    </div>
  );
}
