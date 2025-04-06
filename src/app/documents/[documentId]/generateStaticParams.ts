// This file contains static params for dynamic routes
// export function generateStaticParams() {
//   return [
//     { documentId: 'doc-1' },
//     { documentId: 'doc-2' },
//     { documentId: 'doc-3' },
//     { documentId: 'doc-4' },
//     { documentId: 'doc-5' },
//   ];
// }
import { documents, categories } from "@/lib/dummy-data";
export function generateStaticParams() {
  return documents.map((doc) => ({
    documentId: doc.id,
  }));
}
