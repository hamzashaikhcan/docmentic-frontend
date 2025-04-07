// components/document/VersionItem.tsx
"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Badge from "../custom/Badge";

interface VersionConfig {
  max_workers: number;
  company_name: string;
  target_words: number;
  [key: string]: any;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  status: string;
  progress: number;
  config: VersionConfig | null;
  business_summary: string | null;
  output_file: string | null;
  error: string | null;
  celery_task_id: string | null;
  created_at: string;
  finished_at: string | null;
  execution_time: number | null;
}

interface VersionItemProps {
  version: DocumentVersion;
  isActive: boolean;
  onSelect: (version: DocumentVersion) => void;
}

const VersionItem = ({ version, isActive, onSelect }: any) => {
  if (!version) return null;

  return (
    <div 
      className={`p-4 rounded-md ${isActive ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">Version {version.version_number}</p>
            <Badge variant={version.status === "completed" ? "success" : "secondary"}>
              {version.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Created: {format(new Date(version.created_at), 'PPP')}
          </p>
          {version.finished_at && (
            <p className="text-xs text-muted-foreground">
              Completed: {format(new Date(version.finished_at), 'PPP')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSelect(version)}
          >
            View
          </Button>
          {version.output_file && (
            <Button variant="outline" size="sm" asChild>
              <a href={version.output_file} target="_blank" rel="noopener noreferrer">
                <Download className="mr-1 h-3 w-3" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionItem;