
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  profilePicture?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, role, userName, onLogout, activeTab, setActiveTab, profilePicture }) => {
  return (
    <div className="flex  bg-slate-50 font-['Inter']">
      {/* Sidebar - Modern Navigation Drawer */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen hidden md:flex z-20">
        {/* Sidebar Header: Logo */}
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(79,70,229,0.4)]">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-rounded">ScholarSphere</h1>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
            Main Menu
          </div>
          
          <button 
            onClick={() => setActiveTab?.('overview')}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-all rounded-xl ${
              activeTab === 'overview' || activeTab === 'profile' || activeTab === 'academic'
                ? 'text-indigo-600 bg-indigo-50/50 border-r-4 border-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard Home
            </div>
          </button>
        </nav>

        {/* Sidebar Footer: User Profile & Logout (As seen in screenshot) */}
        <div className="p-6">
          <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-5 h-5 bg-white/20 rounded-md"></div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Role</p>
                <p className="text-sm font-bold text-slate-700 uppercase">{role}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-50 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10 md:hidden">
          <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-rounded">ScholarSphere</h1>
            </div>
            <button onClick={onLogout} className="p-2 text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
            <div className="mb-10 flex justify-between items-start">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <span>DASHBOARD</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                  <span className="text-indigo-600">{role.toUpperCase()}</span>
                </nav>
                <h2 className="text-5xl font-black text-[#1a1b3a] tracking-tight font-rounded">{title}</h2>
              </div>
              <button 
                onClick={onLogout} 
                className="hidden md:flex p-3 bg-white border border-slate-100 text-red-500 rounded-2xl shadow-sm hover:bg-red-50 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
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
