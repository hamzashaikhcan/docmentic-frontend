"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  History,
  Clock,
  RotateCcw,
  CheckCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";
import type { DocumentVersion } from "@/lib/dummy-data";
import { TiptapEditor } from "@/components/tiptap-editor";

interface VersionHistoryProps {
  documentId: string;
  versions: DocumentVersion[];
  onRestoreVersion: (versionId: string) => void;
  currentVersionId?: string;
}

export function VersionHistory({
  documentId,
  versions,
  onRestoreVersion,
  currentVersionId,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [previewingVersion, setPreviewingVersion] =
    useState<DocumentVersion | null>(null);

  // Get the current version (latest) if not specified
  const currentVersion = currentVersionId
    ? versions.find((v) => v.id === currentVersionId)
    : versions[0];

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRestoreVersion = (versionId: string) => {
    onRestoreVersion(versionId);
    setOpen(false);
    setPreviewingVersion(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" /> Version History
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <History className="h-5 w-5" /> Document Version History
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {previewingVersion ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="pb-2 mb-2 border-b flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewingVersion(null)}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to versions
                </Button>
                <div className="flex-1" />
                <Button
                  onClick={() => handleRestoreVersion(previewingVersion.id)}
                  className="gap-1"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4" /> Restore This Version
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="mb-4">
                  <h3 className="font-medium text-lg">
                    {previewingVersion.title}
                  </h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(previewingVersion.createdAt)}</span>
                    <span className="mx-1">•</span>
                    <span>{previewingVersion.createdBy}</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {previewingVersion.description}
                  </p>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <TiptapEditor
                    content={previewingVersion.content}
                    onChange={() => {}}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Versions List */}
              <div className="w-1/3 overflow-auto pr-1 border-r">
                <h3 className="font-medium mb-3">
                  Versions ({versions.length})
                </h3>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card
                      key={version.id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                        currentVersion?.id === version.id &&
                        "border-primary bg-primary/5"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium truncate flex items-center gap-1">
                            {currentVersion?.id === version.id && (
                              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                            )}
                            <span className="truncate">{version.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline" />
                            {formatDistanceToNow(version.createdAt, {
                              addSuffix: true,
                            })}
                          </div>
                          <p className="text-xs mt-1 line-clamp-2">
                            {version.description}
                          </p>
                        </div>

                        <div className="ml-2 flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPreviewingVersion(version)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {currentVersion?.id !== version.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRestoreVersion(version.id)}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Current version preview */}
              <div className="flex-1 overflow-auto">
                <h3 className="font-medium mb-3">Current Version</h3>
                {currentVersion && (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium text-lg">
                        {currentVersion.title}
                      </h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(currentVersion.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span>{currentVersion.createdBy}</span>
                      </div>
                      <p className="mt-1 text-sm">
                        {currentVersion.description}
                      </p>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <TiptapEditor
                        content={currentVersion.content}
                        onChange={() => {}}
                        readOnly={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
