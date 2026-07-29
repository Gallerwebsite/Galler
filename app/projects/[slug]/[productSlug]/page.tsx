import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { API_URL } from "@/app/lib/apiUrl";
import type { SiteContent } from "@/app/lib/getContent";
import { getIndustriesFromContent } from "@/app/lib/industries-data";
import {
  getIndustryProducts,
  getIndustrySlug,
  getProductSlug,
} from "@/app/lib/industries-types";
import Navbar from "@/app/components/common/Navbar";
import Footer from "@/app/components/common/Footer";
import IndustryDetailContent from "@/app/components/industries/IndustryDetailContent";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const content = await getContentFromAPI();
  const industries = getIndustriesFromContent(content);
  const industry = industries.find((item) => getIndustrySlug(item) === slug);
  if (!industry) return {};
  const product = getIndustryProducts(industry).find(
    (item) => getProductSlug(item) === productSlug
  );
  if (!product) return {};
  return {
    title: `${product.name} – ${industry.name} – Galler`,
    description: product.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  const content = await getContentFromAPI();
  const industries = getIndustriesFromContent(content);
  const industry = industries.find((item) => getIndustrySlug(item) === slug);

  if (!industry) notFound();

  const product = getIndustryProducts(industry).find(
    (item) => getProductSlug(item) === productSlug
  );

  if (!product) notFound();

  return (
    <>
      <Navbar activePage="our projects" />
      <main>
        <IndustryDetailContent
          product={product}
          backLink={{
            href: `/projects/${getIndustrySlug(industry)}`,
            label: `Back to ${industry.name}`,
          }}
        />
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
