"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getStepIcon } from "@/app/lib/careers-icons";
import type { SiteContent } from "@/app/lib/getContent";
import { TextAnimate } from "@/registry/magicui/text-animate";

type HiringProcessContent = NonNullable<SiteContent["careersPage"]>["hiringProcess"];

interface HiringProcessProps {
  content?: HiringProcessContent;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULT_CONTENT: HiringProcessContent = {
  heading: "OUR HIRING PROCESS",
  steps: [
    { number: 1, title: "STEP 1", subtitle: "Application Submission", icon: "application" },
    { number: 2, title: "STEP 2", subtitle: "Resume Review", icon: "review" },
    { number: 3, title: "STEP 3", subtitle: "Technical Evaluation", icon: "technical" },
    { number: 4, title: "STEP 4", subtitle: "Interview Process", icon: "interview" },
    { number: 5, title: "STEP 5", subtitle: "Offer & Documentation", icon: "offer" },
    { number: 6, title: "STEP 6", subtitle: "Welcome to Galler", icon: "welcome" },
  ],
  contactBanner: {
    heading: "HAVE QUESTIONS?",
    description: "Reach out to our recruitment team.",
    email: "careers@gallerindia.com",
    phone: "+91 120 456 7890",
    buttonText: "CONTACT RECRUITMENT TEAM",
  },
};

export default function HiringProcess({ content }: HiringProcessProps) {
  const section = { ...DEFAULT_CONTENT, ...content };
  const steps = section.steps?.length ? section.steps : DEFAULT_CONTENT.steps;
  const banner = { ...DEFAULT_CONTENT.contactBanner, ...section.contactBanner };

  return (
    <section className="bg-[#f8f9fa] py-14 sm:py-16">
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

        <div className="relative mt-12">
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 border-t-2 border-dashed border-[#b8451a] lg:block" />

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number || index}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 }}
              >
                <motion.div
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#0b1f4a] text-white shadow-lg"
                  initial={{ opacity: 0, y: -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.5, ease: entryEase, delay: index * 0.08 + 0.05 }}
                >
                  {getStepIcon(step.icon, index)}
                </motion.div>
                <p className="mt-4 font-century text-[15px] font-bold text-[#0b1f4a]">{step.title}</p>
                <p className="mt-1 font-century text-[15px] leading-relaxed text-[#4a4a4a]">{step.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="mx-auto mt-16 max-w-7xl px-6 lg:px-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.6, ease: entryEase }}
      >
        <div className="rounded-lg bg-[#0b1f4a] px-8 py-8 text-white sm:flex sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: 0.08 }}
          >
            <h3 className="font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight">{banner.heading}</h3>
            <p className="mt-1 font-century text-[15px]">{banner.description}</p>
          </motion.div>
          <motion.div
            className="mt-5 flex flex-wrap items-center gap-6 sm:mt-0"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: 0.16 }}
          >
            <a
              href={`mailto:${banner.email}`}
              className="flex items-center gap-2 font-century text-[15px] font-medium transition-colors hover:text-[#d4531a]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" strokeLinecap="round" />
              </svg>
              {banner.email}
            </a>
            <a
              href={`tel:${banner.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 font-century text-[15px] font-medium transition-colors hover:text-[#d4531a]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {banner.phone}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-[#b8451a] px-5 py-2.5 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#963a16]"
            >
              {banner.buttonText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
