"use client";

import { Button } from '@/components/ui/button';
import {
  FileText,
  Brain,
  Zap,
  Shield,
  Target,
  Clock,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import styles from "./styles/home.module.css";
import SmoothScroll from '@/components/smooth-scroll';
import { AutoResizeTextarea } from '@/components/auto-resize-textarea';
import { DocumentGenerationModal } from "@/components/document-generation-modal";
import PricingSection from "@/components/pricing-section";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userHasFocused, setUserHasFocused] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const typeJsSpeed = 100; // Speed in milliseconds between each character
  const pauseDuration = 1500; // Pause duration after typing completes before erasing starts
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation examples are different from clickable examples
  const animationExamples = [
    "Create a professional business plan",
    "Draft a detailed project proposal",
    "Generate a financial forecast",
  ];

  // Clickable examples
  const clickableExamples = [
    "Create a detailed business proposal for a software development project",
    "Generate a comprehensive marketing plan for a product launch",
    "Write a research paper outline on artificial intelligence",
  ];

  // Current example index for auto-animation
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const useCases = [
    {
      title: "Business Documents",
      description:
        "Generate professional business plans, proposals, reports, and presentations tailored to your industry.",
      icon: Target,
    },
    {
      title: "Legal Documents",
      description:
        "Create contracts, agreements, and legal documents with proper terminology and formatting.",
      icon: Shield,
    },
    {
      title: "Academic Writing",
      description:
        "Generate research papers, essays, and academic documents with proper citations and structure.",
      icon: Brain,
    },
    {
      title: "Marketing Content",
      description:
        "Create compelling marketing materials, product descriptions, and promotional content.",
      icon: Users,
    },
  ];

  const plans = [
    {
      name: "Weekly",
      price: "$9.99",
      period: "/week",
      features: [
        "Generate up to 10 documents",
        "Basic document templates",
        "Standard support",
        "Export in PDF format",
        "24-hour revision history",
        "Basic formatting options",
      ],
    },
    {
      name: "Monthly",
      price: "$29.99",
      period: "/month",
      features: [
        "Unlimited document generation",
        "Advanced templates",
        "24/7 Priority support",
        "Export in multiple formats",
        "Custom branding",
        "30-day revision history",
        "Advanced formatting options",
        "Collaborative editing",
      ],
      popular: true,
    },
    {
      name: "Yearly",
      price: "$249.99",
      period: "/year",
      features: [
        "All Monthly features",
        "2 months free",
        "Enterprise support",
        "API access",
        "Custom templates",
        "Dedicated account manager",
        "Unlimited revision history",
        "White-label options",
        "Priority processing",
      ],
      enterprise: true,
    },
  ];

  // Function to simulate typing animation for a fixed example
  const typeText = (text: string) => {
    // Stop the auto-typing animation
    stopAnimation();
    setUserHasFocused(true);

    // Set actual input value to the clicked example
    setPrompt(text);

    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Function to stop all animations
  const stopAnimation = () => {
    if (animationRef.current !== undefined) {
      clearTimeout(animationRef.current);
      animationRef.current = undefined;
    }
    setIsTyping(false);
  };

  // Implement animation with a recursive timeout approach instead of intervals
  const animateText = (step: "type" | "pause" | "next", position = 0) => {
    if (userHasFocused) return;

    const currentExample = animationExamples[currentExampleIndex];

    if (step === "type") {
      setIsTyping(true);

      if (position <= currentExample.length) {
        setPlaceholderText(currentExample.substring(0, position));
        animationRef.current = setTimeout(() => {
          animateText("type", position + 1);
        }, typeJsSpeed);
      } else {
        // Typing complete, proceed to pause
        animationRef.current = setTimeout(() => {
          animateText("pause");
        }, pauseDuration);
      }
    } else if (step === "pause") {
      // After pause, proceed directly to next example without erasing
      animationRef.current = setTimeout(() => {
        animateText("next");
      }, 500);
    } else if (step === "next") {
      // Clear the placeholder completely instead of erasing character by character
      setPlaceholderText("");

      // Move to the next example
      setCurrentExampleIndex(
        (prevIndex) => (prevIndex + 1) % animationExamples.length,
      );
      setIsTyping(false);

      // Short delay before starting the next typing animation
      animationRef.current = setTimeout(() => {
        animateText("type");
      }, 300);
    }
  };

  // Start the animation when component mounts or when dependencies change
  useEffect(() => {
    if (!isTyping && !userHasFocused) {
      // Start the animation with a slight delay
      animationRef.current = setTimeout(() => {
        animateText("type");
      }, 300);
    }

    return () => {
      if (animationRef.current !== undefined) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isTyping, userHasFocused, currentExampleIndex]);

  // Stop and restart animation on window focus/blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (!userHasFocused) {
        // Add a delay when the window regains focus
        animationRef.current = setTimeout(() => {
          if (!userHasFocused) {
            animateText("type");
          }
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userHasFocused]);

  // Handle user interaction with the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    setUserHasFocused(true);
    stopAnimation();
  };

  const handleInputFocus = () => {
    setUserHasFocused(true);
    stopAnimation();
  };

  const handleInputBlur = () => {
    // Only restart animation if the input is empty
    if (!prompt || prompt.trim() === "") {
      setUserHasFocused(false);
      setPlaceholderText(""); // Clear placeholder before starting new animation

      // Delay before starting animation after blur
      animationRef.current = setTimeout(() => {
        animateText("type");
      }, 500);
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

  return (
    <>
      <SmoothScroll />
      <Navbar />
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <div className={styles.heroBackground}>
          <div className="container mx-auto px-4 sm:px-6 pt-20 pb-20 sm:pt-24 sm:pb-36">
            <div
              className={`text-center max-w-xl sm:max-w-3xl lg:max-w-4xl mx-auto ${styles.heroContent}`}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Create Professional Documents with AI
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-md sm:max-w-xl mx-auto">
                Transform your ideas into polished documents instantly. Our AI
                helps you create professional content in seconds.
              </p>

              {/* Document Creation Section */}
              <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8 shadow-md max-w-full sm:max-w-2xl md:max-w-3xl mx-auto border border-border">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* <Input
                    ref={inputRef}
                    placeholder={userHasFocused ? "Describe the document you want to create..." : placeholderText || "Describe the document you want to create..."}
                    value={prompt}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="flex-1"
                  /> */}
                  <AutoResizeTextarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    placeholder={
                      userHasFocused
                        ? "Describe the document you want to create..."
                        : placeholderText ||
                          "Describe the document you want to create..."
                    }
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      // Create a compatible event object that works with your existing handler
                      handleInputChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: e.target.value,
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`flex-1 ${styles.customScrollbar}`}
                    maxRows={6}
                  />
                  <Button
                    size="default"
                    className="w-full sm:w-auto"
                    disabled={!prompt}
                    onClick={handleGenerate}
                  >
                    <FileText className="sm:mr-2 h-4 w-4" />
                    <span className="sm:inline hidden ml-1">Generate</span>
                    <span className="sm:hidden inline">Generate Document</span>
                  </Button>
                </div>
                <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
                  <p className="text-sm font-medium">Try an example:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {clickableExamples.map((example, index) => (
                      <div
                        key={index}
                        className={`flex items-start p-2 sm:p-3 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition-colors duration-200 group ${styles.cardHighlight}`}
                        onClick={() => typeText(example)}
                      >
                        <ArrowRight className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                        <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground line-clamp-2 sm:line-clamp-none">
                          &ldquo;{example}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-y bg-background">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
              <div className={`p-6 rounded-lg ${styles.statsCard}`}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                  1M+
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Documents Generated
                </p>
              </div>
              <div className={`p-6 rounded-lg ${styles.statsCard}`}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                  50K+
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Active Users
                </p>
              </div>
              <div className={`p-6 rounded-lg ${styles.statsCard}`}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                  99.9%
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Satisfaction Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="py-16 sm:py-24" id="use-cases">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8">
              Perfect for Every Need
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl sm:max-w-2xl mx-auto">
              Our AI document creator adapts to your specific requirements,
              delivering professional results across various domains.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-xl p-6 sm:p-8 shadow-md ${styles.cardHighlight}`}
                >
                  <useCase.icon
                    className={`h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4 sm:mb-6 ${styles.iconAnimation}`}
                  />
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          className={`py-16 sm:py-24 ${styles.featuresBackground}`}
          id="features"
        >
          <div
            className={`container mx-auto px-4 sm:px-6 ${styles.heroContent}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl sm:max-w-2xl mx-auto">
              Create professional documents in three simple steps, powered by
              advanced AI technology.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
              <div
                className={`text-center p-6 sm:p-8 bg-card rounded-xl shadow-md ${styles.cardHighlight}`}
              >
                <FileText
                  className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-primary ${styles.iconAnimation}`}
                />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  Describe Your Need
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Simply describe what kind of document you need in plain
                  language. Our AI understands context and requirements.
                </p>
              </div>
              <div
                className={`text-center p-6 sm:p-8 bg-card rounded-xl shadow-md ${styles.cardHighlight}`}
              >
                <Brain
                  className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-primary ${styles.iconAnimation}`}
                />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  AI Generation
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our advanced AI analyzes your request and creates a
                  professional document following industry standards and best
                  practices.
                </p>
              </div>
              <div
                className={`text-center p-6 sm:p-8 bg-card rounded-xl shadow-md ${styles.cardHighlight}`}
              >
                <FileText
                  className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-primary ${styles.iconAnimation}`}
                />
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                  Export & Use
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Download your document in multiple formats, make final
                  adjustments if needed, and it&apos;s ready for professional
                  use.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                  Why Choose Our AI Document Creator?
                </h2>
                <div className="space-y-6 sm:space-y-8">
                  <div
                    className={`flex gap-4 sm:gap-6 p-4 rounded-lg ${styles.benefitsCard}`}
                  >
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        Lightning Fast Creation
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Generate professional documents in seconds, not hours.
                        Save valuable time while maintaining quality.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex gap-4 sm:gap-6 p-4 rounded-lg ${styles.benefitsCard}`}
                  >
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        Professional Quality
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        AI-powered content that matches industry standards and
                        best practices, ensuring your documents stand out.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex gap-4 sm:gap-6 p-4 rounded-lg ${styles.benefitsCard}`}
                  >
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        Consistent Updates
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Our AI continuously learns and improves, staying
                        up-to-date with the latest document standards and
                        practices.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex gap-4 sm:gap-6 p-4 rounded-lg ${styles.benefitsCard}`}
                  >
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        Secure & Private
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Your content is encrypted and processed with the highest
                        security standards. We never store or share your
                        documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] mt-6 sm:mt-0">
                <div className="w-full h-full rounded-xl overflow-hidden shadow-md border border-border">
                  <Image
                    src="why_choose_us.webp"
                    alt="AI Document Creation"
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div
          className={`py-16 sm:py-24 ${styles.testimonialsBackground}`}
          id="testimonials"
        >
          <div
            className={`container mx-auto px-4 sm:px-6 ${styles.heroContent}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl sm:max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their
              document creation process.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Marketing Director",
                  content:
                    "This AI document creator has transformed our content creation process. What used to take days now takes minutes. The quality and consistency are outstanding.",
                  image:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
                },
                {
                  name: "Michael Chen",
                  role: "Business Consultant",
                  content:
                    "The quality of generated documents is impressive. It's like having a professional writer on demand. This tool has become indispensable for my consulting work.",
                  image:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80",
                },
                {
                  name: "Emily Davis",
                  role: "Startup Founder",
                  content:
                    "This tool has saved us countless hours in document creation. The templates are professional and easily customizable. It's perfect for a fast-moving startup like ours.",
                  image:
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-xl p-6 sm:p-8 shadow-md ${styles.cardHighlight}`}
                >
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-muted">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-base sm:text-lg font-semibold">
                        {testimonial.name}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {testimonial.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="" id="pricing">
          <PricingSection />
          <DocumentGenerationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialPrompt={prompt}
          />
        </div>

        <ScrollToTop />
      </main>
    </>
  );
}
