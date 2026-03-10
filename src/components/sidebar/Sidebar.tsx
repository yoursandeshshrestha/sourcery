import { SidebarHeader } from './SidebarHeader';
import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarFooter } from './SidebarFooter';
import { sidebarConfig } from './sidebarConfig';

export function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <SidebarHeader />

      {/* Separator */}
      <div className="my-2 h-px bg-sidebar-border" />

      {/* Navigation */}
      <div className="flex-1 px-1">
        <div className="flex flex-col gap-2">
          {sidebarConfig.map((group, index) => (
            <SidebarNavGroup key={index} group={group} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
}
