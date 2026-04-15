import { cn } from '@/components/ui/cn';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('theme-skeleton rounded-2xl', className)}
    />
  );
}
