"use client";

import { useRouter } from "next/navigation";
import { EnhancedEditor } from "@/components/enhanced-editor";
import { Navbar } from "@/components/navbar";
import { toast } from "sonner";
import { documents, addDocument, currentUser } from "@/lib/dummy-data";

export default function NewDocumentPage() {
  const router = useRouter();

  const handleCreate = async (
    title: string,
    content: string,
    categoryId: string | null,
  ) => {
    try {
      // Add a new document to our dummy data
      const newDoc = addDocument({
        title,
        content,
        published: false,
        userId: currentUser.id,
        categoryId,
      });

      toast.success("Document created successfully");
      return { id: newDoc?.id };
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
      return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex-1">
        <EnhancedEditor
          initialTitle="Untitled Document"
          initialContent=""
          onSave={handleCreate}
          documents={documents}
        />
      </div>
    </div>
  );
}
