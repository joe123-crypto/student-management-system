'use client';

import { animate, useMotionValue, useReducedMotion, type Transition, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

const dashboardEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const dashboardStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.08,
    },
  },
};

export const dashboardStaggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: dashboardEase,
    },
  },
};

export const dashboardPanelMotion = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.34,
      ease: dashboardEase,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

export const dashboardHoverLift = {
  scale: 1.02,
  y: -4,
};

export const dashboardHoverTransition: Transition = {
  duration: 0.18,
  ease: 'easeOut',
};

interface AnimatedCountProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  duration?: number;
}

function roundValue(value: number, decimalPlaces: number) {
  if (decimalPlaces <= 0) {
    return Math.round(value);
  }

  return Number(value.toFixed(decimalPlaces));
}

export function AnimatedCount({
  value,
  className,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  duration = 0.8,
}: AnimatedCountProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(shouldReduceMotion ? value : 0);
  const [displayValue, setDisplayValue] = useState(() => roundValue(motionValue.get(), decimalPlaces));

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(roundValue(latest, decimalPlaces));
    });

    return unsubscribe;
  }, [decimalPlaces, motionValue]);

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      setDisplayValue(roundValue(value, decimalPlaces));
      return;
    }

    motionValue.set(0);

    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [decimalPlaces, duration, motionValue, shouldReduceMotion, value]);

  return (
    <span className={className}>
      {prefix}
      {new Intl.NumberFormat(undefined, {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
      }).format(displayValue)}
      {suffix}
    </span>
  );
}
