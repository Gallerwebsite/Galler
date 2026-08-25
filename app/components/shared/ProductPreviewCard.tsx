"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";

export interface ProductPreviewCardProps {
  name: string;
  features?: string[];
  image?: string;
  detailHref: string;
  index?: number;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

export default function ProductPreviewCard({
  name,
  features = [],
  image,
  detailHref,
  index = 0,
}: ProductPreviewCardProps) {
  const previewFeatures = features.slice(0, 2);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 }}
    >
      <Link
        href={detailHref}
        className="group flex h-full flex-col overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all hover:shadow-lg"
      >
        {image ? (
          <motion.div
            className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-50"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 + 0.05 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveUploadSrc(image)}
              alt={name}
              className="h-full w-full object-contain p-4 transition-transform group-hover:scale-[1.03]"
            />
          </motion.div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-gray-100">
            <span className="font-century text-[15px] text-gray-300">No image</span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <motion.h3
            className="font-cinzel mb-3 min-h-[3.25rem] text-[20px] font-normal leading-[1.08] tracking-tight text-gray-900 transition-colors group-hover:text-primary"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 + 0.1 }}
          >
            {name}
          </motion.h3>
          {previewFeatures.length > 0 ? (
            <>
              <motion.div
                className="mb-4 h-0.5 w-12 bg-primary"
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={viewport}
                transition={{ duration: 0.45, ease: entryEase, delay: index * 0.08 + 0.14 }}
              />
              <motion.ul
                className="font-century mb-4 flex-1 space-y-2 text-[15px] leading-relaxed text-gray-600"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 + 0.18 }}
              >
                {previewFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </motion.ul>
            </>
          ) : null}

          <motion.span
            className="font-century mt-auto inline-block pt-4 text-[15px] font-medium text-gray-900 group-hover:text-primary"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 + 0.22 }}
          >
            VIEW DETAILS
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}
