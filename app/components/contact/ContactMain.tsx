"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MdPhone } from "react-icons/md";
import { GoClock } from "react-icons/go";
import { IoLocationOutline, IoMailOutline } from "react-icons/io5";
import { API_URL } from "@/app/lib/apiUrl";

interface ContactInfoItem {
  label: string;
  lines: string[];
  hrefs?: (string | null)[];
}

interface ContactMainProps {
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  address?: string;
  businessHoursWeekday?: string;
  businessHoursWeekend?: string;
}

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Product Information",
  "Technical Support",
  "Partnership",
  "Careers",
  "Other",
];

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function ContactIcon({ type }: { type: "phone" | "email" | "location" | "clock" }) {
  const icons = {
    phone: MdPhone,
    email: IoMailOutline,
    location: IoLocationOutline,
    clock: GoClock,
  };
  const Icon = icons[type];

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e0d0] bg-[#faf6ef] text-[#0b1f4a]">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}

function InfoRow({ label, lines, hrefs, index }: ContactInfoItem & { index: number }) {
  return (
    <motion.div
      className="flex gap-4 border-b border-[#e5e5e5] py-6 first:pt-0 last:border-b-0"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: entryEase, delay: index * 0.08 }}
    >
      <ContactIcon
        type={
          label === "PHONE"
            ? "phone"
            : label === "EMAIL"
              ? "email"
              : label === "CORPORATE OFFICE"
                ? "location"
                : "clock"
        }
      />
      <div>
        <p className="font-century text-[15px] font-bold tracking-wide text-[#000]">{label}</p>
        <div className="mt-2 space-y-1">
          {lines.map((line, i) => {
            const href = hrefs?.[i];
            if (href) {
              return (
                <a
                  key={line}
                  href={href}
                  className="block font-century text-[15px] text-[#4a4a4a] transition-colors hover:text-[#0b1f4a]"
                >
                  {line}
                </a>
              );
            }
            return (
              <p key={line} className="font-century text-[15px] text-[#4a4a4a]">
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactMain({
  phone1 = "+91 120 456 7890",
  phone2 = "+91 120 456 7891",
  email1 = "info@gallerindia.com",
  email2 = "sales@gallerindia.com",
  address = "Plot No. 620, Sector 8 Rd, Sector 8, IMT Manesar, Gurugram, Haryana 122050, India",
  businessHoursWeekday = "Mon – Fri : 9:00 AM – 6:00 PM",
  businessHoursWeekend = "Sat – Sun : Closed",
}: ContactMainProps) {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      setForm({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-[#ddd] bg-white px-4 py-3 font-century text-[15px] text-[#333] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#0b1f4a]";

  const contactItems: ContactInfoItem[] = [
    {
      label: "PHONE",
      lines: [phone1, phone2],
      hrefs: [`tel:${phone1.replace(/\s/g, "")}`, `tel:${phone2.replace(/\s/g, "")}`],
    },
    {
      label: "EMAIL",
      lines: [email1, email2],
      hrefs: [`mailto:${email1}`, `mailto:${email2}`],
    },
    {
      label: "CORPORATE OFFICE",
      lines: [address],
    },
    {
      label: "BUSINESS HOURS",
      lines: [businessHoursWeekday, businessHoursWeekend],
    },
  ];

  return (
    <section className="bg-[#f5f5f5] py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-0 lg:px-10">
        {/* Get In Touch */}
        <div className="lg:border-r lg:border-[#e0e0e0] lg:pr-14">
          <motion.h2
            className="font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight text-[#000]"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase }}
          >
            GET IN TOUCH
          </motion.h2>
          <div className="mt-8">
            {contactItems.map((item, index) => (
              <InfoRow key={item.label} {...item} index={index} />
            ))}
          </div>
        </div>

        {/* Send Us A Message */}
        <div className="lg:pl-14">
          <motion.h2
            className="font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight text-[#000]"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase }}
          >
            SEND US A MESSAGE
          </motion.h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: 0.08 }}
            >
              <div>
                <label className="mb-1.5 block font-century text-[15px] text-[#555]">
                  Full Name <span className="text-[#b8451a]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-century text-[15px] text-[#555]">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: 0.16 }}
            >
              <div>
                <label className="mb-1.5 block font-century text-[15px] text-[#555]">
                  Email Address <span className="text-[#b8451a]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-century text-[15px] text-[#555]">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: 0.24 }}
            >
              <label className="mb-1.5 block font-century text-[15px] text-[#555]">
                Subject <span className="text-[#b8451a]">*</span>
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: 0.32 }}
            >
              <label className="mb-1.5 block font-century text-[15px] text-[#555]">
                Your Message <span className="text-[#b8451a]">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </motion.div>

            {error ? (
              <p className="font-century text-[15px] text-red-600">{error}</p>
            ) : null}

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: 0.4 }}
            >
              <button
              type="submit"
              disabled={submitting}
              className="group inline-flex items-center rounded-md bg-[#0b1f4a] px-8 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#0a1840] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitted ? "MESSAGE SENT!" : submitting ? "SENDING..." : "SEND MESSAGE"}
              {!submitted && !submitting ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 shrink-0 origin-center translate-x-2 rotate-0 text-[#b8451a] transition-transform duration-300 ease-out group-hover:translate-x-3 group-hover:rotate-[45deg]"
                  aria-hidden
                >
                  <path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </section>
  );
}
