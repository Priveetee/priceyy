"use client";

import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";
import {
  Search,
  Database,
  MapPin,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
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

const TOOL_CONFIG = {
  get_providers: {
    label: "Récupération des providers",
    icon: Database,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  get_regions: {
    label: "Recherche des régions",
    icon: MapPin,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  search_resources: {
    label: "Recherche des ressources",
    icon: Search,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  get_pricing_options: {
    label: "Récupération des options de pricing",
    icon: DollarSign,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  add_to_cart: {
    label: "Ajout au panier",
    icon: ShoppingCart,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
};

interface ToolCallIndicatorProps {
  provider: "openai" | "anthropic" | "google" | "mistral" | "meta";
  toolName: keyof typeof TOOL_CONFIG;
  args?: Record<string, any>;
}

export function ToolCallIndicator({
  provider,
  toolName,
  args,
}: ToolCallIndicatorProps) {
  const ProviderIcon = PROVIDER_ICONS[provider];
  const gradientColors = PROVIDER_COLORS[provider];
  const toolConfig = TOOL_CONFIG[toolName];
  const ToolIcon = toolConfig.icon;

  const formatDetails = () => {
    if (!args) return null;

    const details: string[] = [];

    if (args.provider) {
      details.push(`Provider: ${args.provider.toUpperCase()}`);
    }
    if (args.region) {
      details.push(`Région: ${args.region}`);
    }
    if (args.query) {
      details.push(`Recherche: "${args.query}"`);
    }
    if (args.resourceType) {
      details.push(`Ressource: ${args.resourceType}`);
    }
    if (args.priceModel) {
      details.push(`Modèle: ${args.priceModel}`);
    }
    if (args.quantity) {
      details.push(`Quantité: ${args.quantity}`);
    }

    return details.length > 0 ? details.join(" • ") : null;
  };

  const details = formatDetails();

  return (
    <div className="flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}
      >
        <ProviderIcon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div
          className={`inline-flex flex-col gap-1 px-4 py-3 rounded-2xl ${toolConfig.bgColor} border ${toolConfig.borderColor}`}
        >
          <div className="flex items-center gap-2">
            <ToolIcon
              className={`h-4 w-4 ${toolConfig.color} animate-search`}
            />
            <span className="text-sm font-medium text-zinc-200">
              {toolConfig.label}
            </span>
          </div>
          {details && (
            <span className="text-xs text-zinc-400 ml-6">{details}</span>
          )}
        </div>
      </div>
    </div>
  );
}
