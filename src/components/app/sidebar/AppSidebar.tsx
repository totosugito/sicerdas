import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import AppLogo from '../AppLogo';
import { NavGroup } from "./NavGroup";
import { SidebarData } from "./types";
import { cn } from "@/lib/utils";

function AppSidebar({ navItems, ...props }: { navItems: SidebarData }) {
  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
      className="border-sidebar-border"
      {...props}
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border/30 py-2">
        <AppLogo />
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

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border/50">
        {/* Add any footer content here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
