"use client";

import { AuthProvider } from "./auth-context";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

export default function ClientProvider({
  children,
}: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
