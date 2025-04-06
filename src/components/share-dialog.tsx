"use client";

import { useState } from "react";
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
import {
  Share,
  Check,
  Copy,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
}

export function ShareDialog({ documentId, documentTitle }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("link");

  const shareLink = `https://docmentic.com/shared/${documentId}`;
  const documentTitleEncoded = encodeURIComponent(documentTitle);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePublicAccess = () => {
    setIsPublic(!isPublic);
    toast.success(
      isPublic ? "Document set to private" : "Document set to public",
    );
  };

  const socialShareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${documentTitleEncoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
    email: `mailto:?subject=${documentTitleEncoded}&body=${encodeURIComponent(`Check out this document: ${shareLink}`)}`,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#333333] bg-[#1a1a1a] text-white hover:bg-[#222] hover:text-white"
        >
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#333333] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this document with others via link or social media.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-2">
          <Switch
            id="public-access"
            checked={isPublic}
            onCheckedChange={togglePublicAccess}
          />
          <Label htmlFor="public-access" className="text-white">
            {isPublic ? "Public document" : "Private document"}
          </Label>
        </div>

        {!isPublic && (
          <div className="bg-[#111] border border-yellow-800 text-yellow-400 p-3 rounded-md text-sm mb-4">
            <div className="flex items-start space-x-2">
              <X className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                This document is currently private. Enable public access to
                share it with others who don't have a Docmentic account.
              </p>
            </div>
          </div>
        )}

        <Tabs
          defaultValue="link"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 bg-[#111111]">
            <TabsTrigger
              value="link"
              className="data-[state=active]:bg-[#1a3c56]"
            >
              Share Link
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-[#1a3c56]"
            >
              Social Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Share Link
                </Label>
                <Input
                  id="link"
                  value={shareLink}
                  readOnly
                  className="bg-[#111111] border-[#333333] text-white focus-visible:ring-[#1a3c56]"
                />
              </div>
              <Button
                size="icon"
                className={`${copied ? "bg-green-600" : "bg-[#1a3c56]"} hover:bg-blue-700`}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Permission settings</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="view-only"
                    name="permission"
                    className="border-[#333333] bg-[#111111]"
                    defaultChecked
                  />
                  <Label htmlFor="view-only">View only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="can-comment"
                    name="permission"
                    className="border-[#333333] bg-[#111111]"
                  />
                  <Label htmlFor="can-comment">Can comment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="can-edit"
                    name="permission"
                    className="border-[#333333] bg-[#111111]"
                  />
                  <Label htmlFor="can-edit">Can edit</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="pt-4">
            <div className="grid grid-cols-3 gap-4">
              <a
                href={socialShareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-[#111111] border border-[#333333] rounded-md hover:bg-[#222] transition-colors"
              >
                <Twitter className="h-6 w-6 text-[#1DA1F2] mb-2" />
                <span className="text-sm">Twitter</span>
              </a>

              <a
                href={socialShareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-[#111111] border border-[#333333] rounded-md hover:bg-[#222] transition-colors"
              >
                <Linkedin className="h-6 w-6 text-[#0A66C2] mb-2" />
                <span className="text-sm">LinkedIn</span>
              </a>

              <a
                href={socialShareLinks.email}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 bg-[#111111] border border-[#333333] rounded-md hover:bg-[#222] transition-colors"
              >
                <Mail className="h-6 w-6 text-[#EA4335] mb-2" />
                <span className="text-sm">Email</span>
              </a>
            </div>

            <div className="mt-6">
              <Button
                className="w-full bg-[#1a3c56] hover:bg-blue-700"
                onClick={handleCopy}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="border-[#333333] bg-[#111111] hover:bg-[#222] text-white w-full"
            onClick={() => toast.success("Invitation sent!")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Invite specific people
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
