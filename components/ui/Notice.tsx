import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/components/ui/cn';

export type NoticeTone = 'success' | 'error' | 'warning' | 'info';

type NoticeToneMeta = {
  Icon: LucideIcon;
  containerClassName: string;
  iconWrapClassName: string;
  iconClassName: string;
};

const noticeToneMeta: Record<NoticeTone, NoticeToneMeta> = {
  success: {
    Icon: CheckCircle2,
    containerClassName: 'theme-success border border-[rgba(37,79,34,0.18)]',
    iconWrapClassName: 'bg-white/72',
    iconClassName: 'text-[color:var(--theme-primary)]',
  },
  error: {
    Icon: XCircle,
    containerClassName: 'theme-danger border',
    iconWrapClassName: 'bg-white/78',
    iconClassName: 'text-[color:var(--theme-danger)]',
  },
  warning: {
    Icon: AlertTriangle,
    containerClassName: 'theme-warning border border-[rgba(245,130,74,0.28)]',
    iconWrapClassName: 'bg-white/72',
    iconClassName: 'text-[color:var(--theme-primary-soft)]',
  },
  info: {
    Icon: Info,
    containerClassName: 'theme-info border border-[rgba(160,58,19,0.2)]',
    iconWrapClassName: 'bg-white/72',
    iconClassName: 'text-[color:var(--theme-primary-soft)]',
  },
};

export function getNoticeToneMeta(tone: NoticeTone): NoticeToneMeta {
  return noticeToneMeta[tone];
}

interface NoticeProps {
  tone?: NoticeTone;
  title?: ReactNode;
  message?: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function Notice({
  tone = 'info',
  title,
  message,
  className,
  compact = false,
}: NoticeProps) {
  const { Icon, containerClassName, iconWrapClassName, iconClassName } = getNoticeToneMeta(tone);
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-3 rounded-[1.5rem] px-4 py-3',
        compact ? 'py-2.5 text-sm' : 'text-sm',
        containerClassName,
        className,
      )}
    >
      <div
        className={cn(
          'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/50',
          iconWrapClassName,
        )}
      >
        <Icon className={cn('h-[18px] w-[18px]', iconClassName)} />
      </div>

      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold leading-6">{title}</p> : null}
        {message ? (
          <p className={cn('leading-6', title ? 'mt-0.5 opacity-90' : 'font-medium')}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
