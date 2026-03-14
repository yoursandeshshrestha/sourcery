import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="mt-auto border-t border-sidebar-border">
      <div className="flex flex-col gap-2 p-2">
        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-150 cursor-pointer"
              >
                Home
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent hover:bg-sidebar-accent transition-colors size-8 px-0"
            >
              <img
                src="/icons/sun.svg"
                alt=""
                className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <img
                src="/icons/moon.svg"
                alt=""
                className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:invert"
              />
              <span className="sr-only">Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
