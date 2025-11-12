"use client";

import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";

const PROVIDER_ICONS = {
  openai: AiFillOpenAI,
  google: FcGoogle,
  anthropic: SiAnthropic,
  meta: SiMeta,
  mistral: RiRobot2Line,
};

const PROVIDER_COLORS = {
  openai: "from-green-500 to-emerald-600",
  google: "from-blue-500 to-red-500",
  anthropic: "from-orange-500 to-amber-600",
  meta: "from-blue-600 to-indigo-600",
  mistral: "from-purple-500 to-pink-600",
};

interface TypingIndicatorProps {
  provider: "openai" | "anthropic" | "google" | "mistral" | "meta";
}

export function TypingIndicator({ provider }: TypingIndicatorProps) {
  const Icon = PROVIDER_ICONS[provider];
  const gradientColors = PROVIDER_COLORS[provider];

  return (
    <div className="flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="inline-flex items-center gap-1 px-4 py-3 rounded-2xl bg-zinc-800/50">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
