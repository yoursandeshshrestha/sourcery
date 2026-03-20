import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Moon, Sun, MoreVertical } from 'lucide-react';

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
      {
        title: 'Purchased Leads',
        href: '/dashboard/leads/purchased',
        iconSrc: '/icons/booking.svg',
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
  const { profile, user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    // Sync with system preference on mount
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const isSourcer = profile?.role === 'SOURCER';

  // Determine dashboard label based on role
  const dashboardLabel = isSourcer ? 'Sourcer Dashboard' : 'Admin Dashboard';

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
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground dark:border-r dark:border-border">
      {/* Logo/Header */}
      <div className="flex flex-col gap-2 p-2 pb-0">
        <div
          onClick={() => navigate('/')}
          className={`flex w-full items-center rounded-lg px-2 cursor-pointer hover:bg-sidebar-accent/50 transition-colors ${isCollapsed ? 'justify-center h-12' : 'gap-3 h-14'}`}
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
                {dashboardLabel}
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
                        'group flex w-full items-center gap-2 overflow-hidden rounded-lg p-1.5 text-left transition-colors h-8 text-[13px] font-[450] cursor-pointer',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                        isCollapsed ? 'justify-center px-2' : 'pl-2'
                      )}
                    >
                      <div className="shrink-0 relative">
                        {item.iconSrc && (
                          <img src={item.iconSrc} alt={item.title} className="size-4 dark:invert" />
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

      {/* Footer - Profile Menu */}
      <div className="mt-auto shrink-0 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 rounded-lg p-3 border border-border hover:bg-sidebar-accent/50 transition-colors cursor-pointer",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
                    <div className="text-sm font-semibold leading-tight truncate">
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight truncate">
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                  <MoreVertical className="size-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-80 rounded-2xl p-2 mb-2">
            <div className="px-3 py-3 bg-muted/50 border border-border rounded-xl mb-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-semibold text-primary">
                    {profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight truncate">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight truncate">
                    {user?.email || 'user@example.com'}
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs self-start">
                    {profile?.role || 'User'}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer rounded-xl"
              onClick={() => navigate('/dashboard/profile')}
            >
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-xl"
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer rounded-xl"
              onClick={(e) => {
                e.preventDefault();
                toggleTheme();
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  <span>Dark Mode</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} className="cursor-pointer" />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              onClick={() => setShowSignOutDialog(true)}
            >
              <LogOut className="mr-2 size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and will need to sign in again to access
              the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSignOutDialog(false)} className="cursor-pointer rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="cursor-pointer bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
