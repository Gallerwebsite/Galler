"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { StickyScroll } from "../ui/sticky-scroll-reveal";

export interface JourneyMilestone {
  year: string;
  description: string;
  image?: string;
}

interface StickyScrollRevealProps {
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

export default function StickyScrollReveal({
  heading = "JOURNEY",
  milestones = DEFAULT_MILESTONES,
  backgroundImage,
}: StickyScrollRevealProps) {
  const bgImageSrc = backgroundImage ? resolveUploadSrc(backgroundImage) : undefined;

  // Transform milestones into the format expected by StickyScroll
  const content = milestones.map((milestone) => {
    const imageSrc = milestone.image ? resolveUploadSrc(milestone.image) : undefined;
    
    return {
      title: milestone.year,
      description: milestone.description,
      content: imageSrc ? (
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={`Journey ${milestone.year}`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#4dd9f0] to-[#0b1f4a] text-white">
          <div className="text-center">
            <p className="font-cinzel text-[60px] font-bold md:text-[80px] lg:text-[100px]">
              {milestone.year}
            </p>
          </div>
        </div>
      ),
    };
  });

  return (
    <section className="relative overflow-hidden bg-[#0b1f4a]">
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

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10">
        <motion.h2
          className="mb-6 font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {heading}
        </motion.h2>

        <StickyScroll content={content} contentClassName="bg-transparent" />
      </div>
    </section>
  );
}
