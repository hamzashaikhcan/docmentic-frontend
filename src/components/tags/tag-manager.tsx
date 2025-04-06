"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";
import { Tag, X, Plus, Hash } from "lucide-react";

interface DocumentTag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  documentId: string;
  initialTags: DocumentTag[];
  onAddTag?: (tagName: string, color: string) => Promise<void>;
  onRemoveTag?: (tagId: string) => Promise<void>;
}

export function TagManager({
  documentId,
  initialTags = [],
  onAddTag,
  onRemoveTag,
}: TagManagerProps) {
  const [tags, setTags] = useState<DocumentTag[]>(initialTags);
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6"); // Default blue
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const handleAddTag = async () => {
    if (newTagName.trim() === "") return;

    try {
      setIsSubmitting(true);

      if (onAddTag) {
        await onAddTag(newTagName.trim(), newTagColor);
        setNewTagName("");
        setNewTagColor("#3b82f6"); // Reset to default
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Failed to add tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      if (onRemoveTag) {
        await onRemoveTag(tagId);
      }
    } catch (error) {
      toast.error("Failed to remove tag");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color }}
          variant="secondary"
          className="flex items-center gap-1 text-white"
        >
          <Hash className="h-3 w-3" />
          {tag.name}
          {onRemoveTag && (
            <button
              className="ml-1 rounded-full hover:bg-white/20 h-4 w-4 inline-flex items-center justify-center"
              onClick={() => handleRemoveTag(tag.id)}
            >
              <X className="h-2 w-2" />
            </button>
          )}
        </Badge>
      ))}

      {onAddTag && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h4 className="font-medium text-sm">Add new tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <div
                    className="h-9 w-9 rounded-md cursor-pointer border"
                    style={{ backgroundColor: newTagColor }}
                    onClick={() => setIsOpen(true)}
                  />
                </div>
                <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTagName.trim() || isSubmitting}
                    size="sm"
                  >
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
