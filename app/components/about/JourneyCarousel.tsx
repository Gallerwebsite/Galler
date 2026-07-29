"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";

export interface JourneyMilestone {
  year: string;
  description: string;
}

interface JourneyCarouselProps {
  heading?: string;
  milestones?: JourneyMilestone[];
  backgroundImage?: string;
}

const DEFAULT_MILESTONES: JourneyMilestone[] = [
  {
    year: "2022",
    description:
      "Exploring new avenues to provide creative and customized solutions across various industries.",
  },
  {
    year: "2018-19",
    description: "Fuel Automation for Petroleum - Reliance BP Mobility Limited.",
  },
  {
    year: "2015-16",
    description:
      "Telecom Infra networking & monitoring systems - Reliance Jio Infocomm Limited.",
  },
  {
    year: "2012-13",
    description: "Electro Mechanical Solutions - Reliance Jio Infocomm Limited.",
  },
];

function useVisibleCount() {
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visibleCount;
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function JourneyCarousel({
  heading = "JOURNEY",
  milestones = DEFAULT_MILESTONES,
  backgroundImage,
}: JourneyCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = useVisibleCount();
  const maxStartIndex = Math.max(0, milestones.length - visibleCount);
  const bgImageSrc = backgroundImage ? resolveUploadSrc(backgroundImage) : undefined;

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

  const goNext = useCallback(() => {
    setStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  }, [maxStartIndex]);

  const goPrev = useCallback(() => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const slideOffset = milestones.length > 0 ? (startIndex / milestones.length) * 100 : 0;

  return (
    <section className="relative overflow-hidden bg-[#0b1f4a] py-16 sm:py-20 lg:py-24">
      {bgImageSrc ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImageSrc})`,
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
          aria-hidden
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[#0b1f4a]/75" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <motion.h2
          className="mb-14 font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-white md:mb-20 md:text-[40px]"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {heading}
        </motion.h2>

        <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
          <button
            type="button"
            onClick={goPrev}
            disabled={startIndex === 0}
            className="-translate-y-6 shrink-0 cursor-pointer text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-25 sm:-translate-y-7"
            aria-label="Previous milestones"
          >
            <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
          </button>

          <div className="relative min-w-0 flex-1 overflow-hidden py-2">
            {/* Horizontal timeline line — aligned with dot row */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-15 z-0 h-px bg-white/80 sm:top-17"
              aria-hidden
            />

            <motion.div
              className="relative flex"
              style={{ width: `${(milestones.length / visibleCount) * 100}%` }}
              animate={{ x: `-${slideOffset}%` }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
            >
              {milestones.map((milestone, index) => (
                <div
                  key={`${milestone.year}-${index}`}
                  className="flex shrink-0 flex-col items-center px-3 text-center sm:px-4"
                  style={{ width: `${100 / milestones.length}%` }}
                >
                  {/* Year above the line */}
                  <p className="flex h-10 items-end justify-center font-century text-sm font-medium text-white sm:h-12 sm:text-base md:text-lg">
                    {milestone.year}
                  </p>

                  {/* Dot on the line */}
                  <div className="relative z-10 flex h-6 items-center justify-center">
                    <span className="block h-2.5 w-2.5 rounded-full bg-white sm:h-3 sm:w-3" />
                  </div>

                  {/* Description below the line */}
                  <p className="mt-5 max-w-[220px] font-century text-xs leading-relaxed text-white/90 sm:mt-6 sm:max-w-[260px] sm:text-sm md:max-w-[280px]">
                    {milestone.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={startIndex >= maxStartIndex}
            className="-translate-y-7 shrink-0 cursor-pointer text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-25 sm:-translate-y-7"
            aria-label="Next milestones"
          >
            <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
          </button>
        </div>
      </div>
    </section>
  );
}
