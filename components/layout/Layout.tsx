import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserRole } from '../../types';
import Button from '@/components/ui/Button';
import { ChevronRight, Home, LogOut, Menu, PanelLeftClose, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  role: UserRole;
  onLogout: () => void;
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  profilePicture?: string;
  showSettingsMenu?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  role,
  onLogout,
  activeTab,
  setActiveTab,
  profilePicture,
  showSettingsMenu = false,
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const pathname = usePathname();
  const collapsedSidebarWidth = 'clamp(3.5rem, 5vw, 4.5rem)';
  const expandedSidebarWidth = 'clamp(14rem, 20vw, 18rem)';
  const sidebarWidth = isSidebarExpanded ? expandedSidebarWidth : collapsedSidebarWidth;
  const dashboardHomeTab = 'home';
  const isDashboardHomeActive =
    activeTab === 'home' ||
    activeTab === 'overview' ||
    activeTab === 'profile' ||
    activeTab === 'academic';
  const pathParts = (pathname || '').split('/').filter(Boolean);
  const breadcrumbLeft = (pathParts[0] || role.toLowerCase()).toUpperCase();
  const breadcrumbRight = (pathParts[1] || 'dashboard').toUpperCase();

  return (
    <div
      className="flex bg-slate-50 font-['Inter']"
      style={
        {
          '--sidebar-width': sidebarWidth,
          '--collapsed-sidebar-width': collapsedSidebarWidth,
        } as React.CSSProperties
      }
    >
      <aside
        className="bg-white border-r border-slate-100 flex flex-col fixed top-0 left-0 h-screen hidden md:flex z-20 transition-all duration-300 w-[var(--sidebar-width)]"
      >
        <div className={`${isSidebarExpanded ? 'p-8' : 'p-2'} border-b border-slate-100/80`}>
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}>
            <div className={`${isSidebarExpanded ? 'w-10 h-10 rounded-xl' : 'w-9 h-9 rounded-lg'} bg-indigo-600 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(79,70,229,0.4)]`}>
              <span className={`${isSidebarExpanded ? 'text-xl' : 'text-lg'} text-white font-bold`}>S</span>
            </div>
            {isSidebarExpanded ? (
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-rounded">ScholarSphere</h1>
            ) : null}
          </div>
          {isSidebarExpanded ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-slate-500"
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              title="Collapse menu"
            >
              <PanelLeftClose className="w-4 h-4" />
              Collapse menu
            </Button>
          ) : (
            <button
              onClick={() => setIsSidebarExpanded(true)}
              title="Expand menu"
              className="mt-3 w-9 h-9 mx-auto inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className={`${isSidebarExpanded ? 'mt-4 px-4' : 'mt-4 px-1'}`}>
          {isSidebarExpanded ? (
            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Main Menu</div>
          ) : null}
        </div>

        <nav className={`flex-1 ${isSidebarExpanded ? 'px-4 space-y-2' : 'px-1 space-y-2'} mt-1`}>
          <button
            onClick={() => setActiveTab?.(dashboardHomeTab)}
            title="Dashboard Home"
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-2.5'} text-sm font-semibold transition-all rounded-xl ${
              isDashboardHomeActive
                ? 'text-indigo-600 bg-indigo-50/50 border-r-4 border-indigo-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'gap-3' : ''}`}>
              <Home className="w-5 h-5" />
              {isSidebarExpanded ? 'Dashboard Home' : null}
            </div>
          </button>

          {showSettingsMenu ? (
            <button
              onClick={() => setActiveTab?.('settings')}
              title="Settings"
              className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-4 py-3.5' : 'justify-center px-2 py-2.5'} text-sm font-semibold transition-all rounded-xl ${
                activeTab === 'settings'
                  ? 'text-indigo-600 bg-indigo-50/50 border-r-4 border-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`flex items-center ${isSidebarExpanded ? 'gap-3' : ''}`}>
                <Settings className="w-5 h-5" />
                {isSidebarExpanded ? 'Settings' : null}
              </div>
            </button>
          ) : null}
        </nav>

        {isSidebarExpanded ? (
          <div className="p-6">
            <div className="p-5 space-y-4 rounded-3xl bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden">
                  {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-5 h-5 bg-white/20 rounded-md" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Role</p>
                  <p className="text-sm font-bold text-slate-700 uppercase">{role}</p>
                </div>
              </div>

              <Button
                onClick={onLogout}
                variant="ghost"
                title="Logout"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-50 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <div
              title={role}
              className="w-10 h-10 mx-auto rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden"
            >
              {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-5 h-5 bg-white/20 rounded-md" />}
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="w-10 h-10 mx-auto inline-flex items-center justify-center rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-[var(--collapsed-sidebar-width)]">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10 md:hidden">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-rounded">ScholarSphere</h1>
            </div>
            <Button onClick={onLogout} variant="ghost" className="p-2 text-red-500">
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
            <div className="mb-10">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <span>{breadcrumbLeft}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-indigo-600">{breadcrumbRight}</span>
                </nav>
                <h2 className="text-5xl font-black text-[#1a1b3a] tracking-tight font-rounded">{title}</h2>
              </div>
            </div>
            {children}
          </div>
        </main>

        <footer className="py-10 text-center">
          <p className="text-sm text-slate-400 font-medium">&copy; {new Date().getFullYear()} ScholarSphere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
