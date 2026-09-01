"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MARQUEE_LOGOS_PER_ROW,
  MARQUEE_ROW_COUNT,
  MARQUEE_RECOMMENDED_HEIGHT,
  MARQUEE_RECOMMENDED_WIDTH,
  MARQUEE_SLOT_CLASS,
  MARQUEE_SLOT_DISPLAY_HEIGHT,
  MARQUEE_SLOT_DISPLAY_WIDTH,
  normalizeMarqueeAdminState,
} from "@/app/lib/marquee-config";
import { enrichCareersJob } from "@/app/lib/careers-data";
import { adminFetch, adminUpload } from "@/app/lib/adminApi";

import { API_URL } from "@/app/lib/apiUrl";

/* ─── Sidebar structure ───────────────────────────────────────────────── */
type SidebarGroup = {
  label: string;
  items: { label: string; id: string }[];
};

const sidebarGroups: SidebarGroup[] = [
  { label: "Homepage", items: [{ label: "Hero Section", id: "home-hero" }, { label: "About Section", id: "home-about" }, { label: "Our Services Section", id: "home-our-services" }, { label: "Industries Section", id: "home-industries" }, { label: "Work With Us Section", id: "home-work-with-us" }, { label: "Work With Us Queries", id: "work-with-us-submissions" }, { label: "Certificates Section", id: "home-certificates" }, { label: "Logo Marquee", id: "home-marquee" }] },
  { label: "Industries", items: [{ label: "Industries & Products", id: "industries-details" }] },
  { label: "Projects Page", items: [{ label: "Hero Section", id: "projects-hero" }, { label: "Start Project Submissions", id: "project-submissions" }] },
  { label: "About Page", items: [{ label: "Hero Section", id: "about-hero-content" }, { label: "Intro Section", id: "about-intro-section" }, { label: "Journey Timeline", id: "about-journey-timeline" }, { label: "Dimensions", id: "about-dimensions" }, { label: "Our Team", id: "about-team" }, { label: "Achievements", id: "about-achievements" }, { label: "Requirement Form", id: "about-requirement" }] },
  { label: "Contact Page", items: [{ label: "Contact Info", id: "contact" }, { label: "Form Submissions", id: "contact-submissions" }] },
  { label: "Careers Page", items: [{ label: "Hero Section", id: "careers-hero" }, { label: "Why Work at Galler", id: "careers-why-work" }, { label: "Life at Galler", id: "careers-life" }, { label: "Openings Sidebar", id: "careers-openings-sidebar" }, { label: "Hiring Process", id: "careers-hiring" }, { label: "Job Openings", id: "careers-jobs" }, { label: "General Resumes", id: "careers-resumes" }, { label: "Job Applications", id: "careers-applications" }] },
  { label: "Footer", items: [{ label: "Footer Content", id: "footer" }, { label: "Newsletter Subscribers", id: "newsletter-subscribers" }, { label: "Send Newsletter", id: "newsletter-send" }] },
];

/* ─── Types ───────────────────────────────────────────────────────────── */
type ContentData = Record<string, Record<string, unknown>>;

interface ContactSubmission {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface ProjectSubmission {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  subject: string;
  details: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface WorkWithUsSubmission {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  subject: string;
  details: string;
  workType: string;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface ResumeSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  resumeFileName: string;
  resumeOriginalName: string;
  resumeSize: number;
  read: boolean;
  createdAt: string;
}

interface CareersJobData {
  id: string;
  title: string;
  descriptionPoints: string[];
  location: string;
  experience: string;
  type: "Full Time" | "PPO";
  category: "engineering" | "sales" | "operations" | "manufacturing" | "support";
  department: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  jobCategory: string;
  jobLocation: string;
  jobExperience: string;
  jobType: string;
  fullName: string;
  email: string;
  phone: string;
  resumeFileName: string;
  resumeOriginalName: string;
  resumeSize: number;
  read: boolean;
  createdAt: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface NewsletterCampaign {
  id: string;
  subject: string;
  bodyPreview: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  emailConfigured?: boolean;
  note?: string;
  createdAt: string;
}

const JOB_CATEGORY_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales & Marketing" },
  { value: "operations", label: "Operations" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "support", label: "Support" },
] as const;

const JOB_TYPE_OPTIONS = ["Full Time", "PPO"] as const;

function formatNewsletterSource(source: string): string {
  if (source === "careers-talent-network") return "Careers — Talent Network";
  if (source === "footer") return "Footer";
  return source;
}

const emptyJob = (): CareersJobData => ({
  id: "",
  title: "",
  descriptionPoints: [""],
  location: "",
  experience: "",
  type: "Full Time",
  category: "engineering",
  department: "Engineering",
});

/* ─── Main component ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [content, setContent] = useState<ContentData>({});
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [workWithUsSubmissions, setWorkWithUsSubmissions] = useState<WorkWithUsSubmission[]>([]);
  const [resumeSubmissions, setResumeSubmissions] = useState<ResumeSubmission[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [careersJobs, setCareersJobs] = useState<CareersJobData[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterCampaigns, setNewsletterCampaigns] = useState<NewsletterCampaign[]>([]);
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterSendMessage, setNewsletterSendMessage] = useState("");
  const [newsletterSendError, setNewsletterSendError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [selectedProjectSubmission, setSelectedProjectSubmission] = useState<ProjectSubmission | null>(null);
  const [selectedWorkWithUsSubmission, setSelectedWorkWithUsSubmission] = useState<WorkWithUsSubmission | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeSubmission | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [editingJob, setEditingJob] = useState<CareersJobData | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingMarqueeId, setUploadingMarqueeId] = useState<string | null>(null);
  const [uploadingCertificateId, setUploadingCertificateId] = useState<string | null>(null);
  const [uploadingStatIndex, setUploadingStatIndex] = useState<number | null>(null);
  const [uploadingAboutHeroImage, setUploadingAboutHeroImage] = useState(false);
  const [uploadingContactHeroImage, setUploadingContactHeroImage] = useState(false);
  const [uploadingPlantIndex, setUploadingPlantIndex] = useState<number | null>(null);
  const [uploadingCareersHeroImage, setUploadingCareersHeroImage] = useState(false);
  const [uploadingCareersGalleryIndex, setUploadingCareersGalleryIndex] = useState<number | null>(null);
  const [uploadingIndustryIndex, setUploadingIndustryIndex] = useState<number | null>(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("");
  const [uploadingProductImageKey, setUploadingProductImageKey] = useState<string | null>(null);
  const [uploadingProductGalleryKey, setUploadingProductGalleryKey] = useState<string | null>(null);
  const [uploadingProductDocumentKey, setUploadingProductDocumentKey] = useState<string | null>(null);
  const [uploadingRequirementBg, setUploadingRequirementBg] = useState(false);
  const [uploadingJourneyBg, setUploadingJourneyBg] = useState(false);
  const [uploadingTeamMemberIndex, setUploadingTeamMemberIndex] = useState<number | null>(null);
  const [uploadingProjectsHeroImage, setUploadingProjectsHeroImage] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState<Record<string, boolean>>({
    Homepage: true,
    Industries: true,
    "Projects Page": false,
    "About Page": false,
    "Contact Page": false,
    "Careers Page": false,
    Footer: false,
  });

  const fetchContactSubmissions = useCallback(async () => {
    try {
      const res = await adminFetch("/api/contact");
      if (res.ok) setContactSubmissions(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch contact submissions");
      }
    }
  }, []);

  const fetchProjectSubmissions = useCallback(async () => {
    try {
      const res = await adminFetch("/api/projects");
      if (res.ok) setProjectSubmissions(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch project submissions");
      }
    }
  }, []);

  const fetchWorkWithUsSubmissions = useCallback(async () => {
    try {
      const res = await adminFetch("/api/work-with-us");
      if (res.ok) setWorkWithUsSubmissions(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch work with us submissions");
      }
    }
  }, []);

  const fetchResumeSubmissions = useCallback(async () => {
    try {
      const res = await adminFetch("/api/careers/resumes");
      if (res.ok) setResumeSubmissions(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch resume submissions");
      }
    }
  }, []);

  const fetchJobApplications = useCallback(async () => {
    try {
      const res = await adminFetch("/api/careers/applications");
      if (res.ok) setJobApplications(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch job applications");
      }
    }
  }, []);

  const fetchCareersJobs = useCallback(async () => {
    try {
      const res = await adminFetch("/api/careers/jobs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCareersJobs(data.map(enrichCareersJob));
        }
      }
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch careers jobs");
      }
    }
  }, []);

  const fetchNewsletterSubscribers = useCallback(async () => {
    try {
      const res = await adminFetch("/api/newsletter/subscribers");
      if (res.ok) setNewsletterSubscribers(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch newsletter subscribers");
      }
    }
  }, []);

  const fetchNewsletterCampaigns = useCallback(async () => {
    try {
      const res = await adminFetch("/api/newsletter/campaigns");
      if (res.ok) setNewsletterCampaigns(await res.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch newsletter campaigns");
      }
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const contentRes = await adminFetch("/api/content");
      if (contentRes.ok) setContent(await contentRes.json());
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    adminFetch("/api/auth/verify", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return fetchAll();
      })
      .catch(() => {
        router.replace(`/admin/login?redirect=${encodeURIComponent("/admin")}`);
      });
  }, [router, fetchAll]);

  useEffect(() => {
    if (activeSection === "contact-submissions") {
      fetchContactSubmissions();
    }
  }, [activeSection, fetchContactSubmissions]);

  useEffect(() => {
    if (activeSection === "project-submissions") {
      fetchProjectSubmissions();
    }
  }, [activeSection, fetchProjectSubmissions]);

  useEffect(() => {
    if (activeSection === "work-with-us-submissions") {
      fetchWorkWithUsSubmissions();
    }
  }, [activeSection, fetchWorkWithUsSubmissions]);

  useEffect(() => {
    if (activeSection === "careers-resumes") {
      fetchResumeSubmissions();
    }
  }, [activeSection, fetchResumeSubmissions]);

  useEffect(() => {
    if (activeSection === "careers-applications") {
      fetchJobApplications();
    }
  }, [activeSection, fetchJobApplications]);

  useEffect(() => {
    if (activeSection === "careers-jobs") {
      fetchCareersJobs();
    }
  }, [activeSection, fetchCareersJobs]);

  useEffect(() => {
    if (activeSection === "newsletter-subscribers") {
      fetchNewsletterSubscribers();
    }
  }, [activeSection, fetchNewsletterSubscribers]);

  useEffect(() => {
    if (activeSection === "newsletter-send") {
      fetchNewsletterSubscribers();
      fetchNewsletterCampaigns();
    }
  }, [activeSection, fetchNewsletterSubscribers, fetchNewsletterCampaigns]);

  const markSubmissionRead = async (id: string) => {
    const res = await adminFetch(`/api/contact/${id}/read`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated = await res.json();
      setContactSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedSubmission(updated);
    }
  };

  const markProjectSubmissionRead = async (id: string) => {
    const res = await adminFetch(`/api/projects/${id}/read`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated = await res.json();
      setProjectSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedProjectSubmission(updated);
    }
  };

  const markWorkWithUsSubmissionRead = async (id: string) => {
    const res = await adminFetch(`/api/work-with-us/${id}/read`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated = await res.json();
      setWorkWithUsSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedWorkWithUsSubmission(updated);
    }
  };

  const removeNewsletterSubscriber = async (id: string) => {
    if (!window.confirm("Remove this subscriber from the list?")) return;

    const res = await adminFetch(`/api/newsletter/subscribers/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setNewsletterSubscribers((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Failed to remove subscriber.");
    }
  };

  const sendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterBody.trim()) {
      setNewsletterSendError("Subject and message are required.");
      return;
    }

    const activeCount = newsletterSubscribers.filter((item) => item.status === "active").length;
    if (activeCount === 0) {
      setNewsletterSendError("There are no active subscribers to send to.");
      return;
    }

    if (
      !window.confirm(
        `Send this newsletter to ${activeCount} active subscriber${activeCount === 1 ? "" : "s"}?`
      )
    ) {
      return;
    }

    setNewsletterSending(true);
    setNewsletterSendError("");
    setNewsletterSendMessage("");

    try {
      const res = await adminFetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newsletterSubject.trim(),
          body: newsletterBody.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to send newsletter.");
      }

      setNewsletterSendMessage(data.message || "Newsletter sent.");
      setNewsletterSubject("");
      setNewsletterBody("");
      await fetchNewsletterCampaigns();
    } catch (err) {
      setNewsletterSendError(err instanceof Error ? err.message : "Failed to send newsletter.");
    } finally {
      setNewsletterSending(false);
    }
  };

  const markResumeRead = async (id: string) => {
    const res = await adminFetch(`/api/careers/resumes/${id}/read`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated = await res.json();
      setResumeSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedResume(updated);
    }
  };

  const downloadResume = async (id: string, fileName: string) => {
    const res = await adminFetch(`/api/careers/resumes/${id}/download`);
    if (!res.ok) {
      alert("Failed to download resume.");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadJobApplication = async (id: string, fileName: string) => {
    const res = await adminFetch(`/api/careers/applications/${id}/download`);
    if (!res.ok) {
      alert("Failed to download resume.");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const markApplicationRead = async (id: string) => {
    const res = await adminFetch(`/api/careers/applications/${id}/read`, {
      method: "PATCH",
    });
    if (res.ok) {
      const updated = await res.json();
      setJobApplications((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelectedApplication(updated);
    }
  };

  const saveCareersJob = async (job: CareersJobData) => {
    const descriptionPoints = job.descriptionPoints.map((point) => point.trim()).filter(Boolean);
    if (descriptionPoints.length === 0) {
      alert("Please add at least one description point.");
      return;
    }

    const { description: _legacyDescription, ...jobWithoutLegacyDescription } =
      job as CareersJobData & { description?: string };
    const payload = { ...jobWithoutLegacyDescription, descriptionPoints };
    const isNew = !job.id;
    const res = await adminFetch(
      isNew ? "/api/careers/jobs" : `/api/careers/jobs/${job.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Failed to save job opening.");
      return;
    }
    await fetchCareersJobs();
    setEditingJob(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteCareersJob = async (id: string) => {
    if (!confirm("Delete this job opening?")) return;
    const res = await adminFetch(`/api/careers/jobs/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Failed to delete job opening.");
      return;
    }
    await fetchCareersJobs();
    if (editingJob?.id === id) setEditingJob(null);
  };

  /* ── Save ── */
  const validateHomeIndustriesBeforeSave = (): string | null => {
    type GalleryItem = { src?: string };
    type Product = { name: string; gallery?: GalleryItem[] };
    type Industry = { name: string; products?: Product[] };

    const items = ((content.homeIndustries as Record<string, unknown>)?.items as Industry[]) ?? [];

    for (const industry of items) {
      for (const product of industry.products ?? []) {
        const hasEmptyAngle = (product.gallery ?? []).some((item) => !item.src?.trim());
        if (hasEmptyAngle) {
          return `Upload an image or remove empty gallery angles for "${product.name}" in ${industry.name.trim()}.`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (activeSection === "home-industries" || activeSection === "industries-details") {
      const validationError = validateHomeIndustriesBeforeSave();
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    
    setSaving(true);
    try {
      if (activeSection === "home-hero") await saveContentSection("hero");
      else if (activeSection === "home-about") await saveContentSection("about");
      else if (activeSection === "home-our-services") await saveContentSection("homeServices");
      else if (activeSection === "home-industries") await saveContentSection("homeIndustries");
      else if (activeSection === "home-work-with-us") await saveContentSection("homeWorkWithUs");
      else if (activeSection === "home-certificates") await saveContentSection("homeCertificates");
      else if (activeSection === "industries-details") await saveContentSection("homeIndustries");
      else if (activeSection === "projects-hero") await saveContentSection("projectsPage");
      else if (activeSection === "home-marquee") await saveContentSection("marquee");
      else if (activeSection === "about-hero-content") await saveContentSection("about");
      else if (activeSection.startsWith("about-")) await saveContentSection("aboutPage");
      else if (activeSection === "contact") await saveContentSection("contactPage");
      else if (activeSection.startsWith("careers-") && !["careers-jobs", "careers-resumes", "careers-applications"].includes(activeSection)) await saveContentSection("careersPage");
      else if (activeSection === "footer") await saveContentSection("footer");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const saveContentSection = async (section: string) => {
    await adminFetch(`/api/content/${section}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content[section]),
    });
  };

  const handleLogout = async () => {
    await adminFetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  /* ── Field helpers ── */
  const updateField = (section: string, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateNestedField = (section: string, path: string[], value: string) => {
    setContent((prev) => {
      const sectionData = { ...(prev[section] as Record<string, unknown>) };
      let cursor: Record<string, unknown> = sectionData;
      for (let i = 0; i < path.length - 1; i++) {
        cursor[path[i]] = { ...(cursor[path[i]] as Record<string, unknown>) };
        cursor = cursor[path[i]] as Record<string, unknown>;
      }
      cursor[path[path.length - 1]] = value;
      return { ...prev, [section]: sectionData };
    });
  };

  const renderField = (section: string, field: string, label: string, multiline = false, nested?: string[]) => {
    const fieldKey = `${section}.${field}`;
    const isEditing = editingField === fieldKey;
    let value: string;
    if (nested) {
      let cursor: unknown = content[section];
      for (const k of nested) cursor = (cursor as Record<string, unknown>)?.[k];
      value = String(cursor ?? "");
    } else {
      value = String(content[section]?.[field] ?? "");
    }

    const handleChange = (v: string) => {
      if (nested) updateNestedField(section, nested, v);
      else updateField(section, field, v);
    };

    return (
      <div key={fieldKey} className="flex min-w-0 flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</label>
          <button onClick={() => setEditingField(isEditing ? null : fieldKey)} className="shrink-0 text-xs font-medium text-[var(--primary-orange)] hover:underline">
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
        {isEditing ? (
          multiline ? (
            <textarea value={value} onChange={(e) => handleChange(e.target.value)} rows={3} className="w-full min-w-0 max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm break-all text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" />
          ) : (
            <input type="text" value={value} onChange={(e) => handleChange(e.target.value)} className="w-full min-w-0 max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" />
          )
        ) : (
          <p className="text-sm leading-relaxed break-all text-[#1a1a1a]">{value || "—"}</p>
        )}
      </div>
    );
  };

  const renderImageUpload = (label: string, section: string, field: string) => {
    const currentImage = String(content[section]?.[field] ?? "");
    return (
      <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentImage} alt={label} className="mx-auto mb-2 h-24 w-24 rounded-lg object-cover" />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="mx-auto">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
    );
  };

  const isManagedMediaUrl = (url: string) =>
    Boolean(url) &&
    (url.startsWith("/uploads/") || url.includes("ik.imagekit.io"));

  /** Deletes a file from ImageKit or local uploads. Returns false only on hard failure. */
  const deleteManagedMedia = async (
    url: string,
    options: { alertOnError?: boolean } = {}
  ): Promise<boolean> => {
    if (!isManagedMediaUrl(url)) return true;

    const res = await adminFetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (options.alertOnError !== false) {
        alert(data?.message || "Failed to delete file from storage");
      }
      return false;
    }
    return true;
  };

  const uploadImage = async (file: File, replaceUrl?: string): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await adminUpload("/api/upload", formData);

    const data = (await res.json().catch(() => null)) as { url?: string; message?: string } | null;
    if (!res.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    if (!data?.url) {
      throw new Error("Upload failed — no file URL returned");
    }
    if (replaceUrl && replaceUrl !== data.url) {
      await deleteManagedMedia(replaceUrl, { alertOnError: false });
    }
    return data.url;
  };

  const uploadDocument = async (
    file: File,
    replaceUrl?: string
  ): Promise<{ url: string; fileName: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await adminUpload("/api/upload/document", formData);

    const data = (await res.json().catch(() => null)) as {
      url?: string;
      fileName?: string;
      message?: string;
    } | null;
    if (!res.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    if (!data?.url) {
      throw new Error("Upload failed — no file URL returned");
    }
    if (replaceUrl && replaceUrl !== data.url) {
      await deleteManagedMedia(replaceUrl, { alertOnError: false });
    }
    return { url: data.url, fileName: data.fileName || file.name };
  };

  const uploadMarqueeLogo = uploadImage;

  const persistMarqueeRows = async (row1: { id: string; src: string; alt: string }[], row2: { id: string; src: string; alt: string }[]) => {
    const res = await adminFetch("/api/content/marquee", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row1, row2 }),
    });

    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    if (!res.ok) {
      throw new Error(data?.message || "Failed to save marquee logos");
    }

    setContent((prev) => ({ ...prev, marquee: { row1, row2 } }));
  };

  const uploadHeroVideo = async (file: File, replaceUrl?: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("video", file);
    const res = await adminUpload("/api/upload/video", formData);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      alert(data?.message || "Video upload failed");
      return null;
    }
    const data = (await res.json()) as { url: string };
    if (replaceUrl && replaceUrl !== data.url) {
      await deleteManagedMedia(replaceUrl, { alertOnError: false });
    }
    return data.url;
  };

  const deleteHeroVideo = async (url: string): Promise<boolean> => {
    if (!(await deleteManagedMedia(url))) return false;
    updateField("hero", "videoUrl", "/videos/home-video.mp4");
    return true;
  };

  const resolvePreviewSrc = (src: string) => {
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
    return src;
  };

  /* ─── Section renderers ────────────────────────────────────────────── */

  const renderHomeHero = () => {
    const videoUrl = String(content.hero?.videoUrl ?? "/videos/home-video.mp4");

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Hero Section</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Background Video</p>
            <p className="text-xs text-gray-500">
              MP4, WebM, or MOV. Max 100MB. The video loops automatically on the homepage hero.
            </p>
            <div className="overflow-hidden rounded-lg bg-black">
              <video
                key={videoUrl}
                src={resolvePreviewSrc(videoUrl)}
                controls
                muted
                playsInline
                className="aspect-video w-full max-h-48 object-cover"
              />
            </div>
            <p className="truncate text-xs text-gray-400">{videoUrl}</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Upload video
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadHeroVideo(file, videoUrl);
                    if (!url) return;
                    updateField("hero", "videoUrl", url);
                    e.target.value = "";
                  }}
                />
              </label>
              {isManagedMediaUrl(videoUrl) && (
                <button
                  type="button"
                  title="Delete video"
                  aria-label="Delete video"
                  onClick={async () => {
                    if (!confirm("Delete this video and revert to the default?")) return;
                    await deleteHeroVideo(videoUrl);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700">Hero Heading</h3>
            <p className="text-xs text-gray-500">
              Line 1 and Line 2 appear as separate rows in the homepage hero, centered over the video.
            </p>
            {renderField("hero", "headingLine1", "Line 1")}
            {renderField("hero", "headingLine2", "Line 2")}
          </div>
        </div>
      </div>
    );
  };

  const renderHomeAbout = () => {
    const stats = ((content.about as Record<string, unknown>)?.stats as { value: string; label: string }[]) ?? [];

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Section</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("about", "title", "Section Title")}
          {renderField("about", "paragraph1", "Paragraph 1", true)}
          {renderField("about", "paragraph2", "Paragraph 2", true)}
          {renderField("about", "ctaText", "CTA Button Text")}
          <hr className="border-gray-100" />
          <h3 className="text-sm font-semibold text-gray-700">Stats</h3>
          {stats.map((stat, i) => (
            <div key={i} className="flex gap-3">
              <input
                className="w-1/3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={stat.value}
                placeholder="Value"
                onChange={(e) => {
                  const newStats = [...stats];
                  newStats[i] = { ...newStats[i], value: e.target.value };
                  setContent((p) => ({ ...p, about: { ...(p.about as Record<string, unknown>), stats: newStats } }));
                }}
              />
              <input
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={stat.label}
                placeholder="Label"
                onChange={(e) => {
                  const newStats = [...stats];
                  newStats[i] = { ...newStats[i], label: e.target.value };
                  setContent((p) => ({ ...p, about: { ...(p.about as Record<string, unknown>), stats: newStats } }));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHomeMarquee = () => {
    type MarqueeItem = { id: string; src: string; alt: string };
    type MarqueeRows = { row1: MarqueeItem[]; row2: MarqueeItem[] };

    const { row1, row2 } = normalizeMarqueeAdminState(
      content.marquee as { row1?: MarqueeItem[]; row2?: MarqueeItem[]; logos?: MarqueeItem[] } | undefined
    );

    const updateMarqueeRows = (next: MarqueeRows) => {
      setContent((p) => ({ ...p, marquee: next }));
    };

    const resolveMarqueePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const renderMarqueeRowSection = (
      rowKey: "row1" | "row2",
      label: string,
      logos: MarqueeItem[]
    ) => (
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a]">{label}</h3>
            <p className="text-sm text-gray-500">
              {logos.length} / {MARQUEE_LOGOS_PER_ROW} logos
            </p>
          </div>
          <button
            type="button"
            disabled={logos.length >= MARQUEE_LOGOS_PER_ROW}
            onClick={() => {
              if (logos.length >= MARQUEE_LOGOS_PER_ROW) {
                alert(`Maximum ${MARQUEE_LOGOS_PER_ROW} logos allowed in ${label}.`);
                return;
              }
              const nextRows: MarqueeRows = {
                row1,
                row2,
                [rowKey]: [...logos, { id: `${rowKey}-${Date.now()}`, src: "", alt: "Client logo" }],
              };
              updateMarqueeRows(nextRows);
            }}
            className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add logo
          </button>
        </div>

        {logos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
            No logos in {label.toLowerCase()} yet.
          </p>
        ) : (
          logos.map((logo, i) => {
            const uploadKey = `${rowKey}-${logo.id}`;
            return (
              <div key={logo.id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center">
                <div className={`relative mx-auto flex shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white sm:mx-0 ${MARQUEE_SLOT_CLASS}`}>
                  {logo.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveMarqueePreviewSrc(logo.src)} alt={logo.alt} className="h-full w-full object-contain p-2 sm:p-2.5" />
                  ) : (
                    <span className="text-xs text-gray-400">No logo</span>
                  )}
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  <label
                    className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingMarqueeId === uploadKey ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {uploadingMarqueeId === uploadKey ? "Uploading…" : logo.src ? "Replace logo" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="hidden"
                      disabled={uploadingMarqueeId === uploadKey}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingMarqueeId(uploadKey);
                        try {
                          const url = await uploadMarqueeLogo(file, logo.src);
                          const altFromFile = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Client logo";
                          const nextRow = [...logos];
                          nextRow[i] = { ...nextRow[i], src: url, alt: altFromFile };
                          const nextRows: MarqueeRows = { row1, row2, [rowKey]: nextRow };
                          updateMarqueeRows(nextRows);
                          await persistMarqueeRows(
                            rowKey === "row1" ? nextRow : row1,
                            rowKey === "row2" ? nextRow : row2
                          );
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploadingMarqueeId(null);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={uploadingMarqueeId === uploadKey}
                    onClick={async () => {
                      if (logo.src && !(await deleteManagedMedia(logo.src))) return;
                      const nextRow = logos.filter((_, idx) => idx !== i);
                      const nextRows: MarqueeRows = { row1, row2, [rowKey]: nextRow };
                      updateMarqueeRows(nextRows);
                      try {
                        await persistMarqueeRows(
                          rowKey === "row1" ? nextRow : row1,
                          rowKey === "row2" ? nextRow : row2
                        );
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Failed to remove logo");
                      }
                    }}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Logo Marquee</h2>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Recommended logo size for a uniform look</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
            <li>
              <strong>{MARQUEE_RECOMMENDED_WIDTH} × {MARQUEE_RECOMMENDED_HEIGHT} px</strong> square (PNG or SVG, transparent background)
            </li>
            <li>
              On-site display size: <strong>{MARQUEE_SLOT_DISPLAY_WIDTH} × {MARQUEE_SLOT_DISPLAY_HEIGHT} px</strong> — crop tight around the logo, avoid extra whitespace in the file
            </li>
            <li>
              Up to <strong>{MARQUEE_LOGOS_PER_ROW} logos per row</strong> ({MARQUEE_ROW_COUNT} rows) — uploads save automatically
            </li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">
          Row 1: {row1.length} logos · Row 2: {row2.length} logos · Uploads and removals save instantly.
        </p>
        {renderMarqueeRowSection("row1", "Row 1", row1)}
        {renderMarqueeRowSection("row2", "Row 2", row2)}
      </div>
    );
  };

  const renderHomeOurServices = () => {
    type Category = { id: string; number: number; title: string; icon: string; items: string[] };
    const categories = ((content.homeServices as Record<string, unknown>)?.categories as Category[]) ?? [];

    const updateCategories = (next: Category[]) => {
      setContent((p) => ({ ...p, homeServices: { ...(p.homeServices as Record<string, unknown>), categories: next } }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Our Services Section</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("homeServices", "title", "Title")}
          {renderField("homeServices", "subtitle", "Subtitle", true)}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
          <button
            type="button"
            onClick={() => updateCategories([...categories, { id: String(Date.now()), number: categories.length + 1, title: "New Category", icon: "design", items: ["New item"] }])}
            className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
          >
            + Add Category
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1a1a1a]">{cat.title || `Category ${i + 1}`}</h4>
                <button
                  type="button"
                  onClick={() => updateCategories(categories.filter((_, idx) => idx !== i))}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-1 flex-col gap-1 min-w-[140px]">
                  <label className="text-xs font-medium text-gray-500">Title</label>
                  <input
                    type="text"
                    value={cat.title}
                    onChange={(e) => { const n = [...categories]; n[i] = { ...n[i], title: e.target.value }; updateCategories(n); }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
                <div className="flex w-20 flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Number</label>
                  <input
                    type="number"
                    value={cat.number}
                    onChange={(e) => { const n = [...categories]; n[i] = { ...n[i], number: Number(e.target.value) }; updateCategories(n); }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
                <div className="flex w-36 flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Icon</label>
                  <select
                    value={cat.icon}
                    onChange={(e) => { const n = [...categories]; n[i] = { ...n[i], icon: e.target.value }; updateCategories(n); }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  >
                    <option value="design">Design</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="lifecycle">Lifecycle</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-500">Items</label>
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => { const n = [...categories]; const ni = [...cat.items]; ni[ii] = e.target.value; n[i] = { ...n[i], items: ni }; updateCategories(n); }}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                    />
                    <button
                      type="button"
                      onClick={() => { const n = [...categories]; n[i] = { ...n[i], items: cat.items.filter((_, idx) => idx !== ii) }; updateCategories(n); }}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => { const n = [...categories]; n[i] = { ...n[i], items: [...cat.items, "New item"] }; updateCategories(n); }}
                  className="mt-1 text-left text-xs font-medium text-[var(--primary-orange)] hover:underline"
                >
                  + Add item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHomeWorkWithUs = () => {
    type WorkItem = {
      id: string;
      number: string;
      title: string;
      description: string;
      icon: "odm" | "oem" | "reengineering";
      href?: string;
    };

    const section = (content.homeWorkWithUs as Record<string, unknown>) ?? {};
    const items = (section.items as WorkItem[]) ?? [];

    const updateSection = (patch: Record<string, unknown>) => {
      setContent((p) => ({
        ...p,
        homeWorkWithUs: { ...(p.homeWorkWithUs as Record<string, unknown>), ...patch },
      }));
    };

    const updateItems = (next: WorkItem[]) => updateSection({ items: next });

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Work With Us Section</h2>
        <p className="text-sm text-gray-500">
          Manage the &quot;Three ways to work with us&quot; section on the homepage (ODM, OEM, Re-engineering).
        </p>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("homeWorkWithUs", "tagline", "Tagline")}
          {renderField("homeWorkWithUs", "title", "Heading")}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Cards</h3>
          <button
            type="button"
            onClick={() =>
              updateItems([
                ...items,
                {
                  id: String(Date.now()),
                  number: String(items.length + 1).padStart(2, "0"),
                  title: "New Card",
                  icon: "odm",
                  description: "Description goes here.",
                  href: "/contact",
                },
              ])
            }
            className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
          >
            + Add Card
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1a1a1a]">{item.title || `Card ${i + 1}`}</h4>
                <button
                  type="button"
                  onClick={() => updateItems(items.filter((_, idx) => idx !== i))}
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-1 flex-col gap-1 min-w-[140px]">
                  <label className="text-xs font-medium text-gray-500">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], title: e.target.value };
                      updateItems(n);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
                <div className="flex w-20 flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Number</label>
                  <input
                    type="text"
                    value={item.number}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], number: e.target.value };
                      updateItems(n);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
                <div className="flex w-40 flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Icon</label>
                  <select
                    value={item.icon}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], icon: e.target.value as WorkItem["icon"] };
                      updateItems(n);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  >
                    <option value="odm">ODM (Lightbulb)</option>
                    <option value="oem">OEM (Clipboard)</option>
                    <option value="reengineering">Re-engineering (Gears)</option>
                  </select>
                </div>
                <div className="flex flex-1 flex-col gap-1 min-w-[180px]">
                  <label className="text-xs font-medium text-gray-500">Link (optional)</label>
                  <input
                    type="text"
                    value={item.href ?? ""}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], href: e.target.value };
                      updateItems(n);
                    }}
                    placeholder="/contact"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => {
                    const n = [...items];
                    n[i] = { ...n[i], description: e.target.value };
                    updateItems(n);
                  }}
                  rows={4}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHomeCertificates = () => {
    type CertificateItem = { id: string; title: string; image: string };

    const section = (content.homeCertificates as Record<string, unknown>) ?? {};
    const items = (section.items as CertificateItem[]) ?? [];

    const updateSection = (patch: Record<string, unknown>) => {
      setContent((p) => ({
        ...p,
        homeCertificates: { ...(p.homeCertificates as Record<string, unknown>), ...patch },
      }));
    };

    const updateItems = (next: CertificateItem[]) => updateSection({ items: next });

    const persistCertificates = async (nextItems: CertificateItem[]) => {
      const payload = {
        tagline: String(section.tagline ?? "TRUST & ASSURANCE"),
        title: String(section.title ?? "Certificates & Compliance"),
        subtitle: String(section.subtitle ?? "Click any certificate to view it in full size."),
        items: nextItems,
      };

      const res = await adminFetch("/api/content/homeCertificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Failed to save certificates");
      }

      setContent((p) => ({ ...p, homeCertificates: payload }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const moveItem = (index: number, direction: "up" | "down") => {
      const next = [...items];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      updateItems(next);
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Certificates Section</h2>
        <p className="text-sm text-gray-500">
          Upload certificate images for the homepage carousel. Any number of certificates is supported — the site shows 5 at a time.
        </p>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("homeCertificates", "tagline", "Tagline")}
          {renderField("homeCertificates", "title", "Heading")}
          {renderField("homeCertificates", "subtitle", "Subtitle")}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Certificates ({items.length})</h3>
          <button
            type="button"
            onClick={() =>
              updateItems([
                ...items,
                { id: String(Date.now()), title: "New Certificate", image: "" },
              ])
            }
            className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
          >
            + Add Certificate
          </button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400 shadow-sm">
            No certificates yet. Add your first certificate above.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item, i) => {
              const uploadKey = item.id;
              return (
                <div key={item.id} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-start">
                  <div className="relative mx-auto flex h-48 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-[#051c2c] p-2 lg:mx-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolvePreviewSrc(item.image)} alt={item.title} className="h-full w-full rounded-lg bg-white object-contain" />
                    ) : (
                      <span className="text-xs text-white/60">No image</span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#1a1a1a]">{item.title || `Certificate ${i + 1}`}</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => moveItem(i, "up")}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          disabled={i === items.length - 1}
                          onClick={() => moveItem(i, "down")}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (item.image) await deleteManagedMedia(item.image, { alertOnError: false });
                            const next = items.filter((_, idx) => idx !== i);
                            updateItems(next);
                            await persistCertificates(next);
                          }}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Certificate name</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], title: e.target.value };
                          updateItems(next);
                        }}
                        placeholder="ISO 9001:2015"
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                      />
                    </div>

                    <label
                      className={`inline-flex w-fit cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingCertificateId === uploadKey ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {uploadingCertificateId === uploadKey ? "Uploading…" : item.image ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingCertificateId === uploadKey}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingCertificateId(uploadKey);
                          try {
                            const url = await uploadImage(file, item.image);
                            const next = [...items];
                            next[i] = { ...next[i], image: url };
                            updateItems(next);
                            await persistCertificates(next);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploadingCertificateId(null);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHomeIndustries = () => {
    type IndustryItem = {
      id: string;
      slug?: string;
      name: string;
      image: string;
      products?: unknown[];
    };

    const section = (content.homeIndustries as Record<string, unknown>) ?? {};
    const items = (section.items as IndustryItem[]) ?? [];

    const updateSection = (patch: Record<string, unknown>) => {
      setContent((p) => ({
        ...p,
        homeIndustries: { ...(p.homeIndustries as Record<string, unknown>), ...patch },
      }));
    };

    const updateItems = (next: IndustryItem[]) => updateSection({ items: next });

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Industries Section</h2>
        <p className="text-sm text-gray-500">
          Manage homepage industry cards and their images. These same industries appear on the Our Projects page.
        </p>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("homeIndustries", "title", "Section Title")}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Industry Cards</h3>
          <button
            type="button"
            onClick={() =>
              updateItems([
                ...items,
                {
                  id: String(Date.now()),
                  name: "NEW INDUSTRY",
                  image: "",
                  products: [],
                },
              ])
            }
            className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
          >
            + Add Industry
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, i) => {
            const updateItem = (patch: Partial<IndustryItem>) => {
              const next = [...items];
              next[i] = { ...next[i], ...patch };
              updateItems(next);
            };

            return (
              <div key={item.id} className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:w-40">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolvePreviewSrc(item.image)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-[#1a1a1a]">{item.name || `Industry ${i + 1}`}</h4>
                      <button
                        type="button"
                        onClick={async () => {
                          if (item.image) await deleteManagedMedia(item.image, { alertOnError: false });
                          const products = (item.products as Array<Record<string, unknown>>) ?? [];
                          for (const product of products) {
                            if (typeof product.image === "string" && product.image) {
                              await deleteManagedMedia(product.image, { alertOnError: false });
                            }
                            const gallery = (product.gallery as Array<{ src?: string }>) ?? [];
                            for (const g of gallery) {
                              if (g.src) await deleteManagedMedia(g.src, { alertOnError: false });
                            }
                            const downloads = (product.downloadButtons as Record<string, unknown>) ?? {};
                            for (const key of ["brochureUrl", "model3dUrl"] as const) {
                              const u = downloads[key];
                              if (typeof u === "string" && u) await deleteManagedMedia(u, { alertOnError: false });
                            }
                          }
                          updateItems(items.filter((_, idx) => idx !== i));
                        }}
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Industry Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem({ name: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label
                        className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingIndustryIndex === i ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {uploadingIndustryIndex === i ? "Uploading…" : item.image ? "Replace card image" : "Upload card image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          disabled={uploadingIndustryIndex === i}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingIndustryIndex(i);
                            try {
                              const url = await uploadImage(file, item.image);
                              updateItem({ image: url });
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Upload failed");
                            } finally {
                              setUploadingIndustryIndex(null);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                      {item.image ? (
                        <button
                          type="button"
                          disabled={uploadingIndustryIndex === i}
                          onClick={async () => {
                            if (item.image && !(await deleteManagedMedia(item.image))) return;
                            updateItem({ image: "" });
                          }}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove card image
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIndustriesDetails = () => {
    type GalleryItem = { id: string; src: string; alt?: string; type?: "image" | "video"; videoUrl?: string };
    type IndustryProduct = {
      id: string;
      slug?: string;
      name: string;
      image?: string;
      description?: string;
      keyFeatures?: string[];
      gallery?: GalleryItem[];
      downloadButtons?: {
        enabled?: boolean;
        showBrochure?: boolean;
        showModel3d?: boolean;
        showCheckoutVideo?: boolean;
        brochureUrl?: string;
        brochureFileName?: string;
        model3dUrl?: string;
        model3dFileName?: string;
        checkoutVideoUrl?: string;
      };
    };
    type IndustryItem = {
      id: string;
      slug?: string;
      name: string;
      image: string;
      products?: IndustryProduct[];
    };

    const section = (content.homeIndustries as Record<string, unknown>) ?? {};
    const items = (section.items as IndustryItem[]) ?? [];
    const activeIndustryId = selectedIndustryId || items[0]?.id || "";
    const industryIndex = items.findIndex((item) => item.id === activeIndustryId);
    const industry = industryIndex >= 0 ? items[industryIndex] : undefined;
    const products = industry?.products ?? [];

    const updateSection = (patch: Record<string, unknown>) => {
      setContent((p) => ({
        ...p,
        homeIndustries: { ...(p.homeIndustries as Record<string, unknown>), ...patch },
      }));
    };

    const updateItems = (next: IndustryItem[]) => updateSection({ items: next });

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const slugify = (text: string, id: string) => {
      const slug = text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return slug || id;
    };

    const updateProducts = (next: IndustryProduct[]) => {
      if (industryIndex < 0) return;
      const nextItems = [...items];
      nextItems[industryIndex] = { ...nextItems[industryIndex], products: next };
      updateItems(nextItems);
    };

    const moveProduct = (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= products.length || fromIndex === toIndex) return;
      const next = [...products];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      updateProducts(next);
    };

    if (!items.length) {
      return (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Industries Details</h2>
          <p className="text-sm text-gray-500">Add industries in Homepage → Industries Section first.</p>
        </div>
      );
    }

    const industrySlug = industry ? industry.slug?.trim() || slugify(industry.name, industry.id) : "";

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Industries & Products</h2>
        <p className="text-sm text-gray-500">
          Manage industry products shown on the homepage, Our Projects page, and product detail pages.
          Use the order controls on each product to change which appears first on the website.
          Click the arrow on a product to expand or collapse its details.
        </p>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="text-xs font-semibold text-gray-700">Select Industry</label>
          <select
            value={activeIndustryId}
            onChange={(e) => setSelectedIndustryId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)] sm:max-w-md"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {industry ? (
            <p className="mt-2 text-xs text-gray-500">
              Products appear at /projects/{industrySlug}/[product-slug]
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Products in {industry?.name ?? "Industry"}
          </h3>
          <button
            type="button"
            onClick={() => {
              const newId = String(Date.now());
              setExpandedProductIds((prev) => ({
                ...prev,
                [`${activeIndustryId}:${newId}`]: true,
              }));
              updateProducts([
                ...products,
                {
                  id: newId,
                  name: "NEW PRODUCT",
                  image: "",
                  description: "",
                  keyFeatures: [""],
                  gallery: [],
                  downloadButtons: {
                    enabled: false,
                    showBrochure: true,
                    showModel3d: true,
                  },
                },
              ]);
            }}
            className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
          >
            + Add Product
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {products.map((product, pi) => {
            const gallery = product.gallery ?? [];
            const keyFeatures = product.keyFeatures ?? [];
            const productSlug = product.slug?.trim() || slugify(product.name, product.id);
            const imageUploadKey = `${industryIndex}-${pi}-main`;

            const updateProduct = (patch: Partial<IndustryProduct>) => {
              const next = [...products];
              next[pi] = { ...next[pi], ...patch };
              updateProducts(next);
            };

            const updateGallery = (next: GalleryItem[]) => updateProduct({ gallery: next });
            const updateKeyFeatures = (next: string[]) => updateProduct({ keyFeatures: next });
            const downloadButtons = product.downloadButtons ?? {
              enabled: false,
              showBrochure: true,
              showModel3d: true,
            };

            const updateDownloadButtons = (
              patch: Partial<NonNullable<IndustryProduct["downloadButtons"]>>
            ) => updateProduct({ downloadButtons: { ...downloadButtons, ...patch } });

            const productKey = `${activeIndustryId}:${product.id}`;
            const isExpanded = expandedProductIds[productKey] ?? false;
            const toggleExpanded = () => {
              setExpandedProductIds((prev) => ({
                ...prev,
                [productKey]: !isExpanded,
              }));
            };

            return (
              <div key={product.id} className="rounded-2xl bg-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <button
                      type="button"
                      onClick={toggleExpanded}
                      className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse product" : "Expand product"}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {!isExpanded && product.image ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolvePreviewSrc(product.image)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                          Position {pi + 1} of {products.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={pi === 0}
                            onClick={() => moveProduct(pi, pi - 1)}
                            className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Move up"
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            disabled={pi === products.length - 1}
                            onClick={() => moveProduct(pi, pi + 1)}
                            className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Move down"
                          >
                            Move down
                          </button>
                          <button
                            type="button"
                            disabled={pi === 0}
                            onClick={() => moveProduct(pi, 0)}
                            className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] disabled:cursor-not-allowed disabled:opacity-40"
                            title="Move to first"
                          >
                            Move to first
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleExpanded}
                        className="mt-2 block w-full text-left"
                      >
                        <h4 className="text-sm font-semibold text-[#1a1a1a]">
                          {product.name || `Product ${pi + 1}`}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          /projects/{industrySlug}/{productSlug}
                        </p>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (product.image) await deleteManagedMedia(product.image, { alertOnError: false });
                      for (const g of gallery) {
                        if (g.src) await deleteManagedMedia(g.src, { alertOnError: false });
                      }
                      if (downloadButtons.brochureUrl) {
                        await deleteManagedMedia(downloadButtons.brochureUrl, { alertOnError: false });
                      }
                      if (downloadButtons.model3dUrl) {
                        await deleteManagedMedia(downloadButtons.model3dUrl, { alertOnError: false });
                      }
                      updateProducts(products.filter((_, idx) => idx !== pi));
                    }}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Remove product
                  </button>
                </div>

                {isExpanded ? (
                  <div className="flex flex-col gap-5 border-t border-gray-100 px-4 pb-5 sm:px-5 sm:pb-6">
                <div className="grid gap-4 pt-5 lg:grid-cols-[160px_1fr]">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolvePreviewSrc(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Product Name</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct({ name: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label
                        className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingProductImageKey === imageUploadKey ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {uploadingProductImageKey === imageUploadKey ? "Uploading…" : product.image ? "Replace main image" : "Upload main image"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          disabled={uploadingProductImageKey === imageUploadKey}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingProductImageKey(imageUploadKey);
                            try {
                              const url = await uploadImage(file, product.image);
                              updateProduct({ image: url });
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Upload failed");
                            } finally {
                              setUploadingProductImageKey(null);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <label className="text-xs font-semibold text-gray-700">Basic Description</label>
                  <textarea
                    value={product.description ?? ""}
                    onChange={(e) => updateProduct({ description: e.target.value })}
                    rows={4}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">Key Features</label>
                    <button
                      type="button"
                      onClick={() => updateKeyFeatures([...keyFeatures, "New feature"])}
                      className="text-xs font-medium text-[var(--primary-orange)] hover:underline"
                    >
                      + Add feature
                    </button>
                  </div>
                  {keyFeatures.map((feature, fi) => (
                    <div key={fi} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const next = [...keyFeatures];
                          next[fi] = e.target.value;
                          updateKeyFeatures(next);
                        }}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                      />
                      <button
                        type="button"
                        onClick={() => updateKeyFeatures(keyFeatures.filter((_, idx) => idx !== fi))}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Download Buttons</label>
                    <p className="mt-1 text-xs text-gray-500">
                      Hidden by default. Enable to show Download Brochure, 3D Model, and/or Checkout Video on the product page.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={downloadButtons.enabled ?? false}
                      onChange={(e) => updateDownloadButtons({ enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Enable download buttons on product page
                  </label>

                  {downloadButtons.enabled ? (
                    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={downloadButtons.showBrochure ?? true}
                            onChange={(e) => updateDownloadButtons({ showBrochure: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          Show Download Brochure
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={downloadButtons.showModel3d ?? true}
                            onChange={(e) => updateDownloadButtons({ showModel3d: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          Show 3D Model button
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={downloadButtons.showCheckoutVideo ?? true}
                            onChange={(e) => updateDownloadButtons({ showCheckoutVideo: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          Show Checkout Video button
                        </label>
                      </div>

                      {downloadButtons.showBrochure !== false ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-500">
                            Brochure file (PDF, DOC, DOCX — max 100MB)
                          </label>
                          {downloadButtons.brochureUrl ? (
                            <p className="text-xs text-gray-600">
                              {downloadButtons.brochureFileName || "Brochure uploaded"}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            <label
                              className={`cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingProductDocumentKey === `${industryIndex}-${pi}-brochure` ? "pointer-events-none opacity-50" : ""}`}
                            >
                              {uploadingProductDocumentKey === `${industryIndex}-${pi}-brochure`
                                ? "Uploading…"
                                : downloadButtons.brochureUrl
                                  ? "Replace brochure"
                                  : "Upload brochure"}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                disabled={uploadingProductDocumentKey === `${industryIndex}-${pi}-brochure`}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const uploadKey = `${industryIndex}-${pi}-brochure`;
                                  setUploadingProductDocumentKey(uploadKey);
                                  try {
                                    const uploaded = await uploadDocument(file, downloadButtons.brochureUrl);
                                    updateDownloadButtons({
                                      brochureUrl: uploaded.url,
                                      brochureFileName: uploaded.fileName,
                                    });
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : "Upload failed");
                                  } finally {
                                    setUploadingProductDocumentKey(null);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                            {downloadButtons.brochureUrl ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!(await deleteManagedMedia(downloadButtons.brochureUrl || ""))) return;
                                  updateDownloadButtons({
                                    brochureUrl: "",
                                    brochureFileName: "",
                                  });
                                }}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Remove file
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {downloadButtons.showModel3d !== false ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-500">
                            3D model file (PDF, DOC, DOCX, GLB, GLTF, OBJ, STL, STEP, STP, ZIP — max 100MB)
                          </label>
                          {downloadButtons.model3dUrl ? (
                            <p className="text-xs text-gray-600">
                              {downloadButtons.model3dFileName || "3D model uploaded"}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            <label
                              className={`cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingProductDocumentKey === `${industryIndex}-${pi}-model3d` ? "pointer-events-none opacity-50" : ""}`}
                            >
                              {uploadingProductDocumentKey === `${industryIndex}-${pi}-model3d`
                                ? "Uploading…"
                                : downloadButtons.model3dUrl
                                  ? "Replace 3D model"
                                  : "Upload 3D model"}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.glb,.gltf,.obj,.stl,.step,.stp,.zip"
                                className="hidden"
                                disabled={uploadingProductDocumentKey === `${industryIndex}-${pi}-model3d`}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const uploadKey = `${industryIndex}-${pi}-model3d`;
                                  setUploadingProductDocumentKey(uploadKey);
                                  try {
                                    const uploaded = await uploadDocument(file, downloadButtons.model3dUrl);
                                    updateDownloadButtons({
                                      model3dUrl: uploaded.url,
                                      model3dFileName: uploaded.fileName,
                                    });
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : "Upload failed");
                                  } finally {
                                    setUploadingProductDocumentKey(null);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                            {downloadButtons.model3dUrl ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!(await deleteManagedMedia(downloadButtons.model3dUrl || ""))) return;
                                  updateDownloadButtons({
                                    model3dUrl: "",
                                    model3dFileName: "",
                                  });
                                }}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Remove file
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {downloadButtons.showCheckoutVideo !== false ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-medium text-gray-500">
                            Checkout Video (YouTube URL)
                          </label>
                          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                            <p className="font-semibold">How to add a YouTube video link</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-4">
                              <li>Open the video on YouTube in your browser.</li>
                              <li>
                                Click <strong>Share</strong> below the video, then click <strong>Copy</strong>.
                              </li>
                              <li>Paste the copied link into the field below.</li>
                            </ol>
                            <p className="mt-2">
                              You can also copy the link from your browser address bar while the video is open.
                            </p>
                            <p className="mt-2">
                              Supported formats:{" "}
                              <span className="font-mono text-[11px]">youtube.com/watch?v=...</span>,{" "}
                              <span className="font-mono text-[11px]">youtu.be/...</span>,{" "}
                              <span className="font-mono text-[11px]">youtube.com/shorts/...</span>
                            </p>
                          </div>
                          <input
                            type="url"
                            value={downloadButtons.checkoutVideoUrl ?? ""}
                            onChange={(e) => updateDownloadButtons({ checkoutVideoUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                          />
                          {downloadButtons.checkoutVideoUrl?.trim() ? (
                            <p className="text-xs text-gray-500">
                              Visitors will open this video in a new tab when they click Checkout Video.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">Gallery Images (angles)</label>
                      <p className="mt-1 text-xs text-gray-500">Shown below the main image on the product page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateGallery([
                          ...gallery,
                          { id: String(Date.now()), src: "", type: "image" },
                        ])
                      }
                      className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
                    >
                      + Add angle
                    </button>
                  </div>

                  {gallery.map((image, gi) => {
                    const uploadKey = `${industryIndex}-${pi}-${gi}`;
                    return (
                      <div key={image.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row">
                        <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:w-32">
                          {image.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolvePreviewSrc(image.src)}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-center gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              className={`cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingProductGalleryKey === uploadKey ? "pointer-events-none opacity-50" : ""}`}
                            >
                              {uploadingProductGalleryKey === uploadKey ? "Uploading…" : image.src ? "Replace image" : "Upload image"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/jpg"
                                className="hidden"
                                disabled={uploadingProductGalleryKey === uploadKey}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploadingProductGalleryKey(uploadKey);
                                  try {
                                    const url = await uploadImage(file, image.src);
                                    const next = [...gallery];
                                    next[gi] = { ...next[gi], src: url };
                                    updateGallery(next);
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : "Upload failed");
                                  } finally {
                                    setUploadingProductGalleryKey(null);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={async () => {
                                if (image.src && !(await deleteManagedMedia(image.src))) return;
                                updateGallery(gallery.filter((_, idx) => idx !== gi));
                              }}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                          {!image.src ? (
                            <p className="text-xs text-amber-600">Upload an image or remove this angle before saving.</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No products yet. Click &quot;+ Add Product&quot; to create one (e.g. DC Energy Meter).
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderAboutHeroContent = () => {
    const backgroundImage = String((content.about as Record<string, unknown>)?.backgroundImage ?? "");

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Hero Section</h2>
        <p className="text-sm text-gray-500">Controls the hero banner background and title shown at the top of the about page.</p>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Hero Background Image</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, or WebP. Recommended wide landscape image. Uploads save automatically.
            </p>
            {backgroundImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePreviewSrc(backgroundImage)}
                  alt="About hero preview"
                  className="aspect-[21/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No background image uploaded
              </div>
            )}
            <p className="truncate text-xs text-gray-400">{backgroundImage || "No image set — upload a hero background image"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingAboutHeroImage ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingAboutHeroImage ? "Uploading…" : backgroundImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingAboutHeroImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingAboutHeroImage(true);
                    try {
                      const url = await uploadImage(file, backgroundImage);
                      updateField("about", "backgroundImage", url);
                      await saveContentSection("about");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingAboutHeroImage(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  disabled={uploadingAboutHeroImage}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(backgroundImage))) return;
                    updateField("about", "backgroundImage", "");
                    try {
                      await saveContentSection("about");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
          {renderField("about", "title", "Hero Title", false)}
        </div>
      </div>
    );
  };

  const renderAboutIntroSection = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Intro Section</h2>
      <p className="text-sm text-gray-500">
        Controls the gray section below the hero with the heading, body text, and G logo.
      </p>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        {renderField("aboutPage", "introSection.title", "Section Heading", false, ["introSection", "title"])}
        {renderField("aboutPage", "introSection.paragraph1", "Paragraph 1", true, ["introSection", "paragraph1"])}
        {renderField("aboutPage", "introSection.paragraph2", "Paragraph 2", true, ["introSection", "paragraph2"])}
      </div>
    </div>
  );

  const renderAboutJourneyTimeline = () => {
    type Milestone = { year: string; description: string };
    const journeyTimeline = ((content.aboutPage as Record<string, unknown>)?.journeyTimeline as Record<string, unknown>) ?? {};
    const milestones = (journeyTimeline.milestones as Milestone[]) ?? [];
    const backgroundImage = String(journeyTimeline.backgroundImage ?? "");

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const updateJourneyTimeline = (field: string, value: string) => {
      setContent((p) => ({
        ...p,
        aboutPage: {
          ...(p.aboutPage as Record<string, unknown>),
          journeyTimeline: {
            ...((p.aboutPage as Record<string, unknown>)?.journeyTimeline as Record<string, unknown>),
            [field]: value,
          },
        },
      }));
    };
    
    const updateMilestones = (next: Milestone[]) => {
      setContent((p) => ({ 
        ...p, 
        aboutPage: { 
          ...(p.aboutPage as Record<string, unknown>), 
          journeyTimeline: { 
            ...((p.aboutPage as Record<string, unknown>)?.journeyTimeline as Record<string, unknown>), 
            milestones: next 
          } 
        } 
      }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Journey Timeline</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("aboutPage", "journeyTimeline.heading", "Section Heading", false, ["journeyTimeline", "heading"])}
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Section Background Image</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, or WebP. Recommended wide landscape image with parallax scroll effect. Uploads save automatically.
            </p>
            {backgroundImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePreviewSrc(backgroundImage)}
                  alt="Journey section preview"
                  className="aspect-[21/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No background image uploaded
              </div>
            )}
            <p className="truncate text-xs text-gray-400">{backgroundImage || "No image set — navy fallback will show"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingJourneyBg ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingJourneyBg ? "Uploading…" : backgroundImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingJourneyBg}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingJourneyBg(true);
                    try {
                      const url = await uploadImage(file, backgroundImage);
                      updateJourneyTimeline("backgroundImage", url);
                      await saveContentSection("aboutPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingJourneyBg(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  disabled={uploadingJourneyBg}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(backgroundImage))) return;
                    updateJourneyTimeline("backgroundImage", "");
                    try {
                      await saveContentSection("aboutPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Timeline Milestones</h3>
            <button
              onClick={() => {
                updateMilestones([...milestones, { year: "20XX", description: "New milestone description" }]);
              }}
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >+ Add Milestone</button>
          </div>
          {milestones.map((milestone, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Year" 
                  value={milestone.year} 
                  onChange={(e) => {
                    const next = [...milestones];
                    next[i] = { ...next[i], year: e.target.value };
                    updateMilestones(next);
                  }} 
                  className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
                />
                <button 
                  onClick={() => updateMilestones(milestones.filter((_, idx) => idx !== i))} 
                  className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >Remove</button>
              </div>
              <textarea 
                placeholder="Description" 
                value={milestone.description} 
                onChange={(e) => {
                  const next = [...milestones];
                  next[i] = { ...next[i], description: e.target.value };
                  updateMilestones(next);
                }} 
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutDimensions = () => {
    type Card = { title: string; description: string; icon: string };
    const cards = ((content.aboutPage as Record<string, unknown>)?.dimensions as Record<string, unknown>)?.cards as Card[] ?? [];
    
    const updateCards = (next: Card[]) => {
      setContent((p) => ({ 
        ...p, 
        aboutPage: { 
          ...(p.aboutPage as Record<string, unknown>), 
          dimensions: { 
            ...((p.aboutPage as Record<string, unknown>)?.dimensions as Record<string, unknown>), 
            cards: next 
          } 
        } 
      }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Dimensions</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("aboutPage", "dimensions.heading", "Section Heading", false, ["dimensions", "heading"])}
          {renderField("aboutPage", "dimensions.subtitle", "Subtitle", false, ["dimensions", "subtitle"])}
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Dimension Cards</h3>
            <button
              onClick={() => {
                updateCards([...cards, { title: "NEW DIMENSION", description: "Description here", icon: "box" }]);
              }}
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >+ Add Card</button>
          </div>
          {cards.map((card, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={card.title} 
                  onChange={(e) => {
                    const next = [...cards];
                    next[i] = { ...next[i], title: e.target.value };
                    updateCards(next);
                  }} 
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
                />
                <button 
                  onClick={() => updateCards(cards.filter((_, idx) => idx !== i))} 
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >Remove</button>
              </div>
              <textarea 
                placeholder="Description" 
                value={card.description} 
                onChange={(e) => {
                  const next = [...cards];
                  next[i] = { ...next[i], description: e.target.value };
                  updateCards(next);
                }} 
                rows={4}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
              />
              <input 
                type="text" 
                placeholder="Icon (e.g., box, forklift, truck)" 
                value={card.icon} 
                onChange={(e) => {
                  const next = [...cards];
                  next[i] = { ...next[i], icon: e.target.value };
                  updateCards(next);
                }} 
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutTeam = () => {
    type Member = {
      id: string;
      name: string;
      photo: string;
      title: string;
      linkedin: string;
      instagram: string;
      description: string;
    };
    const members = ((content.aboutPage as Record<string, unknown>)?.team as Record<string, unknown>)?.members as Member[] ?? [];

    const updateMembers = (next: Member[]) => {
      setContent((p) => ({
        ...p,
        aboutPage: {
          ...(p.aboutPage as Record<string, unknown>),
          team: {
            ...((p.aboutPage as Record<string, unknown>)?.team as Record<string, unknown>),
            members: next,
          },
        },
      }));
    };

    const moveMember = (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= members.length || fromIndex === toIndex) return;
      const next = [...members];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      updateMembers(next);
    };

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Our Team</h2>
        <p className="text-sm text-gray-500">
          Add team members with a photo, name, title, social links, and description. Three members appear per row on the about page.
        </p>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("aboutPage", "team.heading", "Section Heading", false, ["team", "heading"])}
          {renderField("aboutPage", "team.subtitle", "Section Subtitle", false, ["team", "subtitle"])}
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Team Members</h3>
            <button
              onClick={() => {
                updateMembers([
                  ...members,
                  {
                    id: String(Date.now()),
                    name: "Team Member",
                    photo: "",
                    title: "",
                    linkedin: "",
                    instagram: "",
                    description: "",
                  },
                ]);
              }}
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >
              + Add Member
            </button>
          </div>
          {members.map((member, i) => (
            <div key={member.id} className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  Position {i + 1} of {members.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveMember(i, i - 1)}
                    className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move up"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={i === members.length - 1}
                    onClick={() => moveMember(i, i + 1)}
                    className="inline-flex h-8 items-center rounded-lg border border-gray-200 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)] disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move down"
                  >
                    Move down
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-300 bg-white sm:mx-0">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolvePreviewSrc(member.photo)}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No photo</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const next = [...members];
                        next[i] = { ...next[i], name: e.target.value };
                        updateMembers(next);
                      }}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                    />
                    <button
                      onClick={async () => {
                        if (member.photo) await deleteManagedMedia(member.photo, { alertOnError: false });
                        updateMembers(members.filter((_, idx) => idx !== i));
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 ${uploadingTeamMemberIndex === i ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {uploadingTeamMemberIndex === i ? "Uploading…" : member.photo ? "Replace photo" : "Upload photo"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        disabled={uploadingTeamMemberIndex === i}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingTeamMemberIndex(i);
                          try {
                            const url = await uploadImage(file, member.photo);
                            const next = [...members];
                            next[i] = { ...next[i], photo: url };
                            updateMembers(next);
                            await saveContentSection("aboutPage");
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploadingTeamMemberIndex(null);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {member.photo && (
                      <button
                        type="button"
                        disabled={uploadingTeamMemberIndex === i}
                        onClick={async () => {
                          if (member.photo && !(await deleteManagedMedia(member.photo))) return;
                          const next = [...members];
                          next[i] = { ...next[i], photo: "" };
                          updateMembers(next);
                          try {
                            await saveContentSection("aboutPage");
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Failed to remove photo");
                          }
                        }}
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Job title (e.g. Full Stack Developer)"
                    value={member.title ?? ""}
                    onChange={(e) => {
                      const next = [...members];
                      next[i] = { ...next[i], title: e.target.value };
                      updateMembers(next);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={member.linkedin}
                    onChange={(e) => {
                      const next = [...members];
                      next[i] = { ...next[i], linkedin: e.target.value };
                      updateMembers(next);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={member.instagram}
                    onChange={(e) => {
                      const next = [...members];
                      next[i] = { ...next[i], instagram: e.target.value };
                      updateMembers(next);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                  <textarea
                    placeholder="Description (bio or additional details)"
                    value={member.description}
                    onChange={(e) => {
                      const next = [...members];
                      next[i] = { ...next[i], description: e.target.value };
                      updateMembers(next);
                    }}
                    rows={4}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutAchievements = () => {
    type Stat = { value: string; label: string; tone: string; backgroundImage?: string };
    const stats = ((content.aboutPage as Record<string, unknown>)?.achievements as Record<string, unknown>)?.stats as Stat[] ?? [];
    
    const updateStats = (next: Stat[]) => {
      setContent((p) => ({ 
        ...p, 
        aboutPage: { 
          ...(p.aboutPage as Record<string, unknown>), 
          achievements: { 
            ...((p.aboutPage as Record<string, unknown>)?.achievements as Record<string, unknown>), 
            stats: next 
          } 
        } 
      }));
    };

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Achievements</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("aboutPage", "achievements.heading", "Section Heading", false, ["achievements", "heading"])}
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Achievement Stats</h3>
            <button
              onClick={() => {
                updateStats([...stats, { value: "100+", label: "New Stat", tone: "team", backgroundImage: "" }]);
              }}
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >+ Add Stat</button>
          </div>
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Value (e.g., 450+)" 
                  value={stat.value} 
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], value: e.target.value };
                    updateStats(next);
                  }} 
                  className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
                />
                <input 
                  type="text" 
                  placeholder="Label" 
                  value={stat.label} 
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], label: e.target.value };
                    updateStats(next);
                  }} 
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
                />
                <button 
                  onClick={async () => {
                    if (stat.backgroundImage) {
                      await deleteManagedMedia(stat.backgroundImage, { alertOnError: false });
                    }
                    updateStats(stats.filter((_, idx) => idx !== i));
                  }} 
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >Remove</button>
              </div>
              <input 
                type="text" 
                placeholder="Tone (team, devices, clients, industries)" 
                value={stat.tone} 
                onChange={(e) => {
                  const next = [...stats];
                  next[i] = { ...next[i], tone: e.target.value };
                  updateStats(next);
                }} 
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]" 
              />
              
              {/* Background Image Upload */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
                {stat.backgroundImage && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={resolvePreviewSrc(stat.backgroundImage)} 
                      alt="Preview" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-wrap gap-2">
                  <label
                    className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 ${uploadingStatIndex === i ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {uploadingStatIndex === i ? "Uploading…" : stat.backgroundImage ? "Replace Image" : "Upload Background"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      disabled={uploadingStatIndex === i}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingStatIndex(i);
                        try {
                          const url = await uploadImage(file, stat.backgroundImage);
                          const next = [...stats];
                          next[i] = { ...next[i], backgroundImage: url };
                          updateStats(next);
                          await saveContentSection("aboutPage");
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploadingStatIndex(null);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  {stat.backgroundImage && (
                    <button
                      type="button"
                      disabled={uploadingStatIndex === i}
                      onClick={async () => {
                        if (stat.backgroundImage && !(await deleteManagedMedia(stat.backgroundImage))) return;
                        const next = [...stats];
                        next[i] = { ...next[i], backgroundImage: "" };
                        updateStats(next);
                        try {
                          await saveContentSection("aboutPage");
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Failed to remove image");
                        }
                      }}
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutRequirement = () => {
    const requirement = ((content.aboutPage as Record<string, unknown>)?.requirement as Record<string, unknown>) ?? {};
    const backgroundImage = String(requirement.backgroundImage ?? "");

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const updateRequirement = (field: string, value: string) => {
      setContent((p) => ({
        ...p,
        aboutPage: {
          ...(p.aboutPage as Record<string, unknown>),
          requirement: {
            ...((p.aboutPage as Record<string, unknown>)?.requirement as Record<string, unknown>),
            [field]: value,
          },
        },
      }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">About Page — Requirement Form</h2>
        <p className="text-sm text-gray-500">Controls the heading, background image, and submit button for the requirement form on the about page.</p>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Section Background Image</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, or WebP. Recommended wide landscape image. Uploads save automatically.
            </p>
            {backgroundImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePreviewSrc(backgroundImage)}
                  alt="Requirement section preview"
                  className="aspect-[21/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No background image uploaded
              </div>
            )}
            <p className="truncate text-xs text-gray-400">{backgroundImage || "No image set — gradient fallback will show"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingRequirementBg ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingRequirementBg ? "Uploading…" : backgroundImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingRequirementBg}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingRequirementBg(true);
                    try {
                      const url = await uploadImage(file, backgroundImage);
                      updateRequirement("backgroundImage", url);
                      await saveContentSection("aboutPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingRequirementBg(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  disabled={uploadingRequirementBg}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(backgroundImage))) return;
                    updateRequirement("backgroundImage", "");
                    try {
                      await saveContentSection("aboutPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
          {renderField("aboutPage", "requirement.heading", "Form Heading", false, ["requirement", "heading"])}
          {renderField("aboutPage", "requirement.submitText", "Submit Button Text", false, ["requirement", "submitText"])}
        </div>
      </div>
    );
  };

  const renderProjectsHero = () => {
    const projectsPage = (content.projectsPage as Record<string, unknown>) ?? {};
    const hero = (projectsPage.hero as Record<string, unknown>) ?? {};
    const backgroundImage = String(hero.backgroundImage ?? "");

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Projects Page — Hero Section</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Hero Background Image</p>
            <p className="text-xs text-gray-500">This image will be shown as the background of the projects page hero section.</p>
            {backgroundImage ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg">
                <img
                  src={backgroundImage.startsWith("/uploads/") ? `${API_URL}${backgroundImage}` : backgroundImage}
                  alt="Hero background"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                No background image
              </div>
            )}
            <p className="truncate text-xs text-gray-400">
              {backgroundImage || "No image set — gradient background will show as fallback"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingProjectsHeroImage ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingProjectsHeroImage ? "Uploading…" : backgroundImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingProjectsHeroImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingProjectsHeroImage(true);
                    try {
                      const url = await uploadImage(file, backgroundImage);
                      setContent((prev) => ({
                        ...prev,
                        projectsPage: {
                          ...(prev.projectsPage as Record<string, unknown>),
                          hero: {
                            ...((prev.projectsPage as Record<string, unknown>)?.hero as Record<string, unknown>),
                            backgroundImage: url,
                          },
                        },
                      }));
                      await saveContentSection("projectsPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingProjectsHeroImage(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  disabled={uploadingProjectsHeroImage}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(backgroundImage))) return;
                    setContent((prev) => ({
                      ...prev,
                      projectsPage: {
                        ...(prev.projectsPage as Record<string, unknown>),
                        hero: {
                          ...((prev.projectsPage as Record<string, unknown>)?.hero as Record<string, unknown>),
                          backgroundImage: "",
                        },
                      },
                    }));
                    try {
                      await saveContentSection("projectsPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
          {renderField("projectsPage", "hero.heading", "Heading", false, ["hero", "heading"])}
          {renderField("projectsPage", "hero.subtitle", "Subtitle", true, ["hero", "subtitle"])}
          {renderField("projectsPage", "hero.ctaText", "Button Text", false, ["hero", "ctaText"])}
        </div>
      </div>
    );
  };


  const renderContact = () => {
    type Plant = { name: string; address: string; image?: string; mapUrl?: string };
    type Department = {
      title: string;
      description: string;
      email: string;
      icon: "headset" | "gear" | "person";
    };
    const contactPage = (content.contactPage as Record<string, unknown>) ?? {};
    const plants = (contactPage.plants as Plant[]) ?? [];
    const departments = (contactPage.departments as Department[]) ?? [];

    const buildContactPageWithPlants = (nextPlants: Plant[]) => ({
      ...contactPage,
      plants: nextPlants,
    });

    const buildContactPageWithDepartments = (nextDepartments: Department[]) => ({
      ...contactPage,
      departments: nextDepartments,
    });

    const updatePlants = (next: Plant[]) => {
      setContent((p) => ({
        ...p,
        contactPage: buildContactPageWithPlants(next),
      }));
    };

    const saveContactPageData = async (nextContactPage: Record<string, unknown>) => {
      await adminFetch("/api/content/contactPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextContactPage),
      });
      setContent((p) => ({ ...p, contactPage: nextContactPage }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    const savePlants = async (nextPlants: Plant[]) => {
      updatePlants(nextPlants);
      await saveContactPageData(buildContactPageWithPlants(nextPlants));
    };

    const updateDepartments = (next: Department[]) => {
      setContent((p) => ({
        ...p,
        contactPage: buildContactPageWithDepartments(next),
      }));
    };

    const saveDepartments = async (nextDepartments: Department[]) => {
      updateDepartments(nextDepartments);
      await saveContactPageData(buildContactPageWithDepartments(nextDepartments));
    };

    const resolvePreviewSrc = (src: string) => {
      if (src.startsWith("http://") || src.startsWith("https://")) return src;
      if (src.startsWith("/uploads/")) return `${API_URL}${src}`;
      return src;
    };

    const backgroundImage = String(contactPage.backgroundImage ?? "");

    return (
      <div className="flex min-w-0 flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Contact Page</h2>
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Hero Background Image</p>
            <p className="text-xs text-gray-500">
              PNG, JPG, or WebP. Recommended wide landscape image. Uploads save automatically.
            </p>
            {backgroundImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePreviewSrc(backgroundImage)}
                  alt="Contact hero preview"
                  className="aspect-[21/9] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No background image uploaded
              </div>
            )}
            <p className="truncate text-xs text-gray-400">
              {backgroundImage || "No image set — navy background will show as fallback"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingContactHeroImage ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingContactHeroImage ? "Uploading…" : backgroundImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingContactHeroImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingContactHeroImage(true);
                    try {
                      const url = await uploadImage(file, backgroundImage);
                      updateField("contactPage", "backgroundImage", url);
                      await saveContentSection("contactPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingContactHeroImage(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  disabled={uploadingContactHeroImage}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(backgroundImage))) return;
                    updateField("contactPage", "backgroundImage", "");
                    try {
                      await saveContentSection("contactPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
          {renderField("contactPage", "heading", "Heading")}
          {renderField("contactPage", "description", "Description", true)}
          {renderField("contactPage", "phone1", "Phone 1")}
          {renderField("contactPage", "phone2", "Phone 2")}
          {renderField("contactPage", "email", "Email 1")}
          {renderField("contactPage", "email2", "Email 2")}
          {renderField("contactPage", "address1", "Corporate Office Address", true)}
          {renderField("contactPage", "locationMapUrl", "Location Map Embed URL", true)}
          <div className="min-w-0 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="mb-2 text-xs leading-relaxed font-medium text-amber-900">
              ⚠️ <strong>IMPORTANT: You must use the EMBED URL format, not a regular sharing link!</strong>
            </p>
            <p className="mb-3 text-xs leading-relaxed text-amber-800">
              <strong className="text-red-700">❌ WRONG:</strong> <code className="rounded bg-amber-100 px-1 break-all">https://maps.app.goo.gl/...</code> or <code className="rounded bg-amber-100 px-1 break-all">https://goo.gl/maps/...</code>
              <br />
              <strong className="text-green-700">✓ CORRECT:</strong> <code className="rounded bg-amber-100 px-1 break-all">https://www.google.com/maps/embed?pb=...</code>
            </p>
            <div className="space-y-1 rounded bg-white/50 p-2 text-xs leading-relaxed text-amber-900">
              <p className="font-semibold">How to get the correct embed URL:</p>
              <p>1. Open Google Maps on desktop (maps.google.com)</p>
              <p>2. Search for your location</p>
              <p>3. Click the <strong>&quot;Share&quot;</strong> button</p>
              <p>4. Click the <strong>&quot;Embed a map&quot;</strong> tab</p>
              <p>5. Click <strong>&quot;COPY HTML&quot;</strong></p>
              <p>6. Paste it somewhere and find the URL inside <code className="bg-amber-100 px-1 rounded">src=&quot;...&quot;</code></p>
              <p>7. Copy ONLY that URL and paste it here</p>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Our Plants</h3>
              <p className="mt-1 text-xs text-gray-500">
                Edit each plant&apos;s title, address, and map link, then click Save on that plant or Save All Plants.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await savePlants(plants);
                  } catch {
                    alert("Failed to save plants");
                  }
                }}
                disabled={saving || plants.length === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save All Plants
              </button>
              <button
                type="button"
                onClick={() =>
                  updatePlants([
                    ...plants,
                    { name: "PLANT 5 – NEW LOCATION", address: "Enter plant address", image: "", mapUrl: "" },
                  ])
                }
                className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
              >
                + Add Plant
              </button>
            </div>
          </div>
          {plants.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
              No plants added yet.
            </p>
          ) : (
            plants.map((plant, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Plant {i + 1}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (plant.image) {
                        await deleteManagedMedia(plant.image, { alertOnError: false });
                      }
                      const next = plants.filter((_, idx) => idx !== i);
                      try {
                        await savePlants(next);
                      } catch {
                        alert("Failed to remove plant");
                      }
                    }}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Plant Title
                  </label>
                  <input
                    type="text"
                    placeholder="PLANT 1 – NOIDA"
                    value={plant.name}
                    onChange={(e) => {
                      const next = [...plants];
                      next[i] = { ...next[i], name: e.target.value };
                      updatePlants(next);
                    }}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Plant Address
                  </label>
                  <textarea
                    placeholder="Full plant address"
                    value={plant.address}
                    rows={3}
                    onChange={(e) => {
                      const next = [...plants];
                      next[i] = { ...next[i], address: e.target.value };
                      updatePlants(next);
                    }}
                    className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Map Link
                  </label>
                  <textarea
                    placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/..."
                    value={plant.mapUrl ?? ""}
                    rows={2}
                    onChange={(e) => {
                      const next = [...plants];
                      next[i] = { ...next[i], mapUrl: e.target.value };
                      updatePlants(next);
                    }}
                    className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm break-all text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                  <p className="text-xs text-gray-500">
                    Google Maps link for this plant. If empty, the address above opens Google Maps on click.
                  </p>
                </div>

                <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-3">
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Plant Image</p>
                  {plant.image ? (
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvePreviewSrc(plant.image)}
                        alt="Plant preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 ${uploadingPlantIndex === i ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {uploadingPlantIndex === i
                        ? "Uploading…"
                        : plant.image
                          ? "Replace Image"
                          : "Upload Image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        disabled={uploadingPlantIndex === i}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingPlantIndex(i);
                          try {
                            const url = await uploadImage(file, plant.image);
                            const next = [...plants];
                            next[i] = { ...next[i], image: url };
                            await savePlants(next);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploadingPlantIndex(null);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                    {plant.image ? (
                      <button
                        type="button"
                        disabled={uploadingPlantIndex === i}
                        onClick={async () => {
                          if (plant.image && !(await deleteManagedMedia(plant.image))) return;
                          const next = [...plants];
                          next[i] = { ...next[i], image: "" };
                          try {
                            await savePlants(next);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Failed to remove image");
                          }
                        }}
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove Image
                      </button>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await savePlants(plants);
                    } catch {
                      alert("Failed to save plant");
                    }
                  }}
                  disabled={saving}
                  className="self-start rounded-lg bg-[var(--primary-orange)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b8451a] disabled:opacity-50"
                >
                  Save Plant
                </button>
              </div>
            ))
          )}
          <hr className="border-gray-100" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Department Contacts</h3>
              <p className="mt-1 text-xs text-gray-500">
                Sales, support, and careers blocks shown at the bottom of the contact page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await saveDepartments(departments);
                  } catch {
                    alert("Failed to save departments");
                  }
                }}
                disabled={saving || departments.length === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save All Departments
              </button>
              <button
                type="button"
                onClick={() =>
                  updateDepartments([
                    ...departments,
                    {
                      title: "NEW DEPARTMENT",
                      description: "Enter department description",
                      email: "contact@gallerindia.com",
                      icon: "headset",
                    },
                  ])
                }
                className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
              >
                + Add Department
              </button>
            </div>
          </div>
          {departments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
              No departments added yet.
            </p>
          ) : (
            departments.map((dept, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Department {i + 1}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = departments.filter((_, idx) => idx !== i);
                      try {
                        await saveDepartments(next);
                      } catch {
                        alert("Failed to remove department");
                      }
                    }}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="SALES ENQUIRIES"
                    value={dept.title}
                    onChange={(e) => {
                      const next = [...departments];
                      next[i] = { ...next[i], title: e.target.value };
                      updateDepartments(next);
                    }}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Description
                  </label>
                  <textarea
                    placeholder="For product information and quotations"
                    value={dept.description}
                    rows={2}
                    onChange={(e) => {
                      const next = [...departments];
                      next[i] = { ...next[i], description: e.target.value };
                      updateDepartments(next);
                    }}
                    className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="sales@gallerindia.com"
                    value={dept.email}
                    onChange={(e) => {
                      const next = [...departments];
                      next[i] = { ...next[i], email: e.target.value };
                      updateDepartments(next);
                    }}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Icon
                  </label>
                  <select
                    value={dept.icon}
                    onChange={(e) => {
                      const next = [...departments];
                      next[i] = {
                        ...next[i],
                        icon: e.target.value as Department["icon"],
                      };
                      updateDepartments(next);
                    }}
                    className="min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[var(--primary-orange)]"
                  >
                    <option value="headset">Headset (Sales)</option>
                    <option value="gear">Gear (Technical Support)</option>
                    <option value="person">Person (Careers)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await saveDepartments(departments);
                    } catch {
                      alert("Failed to save department");
                    }
                  }}
                  disabled={saving}
                  className="self-start rounded-lg bg-[var(--primary-orange)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b8451a] disabled:opacity-50"
                >
                  Save Department
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderContactSubmissions = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Form Submissions</h2>
        <button
          type="button"
          onClick={fetchContactSubmissions}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {contactSubmissions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No submissions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {contactSubmissions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedSubmission(item);
                  if (!item.read) markSubmissionRead(item.id);
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedSubmission?.id === item.id
                    ? "border-[var(--primary-orange)] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${item.read ? "text-gray-700" : "text-[#1a1a1a]"}`}>
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.subject}</p>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-[var(--primary-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedSubmission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">From</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedSubmission.fullName}</p>
                  {selectedSubmission.companyName ? (
                    <p className="text-sm text-gray-500">{selectedSubmission.companyName}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email</p>
                    <a href={`mailto:${selectedSubmission.email}`} className="mt-1 block text-sm text-[var(--primary-orange)]">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedSubmission.phone || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Subject</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Message</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedSubmission.message}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedSubmission.emailSent ? "Email notification sent" : "Saved without email notification"} ·{" "}
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-gray-400">Select a submission to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderProjectSubmissions = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Start Project Submissions</h2>
        <button
          type="button"
          onClick={fetchProjectSubmissions}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {projectSubmissions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No submissions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {projectSubmissions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedProjectSubmission(item);
                  if (!item.read) markProjectSubmissionRead(item.id);
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedProjectSubmission?.id === item.id
                    ? "border-[var(--primary-orange)] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${item.read ? "text-gray-700" : "text-[#1a1a1a]"}`}>
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.companyName}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.subject}</p>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-[var(--primary-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedProjectSubmission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">From</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedProjectSubmission.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedProjectSubmission.companyName}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email</p>
                    <a href={`mailto:${selectedProjectSubmission.email}`} className="mt-1 block text-sm text-[var(--primary-orange)]">
                      {selectedProjectSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedProjectSubmission.phone || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Subject</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedProjectSubmission.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Details</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedProjectSubmission.details}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedProjectSubmission.emailSent ? "Email notification sent" : "Saved without email notification"} ·{" "}
                  {new Date(selectedProjectSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-gray-400">Select a submission to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkWithUsSubmissions = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Work With Us Queries</h2>
        <button
          type="button"
          onClick={fetchWorkWithUsSubmissions}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {workWithUsSubmissions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No submissions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {workWithUsSubmissions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedWorkWithUsSubmission(item);
                  if (!item.read) markWorkWithUsSubmissionRead(item.id);
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedWorkWithUsSubmission?.id === item.id
                    ? "border-[var(--primary-orange)] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${item.read ? "text-gray-700" : "text-[#1a1a1a]"}`}>
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.workType || item.subject}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.companyName}</p>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-[var(--primary-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedWorkWithUsSubmission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">From</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedWorkWithUsSubmission.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedWorkWithUsSubmission.companyName}</p>
                </div>
                {selectedWorkWithUsSubmission.workType ? (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Service</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedWorkWithUsSubmission.workType}</p>
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email</p>
                    <a href={`mailto:${selectedWorkWithUsSubmission.email}`} className="mt-1 block text-sm text-[var(--primary-orange)]">
                      {selectedWorkWithUsSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedWorkWithUsSubmission.phone || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Subject</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedWorkWithUsSubmission.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Details</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {selectedWorkWithUsSubmission.details}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedWorkWithUsSubmission.emailSent ? "Email notification sent" : "Saved without email notification"} ·{" "}
                  {new Date(selectedWorkWithUsSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-gray-400">Select a submission to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderCareersHero = () => {
    const hero = (content.careersPage as Record<string, unknown> | undefined)?.hero as Record<string, unknown> | undefined;
    const heroImage = String(hero?.image ?? "");

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Careers Page — Hero Section</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700">Hero Image</p>
            <p className="text-xs text-gray-500">PNG, JPG, or WebP. Shown on the right side of the hero on desktop.</p>
            {heroImage ? (
              <div className="overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolvePreviewSrc(heroImage)} alt="Careers hero preview" className="aspect-[5/4] w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[5/4] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                No hero image uploaded
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingCareersHeroImage ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploadingCareersHeroImage ? "Uploading…" : heroImage ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  disabled={uploadingCareersHeroImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingCareersHeroImage(true);
                    try {
                      const url = await uploadImage(file, heroImage);
                      updateNestedField("careersPage", ["hero", "image"], url);
                      await saveContentSection("careersPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingCareersHeroImage(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              {heroImage ? (
                <button
                  type="button"
                  disabled={uploadingCareersHeroImage}
                  onClick={async () => {
                    if (!(await deleteManagedMedia(heroImage))) return;
                    updateNestedField("careersPage", ["hero", "image"], "");
                    try {
                      await saveContentSection("careersPage");
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove image");
                    }
                  }}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </div>
          {renderField("careersPage", "hero.headingLine1", "Heading Line 1", false, ["hero", "headingLine1"])}
          {renderField("careersPage", "hero.headingLine2", "Heading Line 2", false, ["hero", "headingLine2"])}
          {renderField("careersPage", "hero.headingLine3", "Heading Line 3", false, ["hero", "headingLine3"])}
          {renderField("careersPage", "hero.description", "Description", true, ["hero", "description"])}
          {renderField("careersPage", "hero.viewPositionsText", "View Positions Button", false, ["hero", "viewPositionsText"])}
          {renderField("careersPage", "hero.submitResumeText", "Submit Resume Button", false, ["hero", "submitResumeText"])}
        </div>
      </div>
    );
  };

  const renderCareersWhyWork = () => {
    type Benefit = { title: string; description: string; icon?: string };
    const benefits =
      (((content.careersPage as Record<string, unknown>)?.whyWork as Record<string, unknown>)?.benefits as Benefit[]) ??
      [];

    const updateBenefits = (next: Benefit[]) => {
      setContent((p) => ({
        ...p,
        careersPage: {
          ...(p.careersPage as Record<string, unknown>),
          whyWork: {
            ...((p.careersPage as Record<string, unknown>)?.whyWork as Record<string, unknown>),
            benefits: next,
          },
        },
      }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Careers Page — Why Work at Galler</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("careersPage", "whyWork.heading", "Section Heading", false, ["whyWork", "heading"])}
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Benefits</h3>
            <button
              type="button"
              onClick={() =>
                updateBenefits([...benefits, { title: "NEW BENEFIT", description: "", icon: "meaningful" }])
              }
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >
              + Add Benefit
            </button>
          </div>
          {benefits.map((benefit, i) => (
            <div key={`${benefit.title}-${i}`} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={benefit.title}
                  onChange={(e) => {
                    const next = [...benefits];
                    next[i] = { ...next[i], title: e.target.value };
                    updateBenefits(next);
                  }}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                />
                <button
                  type="button"
                  onClick={() => updateBenefits(benefits.filter((_, idx) => idx !== i))}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Description"
                value={benefit.description}
                onChange={(e) => {
                  const next = [...benefits];
                  next[i] = { ...next[i], description: e.target.value };
                  updateBenefits(next);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCareersLife = () => {
    type GalleryImage = { id: string; src: string; label: string };
    const images =
      (((content.careersPage as Record<string, unknown>)?.lifeAtGaller as Record<string, unknown>)?.images as GalleryImage[]) ??
      [];

    const updateImages = (next: GalleryImage[]) => {
      setContent((p) => ({
        ...p,
        careersPage: {
          ...(p.careersPage as Record<string, unknown>),
          lifeAtGaller: {
            ...((p.careersPage as Record<string, unknown>)?.lifeAtGaller as Record<string, unknown>),
            images: next,
          },
        },
      }));
    };

    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Careers Page — Life at Galler</h2>
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          {renderField("careersPage", "lifeAtGaller.heading", "Section Heading", false, ["lifeAtGaller", "heading"])}
          {renderField("careersPage", "lifeAtGaller.subtitle", "Subtitle", false, ["lifeAtGaller", "subtitle"])}
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Gallery Images</h3>
              <p className="mt-1 text-xs text-gray-500">
                Add as many photos as you need — 6, 20, or more. Use + Add Image for each new slot.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateImages([...images, { id: String(Date.now()), src: "", label: "New Image" }])
              }
              className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
            >
              + Add Image
            </button>
          </div>
          {images.map((image, i) => (
            <div key={image.id} className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:w-48">
                {image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolvePreviewSrc(image.src)} alt={image.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">No image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={image.label}
                    onChange={(e) => {
                      const next = [...images];
                      next[i] = { ...next[i], label: e.target.value };
                      updateImages(next);
                    }}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (image.src) await deleteManagedMedia(image.src, { alertOnError: false });
                      updateImages(images.filter((_, idx) => idx !== i));
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label
                    className={`cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${uploadingCareersGalleryIndex === i ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {uploadingCareersGalleryIndex === i ? "Uploading…" : image.src ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      disabled={uploadingCareersGalleryIndex === i}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCareersGalleryIndex(i);
                        try {
                          const url = await uploadImage(file, image.src);
                          const next = [...images];
                          next[i] = { ...next[i], src: url };
                          updateImages(next);
                          await saveContentSection("careersPage");
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploadingCareersGalleryIndex(null);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  {image.src ? (
                    <button
                      type="button"
                      disabled={uploadingCareersGalleryIndex === i}
                      onClick={async () => {
                        if (image.src && !(await deleteManagedMedia(image.src))) return;
                        const next = [...images];
                        next[i] = { ...next[i], src: "" };
                        updateImages(next);
                        await saveContentSection("careersPage");
                      }}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCareersOpeningsSidebar = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#1a1a1a]">Careers Page — Openings Sidebar</h2>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        {renderField("careersPage", "openingsSidebar.ctaHeading", "CTA Heading", false, ["openingsSidebar", "ctaHeading"])}
        {renderField("careersPage", "openingsSidebar.ctaParagraph1", "CTA Paragraph 1", true, ["openingsSidebar", "ctaParagraph1"])}
        {renderField("careersPage", "openingsSidebar.ctaParagraph2", "CTA Paragraph 2", true, ["openingsSidebar", "ctaParagraph2"])}
        {renderField("careersPage", "openingsSidebar.ctaButtonText", "CTA Button Text", false, ["openingsSidebar", "ctaButtonText"])}
        <hr className="border-gray-100" />
        {renderField("careersPage", "openingsSidebar.networkHeading", "Talent Network Heading", false, ["openingsSidebar", "networkHeading"])}
        {renderField("careersPage", "openingsSidebar.networkDescription", "Talent Network Description", true, ["openingsSidebar", "networkDescription"])}
      </div>
    </div>
  );

  const renderCareersHiring = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#1a1a1a]">Careers Page — Hiring Process</h2>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        {renderField("careersPage", "hiringProcess.heading", "Section Heading", false, ["hiringProcess", "heading"])}
        <hr className="border-gray-100" />
        <h3 className="text-sm font-semibold text-gray-700">Contact Banner</h3>
        {renderField("careersPage", "hiringProcess.contactBanner.heading", "Banner Heading", false, ["hiringProcess", "contactBanner", "heading"])}
        {renderField("careersPage", "hiringProcess.contactBanner.description", "Banner Description", false, ["hiringProcess", "contactBanner", "description"])}
        {renderField("careersPage", "hiringProcess.contactBanner.email", "Email", false, ["hiringProcess", "contactBanner", "email"])}
        {renderField("careersPage", "hiringProcess.contactBanner.phone", "Phone", false, ["hiringProcess", "contactBanner", "phone"])}
        {renderField("careersPage", "hiringProcess.contactBanner.buttonText", "Button Text", false, ["hiringProcess", "contactBanner", "buttonText"])}
      </div>
    </div>
  );

  const renderCareersJobs = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Job Openings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage current openings shown on the careers page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingJob(emptyJob())}
          className="rounded-xl bg-[var(--primary-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b8451a]"
        >
          + Add Opening
        </button>
      </div>

      {editingJob ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">
            {editingJob.id ? "Edit Job Opening" : "New Job Opening"}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Category</label>
              <select
                value={editingJob.category}
                onChange={(e) =>
                  setEditingJob((prev) =>
                    prev
                      ? {
                          ...prev,
                          category: e.target.value as CareersJobData["category"],
                          department:
                            JOB_CATEGORY_OPTIONS.find((item) => item.value === e.target.value)?.label ||
                            e.target.value,
                        }
                      : prev
                  )
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              >
                {JOB_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Job Type</label>
              <select
                value={editingJob.type}
                onChange={(e) =>
                  setEditingJob((prev) =>
                    prev ? { ...prev, type: e.target.value as CareersJobData["type"] } : prev
                  )
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              >
                {JOB_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Job Title</label>
              <input
                type="text"
                value={editingJob.title}
                onChange={(e) => setEditingJob((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Location</label>
              <input
                type="text"
                value={editingJob.location}
                onChange={(e) => setEditingJob((prev) => (prev ? { ...prev, location: e.target.value } : prev))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Experience</label>
              <input
                type="text"
                value={editingJob.experience}
                onChange={(e) => setEditingJob((prev) => (prev ? { ...prev, experience: e.target.value } : prev))}
                placeholder="e.g. 2-5 Years"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Description Points
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setEditingJob((prev) =>
                      prev ? { ...prev, descriptionPoints: [...prev.descriptionPoints, ""] } : prev
                    )
                  }
                  className="rounded-lg bg-[var(--primary-orange)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b8451a]"
                >
                  + Add Point
                </button>
              </div>
              <p className="text-xs text-gray-500">
                The first two points appear on the careers page. Remaining points show when candidates click
                &quot;View Details&quot;.
              </p>
              <div className="flex flex-col gap-3">
                {editingJob.descriptionPoints.map((point, index) => (
                  <div key={`job-point-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) =>
                        setEditingJob((prev) => {
                          if (!prev) return prev;
                          const nextPoints = [...prev.descriptionPoints];
                          nextPoints[index] = e.target.value;
                          return { ...prev, descriptionPoints: nextPoints };
                        })
                      }
                      placeholder={`Point ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary-orange)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingJob((prev) => {
                          if (!prev) return prev;
                          const nextPoints = prev.descriptionPoints.filter((_, i) => i !== index);
                          return {
                            ...prev,
                            descriptionPoints: nextPoints.length > 0 ? nextPoints : [""],
                          };
                        })
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => saveCareersJob(editingJob)}
              className="rounded-lg bg-[#0b1f4a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a1840]"
            >
              Save Opening
            </button>
            <button
              type="button"
              onClick={() => setEditingJob(null)}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {careersJobs.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No job openings yet. Click &quot;Add Opening&quot; to create one.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {careersJobs.map((job) => (
            <div key={job.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-[#1a1a1a]">{job.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {job.department} · {job.location} · {job.experience} · {job.type}
                  </p>
                  {job.descriptionPoints.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                      {job.descriptionPoints.slice(0, 2).map((point, index) => (
                        <li key={`${job.id}-preview-${index}`}>{point}</li>
                      ))}
                      {job.descriptionPoints.length > 2 ? (
                        <li className="list-none pl-0 text-gray-400">
                          +{job.descriptionPoints.length - 2} more point
                          {job.descriptionPoints.length - 2 === 1 ? "" : "s"}
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingJob(enrichCareersJob(job))}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCareersJob(job.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderJobApplications = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Job Applications</h2>
        <button
          type="button"
          onClick={fetchJobApplications}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {jobApplications.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No job applications yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {jobApplications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedApplication(item);
                  if (!item.read) markApplicationRead(item.id);
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedApplication?.id === item.id
                    ? "border-[var(--primary-orange)] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${item.read ? "text-gray-700" : "text-[#1a1a1a]"}`}>
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.jobTitle}</p>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-[var(--primary-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedApplication ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Applied For</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedApplication.jobTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{selectedApplication.jobDescription}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {selectedApplication.jobLocation} · {selectedApplication.jobExperience} · {selectedApplication.jobType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Candidate</p>
                  <p className="mt-1 text-base font-semibold text-[#1a1a1a]">{selectedApplication.fullName}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email</p>
                    <a href={`mailto:${selectedApplication.email}`} className="mt-1 block text-sm text-[var(--primary-orange)]">
                      {selectedApplication.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedApplication.phone || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Resume</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedApplication.resumeOriginalName}</p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadJobApplication(selectedApplication.id, selectedApplication.resumeOriginalName)
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0b1f4a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0a1840]"
                  >
                    Download Resume
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(selectedApplication.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-gray-400">Select an application to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderResumeSubmissions = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1a1a1a]">General Resume Submissions</h2>
        <button
          type="button"
          onClick={fetchResumeSubmissions}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {resumeSubmissions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No resume submissions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            {resumeSubmissions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedResume(item);
                  if (!item.read) markResumeRead(item.id);
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedResume?.id === item.id
                    ? "border-[var(--primary-orange)] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${item.read ? "text-gray-700" : "text-[#1a1a1a]"}`}>
                      {item.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{item.email}</p>
                  </div>
                  {!item.read ? (
                    <span className="rounded-full bg-[var(--primary-orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                      NEW
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 truncate text-xs text-gray-400">{item.resumeOriginalName}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {selectedResume ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Candidate</p>
                  <p className="mt-1 text-lg font-semibold text-[#1a1a1a]">{selectedResume.fullName}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Email</p>
                    <a href={`mailto:${selectedResume.email}`} className="mt-1 block text-sm text-[var(--primary-orange)]">
                      {selectedResume.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Phone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedResume.phone || "—"}</p>
                  </div>
                </div>
                {selectedResume.message ? (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Message</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {selectedResume.message}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Resume</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedResume.resumeOriginalName}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {(selectedResume.resumeSize / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadResume(selectedResume.id, selectedResume.resumeOriginalName)
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0b1f4a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0a1840]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download Resume
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(selectedResume.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="py-12 text-center text-gray-400">Select a submission to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const activeNewsletterCount = newsletterSubscribers.filter((item) => item.status === "active").length;

  const renderNewsletterSubscribers = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Newsletter Subscribers</h2>
          <p className="mt-1 text-sm text-gray-500">
            {activeNewsletterCount} active · {newsletterSubscribers.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={fetchNewsletterSubscribers}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]"
        >
          Refresh
        </button>
      </div>

      {newsletterSubscribers.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          No subscribers yet. They will appear here when users sign up from the footer.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Subscribed</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newsletterSubscribers.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-b-0">
                    <td className="px-6 py-4 font-medium text-[#1a1a1a]">{item.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(item.subscribedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatNewsletterSource(item.source)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeNewsletterSubscriber(item.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderNewsletterSend = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a1a1a]">Send Newsletter</h2>
        <p className="mt-1 text-sm text-gray-500">
          Compose and send to {activeNewsletterCount} active subscriber{activeNewsletterCount === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Email sending requires a Resend API key. Until your domain is verified, only test emails may work.
        Subscribers are still collected without email sending configured.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subject</label>
            <input
              type="text"
              value={newsletterSubject}
              onChange={(e) => setNewsletterSubject(e.target.value)}
              placeholder="Newsletter subject line"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[var(--primary-orange)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message</label>
            <textarea
              value={newsletterBody}
              onChange={(e) => setNewsletterBody(e.target.value)}
              rows={12}
              placeholder="Write your newsletter message here..."
              className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[var(--primary-orange)]"
            />
          </div>

          {newsletterSendError ? (
            <p className="text-sm text-red-600">{newsletterSendError}</p>
          ) : null}
          {newsletterSendMessage ? (
            <p className="text-sm text-green-600">{newsletterSendMessage}</p>
          ) : null}

          <button
            type="button"
            onClick={sendNewsletter}
            disabled={newsletterSending || activeNewsletterCount === 0}
            className="rounded-xl bg-[var(--primary-orange)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b8451a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {newsletterSending
              ? "Sending…"
              : `Send to ${activeNewsletterCount} subscriber${activeNewsletterCount === 1 ? "" : "s"}`}
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Send History</h3>
            <button
              type="button"
              onClick={fetchNewsletterCampaigns}
              className="text-sm font-medium text-gray-500 hover:text-[var(--primary-orange)]"
            >
              Refresh
            </button>
          </div>

          {newsletterCampaigns.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No newsletters sent yet.</p>
          ) : (
            <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto">
              {newsletterCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-gray-100 p-4">
                  <p className="font-semibold text-[#1a1a1a]">{campaign.subject}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{campaign.bodyPreview}</p>
                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(campaign.createdAt).toLocaleString()} · Sent {campaign.sentCount}/
                    {campaign.recipientCount}
                    {campaign.failedCount > 0 ? ` · ${campaign.failedCount} failed` : ""}
                  </p>
                  {campaign.note ? (
                    <p className="mt-2 text-xs text-amber-700">{campaign.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#1a1a1a]">Footer</h2>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700">Newsletter</h3>
        {renderField("footer", "newsletter.heading", "Heading", false, ["newsletter", "heading"])}
        {renderField("footer", "newsletter.description", "Description", true, ["newsletter", "description"])}
        <hr className="border-gray-100" />
        <h3 className="text-sm font-semibold text-gray-700">Contact Info</h3>
        {renderField("footer", "contact.address", "Address", true, ["contact", "address"])}
        {renderField("footer", "contact.phone", "Phone", false, ["contact", "phone"])}
        {renderField("footer", "contact.email", "Email", false, ["contact", "email"])}
        <hr className="border-gray-100" />
        <h3 className="text-sm font-semibold text-gray-700">Social Media</h3>
        {renderField("footer", "social.instagram", "Instagram URL", false, ["social", "instagram"])}
        {renderField("footer", "social.linkedin", "LinkedIn URL", false, ["social", "linkedin"])}
        {renderField("footer", "social.youtube", "YouTube URL", false, ["social", "youtube"])}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Pages Managed", value: "7", color: "bg-blue-50 text-blue-600" },
          { label: "Industries", value: String(((content.homeIndustries as Record<string, unknown>)?.items as unknown[])?.length ?? 0), color: "bg-green-50 text-green-600" },
          { label: "Job Openings", value: String(careersJobs.length), color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className={`mt-2 inline-block rounded-lg px-3 py-1 text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1a1a1a]">Quick Navigation</h3>
        <div className="flex flex-wrap gap-3">
          {sidebarGroups.flatMap((g) => g.items.slice(0, 2)).map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]">
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--primary-orange)]" />
      </div>
    );
    if (activeSection === "dashboard") return renderDashboard();
    if (activeSection === "home-hero") return renderHomeHero();
    if (activeSection === "home-about") return renderHomeAbout();
    if (activeSection === "home-our-services") return renderHomeOurServices();
    if (activeSection === "home-industries") return renderHomeIndustries();
    if (activeSection === "home-work-with-us") return renderHomeWorkWithUs();
    if (activeSection === "work-with-us-submissions") return renderWorkWithUsSubmissions();
    if (activeSection === "home-certificates") return renderHomeCertificates();
    if (activeSection === "industries-details") return renderIndustriesDetails();
    if (activeSection === "home-marquee") return renderHomeMarquee();
    if (activeSection === "about-hero-content") return renderAboutHeroContent();
    if (activeSection === "about-intro-section") return renderAboutIntroSection();
    if (activeSection === "about-journey-timeline") return renderAboutJourneyTimeline();
    if (activeSection === "about-dimensions") return renderAboutDimensions();
    if (activeSection === "about-team") return renderAboutTeam();
    if (activeSection === "about-achievements") return renderAboutAchievements();
    if (activeSection === "about-requirement") return renderAboutRequirement();
    if (activeSection === "projects-hero") return renderProjectsHero();
    if (activeSection === "project-submissions") return renderProjectSubmissions();
    if (activeSection === "contact") return renderContact();
    if (activeSection === "contact-submissions") return renderContactSubmissions();
    if (activeSection === "careers-hero") return renderCareersHero();
    if (activeSection === "careers-why-work") return renderCareersWhyWork();
    if (activeSection === "careers-life") return renderCareersLife();
    if (activeSection === "careers-openings-sidebar") return renderCareersOpeningsSidebar();
    if (activeSection === "careers-hiring") return renderCareersHiring();
    if (activeSection === "careers-jobs") return renderCareersJobs();
    if (activeSection === "careers-resumes") return renderResumeSubmissions();
    if (activeSection === "careers-applications") return renderJobApplications();
    if (activeSection === "footer") return renderFooter();
    if (activeSection === "newsletter-subscribers") return renderNewsletterSubscribers();
    if (activeSection === "newsletter-send") return renderNewsletterSend();
    return null;
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a]">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">Galler Admin</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {/* Dashboard */}
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeSection === "dashboard" ? "bg-orange-50 text-[var(--primary-orange)]" : "text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a]"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            Dashboard
          </button>

          {/* Groups */}
          {sidebarGroups.map((group) => {
            const items = group.items;

            return (
            <div key={group.label} className="mt-2">
              <button
                onClick={() => setSidebarOpen((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-gray-600"
              >
                {group.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${sidebarOpen[group.label] ? "rotate-180" : ""}`}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>
              {sidebarOpen[group.label] && (
                <div className="mt-0.5 flex flex-col gap-0.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${activeSection === item.id ? "bg-orange-50 font-semibold text-[var(--primary-orange)]" : "text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a]"}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3">
          <Link href="/" className="mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-[#1a1a1a]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
            View Website
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h1 className="text-lg font-semibold text-[#1a1a1a]">Content Management</h1>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm font-medium text-green-600">Changes saved ✓</span>}
            {activeSection !== "dashboard" &&
              activeSection !== "contact-submissions" &&
              activeSection !== "project-submissions" &&
              activeSection !== "newsletter-subscribers" &&
              activeSection !== "newsletter-send" && (
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[var(--primary-orange)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b8451a] disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#f9f9f9] p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
