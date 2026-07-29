"use client";

import { motion } from "framer-motion";
import gImage from "@/Assets/G.png";

interface AboutSectionTwoProps {
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const DEFAULT_TITLE = "WE PUT OUR CLIENT'S REQUIREMENTS IN THE FOREFRONT.";
const DEFAULT_P1 =
  "We at Galler thrive on innovation and pushing the bounds of technology to solve our customers' most pressing challenges. We combine designing, developing, and manufacturing to produce leading product solutions.";
const DEFAULT_P2 =
  "Galler is a leading, end to end engineering solutions and product company. As a disruptive innovation company Galler navigates the business landscape via industry knowledge and digital capabilities.";

export default function AboutSectionTwo({
  title = DEFAULT_TITLE,
  paragraph1 = DEFAULT_P1,
  paragraph2 = DEFAULT_P2,
}: AboutSectionTwoProps) {
  return (
    <section className="bg-[#f2f2f2] py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-14 lg:px-10">
        <div className="lg:col-span-7">
          {/* <nav className="mb-8 text-sm text-[#7a7a7a]">
            <Link href="/" className="transition-colors hover:text-[#1a1a1a]">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span className="font-medium text-[#1a1a1a]">About Us</span>
          </nav> */}

          <motion.h2
            className="max-w-2xl font-cinzel text-[24px] font-normal text-black md:text-[30px]"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase }}
          >
            {title}
          </motion.h2>

          <div className="mt-6 max-w-2xl space-y-5">
            {[paragraph1, paragraph2].map((paragraph, index) => (
              <motion.p
                key={index}
                className="font-century text-[15px] leading-relaxed text-black"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{
                  duration: 0.6,
                  ease: entryEase,
                  delay: index * 0.12,
                }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:justify-self-center">
          <div className="relative h-52 w-52 sm:h-64 sm:w-64 md:h-72 md:w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gImage.src}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
