import { cn } from '@/components/ui/cn';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-2xl bg-[rgba(220,205,166,0.58)]', className)}
    />
  );
}
