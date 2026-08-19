import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";
import { Link } from "@tanstack/react-router";
import AppName from "./AppName";

type Props = {
  hideText?: boolean;
  size?: number;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  withDescription?: boolean;
  className?: string;
  onClick?: () => void;
};

const AppLogo = ({
  hideText = false,
  size = 36,
  textSize = "xl",
  withDescription = false,
  className,
  onClick,
}: Props) => {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn("inline-flex items-center gap-2.5 group select-none", className)}
    >
      <div
        style={{ width: size, height: size }}
        className="rounded-2xl bg-card border border-border/80 p-1 shadow-sm group-hover:border-primary/50 group-hover:shadow-md group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0 overflow-hidden"
      >
        <img
          src={APP_CONFIG?.app?.logo || "/images/sicerdas-transparent-v1.png"}
          alt={APP_CONFIG?.app?.name}
          className="w-full h-full object-contain"
        />
      </div>
      {!hideText && (
        <AppName size={textSize} withDescription={withDescription} />
      )}
    </Link>
  );
};


export default AppLogo;