import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAppMenu } from "@/features/app/hooks/use-app-menu";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

export const ConstitutionNav: React.FC = () => {
  const { constitutionMenu } = useAppMenu();
  const location = useLocation();

  return (
    <div className="w-full rounded-2xl bg-card/80 backdrop-blur-sm border border-border/70 p-1.5 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {constitutionMenu.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center justify-center text-center px-2.5 py-2 rounded-xl text-xs font-semibold leading-tight transition-all duration-200 border",
                isActive
                  ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/20 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40 dark:shadow-none"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60 bg-muted/30 sm:bg-transparent",
              )}
            >
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
