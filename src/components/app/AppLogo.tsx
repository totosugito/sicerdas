import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";
import { Link } from "@tanstack/react-router";

type Props = {
  disableCollapsed?: boolean
  className?: string
  onClick?: () => void
}

const AppLogo = ({ disableCollapsed = false, className, onClick }: Props) => {
  // If we want to skip sidebar-dependent logic (e.g. in Navbar or Footer)
  if (disableCollapsed) {
    return (
      <Link 
        to="/" 
        onClick={onClick}
        className={cn("flex items-center gap-2 group", className)}
      >
        <div className={cn("flex items-center justify-center rounded-full bg-card shadow-sm p-[3px]")} >
          <img src={APP_CONFIG?.app?.logo} width={26} height={26} alt={APP_CONFIG?.app?.name} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {APP_CONFIG?.app?.name}
        </span>
      </Link>
    )
  }

  // Fallback sidebar logic
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { state } = useSidebar();
    const isCollapsed = (state === "collapsed");

    return (
      <Link 
        to="/" 
        onClick={onClick}
        className={cn("flex items-center gap-2 group", className)}
      >
        <div className={cn("flex items-center justify-center rounded-full bg-card shadow-sm", isCollapsed ? "p-[2px]" : "p-[3px]")} >
          <img src={APP_CONFIG?.app?.logo} width={isCollapsed ? 22 : 26} height={isCollapsed ? 22 : 26} alt={APP_CONFIG?.app?.name} />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {APP_CONFIG?.app?.name}
          </span>
        )}
      </Link>
    )
  } catch {
    // If used outside SidebarProvider and disableCollapsed is false
    return (
      <Link 
        to="/" 
        onClick={onClick}
        className={cn("flex items-center gap-2 group", className)}
      >
        <div className={cn("flex items-center justify-center rounded-full bg-card shadow-sm p-[3px]")} >
          <img src={APP_CONFIG?.app?.logo} width={26} height={26} alt={APP_CONFIG?.app?.name} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {APP_CONFIG?.app?.name}
        </span>
      </Link>
    )
  }
}

export default AppLogo