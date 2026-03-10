import { useSidebar } from '@/contexts/SidebarContext';
import { Package } from 'lucide-react';

export function SidebarHeader() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-col gap-2 p-2 pb-0">
      <div className="flex h-10 w-full items-center gap-2.5 px-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden border border-sidebar-border bg-sidebar-accent">
          <Package className="size-4 text-sidebar-foreground" />
        </span>
        {!isCollapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold leading-tight text-sidebar-foreground">
              Sourcery
            </span>
            <span className="truncate text-[11px] leading-tight text-sidebar-foreground/60">
              Dashboard
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
