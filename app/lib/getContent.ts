import fs from "fs";
import path from "path";
import { enrichCareersJob, type CareersJob } from "./careers-data";

export type { CareersJob } from "./careers-data";

export interface SiteContent {
  hero: {
    title?: string;
    headingLine1?: string;
    headingLine2?: string;
    videoUrl?: string;
    since?: string;
    description?: string;
    ctaText?: string;
    location?: string;
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    backgroundImage?: string;
    stats: { value: string; label: string }[];
    ctaText: string;
  };
  stats: {
    clients: {
      label: string;
      count: string;
      description: string;
      rating: string;
    };
    experience: {
      period: string;
      count: string;
      description: string;
    };
  };
  footer: {
    newsletter: { heading: string; description: string };
    contact: { address: string; phone: string; email: string };
    social: { instagram: string; linkedin: string; youtube: string };
  };
  marquee?: {
    row1?: { id: string; src: string; alt: string }[];
    row2?: { id: string; src: string; alt: string }[];
    /** @deprecated legacy flat list */
    logos?: { id: string; src: string; alt: string }[];
  };
  aboutPage?: {
    hero: {
      tagline: string;
      heading: string;
      teamCount: string;
      teamLabel: string;
      coordinates: string;
    };
    banner: {
      description: string;
      teamButtonText: string;
      brochureText: string;
      scrollingText: string;
    };
    journey: {
      tagline: string;
      heading: string;
      headingHighlight: string;
      headingEnd: string;
      storyParagraph1: string;
      storyParagraph2: string;
      founderName: string;
      founderTitle: string;
      capabilities: string[];
    };
    journeyTimeline?: {
      heading: string;
      backgroundImage?: string;
      milestones: { year: string; description: string }[];
    };
    introSection?: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    dimensions?: {
      heading: string;
      subtitle: string;
      cards: {
        title: string;
        description: string;
        icon: "box" | "forklift" | "truck";
      }[];
    };
    team?: {
      heading: string;
      subtitle?: string;
      members: {
        id: string;
        name: string;
        photo: string;
        title?: string;
        linkedin: string;
        instagram: string;
        description: string;
      }[];
    };
    achievements?: {
      heading: string;
      stats: {
        value: string;
        label: string;
        tone: "team" | "devices" | "clients" | "industries";
        backgroundImage?: string;
      }[];
    };
    requirement?: {
      heading: string;
      submitText: string;
      backgroundImage?: string;
    };
  };
  contactPage?: {
    heading: string;
    description: string;
    backgroundImage?: string;
    phone1: string;
    phone2: string;
    email: string;
    email2?: string;
    address1: string;
    locationMapUrl?: string;
    plants?: {
      name: string;
      address: string;
      image?: string;
      mapUrl?: string;
    }[];
    departments?: {
      title: string;
      description: string;
      email: string;
      icon: "headset" | "gear" | "person";
    }[];
  };
  projectsPage?: {
    hero: {
      heading: string;
      subtitle: string;
      ctaText: string;
      backgroundImage?: string;
    };
  };
  homeServices?: {
    title: string;
    subtitle: string;
    categories: {
      id: string;
      number: number;
      title: string;
      icon: "design" | "manufacturing" | "lifecycle";
      items: string[];
    }[];
  };
  homeWorkWithUs?: {
    tagline: string;
    title: string;
    items: {
      id: string;
      number: string;
      title: string;
      description: string;
      icon: "odm" | "oem" | "reengineering";
      href?: string;
    }[];
  };
  homeCertificates?: {
    tagline: string;
    title: string;
    subtitle: string;
    items: {
      id: string;
      title: string;
      image: string;
    }[];
  };
  homeIndustries?: {
    title: string;
    watermarkWords?: string[];
    items: {
      id: string;
      slug?: string;
      name: string;
      image: string;
      products?: {
        id: string;
        slug?: string;
        name: string;
        image?: string;
        description?: string;
        keyFeatures?: string[];
        gallery?: {
          id: string;
          src: string;
          alt?: string;
          type?: "image" | "video";
          videoUrl?: string;
        }[];
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
      }[];
      description?: string;
      keyFeatures?: string[];
      gallery?: {
        id: string;
        src: string;
        alt?: string;
        type?: "image" | "video";
        videoUrl?: string;
      }[];
    }[];
  };
  careersPage?: {
    hero: {
      headingLine1: string;
      headingLine2: string;
      headingLine3: string;
      description: string;
      viewPositionsText: string;
      submitResumeText: string;
      image?: string;
    };
    whyWork: {
      heading: string;
      benefits: { title: string; description: string; icon?: string }[];
    };
    lifeAtGaller: {
      heading: string;
      subtitle: string;
      images: { id: string; src: string; label: string }[];
    };
    openingsSidebar: {
      ctaHeading: string;
      ctaParagraph1: string;
      ctaParagraph2: string;
      ctaButtonText: string;
      networkHeading: string;
      networkDescription: string;
    };
    hiringProcess: {
      heading: string;
      steps: { number: number; title: string; subtitle: string; icon?: string }[];
      contactBanner: {
        heading: string;
        description: string;
        email: string;
        phone: string;
        buttonText: string;
      };
    };
  };
}

const CONTENT_PATH = path.join(process.cwd(), "server", "data", "content.json");

export function getContent(): SiteContent | null {
  try {
    const raw = fs.readFileSync(CONTENT_PATH, "utf-8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
}

export function getCareersJobs(): CareersJob[] {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "server", "data", "careers-jobs.json"),
      "utf-8"
    );
    return (JSON.parse(raw) as CareersJob[]).map(enrichCareersJob);
  } catch {
    return [];
  }
}
