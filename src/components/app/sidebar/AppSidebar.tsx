import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import AppLogo from '../AppLogo';
import { NavGroup } from "./NavGroup";
import { SidebarData } from "./types";
import { cn } from "@/lib/utils";

function AppSidebar({ navItems, ...props }: { navItems: SidebarData }) {
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
      className="border-sidebar-border"
      {...props}
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border/30 py-2">
        <AppLogo disableColapsed={true} />
      </SidebarHeader>

      <SidebarContent className={cn(
        "scrollbar overflow-x-hidden bg-sidebar",
      )}>
        {navItems.navGroups.map((props_: any, index: number) => (
          <NavGroup
            key={`${props_.title}-${index}`}
            {...props_}
          />
        ))}
      </SidebarContent>

      {state === 'expanded' && (
        <SidebarFooter className="bg-sidebar border-t border-sidebar-border/50 rounded-b-lg">
          <div className="flex flex-col items-center justify-center py-1 text-[10px] text-muted-foreground select-none">
            Build v{__BUILD_VERSION__}
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export default AppSidebar;
