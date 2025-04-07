'use client';

import { useCallback, useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, CheckCircle, Clock, History, Share } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SimpleEditor } from '@/components/simple-editor';
import { ShareDialog } from '@/components/share-dialog';
import { VersionHistory } from '@/components/version-history';
import { getDocumentVersions, restoreDocumentVersion } from '@/lib/dummy-data';

interface DocumentEditorProps {
  documentId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSave: (
    title: string,
    content: string,
    categoryId?: string | null,
    versionDescription?: string,
  ) => Promise<{ id: string } | null>;
  onUpdate?: (content: string) => void;
  className?: string;
  categoryId?: string | null;
}

export function DocumentEditor({
  documentId,
  initialTitle = 'Untitled Document',
  initialContent = '',
  onSave,
  onUpdate,
  className = '',
  categoryId = null,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const contentRef = useRef(initialContent);
  const titleRef = useRef(initialTitle);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [versionDescription, setVersionDescription] = useState<string>('');
  const [documentVersions, setDocumentVersions] = useState<any[]>([]);

  // Update title when initialTitle changes
  useEffect(() => {
    setTitle(initialTitle);
    titleRef.current = initialTitle;
  }, [initialTitle]);

  // Fetch document versions when documentId changes
  useEffect(() => {
    if (documentId) {
      const versions = getDocumentVersions(documentId);
      if (versions) {
        setDocumentVersions(versions);
      }
    }
  }, [documentId]);

  // Set up autosave timer
  useEffect(() => {
    if (autoSaveEnabled) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set up a new timer
      autoSaveTimerRef.current = setTimeout(() => {
        if (
          (contentRef.current !== initialContent ||
            titleRef.current !== initialTitle) &&
          saveStatus !== 'saving'
        ) {
          handleSave();
        }
      }, 5000); // Autosave after 5 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, title, autoSaveEnabled, saveStatus]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      contentRef.current = newContent;
      setSaveStatus('unsaved');

      if (onUpdate) {
        onUpdate(newContent);
      }
    },
    [onUpdate],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      titleRef.current = e.target.value;
      setSaveStatus('unsaved');
    },
    [],
  );

  const handleSave = async (description?: string) => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');

    const saveDescription =
      description ||
      versionDescription ||
      `Updated ${new Date().toLocaleString()}`;

    startTransition(async () => {
      try {
        const result = await onSave(
          titleRef.current,
          contentRef.current,
          categoryId,
          saveDescription,
        );

        if (result) {
          setLastSaved(new Date());
          setSaveStatus('saved');
          setVersionDescription('');

          // Refresh versions after save
          if (documentId) {
            const versions = getDocumentVersions(documentId);
            if (versions) {
              setDocumentVersions(versions);
            }
          }

          if (!documentId) {
            // If this was a new document, redirect to the edit page
            router.push(`/documents/${result.id}`);
          }
        }
      } catch (error) {
        console.error('Error saving document:', error);
        toast.error('Failed to save document');
        setSaveStatus('unsaved');
      }
    });
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!documentId) return;

    startTransition(async () => {
      try {
        const restoredDoc = restoreDocumentVersion(documentId, versionId);

        if (restoredDoc) {
          setTitle(restoredDoc.title);
          titleRef.current = restoredDoc.title;
          setContent(restoredDoc.content);
          contentRef.current = restoredDoc.content;
          setLastSaved(new Date());
          setSaveStatus('saved');

          // Refresh versions
          const versions = getDocumentVersions(documentId);
          if (versions) {
            setDocumentVersions(versions);
          }

          toast.success('Version restored successfully');
        } else {
          toast.error('Failed to restore version');
        }
      } catch (error) {
        console.error('Error restoring version:', error);
        toast.error('Failed to restore version');
      }
    });
  };

  const getSaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className="flex items-center text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            {lastSaved ? (
              <span>Saved {formatTimeAgo(lastSaved)}</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
        );
      case 'saving':
        return (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            <span>Saving...</span>
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center text-xs text-amber-500">
            <span>Unsaved changes</span>
          </div>
        );
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} seconds ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24)
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;

    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  };

  // Add beforeunload event listener to warn when closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved') {
        const message =
          'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  return (
    <div
      className={`flex flex-col h-full ${className} bg-background text-foreground`}
    >
      <div className="border-b border-border px-4 py-3 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Untitled Document"
            value={title}
            onChange={handleTitleChange}
            className="text-lg font-medium border-0 bg-transparent text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-2 max-w-md"
          />
          <div className="px-2 mt-1">{getSaveStatusIndicator()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`text-xs px-2 py-1 rounded-md ${
                autoSaveEnabled
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {autoSaveEnabled ? 'Autosave On' : 'Autosave Off'}
            </button>
          </div>

          {/* Version history component */}
          {documentId && documentVersions.length > 0 && (
            <VersionHistory
              documentId={documentId}
              versions={documentVersions}
              onRestoreVersion={handleRestoreVersion}
            />
          )}

          <div className="flex items-center gap-2">
            {saveStatus === 'unsaved' && (
              <input
                type="text"
                placeholder="Version description (optional)"
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                className="text-xs border border-border bg-card text-foreground rounded px-2 py-1 max-w-[180px] placeholder:text-muted-foreground"
              />
            )}

            {documentId ? (
              <ShareDialog documentId={documentId} documentTitle={title} />
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-border bg-card text-muted-foreground"
                onClick={() => {
                  toast('Save your document first before sharing');
                }}
              >
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}

            <Button
              onClick={() => handleSave()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending || saveStatus === 'saving'}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <SimpleEditor
            initialContent={initialContent}
            onUpdate={handleContentChange}
            className="min-h-[calc(100vh-12rem)] prose dark:prose-invert"
          />
        </div>
      </div>
    </div>
  );
}
