"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { getIndustrySlug, type IndustryItem } from "@/app/lib/industries-types";

interface ProjectsIndustriesGridProps {
  industries: IndustryItem[];
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

export default function ProjectsIndustriesGrid({ industries }: ProjectsIndustriesGridProps) {
  if (industries.length === 0) {
    return (
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="rounded-xl bg-white p-12 text-center shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase }}
          >
            <p className="font-century text-[15px] text-gray-400">No industries added yet</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => {
            const slug = getIndustrySlug(industry);
            const cardImage = industry.image ? resolveUploadSrc(industry.image) : "";

            return (
              <motion.div
                key={industry.id}
                className="h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 }}
              >
                <Link
                  href={`/projects/${slug}`}
                  className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-primary hover:shadow-lg md:min-h-[260px]"
                >
                  {cardImage ? (
                    <>
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${cardImage})` }}
                      />
                      <div className="absolute inset-0 bg-white/75 transition-colors group-hover:bg-white/65" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
                  )}

                  <div className="relative z-10 mt-auto flex w-full flex-col">
                    <div>
                      <motion.h3
                        className="font-cinzel text-[20px] font-normal leading-[1.08] tracking-tight text-gray-900 transition-colors group-hover:text-primary md:text-[30px]"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={viewport}
                        transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 + 0.1 }}
                      >
                        {industry.name}
                      </motion.h3>
                      <motion.span
                        className="mt-2 block h-0.5 w-12 bg-primary"
                        initial={{ opacity: 0, scaleX: 0 }}
                        whileInView={{ opacity: 1, scaleX: 1 }}
                        viewport={viewport}
                        transition={{ duration: 0.45, ease: entryEase, delay: index * 0.08 + 0.16 }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
