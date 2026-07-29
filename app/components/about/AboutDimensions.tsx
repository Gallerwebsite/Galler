"use client";

import { motion } from "framer-motion";
import { TextAnimate } from "@/registry/magicui/text-animate";

interface DimensionCard {
  title: string;
  description: string;
  icon: "box" | "forklift" | "truck";
}

interface AboutDimensionsProps {
  heading?: string;
  subtitle?: string;
  cards?: DimensionCard[];
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULT_CARDS: DimensionCard[] = [
  {
    title: "FEASIBILITY STUDIES",
    description:
      "We examine the key technical challenges, key components of unit cost and then assess the likely impact of those technical challenges on meeting the product specification which helps in estimating & optimizing the project tasks and schedules to address uncertainties early in engineering development.",
    icon: "box",
  },
  {
    title: "METHOD ENGINEERING",
    description:
      "We help refining product requirements by eliciting additional content, distinguishing the imperative from the desirable, and alerting to the design impact of severe provisions. This helps in creating Technical Specifications to guide and track our engineering development of products.",
    icon: "forklift",
  },
  {
    title: "SHAPING CONCEPTS",
    description:
      "We shape your concepts by providing a technical vision of how a product idea can be made tangible in construction and performance, including materials, manufacturing processes and product requirements.",
    icon: "truck",
  },
];

function BlueprintPattern() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.25]" aria-hidden>
      <defs>
        <pattern id="blueprint-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="#7eb8d4" strokeWidth="0.5" />
          <circle cx="24" cy="24" r="8" fill="none" stroke="#7eb8d4" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
    </svg>
  );
}

function CardIcon({ type }: { type: DimensionCard["icon"] }) {
  if (type === "box") {
    return (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden>
        <path d="M8 18l16-8 16 8v18l-16 8-16-8V18z" stroke="white" strokeWidth="2" />
        <path d="M24 10v34M8 18l16 8 16-8" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  if (type === "forklift") {
    return (
      <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden>
        <rect x="10" y="22" width="18" height="12" rx="2" stroke="white" strokeWidth="2" />
        <path d="M28 28h8v6H28zM36 20v14" stroke="white" strokeWidth="2" />
        <circle cx="16" cy="36" r="3" stroke="white" strokeWidth="2" />
        <circle cx="30" cy="36" r="3" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8" aria-hidden>
      <rect x="6" y="18" width="28" height="14" rx="2" stroke="white" strokeWidth="2" />
      <path d="M34 24h8v8H34z" stroke="white" strokeWidth="2" />
      <circle cx="14" cy="34" r="3" stroke="white" strokeWidth="2" />
      <circle cx="30" cy="34" r="3" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export default function AboutDimensions({
  heading = "DIMENSIONS TO THOUGHTS",
  subtitle = "Transforming ideas into engineered solutions.",
  cards = DEFAULT_CARDS,
}: AboutDimensionsProps) {
  return (
    <section>
      <div className="relative overflow-hidden bg-[#f4f6f8] py-14 sm:py-16">
        <BlueprintPattern />
        <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
          <TextAnimate
            as="h2"
            animation="slideRight"
            by="character"
            once
            duration={1.1}
            className="font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-[#0b1f4a] md:text-[40px]"
          >
            {heading}
          </TextAnimate>
          {/* <span className="mx-auto mt-4 block h-px w-16 bg-[#c9a227]" aria-hidden /> */}
          <TextAnimate
            as="p"
            animation="slideRight"
            by="word"
            once
            delay={0.2}
            duration={0.8}
            className="mt-5 font-century text-[18px] font-normal normal-case leading-[1.08] text-[#0b1f4a]/85 md:text-[20px]"
          >
            {subtitle}
          </TextAnimate>
        </div>
      </div>

      <div className="bg-[#0b1f4a] px-6 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="relative rounded-t-[2rem] bg-white px-6 pb-8 pt-14 text-center shadow-lg sm:px-7 sm:pb-10"
            >
              <div className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#0b1f4a] shadow-md">
                <CardIcon type={card.icon} />
              </div>
              <motion.h3
                className="font-serif text-lg tracking-wide text-[#0b1f4a] sm:text-xl"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{
                  duration: 0.55,
                  ease: entryEase,
                  delay: index * 0.1,
                }}
              >
                {card.title}
              </motion.h3>
              <span className="mx-auto mt-2 block h-1.5 w-1.5 rounded-full bg-[#c9a227]" aria-hidden />
              <motion.p
                className="mt-5 font-century text-[15px] leading-relaxed text-[#333]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{
                  duration: 0.55,
                  ease: entryEase,
                  delay: index * 0.1,
                }}
              >
                {card.description}
              </motion.p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
