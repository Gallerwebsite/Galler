"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SiteContent } from "@/app/lib/getContent";
import WorkWithUsQueryModal from "./WorkWithUsQueryModal";

type WorkItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: "odm" | "oem" | "reengineering";
  href?: string;
};

type Props = { content?: SiteContent["homeWorkWithUs"] };

const SECTION_BG = "linear-gradient(49deg, #051c2c 32%, #051c2c 32%, #0a3e65 64%)";

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULTS: NonNullable<SiteContent["homeWorkWithUs"]> = {
  tagline: "GALLERINDIA",
  title: "Three ways to work with us",
  items: [
    {
      id: "odm",
      number: "01",
      title: "ODM",
      icon: "odm",
      description:
        "You have a problem. Bring us the requirement, not the drawing. We define the specification, design the hardware, firmware and mechanics, build the tooling, prove it in the field, and manufacture it.",
    },
    {
      id: "oem",
      number: "02",
      title: "OEM",
      icon: "oem",
      description:
        "You have a specification. Bring us your drawings and standards. We industrialise the design, build the tooling and test fixtures, and manufacture to your quality gates with full traceability.",
    },
    {
      id: "reengineering",
      number: "03",
      title: "Re-engineering",
      icon: "reengineering",
      description:
        "You have a product. Bring us what already exists. We cut cost, replace end-of-life components, localise the BOM, add connectivity and diagnostics, and put it back into production.",
    },
  ],
};

function WorkIcon({ icon }: { icon: WorkItem["icon"] }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (icon === "odm") {
    return (
      <svg {...props}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    );
  }

  if (icon === "oem") {
    return (
      <svg {...props}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
        <path d="M9 8h6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 6V4" />
      <path d="M12 20v-2" />
      <path d="M6 12H4" />
      <path d="M20 12h-2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M7.05 7.05 5.64 5.64" />
      <path d="M18.36 18.36l-1.41-1.41" />
      <path d="M7.05 16.95 5.64 18.36" />
      <path d="M18.36 5.64l-1.41 1.41" />
    </svg>
  );
}

function WorkCard({
  item,
  index,
  onSelect,
}: {
  item: WorkItem;
  index: number;
  onSelect: (title: string) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item.title)}
      className="flex h-full min-h-[280px] w-full cursor-pointer flex-col rounded-2xl border border-white/10 bg-[#071829]/80 p-5 text-left transition-colors hover:border-[#0099E1]/40 hover:bg-[#0a2035]/90 sm:p-6 lg:min-h-[300px] lg:p-7"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay: index * 0.1 }}
      aria-label={`Submit a query about ${item.title}`}
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0099E1]/25 text-white">
          <WorkIcon icon={item.icon} />
        </div>

        <div className="min-w-0 flex-1">
          <span className="block font-cinzel text-[22px] leading-none font-normal tracking-tight text-[#0099E1] sm:text-[24px]">
            {item.number}
          </span>
          <h3 className="mt-1.5 whitespace-nowrap font-cinzel text-[22px] font-normal leading-[1.05] tracking-tight text-white sm:text-[24px] lg:text-[26px]">
            {item.title}
          </h3>
          <div className="mt-2.5 h-1 w-12 rounded-full bg-[#0099E1]" />
        </div>
      </div>

      <p className="flex-1 font-century text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
        {item.description}
      </p>
    </motion.button>
  );
}

export default function WorkWithUsSection({ content }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState("");

  const c = {
    ...DEFAULTS,
    ...content,
    items: content?.items?.length ? content.items : DEFAULTS.items,
  };

  const openQueryModal = (title: string) => {
    setSelectedWorkType(title);
    setModalOpen(true);
  };

  const closeQueryModal = () => {
    setModalOpen(false);
    setSelectedWorkType("");
  };

  return (
    <>
      <section id="work-with-us" className="py-12 md:py-16 lg:py-20" style={{ background: SECTION_BG }}>
        <div className="mx-auto max-w-[90rem] px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,230px)_1px_minmax(0,1fr)] lg:gap-8 xl:gap-10">
            <motion.div
              className="mx-auto flex max-w-[230px] flex-col items-center justify-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-left"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.6, ease: entryEase }}
            >
              <div className="flex w-full items-center justify-center gap-3 lg:justify-start">
                <span className="h-px w-6 shrink-0 bg-[#0099E1]/70" aria-hidden />
                <span className="shrink-0 font-century text-[11px] font-semibold tracking-[0.26em] text-white/90 uppercase">
                  {c.tagline}
                </span>
                <span className="h-px flex-1 bg-[#0099E1]/70 lg:flex-1" aria-hidden />
              </div>

              <div className="mt-5 flex w-full max-w-[220px] flex-col items-center lg:items-stretch">
                <h2 className="font-cinzel text-[28px] font-normal leading-[1.14] tracking-tight text-white md:text-[30px] lg:text-left lg:text-[36px]">
                  {c.title}
                </h2>

                <div className="mt-3 mx-auto h-1 w-14 rounded-full bg-[#0099E1]" />
              </div>
            </motion.div>

            <div className="hidden bg-white/10 lg:block" aria-hidden />

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {c.items.map((item, index) => (
                <WorkCard key={item.id} item={item as WorkItem} index={index} onSelect={openQueryModal} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <WorkWithUsQueryModal open={modalOpen} workType={selectedWorkType} onClose={closeQueryModal} />
    </>
  );
}
