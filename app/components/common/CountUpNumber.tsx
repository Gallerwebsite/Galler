"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { target: 0, suffix: value };
  return { target: Math.floor(parseFloat(match[1])), suffix: match[2] };
}

type Props = {
  value: string;
  className?: string;
  duration?: number;
};

export default function CountUpNumber({ value, className, duration = 4500 }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const { target, suffix } = parseStatValue(value);
  const [display, setDisplay] = useState(1);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || target <= 1) {
      setDisplay(target);
      setHasAnimated(true);
      return;
    }

    setDisplay(1);
    const startTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.max(1, Math.round(eased * target)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        setHasAnimated(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target, duration, hasAnimated]);

  return (
    <p ref={ref} className={className}>
      {display}
      {suffix}
    </p>
  );
}
