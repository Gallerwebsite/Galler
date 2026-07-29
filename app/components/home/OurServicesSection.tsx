"use client";

import { motion } from "framer-motion";
import type { SiteContent } from "@/app/lib/getContent";

type ServiceCategory = {
  id: string;
  number: number;
  title: string;
  icon: "design" | "manufacturing" | "lifecycle";
  items: string[];
};

type Props = { content?: SiteContent["homeServices"] };

const SERVICES_BG = "linear-gradient(49deg, #051c2c 32%, #051c2c 32%, #0a3e65 64%)";

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULTS: NonNullable<SiteContent["homeServices"]> = {
  title: "OUR SERVICES",
  subtitle:
    "IOT-ENABLED INTEGRATED ELECTRONICS MANUFACTURING WITH END-TO-END CAPABILITIES ACROSS THE ESDM SPECTRUM",
  categories: [
    {
      id: "design",
      number: 1,
      title: "DESIGN",
      icon: "design",
      items: [
        "Concept to Design Proposal",
        "Hardware, Embedded & Mechanical Design",
        "Digital Engineering with IoT Solutions",
        "DFM / DFT / DFS & Reliability Tests",
        "Proof of Concept & Proto Build",
      ],
    },
    {
      id: "manufacturing",
      number: 2,
      title: "MANUFACTURING",
      icon: "manufacturing",
      items: [
        "Test Fixture & Functional Tester Development",
        "Pilot Build & Ramp Up",
        "OEM Turnkey Manufacturing — PCBA",
        "OEM Turnkey Manufacturing — Box Build",
        "Value Engineering & Part Localization",
      ],
    },
    {
      id: "lifecycle",
      number: 3,
      title: "LIFECYCLE SUPPORT",
      icon: "lifecycle",
      items: [
        "Obsolescence Management",
        "Repair & Refurbish",
        "Product Maintenance",
        "Spare Parts Management incl. Last Time Buy",
        "Post Warranty Servicing",
      ],
    },
  ],
};

function CategoryIcon({ icon }: { icon: ServiceCategory["icon"] }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (icon === "design") {
    return (
      <svg {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  if (icon === "manufacturing") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function ServiceItem({ index, label }: { index: number; label: string }) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex w-14 shrink-0 items-center justify-center border-r border-[#0099E1]/20 bg-[#0099E1] text-sm font-bold text-white sm:w-16">
        {num}
      </div>
      <p className="flex items-center px-4 py-2.5 font-century text-[15px] leading-relaxed text-[#000] sm:px-5">
        {label}
      </p>
    </div>
  );
}

function CategoryColumn({ category, index }: { category: ServiceCategory; index: number }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{
        duration: 0.55,
        ease: entryEase,
        delay: index * 0.1,
      }}
    >
      <div className="relative mb-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#0099E1] bg-white text-[#0099E1] shadow-sm">
          <CategoryIcon icon={category.icon} />
        </div>
        <span className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0099E1] text-xs font-bold text-white">
          {category.number}
        </span>
      </div>

      <h3 className="mb-4 text-center font-cinzel text-[18px] font-normal leading-[1.08] tracking-tight text-white md:text-[22px]">
        {category.title}
      </h3>

      <div className="flex w-full flex-col gap-2.5">
        {category.items.map((item, itemIndex) => (
          <motion.div
            key={`${category.id}-${itemIndex}`}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{
              duration: 0.5,
              ease: entryEase,
              delay: index * 0.1 + itemIndex * 0.06,
            }}
          >
            <ServiceItem index={itemIndex} label={item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function OurServicesSection({ content }: Props) {
  const c = {
    ...DEFAULTS,
    ...content,
    categories: content?.categories?.length ? content.categories : DEFAULTS.categories,
  };

  return (
    <section id="services" className="py-10 md:py-16" style={{ background: SERVICES_BG }}>
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto mb-8 max-w-4xl text-center md:mb-10">
          <motion.h2
            className="text-center font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-white md:text-[40px]"
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase }}
          >
            {c.title}
          </motion.h2>
          <motion.p
            className="mt-3 font-century text-[15px] leading-relaxed text-white/80"
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.12 }}
          >
            {c.subtitle}
          </motion.p>
        </header>

        <div className="relative">
          <div
            className="pointer-events-none absolute top-10 right-[16.67%] left-[16.67%] hidden h-px bg-[#0099E1] lg:block"
            aria-hidden
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8 xl:gap-10">
            {c.categories.map((category, index) => (
              <CategoryColumn key={category.id} category={category as ServiceCategory} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
