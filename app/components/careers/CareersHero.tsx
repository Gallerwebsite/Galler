"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import type { SiteContent } from "@/app/lib/getContent";
import { TextAnimate } from "@/registry/magicui/text-animate";
import SubmitResumeModal from "./SubmitResumeModal";

type CareersHeroContent = NonNullable<SiteContent["careersPage"]>["hero"];

interface CareersHeroProps {
  content?: CareersHeroContent;
}

const DEFAULT_CONTENT: CareersHeroContent = {
  headingLine1: "BUILD PRODUCTS.",
  headingLine2: "SOLVE REAL PROBLEMS.",
  headingLine3: "CREATE IMPACT.",
  description:
    "At Galler, we engineer innovative solutions that power industries across Telecom, Petroleum, Defense, Automotive, Industrial Automation, Energy and Emerging Technologies.",
  viewPositionsText: "VIEW OPEN POSITIONS",
  submitResumeText: "SUBMIT YOUR RESUME",
  image: "",
};

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const headingClassName =
  "font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]";

export default function CareersHero({ content }: CareersHeroProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const hero = { ...DEFAULT_CONTENT, ...content };
  const imageSrc = hero.image ? resolveUploadSrc(hero.image) : undefined;
  const headingLines = [hero.headingLine1, hero.headingLine2, hero.headingLine3].filter(Boolean);

  let charOffset = 0;

  return (
    <>
      <section className="relative mt-20 min-h-[55vh] overflow-hidden lg:min-h-[70vh]">
        <div className="absolute inset-0">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#051c2c] via-[#0a3e65] to-[#051c2c]" />
          )}
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-center px-6 py-12 sm:px-10 lg:min-h-[70vh] lg:px-16 lg:py-16">
          <h1 className={`${headingClassName} flex flex-col gap-3 md:gap-4`}>
            {headingLines.map((line, index) => {
              const delay = 0.15 + charOffset * 0.03;
              charOffset += line.length;
              return (
                <TextAnimate
                  key={`${line}-${index}`}
                  as="span"
                  animation="slideRight"
                  by="character"
                  startOnView={false}
                  once
                  delay={delay}
                  duration={0.03 * line.length + 0.3}
                  className="block drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
                  accessible={index === 0}
                >
                  {line}
                </TextAnimate>
              );
            })}
          </h1>
          <motion.p
            className="mt-6 max-w-2xl font-century text-[15px] leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.35 }}
          >
            {hero.description}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-4"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.45 }}
          >
            <Link
              href="#openings"
              className="inline-flex items-center gap-2 rounded-md bg-[#b8451a] px-6 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#d4531a]"
            >
              {hero.viewPositionsText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border-2 border-white bg-transparent px-6 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-[#0b1f4a]"
            >
              {hero.submitResumeText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      <SubmitResumeModal open={resumeModalOpen} onClose={() => setResumeModalOpen(false)} />
    </>
  );
}
