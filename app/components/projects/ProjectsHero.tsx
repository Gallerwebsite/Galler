"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";
import StartProjectModal from "./StartProjectModal";

interface ProjectsHeroProps {
  heading?: string;
  subtitle?: string;
  ctaText?: string;
  backgroundImage?: string;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;

export default function ProjectsHero({
  heading = "OUR PROJECTS",
  subtitle = "Select an industry below to explore our successfully implemented projects",
  ctaText = "START A PROJECT",
  backgroundImage,
}: ProjectsHeroProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const heroBackground = backgroundImage ? resolveUploadSrc(backgroundImage) : "";

  return (
    <>
      <section className="relative mt-20 flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#051c2c] via-[#0a3e65] to-[#051c2c] px-6 py-20">
        {heroBackground ? (
          <>
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroBackground})` }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: entryEase }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-black/30" />
        )}

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <TextAnimate
            as="h1"
            animation="slideRight"
            by="character"
            startOnView={false}
            once
            duration={0.9}
            className="font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
          >
            {heading}
          </TextAnimate>
          <motion.p
            className="mx-auto mt-6 max-w-2xl font-century text-[18px] leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.25 }}
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: entryEase, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-8 inline-block rounded-full border-2 border-white bg-transparent px-8 py-3 font-century text-[15px] font-medium text-white transition-all hover:bg-white hover:text-[#051c2c]"
            >
              {ctaText}
            </button>
          </motion.div>
        </div>
      </section>

      <StartProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
