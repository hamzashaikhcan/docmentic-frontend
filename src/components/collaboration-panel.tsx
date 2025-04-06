"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  UserPlus,
  Mail,
  Copy,
  Users,
  Check,
  Clock,
  Lock,
  LockOpen,
  Edit,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "owner" | "editor" | "viewer";
  online?: boolean;
  lastActive?: Date;
}

interface CursorPosition {
  userId: string;
  position: { x: number; y: number };
}

// Mock current user
const currentUser = {
  id: "user-1",
  name: "Current User",
  email: "me@example.com",
  avatarUrl: "/avatar-1.png",
  role: "owner" as const,
  online: true,
};

interface CollaborationPanelProps {
  documentId: string;
  documentTitle: string;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}

export function CollaborationPanel({
  documentId,
  documentTitle,
  isPublic = false,
  onTogglePublic,
}: CollaborationPanelProps) {
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    currentUser,
    {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatarUrl: "/avatar-2.png",
      role: "editor",
      online: true,
    },
    {
      id: "user-3",
      name: "Bob Johnson",
      email: "bob@example.com",
      avatarUrl: "/avatar-3.png",
      role: "viewer",
      online: false,
      lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ]);
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);
  const [showActiveUsers, setShowActiveUsers] = useState(true);

  // Simulate collaborative cursor movement
  useEffect(() => {
    // Mock receiving cursor position updates from other users
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && showActiveUsers) {
        const onlineCollaborators = collaborators.filter(
          (c) => c.online && c.id !== currentUser.id,
        );
        if (onlineCollaborators.length > 0) {
          const newPositions = onlineCollaborators.map((user) => ({
            userId: user.id,
            position: {
              x: Math.floor(Math.random() * window.innerWidth * 0.8),
              y: Math.floor(Math.random() * window.innerHeight * 0.8),
            },
          }));
          setCursorPositions(newPositions);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [collaborators, showActiveUsers]);

  const handleInvite = () => {
    if (!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if user is already a collaborator
    if (collaborators.some((c) => c.email === inviteEmail)) {
      toast.error("This user is already a collaborator");
      return;
    }

    // Simulate adding a new collaborator
    const newCollaborator: Collaborator = {
      id: `user-${collaborators.length + 1}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      avatarUrl: "",
      role: inviteRole,
      online: false,
    };

    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemoveCollaborator = (id: string) => {
    if (id === currentUser.id) {
      toast.error("You cannot remove yourself from collaborators");
      return;
    }

    setCollaborators(collaborators.filter((c) => c.id !== id));
    toast.success("Collaborator removed");
  };

  const handleChangeRole = (id: string, newRole: "editor" | "viewer") => {
    setCollaborators(
      collaborators.map((c) => (c.id === id ? { ...c, role: newRole } : c)),
    );
    toast.success("Collaborator role updated");
  };

  const getShareLink = () => {
    return `${window.location.origin}/shared/${documentId}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink());
    toast.success("Link copied to clipboard");
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format time since last active
  const formatLastActive = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Cursor indicators for collaborative editing */}
      {showActiveUsers &&
        cursorPositions.map((cursor) => {
          const user = collaborators.find((c) => c.id === cursor.userId);
          if (!user) return null;

          return (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none z-50 transition-all duration-500 ease-out"
              style={{
                left: cursor.position.x,
                top: cursor.position.y,
              }}
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                  style={{
                    backgroundColor:
                      user.id === "user-2" ? "#3b82f6" : "#10b981",
                  }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="bg-background shadow-sm rounded px-2 py-1 text-xs">
                  {user.name}
                </div>
              </div>
              <div
                className="w-4 h-4 transform -rotate-45"
                style={{
                  borderLeft: `2px solid ${user.id === "user-2" ? "#3b82f6" : "#10b981"}`,
                  borderBottom: `2px solid ${user.id === "user-2" ? "#3b82f6" : "#10b981"}`,
                  position: "absolute",
                  top: -4,
                  left: -2,
                }}
              />
            </div>
          );
        })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" /> Collaborate
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" /> Collaboration
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Document Access</h3>
                <Badge
                  variant={isPublic ? "outline" : "secondary"}
                  className={cn(
                    "h-6",
                    isPublic ? "text-green-600 border-green-600" : "",
                  )}
                >
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onTogglePublic && onTogglePublic(!isPublic)}
              >
                {isPublic ? (
                  <>
                    <Lock className="h-3 w-3" /> Make Private
                  </>
                ) : (
                  <>
                    <LockOpen className="h-3 w-3" /> Make Public
                  </>
                )}
              </Button>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-medium">Share Link</Label>
              <div className="flex items-center mt-1.5 gap-2">
                <Input
                  value={getShareLink()}
                  readOnly
                  className="text-sm bg-muted/40"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyShareLink}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-sm mb-3">Invite People</h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Email address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="text-sm"
                />
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "editor" | "viewer")
                  }
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view</option>
                </select>
                <Button size="sm" onClick={handleInvite} className="gap-1">
                  <Mail className="h-3 w-3" /> Invite
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">People with access</h3>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowActiveUsers(!showActiveUsers)}
                >
                  {showActiveUsers ? "Hide Cursors" : "Show Cursors"}
                </button>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {getInitials(collaborator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1.5">
                          {collaborator.name}
                          {collaborator.id === currentUser.id && (
                            <span className="text-xs bg-muted px-1 rounded">
                              You
                            </span>
                          )}
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              collaborator.online
                                ? "bg-green-500"
                                : "bg-gray-300",
                            )}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          {collaborator.role === "owner" ? (
                            <>Owner</>
                          ) : collaborator.role === "editor" ? (
                            <>
                              <Edit className="h-2.5 w-2.5" /> Can edit
                            </>
                          ) : (
                            <>
                              <Eye className="h-2.5 w-2.5" /> Can view
                            </>
                          )}

                          {!collaborator.online && collaborator.lastActive && (
                            <span className="flex items-center gap-0.5 ml-1.5">
                              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                              {formatLastActive(collaborator.lastActive)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {collaborator.id !== currentUser.id && (
                      <div className="flex items-center">
                        {collaborator.role !== "owner" && (
                          <select
                            value={collaborator.role}
                            onChange={(e) =>
                              handleChangeRole(
                                collaborator.id,
                                e.target.value as "editor" | "viewer",
                              )
                            }
                            className="mr-2 h-7 rounded-md border bg-background px-2 text-xs"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x"
                          >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
