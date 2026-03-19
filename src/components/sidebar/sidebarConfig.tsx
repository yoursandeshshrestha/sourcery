import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Building2,
  Receipt,
  User,
  Settings,
  FileCheck,
  Users,
  MessageSquare,
  ShoppingBag
} from 'lucide-react';

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
    label: 'Dashboard',
    items: [
      {
        label: 'Overview',
        href: '/dashboard/overview',
        icon: <LayoutDashboard className="size-4" />,
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        label: 'Messages',
        href: '/dashboard/messages',
        icon: <MessageSquare className="size-4" />,
      },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      {
        label: "Dan's Leads",
        href: '/dashboard/leads',
        icon: <ShoppingBag className="size-4" />,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/dashboard/profile',
        icon: <User className="size-4" />,
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="size-4" />,
      },
    ],
  },
];

export const sourcerSidebarConfig: NavGroup[] = [
  {
    label: 'Deals',
    items: [
      {
        label: 'My Deals',
        href: '/dashboard/my-deals',
        icon: <Building2 className="size-4" />,
      },
      {
        label: 'Pipeline',
        href: '/dashboard/pipeline',
        icon: <Kanban className="size-4" />,
      },
      {
        label: 'Reservations',
        href: '/dashboard/reservations/deals',
        icon: <Receipt className="size-4" />,
      },
    ],
  },
];

export const adminSidebarConfig: NavGroup[] = [
  {
    label: 'System Overview',
    items: [
      {
        label: 'All Deals',
        href: '/dashboard/admin/deals',
        icon: <Building2 className="size-4" />,
      },
      {
        label: 'All Pipelines',
        href: '/dashboard/admin/pipelines',
        icon: <Kanban className="size-4" />,
      },
      {
        label: 'All Reservations',
        href: '/dashboard/admin/reservations',
        icon: <Receipt className="size-4" />,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Applications',
        href: '/dashboard/admin/applications',
        icon: <FileCheck className="size-4" />,
      },
      {
        label: 'Users',
        href: '/dashboard/admin/users',
        icon: <Users className="size-4" />,
      },
      {
        label: "Manage Leads",
        href: '/dashboard/admin/leads',
        icon: <ShoppingBag className="size-4" />,
      },
    ],
  },
];
