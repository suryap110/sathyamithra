"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({ tabs, activeTab, onChange, className = "" }: AnimatedTabsProps) {
  return (
    <div className={"flex gap-1 p-1 bg-gray-100 rounded-xl " + className}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors z-10 flex-1 justify-center"
          style={{ color: activeTab === tab.id ? "#15803d" : "#6b7280" }}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab-bg"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

interface AnimatedTabContentProps {
  children: ReactNode;
  tabKey: string;
}

export function AnimatedTabContent({ children, tabKey }: AnimatedTabContentProps) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
