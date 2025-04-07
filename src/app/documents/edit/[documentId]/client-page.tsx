"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from '@/components/tiptap-editor';
import { toast } from 'sonner';
import axiosClient from '@/lib/axiosClient';
import { DocumentEditor } from '@/components/document-editor';
import { Save, Edit, Clock, Share, CheckCircle } from 'lucide-react';

interface DocumentContent {
  id: string;
  content: string;
  order: number;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  status: string;
  content_chunks: DocumentContent[];
  business_summary: string | null;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  versions: DocumentVersion[];
}

export default function EditDocumentClient() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.documentId as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentContent, setDocumentContent] = useState<string>('');

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/api/documents/${documentId}`);
        const doc = response.data;
        setDocument(doc);

        // Extract document content from the latest version
        if (doc.versions && doc.versions.length > 0) {
          // Find latest version
          const latestVersion = doc.versions.reduce(
            (latest: any, current: any) =>
              current.version_number > latest.version_number ? current : latest,
            doc.versions[0],
          );

          // Combine content chunks into a single string
          if (
            latestVersion.content_chunks &&
            latestVersion.content_chunks.length > 0
          ) {
            const sortedChunks = [...latestVersion.content_chunks].sort(
              (a, b) => a.order - b.order,
            );

            // Convert the content to HTML before loading it into the editor
            const content = sortedChunks
              .map((chunk) => {
                // Basic preprocessing to fix common markdown issues
                let html = chunk.content;

                // Fix headings (convert ## Heading to <h2>Heading</h2>)
                html = html.replace(
                  /^(#{1,6})\s+(.+?)$/gm,
                  (match: any, hashes: any, text: any) => {
                    const level = hashes.length;
                    return `<h${level}>${text}</h${level}>`;
                  },
                );

                // Fix code blocks
                html = html.replace(/```markdown\s*([\s\S]*?)```/g, '$1');

                // Remove separator lines
                html = html.replace(/^---+\s*$/gm, '');

                return html;
              })
              .join('\n\n');

            // Set content as raw HTML
            setDocumentContent(content);
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleSaveDocument = async (
    title: string,
    content: string,
    categoryId?: string | null,
    versionDescription?: string,
  ) => {
    try {
      const payload = {
        title,
        content,
        description:
          versionDescription || `Updated on ${new Date().toLocaleString()}`,
      };

      await axiosClient.put(`/api/documents/${documentId}/content`, payload);

      toast.success('Document saved successfully');
      return { id: documentId };
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      return null;
    }
  };

  const handleContentUpdate = (newContent: string) => {
    // This function is called when content changes
    console.log('Content updated:', newContent.length);
  };

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
            <Button onClick={() => router.push('/documents')}>
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
      <main className="h-[calc(100vh-4rem)]">
        <DocumentEditor
          documentId={document.id}
          initialTitle={document.title}
          initialContent={documentContent}
          onSave={handleSaveDocument}
          onUpdate={handleContentUpdate}
          className="h-full"
        />
      </main>
    </div>
  );
}