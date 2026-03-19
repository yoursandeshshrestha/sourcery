import { useSidebar } from '@/contexts/SidebarContext';

export function SidebarHeader() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-col gap-2 p-2 pb-0">
      <div className="flex h-10 w-full items-center gap-2.5 px-2">
        <img
          src="/logo/sourcery.png"
          alt="Sourcery"
          className={`object-contain transition-all ${isCollapsed ? 'h-7 w-7' : 'h-8 w-auto'}`}
        />
      </div>
    </div>
  );
}
