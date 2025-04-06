"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Edit, FileText, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import axiosClient from "@/lib/axiosClient";
import { formatDistance } from "date-fns";

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.documentId as string;
  const { user } = useAuth();

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      setLoading(true);
      try {
        const response = await axiosClient.get(`/api/documents/${documentId}`);
        console.log("Doc Response: ", response.data);
        setDocument(response.data);
      } catch (err) {
        console.error("Failed to fetch document:", err);
        setError("Could not load document");
      } finally {
        setLoading(false);
      }
    };

    console.log("documentId: ", documentId);
    fetchDocument();
  }, [documentId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <FileText className="h-12 w-12 animate-pulse text-muted-foreground" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle error or document not found
  if (error || !document) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-destructive">
                Document not found
              </h1>
            </div>
            <p className="text-muted-foreground">
              {error ||
                "The requested document does not exist or you may not have permission to view it."}
            </p>
            <Button className="mt-4" onClick={() => router.push("/documents")}>
              Back to Documents
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Format dates
  const createdAt = new Date(document.created_at);
  const updatedAt = new Date(document.updated_at);

  // Render document details
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Title and Actions */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <div className="flex space-x-2">
              {/* Only show edit if current user is the document owner */}
              {user?.id === document.owner_id && (
                <Button variant="outline" asChild>
                  <Link href={`/documents/edit/${document.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button onClick={() => router.push("/documents")}>
                All Documents
              </Button>
            </div>
          </div>

          {/* Document Metadata */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name || "Unknown User"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Updated{" "}
                {formatDistance(updatedAt, new Date(), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Created{" "}
                {formatDistance(createdAt, new Date(), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${document.is_public ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
              >
                {document.is_public ? "Public" : "Private"}
              </span>
            </div>
          </div>

          {/* Document Content */}
          <Card className="mb-8 border-border shadow-sm">
            <CardContent className="prose dark:prose-invert max-w-none pt-6">
              {document.description ? (
                <p>{document.description}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Document Versions */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle>Document Versions</CardTitle>
              <CardDescription>
                Version history of this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.latest_version ? (
                <div className="p-4 bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Latest version</p>
                      <p className="text-xs text-muted-foreground">
                        Updated{" "}
                        {formatDistance(updatedAt, new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No version history available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => router.push("/documents")}>
              Back to Documents
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/documents/edit/${document.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Document
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
