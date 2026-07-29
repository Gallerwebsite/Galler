"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { SiteContent } from "@/app/lib/getContent";
import { subscribeToNewsletter } from "@/app/lib/newsletterSubscribe";
import { TextAnimate } from "@/registry/magicui/text-animate";

type Props = { content?: SiteContent["footer"] };

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

const headingClassName = "font-cinzel text-[27px] font-normal leading-[1.08]";

function FooterHeading({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.h3
      className={headingClassName}
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay }}
    >
      {children}
    </motion.h3>
  );
}

function FooterPoint({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay }}
    >
      {children}
    </motion.div>
  );
}

function FooterSocialIcon({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay }}
    >
      {children}
    </motion.div>
  );
}

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const DEFAULTS: SiteContent["footer"] = {
  newsletter: {
    heading: "Stay Connected",
    description: "Join our newsletter for tips, updates, and project highlights—only the good stuff.",
  },
  contact: {
    address: "1238 Echo Ridge Blvd, Suite 400, San Francisco, CA 94103",
    phone: "+1 (415) 555-0167",
    email: "support@example.com",
  },
  social: {
    instagram: "#",
    linkedin: "#",
    youtube: "#",
  },
};

const socialLinks = [
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-12h4v2a4 4 0 0 1 4-4zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </svg>
    ),
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

function normalizeSocialUrl(url?: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "#") return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function Footer({ content }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const message = await subscribeToNewsletter(email, "footer");
      setFeedback(message);
      setEmail("");
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe.");
    } finally {
      setSubmitting(false);
    }
  };

  const legacySocial = content?.social as
    | (SiteContent["footer"]["social"] & { whatsapp?: string; twitter?: string })
    | undefined;

  const c: SiteContent["footer"] = {
    newsletter: { ...DEFAULTS.newsletter, ...content?.newsletter },
    contact: { ...DEFAULTS.contact, ...content?.contact },
    social: {
      instagram: content?.social?.instagram ?? DEFAULTS.social.instagram,
      linkedin: content?.social?.linkedin ?? legacySocial?.whatsapp ?? DEFAULTS.social.linkedin,
      youtube: content?.social?.youtube ?? legacySocial?.twitter ?? DEFAULTS.social.youtube,
    },
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black/90 text-white ">
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Newsletter */}
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <FooterHeading>{c.newsletter.heading}</FooterHeading>
            <FooterPoint delay={0.08}>
              <p className="font-century text-[14px] leading-relaxed text-gray-400">{c.newsletter.description}</p>
            </FooterPoint>
            <FooterPoint delay={0.16} className="w-full max-w-sm md:max-w-none">
              <form onSubmit={handleSubscribe} className="w-full">
                <div className="flex w-full overflow-hidden rounded-full border border-gray-600">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 outline-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-[#b8451a] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Subscribe"
                  >
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {error ? (
                  <p className="mt-2 text-left font-century text-[13px] text-red-400">{error}</p>
                ) : feedback ? (
                  <p className="mt-2 text-left font-century text-[13px] text-green-400">{feedback}</p>
                ) : null}
              </form>
            </FooterPoint>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <FooterHeading delay={0.05}>Links</FooterHeading>
            <nav className="flex flex-col items-center gap-3 md:items-start">
              {footerLinks.map((link, index) => (
                <FooterPoint key={link.label} delay={0.08 + index * 0.06}>
                  <Link
                    href={link.href}
                    className="font-century text-[14px] text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </FooterPoint>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <FooterHeading delay={0.1}>Contact info</FooterHeading>
            <div className="flex flex-col items-center gap-4 md:items-start">
              <FooterPoint delay={0.08} className="flex items-start justify-center gap-3 md:justify-start">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-[18px] w-[18px] shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="max-w-xs font-century text-[14px] leading-relaxed text-gray-400 md:max-w-none">{c.contact.address}</p>
              </FooterPoint>
              <FooterPoint delay={0.14} className="flex items-center justify-center gap-3 md:justify-start">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <p className="font-century text-[14px] text-gray-400">{c.contact.phone}</p>
              </FooterPoint>
              <FooterPoint delay={0.2} className="flex items-center justify-center gap-3 md:justify-start">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <p className="font-century text-[14px] text-gray-400">{c.contact.email}</p>
              </FooterPoint>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center gap-6">
            <FooterHeading delay={0.15}>Social media</FooterHeading>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((social, index) => {
                const href = normalizeSocialUrl(c.social[social.key]);
                const icon = (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition-colors group-hover:border-primary group-hover:text-primary">
                    {social.icon}
                  </span>
                );

                if (!href) {
                  return (
                    <FooterSocialIcon key={social.key} delay={0.08 + index * 0.08}>
                      <span
                        className="flex items-center"
                        aria-label={`${social.label} link not configured`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700 text-gray-600">
                          {social.icon}
                        </span>
                      </span>
                    </FooterSocialIcon>
                  );
                }

                return (
                  <FooterSocialIcon key={social.key} delay={0.08 + index * 0.08}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="group flex items-center transition-colors hover:text-primary"
                    >
                      {icon}
                    </a>
                  </FooterSocialIcon>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-gray-700 pt-8">
          <TextAnimate
            as="p"
            animation="slideRight"
            by="character"
            once
            duration={1.1}
            className="text-center font-century text-[16px] text-gray-400"
          >
            {`© ${new Date().getFullYear()} Galler. All rights reserved.`}
          </TextAnimate>
        </div>
      </div>
    </footer>
  );
}
