"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type TiptapEditorProps = {
  content: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
};

export function TiptapEditor({
  content,
  onChange,
  className,
  readOnly = false,
}: TiptapEditorProps) {
  const [url, setUrl] = useState<string>("");
  const [showLinkMenu, setShowLinkMenu] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showImageMenu, setShowImageMenu] = useState<boolean>(false);
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your document here...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full rounded-lg shadow-sm mx-auto my-4",
        },
      }),
      TextStyle,
      Underline,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editable: !readOnly,
  });

  // Update content when props change
  useEffect(() => {
    if (editor && content && content !== JSON.stringify(editor.getJSON())) {
      try {
        editor.commands.setContent(JSON.parse(content));
      } catch (e) {
        // If content is not valid JSON, set it as HTML
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  // Handle file drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!editor) return;

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not an image`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            const imageUrl = event.target.result;
            editor
              .chain()
              .focus()
              .setImage({ src: imageUrl, alt: file.name })
              .run();
            toast.success(`Image ${file.name} uploaded`);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [editor],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} is not an image`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setUploadedImage(event.target.result);
          setUploadedImageName(file.name);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const insertUploadedImage = useCallback(() => {
    if (editor && uploadedImage) {
      editor
        .chain()
        .focus()
        .setImage({ src: uploadedImage, alt: uploadedImageName })
        .run();

      setUploadedImage(null);
      setUploadedImageName("");
      setUploadOpen(false);
      toast.success("Image added successfully");
    }
  }, [editor, uploadedImage, uploadedImageName]);

  const handleInsertLink = useCallback(() => {
    if (editor && url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();

      setUrl("");
      setShowLinkMenu(false);
    }
  }, [editor, url]);

  const handleInsertImage = useCallback(() => {
    if (editor && imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();

      setImageUrl("");
      setShowImageMenu(false);
    }
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden",
        isDragging && "border-primary border-2 bg-primary/5",
        readOnly && "border-muted bg-muted/5",
        className,
      )}
      onDragEnter={!readOnly ? handleDragEnter : undefined}
      onDragLeave={!readOnly ? handleDragLeave : undefined}
      onDragOver={!readOnly ? handleDragOver : undefined}
      onDrop={!readOnly ? handleDrop : undefined}
    >
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/40">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("bold") ? "bg-accent text-accent-foreground" : "",
            )}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("italic")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("underline")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 1 })
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 2 })
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("bulletList")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("orderedList")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("codeBlock")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("blockquote")
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {showLinkMenu ? (
              <div className="flex items-center space-x-1">
                <input
                  className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                  placeholder="Enter URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleInsertLink();
                    }
                  }}
                />
                <Button size="sm" onClick={handleInsertLink}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLinkMenu(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowLinkMenu(true)}
                className={cn(
                  "h-8 w-8",
                  editor.isActive("link")
                    ? "bg-accent text-accent-foreground"
                    : "",
                )}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {showImageMenu ? (
              <div className="flex items-center space-x-1">
                <input
                  className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleInsertImage();
                    }
                  }}
                />
                <Button size="sm" onClick={handleInsertImage}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImageMenu(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowImageMenu(true)}
                  className="h-8 w-8"
                  title="Insert Image from URL"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Upload Image"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Image</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="image">Select Image</Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </div>
                      {uploadedImage && (
                        <div className="mt-4">
                          <Label>Preview</Label>
                          <div className="mt-2 relative border border-border rounded-md overflow-hidden">
                            <img
                              src={uploadedImage}
                              alt="Preview"
                              className="max-h-[300px] mx-auto"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => {
                                setUploadedImage(null);
                                setUploadedImageName("");
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        onClick={insertUploadedImage}
                        disabled={!uploadedImage}
                      >
                        Insert Image
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {editor && !readOnly && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-background border border-border rounded shadow-sm p-1 flex items-center gap-1"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={
              editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""
            }
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={
              editor.isActive("italic")
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowLinkMenu(true)}
            className={
              editor.isActive("link") ? "bg-accent text-accent-foreground" : ""
            }
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      <div className={cn("relative", isDragging && "bg-primary/5")}>
        {isDragging && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-background/80 px-4 py-2 rounded-md shadow-md text-sm text-foreground">
              Drop image to upload
            </div>
          </div>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none",
            readOnly ? "p-0" : "p-4",
          )}
        />
      </div>
    </div>
  );
}
