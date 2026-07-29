"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";

export interface JourneyMilestone {
  year: string;
  description: string;
}

interface AboutJourneyProps {
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

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function TimelineDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const position = total <= 1 ? 0 : index / (total - 1);
  const dotScale = useTransform(
    scrollYProgress,
    [Math.max(0, position - 0.12), position + 0.02],
    [0.75, 1.15]
  );
  const dotOpacity = useTransform(
    scrollYProgress,
    [Math.max(0, position - 0.12), position + 0.02],
    [0.35, 1]
  );
  const ringScale = useTransform(
    scrollYProgress,
    [Math.max(0, position - 0.08), position + 0.1],
    [0.5, 2.2]
  );
  const ringOpacity = useTransform(
    scrollYProgress,
    [Math.max(0, position - 0.08), position + 0.1],
    [0, 0.55]
  );

  return (
    <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
      <motion.span
        className="absolute h-3 w-3 rounded-full bg-[#4dd9f0]/40"
        style={{ scale: ringScale, opacity: ringOpacity }}
        aria-hidden
      />
      <motion.span
        className="relative z-1 h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(77,217,240,0.8)]"
        style={{ scale: dotScale, opacity: dotOpacity }}
        aria-hidden
      />
    </div>
  );
}

function AnimatedLine({ progress }: { progress: MotionValue<number> }) {
  const height = useTransform(progress, [0, 1], ["0%", "100%"]);
  const dotTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div className="absolute top-2 bottom-2 left-0 w-px" aria-hidden>
      <div className="absolute inset-0 w-px bg-white/20" />

      <motion.div
        className="absolute top-0 left-0 w-px overflow-hidden rounded-full"
        style={{ height }}
      >
        <div className="h-full w-full bg-linear-to-b from-[#4dd9f0] via-white to-[#7ee8ff]" />
        <div className="animate-timeline-shimmer-vertical absolute inset-0 bg-linear-to-b from-transparent via-white/70 to-transparent" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4dd9f0] shadow-[0_0_14px_#4dd9f0,0_0_28px_rgba(77,217,240,0.5)]"
        style={{ top: dotTop }}
      />
    </div>
  );
}

function TimelineItem({
  item,
  index,
  total,
  scrollYProgress,
}: {
  item: JourneyMilestone;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const position = total <= 1 ? 0 : index / (total - 1);
  const textOpacity = useTransform(
    scrollYProgress,
    [Math.max(0, position - 0.15), position + 0.05],
    [0.45, 1]
  );

  return (
    <motion.li
      className="relative pb-12 pl-8 last:pb-0 sm:pb-14 sm:pl-10 lg:pb-16"
      style={{ opacity: textOpacity }}
    >
      <div className="absolute top-1 left-0 -translate-x-1/2">
        <TimelineDot index={index} total={total} scrollYProgress={scrollYProgress} />
      </div>
      <motion.p
        className="font-century text-[16px] text-white"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={viewport}
        transition={{ duration: 0.55, ease: entryEase, delay: index * 0.1 }}
      >
        {item.year}
      </motion.p>
      <motion.p
        className="mt-2 max-w-xl font-century text-[14px] leading-relaxed text-white/85 lg:max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.55, ease: entryEase, delay: index * 0.1 + 0.08 }}
      >
        {item.description}
      </motion.p>
    </motion.li>
  );
}

export default function AboutJourney({
  heading = "JOURNEY",
  milestones = DEFAULT_MILESTONES,
  backgroundImage,
}: AboutJourneyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImageSrc = backgroundImage ? resolveUploadSrc(backgroundImage) : undefined;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#0b1f4a] pb-16 pt-20 sm:pb-20 sm:pt-24"
    >
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
          className="font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.6, ease: entryEase }}
        >
          {heading}
        </motion.h2>

        <div className="relative mt-14 max-w-3xl sm:mt-16 lg:mt-20">
          <AnimatedLine progress={smoothProgress} />
          <ul className="relative">
            {milestones.map((item, index) => (
              <TimelineItem
                key={item.year}
                item={item}
                index={index}
                total={milestones.length}
                scrollYProgress={smoothProgress}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
