import type { Metadata } from "next";
import { API_URL } from "../lib/apiUrl";
import type { SiteContent } from "../lib/getContent";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ContactHero from "../components/contact/ContactHero";
import ContactMain from "../components/contact/ContactMain";
import ContactLocations from "../components/contact/ContactLocations";
import ContactDepartments from "../components/contact/ContactDepartments";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact — Galler Engineering",
  description:
    "Get in touch with Galler India for product inquiries, technical support, partnerships, and career opportunities.",
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

export default async function ContactPage() {
  const content = await getContentFromAPI();
  const contactPage = content?.contactPage;

  return (
    <>
      <Navbar activePage="contact" />
      <main className="min-h-screen bg-white">
        <ContactHero
          heading={contactPage?.heading}
          description={contactPage?.description}
          backgroundImage={contactPage?.backgroundImage}
        />
        <ContactMain
          phone1={contactPage?.phone1}
          phone2={contactPage?.phone2}
          email1={contactPage?.email}
          email2={contactPage?.email2}
          address={contactPage?.address1}
        />
        <ContactLocations 
          plants={contactPage?.plants}
          locationMapUrl={contactPage?.locationMapUrl}
        />
        <ContactDepartments departments={contactPage?.departments} />
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
