import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";
import { Link } from "@tanstack/react-router";

type Props = {
  disableColapsed?: boolean
}

const AppLogo = ({ disableColapsed = false }: Props) => {
  if (disableColapsed === false) {
    return (
      <Link to="/" className="flex items-center gap-2 group">
        <div className={cn("flex items-center justify-center justify-items-center rounded-full bg-card shadow-sm", "p-[2px]")} >
          <img src={APP_CONFIG?.app?.logo} width={26} height={26} alt={"shadow-sm"} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {APP_CONFIG?.app?.name}
        </span>
      </Link>
    )
  }

  const { state } = useSidebar();
  const isCollapsed = (state === "collapsed");

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={cn("flex items-center justify-center justify-items-center rounded-full bg-card shadow-sm", isCollapsed ? "p-[2px]" : "p-[3px]")} >
        <img src={APP_CONFIG?.app?.logo} width={isCollapsed ? 22 : 26} height={isCollapsed ? 22 : 26} alt={"shadow-sm"} />
      </div>
      {isCollapsed ? null : <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {APP_CONFIG?.app?.name}
      </span>}
    </Link>
  )
}
export default AppLogo