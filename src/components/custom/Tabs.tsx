// components/custom/Tabs.jsx
"use client";

import { useState } from "react";

export const TabsList = ({ children }:any) => {
  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4">
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, active, onClick, children }:any) => {
  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md ${
        active === value 
          ? "bg-background text-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted-foreground/20"
      }`}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, active, children }:any) => {
  if (active !== value) return null;
  
  return <div>{children}</div>;
};

const Tabs = ({ defaultValue, children }:any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  // Map children to add active prop to triggers and content
  const childrenWithProps = children.map((child:any) => {
    if (child.type === TabsList) {
      const triggerChildren = child.props.children.map((trigger:any) => {
        if (trigger.type === TabsTrigger) {
          return {
            ...trigger,
            props: {
              ...trigger.props,
              active: activeTab,
              onClick: setActiveTab
            }
          };
        }
        return trigger;
      });
      
      return {
        ...child,
        props: {
          ...child.props,
          children: triggerChildren
        }
      };
    }
    
    if (child.type === TabsContent) {
      return {
        ...child,
        props: {
          ...child.props,
          active: activeTab
        }
      };
    }
    
    return child;
  });

  return <div className="w-full">{childrenWithProps}</div>;
};

export default Tabs;