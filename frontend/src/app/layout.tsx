import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
//import { ThemeProvider } from "@/components/theme-provider";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import ThemeDataProvider from "@/contexts/theme-data-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Inventory & Billing Management System",
  description:
    "Modern Inventory & Billing Management System is a Modern and responsive integrated business management system for small businesses. It offers inventory management, billing, and reporting features to streamline operations and enhance efficiency.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
        <ThemeDataProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeDataProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
