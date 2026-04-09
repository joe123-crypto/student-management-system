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

function HowItWorksPortrait({ className }: { className?: string }) {
  const portraitShapePath =
    'M38 240C38 126 124 34 236 34C322 34 390 102 390 208C390 359 327 472 214 500C109 476 38 381 38 240Z';

  return (
    <div aria-hidden="true" className={className}>
      <svg viewBox="0 0 420 520" className="h-full w-full overflow-visible">
        <defs>
          <clipPath id="how-it-works-girlchild-clip" clipPathUnits="userSpaceOnUse">
            <path d={portraitShapePath} />
          </clipPath>
        </defs>
        <g clipPath="url(#how-it-works-girlchild-clip)">
          <image href="/girlchild.png" x="0" y="0" width="420" height="520" preserveAspectRatio="xMidYMid slice" />
        </g>
        <path
          d={portraitShapePath}
          fill="none"
          strokeWidth="2"
          style={{ stroke: 'color-mix(in srgb, var(--theme-secondary) 56%, var(--theme-primary-soft))' }}
        />
      </svg>
    </div>
  );
}

function HeroStudentImage({ className, sizes, absolute = false }: { className?: string; sizes: string; absolute?: boolean }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none isolate ${absolute ? 'absolute' : 'relative'} ${className ?? ''}`}>
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
  const studentSteps = [
    {
      number: '1',
      title: 'Log in to your portal',
      description: 'Start with your student credentials and open your dashboard from one secure place.',
    },
    {
      number: '2',
      title: 'Complete your profile setup',
      description: 'Fill in your personal, academic, and banking details so your record is ready for review.',
    },
    {
      number: '3',
      title: 'Track scholarships and updates',
      description: 'Follow announcements, monitor your scholarship progress, and stay on top of each next step.',
    },
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
    <div className="theme-page min-h-screen overflow-x-hidden text-[color:var(--theme-text)]">

      <div className="fixed top-6 left-0 right-0 z-50 px-3 sm:px-6">
        <nav className="theme-card mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 rounded-full border px-2.5 sm:h-16 sm:gap-3 sm:px-6">
          <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 sm:gap-2" onClick={() => router.push('/')}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary)] text-base font-bold text-white sm:h-8 sm:w-8 sm:text-lg">S</div>
            <span className="theme-heading type-brand truncate text-[0.95rem] sm:text-xl">ScholarsAlger</span>
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              onClick={() => router.push('/login')}
              variant="ghost"
              size="sm"
              className="px-2 py-1.5 text-[0.7rem] font-semibold sm:px-4 sm:py-2 sm:text-sm"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/login')}
              size="sm"
              className="rounded-full px-2.5 py-2 text-[0.72rem] leading-none whitespace-nowrap hover:scale-100 sm:px-6 sm:py-2.5 sm:text-sm sm:hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </div>

      <main className="relative z-10 pt-32 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative mb-24">
            <HeroStudentImage
              className="left-[45%] top-16 z-20 hidden h-[24rem] w-[14rem] -translate-x-1/2 lg:block xl:left-[44%] xl:top-10 xl:h-[29rem] xl:w-[20rem]"
              sizes="(max-width: 1279px) 224px, 320px"
              absolute
            />

            <div className="grid items-center gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-20">
              <div className="relative z-10 pb-20 sm:pb-24 lg:pb-0 lg:pr-10 xl:pr-16">
                <HeroStudentImage
                  className="right-0 -bottom-20 z-20 h-[14rem] w-[9.5rem] sm:right-6 sm:-bottom-24 sm:h-[18rem] sm:w-[12rem] lg:hidden"
                  sizes="(max-width: 639px) 152px, 192px"
                  absolute
                />

                <div className="relative z-10 space-y-6 sm:space-y-8">
                  <div className="theme-accent-subtle inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
                    <Globe2 className="h-3.5 w-3.5" />
                    <span className="type-label">trusted by 400+ students</span>
                  </div>

                  <h1 className="theme-heading type-page-title">
                    The <span className="text-[color:var(--theme-primary)]">Central</span> support platform for students in Algeria
                  </h1>

                  <p className="theme-text-muted type-body-lg max-w-lg">
                    The fastest way to manage your academic profile, banking details, and university progress in one place.
                  </p>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => router.push('/login')}
                      className="group flex items-center gap-2 rounded-full px-10 py-4 font-bold shadow-[0_20px_40px_rgba(37,79,34,0.16)] hover:scale-105"
                    >
                      Get Started for Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative xl:pl-8">
                <AcademicStatusCard
                  title="Academic Status"
                  status="ACTIVE"
                  metricLabel="Moyenne"
                  metricValue="19.92"
                  chartData={PROGRESS_DATA}
                  chartDataKey="gpa"
                  chartSeriesLabel="Moyenne"
                  yDomain={[0, 4]}
                  className="relative z-10 shadow-[0_32px_120px_-20px_rgba(37,79,34,0.18)] transform transition-transform duration-700 hover:scale-[1.02]"
                  chartHeightClassName="h-32 sm:h-48"
                />

                <div className="theme-panel-soft absolute top-12 -right-16 z-20 hidden rounded-[2rem] border p-6 md:block animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="theme-chip-success flex h-12 w-12 items-center justify-center rounded-2xl border">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="theme-text-muted type-label mb-1">Deposit Status</p>
                      <p className="theme-heading type-section-title">+$2,450.00</p>
                    </div>
                  </div>
                </div>

                <div className="theme-panel-soft absolute bottom-[-18px] left-48 z-30 hidden min-h-[8.5rem] w-[23.5rem] flex-col justify-end rounded-[2.5rem] border border-[color:rgba(218,203,171,0.94)] bg-[color:rgba(248,243,230,0.985)] px-8 py-5 shadow-[0_32px_82px_rgba(37,79,34,0.2)] backdrop-blur-sm md:flex animate-float xl:-left-52 xl:w-[25.5rem]">
                  <div className="mb-3 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[color:color-mix(in_srgb,var(--theme-surface)_48%,white)]" />
                    <div className="space-y-1">
                      <div className="h-2.5 w-24 rounded-full bg-[color:color-mix(in_srgb,var(--theme-border)_58%,white)]" />
                      <div className="h-2.5 w-16 rounded-full bg-[color:color-mix(in_srgb,var(--theme-border)_42%,white)]" />
                    </div>
                  </div>
                  <div className="mb-2 h-1.5 w-full rounded-full bg-[color:var(--theme-primary-soft)]" />
                  <p className="theme-text-muted type-label">Progress to Degree</p>
                </div>
              </div>
            </div>
          </div>

          <div id="how-it-works" ref={howItWorksRef} className="mb-24 scroll-mt-24">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div className="relative mx-auto w-full max-w-[25rem]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-8 h-48 rounded-full bg-[radial-gradient(circle,rgba(245,130,74,0.18),transparent_72%)] blur-3xl"
                />
                <div className="relative aspect-[4/5] w-full drop-shadow-[0_28px_50px_rgba(37,79,34,0.12)]">
                  <HowItWorksPortrait className="h-full w-full" />
                </div>
              </div>

              <div className="relative space-y-6 lg:ml-auto lg:max-w-3xl">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(245,130,74,0.16),transparent_72%)] blur-2xl"
                />
                <ol className="relative space-y-6">
                  {studentSteps.map((step, index) => (
                    <li
                      key={step.number}
                      className={`grid gap-4 pb-6 sm:grid-cols-[auto_1fr] sm:gap-6 ${
                        index < studentSteps.length - 1
                          ? 'border-b border-[color:color-mix(in_srgb,var(--theme-border)_44%,white)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="theme-heading flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--theme-secondary)_42%,white)] bg-[color:color-mix(in_srgb,var(--theme-card)_78%,white)] text-[1.85rem] font-bold tracking-[-0.04em] shadow-[0_14px_28px_rgba(37,79,34,0.06)]">
                          {step.number}
                        </div>
                      </div>
                      <div className="space-y-2 pt-1">
                        <h3 className="theme-heading text-[clamp(1.1rem,1.7vw,1.4rem)] font-semibold tracking-[-0.025em]">
                          {step.title}
                        </h3>
                        <p className="theme-text-muted type-body max-w-xl">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div ref={toolsRef} className="mb-24 scroll-mt-24">
            <h2 className="theme-heading type-section-title mb-10">Explore Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tools.map((tool, i) => (
                <div
                  key={i}
                  className="theme-panel-soft group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[2rem] border shadow-sm transition-all hover:scale-105"
                >
                  <div className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--theme-surface)_46%,white)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex flex-col items-center gap-3 w-full px-4">
                    <div className="theme-icon-well flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--theme-border)_58%,white)] transition-transform group-hover:rotate-12">
                      {getIcon(tool.icon)}
                    </div>
                    <span className="theme-text-muted type-label text-center">{tool.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={announcementsRef} className="scroll-mt-24 mb-12">
            <div className="flex items-center justify-between mb-10">
              <h2 className="theme-heading type-section-title">Announcements</h2>
              <div className="theme-divider mx-8 hidden h-[2px] flex-1 md:block" />
              <span className="theme-text-muted type-label">Latest Updates</span>
            </div>

            <div className="theme-panel-glass group relative overflow-hidden rounded-[3rem] border p-8 md:p-12">
              <div className="absolute top-0 right-0 p-8">
                <div className="theme-accent-subtle flex h-16 w-16 items-center justify-center rounded-full border animate-pulse">
                  <Bell className="w-8 h-8" />
                </div>
              </div>

              {latestAnnouncement ? (
                <div className="max-w-3xl">
                  <div className="theme-chip-success mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--theme-primary)]" />
                    <span className="type-label">New Announcement</span>
                  </div>

                  <h3 className="theme-heading type-section-title mb-6 transition-colors group-hover:text-[color:var(--theme-primary)]">{latestAnnouncement.title}</h3>

                  <p className="theme-text-muted type-body-lg mb-8">{latestAnnouncement.content}</p>

                  <div className="flex items-center gap-6 border-t border-[color:color-mix(in_srgb,var(--theme-border)_52%,white)] pt-8">
                    <div className="flex items-center gap-3">
                      <div className="theme-card-muted flex h-10 w-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--theme-border)_58%,white)] text-[color:var(--theme-text-muted)]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="theme-text-muted type-label">Posted by</p>
                        <p className="theme-heading text-sm font-bold">{latestAnnouncement.author}</p>
                      </div>
                    </div>
                    <div className="theme-divider h-8 w-[1px]" />
                    <div>
                      <p className="theme-text-muted type-label">Published on</p>
                      <p className="theme-heading flex items-center gap-2 text-sm font-bold">
                        <CalendarDays className="theme-text-muted h-4 w-4" />
                        {latestAnnouncement.date}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <div className="theme-chip-muted mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--theme-text-muted)]" />
                    <span className="type-label">Announcements Feed</span>
                  </div>

                  <h3 className="theme-heading type-section-title mb-6">
                    Announcements will appear here once they are published
                  </h3>

                  <p className="theme-text-muted type-body-lg">
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
