import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  iconSrc?: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Base navigation for all users
const baseNavGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      {
        title: 'Overview',
        href: '/dashboard/overview',
        iconSrc: '/icons/dashboard.svg',
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        title: 'Messages',
        href: '/dashboard/messages',
        iconSrc: '/icons/contact.svg',
      },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      {
        title: "Dan's Leads",
        href: '/dashboard/leads',
        iconSrc: '/icons/add-ons.svg',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Profile',
        href: '/dashboard/profile',
        iconSrc: '/icons/profile.svg',
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        iconSrc: '/icons/setting.svg',
      },
    ],
  },
];

// Sourcer-specific navigation
const sourcerNavGroups: NavGroup[] = [
  {
    label: 'Deals',
    items: [
      {
        title: 'My Deals',
        href: '/dashboard/my-deals',
        iconSrc: '/icons/ship.svg',
      },
      {
        title: 'Pipeline',
        href: '/dashboard/pipeline',
        iconSrc: '/icons/analytics.svg',
      },
      {
        title: 'Reservations',
        href: '/dashboard/reservations/deals',
        iconSrc: '/icons/booking.svg',
      },
    ],
  },
];

// Admin-specific navigation
const adminNavGroups: NavGroup[] = [
  {
    label: 'System Overview',
    items: [
      {
        title: 'All Deals',
        href: '/dashboard/admin/deals',
        iconSrc: '/icons/ship.svg',
      },
      {
        title: 'All Pipelines',
        href: '/dashboard/admin/pipelines',
        iconSrc: '/icons/analytics.svg',
      },
      {
        title: 'All Reservations',
        href: '/dashboard/admin/reservations',
        iconSrc: '/icons/booking.svg',
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Applications',
        href: '/dashboard/admin/applications',
        iconSrc: '/icons/edit.svg',
      },
      {
        title: 'Users',
        href: '/dashboard/admin/users',
        iconSrc: '/icons/admin-users.svg',
      },
      {
        title: 'Manage Leads',
        href: '/dashboard/admin/leads',
        iconSrc: '/icons/add-ons.svg',
      },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const { profile, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const isAdmin = profile?.role === 'ADMIN';
  const isSourcer = profile?.role === 'SOURCER';

  // Build navigation config based on role
  let navGroups: NavGroup[] = [];

  if (isAdmin) {
    // Admin order: Dashboard → System Overview → Administration → Account
    const dashboard = baseNavGroups.find((g) => g.label === 'Dashboard');
    const account = baseNavGroups.find((g) => g.label === 'Account');

    if (dashboard) navGroups.push(dashboard);
    navGroups.push(...adminNavGroups);
    if (account) navGroups.push(account);
  } else if (isSourcer) {
    // Sourcer: Dashboard → Deals → Marketplace → Account (no Communication)
    const dashboard = baseNavGroups.find((g) => g.label === 'Dashboard');
    const marketplace = baseNavGroups.find((g) => g.label === 'Marketplace');
    const account = baseNavGroups.find((g) => g.label === 'Account');

    if (dashboard) navGroups.push(dashboard);
    navGroups.push(...sourcerNavGroups);
    if (marketplace) navGroups.push(marketplace);
    if (account) navGroups.push(account);
  } else {
    // Investor: all base config
    navGroups = baseNavGroups;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo/Header */}
      <div className="flex flex-col gap-2 p-2 pb-0">
        <div
          className={`flex w-full items-center rounded-lg px-2 ${isCollapsed ? 'justify-center h-12' : 'gap-3 h-14'}`}
        >
          {/* Logo Icon */}
          <div className="shrink-0">
            <img
              src="/logo/sourcery-logo-no-text.png"
              alt="Sourcery"
              className={isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}
            />
          </div>

          {/* Brand Name */}
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold leading-tight text-sidebar-foreground">
                Sourcery
              </span>
              <span className="truncate text-[11px] leading-tight text-sidebar-foreground/60">
                Admin Dashboard
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="flex flex-col gap-2 py-2">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {!isCollapsed && (
                <div className="px-3 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const badge = item.badge;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'group flex w-full items-center gap-2 overflow-hidden rounded-md p-1.5 text-left transition-colors h-8 text-[13px] font-[450] cursor-pointer',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                        isCollapsed ? 'justify-center px-2' : 'pl-2'
                      )}
                    >
                      <div className="shrink-0 relative">
                        {item.iconSrc && (
                          <img src={item.iconSrc} alt={item.title} className="size-4" />
                        )}
                        {isCollapsed && badge && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white w-4 h-4 text-[10px] font-bold">
                            {badge}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate transition-[letter-spacing] duration-150 group-hover:tracking-wide">
                            {item.title}
                          </span>
                          {badge && (
                            <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium min-w-[20px]">
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Actions */}
      {!isCollapsed && (
        <div className="mt-auto shrink-0 p-2">
          <div className="flex items-center justify-center gap-3 text-xs text-sidebar-foreground/70">
            <Link
              to="/"
              className="hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
            >
              Home
            </Link>
            <span className="text-sidebar-border">|</span>
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
