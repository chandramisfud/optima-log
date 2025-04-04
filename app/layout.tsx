// app/layout.tsx
import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import AuthWrapper from "@/components/auth-wrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "XVA LOG MANAGEMENT",
  description: "Log management system for XVA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}