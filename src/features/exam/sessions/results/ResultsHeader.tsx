import React from "react";
import { Trophy, GraduationCap, BookOpen, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResultsHeaderProps {
  title: string;
  description: string;
  packageTitle?: string;
  sectionTitle?: string;
  gradeName?: string;
  children?: React.ReactNode;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  title,
  description,
  packageTitle,
  sectionTitle,
  gradeName,
  children,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 sm:p-12 shadow-soft animate-fade-in w-full">
      {/* Decorative Blur Elements */}
      <div
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Icon Container */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated animate-scale-in">
          <Trophy className="h-10 w-10" strokeWidth={2.25} />
        </div>

        {/* Main Content */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          {title}
        </h1>

        {/* Enhanced Metadata Section - Handles Long Text */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {gradeName && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 font-medium flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px] sm:max-w-none">{gradeName}</span>
            </Badge>
          )}
          {packageTitle && (
            <Badge variant="outline" className="border-border bg-background/50 px-3 py-1.5 font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate max-w-[200px] sm:max-w-md">{packageTitle}</span>
            </Badge>
          )}
          {sectionTitle && (
            <Badge variant="outline" className="border-border bg-background/50 px-3 py-1.5 font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate max-w-[150px] sm:max-w-none">{sectionTitle}</span>
            </Badge>
          )}
        </div>

        <p className="max-w-md text-base text-muted-foreground">
          {description}
        </p>

        {/* Action Buttons */}
        {children && (
          <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
