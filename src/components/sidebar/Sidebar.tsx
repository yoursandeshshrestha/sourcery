import { useAuth } from '@/contexts/AuthContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarFooter } from './SidebarFooter';
import { sidebarConfig, sourcerSidebarConfig, adminSidebarConfig } from './sidebarConfig';

export function Sidebar() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'ADMIN';
  const isSourcer = profile?.role === 'SOURCER' || profile?.role === 'ADMIN';

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
          {isSourcer &&
            sourcerSidebarConfig.map((group, index) => (
              <SidebarNavGroup key={`sourcer-${index}`} group={group} />
            ))}
          {isAdmin &&
            adminSidebarConfig.map((group, index) => (
              <SidebarNavGroup key={`admin-${index}`} group={group} />
            ))}
        </div>
      </div>

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
}
