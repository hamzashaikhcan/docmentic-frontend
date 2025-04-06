"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Clock, FileText, Tag, User } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { categories, documents } from "@/lib/dummy-data";

export default function CategoryDetailClient() {
  const router = useRouter();
  const params = useParams();
  const [category, setCategory] = useState<any>(null);
  const [categoryDocs, setCategoryDocs] = useState<any[]>([]);

  useEffect(() => {
    const categoryId = Array.isArray(params.categoryId)
      ? params.categoryId[0]
      : params.categoryId;

    const foundCategory = categories.find((cat) => cat.id === categoryId);
    setCategory(foundCategory || null);

    // Find documents in this category
    const categoryDocuments = documents.filter(
      (doc) => doc.categoryId === categoryId,
    );
    setCategoryDocs(categoryDocuments);
  }, [params]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Category not found</h1>
            </div>
            <p className="text-muted-foreground">
              The requested category does not exist.
            </p>
            <Button className="mt-4" onClick={() => router.push("/categories")}>
              Back to Categories
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground mt-1">
                {category.description}
              </p>
            </div>
            <Button onClick={() => router.push("/categories")}>
              All Categories
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 gap-6 mt-6">
            {categoryDocs.length > 0 ? (
              categoryDocs.map((doc) => (
                <Card key={doc.id} className="hover-card-effect">
                  <CardHeader>
                    <CardTitle>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="hover:text-primary"
                      >
                        {doc.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {doc.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {doc.contentLength} words
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{doc.excerpt}</p>
                    <div className="flex gap-2 mt-4">
                      {doc?.tags?.map((tag: string) => (
                        <div
                          key={tag}
                          className="flex items-center bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/documents/${doc.id}`}>View Document</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No documents found in this category.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/documents/new")}
                >
                  Create New Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
