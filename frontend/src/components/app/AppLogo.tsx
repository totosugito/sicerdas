import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";
import { Link } from "@tanstack/react-router";

type Props = {
  hideText?: boolean
  size?: number
  className?: string
  onClick?: () => void
}

const AppLogo = ({ hideText = false, size = 26, className, onClick }: Props) => {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn("flex items-center gap-2 group", className)}
    >
      <div className="flex items-center justify-center rounded-full bg-card shadow-sm p-[3px]">
        <img 
          src={APP_CONFIG?.app?.logo} 
          width={size} 
          height={size} 
          alt={APP_CONFIG?.app?.name} 
        />
      </div>
      {!hideText && (
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {APP_CONFIG?.app?.name}
        </span>
      )}
    </Link>
  )
}

export default AppLogo