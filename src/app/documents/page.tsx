"use client";

import Link from "next/link";
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  FileText,
  FilePlus,
  Clock,
  ChevronRight,
  FileStack,
  Trash2,
} from 'lucide-react';
import axiosClient from '@/lib/axiosClient';
import { useEffect, useState } from 'react';
import DocumentGenerationModal from '@/components/document-generation-modal';

const formatRelativeTime = (dateString: any) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) return 'just now';
  if (diffInSeconds < hour)
    return `${Math.floor(diffInSeconds / minute)} min ago`;
  if (diffInSeconds < day)
    return `${Math.floor(diffInSeconds / hour)} hours ago`;
  if (diffInSeconds < month)
    return `${Math.floor(diffInSeconds / day)} days ago`;
  if (diffInSeconds < year)
    return `${Math.floor(diffInSeconds / month)} months ago`;
  return `${Math.floor(diffInSeconds / year)} years ago`;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDocuments = async () => {
    try {
      const response = await axiosClient.get('/api/documents');
      setDocuments(response?.data?.owned_documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (e: any) => {
    if (!prompt) {
      return;
    }

    // Open the modal instead of navigating
    setIsModalOpen(true);

    // We can prevent the default action as we're handling it with the modal
    e.preventDefault();
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeleting(true);
      await axiosClient.delete(`/api/documents/${documentToDelete}`);
      // Remove the deleted document from the list
      setDocuments(documents.filter((doc: any) => doc.id !== documentToDelete));
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main className="container py-12 px-4 md:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
              Your Documents
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage, view, and track your document versions
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FilePlus className="mr-2 h-5 w-5" />
            Create New
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No Documents Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start your productivity journey by creating your first document.
              Organize your ideas, notes, and projects in one place.
            </p>
            <Button
              onClick={() => router.push('/documents/new')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FilePlus className="mr-2 h-5 w-5" />
              Create First Document
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative"
                >
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <button
                        onClick={() => setDocumentToDelete(doc.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" color="red" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 pt-12">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 pr-4">
                        {doc.title}
                      </h3>
                      {doc.is_public !== undefined && (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            doc.is_public
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {doc.is_public ? 'Public' : 'Private'}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {doc.description || 'No description available'}
                    </p>

                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                          Updated {formatRelativeTime(doc.updated_at)}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileStack className="mr-2 h-4 w-4" />
                        <span>
                          {doc.versions?.length || 0} Version
                          {(doc.versions?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full mr-2"
                        >
                          <Link href={`/documents/${doc.id}/`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>

                        <Link
                          href={`/documents/${doc.id}/`}
                          className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delete Confirmation Modal */}
            {documentToDelete && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card rounded-lg p-6 max-w-sm w-full border border-border shadow-lg">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Delete Document
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Are you sure you want to delete this document? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      disabled={deleting}
                      onClick={() => setDocumentToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleting}
                      onClick={handleDeleteDocument}
                    >
                      {deleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <DocumentGenerationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialPrompt={''}
        />
      </main>
    </div>
  );
}