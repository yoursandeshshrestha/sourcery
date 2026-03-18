import { useAuth } from '@/contexts/AuthContext';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarFooter } from './SidebarFooter';
import { sidebarConfig, sourcerSidebarConfig, adminSidebarConfig } from './sidebarConfig';

export function Sidebar() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'ADMIN';
  const isSourcer = profile?.role === 'SOURCER';

  // Build navigation config based on role
  let navGroups: typeof sidebarConfig = [];

  if (isAdmin) {
    // Admin order: Dashboard → System Overview → Administration → Account
    const dashboard = sidebarConfig.find((g) => g.label === 'Dashboard');
    const account = sidebarConfig.find((g) => g.label === 'Account');

    if (dashboard) navGroups.push(dashboard);
    navGroups.push(...adminSidebarConfig);
    if (account) navGroups.push(account);
  } else if (isSourcer) {
    // Sourcer: Dashboard → Deals → Account (no Communication)
    navGroups = sidebarConfig.filter((group) => group.label !== 'Communication');
    navGroups.splice(1, 0, ...sourcerSidebarConfig);
  } else {
    // Investor: all base config
    navGroups = sidebarConfig;
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <SidebarHeader />

      {/* Separator */}
      <div className="my-2 h-px bg-sidebar-border" />

      {/* Navigation */}
      <div className="flex-1 px-1">
        <div className="flex flex-col gap-2">
          {navGroups.map((group, index) => (
            <SidebarNavGroup key={index} group={group} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
}
