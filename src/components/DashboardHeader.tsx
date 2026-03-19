import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const { profile, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Generate breadcrumbs from current path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard/overview' }];

    if (segments.length > 1) {
      const pageName = segments[segments.length - 1];
      const formatted = pageName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label: formatted, href: path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Mock notifications data - in real app this would come from a store/API
  const notifications = {
    unreadCount: 0,
  };

  return (
    <header className="flex h-14 items-center justify-between px-4 border-b border-border">
      {/* Left Section: Sidebar Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="cursor-pointer shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z" />
            <path d="M15 3V21" />
            <path d="M10 9L8.89181 9.87868C7.6306 10.8787 7 11.3787 7 12C7 12.6213 7.6306 13.1213 8.89181 14.1213L10 15" />
          </svg>
        </Button>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1.5">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="inline-flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground/40" />}
                {item.href && index < breadcrumbs.length - 1 ? (
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right Section: Notifications + User Menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer relative">
              <img src="/icons/bell.svg" alt="Notifications" className="size-5" />
              {notifications.unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {notifications.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {notifications.unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {notifications.unreadCount === 0 && (
              <div className="py-8 text-center">
                <img src="/icons/bell.svg" alt="Bell" className="mx-auto size-8 mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <img src="/icons/profile.svg" alt="Profile" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-tight break-all">
                  {user?.email || 'user@example.com'}
                </p>
                <Badge variant="secondary" className="mt-1 w-fit text-xs">
                  {profile?.role || 'User'}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/dashboard/settings')}
            >
              <img src="/icons/platform-configration.svg" alt="Settings" className="mr-2 size-4" />
              <span>Platform Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/dashboard/profile')}
            >
              <img src="/icons/profile.svg" alt="Account" className="mr-2 size-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
              onClick={() => setSignOutDialogOpen(true)}
            >
              <img
                src="/icons/logout.svg"
                alt="Logout"
                className="mr-2 size-4"
                style={{
                  filter:
                    'invert(28%) sepia(90%) saturate(4584%) hue-rotate(353deg) brightness(94%) contrast(101%)',
                }}
              />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sign Out Confirmation Dialog */}
        <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login page and will need to sign in again to access
                the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSignOutDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
