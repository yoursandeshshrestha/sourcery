import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { StripeHeaderIndicator } from '@/components/stripe/StripeHeaderIndicator';

export function DashboardHeader() {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const { profile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Helper to get full name
  const getFullName = () => {
    if (!profile) return 'User';
    return `${profile.first_name} ${profile.last_name}`.trim() || 'User';
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    if (signOut) {
      await signOut();
    }
    navigate('/', { replace: true });
  };

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard/overview' }];

    if (segments.length > 1) {
      const pageName = segments[segments.length - 1];
      const formatted = pageName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label: formatted, href: path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-14 items-center gap-3 px-4 text-sm bg-card border-b border-border">
      {/* Sidebar Toggle */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebar}
          className="relative inline-flex shrink-0 items-center justify-center border border-transparent bg-transparent hover:bg-accent text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 size-9 cursor-pointer"
        >
          <img
            src="/icons/panel-right.svg"
            alt=""
            className="size-5 dark:invert rotate-0 scale-100 transition-all"
            style={{ display: isCollapsed ? 'block' : 'none' }}
          />
          <img
            src="/icons/panel-left.svg"
            alt=""
            className="absolute size-5 dark:invert rotate-0 scale-100 transition-all"
            style={{ display: isCollapsed ? 'none' : 'block' }}
          />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <div
          role="separator"
          aria-orientation="vertical"
          className="shrink-0 ml-3 mr-2 h-8 w-px bg-border self-center"
        />
      </div>

      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground sm:gap-2.5">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <li
                  role="presentation"
                  aria-hidden="true"
                  className="opacity-70 text-muted-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </li>
              )}
              <span
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* User Info */}
      <div className="ml-auto flex items-center gap-3">
        {/* Stripe Onboarding Indicator */}
        <StripeHeaderIndicator />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer outline-none focus:outline-none">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-medium text-foreground">
                  {getFullName()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile?.role || 'Admin'}
                </span>
              </div>
              <Avatar className="size-8 border border-border">
                <AvatarImage
                  src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                  alt={getFullName()}
                />
                <AvatarFallback className="bg-accent">
                  <img src="/icons/user.svg" alt="" className="size-4 dark:invert" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
              <img src="/icons/setting.svg" alt="" className="mr-2 h-4 w-4 dark:invert" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              onClick={() => setShowLogoutDialog(true)}
            >
              <img src="/icons/logout.svg" alt="" className="mr-2 h-4 w-4 dark:invert" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
