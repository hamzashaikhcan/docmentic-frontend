// Add static export support
export const dynamic = "force-static";

import { Suspense } from "react";
import CategoryDetailClient from "./client-page";

export function generateStaticParams() {
  return [
    { categoryId: "general" },
    { categoryId: "tutorials" },
    { categoryId: "api-reference" },
    { categoryId: "guides" },
    { categoryId: "examples" },
    { categoryId: "doc-1" },
    { categoryId: "doc-2" },
    { categoryId: "doc-3" },
    { categoryId: "doc-4" },
    { categoryId: "doc-5" },
  ];
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryDetailClient />
    </Suspense>
  );
}
