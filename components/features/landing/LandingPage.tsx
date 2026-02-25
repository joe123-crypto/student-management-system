import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PROGRESS_DATA, MOCK_ANNOUNCEMENTS } from '@/constants';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { ArrowRight, BarChart3, Bell, CalendarDays, DollarSign, FolderOpen, Globe2, MessageSquare, Search, User } from 'lucide-react';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const toolsRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);

  const tools = [
    { name: 'FAST RECORD FINDER', icon: 'search' },
    { name: 'DOCUMENT VAULT', icon: 'folder' },
    { name: 'ACADEMIC TRACKER', icon: 'chart' },
    { name: 'SUPPORT PORTAL', icon: 'chat' },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, e: React.MouseEvent) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <Search className="w-5 h-5" />;
      case 'folder':
        return <FolderOpen className="w-5 h-5" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  const latestAnnouncement = MOCK_ANNOUNCEMENTS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-['Inter']">

      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <nav className="max-w-5xl mx-auto h-16 px-6 bg-white border border-slate-200 rounded-full flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="text-xl font-bold tracking-tight">ScholarSphere</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              How it works
            </a>
            <a href="#tools" onClick={(e) => scrollToSection(toolsRef, e)} className="hover:text-indigo-600 transition-colors">
              Tools
            </a>
            <a href="#announcements" onClick={(e) => scrollToSection(announcementsRef, e)} className="hover:text-indigo-600 transition-colors">
              Announcements
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/login')} variant="ghost" size="sm" className="text-sm font-semibold text-slate-600 px-4 py-2 hover:text-slate-900">
              Login
            </Button>
            <Button onClick={() => router.push('/login')} size="sm" className="text-sm py-2.5 px-6 rounded-full hover:scale-105">
              Get Started
            </Button>
          </div>
        </nav>
      </div>

      <main className="relative z-10 pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Trusted by 1 governments</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-[#1a1b3a] leading-[1.2] tracking-tight font-quicksand">
                Manage <span className="inline-block px-4 py-1 bg-indigo-600 text-white rounded-2xl shadow-sm">Scholarships</span> and digital details in minutes
              </h1>

              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                The fastest way to manage your academic profile, banking details, and university progress in one unified stack.
              </p>

              <div className="flex gap-4">
                <Button onClick={() => router.push('/login')} className="font-bold py-4 px-10 rounded-full shadow-xl shadow-indigo-100 flex items-center gap-2 group hover:scale-105">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_32px_120px_-20px_rgba(79,70,229,0.12)] border border-slate-100 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
                <div className="mb-8 pb-4 border-b-2 border-slate-50">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Academic Status</h3>
                  <div className="flex gap-2">
                    <div className="w-16 h-1 bg-indigo-600 rounded-full" />
                    <div className="w-8 h-1 bg-indigo-100 rounded-full" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current GPA</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">3.92</p>
                    </div>

                    <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] border border-indigo-400 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-xs font-bold text-indigo-200 uppercase mb-1 relative z-10">Status</p>
                      <p className="text-3xl font-black tracking-tight relative z-10">Active</p>
                    </div>
                  </div>

                  <div className="h-48 w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PROGRESS_DATA}>
                        <defs>
                          <linearGradient id="colorHero" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Area type="monotone" dataKey="gpa" stroke="#4f46e5" strokeWidth={4} fill="url(#colorHero)" animationDuration={3000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="absolute top-12 -right-16 bg-white p-6 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-50 hidden md:block animate-bounce-slow z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deposit Status</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">+$2,450.00</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-12 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/50 hidden md:block animate-float z-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                  <div className="space-y-1">
                    <div className="w-20 h-2 bg-slate-200 rounded-full" />
                    <div className="w-12 h-2 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="w-full h-1 bg-indigo-600 rounded-full mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress to Degree</p>
              </div>
            </div>
          </div>

          <div ref={toolsRef} className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-black text-[#1a1b3a] mb-10 font-quicksand">Explore Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tools.map((tool, i) => (
                <div
                  key={i}
                  className="aspect-video bg-white/50 backdrop-blur-md border border-white/60 rounded-[2rem] shadow-sm flex items-center justify-center group overflow-hidden relative transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-3 w-full px-4">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-400 transition-transform group-hover:rotate-12">
                      {getIcon(tool.icon)}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{tool.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={announcementsRef} className="scroll-mt-24 mb-12">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-[#1a1b3a] font-quicksand">Announcements</h2>
              <div className="h-[2px] flex-1 bg-slate-100 mx-8 hidden md:block" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Updates</span>
            </div>

            <div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                  <Bell className="w-8 h-8" />
                </div>
              </div>

              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest">New Announcement</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-[#1a1b3a] mb-6 leading-tight group-hover:text-indigo-600 transition-colors">{latestAnnouncement.title}</h3>

                <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">{latestAnnouncement.content}</p>

                <div className="flex items-center gap-6 pt-8 border-t border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Posted by</p>
                      <p className="text-sm font-bold text-slate-700">{latestAnnouncement.author}</p>
                    </div>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100" />
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Published on</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {latestAnnouncement.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `,
        }}
      />
    </div>
  );
};

export default LandingPage;
