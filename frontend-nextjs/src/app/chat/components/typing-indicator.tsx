"use client";

import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";
import { TbFish } from "react-icons/tb";

const PROVIDER_ICONS = {
  openai: AiFillOpenAI,
  google: FcGoogle,
  anthropic: SiAnthropic,
  meta: SiMeta,
  mistral: RiRobot2Line,
  fallback: TbFish,
};

const PROVIDER_COLORS = {
  openai: "from-black to-zinc-900",
  google: "from-blue-500 to-red-500",
  anthropic: "from-orange-500 to-amber-600",
  meta: "from-blue-600 to-indigo-600",
  mistral: "from-purple-500 to-pink-600",
  fallback: "from-cyan-500 to-blue-600",
};

interface TypingIndicatorProps {
  provider: "openai" | "anthropic" | "google" | "mistral" | "meta" | "fallback";
  isFallback?: boolean;
}

export function TypingIndicator({
  provider,
  isFallback = false,
}: TypingIndicatorProps) {
  const providerKey = isFallback ? "fallback" : provider;
  const Icon = PROVIDER_ICONS[providerKey];
  const gradientColors = PROVIDER_COLORS[providerKey];

  return (
    <div className="flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="inline-flex flex-col gap-2 px-4 py-3 rounded-2xl bg-zinc-800/70 border border-zinc-700">
          {isFallback && (
            <span className="text-xs text-cyan-400 font-medium">
              Server overloaded, changing provider...
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
