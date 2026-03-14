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
