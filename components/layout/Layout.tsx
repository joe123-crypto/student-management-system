'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { AttacheAgentContext, User } from '../../types';
import { UserRole } from '../../types';
import Button from '@/components/ui/Button';
import { ChevronRight, Home, LogOut, Menu, PanelLeftClose, Settings } from 'lucide-react';

const FloatingChatWidget = dynamic(
  () => import('@/components/layout/FloatingChatWidget'),
  {
    loading: () => null,
  },
);

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  role: UserRole;
  user?: User | null;
  onLogout: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  profilePicture?: string;
  showSettingsMenu?: boolean;
  showSidebarFooter?: boolean;
  sidebarFooterVariant?: 'full' | 'logout-only';
  agentContext?: AttacheAgentContext;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  role,
  user = null,
  onLogout,
  activeTab,
  setActiveTab,
  profilePicture,
  showSettingsMenu = false,
  showSidebarFooter = true,
  sidebarFooterVariant = 'full',
  agentContext,
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
      className="theme-shell flex min-h-screen text-[color:var(--theme-text)]"
      style={
        {
          '--sidebar-width': sidebarWidth,
          '--collapsed-sidebar-width': collapsedSidebarWidth,
        } as React.CSSProperties
      }
    >
      <aside
        className="theme-sidebar fixed left-0 top-0 z-20 hidden h-screen w-[var(--sidebar-width)] flex-col border-r transition-all duration-300 md:flex"
      >
        <div className={`${isSidebarExpanded ? 'p-8' : 'p-2'} border-b border-[rgba(220,205,166,0.7)]`}>
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}>
            <div className={`${isSidebarExpanded ? 'h-10 w-10 rounded-xl' : 'h-9 w-9 rounded-lg'} flex items-center justify-center bg-[color:var(--theme-primary)] shadow-[0_12px_24px_-10px_rgba(37,79,34,0.45)]`}>
              <span className={`${isSidebarExpanded ? 'text-xl' : 'text-lg'} text-white font-bold`}>S</span>
            </div>
            {isSidebarExpanded ? (
              <h1 className="theme-heading type-brand text-xl">ScholarsAlger</h1>
            ) : null}
          </div>
          {isSidebarExpanded ? (
            <Button
              variant="ghost"
              size="sm"
              className="theme-text-muted mt-3 w-full justify-start"
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
              className="theme-nav-inactive mx-auto mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className={`${isSidebarExpanded ? 'mt-4 px-4' : 'mt-4 px-1'}`}>
          {isSidebarExpanded ? (
            <div className="theme-text-muted type-label mb-2 px-4 py-2">Main Menu</div>
          ) : null}
        </div>

        <nav className={`flex-1 ${isSidebarExpanded ? 'px-4 space-y-2' : 'px-1 space-y-2'} mt-1`}>
          <button
            onClick={() => setActiveTab?.(dashboardHomeTab)}
            title="Dashboard Home"
            className={`w-full rounded-xl text-sm font-semibold transition-all ${isSidebarExpanded ? 'flex items-center justify-between px-4 py-3.5' : 'flex items-center justify-center px-2 py-2.5'} ${isDashboardHomeActive ? 'theme-nav-active' : 'theme-nav-inactive'}`}
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
              className={`w-full rounded-xl text-sm font-semibold transition-all ${isSidebarExpanded ? 'flex items-center justify-between px-4 py-3.5' : 'flex items-center justify-center px-2 py-2.5'} ${activeTab === 'settings' ? 'theme-nav-active' : 'theme-nav-inactive'}`}
            >
              <div className={`flex items-center ${isSidebarExpanded ? 'gap-3' : ''}`}>
                <Settings className="w-5 h-5" />
                {isSidebarExpanded ? 'Settings' : null}
              </div>
            </button>
          ) : null}
        </nav>

        {showSidebarFooter ? (
          isSidebarExpanded ? (
            <div className="p-6">
              {sidebarFooterVariant === 'full' ? (
                <div className="theme-card-muted space-y-4 rounded-3xl border p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--theme-primary)] shadow-lg shadow-[rgba(37,79,34,0.16)]">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-white/20 rounded-md" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="theme-text-muted type-label mb-1 leading-none">Role</p>
                      <p className="theme-heading text-sm font-bold uppercase">{role}</p>
                    </div>
                  </div>

                  <Button onClick={onLogout} variant="danger" title="Logout" className="w-full rounded-2xl py-3">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={onLogout} variant="danger" title="Logout" className="w-full rounded-2xl py-3">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sidebarFooterVariant === 'full' ? (
                <div
                  title={role}
                  className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--theme-primary)] shadow-lg shadow-[rgba(37,79,34,0.16)]"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-white/20 rounded-md" />
                  )}
                </div>
              ) : null}
              <button
                onClick={onLogout}
                title="Logout"
                className="theme-danger mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )
        ) : null}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-[var(--collapsed-sidebar-width)]">
        <header className="theme-header sticky top-0 z-10 border-b md:hidden">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--theme-primary)]">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="theme-heading type-brand text-lg">ScholarsAlger</h1>
            </div>
            <Button onClick={onLogout} variant="ghost" className="p-2 text-[color:var(--theme-danger)] hover:bg-[rgba(183,76,45,0.08)] hover:text-[color:var(--theme-danger-strong)]">
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-8 sm:mb-10">
              <div>
                <nav className="theme-text-muted type-label mb-3 flex items-center gap-2">
                  <span>{breadcrumbLeft}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="theme-accent-soft">{breadcrumbRight}</span>
                </nav>
                <h2 className="theme-heading type-page-title break-words">
                  {title}
                </h2>
              </div>
            </div>
            {children}
          </div>
        </main>

        <footer className="py-10 text-center">
          <p className="theme-text-muted type-meta">&copy; {new Date().getFullYear()} ScholarsAlger. All rights reserved.</p>
        </footer>
      </div>

      {role === UserRole.ATTACHE ? (
        <FloatingChatWidget role={role} user={user} context={agentContext} />
      ) : null}
    </div>
  );
};

export default Layout;

