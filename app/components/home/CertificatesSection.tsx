"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import type { SiteContent } from "@/app/lib/getContent";

type CertificateItem = {
  id: string;
  title: string;
  image: string;
};

type Props = { content?: SiteContent["homeCertificates"] };

const NAVY = "#051c2c";
const DOTTED_BACKDROP_STYLE = {
  backgroundImage: `radial-gradient(circle, ${NAVY} 1.5px, transparent 1.5px)`,
  backgroundSize: "18px 18px",
};
const SLOT_COUNT = 5;
const CAROUSEL_GAP = 12;

const DEFAULTS: NonNullable<SiteContent["homeCertificates"]> = {
  tagline: "TRUST & ASSURANCE",
  title: "Certificates & Compliance",
  subtitle: "Click any certificate to view it in full size.",
  items: [],
};

function NavButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#051c2c]/30 bg-white text-[#051c2c] transition-colors hover:border-[#051c2c]/60 hover:bg-[#051c2c]/5 disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {direction === "left" ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function CertificateCard({
  item,
  index,
  isActive,
  onSelect,
}: {
  item: CertificateItem;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}) {
  const imageSrc = item.image ? resolveUploadSrc(item.image) : "";

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`relative flex w-full flex-col overflow-hidden rounded-2xl bg-[#0a2540] text-left transition-transform duration-300 ease-out hover:z-20 hover:scale-125 ${
        isActive
          ? "border-2 border-[var(--primary-orange)] shadow-[0_0_0_1px_var(--primary-orange)]"
          : "border-2 border-transparent"
      } min-h-[260px] sm:min-h-[280px] lg:min-h-[300px]`}
    >
      <div className="relative mx-2 mt-2 aspect-[4/5] overflow-hidden rounded-lg bg-white sm:mx-2.5 sm:mt-2.5">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={item.title}
            className="h-full w-full object-contain object-top p-1.5"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#f7f7f7] font-century text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center px-3 py-3 sm:py-3.5">
        <p className="text-center font-century text-[11px] font-semibold leading-snug text-white sm:text-[12px]">
          {item.title}
        </p>
      </div>
    </button>
  );
}

function FullscreenCertificateModal({
  item,
  imageSrc,
  onClose,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: {
  item: CertificateItem;
  imageSrc: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}) {
  return (
    <>
      <motion.button
        type="button"
        aria-label="Close certificate preview"
        className="fixed inset-0 z-50 cursor-default bg-[#051c2c]/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-6 sm:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="pointer-events-auto relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#051c2c]/10 px-4 py-3 sm:px-6">
            <p className="font-century text-sm font-semibold text-[#051c2c] sm:text-base">{item.title}</p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#051c2c] transition-colors hover:bg-[#051c2c]/5"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-8">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={item.title}
                className="mx-auto max-h-[min(78vh,820px)] w-full object-contain"
              />
            ) : (
              <p className="py-16 text-center font-century text-sm text-gray-400">No image available</p>
            )}
          </div>
        </motion.div>

        <div className="pointer-events-auto mt-4 flex items-center gap-3">
          <NavButton direction="left" onClick={onPrev} disabled={!canGoPrev} label="Previous certificate" />
          <NavButton direction="right" onClick={onNext} disabled={!canGoNext} label="Next certificate" />
        </div>
      </motion.div>
    </>
  );
}

function SectionHeader({
  tagline,
  title,
  subtitle,
  centered = false,
}: {
  tagline: string;
  title: string;
  subtitle: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span className="font-century text-[11px] font-bold tracking-[0.24em] text-[var(--primary-orange)] uppercase">
          {tagline}
        </span>
        <span className="h-px w-12 bg-[var(--primary-orange)]" aria-hidden />
      </div>
      <h2 className="mt-3 font-cinzel text-[26px] font-normal leading-[1.08] tracking-tight text-[#051c2c] sm:mt-4 sm:text-[32px] lg:text-[36px]">
        {title}
      </h2>
      <p className="mt-2 font-century text-[13px] leading-relaxed text-[#777] sm:mt-3 sm:text-[14px]">
        {subtitle}
      </p>
    </div>
  );
}

function useCertificateCarouselLayout(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [layout, setLayout] = useState({ cardWidth: 220, slideStep: 232 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      const cardWidth = (width - (SLOT_COUNT - 1) * CAROUSEL_GAP) / SLOT_COUNT;
      setLayout({ cardWidth, slideStep: cardWidth + CAROUSEL_GAP });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportRef]);

  return layout;
}

function getDesktopGridClass(itemCount: number, useCarousel: boolean) {
  if (useCarousel) return "grid-cols-5";
  if (itemCount === 1) return "mx-auto grid-cols-1 max-w-xs";
  if (itemCount === 2) return "mx-auto grid-cols-2 max-w-2xl";
  if (itemCount === 3) return "mx-auto grid-cols-3 max-w-4xl";
  return "mx-auto grid-cols-4 max-w-6xl";
}

export default function CertificatesSection({ content }: Props) {
  const c = {
    ...DEFAULTS,
    ...content,
    items: content?.items?.length ? content.items : DEFAULTS.items,
  };

  const [focusIndex, setFocusIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const { cardWidth, slideStep } = useCertificateCarouselLayout(carouselViewportRef);

  const useCarousel = c.items.length >= SLOT_COUNT;
  const maxSlideIndex = Math.max(0, c.items.length - SLOT_COUNT);

  useEffect(() => {
    setFocusIndex((prev) => Math.min(prev, Math.max(0, c.items.length - 1)));
    setSlideIndex((prev) => Math.min(prev, maxSlideIndex));
  }, [c.items.length, maxSlideIndex]);

  const goPrevMobile = useCallback(() => {
    setFocusIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goNextMobile = useCallback(() => {
    setFocusIndex((prev) => Math.min(prev + 1, c.items.length - 1));
  }, [c.items.length]);

  const goPrevCarousel = useCallback(() => {
    setFocusIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goNextCarousel = useCallback(() => {
    setFocusIndex((prev) => Math.min(prev + 1, c.items.length - 1));
  }, [c.items.length]);

  // Keep the focused certificate visible in the carousel window
  useEffect(() => {
    if (!useCarousel) return;
    setSlideIndex((slide) => {
      if (focusIndex < slide) return focusIndex;
      if (focusIndex >= slide + SLOT_COUNT) return focusIndex - SLOT_COUNT + 1;
      return slide;
    });
  }, [focusIndex, useCarousel]);

  const goPrevModal = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null) return prev;
      const next = Math.max(prev - 1, 0);
      setFocusIndex(next);
      return next;
    });
  }, []);

  const goNextModal = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null) return prev;
      const next = Math.min(prev + 1, c.items.length - 1);
      setFocusIndex(next);
      return next;
    });
  }, [c.items.length]);

  const handleSelect = useCallback((index: number) => {
    setFocusIndex(index);
    setSelectedIndex(index);
  }, []);

  const closeModal = useCallback(() => setSelectedIndex(null), []);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrevModal();
      if (e.key === "ArrowRight") goNextModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, closeModal, goPrevModal, goNextModal]);

  if (c.items.length === 0) return null;

  const selectedItem = selectedIndex !== null ? c.items[selectedIndex] : null;
  const selectedImage = selectedItem?.image ? resolveUploadSrc(selectedItem.image) : "";
  const canGoPrevMobile = focusIndex > 0;
  const canGoNextMobile = focusIndex < c.items.length - 1;
  const canGoPrevCarousel = focusIndex > 0;
  const canGoNextCarousel = focusIndex < c.items.length - 1;
  const canGoPrevModal = selectedIndex !== null && selectedIndex > 0;
  const canGoNextModal = selectedIndex !== null && selectedIndex < c.items.length - 1;
  const isFocused = (itemIndex: number) => focusIndex === itemIndex;

  return (
    <section id="certificates" className="overflow-x-clip bg-[#f5f5f5] py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[90rem] px-6">
        {/* Mobile / tablet: header full width */}
        <div className="mb-8 lg:hidden">
          <SectionHeader tagline={c.tagline} title={c.title} subtitle={c.subtitle} centered />
        </div>

        <div className="relative overflow-visible py-6 sm:py-8 lg:py-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 opacity-[0.24] blur-[2px] sm:opacity-[0.22] sm:blur-[3px] lg:inset-x-auto lg:right-0 lg:bottom-0 lg:left-auto lg:top-auto lg:h-[85%] lg:w-[72%] lg:translate-x-0 lg:opacity-[0.2] lg:blur-[4px]"
            style={DOTTED_BACKDROP_STYLE}
            aria-hidden
          />

          {/* Desktop: centered header + equal certificate cards */}
          <div className="relative z-10 hidden lg:block">
            <div className="mb-8">
              <SectionHeader tagline={c.tagline} title={c.title} subtitle={c.subtitle} centered />
            </div>

            {useCarousel ? (
              <div ref={carouselViewportRef} className="overflow-hidden pt-12 pb-12">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    gap: CAROUSEL_GAP,
                    transform: `translateX(-${slideIndex * slideStep}px)`,
                  }}
                >
                  {c.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="relative shrink-0 transition-transform duration-300 ease-out hover:z-20"
                      style={{ width: cardWidth }}
                    >
                      <CertificateCard
                        item={item}
                        index={itemIndex}
                        isActive={isFocused(itemIndex)}
                        onSelect={handleSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-3 pt-12 pb-12 ${getDesktopGridClass(c.items.length, useCarousel)}`}
              >
                {c.items.map((item, itemIndex) => (
                  <div
                    key={item.id}
                    className="relative transition-transform duration-300 ease-out hover:z-20"
                  >
                    <CertificateCard
                      item={item}
                      index={itemIndex}
                      isActive={isFocused(itemIndex)}
                      onSelect={handleSelect}
                    />
                  </div>
                ))}
              </div>
            )}

            {c.items.length > 1 && (
              <div className="relative z-10 mt-6 flex items-center justify-center gap-3">
                <NavButton
                  direction="left"
                  onClick={goPrevCarousel}
                  disabled={!canGoPrevCarousel}
                  label="Previous certificates"
                />
                <span className="min-w-[3.5rem] text-center font-century text-[14px] font-medium tabular-nums text-[#051c2c]">
                  {focusIndex + 1} / {c.items.length}
                </span>
                <NavButton
                  direction="right"
                  onClick={goNextCarousel}
                  disabled={!canGoNextCarousel}
                  label="Next certificates"
                />
              </div>
            )}
          </div>

          {/* Mobile / tablet: single featured card */}
          <div className="relative z-10 overflow-visible pt-2 pb-8 lg:hidden">
            {c.items[focusIndex] && (
              <CertificateCard
                item={c.items[focusIndex]}
                index={focusIndex}
                isActive={isFocused(focusIndex)}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>

        {c.items.length > 1 && (
          <div className="relative z-10 mt-6 flex items-center justify-center gap-3 sm:mt-8 lg:hidden">
            <NavButton
              direction="left"
              onClick={goPrevMobile}
              disabled={!canGoPrevMobile}
              label="Previous"
            />
            <span className="min-w-[3.5rem] text-center font-century text-[14px] font-medium tabular-nums text-[#051c2c]">
              {focusIndex + 1} / {c.items.length}
            </span>
            <NavButton
              direction="right"
              onClick={goNextMobile}
              disabled={!canGoNextMobile}
              label="Next"
            />
          </div>
        )}

        <AnimatePresence>
          {selectedIndex !== null && selectedItem && (
            <FullscreenCertificateModal
              item={selectedItem}
              imageSrc={selectedImage}
              onClose={closeModal}
              onPrev={goPrevModal}
              onNext={goNextModal}
              canGoPrev={canGoPrevModal}
              canGoNext={canGoNextModal}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
