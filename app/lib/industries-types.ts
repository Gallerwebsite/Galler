import { resolveDownloadFileName } from "@/app/lib/resolveDownloadFileName";
import { normalizeYoutubeUrl } from "@/app/lib/youtubeUrl";

export type ProductDownloadButtons = {
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

export type IndustryGalleryItem = {
  id: string;
  src: string;
  alt?: string;
  type?: "image" | "video";
  videoUrl?: string;
};

export type IndustryProduct = {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  description?: string;
  keyFeatures?: string[];
  gallery?: IndustryGalleryItem[];
  downloadButtons?: ProductDownloadButtons;
};

export type IndustryItem = {
  id: string;
  slug?: string;
  name: string;
  image: string;
  products?: IndustryProduct[];
  /** @deprecated use products[] */
  description?: string;
  /** @deprecated use products[] */
  keyFeatures?: string[];
  /** @deprecated use products[] */
  gallery?: IndustryGalleryItem[];
};

export function slugifyIndustry(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || id;
}

export function getIndustrySlug(item: IndustryItem): string {
  return item.slug?.trim() || slugifyIndustry(item.name, item.id);
}

export function getProductSlug(product: IndustryProduct): string {
  return product.slug?.trim() || slugifyIndustry(product.name, product.id);
}

export function getIndustryProducts(item: IndustryItem): IndustryProduct[] {
  if (item.products?.length) return item.products;

  if (item.description || item.keyFeatures?.length || item.gallery?.length) {
    return [
      {
        id: `${item.id}-default`,
        slug: slugifyIndustry(item.name, item.id),
        name: item.name,
        image: item.image,
        description: item.description ?? "",
        keyFeatures: item.keyFeatures ?? [],
        gallery: item.gallery ?? [],
      },
    ];
  }

  return [];
}

export function getProductGallery(product: IndustryProduct): IndustryGalleryItem[] {
  const gallery = product.gallery?.filter((item) => item.src?.trim()) ?? [];
  if (gallery.length) return gallery;
  if (product.image?.trim()) {
    return [{ id: `${product.id}-main`, src: product.image, alt: product.name, type: "image" }];
  }
  return [];
}

export function getVisibleProductDownloadButtons(product: IndustryProduct): {
  brochure: { url: string; fileName: string } | null;
  model3d: { url: string; fileName: string } | null;
  checkoutVideo: { url: string } | null;
} {
  const cfg = product.downloadButtons;
  if (!cfg?.enabled) {
    return { brochure: null, model3d: null, checkoutVideo: null };
  }

  const brochure =
    cfg.showBrochure !== false && cfg.brochureUrl?.trim()
      ? {
          url: cfg.brochureUrl.trim(),
          fileName: resolveDownloadFileName(
            cfg.brochureUrl.trim(),
            cfg.brochureFileName?.trim() || "",
            "brochure"
          ),
        }
      : null;

  const model3d =
    cfg.showModel3d !== false && cfg.model3dUrl?.trim()
      ? {
          url: cfg.model3dUrl.trim(),
          fileName: resolveDownloadFileName(
            cfg.model3dUrl.trim(),
            cfg.model3dFileName?.trim() || "",
            "3d-model"
          ),
        }
      : null;

  const checkoutVideoUrl = cfg.checkoutVideoUrl?.trim()
    ? normalizeYoutubeUrl(cfg.checkoutVideoUrl.trim())
    : null;
  const checkoutVideo =
    cfg.showCheckoutVideo !== false && checkoutVideoUrl
      ? { url: checkoutVideoUrl }
      : null;

  return { brochure, model3d, checkoutVideo };
}

/** @deprecated use getProductGallery */
export function getIndustryGallery(item: IndustryItem): IndustryGalleryItem[] {
  const products = getIndustryProducts(item);
  if (products[0]) return getProductGallery(products[0]);
  if (item.image) {
    return [{ id: `${item.id}-main`, src: item.image, alt: item.name, type: "image" }];
  }
  return [];
}
