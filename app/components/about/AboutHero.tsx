"use client";

import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";

interface AboutHeroProps {
  title?: string;
  backgroundImage?: string;
}

export default function AboutHero({
  title = "ABOUT US",
  backgroundImage,
}: AboutHeroProps) {
  const imageSrc = backgroundImage ? resolveUploadSrc(backgroundImage) : undefined;

  return (
    <section className="relative mt-20 overflow-hidden lg:min-h-[85vh]">
      <div className="absolute inset-0 z-0">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover object-[center_30%] lg:object-center"
          />
        ) : (
          <div className="h-full w-full bg-[#d8d8d8]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12 lg:flex lg:min-h-[85vh] lg:flex-col lg:px-10">
        <div className="lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pb-16 lg:max-w-2xl">
          <TextAnimate
            as="h1"
            animation="slideRight"
            by="character"
            startOnView={false}
            once
            duration={0.8}
            className="font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
          >
            {title}
          </TextAnimate>
        </div>
      </div>
    </section>
  );
}
