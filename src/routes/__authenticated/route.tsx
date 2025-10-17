import {createFileRoute, Outlet, redirect} from '@tanstack/react-router'
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app/sidebar/AppSidebar";
import {AdminNav} from "@/constants/user-nav";
import * as React from "react";
import {APP_CONFIG} from "@/constants/config";
import {useAuth} from "@/hooks/use-auth";
import {AppNavbar} from "@/components/app";
export const Route = createFileRoute('/__authenticated')({
  loader: ({context}) => {
    if (!context?.auth?.isAuthenticated) {
      throw redirect({to: APP_CONFIG.path.defaultPublic})
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth();
  const userRole = auth?.user?.user?.role;

  // const webNav: any = userRole === USER_ROLE.admin.value ? AdminNav : (userRole === USER_ROLE.user.value ? UserNav : ContractorNav)
  const webNav: any = AdminNav
  return(
    <div className={"h-screen flex flex-row overflow-auto"}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar navItems={webNav}/>

        <SidebarInset  className={"flex flex-1 overflow-x-hidden h-screen flex-col"}>
          <AppNavbar/>
          <Outlet/>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
