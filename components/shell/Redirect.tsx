'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Redirect({ to }: { to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (hasNavigated.current || pathname === to) {
      return;
    }

    hasNavigated.current = true;
    router.replace(to);
  }, [router, pathname, to]);

  return null;
}
