"use client";

import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";

interface ContactHeroProps {
  heading?: string;
  description?: string;
  backgroundImage?: string;
}

const DEFAULT_DESCRIPTION =
  "We are here to help. Whether you have a question about our products, need a technical consultation, or want to explore a partnership, our team is ready to assist you.";

const entryEase = [0.25, 0.1, 0.25, 1] as const;

export default function ContactHero({
  heading = "CONTACT US",
  description = DEFAULT_DESCRIPTION,
  backgroundImage,
}: ContactHeroProps) {
  const imageSrc = backgroundImage ? resolveUploadSrc(backgroundImage) : undefined;

  return (
    <section className="relative mt-20 min-h-[55vh] overflow-hidden lg:min-h-[70vh]">
      <div className="absolute inset-0">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-black/55" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-center px-6 py-12 sm:px-10 lg:min-h-[70vh] lg:px-16 lg:py-16">
        <TextAnimate
          as="h1"
          animation="slideRight"
          by="character"
          startOnView={false}
          once
          duration={0.9}
          className="font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] md:text-[40px]"
        >
          {heading}
        </TextAnimate>
        <motion.p
          className="mt-6 max-w-2xl font-century text-[15px] leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: entryEase, delay: 0.25 }}
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
