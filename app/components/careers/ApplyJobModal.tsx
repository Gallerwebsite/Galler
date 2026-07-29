"use client";

import { useRef, useState } from "react";
import type { CareersJob } from "@/app/lib/careers-data";

import { API_URL } from "@/app/lib/apiUrl";

interface ApplyJobModalProps {
  job: CareersJob | null;
  open: boolean;
  onClose: () => void;
}

export default function ApplyJobModal({ job, open, onClose }: ApplyJobModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setForm({ fullName: "", email: "", phone: "" });
    setResumeFile(null);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    if (!resumeFile) {
      setError("Please select your resume file.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("jobId", job.id);
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      payload.append("resume", resumeFile);

      const res = await fetch(`${API_URL}/api/careers/apply`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !job) return null;

  const inputClass =
    "w-full rounded-md border border-[#ddd] bg-white px-4 py-3 text-sm text-[#333] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#0b1f4a]";

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

        <p className="text-xs font-bold tracking-wider text-[#b8451a]">APPLY FOR THIS ROLE</p>
        <h2 className="mt-2 font-serif text-2xl tracking-[0.1em] text-[#0b1f4a]">{job.title}</h2>
        {job.descriptionPoints.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#4a4a4a]">
            {job.descriptionPoints.map((point, index) => (
              <li key={`apply-point-${index}`}>{point}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#666]">
          <span>{job.department}</span>
          <span>•</span>
          <span>{job.location}</span>
          <span>•</span>
          <span>{job.experience}</span>
          <span>•</span>
          <span>{job.type}</span>
        </div>

        {success ? (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-green-700">Application submitted successfully!</p>
            <p className="mt-1 text-sm text-green-600">Thank you for applying to Galler.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#555]">
                Full Name <span className="text-[#b8451a]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-[#555]">
                  Email <span className="text-[#b8451a]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[#555]">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-[#555]">
                Resume <span className="text-[#b8451a]">*</span>
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-md border border-[#0b1f4a] bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1f4a] transition-colors hover:bg-[#f8f9fa]"
                >
                  Choose File
                </button>
                <p className="truncate text-sm text-[#666]">
                  {resumeFile ? resumeFile.name : "PDF, DOC, or DOCX up to 5MB"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setResumeFile(file);
                  setError("");
                }}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-[#b8451a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#963a16] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-[#ddd] px-6 py-3 text-sm font-semibold text-[#4a4a4a] transition-colors hover:bg-[#f8f9fa]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
