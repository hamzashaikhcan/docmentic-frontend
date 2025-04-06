"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Plus, X, Check, MailPlus, UserPlus } from "lucide-react";
import type { WebrtcProvider } from "y-webrtc";
import { getConnectedUsers } from "@/lib/collaboration";

interface Collaborator {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  permission: string;
  online?: boolean;
  color?: string;
}

interface CollaboratorsListProps {
  documentId: string;
  webrtcProvider?: WebrtcProvider;
  collaborators: Collaborator[];
  onAddCollaborator?: (email: string, permission: string) => Promise<void>;
  onRemoveCollaborator?: (userId: string) => Promise<void>;
  onUpdateCollaborator?: (userId: string, permission: string) => Promise<void>;
}

export function CollaboratorsList({
  documentId,
  webrtcProvider,
  collaborators,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdateCollaborator,
}: CollaboratorsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorPermission, setNewCollaboratorPermission] =
    useState("view");
  const [activeCollaborators, setActiveCollaborators] = useState<
    Record<string, { name: string; color: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  // If we have the webrtc provider, listen for active collaborators
  useEffect(() => {
    if (!webrtcProvider) return;

    const unsubscribe = webrtcProvider.awareness.on("change", () => {
      const connected = getConnectedUsers(webrtcProvider);

      const activeUsers: Record<string, { name: string; color: string }> = {};
      connected.forEach((user) => {
        activeUsers[user.name] = {
          name: user.name,
          color: user.color,
        };
      });

      setActiveCollaborators(activeUsers);
    });

    return () => {
      webrtcProvider.awareness.off("change", unsubscribe);
    };
  }, [webrtcProvider]);

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail) return;

    try {
      setSubmitting(true);

      if (onAddCollaborator) {
        await onAddCollaborator(
          newCollaboratorEmail,
          newCollaboratorPermission,
        );
        toast.success(`Invited ${newCollaboratorEmail} to collaborate`);
        setNewCollaboratorEmail("");
      }
    } catch (error) {
      toast.error("Failed to add collaborator");
    } finally {
      setSubmitting(false);
      setIsOpen(false);
    }
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Users className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Manage collaborators</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Collaborators</h4>
              {onAddCollaborator && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-52 overflow-auto">
              {collaborators.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No collaborators yet
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={""} alt={collaborator.name || ""} />
                        <AvatarFallback
                          style={{
                            backgroundColor: collaborator.color || "#3b82f6",
                          }}
                          className="text-white"
                        >
                          {collaborator.name?.charAt(0) ||
                            collaborator.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="leading-none">
                          {collaborator.name || collaborator.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {collaborator.permission}
                          {collaborator.online ||
                          activeCollaborators[collaborator.email || ""] ? (
                            <span className="text-green-500 ml-1">
                              • online
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    {onRemoveCollaborator && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          if (onRemoveCollaborator) {
                            onRemoveCollaborator(collaborator.userId);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {onAddCollaborator && (
              <div className="space-y-2 pt-2 border-t">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      placeholder="collaborator@example.com"
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    />
                    <Select
                      value={newCollaboratorPermission}
                      onValueChange={setNewCollaboratorPermission}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!newCollaboratorEmail || submitting}
                    onClick={handleAddCollaborator}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
