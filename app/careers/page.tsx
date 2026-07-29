import type { Metadata } from "next";
import { API_URL } from "../lib/apiUrl";
import type { SiteContent, CareersJob } from "../lib/getContent";
import { enrichCareersJob } from "../lib/careers-data";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CareersHero from "../components/careers/CareersHero";
import WhyWorkAtGaller from "../components/careers/WhyWorkAtGaller";
import LifeAtGaller from "../components/careers/LifeAtGaller";
import CurrentOpenings from "../components/careers/CurrentOpenings";
import HiringProcess from "../components/careers/HiringProcess";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Careers — Galler Engineering",
  description:
    "Join Galler India and work on innovative solutions that power industries. Explore career opportunities in engineering, sales, manufacturing, and more.",
};

async function getContentFromAPI(): Promise<SiteContent | null> {
  try {
    const res = await fetch(`${API_URL}/api/content`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getCareersJobsFromAPI(): Promise<CareersJob[]> {
  try {
    const res = await fetch(`${API_URL}/api/careers/jobs`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data as CareersJob[]).map(enrichCareersJob);
  } catch {
    return [];
  }
}

export default async function CareersPage() {
  const content = await getContentFromAPI();
  const jobs = await getCareersJobsFromAPI();
  const careers = content?.careersPage;

  return (
    <>
      <Navbar activePage="careers" />
      <main className="min-h-screen bg-white">
        <CareersHero content={careers?.hero} />
        <WhyWorkAtGaller content={careers?.whyWork} />
        <LifeAtGaller content={careers?.lifeAtGaller} />
        <CurrentOpenings initialJobs={jobs} sidebarContent={careers?.openingsSidebar} />
        <HiringProcess content={careers?.hiringProcess} />
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
