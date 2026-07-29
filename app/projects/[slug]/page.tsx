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
import ProjectsIndustryHero from "@/app/components/projects/ProjectsIndustryHero";
import ProductPreviewCard from "@/app/components/shared/ProductPreviewCard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function ProjectIndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentFromAPI();
  const industries = getIndustriesFromContent(content);
  const industry = industries.find((item) => getIndustrySlug(item) === slug);

  if (!industry) {
    notFound();
  }

  const products = getIndustryProducts(industry);
  const industrySlug = getIndustrySlug(industry);

  return (
    <>
      <Navbar activePage="our projects" />
      <main className="min-h-screen">
        <ProjectsIndustryHero name={industry.name} backgroundImage={industry.image} />

        <section className="bg-gray-50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            {products.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <p className="font-century text-[15px] text-gray-400">
                  No products added for this industry yet
                </p>
              </div>
            ) : (
              <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <ProductPreviewCard
                    key={product.id}
                    name={product.name}
                    features={product.keyFeatures}
                    image={product.image}
                    detailHref={`/projects/${industrySlug}/${getProductSlug(product)}`}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer content={content?.footer} />
    </>
  );
}
