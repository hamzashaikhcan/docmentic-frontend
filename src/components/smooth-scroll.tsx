"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = "smooth";

    // Smooth scroll to anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute("href")?.substring(1);
        const targetElement = document.getElementById(targetId || "");

        if (targetElement) {
          // Calculate header offset - adjust if needed based on your header height
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Update URL hash without triggering scroll
          window.history.pushState(null, "", `#${targetId}`);
        }
      }
    };

    // Add event listener to the document
    document.addEventListener("click", handleAnchorClick);

    // Handle initial hash in URL
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 0);
    }

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return null;
}
