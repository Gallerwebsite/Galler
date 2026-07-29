"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MARQUEE_SLOT_CLASS,
  buildMarqueeTrack,
  getMarqueeDurationFromShift,
  resolveMarqueeSrc,
  type MarqueeLogo,
} from "@/app/lib/marquee-config";

function LogoSlot({ logo }: { logo: MarqueeLogo }) {
  return (
    <div className={`mx-4 sm:mx-5 md:mx-6 ${MARQUEE_SLOT_CLASS}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveMarqueeSrc(logo.src)}
        alt={logo.alt}
        className="h-full w-full object-contain object-center"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function MarqueeRow({
  logos,
  reverse = false,
}: {
  logos: MarqueeLogo[];
  reverse?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [shiftPx, setShiftPx] = useState(0);

  const track = useMemo(
    () => buildMarqueeTrack(logos, viewportWidth),
    [logos, viewportWidth]
  );
  const duration = getMarqueeDurationFromShift(shiftPx);

  useEffect(() => {
    const updateViewport = () => {
      if (!containerRef.current) return;
      setViewportWidth(containerRef.current.offsetWidth || 1280);
    };

    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateShift = () => {
      if (!trackRef.current) return;
      setShiftPx(trackRef.current.scrollWidth / 2);
    };

    updateShift();
    const observer = new ResizeObserver(updateShift);
    if (trackRef.current) observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, [track]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div
        ref={trackRef}
        className={`flex w-max flex-nowrap items-center will-change-transform motion-reduce:transform-none${shiftPx > 0 ? " animate-marquee-shift" : ""}`}
        style={{
          animationDuration: duration,
          animationDirection: reverse ? "reverse" : "normal",
          ["--marquee-shift" as string]: shiftPx > 0 ? `${shiftPx}px` : undefined,
        }}
      >
        {track.map((logo, index) => (
          <LogoSlot key={`${logo.id}-${index}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}

export default function MarqueeTrack({ rows }: { rows: MarqueeLogo[][] }) {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {rows.map((rowLogos, index) => (
        <MarqueeRow key={index} logos={rowLogos} reverse={index % 2 === 1} />
      ))}
    </div>
  );
}
