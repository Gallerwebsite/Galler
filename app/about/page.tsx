import type { Metadata } from "next";
import { API_URL } from "../lib/apiUrl";
import type { SiteContent } from "../lib/getContent";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import AboutHero from "../components/about/AboutHero";
import AboutSectionTwo from "../components/about/AboutSectionTwo";
import JourneyCarousel from "../components/about/JourneyCarousel";
import AboutDimensions from "../components/about/AboutDimensions";
import AboutTeamSection from "../components/about/AboutTeamSection";
import AboutAchievementsContact from "../components/about/AboutAchievementsContact";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "About Us — Galler Engineering",
  description:
    "Learn about Galler — a global provider of engineering, manufacturing, and technology solutions.",
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

export default async function AboutPage() {
  const content = await getContentFromAPI();
  const about = content?.about;
  const aboutPage = content?.aboutPage;

  return (
    <>
      <Navbar activePage="about" />
      <main>
        <AboutHero
          title={about?.title ?? "ABOUT US"}
          backgroundImage={about?.backgroundImage}
        />
        <AboutSectionTwo
          title={aboutPage?.introSection?.title}
          paragraph1={aboutPage?.introSection?.paragraph1}
          paragraph2={aboutPage?.introSection?.paragraph2}
        />
        <JourneyCarousel
          heading={aboutPage?.journeyTimeline?.heading}
          milestones={aboutPage?.journeyTimeline?.milestones}
          backgroundImage={aboutPage?.journeyTimeline?.backgroundImage}
        />
        <AboutDimensions
          heading={aboutPage?.dimensions?.heading}
          subtitle={aboutPage?.dimensions?.subtitle}
          cards={aboutPage?.dimensions?.cards}
        />
        <AboutTeamSection
          heading={aboutPage?.team?.heading}
          subtitle={aboutPage?.team?.subtitle}
          members={aboutPage?.team?.members}
        />
        <AboutAchievementsContact
          heading={aboutPage?.achievements?.heading}
          stats={aboutPage?.achievements?.stats}
          formHeading={aboutPage?.requirement?.heading}
          submitText={aboutPage?.requirement?.submitText}
          formBackgroundImage={aboutPage?.requirement?.backgroundImage}
          marquee={content?.marquee}
        />
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
