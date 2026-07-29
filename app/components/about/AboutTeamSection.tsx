"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import { TextAnimate } from "@/registry/magicui/text-animate";

export interface TeamMember {
  id: string;
  name: string;
  photo: string;
  title?: string;
  linkedin: string;
  instagram: string;
  description: string;
}

interface AboutTeamSectionProps {
  heading?: string;
  subtitle?: string;
  members?: TeamMember[];
}

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-12h4v2a4 4 0 0 1 4-4zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function normalizeUrl(url?: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getMemberTitle(member: TeamMember): string {
  if (member.title?.trim()) return member.title.trim();
  const desc = member.description?.trim() ?? "";
  if (desc && desc.length <= 100 && !desc.includes("\n")) return desc;
  return "";
}

function getMemberDescription(member: TeamMember): string {
  const desc = member.description?.trim() ?? "";
  if (!desc) return "";
  if (member.title?.trim()) return desc;
  const title = getMemberTitle(member);
  if (desc === title) return "";
  return desc;
}

export default function AboutTeamSection({
  heading = "OUR TEAM",
  subtitle,
  members = [],
}: AboutTeamSectionProps) {
  const visibleMembers = members.filter(
    (member) => member.name || member.photo || member.title || member.description
  );
  if (visibleMembers.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="text-center">
          <TextAnimate
            as="h2"
            animation="slideRight"
            by="character"
            once
            duration={0.9}
            className="font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-[#1a1a1a] md:text-[40px]"
          >
            {heading}
          </TextAnimate>
          {subtitle ? (
            <motion.p
              className="mx-auto mt-4 max-w-2xl font-century text-[20px] leading-relaxed text-[#555]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.6, ease: entryEase, delay: 0.15 }}
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
          {visibleMembers.map((member, memberIndex) => {
            const linkedinUrl = normalizeUrl(member.linkedin);
            const instagramUrl = normalizeUrl(member.instagram);
            const photoSrc = member.photo ? resolveUploadSrc(member.photo) : null;
            const memberTitle = getMemberTitle(member);
            const memberDescription = getMemberDescription(member);
            const socialLinks = [
              linkedinUrl
                ? {
                    key: "linkedin",
                    href: linkedinUrl,
                    label: `${member.name} on LinkedIn`,
                    icon: <LinkedInIcon />,
                  }
                : null,
              instagramUrl
                ? {
                    key: "instagram",
                    href: instagramUrl,
                    label: `${member.name} on Instagram`,
                    icon: <InstagramIcon />,
                  }
                : null,
            ].filter(Boolean) as Array<{
              key: string;
              href: string;
              label: string;
              icon: ReactNode;
            }>;

            return (
              <li key={member.id} className="flex flex-col items-center text-center">
                <motion.div
                  className="relative h-40 w-40 overflow-hidden rounded-full bg-[#eef1f5] shadow-md sm:h-44 sm:w-44"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.55, ease: entryEase, delay: memberIndex * 0.05 }}
                >
                  {photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoSrc}
                      alt={member.name || "Team member"}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#0b1f4a]/30">
                      {member.name?.charAt(0) || "?"}
                    </div>
                  )}
                </motion.div>

                {member.name ? (
                  <TextAnimate
                    as="h3"
                    animation="slideRight"
                    by="character"
                    once
                    duration={0.7}
                    delay={memberIndex * 0.05}
                    className="mt-5 font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight text-[#1a1a1a]"
                  >
                    {member.name}
                  </TextAnimate>
                ) : null}

                {memberTitle ? (
                  <motion.p
                    className="mt-2 font-century text-[15px] text-[#888]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{
                      duration: 0.5,
                      ease: entryEase,
                      delay: memberIndex * 0.05 + 0.06,
                    }}
                  >
                    {memberTitle}
                  </motion.p>
                ) : null}

                {socialLinks.length > 0 ? (
                  <div className="mt-3 flex items-center justify-center gap-3">
                    {socialLinks.map((social, index) => (
                      <motion.div
                        key={social.key}
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={viewport}
                        transition={{
                          duration: 0.55,
                          ease: entryEase,
                          delay: memberIndex * 0.05 + index * 0.08 + 0.1,
                        }}
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0b1f4a]/15 text-[#0b1f4a] transition-colors hover:border-[#0b1f4a] hover:bg-[#0b1f4a] hover:text-white"
                        >
                          {social.icon}
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {memberDescription ? (
                  <motion.p
                    className="mt-4 max-w-sm font-century text-[15px] leading-relaxed text-[#555]"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{
                      duration: 0.55,
                      ease: entryEase,
                      delay: memberIndex * 0.05 + 0.16,
                    }}
                  >
                    {memberDescription}
                  </motion.p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
