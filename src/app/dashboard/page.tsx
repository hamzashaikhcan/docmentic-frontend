"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FilePlus,
  FileText,
  Eye,
  Edit,
  Download,
  Share,
  Users,
  Tag,
  BarChart,
  Brain,
  Clock,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { useAuth } from "@/components/auth-context";

// Theme Context
type Theme = "light" | "dark" | "system";
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme,
    );

    // Save theme to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes: Theme[] = ["light", "dark", "system"];

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="border-border text-foreground hover:bg-secondary hover:text-foreground"
    >
      {getThemeIcon()}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

// Interfaces
interface Document {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

interface DocumentEvent {
  id: string;
  event: string;
  documentId: string;
  userId: string;
  createdAt: Date;
  metadata: string | null;
  document: {
    title: string;
  };
  user: {
    name: string | null;
    email: string | null;
  } | null;
}

interface DocumentStats {
  totalDocuments: number;
  totalEvents: number;
  recentlyViewed: Document[];
  recentlyEdited: Document[];
  topEvents: {
    event: string;
    count: number;
  }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<DocumentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user) {
          // Fetch dashboard stats
          // const response = await fetch('/api/dashboard/stats');
          // if (response.ok) {
          //   const data = await response.json();
          //   setStats(data);
          // }
          setStats(null);

          // Fetch recent events
          // const eventsResponse = await fetch('/api/dashboard/events');
          // if (eventsResponse.ok) {
          //   const eventsData = await eventsResponse.json();
          //   setRecentEvents(eventsData);
          // }
          setRecentEvents([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Helper function to get event icon
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "view":
        return <Eye className="h-4 w-4" />;
      case "edit":
        return <Edit className="h-4 w-4" />;
      case "export":
        return <Download className="h-4 w-4" />;
      case "share":
      case "collaborator_added":
      case "collaborator_removed":
        return <Share className="h-4 w-4" />;
      case "tag_added":
      case "tag_removed":
        return <Tag className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper function to format event text
  const getEventText = (event: DocumentEvent) => {
    let text = "";
    const user = event.user?.name || event.user?.email || "A user";

    switch (event.event) {
      case "view": {
        text = `${user} viewed "${event.document.title}"`;
        break;
      }
      case "edit": {
        text = `${user} edited "${event.document.title}"`;
        break;
      }
      case "export": {
        let format = "document";
        try {
          if (event.metadata) {
            const meta = JSON.parse(event.metadata);
            if (meta.format) format = meta.format;
          }
        } catch (e) {}
        text = `${user} exported "${event.document.title}" as ${format}`;
        break;
      }
      case "collaborator_added": {
        text = `${user} added a collaborator to "${event.document.title}"`;
        break;
      }
      case "collaborator_removed": {
        text = `${user} removed a collaborator from "${event.document.title}"`;
        break;
      }
      case "tag_added": {
        let tagName = "a tag";
        try {
          if (event.metadata) {
            const meta = JSON.parse(event.metadata);
            if (meta.tagName) tagName = meta.tagName;
          }
        } catch (e) {}
        text = `${user} added tag "${tagName}" to "${event.document.title}"`;
        break;
      }
      case "tag_removed": {
        let removedTagName = "a tag";
        try {
          if (event.metadata) {
            const meta = JSON.parse(event.metadata);
            if (meta.tagName) removedTagName = meta.tagName;
          }
        } catch (e) {}
        text = `${user} removed tag "${removedTagName}" from "${event.document.title}"`;
        break;
      }
      default: {
        text = `${user} performed action "${event.event}" on "${event.document.title}"`;
      }
    }

    return text;
  };

  // Loading and auth state handling
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI-generated documents
            </p>
          </div>
          <div className="flex gap-3">
            {/* <ThemeToggle /> */}
            <Link href="/documents/">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-secondary hover:text-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                All Documents
              </Button>
            </Link>
            <Link href="/documents/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <FilePlus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          {[
            {
              title: "Total Documents",
              value: stats?.totalDocuments || 0,
              subtitle: "Across all your workspace",
              icon: <FileText className="h-4 w-4" />,
            },
            {
              title: "Recent Activity",
              value: stats?.totalEvents || 0,
              subtitle: "Total events in the last 30 days",
              icon: <BarChart className="h-4 w-4" />,
            },
            {
              title: "Collaborations",
              value:
                recentEvents.filter(
                  (e) =>
                    e.event === "collaborator_added" ||
                    e.event === "collaborator_removed",
                ).length || 0,
              subtitle: "Collaboration activity",
              icon: <Users className="h-4 w-4" />,
            },
            {
              title: "AI Generation",
              value: stats?.totalDocuments || 0,
              subtitle: "AI-powered documents",
              icon: <Brain className="h-4 w-4" />,
            },
          ].map((cardData, index) => (
            <Card
              key={index}
              className="bg-card border-border text-card-foreground"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {cardData.title}
                </CardTitle>
                <div className="rounded-full bg-secondary p-2">
                  {cardData.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cardData.value}</div>
                <p className="text-xs text-muted-foreground">
                  {cardData.subtitle}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <Card className="col-span-4 bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your recent document activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-secondary rounded-md">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <div className="rounded-full bg-primary/20 p-2 flex-shrink-0">
                        {getEventIcon(event.event)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getEventText(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(
                            new Date(event.createdAt),
                            new Date(),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                      <Link href={`/documents/${event.documentId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border text-foreground hover:bg-secondary/50"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3 bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Document Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your recent documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="edited" className="w-full">
                <TabsList className="w-full bg-secondary text-muted-foreground">
                  <TabsTrigger
                    value="edited"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Recently Edited
                  </TabsTrigger>
                  <TabsTrigger
                    value="viewed"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Recently Viewed
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edited" className="pt-4">
                  {!stats?.recentlyEdited ||
                  stats.recentlyEdited.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground bg-secondary rounded-md">
                      No recently edited documents
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentlyEdited.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-center p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated{" "}
                              {formatDistance(
                                new Date(doc.updatedAt),
                                new Date(),
                                { addSuffix: true },
                              )}
                            </p>
                          </div>
                          <Link href={`/documents/${doc.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border text-foreground hover:bg-secondary/50"
                            >
                              Edit
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="viewed" className="pt-4">
                  {!stats?.recentlyViewed ||
                  stats.recentlyViewed.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground bg-secondary rounded-md">
                      No recently viewed documents
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentlyViewed.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-center p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Viewed recently
                            </p>
                          </div>
                          <Link href={`/documents/${doc.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border text-foreground hover:bg-secondary/50"
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Document Suggestions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Based on your recent activity, try creating these documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Business Proposal Template",
                    description:
                      "Create a customizable business proposal template for your projects",
                    icon: <FileText className="h-5 w-5 text-primary" />,
                  },
                  {
                    title: "Project Timeline",
                    description:
                      "Generate a project timeline with milestones and deliverables",
                    icon: <Clock className="h-5 w-5 text-primary" />,
                  },
                  {
                    title: "Meeting Minutes Template",
                    description:
                      "Create a template for recording and organizing meeting notes",
                    icon: <Edit className="h-5 w-5 text-primary" />,
                  },
                ].map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-md bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer border border-border group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {suggestion.icon}
                      <h3 className="font-medium group-hover:text-primary">
                        {suggestion.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {suggestion.description}
                    </p>
                    <Link href={"/documents/new"}>
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Generate
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
