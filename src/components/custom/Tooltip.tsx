// components/custom/Tooltip.tsx
"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
}

const Tooltip = ({ children, content }: TooltipProps) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 w-64 px-3 py-2 text-sm bg-popover text-popover-foreground rounded-md shadow-md bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          {content}
          <div className="absolute w-2 h-2 bg-popover rotate-45 left-1/2 -bottom-1 transform -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;