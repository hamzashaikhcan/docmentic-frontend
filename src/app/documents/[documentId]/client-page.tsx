"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileText,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import axiosClient from '@/lib/axiosClient';
import { formatDistance, format } from 'date-fns';

// Import custom components
import Badge from '@/components/custom/Badge';
import Tooltip from '@/components/custom/Tooltip';
import Accordion, { AccordionItem } from '@/components/custom/Accordion';
import DocumentSection, { DocumentVersion } from '@/components/document/DocumentSection';
import VersionItem, {

} from '@/components/document/VersionItem';
import ShareDocument, {
  DocumentShare,
} from '@/components/document/ShareDocument';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: User;
  versions: DocumentVersion[];
  shares: DocumentShare[];
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.documentId as string;
  const { user } = useAuth();

  const [document, setDocument] = useState<Document | null>(null);
  const [activeVersion, setActiveVersion] = useState<any | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      setLoading(true);
      try {
        const response = await axiosClient.get(`/api/documents/${documentId}`);
        setDocument(response.data);

        // Set the latest version as active by default
        if (response.data.versions && response.data.versions.length > 0) {
          const latestVersion = response.data.versions.reduce(
            (latest: DocumentVersion, current: DocumentVersion) =>
              current.version_number > latest.version_number ? current : latest,
          );
          setActiveVersion(latestVersion);
        }
      } catch (err: any) {
        console.error('Failed to fetch document:', err);
        setError('Could not load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <FileText className="h-12 w-12 animate-pulse text-muted-foreground" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle error or document not found
  if (error || !document) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-destructive">
                Document not found
              </h1>
            </div>
            <p className="text-muted-foreground">
              {error ||
                'The requested document does not exist or you may not have permission to view it.'}
            </p>
            <Button className="mt-4" onClick={() => router.push('/documents')}>
              Back to Documents
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Format dates
  const createdAt = new Date(document.created_at);
  const updatedAt = new Date(document.updated_at);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const refreshDocument = async () => {
    try {
      const response = await axiosClient.get(`/api/documents/${documentId}`);
      setDocument(response.data);
    } catch (err) {
      console.error('Failed to refresh document:', err);
    }
  };

  // Render document details
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Document Title and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <p className="text-muted-foreground mt-1">
                {document.description.length > 300
                  ? `${document.description.substring(0, 300)}...`
                  : document.description}
              </p>
            </div>
            <div className="flex space-x-2">
              {/* Only show edit if current user is the document owner */}
              {user?.id === document.owner_id && (
                <Button variant="outline" asChild>
                  <Link href={`/documents/edit/${document.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              <ShareDocument
                documentId={document.id}
                shares={document.shares}
                onSharesUpdated={refreshDocument}
              />
              <Button onClick={() => router.push('/documents')}>
                All Documents
              </Button>
            </div>
          </div>

          {/* Document Metadata */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{document.owner?.full_name || 'Unknown User'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Updated{' '}
                {formatDistance(updatedAt, new Date(), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Created{' '}
                {formatDistance(createdAt, new Date(), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Badge variant={document.is_public ? 'success' : 'secondary'}>
                {document.is_public ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="w-full mb-6">
            <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4">
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                  activeTab === 'summary'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => handleTabChange('summary')}
              >
                Summary
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                  activeTab === 'versions'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => handleTabChange('versions')}
              >
                Versions ({document.versions?.length || 0})
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                  activeTab === 'content'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => handleTabChange('content')}
              >
                Content
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                  activeTab === 'details'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted-foreground/20'
                }`}
                onClick={() => handleTabChange('details')}
              >
                Details
              </button>
            </div>

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Business Summary</CardTitle>
                  <CardDescription>
                    Overview of the document purpose and business context
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  {activeVersion?.business_summary ? (
                    <p>{activeVersion.business_summary}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No business summary provided
                    </p>
                  )}
                </CardContent>
                {activeVersion?.output_file && (
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Version {activeVersion.version_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated:{' '}
                        {activeVersion.finished_at
                          ? format(new Date(activeVersion.finished_at), 'PPP')
                          : 'N/A'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={activeVersion.output_file}
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
            )}

            {/* Versions Tab */}
            {activeTab === 'versions' && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Document Versions</CardTitle>
                  <CardDescription>
                    All versions of this document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {document.versions && document.versions.length > 0 ? (
                    <div className="space-y-4">
                      {document.versions
                        .sort((a, b) => b.version_number - a.version_number)
                        .map((version) => (
                          <VersionItem
                            key={version.id}
                            version={version}
                            isActive={activeVersion?.id === version.id}
                            onSelect={setActiveVersion}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No version history available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Document Content</CardTitle>
                  <CardDescription>
                    Content sections and structure for version{' '}
                    {activeVersion?.version_number || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeVersion?.sections &&
                  activeVersion.sections.length > 0 ? (
                    <Accordion>
                      {activeVersion.sections
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((section: any) => (
                          <DocumentSection key={section.id} section={section} />
                        ))}
                    </Accordion>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No content sections available
                    </div>
                  )}
                </CardContent>
                {activeVersion?.output_file && (
                  <CardFooter className="bg-muted/50">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="ml-auto"
                    >
                      <a
                        href={activeVersion.output_file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Full Document
                      </a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                  <CardDescription>
                    Technical details and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Document Information
                      </h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">ID:</dt>
                          <dd className="font-mono text-xs">{document.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Owner:</dt>
                          <dd>
                            {document.owner?.full_name ||
                              document.owner?.email ||
                              'Unknown'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Created:</dt>
                          <dd>{format(createdAt, 'PPP')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Updated:</dt>
                          <dd>{format(updatedAt, 'PPP')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Visibility:</dt>
                          <dd>
                            <Badge
                              variant={
                                document.is_public ? 'success' : 'secondary'
                              }
                            >
                              {document.is_public ? 'Public' : 'Private'}
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {activeVersion && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Version Configuration
                        </h3>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Version:</dt>
                            <dd>{activeVersion.version_number}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Status:</dt>
                            <dd>
                              <Badge
                                variant={
                                  activeVersion.status === 'completed'
                                    ? 'success'
                                    : 'secondary'
                                }
                              >
                                {activeVersion.status}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Created:</dt>
                            <dd>
                              {format(
                                new Date(activeVersion.created_at),
                                'PPP',
                              )}
                            </dd>
                          </div>
                          {activeVersion.finished_at && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">
                                Completed:
                              </dt>
                              <dd>
                                {format(
                                  new Date(activeVersion.finished_at),
                                  'PPP',
                                )}
                              </dd>
                            </div>
                          )}
                          {activeVersion.execution_time && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">
                                Execution Time:
                              </dt>
                              <dd>
                                {activeVersion.execution_time.toFixed(2)}s
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </div>

                  {activeVersion?.config?.company_name && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2">Company</h3>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">
                          {activeVersion.config.company_name}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => router.push('/documents')}>
              Back to Documents
            </Button>
            {activeVersion?.output_file && (
              <Button asChild>
                <a
                  href={activeVersion.output_file}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </a>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}