"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CountUpNumber from "@/app/components/common/CountUpNumber";
import type { SiteContent } from "@/app/lib/getContent";
import homeAboutGif from "@/public/home-about.gif";
import CharacterSlideHeading from "./CharacterSlideHeading";

type Props = { content?: SiteContent["about"] };

const DEFAULTS: SiteContent["about"] = {
  title: "ABOUT US",
  paragraph1:
    "Galler is India's leading industrial solution provider in the field of Electronics and Software. Founded in 1995, At present, it has more than 450 employees and more than 4 subsidiaries with business covering PAN India.",
  paragraph2:
    "The company focuses on the design, research and development, production of mechanical & Electro - mechanical Smart devices. It is one of the enterprises in India that focuses on the R&D of industrial electronics products. Rooted in care technology and focused on innovative applications in the industry, Galler provides customized solutions in retail, finance, petroleum, manufacturing, transportation and other industries.",
  stats: [
    { value: "200+", label: "Team Members" },
    { value: "100K", label: "Devices Deployed" },
    { value: "12+", label: "Happy Clients" },
    { value: "10+", label: "Industries Worked" },
  ],
  ctaText: "KNOW MORE",
};

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function SideGif({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={homeAboutGif.src}
      alt=""
      className={className}
      aria-hidden
    />
  );
}

export default function AboutSection({ content }: Props) {
  const c = { ...DEFAULTS, ...content, stats: content?.stats ?? DEFAULTS.stats };

  return (
    <section id="about" className="relative overflow-hidden bg-[#f6f6f6] pt-16 pb-16 sm:pb-20">
      <SideGif
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-52 w-auto -translate-x-[70%] object-contain sm:h-64 lg:h-80 xl:h-96"
      />
      <SideGif
        className="pointer-events-none absolute top-0 right-0 z-0 h-52 w-auto translate-x-[70%] object-contain sm:h-64 lg:h-80 xl:h-96"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <CharacterSlideHeading
          title={c.title}
          className="text-center font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-[#000000] md:text-[40px]"
        />

        <div className="mt-8 space-y-6 text-center sm:mt-10 md:mt-12">
          {[c.paragraph1, c.paragraph2].map((paragraph, index) => (
            <motion.p
              key={index}
              className="font-century text-[15px] leading-relaxed text-[#000]"
              initial={{ opacity: 0, x: -48 }}
              whileInView={{ opacity: 1, x: 0 }}
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

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-14 sm:gap-x-8 md:mt-16 md:grid-cols-4 md:gap-y-0">
          {c.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{
                duration: 0.55,
                ease: entryEase,
                delay: index * 0.1,
              }}
            >
              <CountUpNumber
                value={stat.value}
                className="font-cinzel text-[30px] font-normal leading-none text-[#0099E1]"
              />
              <p className="mt-2 font-century text-[18px] text-[#000000]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center sm:mt-14 md:mt-16">
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.1 }}
          >
            <Link
              href="/about"
              className="inline-flex min-w-[160px] items-center justify-center border border-[#0094df] px-10 py-3 text-sm font-medium tracking-wide text-[#000000] transition-colors hover:bg-[#6ec4e8]/10 sm:text-base"
            >
              {c.ctaText}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
