"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  PlayCircle,
  Sparkles,
  FileText,
  Brain,
  RefreshCw,
  Zap,
  ArrowRight,
  PenTool,
  Check,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function TutorialPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-12 pb-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block mb-4 rounded-full bg-primary/20 px-4 py-1.5">
              <span className="text-sm font-medium text-primary flex items-center">
                <BookOpen className="mr-2 h-4 w-4" /> Learning Resources
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              AI Document Features Tutorial
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-3xl">
              Learn how to use Docmentic's powerful AI features to create
              professional documents in seconds.
            </p>
            <div className="flex gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                <Link href="/documents/new">
                  Create Your First Document{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href="#getting-started">View Tutorial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12">
            {/* Introduction Section */}
            <section id="getting-started" className="scroll-mt-24">
              <Card className="overflow-hidden border-border">
                <div className="p-1">
                  <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 rounded-t-sm h-1"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Getting Started with AI Documents
                    </h2>
                  </div>
                  <p className="text-foreground/80 mb-6 leading-relaxed">
                    Docmentic's AI-powered document editor helps you create
                    professional content in seconds. Our advanced AI
                    capabilities can generate entire documents, improve existing
                    content, and help you format your work for maximum impact.
                  </p>
                  <div className="bg-accent/50 rounded-lg p-6 border border-border mb-6">
                    <h3 className="font-bold mb-4 text-lg">
                      What you'll learn in this tutorial:
                    </h3>
                    <ul className="grid gap-3">
                      {[
                        "How to generate document content with AI",
                        "Using AI to enhance your writing",
                        "AI-powered formatting and styling",
                        "Working with AI templates for common document types",
                        "Best practices for AI-assisted document creation",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0 text-sm">
                            {i + 1}
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* Content Generation Section */}
            <section id="content-generation">
              <Card className="overflow-hidden border-border">
                <div className="p-1">
                  <div className="bg-gradient-to-r from-blue-500/30 via-blue-500/20 to-blue-500/10 rounded-t-sm h-1"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                      <Brain className="h-6 w-6 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Generating Content with AI
                    </h2>
                  </div>
                  <p className="text-foreground/80 mb-8 leading-relaxed">
                    The fastest way to create quality content is by using our AI
                    generation features. Simply describe what you need, and the
                    AI will generate a professionally written document tailored
                    to your requirements.
                  </p>

                  <div className="space-y-6">
                    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                      <h3 className="font-bold mb-3 flex items-center text-lg">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm">
                          1
                        </span>
                        Start with a prompt
                      </h3>
                      <p className="text-foreground/80 mb-4 leading-relaxed">
                        In the document editor, click on the "AI Generate"
                        button in the toolbar, then enter a detailed prompt
                        describing the document you want to create.
                      </p>
                      <div className="bg-accent/50 p-4 rounded-md border border-border text-sm">
                        <p className="text-foreground/80">
                          <span className="text-blue-500 font-semibold">
                            Example prompt:
                          </span>{" "}
                          "Create a detailed business proposal for a mobile app
                          development project including sections for executive
                          summary, project scope, timeline, budget, and team
                          resources."
                        </p>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                      <h3 className="font-bold mb-3 flex items-center text-lg">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm">
                          2
                        </span>
                        Review and refine
                      </h3>
                      <p className="text-foreground/80 mb-4 leading-relaxed">
                        After the AI generates your content, review it and use
                        the "Regenerate" option to improve specific sections or
                        try different approaches.
                      </p>
                      <div className="grid gap-3 mt-4">
                        {[
                          "Use specific, detailed prompts for better results",
                          "Mention industry-specific terminology when relevant",
                          "Specify tone (formal, conversational, technical) in your prompt",
                        ].map((tip, i) => (
                          <div key={i} className="flex items-center">
                            <div className="bg-green-500/20 text-green-500 rounded-full p-1 mr-3 shrink-0">
                              <Check className="h-4 w-4" />
                            </div>
                            <p className="text-foreground/80 text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Content Enhancement Section */}
            <section id="content-enhancement">
              <Card className="overflow-hidden border-border">
                <div className="p-1">
                  <div className="bg-gradient-to-r from-purple-500/30 via-purple-500/20 to-purple-500/10 rounded-t-sm h-1"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                      <PenTool className="h-6 w-6 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Enhancing Your Writing with AI
                    </h2>
                  </div>
                  <p className="text-foreground/80 mb-8 leading-relaxed">
                    Already have content? Our AI can help improve it. Use the
                    enhancement features to refine your writing, fix grammatical
                    errors, improve clarity, or adjust the tone.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {[
                      {
                        title: "Rewrite & Improve",
                        description:
                          "Select any text and use the AI context menu to rewrite it for clarity, brevity, or to adopt a different tone. Perfect for refining rough drafts.",
                      },
                      {
                        title: "Expand Ideas",
                        description:
                          "Have a short paragraph or bullet points? Use AI to expand them into fully developed sections with supporting details and examples.",
                      },
                      {
                        title: "Summarize Content",
                        description:
                          "Need to condense a lengthy section? Our AI can create concise summaries while preserving key information.",
                      },
                      {
                        title: "Grammar & Style Check",
                        description:
                          'Use the "Polish" feature to correct grammar, improve sentence structure, and ensure consistent style throughout your document.',
                      },
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-lg p-6 border border-border shadow-sm"
                      >
                        <h3 className="font-bold mb-3 text-purple-500">
                          {feature.title}
                        </h3>
                        <p className="text-foreground/80 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/50 rounded-lg p-6 border-l-4 border-l-purple-500 border border-border">
                    <h3 className="font-bold mb-3 flex items-center text-lg">
                      <Zap className="h-5 w-5 mr-2 text-purple-500" />
                      Pro Tip
                    </h3>
                    <p className="text-foreground/80 leading-relaxed">
                      Try the "Adjust Tone" feature to quickly transform your
                      document from casual to formal, technical to accessible,
                      or to match brand voice guidelines.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* AI Templates Section */}
            <section id="ai-templates">
              <Card className="overflow-hidden border-border">
                <div className="p-1">
                  <div className="bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-amber-500/10 rounded-t-sm h-1"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Working with AI Templates
                    </h2>
                  </div>
                  <p className="text-foreground/80 mb-8 leading-relaxed">
                    Start your documents faster with our library of AI-powered
                    templates. Each template is designed for specific document
                    types and industries.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                      {
                        title: "Business Proposals",
                        description:
                          "Professional proposal templates with executive summaries, project scope, timelines, and budget sections.",
                      },
                      {
                        title: "Marketing Plans",
                        description:
                          "Comprehensive marketing strategy templates with audience analysis, channel strategies, and KPI sections.",
                      },
                      {
                        title: "Research Reports",
                        description:
                          "Academic and business research templates with methodology, findings, and conclusion sections.",
                      },
                    ].map((template, i) => (
                      <div
                        key={i}
                        className="group relative bg-card rounded-lg border border-border shadow-sm flex flex-col overflow-hidden"
                      >
                        <div className="h-1 bg-amber-500/50"></div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-bold mb-3">{template.title}</h3>
                          <p className="text-foreground/70 text-sm mb-6 flex-grow leading-relaxed">
                            {template.description}
                          </p>
                          <Button
                            variant="outline"
                            className="w-full group-hover:bg-accent"
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/30 rounded-lg p-6 border border-border">
                    <p className="text-foreground/80 leading-relaxed">
                      All templates are fully customizable. After selecting a
                      template, the AI will ask you a few questions to tailor
                      the content to your specific needs.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Best Practices Section */}
            <section id="best-practices">
              <Card className="overflow-hidden border-border">
                <div className="p-1">
                  <div className="bg-gradient-to-r from-green-500/30 via-green-500/20 to-green-500/10 rounded-t-sm h-1"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                      <RefreshCw className="h-6 w-6 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">
                      Best Practices for AI Document Creation
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        title: "Start with clear objectives",
                        description:
                          "Define what you want to achieve with your document before starting the AI generation process. This helps you give more specific prompts.",
                      },
                      {
                        title: "Refine iteratively",
                        description:
                          "Use the AI to generate an initial draft, then refine specific sections rather than regenerating the entire document.",
                      },
                      {
                        title: "Add personal touches",
                        description:
                          "AI-generated content works best when combined with your personal insights and knowledge. Add unique perspectives that only you can provide.",
                      },
                      {
                        title: "Fact-check important information",
                        description:
                          "While our AI strives for accuracy, always verify critical facts, figures, and citations in important documents.",
                      },
                      {
                        title: "Save effective prompts",
                        description:
                          "When you find prompt formulations that work particularly well, save them in your notes for future use.",
                      },
                    ].map((practice, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-bold mb-2 text-lg">
                            {practice.title}
                          </h3>
                          <p className="text-foreground/80 leading-relaxed">
                            {practice.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            {/* Next Steps Section */}
            <section className="bg-card rounded-xl border border-border p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <PlayCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Now that you've learned the basics of using AI in Docmentic,
                it's time to create your first document!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link href="/documents/new">Create New Document</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
