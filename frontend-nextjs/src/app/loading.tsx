import { Cloud, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative inline-flex items-center gap-3 animate-pulse">
        <Cloud className="h-12 w-12 text-zinc-400" />
        <Sparkles className="h-4 w-4 text-amber-400 absolute -top-1 -right-1" />
      </div>
    </div>
  );
}
