"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/Assets/logo.png";

const NAV_GRADIENT = "linear-gradient(49deg, #051c2c 32%, #051c2c 32%, #0a3e65 64%)";

const navLinks = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About Us", href: "/about" },
  { id: "our projects", label: "Our Projects", href: "/projects" },
  { id: "careers", label: "Careers", href: "/careers" },
  { id: "contact", label: "Contact", href: "/contact" },
];

const entryEase = [0.25, 0.1, 0.25, 1] as const;

export default function Navbar({
  activePage = "home",
}: {
  activePage?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
    <header
      className="fixed top-0 right-0 left-0 z-50 border-b border-white/10"
      style={{ background: NAV_GRADIENT }}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        {/* Logo */}
        <motion.div
          className="justify-self-start"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: entryEase }}
        >
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="Galler" className="h-20 w-auto" priority />
          </Link>
        </motion.div>

        {/* Desktop Nav — centered */}
        <nav className="hidden items-center justify-center gap-8 md:col-start-2 md:flex">
          {navLinks.map((link, index) => {
            const isActive = activePage === link.id;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.55,
                  ease: entryEase,
                  delay: 0.08 + index * 0.05,
                }}
              >
                <Link
                  href={link.href}
                  className={`font-century relative text-[15px] font-medium transition-colors hover:text-white ${
                    isActive ? "text-white" : "text-white/70"
                  }`}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--primary-orange)]" />
                  )}
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.div
          className="ml-auto md:col-start-3 md:ml-0 md:justify-self-end md:hidden"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: entryEase, delay: 0.08 }}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </motion.div>
      </div>
    </header>

    {/* Mobile Menu — slides in from right, full height below nav */}
    <div
      className={`fixed inset-x-0 top-20 z-40 h-[calc(100dvh-5rem)] md:hidden ${
        mobileOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white px-6 py-8 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-5">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-century flex items-center gap-2 text-[15px] font-medium transition-colors ${
                  isActive ? "text-[#1a1a1a]" : "text-gray-600"
                }`}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-orange)]" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
    </>
  );
}
