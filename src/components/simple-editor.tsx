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
    <div className={`${className}`}>
      <TiptapEditor
        content={content}
        onChange={handleChange}
        className="min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
