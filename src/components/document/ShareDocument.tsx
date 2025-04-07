// components/document/ShareDocument.tsx
"use client";

import { useState } from "react";
import { Share2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axiosClient from "@/lib/axiosClient";
import Tooltip from "../custom/Tooltip";

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_email: string;
  can_edit: boolean;
  created_at: string;
}

interface ShareDocumentProps {
  documentId: string;
  shares: DocumentShare[];
  onSharesUpdated: () => void;
}

const ShareDocument = ({ documentId, shares, onSharesUpdated }: ShareDocumentProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShareDocument = async () => {
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await axiosClient.post(`/api/documents/${documentId}/share`, {
        email: email.trim(),
        can_edit: canEdit,
      });
      
      setSuccess(true);
      setEmail("");
      setCanEdit(false);
      onSharesUpdated();
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to share document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await axiosClient.delete(`/api/documents/${documentId}/share/${shareId}`);
      onSharesUpdated();
    } catch (err: any) {
      console.error("Failed to remove share:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {shares.length > 0 ? (
          <Tooltip
            content={
              <div className="p-2">
                <p className="font-semibold">Shared with:</p>
                <ul className="mt-1">
                  {shares.map((share) => (
                    <li key={share.id}>{share.shared_email}</li>
                  ))}
                </ul>
              </div>
            }
          >
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Shared ({shares.length})
            </Button>
          </Tooltip>
        ) : (
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share this document with others by email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="can-edit"
              checked={canEdit}
              onCheckedChange={setCanEdit}
              disabled={isSubmitting}
            />
            <Label htmlFor="can-edit">Allow editing</Label>
          </div>
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          {success && (
            <div className="flex items-center text-sm text-green-500">
              <Check className="mr-1 h-4 w-4" />
              Document shared successfully!
            </div>
          )}
        </div>
        
        {shares.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Currently shared with:</h4>
            <ul className="space-y-2">
              {shares.map((share) => (
                <li key={share.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{share.shared_email}</span>
                    {share.can_edit && (
                      <span className="text-xs text-muted-foreground">(Can edit)</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveShare(share.id)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleShareDocument} disabled={isSubmitting}>
            {isSubmitting ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDocument;