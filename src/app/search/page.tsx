"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { formatDistance } from "date-fns";
import {
  Search,
  FileText,
  Edit,
  Clock,
  ArrowUp,
  ArrowDown,
  User,
  Folder,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/components/auth-context";

// Add static export support
export const dynamic = "force-static";

// Types moved out to make them accessible to both components
interface Category {
  id: string;
  name: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  isOwner: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  user?: {
    name: string | null;
    email: string | null;
  };
}

// Sorting options
const sortOptions = [
  { label: "Last Updated", value: "updatedAt" },
  { label: "Created Date", value: "createdAt" },
  { label: "Title", value: "title" },
];

// Component with useSearchParams access that needs Suspense boundary
function SearchContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialQuery = searchParams.get("q") || "";
  const initialCategoryId = searchParams.get("categoryId") || "";
  const initialSort = searchParams.get("sort") || "updatedAt";
  const initialOrder = searchParams.get("order") || "desc";

  // State
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [sort, setSort] = useState(initialSort);
  const [order, setOrder] = useState(initialOrder);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Use debounced values for search to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (user) {
          const response = await fetch("/api/categories");
          if (response.ok) {
            const data = await response.json();
            setCategories(data);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [user]);

  // Update URL with search parameters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (categoryId) params.set("categoryId", categoryId);
    if (sort !== "updatedAt") params.set("sort", sort);
    if (order !== "desc") params.set("order", order);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newUrl);
  }, [debouncedQuery, categoryId, sort, order]);

  // Search documents
  const searchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (categoryId && categoryId !== "all")
        params.set("categoryId", categoryId);
      params.set("sort", sort);
      params.set("order", order);

      const response = await fetch(`/api/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast.error("Failed to search documents");
      }
    } catch (error) {
      console.error("Error searching documents:", error);
      toast.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, categoryId, sort, order]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // Update URL and search when search params change
  useEffect(() => {
    if (user) {
      updateUrl();
      searchDocuments();
    }
  }, [
    user,
    debouncedQuery,
    categoryId,
    sort,
    order,
    searchDocuments,
    updateUrl,
  ]);

  useEffect(() => {
    if (categoryId === "all") {
      setCategoryId("");
    }
  }, [categoryId]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  // Clear all filters
  const clearFilters = () => {
    setQuery("");
    setCategoryId("");
    setSort("updatedAt");
    setOrder("desc");
  };

  if (authLoading || (loading && documents?.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col bg-[#111111] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#111111] text-white">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search Documents</h1>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by title or content..."
                    className="pl-8 bg-[#1a1a1a] border-[#333333] text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-blue-600"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#333333] text-white focus:ring-blue-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#222] border-[#333333] text-white">
                  <SelectItem
                    value="all"
                    className="focus:bg-[#333] focus:text-white"
                  >
                    All Categories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="focus:bg-[#333] focus:text-white"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="flex-1 bg-[#1a1a1a] border-[#333333] text-white focus:ring-blue-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#222] border-[#333333] text-white">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-[#333] focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                title={order === "asc" ? "Ascending" : "Descending"}
                className="border-[#333333] bg-[#1a1a1a] text-white hover:bg-[#333] hover:text-white"
              >
                {order === "asc" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={
                  !query &&
                  !categoryId &&
                  sort === "updatedAt" &&
                  order === "desc"
                }
                className="text-gray-300 hover:bg-[#333] hover:text-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-[#333333]" />

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-400">Searching...</p>
          </div>
        ) : documents?.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <FileText className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-4 text-lg font-medium">No documents found</h3>
            <p className="mt-2 text-gray-400 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're
              looking for.
            </p>
            <Button
              onClick={clearFilters}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={
                !query &&
                !categoryId &&
                sort === "updatedAt" &&
                order === "desc"
              }
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
              <span>
                {documents?.length} result{documents?.length !== 1 ? "s" : ""}{" "}
                found
              </span>
            </div>

            {documents &&
              documents?.length > 0 &&
              documents?.map((document) => (
                <Card
                  key={document?.id}
                  className="bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#222222] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start">
                    <CardHeader className="flex-1 pb-2 md:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <CardTitle className="text-xl">
                          <Link
                            href={`/documents/${document?.id}`}
                            className="hover:text-blue-400 transition-colors"
                          >
                            {document?.title}
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {!document?.isOwner && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                {document?.user?.name ||
                                  document?.user?.email ||
                                  "Unknown"}
                              </span>
                            </div>
                          )}
                          {document?.category && (
                            <div className="flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              <span>{document?.category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <CardDescription className="mt-2 text-gray-400">
                        {document?.content && document?.content !== "[]" ? (
                          <div className="line-clamp-2">
                            {document?.content
                              .replace(/[\[\]{}"\\\n]/g, " ")
                              .substring(0, 150)}
                            ...
                          </div>
                        ) : (
                          <span className="italic">No content</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col sm:flex-row items-start md:items-center gap-4 pt-0 pb-4 px-6 border-t md:border-t-0 md:border-l border-[#333333] md:pl-6">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>
                          {formatDistance(
                            new Date(document?.updatedAt),
                            new Date(),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-white hover:bg-[#333] hover:text-white"
                      >
                        <Link href={`/documents/${document?.id}`}>
                          <Edit className="mr-2 h-3 w-3" />
                          {document?.isOwner ? "Edit" : "View"}
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

// Main component with suspense boundary
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[#111111] text-white">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Loading search page...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
