"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";

// Define types for plan details
type BillingCycle = "weekly" | "monthly" | "yearly";

interface PlanDetails {
  price: string;
  originalPrice?: string;
  features: string[];
  savings?: string;
}

interface PlanCategory {
  weekly: PlanDetails;
  monthly: PlanDetails;
  yearly: PlanDetails;
}

interface PlanDetailsStructure {
  free: PlanCategory;
  pro: PlanCategory;
  enterprise: PlanCategory;
}

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const planDetails: PlanDetailsStructure = {
    free: {
      weekly: {
        price: "$0",
        features: [
          "Generate up to 3 documents per week",
          "Basic document templates",
          "Standard support",
          "Export in PDF format",
          "24-hour revision history",
          "Limited formatting options",
        ],
      },
      monthly: {
        price: "$0",
        features: [
          "Generate up to 3 documents per week",
          "Basic document templates",
          "Standard support",
          "Export in PDF format",
          "24-hour revision history",
          "Limited formatting options",
        ],
      },
      yearly: {
        price: "$0",
        features: [
          "Generate up to 3 documents per week",
          "Basic document templates",
          "Standard support",
          "Export in PDF format",
          "24-hour revision history",
          "Limited formatting options",
        ],
      },
    },
    pro: {
      weekly: {
        price: "$7.99",
        originalPrice: "$9.99",
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
        savings: "Save 20%",
      },
      monthly: {
        price: "$29.99",
        originalPrice: "$39.99",
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
        savings: "Save 25%",
      },
      yearly: {
        price: "$299.88",
        originalPrice: "$479.88",
        features: [
          "Unlimited document generation",
          "Advanced templates",
          "24/7 Priority support",
          "Export in multiple formats",
          "Custom branding",
          "Unlimited revision history",
          "Advanced formatting options",
          "Collaborative editing",
          "Priority feature requests",
        ],
        savings: "Save 37%",
      },
    },
    enterprise: {
      weekly: {
        price: "Custom",
        features: [
          "Unlimited AI document generation",
          "Dedicated account manager",
          "Advanced security features",
          "Custom AI model training",
          "API access",
          "White-label solutions",
          "Priority support",
          "Compliance consulting",
          "Custom integrations",
        ],
      },
      monthly: {
        price: "Custom",
        features: [
          "Unlimited AI document generation",
          "Dedicated account manager",
          "Advanced security features",
          "Custom AI model training",
          "API access",
          "White-label solutions",
          "Priority support",
          "Compliance consulting",
          "Custom integrations",
        ],
      },
      yearly: {
        price: "Custom",
        features: [
          "Unlimited AI document generation",
          "Dedicated account manager",
          "Advanced security features",
          "Custom AI model training",
          "API access",
          "White-label solutions",
          "Priority support",
          "Compliance consulting",
          "Custom integrations",
        ],
      },
    },
  };

  const renderPlanCard = (planName: string, planInfo: PlanDetails) => (
    <div
      className={`rounded-lg overflow-visible border transition-all duration-300 ${
        planName === "pro"
          ? "border-primary border-2 shadow-xl md:scale-105 md:-translate-y-16 hover:shadow-2xl hover:-translate-y-20 relative mt-12 z-10 bg-card"
          : planName === "enterprise"
            ? "border-accent border-t-2 shadow-sm hover:shadow-md hover:-translate-y-1 bg-card"
            : "border-border shadow-sm hover:shadow-md hover:-translate-y-1 bg-card"
      }`}
    >
      {planName === "pro" && (
        <span className="absolute -top-5 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs sm:text-sm z-10">
          Most Popular
        </span>
      )}
      {planName === "enterprise" && (
        <span className="absolute -top-5 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs sm:text-sm">
          Custom Solutions
        </span>
      )}

      <div className="p-4 sm:p-6 border-b">
        <h3 className="text-xl sm:text-2xl font-bold capitalize">{planName}</h3>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl sm:text-4xl font-bold">
            {planInfo.price}
          </span>
          <span className="text-muted-foreground ml-2">
            {planName !== "enterprise"
              ? `per ${billingCycle.slice(0, -2)}`
              : ""}
          </span>
        </div>
        {planInfo.originalPrice && (
          <div className="text-sm text-muted-foreground line-through mr-2">
            {planInfo.originalPrice}
          </div>
        )}
        {planInfo.savings && (
          <div className="text-primary text-xs font-semibold mt-1">
            {planInfo.savings}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <ul className="space-y-3 sm:space-y-4 min-h-[300px]">
          {planInfo.features.map((feature) => (
            <li key={feature} className="flex items-center">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 sm:p-6 border-t mt-auto">
        <Button
          className="w-full"
          size="lg"
          variant={
            planName === "pro"
              ? "default"
              : planName === "enterprise"
                ? "secondary"
                : "outline"
          }
        >
          {planName === "enterprise" ? "Contact Sales" : "Get Started"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="py-16 sm:py-24" id="pricing">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-8">
          Simple Pricing
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-xl sm:max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include our core AI
          document generation features.
        </p>

        {/* Billing Cycle Tabs */}
        <div className="mb-16 flex justify-center">
          <Tabs
            defaultValue="monthly"
            value={billingCycle}
            onValueChange={(value: string) =>
              setBillingCycle(value as BillingCycle)
            }
          >
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-xs sm:max-w-3xl lg:max-w-6xl mx-auto">
          {/* Free Plan */}
          {renderPlanCard("free", planDetails.free[billingCycle])}

          {/* Pro Plan */}
          {renderPlanCard("pro", planDetails.pro[billingCycle])}

          {/* Enterprise Plan */}
          {renderPlanCard("enterprise", planDetails.enterprise[billingCycle])}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
