import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppSidebar from "@/components/app/sidebar/AppSidebar";
import { AppNavbar } from "@/components/app/navbar/AppNavbar";
import { AdminNav } from "@/constants/admin-nav";
import { useTranslation } from "react-i18next";
import { SidebarProvider } from '@/components/ui/sidebar';

export const Route = createFileRoute('/(pages)/(private)/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen bg-muted/40">
      <SidebarProvider>
        <AppSidebar navItems={AdminNav} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <AppNavbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-14">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
