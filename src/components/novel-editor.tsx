"use client";

import { useCallback, useEffect, useRef } from "react";
import { Editor as NovelEditor } from "novel";

interface EditorWrapperProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function EditorWrapper({
  initialContent = "",
  onUpdate,
  className = "",
}: EditorWrapperProps) {
  const editorRef = useRef<any>(null);

  const handleUpdate = useCallback(
    ({ editor }: any) => {
      if (onUpdate) {
        try {
          const json = editor.getJSON();
          onUpdate(JSON.stringify(json));
        } catch (error) {
          console.error("Error updating content:", error);
        }
      }
    },
    [onUpdate],
  );

  // Parse the initialContent if it's a JSON string
  const getInitialValue = useCallback(() => {
    if (!initialContent) return undefined;

    try {
      return JSON.parse(initialContent);
    } catch (e) {
      console.error("Failed to parse initial content:", e);
      return undefined;
    }
  }, [initialContent]);

  return (
    <div className={className}>
      {typeof window !== "undefined" && (
        <NovelEditor
          defaultValue={getInitialValue()}
          onUpdate={handleUpdate}
          className={className}
        />
      )}
    </div>
  );
}
