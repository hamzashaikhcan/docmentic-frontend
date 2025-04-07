"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, X, Plus, AlertTriangle, GripVertical } from "lucide-react";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { MAX_SECTIONS, OFFENSIVE_WORDS } from "@/lib/constants";
import axiosClient from '@/lib/axiosClient';

const DEFAULT_SECTIONS = [
  'Executive Summary',
  'Introduction',
  'Main Content',
  'Conclusion',
];

// Utility Functions
const cleanSectionName = (name: string): string =>
  name.replace(/[.,:;!?]+$/, '').trim();

const containsOffensiveWords = (text: string): boolean => {
  if (!text) return false;

  const cleanedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  return OFFENSIVE_WORDS.some(
    (word) =>
      cleanedText.split(/\s+/).includes(word) || cleanedText.includes(word),
  );
};

// Main Component
export const DocumentGenerationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
}> = ({ isOpen, onClose, initialPrompt }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const sectionInputRef = useRef<HTMLInputElement>(null);
  // State Management
  const [formState, setFormState] = useState({
    title: '',
    description: initialPrompt || '',
    businessSummary: '',
    companyName: '',
    isPublic: false,
  });

  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [newSection, setNewSection] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Effect for Company Name and Initial Setup
  useEffect(() => {
    const userData = JSON.parse(String(localStorage.getItem('session')));
    setFormState((prev) => ({
      ...prev,
      description: initialPrompt,
      companyName: userData?.user?.company || '',
    }));
  }, [initialPrompt]);

  // Input Change Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        [id.replace('document-', '')]: value,
      }));
    },
    [],
  );

  // Section Management
  const addSection = useCallback(() => {
    // Reset error
    setSectionError('');

    // Clean section name
    const trimmedSection = cleanSectionName(newSection);

    // Validation checks
    if (!trimmedSection) {
      setSectionError('Section name cannot be empty');
      return;
    }

    if (containsOffensiveWords(trimmedSection)) {
      setSectionError('Section name contains inappropriate language');
      return;
    }

    if (
      sections.some(
        (section) => section.toLowerCase() === trimmedSection.toLowerCase(),
      )
    ) {
      setSectionError('This section already exists');
      return;
    }

    if (sections.length >= MAX_SECTIONS) {
      setSectionError('Maximum sections reached');
      return;
    }

    // Add section
    setSections((prev) => [...prev, trimmedSection]);
    setNewSection('');
  }, [newSection, sections]);

  const removeSection = useCallback((sectionToRemove: string) => {
    setSections((prev) =>
      prev.filter((section) => section !== sectionToRemove),
    );
  }, []);

  const editSection = useCallback(
    (section: string) => {
      // Remove section and populate input
      removeSection(section);
      setNewSection(section);

      // Focus input
      sectionInputRef.current?.focus();
    },
    [removeSection],
  );

  // Drag and Drop Handler
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      // If dropped outside the list or in the same position
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        return;
      }

      // Reorder sections
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);

      setSections(newSections);
    },
    [sections],
  );

  // Form Submission
  const handleGenerate = useCallback(async () => {
    const { title, description, companyName, businessSummary, isPublic } =
      formState;

    // Validation
    if (!title || !description || !companyName || !businessSummary) {
      return;
    }

    setIsGenerating(true);

    try {
      //   const response = await fetch("/api/documents", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       title,
      //       description,
      //       sections,
      //       business_summary: businessSummary,
      //       config: {
      //         target_words: 1000,
      //         max_workers: 4,
      //         company_name: companyName,
      //       },
      //       is_public: isPublic,
      //     }),
      //   });

      const body = {
        title,
        description,
        sections,
        business_summary: businessSummary,
        config: {
          target_words: 1000,
          max_workers: 4,
          company_name: companyName,
        },
        is_public: isPublic,
      };
      const response = await axiosClient.post('/api/documents', body);
      if (response) {
        router.push(`/documents/${response?.data.id}`);
      } else {
        console.error('Failed to generate document');
        setIsGenerating(false);
      }

      //   if (response.ok) {
      //     const data = await response.json();
      //     router.push(`/documents/${data.id}`);
      //   } else {
      //     console.error('Failed to generate document');
      //     setIsGenerating(false);
      //   }
    } catch (error) {
      console.error('Error generating document:', error);
      setIsGenerating(false);
    }
  }, [formState, sections, router]);

  // Modal Close Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] 
        overflow-hidden border border-border flex flex-col"
      >
        {/* Header */}
        <div className="bg-card/95 backdrop-blur-sm flex justify-between items-center p-4 border-b border-border/20 rounded-t-2xl">
          <h2 className="text-xl font-bold text-foreground">Create Document</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-background/10 
          scrollbar-thumb-[#121212]/50 hover:scrollbar-thumb-[#121212]/70 px-6 pb-6"
        >
          <div className="space-y-5 pt-6">
            {/* Title Field */}
            <div>
              <Label htmlFor="document-title" className="text-sm font-semibold">
                Document Title*
              </Label>
              <Input
                id="document-title"
                value={formState.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive document title"
                className="mt-2 bg-secondary/30 border-border/50 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <Label
                htmlFor="document-description"
                className="text-sm font-semibold"
              >
                Description*
              </Label>
              <AutoResizeTextarea
                id="document-description"
                value={formState.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed overview of the document's purpose and content"
                className="mt-2 min-h-[100px] w-full bg-secondary/30 border-border/50 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            {/* Company Name and Business Summary Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="document-companyName"
                  className="text-sm font-semibold"
                >
                  Company Name*
                </Label>
                <Input
                  id="document-companyName"
                  value={formState.companyName}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                  className="mt-2 bg-secondary/30 border-border/50 focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="document-businessSummary"
                  className="text-sm font-semibold"
                >
                  Business Summary*
                </Label>
                <AutoResizeTextarea
                  id="document-businessSummary"
                  value={formState.businessSummary}
                  onChange={handleInputChange}
                  placeholder="Brief company overview and goals"
                  className="mt-2 min-h-[50px] w-full bg-secondary/30 border-border/50 focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
            </div>

            {/* Document Sections */}
            <div>
              <Label className="text-sm font-semibold">Document Sections</Label>
              <div className="flex mt-2 space-x-2">
                <Input
                  ref={sectionInputRef}
                  id="new-section-input"
                  value={newSection}
                  onChange={(e) => {
                    setNewSection(e.target.value);
                    setSectionError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSection();
                    }
                  }}
                  placeholder={
                    sections.length >= MAX_SECTIONS
                      ? 'Maximum sections reached'
                      : `Add a new section (${
                          MAX_SECTIONS - sections.length
                        } remaining)`
                  }
                  disabled={sections.length >= MAX_SECTIONS}
                  className="flex-1 bg-secondary/30 border-border/50 focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  onClick={addSection}
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={
                    sections.length >= MAX_SECTIONS || !newSection.trim()
                  }
                  className="flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>

              {/* Error Message */}
              {sectionError && (
                <div className="flex items-center text-destructive text-xs mt-1">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {sectionError}
                </div>
              )}

              {/* Section List with Drag and Drop */}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="mt-3 p-3 bg-secondary/20 rounded-md"
                    >
                      <div className="flex flex-wrap gap-2">
                        {sections.map((section, index) => (
                          <Draggable
                            key={section}
                            draggableId={section}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center bg-background px-3 py-1 rounded-full 
                                  text-sm border border-border/30 
                                  cursor-pointer hover:bg-secondary/30 
                                  transition-colors duration-200 group
                                  ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-2 cursor-move"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span
                                  className="group-hover:text-primary flex-grow"
                                  onClick={() => editSection(section)}
                                >
                                  {section}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSection(section);
                                  }}
                                  className="ml-2 text-muted-foreground hover:text-destructive"
                                  title="Remove section"
                                >
                                  &times;
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between border-t border-border/20 pt-4">
              <div className="flex items-center space-x-3">
                <Switch
                  id="document-isPublic"
                  checked={formState.isPublic}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
                <Label
                  htmlFor="document-isPublic"
                  className="text-sm font-medium cursor-pointer"
                >
                  Make this document public
                </Label>
              </div>

              <div className="text-xs text-muted-foreground">
                {sections.length}/{MAX_SECTIONS} sections
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border/20 p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={
              !formState.title ||
              !formState.description ||
              !formState.businessSummary ||
              !formState.companyName ||
              isGenerating
            }
            className="bg-primary hover:bg-primary/90 group"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-1 h-4 w-4 group-hover:animate-pulse" />
                Generate Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerationModal;
