import { cn } from "@/lib/utils";

type Props = {
  icon?: React.ReactNode;
  appName?: string;
  title: string;
  description?: string;
  badgeText?: string;
  variant?: "default" | "success" | "destructive";
};

export const AuthHeader = ({
  icon,
  appName,
  title,
  description,
  badgeText,
  variant = "default",
}: Props) => {
  const variantStyles = {
    default: "from-primary to-indigo-500 shadow-primary/25",
    success: "from-emerald-500 to-teal-500 shadow-emerald-500/25",
    destructive: "from-destructive to-rose-600 shadow-destructive/25",
  };

  return (
    <div className="text-center space-y-3 mb-6">
      {icon && (
        <div
          className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr text-white shadow-lg mb-1 transition-transform hover:scale-105 duration-300 [&_svg]:w-7 [&_svg]:h-7 [&_svg]:text-white",
            variantStyles[variant],
          )}
        >
          {icon}
        </div>
      )}

      {badgeText && (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {badgeText}
          </span>
        </div>
      )}

      {appName && !icon && (
        <div className="text-xs font-bold uppercase tracking-wider text-primary">{appName}</div>
      )}

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
