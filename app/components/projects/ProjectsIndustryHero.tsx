"use client";

import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";

interface ProjectsIndustryHeroProps {
  name: string;
  backgroundImage?: string;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;

export default function ProjectsIndustryHero({ name, backgroundImage }: ProjectsIndustryHeroProps) {
  const heroBackground = backgroundImage ? resolveUploadSrc(backgroundImage) : "";

  return (
    <section className="relative mt-20 flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#051c2c] via-[#0a3e65] to-[#051c2c] px-6 py-20 md:min-h-[75vh] lg:min-h-[75vh]">
      {heroBackground ? (
        <>
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBackground})` }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: entryEase }}
          />
          <div className="absolute inset-0 bg-black/60" />
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
          className="font-cinzel text-[25px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
        >
          {name}
        </TextAnimate>
      </div>
    </section>
  );
}
