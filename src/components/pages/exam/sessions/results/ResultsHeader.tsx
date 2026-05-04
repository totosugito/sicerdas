import React from "react";
import { Trophy } from "lucide-react";

interface ResultsHeaderProps {
  title: string;
  description: string;
  packageTitle?: string;
  sectionTitle?: string;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  title,
  description,
  packageTitle,
  sectionTitle,
}) => {
  return (
    <div className="w-full bg-primary/5 border-b border-primary/10 py-8 md:py-12 px-4 mb-8">
      <div className="w-full flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
          <Trophy className="w-10 h-10 text-primary" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {packageTitle && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
              {packageTitle}
            </span>
          )}
          {sectionTitle && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full border border-border">
              {sectionTitle}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
    </div>
  );
};
