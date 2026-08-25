"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import {
  getProductGallery,
  getVisibleProductDownloadButtons,
  type IndustryGalleryItem,
  type IndustryProduct,
} from "@/app/lib/industries-types";
import { downloadOrOpenUploadedFile } from "@/app/lib/downloadFile";
import { TextAnimate } from "@/registry/magicui/text-animate";

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function CornerBracketBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative px-5 py-6 sm:px-8 sm:py-8">
      <span className="absolute top-0 left-0 h-5 w-5 border-t border-l border-[#1a1a1a]" />
      <span className="absolute top-0 right-0 h-5 w-5 border-t border-r border-[#1a1a1a]" />
      <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#1a1a1a]" />
      <span className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-[#1a1a1a]" />
      {children}
    </div>
  );
}

function GalleryThumb({
  item,
  active,
  onClick,
  delay = 0,
}: {
  item: IndustryGalleryItem;
  active: boolean;
  onClick: () => void;
  delay?: number;
}) {
  const src = item.src ? resolveUploadSrc(item.src) : "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.5, ease: entryEase, delay }}
      className={`relative aspect-[4/3] min-w-0 flex-1 overflow-hidden bg-white ${
        active ? "ring-2 ring-[#0b1f4a]" : ""
      }`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={item.alt || ""} className="h-full w-full object-contain p-2" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 font-century text-[13px] text-gray-400">
          No image
        </div>
      )}
      {item.type === "video" ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#0b1f4a]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      ) : null}
    </motion.button>
  );
}

export default function IndustryDetailContent({
  product,
  backLink,
}: {
  product: IndustryProduct;
  backLink?: { href: string; label: string };
}) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const visibleThumbCount = 4;
  const maxThumbStart = Math.max(0, gallery.length - visibleThumbCount);
  const activeItem = gallery[activeIndex] ?? gallery[0];
  const activeSrc = activeItem?.src ? resolveUploadSrc(activeItem.src) : "";
  const features = product.keyFeatures?.length ? product.keyFeatures : [];
  const featureColumns = [
    features.filter((_, i) => i % 2 === 0),
    features.filter((_, i) => i % 2 === 1),
  ];
  const downloadButtons = getVisibleProductDownloadButtons(product);
  const [downloading, setDownloading] = useState<"brochure" | "model3d" | null>(null);

  const handleDownload = async (type: "brochure" | "model3d") => {
    const file = type === "brochure" ? downloadButtons.brochure : downloadButtons.model3d;
    if (!file) return;

    setDownloading(type);
    try {
      await downloadOrOpenUploadedFile(file.url, file.fileName);
    } finally {
      setDownloading(null);
    }
  };

  const selectImage = (index: number) => {
    setActiveIndex(index);
    setZoomed(false);
    if (index < thumbStart) setThumbStart(index);
    else if (index >= thumbStart + visibleThumbCount) {
      setThumbStart(Math.min(index, maxThumbStart));
    }
  };

  const actionButtons = [
    downloadButtons.brochure
      ? {
          key: "brochure" as const,
          label: downloading === "brochure" ? "Downloading…" : "Download Brochure",
          onClick: () => handleDownload("brochure"),
          disabled: downloading === "brochure",
          href: undefined,
          tone: "primary" as const,
        }
      : null,
    downloadButtons.model3d
      ? {
          key: "model3d" as const,
          label: downloading === "model3d" ? "Downloading…" : "3D Model",
          onClick: () => handleDownload("model3d"),
          disabled: downloading === "model3d",
          href: undefined,
          tone: "primary" as const,
        }
      : null,
    downloadButtons.checkoutVideo
      ? {
          key: "checkoutVideo" as const,
          label: "Checkout Video",
          onClick: undefined,
          disabled: false,
          href: downloadButtons.checkoutVideo.url,
          tone: "secondary" as const,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const actionButtonClass =
    "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center font-century text-[11px] leading-tight font-semibold tracking-wide whitespace-nowrap sm:gap-2 sm:px-3 sm:py-3 sm:text-[13px] lg:text-[14px]";

  return (
    <section className="bg-white pt-28 pb-10 sm:pt-32 sm:pb-14 md:pb-16">
      <div className="mx-auto max-w-7xl px-6">
        {backLink ? (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: entryEase }}
          >
            <Link
              href={backLink.href}
              className="mb-6 inline-flex items-center gap-2 font-century text-[15px] font-medium text-gray-500 transition-colors hover:text-[#0b1f4a]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {backLink.label}
            </Link>
          </motion.div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left — gallery */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.08 }}
          >
            <motion.div
              className={`relative overflow-hidden bg-[#f7f7f7] ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              onClick={() => setZoomed((prev) => !prev)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.6, ease: entryEase, delay: 0.12 }}
            >
              {activeSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeSrc}
                  alt={activeItem?.alt || product.name}
                  className={`aspect-[4/3] w-full object-contain transition-transform duration-300 ${
                    zoomed ? "scale-150" : "scale-100"
                  }`}
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 font-century text-[15px] text-gray-400">
                  No image uploaded
                </div>
              )}

              <motion.button
                type="button"
                aria-label="Toggle zoom"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((prev) => !prev);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewport}
                transition={{ duration: 0.45, ease: entryEase, delay: 0.2 }}
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0b1f4a] shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </motion.button>
            </motion.div>

            {gallery.length > 0 ? (
              <motion.div
                className="mt-4 flex items-center gap-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.18 }}
              >
                <button
                  type="button"
                  aria-label="Previous thumbnails"
                  disabled={thumbStart === 0}
                  onClick={() => setThumbStart((prev) => Math.max(0, prev - 1))}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-[#0b1f4a] disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex min-w-0 flex-1 gap-2">
                  {gallery.slice(thumbStart, thumbStart + visibleThumbCount).map((item, offset) => {
                    const index = thumbStart + offset;
                    return (
                      <GalleryThumb
                        key={item.id}
                        item={item}
                        active={index === activeIndex}
                        onClick={() => selectImage(index)}
                        delay={0.22 + offset * 0.06}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  aria-label="Next thumbnails"
                  disabled={thumbStart >= maxThumbStart}
                  onClick={() => setThumbStart((prev) => Math.min(maxThumbStart, prev + 1))}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-[#0b1f4a] disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </motion.div>
            ) : null}
          </motion.div>

          {/* Right — content */}
          <div className="flex flex-col">
            <TextAnimate
              as="h1"
              animation="slideRight"
              by="character"
              once
              duration={0.9}
              className="font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-[#0b1f4a] md:text-[40px]"
            >
              {product.name}
            </TextAnimate>

            <motion.p
              className="mt-4 font-century text-[15px] leading-relaxed text-[#4a4a4a]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.6, ease: entryEase, delay: 0.1 }}
            >
              {product.description ||
                "Add a basic description for this product from the admin panel."}
            </motion.p>

            {features.length > 0 ? (
              <motion.div
                className="mt-8 sm:mt-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.6, ease: entryEase, delay: 0.16 }}
              >
                <TextAnimate
                  as="h2"
                  animation="slideRight"
                  by="character"
                  once
                  duration={0.8}
                  className="font-cinzel text-[20px] font-normal leading-[1.08] tracking-tight text-[#0b1f4a] md:text-[30px]"
                >
                  Key Features
                </TextAnimate>

                <motion.div
                  className="mt-2 h-0.5 w-12 bg-[#b8451a]"
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={viewport}
                  transition={{ duration: 0.45, ease: entryEase, delay: 0.22 }}
                />

                <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {featureColumns.map((column, columnIndex) => (
                    <ul key={columnIndex} className="space-y-2">
                      {column.map((feature, featureIndex) => {
                        const flatIndex = columnIndex + featureIndex * 2;
                        return (
                          <motion.li
                            key={feature}
                            className="flex gap-2 font-century text-[15px] leading-relaxed text-[#4a4a4a]"
                            initial={{ opacity: 0, x: columnIndex === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={viewport}
                            transition={{
                              duration: 0.5,
                              ease: entryEase,
                              delay: 0.24 + flatIndex * 0.06,
                            }}
                          >
                            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b1f4a]" />
                            <span>{feature}</span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {actionButtons.length > 0 ? (
              <motion.div
                className="mt-8 flex flex-nowrap items-stretch gap-2 sm:mt-10 sm:gap-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.28 }}
              >
                {actionButtons.map((action) => {
                  const toneClass =
                    action.tone === "secondary"
                      ? "bg-[#0b1f4a] text-white transition-colors hover:bg-[#123066]"
                      : "bg-[#b8451a] text-white transition-colors hover:bg-[#d4531a] disabled:opacity-60";

                  if (action.href) {
                    return (
                      <motion.a
                        key={action.key}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`${actionButtonClass} ${toneClass}`}
                      >
                        <PlayIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        {action.label}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.button
                      key={action.key}
                      type="button"
                      onClick={action.onClick}
                      disabled={action.disabled}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${actionButtonClass} ${toneClass}`}
                    >
                      <DownloadIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      {action.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
