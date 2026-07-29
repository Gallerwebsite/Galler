"use client";

import { useState } from "react";
import { API_URL } from "@/app/lib/apiUrl";

interface StartProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function StartProjectModal({ open, onClose }: StartProjectModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

        <p className="text-xs font-bold tracking-wider text-[#b8451a]">START A PROJECT</p>
        <h2 className="mt-2 font-cinzel text-2xl tracking-tight text-[#0b1f4a]">Tell us about your project</h2>
        <p className="mt-2 font-century text-sm leading-relaxed text-[#4a4a4a]">
          Share a few details and our team will get back to you.
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
              <label htmlFor="start-project-fullName" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Full Name *
              </label>
              <input
                id="start-project-fullName"
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
              <label htmlFor="start-project-companyName" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Company Name *
              </label>
              <input
                id="start-project-companyName"
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
              <label htmlFor="start-project-email" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Email Address *
              </label>
              <input
                id="start-project-email"
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
              <label htmlFor="start-project-phone" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Phone Number
              </label>
              <input
                id="start-project-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="start-project-subject" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Subject *
              </label>
              <input
                id="start-project-subject"
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
              <label htmlFor="start-project-details" className="mb-1.5 block font-century text-xs font-semibold tracking-wide text-[#666] uppercase">
                Details *
              </label>
              <textarea
                id="start-project-details"
                name="details"
                required
                rows={4}
                value={form.details}
                onChange={handleChange}
                className={`${inputClass} resize-y`}
                placeholder="Describe your project requirements"
              />
            </div>

            {error ? <p className="font-century text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#b8451a] px-6 py-3 font-century text-[15px] font-semibold text-white transition-colors hover:bg-[#d4531a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
