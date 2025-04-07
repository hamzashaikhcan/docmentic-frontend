// components/custom/Badge.tsx
"use client";

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'destructive';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const Badge = ({ children, variant = "default" }: BadgeProps) => {
  const variants = {
    default: "bg-primary/20 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;