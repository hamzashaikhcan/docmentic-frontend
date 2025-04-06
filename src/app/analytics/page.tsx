"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  LineChart,
  Eye,
  Edit,
  Download,
  Share,
  Users,
  Clock,
  Filter,
  FileText,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Brain,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

// Types for our statistics
interface AnalyticsData {
  totalDocuments: number;
  totalEvents: number;
  recentlyEdited: any[];
  recentlyViewed: any[];
  topEvents: { event: string; count: number }[];
  collaborationsCount: number;
  categories: any[];
}

// Activity data for the chart
interface ActivityData {
  label: string;
  value: number;
}

// Mock data for charts
const mockDocumentsByType: ActivityData[] = [
  { label: "Business", value: 42 },
  { label: "Legal", value: 28 },
  { label: "Academic", value: 18 },
  { label: "Marketing", value: 12 },
];

const mockActivityByDay: ActivityData[] = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 15 },
  { label: "Thu", value: 22 },
  { label: "Fri", value: 26 },
  { label: "Sat", value: 8 },
  { label: "Sun", value: 10 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() || {};

  // Helper function to map event types to readable labels
  const getEventLabel = (eventType: string) => {
    const eventLabels: Record<string, string> = {
      view: "Document Views",
      edit: "Edits",
      create: "Creations",
      share: "Shares",
      export: "Exports",
      delete: "Deletions",
      comment: "Comments",
    };
    return eventLabels[eventType] || eventType;
  };

  // Helper function to get icon for event type
  const getEventIcon = (eventType: string) => {
    const icons: Record<string, React.ReactNode> = {
      view: <Eye className="h-4 w-4" />,
      edit: <Edit className="h-4 w-4" />,
      create: <FileText className="h-4 w-4" />,
      share: <Share className="h-4 w-4" />,
      export: <Download className="h-4 w-4" />,
      comment: <Users className="h-4 w-4" />,
    };
    return icons[eventType] || <Search className="h-4 w-4" />;
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // const response = await fetch("/api/dashboard/stats");
        // if (!response.ok) {
        //   throw new Error("Failed to fetch analytics data");
        // }
        // const data = await response.json();
        // setAnalyticsData(data);
        setAnalyticsData([]);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Render document activity chart
  const renderActivityChart = () => {
    return (
      <div className="h-[200px] w-full mt-4">
        <div className="flex h-full items-end gap-2">
          {mockActivityByDay.map((day, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <div
                className="bg-primary w-full rounded-t"
                style={{ height: `${day.value * 5}px` }}
              ></div>
              <span className="text-xs mt-2">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render document types chart
  const renderDocumentTypesChart = () => {
    const total = mockDocumentsByType.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    let currentOffset = 0;

    return (
      <div className="flex justify-center mt-8 mb-6">
        <div className="relative h-[160px] w-[160px]">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {mockDocumentsByType.map((item, i) => {
              const percentage = (item.value / total) * 100;
              const slice = (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={`hsl(${i * 60}, 70%, 50%)`}
                  strokeWidth="20"
                  strokeDasharray={`${percentage} 100`}
                  strokeDashoffset={-currentOffset}
                  fill="none"
                />
              );
              currentOffset += percentage;
              return slice;
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Render legends for the pie chart
  const renderLegends = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {mockDocumentsByType.map((item, i) => (
          <div key={i} className="flex items-center">
            <div
              className="h-3 w-3 rounded-full mr-2"
              style={{ backgroundColor: `hsl(${i * 60}, 70%, 50%)` }}
            ></div>
            <span className="text-sm">
              {item.label} ({item.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Document Analytics
          </h2>
          <div className="flex items-center space-x-2">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden p-2"
              size="icon"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-card w-full h-full overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="sharing"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key statistics cards row */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Documents
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.totalDocuments || 0}
                  </div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Document Events
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.totalEvents || 0}
                  </div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +18% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Collaborations
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.collaborationsCount || 0}
                  </div>
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    -2% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border text-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recent Activity
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.recentlyEdited?.length || 0}
                  </div>
                  <p className="text-xs text-green-500 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Now let's add the AI-powered document summarization section */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Document Insights</CardTitle>
                  <div className="bg-primary/20 text-primary rounded-full px-2 py-1 text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </div>
                </div>
                <CardDescription>
                  Smart insights about your document usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/80 border border-border">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-blue-500" />
                      Content Analysis
                    </h4>
                    <p className="text-sm text-foreground/80 mb-3">
                      Based on your recent documents, you primarily create{" "}
                      <span className="text-primary font-medium">
                        business proposals
                      </span>{" "}
                      and{" "}
                      <span className="text-primary font-medium">
                        marketing content
                      </span>
                      . Consider exploring our specialized templates for these
                      categories to improve efficiency.
                    </p>
                    <div className="w-full bg-muted h-2 rounded-full mt-2">
                      <div className="flex">
                        <div
                          className="bg-blue-600 h-2 rounded-l-full"
                          style={{ width: "42%" }}
                        ></div>
                        <div
                          className="bg-green-600 h-2"
                          style={{ width: "28%" }}
                        ></div>
                        <div
                          className="bg-purple-600 h-2"
                          style={{ width: "18%" }}
                        ></div>
                        <div
                          className="bg-yellow-600 h-2 rounded-r-full"
                          style={{ width: "12%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Business (42%)</span>
                      <span>Marketing (28%)</span>
                      <span>Legal (18%)</span>
                      <span>Other (12%)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/80 border border-border">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      Usage Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span className="text-foreground/80">
                          Your most productive day is{" "}
                          <span className="text-foreground">Thursday</span> -
                          consider scheduling important document work then
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span className="text-foreground/80">
                          Suggest enabling{" "}
                          <span className="text-foreground">auto-save</span>{" "}
                          feature as you edit documents frequently
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span className="text-foreground/80">
                          Consider using our{" "}
                          <span className="text-foreground">
                            collaboration tools
                          </span>{" "}
                          more often to increase team productivity
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts row */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle>Document Activity</CardTitle>
                  <CardDescription>7-day activity overview</CardDescription>
                </CardHeader>
                <CardContent>{renderActivityChart()}</CardContent>
              </Card>
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle>Documents by Type</CardTitle>
                  <CardDescription>
                    Categorization of your documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderDocumentTypesChart()}
                  {renderLegends()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>Document Activity Timeline</CardTitle>
                <CardDescription>
                  Track all events related to your documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Mock activity timeline */}
                  <div className="relative pl-8 border-l-2 border-border">
                    <div className="absolute w-4 h-4 rounded-full bg-blue-600 -left-[9px] top-0"></div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">
                          Business Proposal edited
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          2 hours ago
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        You made changes to the document
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-border">
                    <div className="absolute w-4 h-4 rounded-full bg-green-600 -left-[9px] top-0"></div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Marketing Plan shared</h4>
                        <span className="text-xs text-muted-foreground">
                          Yesterday
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shared with john@example.com
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-border">
                    <div className="absolute w-4 h-4 rounded-full bg-purple-600 -left-[9px] top-0"></div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Legal Contract created</h4>
                        <span className="text-xs text-muted-foreground">
                          2 days ago
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        New document created using AI Assistant
                      </p>
                    </div>
                  </div>
                  <div className="relative pl-8 border-l-2 border-border">
                    <div className="absolute w-4 h-4 rounded-full bg-yellow-600 -left-[9px] top-0"></div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Research Paper exported</h4>
                        <span className="text-xs text-muted-foreground">
                          3 days ago
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Exported as PDF
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent"
                >
                  Load More Activity
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>Document Performance</CardTitle>
                <CardDescription>
                  See which documents are viewed and edited most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="font-medium">Document</div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">Views</div>
                      <div className="w-16 text-center">Edits</div>
                      <div className="w-16 text-center">Shares</div>
                    </div>
                  </div>

                  {/* Top performance documents - mock data */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Business Proposal</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">42</div>
                      <div className="w-16 text-center">18</div>
                      <div className="w-16 text-center">7</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                      <span>Marketing Plan</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">36</div>
                      <div className="w-16 text-center">12</div>
                      <div className="w-16 text-center">9</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Legal Contract</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">28</div>
                      <div className="w-16 text-center">6</div>
                      <div className="w-16 text-center">4</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>Research Paper</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">19</div>
                      <div className="w-16 text-center">15</div>
                      <div className="w-16 text-center">2</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-red-500" />
                      <span>Project Timeline</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-16 text-center">15</div>
                      <div className="w-16 text-center">8</div>
                      <div className="w-16 text-center">5</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>Document Sharing Statistics</CardTitle>
                <CardDescription>
                  Analyze collaboration and sharing patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Top Collaborators</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white">
                          J
                        </div>
                        <div>
                          <div className="font-medium">john@example.com</div>
                          <div className="text-xs text-muted-foreground">
                            8 shared documents
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3 text-white">
                          S
                        </div>
                        <div>
                          <div className="font-medium">sarah@example.com</div>
                          <div className="text-xs text-muted-foreground">
                            5 shared documents
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3 text-white">
                          M
                        </div>
                        <div>
                          <div className="font-medium">mike@example.com</div>
                          <div className="text-xs text-muted-foreground">
                            3 shared documents
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sharing Permissions</h4>
                    <div className="space-y-4 mt-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">View Only</span>
                          <span className="text-sm">68%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{ width: "68%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Can Comment</span>
                          <span className="text-sm">22%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-600 h-full"
                            style={{ width: "22%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Can Edit</span>
                          <span className="text-sm">10%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full"
                            style={{ width: "10%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
