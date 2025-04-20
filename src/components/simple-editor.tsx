"use client";

import { useCallback, useState, useEffect } from "react";
import { TiptapEditor } from "@/components/tiptap-editor";

interface SimpleEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function SimpleEditor({
  initialContent = "",
  onUpdate,
  className = "",
}: SimpleEditorProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = useCallback(
    (newValue: string) => {
      setContent(newValue);
      if (onUpdate) {
        onUpdate(newValue);
      }
    },
    [onUpdate],
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* This wrapper div ensures the editor takes up the full available height */}
      <div className="flex flex-col h-full overflow-auto">
        <TiptapEditor
          content={content}
          onChange={handleChange}
          className="flex-1 overflow-auto"
          toolbarClassName="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
        />
      </div>
    </div>
  );
}