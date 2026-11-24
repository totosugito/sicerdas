import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ConstitutionHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  badges?: string[];
  children?: React.ReactNode;
}

export const ConstitutionHero: React.FC<ConstitutionHeroProps> = ({
  title,
  subtitle,
  description,
  badges,
  children,
}) => {
  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden">
      <CardHeader
        className={children ? "p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border/70" : "p-4 sm:p-6"}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3.5 sm:gap-5 flex-1 min-w-0">
            <div className="p-2.5 rounded-xl bg-muted/50 border border-border/80 shrink-0">
              <img
                src="/constitution/images/ic_pancasila.png"
                alt={title}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>

            <div className="space-y-1 min-w-0">
              {subtitle && (
                <div className="text-[11px] sm:text-xs font-semibold text-red-600 dark:text-red-400 tracking-wider uppercase">
                  {subtitle}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {badges && badges.length > 0 && (
            <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end justify-center gap-x-4 gap-y-1 shrink-0 sm:border-l sm:border-border/70 sm:pl-5">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium text-muted-foreground whitespace-nowrap"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      {children && <CardContent className="p-3.5 sm:p-5 bg-muted/20">{children}</CardContent>}
    </Card>
  );
};
