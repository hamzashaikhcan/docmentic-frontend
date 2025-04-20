// components/document/VersionItem.jsx
"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Badge from "../custom/Badge";

const VersionItem = ({ version, isActive, onSelect, onViewContent }: any) => {
  if (!version) return null;

  return (
    <div
      className={`p-4 rounded-md ${
        isActive ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">Version {version.version_number}</p>
            <Badge
              variant={version.status === 'completed' ? 'success' : 'secondary'}
            >
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
            onClick={() => {
              onSelect(version);
              onViewContent();
            }}
          >
            View
          </Button>
          {version.output_file && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={version.output_file}
                target="_blank"
                rel="noopener noreferrer"
              >
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