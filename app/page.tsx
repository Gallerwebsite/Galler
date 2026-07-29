import { API_URL } from "./lib/apiUrl";
import type { SiteContent } from "./lib/getContent";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HeroSection from "./components/home/HeroSection";
import AboutSection from "./components/home/AboutSection";
import OurServicesSection from "./components/home/OurServicesSection";
import IndustriesSection from "./components/home/IndustriesSection";
import WorkWithUsSection from "./components/home/WorkWithUsSection";
import CertificatesSection from "./components/home/CertificatesSection";
import LogoMarquee from "./components/home/LogoMarquee";

// Re-fetch content from API on every request so admin changes appear immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Home() {
  const content = await getContentFromAPI();

  return (
    <>
      <Navbar activePage="home" />
      <main>
        <HeroSection content={content?.hero} />
        <AboutSection content={content?.about} />
        <OurServicesSection content={content?.homeServices} />
        <IndustriesSection content={content?.homeIndustries} />
        <WorkWithUsSection content={content?.homeWorkWithUs} />
        <CertificatesSection content={content?.homeCertificates} />
      </main>
      <LogoMarquee content={content?.marquee} />
      <Footer content={content?.footer} />
    </>
  );
}
