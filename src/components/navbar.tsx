"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  LogIn,
  UserPlus,
  Menu,
  Target,
  CreditCard,
  Home,
  BookTemplate,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { signIn, useSession } from "next-auth/react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/ui/user-nav";
import { MobileNav } from "@/components/mobile-nav";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHomePageNavigation = (section: string) => {
    router.push(`/#${section}`);
  };

  const handleAIGenerate = () => {
    if (!session?.user) {
      toast.info("Please sign in to use AI document generator");
      signIn();
      return;
    }

    try {
      toast.success("Opening AI document generator");
      router.push("/documents/new?ai=true");
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to open AI document generator");
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo height={32} width={120} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <Home className="mr-1.5 h-4 w-4" />
            Home
          </Link>

          <Link
            href="/#use-cases"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <Target className="mr-1.5 h-4 w-4" />
            Use Cases
          </Link>

          <Link
            href="/#pricing"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <CreditCard className="mr-1.5 h-4 w-4" />
            Pricing
          </Link>

          <Link
            href="/templates"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <BookTemplate className="mr-1.5 h-4 w-4" />
            Templates
          </Link>

          <Link
            href="/tutorial"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            Tutorial
          </Link>

          {session?.user && (
            <>
              <Link
                href="/documents"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Documents
              </Link>
              <Link
                href="/analytics"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleAIGenerate}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>

              <UserNav />
              <ModeToggle />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => signIn()}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button onClick={() => router.push("/auth/register")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden border-border bg-background/90 text-foreground hover:bg-accent"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileMenuOpen && (
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
