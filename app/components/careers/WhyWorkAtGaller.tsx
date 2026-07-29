"use client";

import { motion } from "framer-motion";
import { getBenefitIcon } from "@/app/lib/careers-icons";
import type { SiteContent } from "@/app/lib/getContent";
import { TextAnimate } from "@/registry/magicui/text-animate";

type WhyWorkContent = NonNullable<SiteContent["careersPage"]>["whyWork"];

interface WhyWorkAtGallerProps {
  content?: WhyWorkContent;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULT_CONTENT: WhyWorkContent = {
  heading: "WHY WORK AT GALLER?",
  benefits: [
    {
      title: "MEANINGFUL WORK",
      description: "Work on products and solutions used by leading organizations.",
      icon: "meaningful",
    },
    {
      title: "LEARN & GROW",
      description: "Learn from experienced engineers and industry experts.",
      icon: "learn",
    },
    {
      title: "DIVERSE EXPOSURE",
      description: "Exposure to multiple industries and cutting-edge technologies.",
      icon: "diverse",
    },
    {
      title: "OWNERSHIP",
      description: "Take responsibility, drive innovation and see your ideas grow.",
      icon: "ownership",
    },
    {
      title: "CONTINUOUS GROWTH",
      description: "Opportunities to build expertise and advance your career.",
      icon: "growth",
    },
    {
      title: "LONG-TERM CAREER",
      description: "A place to build a career with purpose and stability.",
      icon: "career",
    },
  ],
};

export default function WhyWorkAtGaller({ content }: WhyWorkAtGallerProps) {
  const section = { ...DEFAULT_CONTENT, ...content };
  const benefits = section.benefits?.length ? section.benefits : DEFAULT_CONTENT.benefits;

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <TextAnimate
          as="h2"
          animation="slideRight"
          by="character"
          once
          duration={0.9}
          className="text-center font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-[#0b1f4a] md:text-[40px]"
        >
          {section.heading}
        </TextAnimate>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {benefits.map((benefit, index) => (
            <motion.div
              key={`${benefit.title}-${index}`}
              className={`text-center ${
                index < benefits.length - 1 ? "border-b border-[#e5e5e5] pb-8 sm:border-b-0 sm:pb-0" : ""
              } ${index % 3 !== 2 ? "lg:border-r lg:border-[#e5e5e5] lg:pr-10" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 }}
            >
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center text-[#b8451a]"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.5, ease: entryEase, delay: index * 0.08 + 0.05 }}
              >
                {getBenefitIcon(benefit.icon, index)}
              </motion.div>
              <motion.h3
                className="mt-5 font-cinzel text-[20px] font-normal leading-[1.08] tracking-tight text-[#0b1f4a]"
                initial={{ opacity: 0, x: -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.5, ease: entryEase, delay: index * 0.08 + 0.1 }}
              >
                {benefit.title}
              </motion.h3>
              <motion.p
                className="mx-auto mt-3 max-w-xs font-century text-[15px] leading-relaxed text-[#4a4a4a]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.5, ease: entryEase, delay: index * 0.08 + 0.15 }}
              >
                {benefit.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
