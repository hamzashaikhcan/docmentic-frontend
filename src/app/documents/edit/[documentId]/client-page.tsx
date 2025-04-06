"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { DocumentEditor } from "@/components/document-editor";
import { documents } from "@/lib/dummy-data";

export default function EditDocumentClient() {
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const documentId = Array.isArray(params.documentId)
      ? params.documentId[0]
      : params.documentId;

    // Find document in dummy data
    const fetchDocument = () => {
      try {
        const foundDocument = documents.find((doc) => doc.id === documentId);
        if (foundDocument) {
          setDocument(foundDocument);
        } else {
          // Document not found, redirect to documents
          router.push("/documents");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Document Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The document you are trying to edit does not exist or has been
              deleted.
            </p>
            <Button onClick={() => router.push("/documents")}>
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Edit Document</h1>
            <Button
              variant="outline"
              onClick={() => router.push(`/documents/${document.id}`)}
            >
              Cancel
            </Button>
          </div>

          <DocumentEditor initialDocument={document} />
        </div>
      </main>
    </div>
  );
}
