"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import aboutImage from "@/Assets/about.jpg";
import CountUpNumber from "@/app/components/common/CountUpNumber";
import type { SiteContent } from "@/app/lib/getContent";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";
import LogoMarquee from "../home/LogoMarquee";

export interface AchievementStat {
  value: string;
  label: string;
  tone: "team" | "devices" | "clients" | "industries";
  backgroundImage?: string;
}

interface AboutAchievementsContactProps {
  heading?: string;
  stats?: AchievementStat[];
  formHeading?: string;
  submitText?: string;
  formBackgroundImage?: string;
  marquee?: SiteContent["marquee"];
}

const DEFAULT_STATS: AchievementStat[] = [
  { value: "450+", label: "Team Members", tone: "team" },
  { value: "300K+", label: "Devices Deployed", tone: "devices" },
  { value: "50+", label: "Happy Clients", tone: "clients" },
  { value: "6+", label: "Industries Worked", tone: "industries" },
];

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

export default function AboutAchievementsContact({
  heading = "ACHIEVEMENTS",
  stats = DEFAULT_STATS,
  formHeading = "How can we meet your requirement?",
  submitText = "SUBMIT",
  formBackgroundImage,
  marquee,
}: AboutAchievementsContactProps) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleFullNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, fullName: value.replace(/[^a-zA-Z]/g, "") }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phone: value.replace(/[^0-9]/g, "") }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ fullName: "", email: "", phone: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section>
      <div className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <TextAnimate
            as="h2"
            animation="slideRight"
            by="character"
            once
            duration={0.9}
            className="text-center font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-[#1a1a1a] md:text-[40px]"
          >
            {heading}
          </TextAnimate>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const bgImageSrc = stat.backgroundImage
                ? resolveUploadSrc(stat.backgroundImage)
                : aboutImage.src;

              return (
                <motion.div
                  key={stat.label}
                  className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-sm shadow-md"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{
                    duration: 0.55,
                    ease: entryEase,
                    delay: index * 0.1,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bgImageSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/55" />
                  <div className="relative z-10 px-6 py-10 text-center text-white">
                    <CountUpNumber
                      value={stat.value}
                      className="font-cinzel text-[30px] font-normal leading-none text-white"
                    />
                    <p className="mt-2 font-century text-[15px] text-white/90">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-[420px] sm:min-h-[480px]">
        {formBackgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${resolveUploadSrc(formBackgroundImage)})`,
              backgroundAttachment: "fixed",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#4a6a8a] via-[#2a4a6a] to-[#1a3050]" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
        <div
          className="absolute bottom-0 right-0 top-0 w-[55%] bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.2)_100%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-center px-6 py-14 sm:min-h-[480px] sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <motion.h3
              className="font-century text-[30px] font-normal leading-[1.08] text-white"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.6, ease: entryEase }}
            >
              {formHeading}
            </motion.h3>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.08 }}
              >
                <label htmlFor="fullName" className="font-century text-[15px] text-white/90">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  inputMode="text"
                  autoComplete="name"
                  className="mt-2 w-full border-0 border-b border-white/80 bg-transparent pb-2 font-century text-[15px] text-white outline-none placeholder:text-white/40 focus:border-white"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.18 }}
              >
                <label htmlFor="email" className="font-century text-[15px] text-white/90">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                  className="mt-2 w-full border-0 border-b border-white/80 bg-transparent pb-2 font-century text-[15px] text-white outline-none placeholder:text-white/40 focus:border-white"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.28 }}
              >
                <label htmlFor="phone" className="font-century text-[15px] text-white/90">
                  Contact Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  className="mt-2 w-full border-0 border-b border-white/80 bg-transparent pb-2 font-century text-[15px] text-white outline-none placeholder:text-white/40 focus:border-white"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: 0.35 }}
              >
                <button
                  type="submit"
                  className="mt-4 border border-white px-10 py-2.5 font-century text-[15px] font-medium text-white transition-colors hover:bg-white hover:text-[#1a3050]"
                >
                  {submitted ? "SENT" : submitText}
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>

      <LogoMarquee content={marquee} />
    </section>
  );
}
