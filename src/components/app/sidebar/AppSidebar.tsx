import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import AppLogo from '../AppLogo';
import {NavGroup} from "./NavGroup";
import {SidebarData} from "./types";
import {cn} from "@/lib/utils";

function AppSidebar({navItems, ...props }: { navItems: SidebarData }) {
  return (
    <Sidebar 
      collapsible='icon' 
      variant='floating' 
      className="border-sidebar-border"
      {...props}
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border/50 rounded-t-lg">
        <AppLogo className="text-sidebar-foreground"/>
      </SidebarHeader>

      <SidebarContent className={cn(
        "scrollbar overflow-x-hidden bg-sidebar",
        "[&>*]:text-sidebar-foreground"
      )}>
        {navItems.navGroups.map((props_: any, index: number) => (
          <NavGroup 
            key={`${props_.title}-${index}`} 
            {...props_} 
            className="text-sidebar-foreground [&>*]:text-sidebar-foreground"
          />
        ))}
      </SidebarContent>
      
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border/50 rounded-b-lg">
        {/* Add any footer content here if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
