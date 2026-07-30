"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { getIndustrySlug } from "@/app/lib/industries-types";
import type { SiteContent } from "@/app/lib/getContent";
import industriesBg from "@/Assets/industries.png";
import CharacterSlideHeading from "./CharacterSlideHeading";

type IndustryItem = {
  id: string;
  name: string;
  image: string;
};

type Props = { content?: SiteContent["homeIndustries"] };

const DEFAULT_ITEMS: IndustryItem[] = [
  { id: "telecommunication", name: "TELECOMMUNICATION", image: "" },
  { id: "petroleum", name: "PETROLEUM", image: "" },
  { id: "automobile", name: "AUTOMOBILE", image: "" },
];

const DEFAULTS: NonNullable<SiteContent["homeIndustries"]> = {
  title: "INDUSTRIES",
  items: DEFAULT_ITEMS,
};

function useVisibleCount() {
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
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

function IndustryCard({ item }: { item: IndustryItem }) {
  const imageSrc = item.image ? resolveUploadSrc(item.image) : "";
  const href = `/projects/${getIndustrySlug(item)}`;

  return (
    <Link href={href} className="block h-full">
      <article className="group relative aspect-[4/3] h-full overflow-hidden bg-[#d8d8d8] sm:aspect-[5/4]">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#c8c8c8] to-[#a8a8a8]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <h3 className="absolute inset-x-0 bottom-0 px-3 pb-3 text-center font-serif text-base tracking-[0.12em] text-white sm:text-lg md:text-xl">
          {item.name}
        </h3>
      </article>
    </Link>
  );
}

export default function IndustriesSection({ content }: Props) {
  const c = {
    ...DEFAULTS,
    ...content,
    items: content?.items?.length ? content.items : DEFAULTS.items,
  };

  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = useVisibleCount();
  const isCarousel = c.items.length > 3;
  const maxStartIndex = Math.max(0, c.items.length - visibleCount);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

  const goNext = useCallback(() => {
    setStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  }, [maxStartIndex]);

  const goPrev = useCallback(() => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const slideOffset = c.items.length > 0 ? (startIndex / c.items.length) * 100 : 0;

  return (
    <section id="industries" className="relative bg-white py-8 sm:py-10 md:py-12">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url(${industriesBg.src})`,
          backgroundAttachment: "fixed",
          backgroundRepeat: "repeat",
          backgroundSize: "135% auto",
          backgroundPosition: "center top",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <CharacterSlideHeading title={c.title} />

        {isCarousel ? (
          <div className="mt-5 flex items-center gap-3 sm:mt-6 sm:gap-4 lg:mt-7 lg:gap-5">
            <button
              type="button"
              onClick={goPrev}
              disabled={startIndex === 0}
              className="shrink-0 cursor-pointer text-black/70 transition-opacity hover:text-black hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous industries"
            >
              <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
            </button>

            <div className="min-w-0 flex-1 overflow-hidden">
              <motion.div
                className="flex"
                style={{ width: `${(c.items.length / visibleCount) * 100}%` }}
                animate={{ x: `-${slideOffset}%` }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
              >
                {c.items.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 px-1.5 sm:px-2 lg:px-2.5"
                    style={{ width: `${100 / c.items.length}%` }}
                  >
                    <IndustryCard item={item} />
                  </div>
                ))}
              </motion.div>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={startIndex >= maxStartIndex}
              className="shrink-0 cursor-pointer text-black/70 transition-opacity hover:text-black hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next industries"
            >
              <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:mt-7 lg:grid-cols-3 lg:gap-5">
            {c.items.map((item) => (
              <IndustryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
