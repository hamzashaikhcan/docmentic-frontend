import React, { useEffect, useRef, TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, maxRows = 5, ...props }, forwardedRef) => {
  // Create a local ref to use if no ref is forwarded
  const innerRef = useRef<HTMLTextAreaElement>(null);

  // Determine which ref to use (forwarded or inner)
  const textareaRef = (forwardedRef ||
    innerRef) as React.RefObject<HTMLTextAreaElement>;

  // State to track if we should show scrollbar
  const [shouldScroll, setShouldScroll] = React.useState(false);

  // Function to resize the textarea
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto so we can get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate the number of rows based on line breaks and content length
    const lineBreaks = (textarea.value.match(/\n/g) || []).length;
    // Approximation: divide content length by average chars per line (assuming ~60 chars per line)
    const contentLines = Math.ceil(textarea.value.length / 60);
    // Use the larger of the two calculations
    const lineCount = Math.max(lineBreaks + 1, contentLines);

    // Get the scrollHeight (height of content)
    const scrollHeight = textarea.scrollHeight;

    // Get line height (approximation)
    const lineHeight =
      parseInt(window.getComputedStyle(textarea).lineHeight) || 20;

    // Calculate max height based on maxRows
    const maxHeight = lineHeight * maxRows;

    // Determine if we need scrolling
    const needsScrolling = scrollHeight > maxHeight || lineCount > maxRows;
    setShouldScroll(needsScrolling);

    // Set height to either scrollHeight or maxHeight, whichever is smaller
    if (!needsScrolling) {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "scroll"; // Force scrollbar to appear
    }
  };

  // Resize on value change and on mount
  useEffect(() => {
    resizeTextarea();
  }, [props.value]);

  // Force a resize on component mount
  useEffect(() => {
    resizeTextarea();
  }, []);

  return (
    <Textarea
      ref={textareaRef}
      className={`transition-height duration-200 resize-none min-h-[40px] ${shouldScroll ? "overflow-y-scroll" : "overflow-y-hidden"} ${className || ""}`}
      onInput={resizeTextarea}
      rows={1}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
