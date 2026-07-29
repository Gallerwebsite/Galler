import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; productSlug: string }>;
}

export default async function IndustryProductRedirectPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  redirect(`/projects/${slug}/${productSlug}`);
}
