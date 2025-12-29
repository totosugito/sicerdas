import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

// Helper component for expandable sections
export function CardSection({
  title,
  icon,
  children,
  isExpanded,
  onToggle
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button
        className="w-full flex items-center justify-between p-3 bg-muted dark:bg-gray-900 hover:bg-muted/80 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 bg-white dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  )
}