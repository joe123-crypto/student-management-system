import Image from 'next/image';
import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PROGRESS_DATA } from '@/constants';
import Footer from '@/components/layout/Footer';
import AcademicStatusCard from '@/components/ui/AcademicStatusCard';
import Button from '@/components/ui/Button';
import type { Announcement } from '@/types';
import { ArrowRight, BarChart3, Bell, CalendarDays, DollarSign, FolderOpen, Globe2, MessageSquare, Search, User } from 'lucide-react';

interface LandingPageProps {
  latestAnnouncement?: Announcement | null;
}

function HeroStudentImage({ className, sizes }: { className?: string; sizes: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute isolate ${className ?? ''}`}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,130,74,0.16),rgba(237,228,194,0.08)_58%,transparent_82%)] blur-3xl" />
      <div className="relative h-full w-full opacity-100 saturate-[0.9]">
        <Image
          src="/student-background-cutout.png"
          alt=""
          fill
          sizes={sizes}
          className="object-contain object-center drop-shadow-[0_24px_48px_rgba(37,79,34,0.08)]"
          style={{
            WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>
    </div>
  );
}

const LandingPage: React.FC<LandingPageProps> = ({ latestAnnouncement = null }) => {
  const router = useRouter();
  const howItWorksRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="theme-page min-h-screen overflow-x-hidden font-['Inter'] text-[color:var(--theme-text)]">

      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <nav className="theme-card mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--theme-primary)] text-lg font-bold text-white">S</div>
            <span className="text-xl font-bold tracking-tight">ScholarsAlger</span>
          </div>

          <div className="theme-text-muted hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#how-it-works" onClick={(e) => scrollToSection(howItWorksRef, e)} className="theme-link">
              How it works
            </a>
            <a href="#tools" onClick={(e) => scrollToSection(toolsRef, e)} className="theme-link">
              Tools
            </a>
            <a href="#announcements" onClick={(e) => scrollToSection(announcementsRef, e)} className="theme-link">
              Announcements
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/login')} variant="ghost" size="sm" className="px-4 py-2 text-sm font-semibold">
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
          <div className="relative mb-24">
            <HeroStudentImage
              className="left-[47%] top-20 hidden h-[22rem] w-[13rem] -translate-x-1/2 lg:block xl:left-[46%] xl:top-16 xl:h-[29rem] xl:w-[18rem]"
              sizes="(max-width: 1279px) 208px, 288px"
            />

            <div className="grid items-center gap-20 lg:grid-cols-2">
              <div className="relative z-10 lg:pr-10 xl:pr-16">
                <div className="relative z-10 space-y-8">
                  <div className="theme-accent-subtle inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
                    <Globe2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold uppercase tracking-widest">trusted by 400+ students</span>
                  </div>

                  <h1 className="theme-heading font-quicksand text-4xl font-bold leading-[1.2] tracking-tight md:text-6xl">
                    The <span className="inline-block rounded-2xl bg-[var(--theme-primary)] px-4 py-1 text-white shadow-sm">Central</span> support platform for students in Algeria
                  </h1>

                  <p className="theme-text-muted max-w-lg text-lg font-medium leading-relaxed">
                    The fastest way to manage your academic profile, banking details, and university progress in one unified stack.
                  </p>

                  <div className="flex gap-4">
                    <Button onClick={() => router.push('/login')} className="font-bold py-4 px-10 rounded-full shadow-xl shadow-indigo-100 flex items-center gap-2 group hover:scale-105">
                      Get Started for Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative z-10 xl:pl-8">
                <AcademicStatusCard
                  title="Academic Status"
                  status="ACTIVE"
                  metricLabel="Moyenne"
                  metricValue="3.92"
                  chartData={PROGRESS_DATA}
                  chartDataKey="gpa"
                  chartSeriesLabel="Moyenne"
                  yDomain={[0, 4]}
                  className="shadow-[0_32px_120px_-20px_rgba(79,70,229,0.12)] transform transition-transform duration-700 hover:scale-[1.02]"
                  chartHeightClassName="h-48"
                />

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
          </div>

          <div id="how-it-works" ref={howItWorksRef} className="mb-24 scroll-mt-24">
            <div className="bg-white/70 backdrop-blur-md border border-white/70 rounded-[2.5rem] p-6 md:p-10 shadow-[0_25px_80px_rgba(15,23,42,0.07)]">
              <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-8 items-center">
                <div className="rounded-[1.75rem] overflow-hidden border border-slate-200 bg-slate-950 shadow-[0_12px_35px_rgba(15,23,42,0.25)]">
                  <video controls preload="metadata" className="w-full aspect-video bg-slate-950">
                    <source src="/videos/how-it-works.mp4" type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>

                <div className="space-y-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em]">
                    Product Tour
                  </span>
                  <h2 className="text-3xl font-black text-[#1a1b3a] leading-tight font-quicksand">
                    See how ScholarsAlger works in under two minutes
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Watch a quick walkthrough of login, profile setup, scholarship tracking, and announcements in one place.
                  </p>
                  <Button
                    onClick={() => router.push('/login')}
                    variant="ghost"
                    className="px-0 text-indigo-600 font-bold hover:text-indigo-700 hover:bg-transparent"
                  >
                    Open the app
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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

              {latestAnnouncement ? (
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
              ) : (
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Announcements Feed</span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-black text-[#1a1b3a] mb-6 leading-tight">
                    Announcements will appear here once they are published
                  </h3>

                  <p className="text-lg text-slate-500 leading-relaxed font-medium">
                    The live announcement feed is empty right now. Attache updates will show up here as soon as they are available.
                  </p>
                </div>
              )}
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
