import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";

type Props = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  withDescription?: boolean;
  className?: string;
  descriptionClassName?: string;
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  xs: "text-xs font-bold tracking-tight",
  sm: "text-sm font-bold tracking-tight",
  md: "text-base font-bold tracking-tight",
  lg: "text-lg font-bold tracking-tight",
  xl: "text-xl font-bold tracking-tight",
  "2xl": "text-2xl font-black tracking-tight",
  "3xl": "text-3xl font-black tracking-tight",
  "4xl": "text-4xl font-black tracking-tight",
};

const AppName = ({
  size = "2xl",
  withDescription = false,
  className,
  descriptionClassName,
}: Props) => {
  const nameElement = (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-indigo-500 to-sky-400 bg-clip-text text-transparent leading-none",
        sizeClasses[size],
        className
      )}
    >
      {APP_CONFIG?.app?.name}
    </span>
  );

  if (!withDescription) {
    return nameElement;
  }

  return (
    <div className="flex flex-col">
      {nameElement}
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 mt-1",
          descriptionClassName
        )}
      >
        {APP_CONFIG?.app?.description}
      </span>
    </div>
  );
};

export default AppName;

