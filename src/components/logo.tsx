"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Logo({ height = 112, width = 200 }) {
  const { resolvedTheme, theme, themes, systemTheme, forcedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div />;
  }

  const logoSrc =
    resolvedTheme === "dark" ? "/logo_dark.webp" : "/logo_light.webp";

  return (
    <div className="relative">
      <Image
        src={logoSrc}
        alt="Docmentic Logo"
        height={height}
        width={width}
        className="object-contain"
        priority
      />
    </div>
  );
}
