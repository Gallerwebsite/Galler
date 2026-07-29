import { API_URL } from "../lib/apiUrl";
import type { SiteContent } from "../lib/getContent";
import { getIndustriesFromContent } from "../lib/industries-data";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProjectsHero from "../components/projects/ProjectsHero";
import ProjectsIndustriesGrid from "../components/projects/ProjectsIndustriesGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Our Projects — Galler Engineering",
  description: "Explore our successfully implemented projects across industries",
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

export default async function ProjectsPage() {
  const content = await getContentFromAPI();
  const projectsPage = content?.projectsPage;
  const industries = getIndustriesFromContent(content);

  return (
    <>
      <Navbar activePage="our projects" />
      <main className="min-h-screen">
        <ProjectsHero
          heading={projectsPage?.hero?.heading}
          subtitle={projectsPage?.hero?.subtitle}
          ctaText={projectsPage?.hero?.ctaText}
          backgroundImage={projectsPage?.hero?.backgroundImage}
        />
        <ProjectsIndustriesGrid industries={industries} />
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
