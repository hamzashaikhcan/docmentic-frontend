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

interface Diagram {
  id: string;
  document_version_id: string;
  section_id: string;
  dot_content: string;
  image_path: string;
  success: boolean;
  created_at: string;
}

interface ContentChunk {
  id: string;
  document_version_id: string;
  section_id: string;
  content: string;
  order: number;
  created_at: string;
}

interface Section {
  id: string;
  document_version_id: string;
  title: string;
  order: number;
  completed: boolean;
  created_at: string;
  content_chunks?: ContentChunk[];
  diagram?: Diagram;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  status: string;
  progress: number;
  config: {
    max_workers: number;
    company_name: string;
    target_words: number;
  };
  business_summary: string;
  output_file: string;
  error: string | null;
  celery_task_id: string | null;
  created_at: string;
  finished_at: string;
  execution_time: string | null;
  sections: Section[];
  content_chunks: ContentChunk[];
  diagrams?: Diagram[];
}

interface DocumentOwner {
  id: string;
  email: string;
  full_name: string;
}

interface Document {
  title: string;
  description: string;
  is_public: boolean;
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: DocumentOwner;
  versions: DocumentVersion[];
  shares: any[]; // You can make this more specific if needed
  latest_version: DocumentVersion | null;
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
            // Sort chunks based on the section order, not chunk order
            // First, map each chunk to its corresponding section to get the section order
            const chunksWithSectionOrder = latestVersion.content_chunks.map(
              (chunk: any) => {
                // Find the section this chunk belongs to
                const section = latestVersion.sections.find(
                  (section: any) => section.id === chunk.section_id,
                );

                return {
                  ...chunk,
                  sectionOrder: section ? section.order : 0, // Use the section's order
                  sectionId: section ? section.id : null, // Keep track of section ID for diagrams
                  sectionTitle: section ? section.title : null, // Keep track of section title for diagrams
                };
              },
            );

            // Sort the chunks by section order (ascending)
            const sortedChunks = chunksWithSectionOrder.sort(
              (a: any, b: any) => a.sectionOrder - b.sectionOrder,
            );

            // Group chunks by section to handle diagrams
            const chunksBySection: { [key: string]: any[] } = {};
            sortedChunks.forEach((chunk: any) => {
              if (chunk.sectionId) {
                if (!chunksBySection[chunk.sectionId]) {
                  chunksBySection[chunk.sectionId] = [];
                }
                chunksBySection[chunk.sectionId].push(chunk);
              }
            });

            // Build the content with diagrams
            let fullContent = '';

            // Process sections in order
            const sortedSections = [...latestVersion.sections].sort(
              (a: any, b: any) => a.order - b.order,
            );

            for (const section of sortedSections) {
              const sectionChunks = chunksBySection[section.id] || [];

              // Add all chunk content for this section
              for (const chunk of sectionChunks) {
                fullContent += chunk.content + '\n\n';
              }

              // Add the diagram if it exists
              if (section.diagram && section.diagram.success) {
                const baseUrl = window.location.origin;
                const imagePath = section.diagram.image_path;
                const filename = imagePath.split('/').pop() || '';
                const imageUrl = `${baseUrl}/api/diagrams/${section.id}/${filename}`;

                fullContent += `![${section.title} Diagram](${imageUrl})\n\n`;
              }
            }

            // Convert the content to HTML before loading it into the editor
            let content = fullContent;

            // Convert markdown headings to HTML
            content = content.replace(
              /^(#{1,6})\s+(.+?)$/gm,
              (match: any, hashes: any, text: any) => {
                const level = hashes.length;
                return `<h${level}>${text}</h${level}>`;
              },
            );

            // Convert markdown images to HTML
            content = content.replace(
              /!\[(.*?)\]\((.*?)\)/g,
              (match: any, altText: any, url: any) => {
                return `<img src="${url}" alt="${altText}" class="diagram-image" />`;
              },
            );

            // Set content
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
      // Parse the content if it's in JSON format
      let markdownContent = content;
      let parsedContent;

      try {
        // Try to parse the content as JSON
        parsedContent = JSON.parse(content);

        // If it's in the prosemirror format, convert it to markdown
        if (
          parsedContent &&
          parsedContent.type === 'doc' &&
          parsedContent.content
        ) {
          markdownContent = convertProsemirrorToMarkdown(parsedContent);
        }
      } catch (e) {
        // If it's not valid JSON, it might already be markdown
        console.log('Content is not in JSON format, using as is');
      }

      // Add images from diagrams if they're missing
      if (documentId) {
        // First, fetch the current document to get diagram information
        const docResponse = await axiosClient.get(
          `/api/documents/${documentId}`,
        );
        const docData = docResponse.data;

        if (docData && docData.versions && docData.versions.length > 0) {
          const latestVersion = docData.versions.reduce(
            (latest: any, current: any) =>
              current.version_number > latest.version_number ? current : latest,
            docData.versions[0],
          );

          // Check if the content already has diagram images
          const hasImages =
            markdownContent.includes('![') ||
            (parsedContent &&
              JSON.stringify(parsedContent).includes('type":"image'));

          // If no images found, add them from the diagrams
          if (!hasImages && latestVersion.sections) {
            const sortedSections = [...latestVersion.sections].sort(
              (a: any, b: any) => a.order - b.order,
            );

            // Identify section headings in the content
            const sectionHeadings =
              markdownContent.match(/^#{1,6}\s+.+$/gm) || [];

            // For each section with a diagram, add the image after the section content
            for (const section of sortedSections) {
              if (section.diagram && section.diagram.success) {
                const heading = sectionHeadings.find((h) =>
                  h.includes(section.title),
                );

                if (heading) {
                  const headingIndex = markdownContent.indexOf(heading);
                  if (headingIndex !== -1) {
                    // Find the next heading or end of content
                    const nextHeadingIndex = markdownContent
                      .slice(headingIndex + heading.length)
                      .search(/^#{1,6}\s+.+$/m);

                    const insertPosition =
                      nextHeadingIndex !== -1
                        ? headingIndex + heading.length + nextHeadingIndex
                        : markdownContent.length;

                    // Create image markdown
                    const baseUrl = window.location.origin;
                    const imagePath = section.diagram.image_path;
                    const filename = imagePath.split('/').pop() || '';
                    const imageUrl = `${baseUrl}/api/diagrams/${section.id}/${filename}`;
                    const imageMarkdown = `\n\n![${section.title} Diagram](${imageUrl})\n\n`;

                    // Insert the image before the next heading
                    markdownContent =
                      markdownContent.slice(0, insertPosition) +
                      imageMarkdown +
                      markdownContent.slice(insertPosition);
                  }
                }
              }
            }
          }
        }
      }

      const payload = {
        title,
        content: markdownContent,
        description:
          versionDescription || `Updated on ${new Date().toLocaleString()}`,
      };

      console.log('Payload: ', payload);
      // await axiosClient.put(`/api/documents/${documentId}/content`, payload);

      toast.success('Document saved successfully');
      return { id: documentId };
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      return null;
    }
  };

  // Helper function to convert prosemirror JSON to markdown
  function convertProsemirrorToMarkdown(doc: any): string {
    let markdown = '';

    // Process each node in the document
    if (doc.content && Array.isArray(doc.content)) {
      for (const node of doc.content) {
        markdown += nodeToMarkdown(node) + '\n\n';
      }
    }

    return markdown.trim();
  }

  // Convert a single node to markdown
  function nodeToMarkdown(node: any): string {
    if (!node) return '';

    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 1;
        const headingText = node.content
          ? node.content.map((n: any) => textToMarkdown(n)).join('')
          : '';
        return '#'.repeat(level) + ' ' + headingText;

      case 'paragraph':
        if (!node.content || node.content.length === 0) return '';
        return node.content.map((n: any) => textToMarkdown(n)).join('');

      case 'image':
        const alt = node.attrs?.alt || '';
        const src = node.attrs?.src || '';
        return `![${alt}](${src})`;

      case 'bulletList':
        if (!node.content) return '';
        return node.content
          .map((item: any) => {
            if (item.type !== 'listItem' || !item.content) return '';
            return (
              '- ' + item.content.map((n: any) => textToMarkdown(n)).join('\n')
            );
          })
          .join('\n');

      case 'orderedList':
        if (!node.content) return '';
        return node.content
          .map((item: any, index: number) => {
            if (item.type !== 'listItem' || !item.content) return '';
            return (
              `${index + 1}. ` +
              item.content.map((n: any) => textToMarkdown(n)).join('\n')
            );
          })
          .join('\n');

      case 'blockquote':
        if (!node.content) return '';
        return (
          '> ' + node.content.map((n: any) => textToMarkdown(n)).join('\n> ')
        );

      case 'codeBlock':
        const language = node.attrs?.language || '';
        const code = node.content
          ? node.content.map((n: any) => textToMarkdown(n)).join('\n')
          : '';
        return '```' + language + '\n' + code + '\n```';

      default:
        return '';
    }
  }

  // Process text nodes
  function textToMarkdown(node: any): string {
    if (!node) return '';

    if (node.type === 'text') {
      let text = node.text || '';

      // Apply marks if present
      if (node.marks && Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') {
            text = `**${text}**`;
          } else if (mark.type === 'italic') {
            text = `*${text}*`;
          } else if (mark.type === 'code') {
            text = `\`${text}\``;
          } else if (mark.type === 'link' && mark.attrs && mark.attrs.href) {
            text = `[${text}](${mark.attrs.href})`;
          }
        }
      }

      return text;
    }

    // For other node types, try to recursively get content
    if (node.content && Array.isArray(node.content)) {
      return node.content.map((n: any) => textToMarkdown(n)).join('');
    }

    return '';
  }

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
      <main className="h-[calc(100vh-4rem)] mb-16">
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