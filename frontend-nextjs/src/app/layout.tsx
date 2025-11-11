"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SiBruno } from "react-icons/si";
import { Toaster } from "@/components/ui/sonner";
import TRPCProvider from "@/lib/trpc/provider";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showLogo = pathname !== "/chat";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <TRPCProvider>
          {showLogo && (
            <Link
              href="/"
              aria-label="Go to homepage"
              className="absolute top-4 left-4 md:top-6 md:left-6 z-50"
            >
              <SiBruno className="h-8 w-8 text-zinc-300 transition-colors hover:text-white" />
            </Link>
          )}
          {children}
          <Toaster richColors position="top-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}
