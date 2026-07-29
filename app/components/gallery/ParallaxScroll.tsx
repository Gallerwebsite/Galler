"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ParallaxScrollProps = {
  images: string[];
  className?: string;
};

export function ParallaxScroll({ images, className = "" }: ParallaxScrollProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const third = Math.ceil(images.length / 3);
  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  if (images.length === 0) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-black px-6 py-20 text-center text-sm text-neutral-400">
        No gallery images yet. Add images from the admin panel.
      </div>
    );
  }

  const columns = [
    { key: "grid-1", items: firstPart, translate: translateFirst },
    { key: "grid-2", items: secondPart, translate: translateSecond },
    { key: "grid-3", items: thirdPart, translate: translateThird },
  ] as const;

  return (
    <div
      ref={gridRef}
      className={`w-full items-start overflow-y-auto bg-black ${className}`}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 px-10 py-40 md:grid-cols-2 lg:grid-cols-3">
        {columns.map(({ key, items, translate }) => (
          <div key={key} className="grid gap-10">
            {items.map((src, idx) => (
              <motion.div key={`${key}${idx}`} style={{ y: translate }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Gallery"
                  height={400}
                  width={400}
                  className="!m-0 h-80 w-full gap-10 rounded-lg object-cover object-left-top !p-0"
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParallaxScroll;
