import React, { useEffect, useState } from 'react';

interface AnimatedCountProps {
  value: number;
  duration?: number;
}

export default function AnimatedCount({ value, duration = 520 }: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const delta = value - startValue;
    const startTime = window.performance.now();

    if (delta === 0) return;

    let frameId = 0;
    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + delta * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [displayValue, duration, value]);

  return <>{displayValue.toLocaleString()}</>;
}
