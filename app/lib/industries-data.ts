import { getContent } from "./getContent";
import type { SiteContent } from "./getContent";
import {
  getIndustryProducts,
  getIndustrySlug,
  getProductSlug,
  type IndustryItem,
  type IndustryProduct,
} from "./industries-types";

export type { IndustryGalleryItem, IndustryItem, IndustryProduct } from "./industries-types";
export {
  getIndustryGallery,
  getIndustryProducts,
  getIndustrySlug,
  getProductGallery,
  getProductSlug,
  slugifyIndustry,
} from "./industries-types";

export function getIndustriesFromContent(content: SiteContent | null | undefined): IndustryItem[] {
  return content?.homeIndustries?.items ?? [];
}

export function getIndustries(): IndustryItem[] {
  return getIndustriesFromContent(getContent());
}

export function getIndustryBySlug(slug: string): IndustryItem | undefined {
  return getIndustries().find((item) => getIndustrySlug(item) === slug);
}

export function getIndustryProduct(
  industrySlug: string,
  productSlug: string
): { industry: IndustryItem; product: IndustryProduct } | undefined {
  const industry = getIndustryBySlug(industrySlug);
  if (!industry) return undefined;

  const product = getIndustryProducts(industry).find(
    (item) => getProductSlug(item) === productSlug
  );

  if (!product) return undefined;
  return { industry, product };
}
