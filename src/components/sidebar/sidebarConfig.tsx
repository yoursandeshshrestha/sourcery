import { type ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const sidebarConfig: NavGroup[] = [
  {
    label: 'Main',
    items: [
      {
        label: 'Overview',
        href: '/dashboard/overview',
        icon: <img src="/icons/home.svg" alt="" className="size-4 dark:invert" />,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/dashboard/profile',
        icon: <img src="/icons/profile.svg" alt="" className="size-4 dark:invert" />,
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <img src="/icons/setting.svg" alt="" className="size-4 dark:invert" />,
      },
    ],
  },
];

export const sourcerSidebarConfig: NavGroup[] = [
  {
    label: 'Sourcer',
    items: [
      {
        label: 'My Deals',
        href: '/dashboard/my-deals',
        icon: <img src="/icons/home.svg" alt="" className="size-4 dark:invert" />,
      },
      {
        label: 'Reservations',
        href: '/dashboard/reservations/deals',
        icon: <img src="/icons/profile.svg" alt="" className="size-4 dark:invert" />,
      },
    ],
  },
];

export const adminSidebarConfig: NavGroup[] = [
  {
    label: 'Admin',
    items: [
      {
        label: 'Applications',
        href: '/dashboard/admin/applications',
        icon: <img src="/icons/profile.svg" alt="" className="size-4 dark:invert" />,
      },
      {
        label: 'User Management',
        href: '/dashboard/admin/users',
        icon: <img src="/icons/setting.svg" alt="" className="size-4 dark:invert" />,
      },
    ],
  },
];
