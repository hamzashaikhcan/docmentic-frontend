// Add static export support
export const dynamic = "force-static";

import { Suspense } from "react";
import EditDocumentClient from "./client-page";

export function generateStaticParams() {
  return [
    { documentId: "getting-started" },
    { documentId: "installation" },
    { documentId: "configuration" },
    { documentId: "advanced-usage" },
    { documentId: "troubleshooting" },
    { documentId: "doc-1" },
    { documentId: "doc-2" },
    { documentId: "doc-3" },
    { documentId: "doc-4" },
    { documentId: "doc-5" },
  ];
}

export default function EditDocumentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditDocumentClient />
    </Suspense>
  );
}
