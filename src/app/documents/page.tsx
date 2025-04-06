"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { FileText, FilePlus, Clock } from "lucide-react";
import { formatDistance } from "date-fns";
import axiosClient from "@/lib/axiosClient";
import { useEffect, useState } from "react";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDocuments = async () => {
    try {
      const response = await axiosClient.get("/api/documents");
      setDocuments(response?.data?.owned_documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage your documents</p>
          </div>
          <div>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push("/documents/new")}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No documents found</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Create your first document to get started.
            </p>
            <Button
              onClick={() => router.push("/documents/new")}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc: any) => (
              <Card
                key={doc.id}
                className="bg-card border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row">
                  <CardHeader className="flex-1">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">
                        <Link
                          href={`/documents/${doc.id}/`}
                          className="hover:text-primary transition-colors"
                        >
                          {doc.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {doc.description ? (
                        <span>{doc.description}</span>
                      ) : (
                        <span className="italic">No description</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col space-y-2 items-start pt-2 pb-4 md:pt-4 border-t md:border-t-0 md:border-l border-border md:pl-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        Updated{" "}
                        {formatDistance(new Date(doc.updated_at), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {doc.is_public !== undefined && (
                      <div className="flex items-center text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${doc.is_public ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {doc.is_public ? "Public" : "Private"}
                        </span>
                      </div>
                    )}
                    <Button asChild variant="outline" className="mt-2">
                      <Link href={`/documents/${doc.id}/`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Document
                      </Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
