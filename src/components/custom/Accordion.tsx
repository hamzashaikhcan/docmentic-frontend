// components/custom/Accordion.tsx
"use client";

import { useState, ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

export const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-lg font-medium transition-all hover:underline"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="pb-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  children: ReactNode;
}

const Accordion = ({ children }: AccordionProps) => {
  return (
    <div className="w-full divide-y">
      {children}
    </div>
  );
};

export default Accordion;