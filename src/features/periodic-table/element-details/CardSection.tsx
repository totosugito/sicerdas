import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card className="overflow-hidden gap-0">
      <button
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className="text-primary">
            {icon}
          </div>
          <span className="font-bold tracking-tight text-foreground">{title}</span>
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <CardContent>
          {children}
        </CardContent>
      </div>
    </Card>
  )
}