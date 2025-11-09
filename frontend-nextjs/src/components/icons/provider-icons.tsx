import {
  FaAws,
  FaGlobeEurope,
  FaGlobeAsia,
  FaGlobeAmericas,
  FaGlobeAfrica,
} from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";
import { FcGoogle } from "react-icons/fc";
import { GiAustralia } from "react-icons/gi";
import { Globe } from "lucide-react";
import Flag from "react-world-flags";
import { regionToCountryCode } from "@/lib/utils";

export const ProviderIconMap: Record<string, React.ReactNode> = {
  aws: <FaAws className="h-5 w-5 text-yellow-500" />,
  azure: <VscAzure className="h-5 w-5 text-cyan-400" />,
  gcp: <FcGoogle className="h-5 w-5" />,
};

export const FallbackIcon = <Globe className="h-4 w-4 text-zinc-500" />;

const ContinentIconMap: Record<string, React.ReactNode> = {
  europe: <FaGlobeEurope className="h-4 w-4 text-zinc-400" />,
  asia: <FaGlobeAsia className="h-4 w-4 text-zinc-400" />,
  america: <FaGlobeAmericas className="h-4 w-4 text-zinc-400" />,
  africa: <FaGlobeAfrica className="h-4 w-4 text-zinc-400" />,
  oceania: <GiAustralia className="h-4 w-4 text-zinc-400" />,
};

const genericRegionKeywords: { [key: string]: string } = {
  europe: "europe",
  eu: "europe",
  asia: "asia",
  us: "america",
  "north america": "america",
  "south america": "america",
  "us gov": "america",
  govcloud: "america",
  africa: "africa",
  oceania: "oceania",
};

export function getRegionIcon(region: string): React.ReactNode {
  const lowerRegion = region.toLowerCase();

  const countryCode = regionToCountryCode[lowerRegion];
  if (countryCode) {
    return (
      <Flag code={countryCode} className="h-4 w-6 object-cover rounded-sm" />
    );
  }

  const prefix = lowerRegion.split("-")[0];
  switch (prefix) {
    case "us":
    case "northamerica":
    case "southamerica":
      return ContinentIconMap.america;
    case "europe":
    case "eu":
      return ContinentIconMap.europe;
    case "asia":
    case "ap": // Asia-Pacific
      return ContinentIconMap.asia;
    case "africa":
      return ContinentIconMap.africa;
    case "australia":
      return ContinentIconMap.oceania;
    case "me": // Middle-East
      return ContinentIconMap.asia;
  }

  for (const keyword in genericRegionKeywords) {
    if (lowerRegion.includes(keyword)) {
      const continent = genericRegionKeywords[keyword];
      return ContinentIconMap[continent];
    }
  }

  return FallbackIcon;
}
