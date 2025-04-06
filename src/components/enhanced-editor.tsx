"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { DocumentEditor } from "@/components/document-editor";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Save,
  Share,
  Search,
  Plus,
  FileText,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  PanelLeft,
  PanelRight,
  Folder,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/dummy-data";
import { ShareDialog } from "@/components/share-dialog";

interface EnhancedEditorProps {
  documentId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialCategoryId?: string | null;
  onSave: (
    title: string,
    content: string,
    categoryId: string | null,
  ) => Promise<{ id: string } | null>;
  documents?: Array<{
    id: string;
    title: string;
    updatedAt: Date;
    createdAt: Date;
    published: boolean;
  }>;
}

export function EnhancedEditor({
  documentId,
  initialTitle = "Untitled Document",
  initialContent = "[]",
  initialCategoryId = null,
  onSave,
  documents = [],
}: EnhancedEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [categoryId, setCategoryId] = useState<string | null>(
    initialCategoryId,
  );
  const [isPending, startTransition] = useTransition();
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentExpanded, setRecentExpanded] = useState(true);
  const [starredExpanded, setStarredExpanded] = useState(false);
  const [trashExpanded, setTrashExpanded] = useState(false);
  const router = useRouter();

  const handleSave = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await onSave(title, content, categoryId);

        if (result) {
          toast.success("Document saved successfully");

          if (!documentId) {
            // If this was a new document, redirect to the edit page
            router.push(`/documents/${result?.id}`);
          }
        }
      } catch (error) {
        console.error("Error saving document:", error);
        toast.error("Failed to save document");
      }
    });
  }, [title, content, categoryId, documentId, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleContentUpdate = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-3 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftPanelVisible(!leftPanelVisible)}
            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {leftPanelVisible ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
          <Input
            type="text"
            placeholder="Untitled Document"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-border bg-background text-foreground focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-muted-foreground px-2 max-w-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {rightPanelVisible ? (
              <PanelRight className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          {documentId ? (
            <ShareDialog documentId={documentId} documentTitle={title} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                toast("Save your document first before sharing");
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main layout using CSS Grid - simpler and more reliable than ResizablePanels */}
      <div
        className={cn(
          "flex-1 grid overflow-hidden",
          leftPanelVisible &&
            rightPanelVisible &&
            "grid-cols-[250px_1fr_250px]",
          leftPanelVisible && !rightPanelVisible && "grid-cols-[250px_1fr]",
          !leftPanelVisible && rightPanelVisible && "grid-cols-[1fr_250px]",
          !leftPanelVisible && !rightPanelVisible && "grid-cols-[1fr]",
        )}
      >
        {/* Left sidebar */}
        {leftPanelVisible && (
          <div className="bg-card border-r border-border overflow-auto">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Documents</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-1 flex-1 overflow-auto">
                {/* Recent documents section */}
                <div
                  className="flex items-center gap-1 text-sm font-medium mb-1 cursor-pointer"
                  onClick={() => setRecentExpanded(!recentExpanded)}
                >
                  {recentExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>Recent</span>
                </div>
                {recentExpanded && (
                  <div className="pl-2">
                    {documents.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-2">
                        No documents yet
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/documents/${doc.id}`}
                          className={cn(
                            "flex items-center gap-2 text-sm py-1 px-2 rounded-md hover:bg-accent",
                            documentId === doc.id && "bg-accent",
                          )}
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {/* Starred section */}
                <div
                  className="flex items-center gap-1 text-sm font-medium mt-4 mb-1 cursor-pointer"
                  onClick={() => setStarredExpanded(!starredExpanded)}
                >
                  {starredExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>Starred</span>
                </div>
                {starredExpanded && (
                  <div className="pl-2">
                    <div className="text-sm text-muted-foreground p-2">
                      No starred documents
                    </div>
                  </div>
                )}

                {/* Trash section */}
                <div
                  className="flex items-center gap-1 text-sm font-medium mt-4 mb-1 cursor-pointer"
                  onClick={() => setTrashExpanded(!trashExpanded)}
                >
                  {trashExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>Trash</span>
                </div>
                {trashExpanded && (
                  <div className="pl-2">
                    <div className="text-sm text-muted-foreground p-2">
                      No documents in trash
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="bg-background overflow-auto">
          <div className="p-4 h-full">
            <div className="max-w-4xl mx-auto">
              <DocumentEditor
                initialContent={initialContent}
                onUpdate={handleContentUpdate}
                className="min-h-[calc(100vh-10rem)]"
                onSave={async (title, content) => {
                  return await onSave(title, content, categoryId);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        {rightPanelVisible && (
          <div className="bg-card border-l border-border overflow-auto">
            <div className="p-4 h-full flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-sm">Properties</h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Document Info section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Document Info</h4>
                  <Card className="p-3 bg-accent border-border text-foreground">
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Modified</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span>{(content.length / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Category section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <Card className="p-3 bg-accent border-border text-foreground">
                    <div className="grid gap-2">
                      <Select
                        value={categoryId || "uncategorized"}
                        onValueChange={(value) =>
                          setCategoryId(
                            value === "uncategorized" ? null : value,
                          )
                        }
                      >
                        <SelectTrigger className="bg-card border-border text-foreground">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          <SelectGroup>
                            <SelectItem
                              value="uncategorized"
                              className="focus:bg-accent focus:text-foreground"
                            >
                              <span className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-muted-foreground" />
                                <span>Uncategorized</span>
                              </span>
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                className="focus:bg-accent focus:text-foreground"
                              >
                                <span className="flex items-center gap-2">
                                  <Folder className="h-4 w-4" />
                                  <span>{category.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => router.push("/categories")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Manage Categories
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Actions section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                  <Card className="p-3 bg-accent border-border text-foreground">
                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => toast("Starred document")}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Star Document
                      </Button>
                      {documentId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start border-border bg-card text-destructive hover:bg-accent hover:text-destructive"
                          onClick={() => {
                            toast("This action is not implemented yet");
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Document
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search dialog */}
      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        className="bg-accent border-border text-foreground"
      >
        <CommandInput
          placeholder="Search all documents..."
          className="border-border bg-card text-foreground"
        />
        <CommandList className="bg-accent text-foreground">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Documents">
            {documents.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => {
                  router.push(`/documents/${doc.id}`);
                  setSearchOpen(false);
                }}
                className="hover:bg-muted focus:bg-muted"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{doc.title}</span>
                <CommandShortcut className="text-muted-foreground">
                  {formatDistance(new Date(doc.updatedAt), new Date(), {
                    addSuffix: true,
                  })}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
