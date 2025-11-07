import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SiBruno } from "react-icons/si";
import { Toaster } from "@/components/ui/sonner";
import TRPCProvider from "@/lib/trpc/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Priceyy App",
  description: "Smart cloud cost estimation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <Link
            href="/"
            aria-label="Go to homepage"
            className="absolute top-4 left-4 md:top-6 md:left-6 z-50"
          >
            <SiBruno className="h-8 w-8 text-zinc-300 transition-colors hover:text-white" />
          </Link>
          {children}
          <Toaster richColors />
        </TRPCProvider>
      </body>
    </html>
  );
}
