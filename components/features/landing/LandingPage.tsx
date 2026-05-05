import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import type { Announcement } from '@/types';
import { ArrowRight, BarChart3, Bell, CalendarDays, CheckCircle2, FolderOpen, Globe2, GraduationCap, MessageSquare, Search, ShieldCheck, User } from 'lucide-react';

interface LandingPageProps {
  latestAnnouncement?: Announcement | null;
}

const HOW_IT_WORKS_PORTRAIT_PATH =
  'M38 240C38 126 124 34 236 34C322 34 390 102 390 208C390 359 327 472 214 500C109 476 38 381 38 240Z';

const HOW_IT_WORKS_PORTRAIT_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 520"><path fill="white" d="${HOW_IT_WORKS_PORTRAIT_PATH}"/></svg>`,
)}")`;

const STUDENT_STEPS = [
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
] as const;

const TRUST_STATS = [
  { label: 'Students', value: 400, suffix: '+', supportingText: 'Student records supported across the portal.' },
  { label: 'Years', value: 2, suffix: '+', supportingText: 'Built around real academic workflows.' },
  { label: 'Free', value: 100, suffix: '%', supportingText: 'Open access for eligible students.' },
  { label: 'Support', value: 24, suffix: '/7', supportingText: 'Help and updates remain easy to reach.' },
] as const;

const TOOLS = [
  {
    title: 'Fast Record Finder',
    description: 'Search student profile, academic, and scholarship details without digging through forms.',
    icon: 'search',
  },
  {
    title: 'Document Vault',
    description: 'Keep important files organized and available when administrators need to review them.',
    icon: 'folder',
  },
  {
    title: 'Academic Tracker',
    description: 'Follow progress, status updates, and key academic milestones from one clear view.',
    icon: 'chart',
  },
  {
    title: 'Support Portal',
    description: 'Get guidance, request help, and keep conversations tied to your student record.',
    icon: 'chat',
  },
] as const;

const COUNTER_FORMATTERS = new Map<string, Intl.NumberFormat>();

function getCounterFormatter(decimals: number) {
  const cacheKey = `${decimals}`;

  if (!COUNTER_FORMATTERS.has(cacheKey)) {
    COUNTER_FORMATTERS.set(
      cacheKey,
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    );
  }

  return COUNTER_FORMATTERS.get(cacheKey)!;
}

function CountUpNumber({
  value,
  decimals = 0,
  duration = 1600,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const formatter = getCounterFormatter(decimals);

  useEffect(() => {
    const counterElement = counterRef.current;

    if (!counterElement || typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          setHasStarted(true);
          observer.disconnect();
        });
      },
      {
        threshold: 0.55,
      },
    );

    observer.observe(counterElement);

    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!hasStarted || typeof window === 'undefined') {
      return;
    }

    let frameId = 0;
    let animationStart: number | null = null;

    const tick = (timestamp: number) => {
      if (animationStart === null) {
        animationStart = timestamp;
      }

      const progress = Math.min((timestamp - animationStart) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * easedProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, hasStarted, value]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}
      {formatter.format(displayValue)}
      {suffix}
    </span>
  );
}

function HowItWorksPortrait({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative ${className ?? ''}`}>
      <div
        className="relative h-full w-full"
        style={{
          WebkitMaskImage: HOW_IT_WORKS_PORTRAIT_MASK,
          maskImage: HOW_IT_WORKS_PORTRAIT_MASK,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      >
        <Image
          src="/girlchild.webp"
          alt=""
          fill
          sizes="(max-width: 1023px) 70vw, 32vw"
          className="object-cover object-center"
        />
      </div>
      <svg viewBox="0 0 420 520" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <path
          d={HOW_IT_WORKS_PORTRAIT_PATH}
          fill="none"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: 'color-mix(in srgb, var(--theme-secondary) 56%, var(--theme-primary-soft))' }}
        />
      </svg>
    </div>
  );
}

function HeroStudentImage({
  className,
  sizes,
  absolute = false,
  priority = false,
  ...props
}: {
  className?: string;
  sizes: string;
  absolute?: boolean;
  priority?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none isolate ${absolute ? 'absolute' : 'relative'} ${className ?? ''}`}
      {...props}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,130,74,0.16),rgba(237,228,194,0.08)_58%,transparent_82%)] blur-3xl" />
      <div className="relative h-full w-full opacity-100 saturate-[0.9]">
        <Image
          src="/student-background-cutout.png"
          alt=""
          fill
          priority={priority}
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
  const pageRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageElement = pageRef.current;

    if (!pageElement || typeof window === 'undefined') {
      return;
    }

    const revealTargets = Array.from(pageElement.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (revealTargets.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      revealTargets.forEach((element) => {
        element.dataset.revealVisible = 'true';
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          (entry.target as HTMLElement).dataset.revealVisible = 'true';
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

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
    <div ref={pageRef} className="theme-page min-h-screen text-[color:var(--theme-text)]">

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
            <div className="grid items-center gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-20">
              <div className="reveal-on-scroll relative z-10 lg:pr-10 xl:pr-16" data-reveal="" data-reveal-variant="left">
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  <div className="reveal-on-scroll theme-accent-subtle inline-flex items-center gap-2 rounded-full border px-3 py-1.5" data-reveal="" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
                    <Globe2 className="h-3.5 w-3.5" />
                    <span className="type-label">
                      trusted by <CountUpNumber value={400} suffix="+" /> students
                    </span>
                  </div>

                  <h1 className="reveal-on-scroll theme-heading type-page-title" data-reveal="" style={{ '--reveal-delay': '160ms' } as React.CSSProperties}>
                    The <span className="text-[color:var(--theme-primary)]">Central</span> support platform for students in Algeria
                  </h1>

                  <p className="reveal-on-scroll theme-text-muted type-body-lg max-w-lg" data-reveal="" style={{ '--reveal-delay': '240ms' } as React.CSSProperties}>
                    The fastest way to manage your academic profile, banking details, and university progress in one place.
                  </p>

                  <div className="reveal-on-scroll flex gap-4" data-reveal="" style={{ '--reveal-delay': '320ms' } as React.CSSProperties}>
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

              <div className="relative z-20 lg:z-auto">
                <div className="reveal-on-scroll relative min-h-[30rem] overflow-hidden rounded-[2.5rem] border border-[color:color-mix(in_srgb,var(--theme-border)_62%,white)] bg-[color:var(--theme-primary-strong)] shadow-[0_32px_90px_rgba(37,79,34,0.18)]" data-reveal="" data-reveal-variant="right" style={{ '--reveal-delay': '180ms' } as React.CSSProperties}>
                  <Image
                    src="/student-background.png"
                    alt="Student using the ScholarsAlger platform"
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 48vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgba(27,59,25,0.36)] via-[rgba(37,79,34,0.12)] to-[rgba(245,130,74,0.28)]" />
                  <HeroStudentImage
                    className="bottom-0 right-3 h-[26rem] w-[17rem] sm:right-10 sm:h-[29rem] sm:w-[20rem]"
                    sizes="(max-width: 639px) 272px, 320px"
                    absolute
                    priority
                  />

                  <div className="absolute left-5 top-5 max-w-[15rem] rounded-[1.5rem] border border-white/25 bg-white/80 p-4 shadow-[0_18px_48px_rgba(27,59,25,0.16)] backdrop-blur-md sm:left-8 sm:top-8 sm:p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--theme-primary)] text-white">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <p className="theme-heading type-card-title">One student portal</p>
                    <p className="theme-text-muted type-body-sm mt-2">Profiles, banking details, announcements, and progress in one secure place.</p>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/25 bg-[rgba(255,253,248,0.9)] p-4 shadow-[0_18px_48px_rgba(27,59,25,0.14)] backdrop-blur-md sm:left-auto sm:right-8 sm:w-[18rem]">
                    <div className="flex items-center gap-3">
                      <div className="theme-chip-success flex h-10 w-10 items-center justify-center rounded-2xl border">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="theme-text-muted type-label">Student Access</p>
                        <p className="theme-heading text-sm font-bold">Secure and organized</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="reveal-on-scroll"
                data-reveal=""
                data-reveal-variant="up"
                style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
              >
                <StatCard
                  label={stat.label}
                  value={<CountUpNumber value={stat.value} />}
                  suffix={stat.suffix}
                  supportingText={stat.supportingText}
                />
              </div>
            ))}
          </div>

          <div id="how-it-works" ref={howItWorksRef} className="mb-24 scroll-mt-24">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div className="reveal-on-scroll relative mx-auto w-full max-w-[25rem]" data-reveal="" data-reveal-variant="left">
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
                  {STUDENT_STEPS.map((step, index) => (
                    <li
                      key={step.number}
                      data-reveal=""
                      data-reveal-variant="right"
                      style={{ '--reveal-delay': `${index * 100}ms` } as React.CSSProperties}
                      className={`grid gap-4 pb-6 sm:grid-cols-[auto_1fr] sm:gap-6 ${
                        index < STUDENT_STEPS.length - 1
                          ? 'border-b border-[color:color-mix(in_srgb,var(--theme-border)_44%,white)]'
                          : ''
                      } reveal-on-scroll`}
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

          <div id="tools" ref={toolsRef} className="mb-24 scroll-mt-24">
            <h2 className="reveal-on-scroll theme-heading type-section-title mb-10" data-reveal="">
              Explore Tools
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map((tool, i) => (
                <div
                  key={tool.title}
                  className="reveal-on-scroll theme-panel-soft group relative min-h-[14rem] cursor-pointer overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:color-mix(in_srgb,var(--theme-secondary)_72%,white)] hover:shadow-[0_24px_56px_rgba(37,79,34,0.12)]"
                  data-reveal=""
                  data-reveal-variant="pop"
                  style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--theme-secondary)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="theme-icon-well mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--theme-border)_58%,white)] transition-transform group-hover:rotate-6 group-hover:scale-105">
                      {getIcon(tool.icon)}
                    </div>
                    <h3 className="theme-heading type-card-title">{tool.title}</h3>
                    <p className="theme-text-muted type-body-sm mt-3">{tool.description}</p>
                    <div className="mt-auto pt-5 text-[color:var(--theme-primary-soft)] transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="announcements" ref={announcementsRef} className="scroll-mt-24 mb-12">
            <div className="reveal-on-scroll flex items-center justify-between mb-10" data-reveal="">
              <h2 className="theme-heading type-section-title">Announcements</h2>
              <div className="theme-divider mx-8 hidden h-[2px] flex-1 md:block" />
              <span className="theme-text-muted type-label">Latest Updates</span>
            </div>

            <div className={`reveal-on-scroll theme-panel-glass group relative overflow-hidden border ${latestAnnouncement ? 'rounded-[3rem] p-8 md:p-12' : 'rounded-[2rem] p-5 sm:p-6'}`} data-reveal="" data-reveal-variant="up" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
              <div className={latestAnnouncement ? 'absolute top-0 right-0 p-8' : 'absolute right-5 top-5'}>
                <div className={`theme-accent-subtle flex items-center justify-center rounded-full border ${latestAnnouncement ? 'h-16 w-16 animate-pulse' : 'h-10 w-10'}`}>
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
                <div className="flex items-center gap-4 pr-12">
                  <div className="theme-chip-success hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border sm:flex">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="theme-heading type-card-title">Announcements will appear here once they are published</h3>
                    <p className="theme-text-muted type-body-sm mt-1">
                      The live announcement feed is empty right now. Attache updates will show up here as soon as they are available.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section className="reveal-on-scroll theme-panel-glass mb-4 overflow-hidden rounded-[2.5rem] border p-8 text-center md:p-12" data-reveal="" data-reveal-variant="up">
            <div className="mx-auto max-w-2xl">
              <p className="theme-accent type-label mb-3">Start Your Portal</p>
              <h2 className="theme-heading type-section-title">Ready to get started?</h2>
              <p className="theme-text-muted type-body mt-4">
                Open your student portal and keep your academic profile, banking details, and updates in one place.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="group mt-7 inline-flex items-center gap-2 rounded-full px-8 py-3 font-bold shadow-[0_18px_36px_rgba(37,79,34,0.14)]"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </section>
        </div>
      </main>

      <div className="reveal-on-scroll" data-reveal="" data-reveal-variant="up">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
