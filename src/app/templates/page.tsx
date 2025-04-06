"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  SearchIcon,
  Star,
  FileText,
  Tag,
  ArrowRight,
  Building,
  GraduationCap,
  ScaleIcon,
  PenLine,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Footer } from "@/components/footer";

// Template interface
interface Template {
  id: string;
  title: string;
  description: string;
  category: "business" | "academic" | "legal" | "marketing";
  tags: string[];
  popular?: boolean;
  new?: boolean;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Dummy templates data
  const templates: Template[] = [
    // Business templates
    {
      id: "business-proposal",
      title: "Business Proposal",
      description:
        "A comprehensive business proposal template with executive summary, problem statement, solution, pricing, and timeline sections.",
      category: "business",
      tags: ["proposal", "business plan", "executive"],
      popular: true,
    },
    {
      id: "project-plan",
      title: "Project Plan",
      description:
        "Detailed project plan template with objectives, scope, milestones, resources, and risk management sections.",
      category: "business",
      tags: ["project management", "planning", "timeline"],
    },
    {
      id: "meeting-minutes",
      title: "Meeting Minutes",
      description:
        "Structured template for recording meeting discussions, decisions, and action items.",
      category: "business",
      tags: ["meeting", "notes", "action items"],
    },
    {
      id: "company-profile",
      title: "Company Profile",
      description:
        "Professional company profile template to showcase your business, services, and achievements.",
      category: "business",
      tags: ["company", "profile", "branding"],
    },

    // Academic templates
    {
      id: "research-paper",
      title: "Research Paper",
      description:
        "Academic research paper template with proper formatting, citations, and sections according to academic standards.",
      category: "academic",
      tags: ["research", "academic", "paper"],
      popular: true,
    },
    {
      id: "thesis-outline",
      title: "Thesis Outline",
      description:
        "Structured outline template for thesis or dissertation with chapters, methodology, and literature review sections.",
      category: "academic",
      tags: ["thesis", "dissertation", "research"],
    },
    {
      id: "lab-report",
      title: "Lab Report",
      description:
        "Scientific lab report template with hypothesis, methodology, results, and discussion sections.",
      category: "academic",
      tags: ["science", "laboratory", "experiment"],
    },
    {
      id: "literature-review",
      title: "Literature Review",
      description:
        "Comprehensive literature review template for academic papers or research projects.",
      category: "academic",
      tags: ["literature", "review", "research"],
    },

    // Legal templates
    {
      id: "contract-agreement",
      title: "Contract Agreement",
      description:
        "Legal contract template with standard clauses, terms and conditions, and signature blocks.",
      category: "legal",
      tags: ["contract", "agreement", "legal"],
      popular: true,
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      description:
        "Comprehensive privacy policy template for websites and applications compliant with regulations.",
      category: "legal",
      tags: ["privacy", "policy", "compliance"],
      new: true,
    },
    {
      id: "non-disclosure",
      title: "Non-Disclosure Agreement",
      description:
        "Standard NDA template to protect confidential information shared between parties.",
      category: "legal",
      tags: ["nda", "confidentiality", "legal"],
    },
    {
      id: "terms-of-service",
      title: "Terms of Service",
      description:
        "Detailed terms of service template for websites, applications, or services.",
      category: "legal",
      tags: ["terms", "service", "legal"],
    },

    // Marketing templates
    {
      id: "marketing-plan",
      title: "Marketing Plan",
      description:
        "Strategic marketing plan template with target audience, channels, budget, and KPI sections.",
      category: "marketing",
      tags: ["marketing", "strategy", "plan"],
      popular: true,
    },
    {
      id: "content-calendar",
      title: "Content Calendar",
      description:
        "Content planning template for organizing and scheduling content across platforms.",
      category: "marketing",
      tags: ["content", "calendar", "planning"],
      new: true,
    },
    {
      id: "social-media-strategy",
      title: "Social Media Strategy",
      description:
        "Comprehensive social media strategy template with platform-specific tactics and metrics.",
      category: "marketing",
      tags: ["social media", "strategy", "marketing"],
    },
    {
      id: "product-launch",
      title: "Product Launch Plan",
      description:
        "Detailed product launch template with pre-launch, launch, and post-launch activities.",
      category: "marketing",
      tags: ["product", "launch", "strategy"],
    },
  ];

  // Filter templates based on search query and active tab
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "popular") return matchesSearch && template.popular;
    if (activeTab === "new") return matchesSearch && template.new;

    return matchesSearch && template.category === activeTab;
  });

  // Function to use a template
  const useTemplate = (templateId: string) => {
    // In a real app, this would get the template from the server and create a new document
    toast.success(`Creating new document from template: ${templateId}`);
    router.push(`/documents/new?template=${templateId}`);
  };

  // Function to get appropriate icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "business":
        return <Building className="h-5 w-5 text-blue-400" />;
      case "academic":
        return <GraduationCap className="h-5 w-5 text-green-400" />;
      case "legal":
        return <ScaleIcon className="h-5 w-5 text-purple-400" />;
      case "marketing":
        return <PenLine className="h-5 w-5 text-orange-400" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">AI Document Templates</h1>
              <p className="text-muted-foreground mt-2">
                Start your document with one of our AI-powered templates
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                className="pl-10 bg-card border-border w-full md:w-[300px] focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-card p-1 h-full overflow-x-auto flex whitespace-nowrap">
              <TabsTrigger
                value="all"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                All Templates
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <Building className="mr-2 h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger
                value="academic"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger
                value="legal"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <ScaleIcon className="mr-2 h-4 w-4" />
                Legal
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <PenLine className="mr-2 h-4 w-4" />
                Marketing
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <Star className="mr-2 h-4 w-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground"
              >
                <Badge
                  variant="outline"
                  className="rounded-full bg-green-950 text-green-400 border-green-800 mr-2"
                >
                  New
                </Badge>
                New
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    No templates found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any templates matching your search
                    criteria. Try adjusting your search terms.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="bg-card border-border hover:border-muted-foreground transition-colors overflow-hidden flex flex-col"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getCategoryIcon(template.category)}
                            <div className="ml-2">
                              {template.popular && (
                                <Badge className="bg-amber-950 text-amber-400 border-amber-800 text-xs">
                                  Popular
                                </Badge>
                              )}
                              {template.new && (
                                <Badge className="bg-green-950 text-green-400 border-green-800 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-2">
                          {template.title}
                        </CardTitle>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-2 flex-grow">
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-background border-border text-xs"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-4">
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => useTemplate(template.id)}
                        >
                          Use Template
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-12 p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-bold mb-4">How Templates Work</h2>
            <p className="text-foreground/80 mb-6">
              Our AI-powered templates provide a starting point for your
              documents. When you select a template:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-medium">Select a Template</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a template that matches your document needs from our
                  categorized library.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-medium">Customize with AI</h3>
                <p className="text-muted-foreground text-sm">
                  Answer a few questions, and our AI will customize the template
                  with your specific information.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-medium">Edit & Refine</h3>
                <p className="text-muted-foreground text-sm">
                  Make final adjustments using our powerful editor before
                  sharing or publishing your document.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for?
            </p>
            <Button
              variant="outline"
              className="border-border bg-card hover:bg-accent"
              onClick={() => router.push("/documents/new")}
            >
              Start from scratch
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
