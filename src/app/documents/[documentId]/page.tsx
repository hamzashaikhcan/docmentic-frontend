// page.tsx
export const dynamic = "force-static";

import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import DocumentDetailClient from "./client-page";

export default async function DocumentDetailPage({
  params,
}: { params: { documentId: string } }) {
  noStore();

  const docId = (await params).documentId;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentDetailClient documentId={docId} />
    </Suspense>
  );
}
