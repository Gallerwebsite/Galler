"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/app/lib/apiUrl";

interface WorkWithUsQueryModalProps {
  open: boolean;
  workType: string;
  onClose: () => void;
}

export default function WorkWithUsQueryModal({ open, workType, onClose }: WorkWithUsQueryModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    subject: "",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      subject: workType ? `${workType} Inquiry` : "",
      details: "",
    });
    setError("");
    setSuccess(false);
  }, [open, workType]);

  const resetForm = () => {
    setForm({
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      subject: "",
      details: "",
    });
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phone: value.replace(/[^0-9]/g, "") }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/work-with-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workType }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full rounded-md border border-[#ddd] bg-white px-4 py-3 font-century text-[15px] text-[#333] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#0b1f4a]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-label="Close modal"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#666] transition-colors hover:text-[#0b1f4a]"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <p className="text-xs font-bold tracking-wider text-[#0099E1]">WORK WITH US</p>
        <h2 className="mt-2 font-cinzel text-2xl tracking-tight text-[#0b1f4a]">
          {workType ? `${workType} inquiry` : "Submit your query"}
        </h2>
        <p className="mt-2 font-century text-sm leading-relaxed text-[#4a4a4a]">
          Tell us about your requirements and our team will get back to you.
        </p>

        {success ? (
          <div className="mt-8 rounded-lg bg-green-50 px-4 py-6 text-center">
            <p className="font-century text-sm font-medium text-green-700">
              Thank you! Your inquiry was submitted successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="work-with-us-fullName" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Full Name *
              </label>
              <input
                id="work-with-us-fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="work-with-us-companyName" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Company Name *
              </label>
              <input
                id="work-with-us-companyName"
                name="companyName"
                type="text"
                required
                value={form.companyName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Your company name"
              />
            </div>

            <div>
              <label htmlFor="work-with-us-email" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Email Address *
              </label>
              <input
                id="work-with-us-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="work-with-us-phone" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Phone Number
              </label>
              <input
                id="work-with-us-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="work-with-us-subject" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Subject *
              </label>
              <input
                id="work-with-us-subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange}
                className={inputClass}
                placeholder="Brief subject"
              />
            </div>

            <div>
              <label htmlFor="work-with-us-details" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Details *
              </label>
              <textarea
                id="work-with-us-details"
                name="details"
                required
                rows={4}
                value={form.details}
                onChange={handleChange}
                className={`${inputClass} resize-y`}
                placeholder="Describe your requirements"
              />
            </div>

            {error ? <p className="font-century text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#0099E1] px-6 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#0088cc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Query"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
