"use client";

import Silk from "@/components/silk";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaAws } from "react-icons/fa";
import { TbBrandAzure } from "react-icons/tb";
import { SiLinkerd, SiGooglecloud } from "react-icons/si";

export default function HomePage() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#30D95A" noiseIntensity={0.5} scale={1.5} speed={2} />
      </div>

      <div className="absolute inset-0 z-0 bg-black/60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 p-6 flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md flex items-center gap-x-4">
          Priceyy for
          <FaAws
            className="h-10 w-10 md:h-12 md:w-12 text-[#FF9900]"
            aria-label="AWS"
          />
          ,
          <TbBrandAzure
            className="h-10 w-10 md:h-12 md:w-12 text-[#0078D4]"
            aria-label="Azure"
          />
          and
          <SiGooglecloud
            className="h-10 w-10 md:h-12 md:w-12 text-[#4285F4]"
            aria-label="Google Cloud Platform"
          />
        </h1>

        <div className="mt-12 flex items-center gap-4">
          <p className="text-xl text-zinc-300">Interested?</p>
          <Link href="/login" aria-label="Go to login page">
            <SiLinkerd className="h-10 w-10 text-[#2BEDA7] cursor-pointer transition-transform hover:scale-110" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
