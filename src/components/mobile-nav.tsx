"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FileText,
  Users,
  Settings,
  Target,
  Home,
  Sparkles,
  BookOpen,
  LogIn,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleHomePageNavigation = (section: string) => {
    router.push(`/#${section}`);
    onClose();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
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
      onClose();
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to open AI document generator");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-[85%] sm:w-[350px] bg-background border-r border-border p-0"
      >
        <SheetHeader className="border-b border-border p-6">
          <SheetTitle className="text-foreground flex items-center justify-between">
            <span className="font-asap">
              <Logo height={32} width={120} />
            </span>
            <ModeToggle />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col py-4 h-full">
          {session?.user ? (
            <div className="px-6 py-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
                onClick={handleAIGenerate}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </div>
          ) : (
            <div className="px-6 py-2 space-y-3">
              <Button className="w-full" onClick={() => signIn()}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => router.push("/auth/register")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          )}

          <div className="px-2 space-y-1">
            <h3 className="px-4 text-xs font-medium text-muted-foreground mb-1">
              Explore
            </h3>
            <NavItem
              icon={<Home className="mr-2 h-5 w-5" />}
              label="Home"
              onClick={() => handleNavigation("/")}
            />
            <NavItem
              icon={<Target className="mr-2 h-5 w-5" />}
              label="Use Cases"
              onClick={() => handleHomePageNavigation("use-cases")}
            />
            <NavItem
              icon={<CreditCard className="mr-2 h-5 w-5" />}
              label="Pricing"
              onClick={() => handleHomePageNavigation("pricing")}
            />
            <NavItem
              icon={<BookOpen className="mr-2 h-5 w-5" />}
              label="Tutorial"
              onClick={() => handleNavigation("/tutorial")}
            />
          </div>

          <div className="px-2 space-y-1 mt-2">
            <h3 className="px-4 text-xs font-medium text-muted-foreground mb-1">
              Product
            </h3>
            <NavItem
              icon={<FileText className="mr-2 h-5 w-5" />}
              label="Templates"
              onClick={() => handleNavigation("/templates")}
            />

            {session?.user && (
              <>
                <NavItem
                  icon={<FileText className="mr-2 h-5 w-5" />}
                  label="Documents"
                  onClick={() => handleNavigation("/documents")}
                />
                <NavItem
                  icon={<Users className="mr-2 h-5 w-5" />}
                  label="Categories"
                  onClick={() => handleNavigation("/categories")}
                />
              </>
            )}
          </div>

          {session?.user && (
            <>
              <Separator className="my-4 mx-4" />

              <div className="px-2">
                <NavItem
                  icon={<Settings className="mr-2 h-5 w-5" />}
                  label="Settings"
                  onClick={() => handleNavigation("/settings/profile")}
                />
                <NavItem
                  icon={<LogIn className="mr-2 h-5 w-5" />}
                  label="Sign Out"
                  onClick={() => signOut()}
                />
              </div>

              <div className="mt-auto px-6 py-4 border-t border-border">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground font-medium">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{session.user.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.user.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <button
      className="flex w-full items-center space-x-2 rounded-md p-2 hover:bg-accent transition-colors text-left text-foreground"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
