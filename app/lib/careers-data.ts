export type JobCategory = "engineering" | "sales" | "operations" | "manufacturing" | "support";
export type JobType = "Full Time" | "PPO";

export interface CareersJob {
  id: string;
  title: string;
  descriptionPoints: string[];
  location: string;
  experience: string;
  type: JobType;
  category: JobCategory;
  department: string;
}

/** Number of description bullet points shown before "View Details" */
export const INITIAL_VISIBLE_JOB_POINTS = 2;

type RawCareersJob = CareersJob & { description?: string };

export function getJobDescriptionPoints(job: RawCareersJob): string[] {
  if (Array.isArray(job.descriptionPoints)) {
    return job.descriptionPoints.map((point) => point.trim()).filter(Boolean);
  }
  if (job.description?.trim()) {
    return [job.description.trim()];
  }
  return [];
}

export const JOB_CATEGORIES: { id: JobCategory | "all"; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "engineering", label: "ENGINEERING" },
  { id: "sales", label: "SALES & MARKETING" },
  { id: "operations", label: "OPERATIONS" },
  { id: "manufacturing", label: "MANUFACTURING" },
  { id: "support", label: "SUPPORT" },
];

export const JOB_TYPE_OPTIONS: JobType[] = ["Full Time", "PPO"];

export const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales & Marketing" },
  { value: "operations", label: "Operations" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "support", label: "Support" },
];

const CATEGORY_LABELS: Record<JobCategory, string> = {
  engineering: "Engineering",
  sales: "Sales & Marketing",
  operations: "Operations",
  manufacturing: "Manufacturing",
  support: "Support",
};

export function getDepartmentLabel(category: JobCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function enrichCareersJob(job: RawCareersJob): CareersJob {
  const { description: _legacyDescription, ...rest } = job;
  return {
    ...rest,
    descriptionPoints: getJobDescriptionPoints(job),
    department: job.department || getDepartmentLabel(job.category),
  };
}
