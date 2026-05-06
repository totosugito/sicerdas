import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
  trend,
}: StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-none shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground font-medium">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded-full",
                    trend.isPositive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110",
              iconClassName
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
