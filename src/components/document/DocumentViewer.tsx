"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Clock, Edit } from "lucide-react";
import { formatDistance } from "date-fns";

interface DocumentContent {
  id: string;
  content: string;
  order: number;
}

interface DocumentSection {
  id: string;
  title: string;
  order: number;
  content_chunks: DocumentContent[];
}

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  status: string;
  business_summary: string | null;
  created_at: string;
  finished_at: string | null;
  sections: DocumentSection[];
  content_chunks: DocumentContent[];
  output_file: string | null;
}

interface DocumentViewerProps {
  title: string;
  description: string | null;
  content: string;
  versions: DocumentVersion[];
  onEdit: () => void;
  documentId: string;
}

export function DocumentViewer({
  title,
  description,
  content,
  versions,
  onEdit,
  documentId
}: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState("content");
  
  // Get latest version with proper type safety
  const latestVersion = versions && versions.length > 0 
    ? versions.reduce((latest, current) => 
        (current.version_number > latest.version_number ? current : latest), 
        versions[0]
      )
    : null;
    
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      {latestVersion && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Clock className="h-4 w-4" />
          <span>Last updated {formatDate(latestVersion.created_at)}</span>
        </div>
      )}
      
      <Tabs 
        defaultValue="content" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="content">Document</TabsTrigger>
          {latestVersion?.business_summary && (
            <TabsTrigger value="summary">Summary</TabsTrigger>
          )}
          {versions.length > 1 && (
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {latestVersion && (
                <CardDescription>
                  Version {latestVersion.version_number}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </CardContent>
            {latestVersion?.output_file && (
              <CardFooter className="flex justify-end border-t bg-muted/50 p-4">
                <Button asChild variant="outline" size="sm">
                  <a 
                    href={latestVersion.output_file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Document
                  </a>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {latestVersion?.business_summary && (
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{latestVersion.business_summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {versions.length > 1 && (
          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Previous versions of this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions
                    .sort((a, b) => b.version_number - a.version_number)
                    .map((version) => (
                      <div 
                        key={version.id} 
                        className="p-4 rounded-md bg-muted/50"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Version {version.version_number}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {formatDate(version.created_at)}
                            </p>
                          </div>
                          {version.output_file && (
                            <Button size="sm" variant="ghost" asChild>
                              <a 
                                href={version.output_file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}