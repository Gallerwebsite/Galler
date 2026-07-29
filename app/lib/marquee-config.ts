import { API_URL } from "@/app/lib/apiUrl";

export type MarqueeLogo = {
  id: string;
  src: string;
  alt: string;
};

/** Every logo is rendered inside a fixed 120×120 px slot. */
export const MARQUEE_SLOT_CLASS =
  "relative flex h-[120px] w-[120px] shrink-0 items-center justify-center";

/** On-screen slot size (px). */
export const MARQUEE_SLOT_DISPLAY_HEIGHT = 120;
export const MARQUEE_SLOT_DISPLAY_WIDTH = 120;

/** Recommended logo image dimensions (square, transparent background). */
export const MARQUEE_RECOMMENDED_WIDTH = 120;
export const MARQUEE_RECOMMENDED_HEIGHT = 120;

/** Approximate slot width including horizontal margins — used before layout measure. */
export const MARQUEE_SLOT_WIDTH_ESTIMATE = 168;

/** Maximum logos per row (admin + site). */
export const MARQUEE_ROW_COUNT = 2;
export const MARQUEE_LOGOS_PER_ROW = 15;
export const MARQUEE_MAX_LOGOS = MARQUEE_ROW_COUNT * MARQUEE_LOGOS_PER_ROW;

export type MarqueeContent = {
  row1?: MarqueeLogo[];
  row2?: MarqueeLogo[];
  /** @deprecated legacy flat list — migrated on read */
  logos?: MarqueeLogo[];
};

export function normalizeMarqueeAdminState(
  content?: MarqueeContent | null
): { row1: MarqueeLogo[]; row2: MarqueeLogo[] } {
  if (content?.row1 !== undefined || content?.row2 !== undefined) {
    return {
      row1: content.row1 ?? [],
      row2: content.row2 ?? [],
    };
  }

  const logos = content?.logos ?? [];
  return {
    row1: logos.slice(0, MARQUEE_LOGOS_PER_ROW),
    row2: logos.slice(MARQUEE_LOGOS_PER_ROW),
  };
}

export function getMarqueeRowsFromContent(content?: MarqueeContent | null): MarqueeLogo[][] {
  const { row1, row2 } = normalizeMarqueeAdminState(content);
  const rows: MarqueeLogo[][] = [];
  const activeRow1 = row1.filter((logo) => logo.src);
  const activeRow2 = row2.filter((logo) => logo.src);

  if (activeRow1.length > 0) rows.push(activeRow1);
  if (activeRow2.length > 0) rows.push(activeRow2);

  if (rows.length > 0) return rows;

  const fallback = DEFAULT_MARQUEE_LOGOS.filter((logo) => logo.src);
  if (fallback.length === 0) return [];

  const midpoint = Math.ceil(fallback.length / 2);
  return [fallback.slice(0, midpoint), fallback.slice(midpoint)].filter((row) => row.length > 0);
}

export const MARQUEE_MIN_DURATION = 40;
export const MARQUEE_MAX_DURATION = 120;
export const MARQUEE_SECONDS_PER_LOGO = 5;

/** Duration from logo count — legacy estimate only; prefer getMarqueeDurationFromShift. */
export function getMarqueeDuration(logoCount: number): string {
  const seconds = Math.min(
    MARQUEE_MAX_DURATION,
    Math.max(MARQUEE_MIN_DURATION, logoCount * MARQUEE_SECONDS_PER_LOGO)
  );
  return `${seconds}s`;
}

/** Duration from measured track width so every row scrolls at the same px/s. */
export function getMarqueeDurationFromShift(shiftPx: number): string {
  if (shiftPx <= 0) return `${MARQUEE_MIN_DURATION}s`;

  const secondsPerPixel = MARQUEE_SECONDS_PER_LOGO / MARQUEE_SLOT_WIDTH_ESTIMATE;
  const seconds = Math.min(
    MARQUEE_MAX_DURATION,
    Math.max(MARQUEE_MIN_DURATION, shiftPx * secondsPerPixel)
  );
  return `${seconds}s`;
}

/** Repeat logos within one set until it is wide enough for the viewport. */
export function buildMarqueeSet(logos: MarqueeLogo[], viewportWidth: number): MarqueeLogo[] {
  if (logos.length === 0) return [];

  const minSetWidth = viewportWidth * 1.15;
  const estimatedSetWidth = logos.length * MARQUEE_SLOT_WIDTH_ESTIMATE;
  const repeats = Math.max(1, Math.ceil(minSetWidth / estimatedSetWidth));

  return Array.from({ length: repeats }, () => logos).flat().map((logo, index) => ({
    ...logo,
    id: `${logo.id}-slot-${index}`,
  }));
}

export function buildMarqueeTrack(logos: MarqueeLogo[], viewportWidth: number): MarqueeLogo[] {
  const singleSet = buildMarqueeSet(logos, viewportWidth);
  return [...singleSet, ...singleSet];
}

export const DEFAULT_MARQUEE_LOGOS: MarqueeLogo[] = [
  { id: "bsnl", src: "/marquee/bsnl.png", alt: "BSNL" },
  { id: "honda", src: "/marquee/honda.svg", alt: "Honda" },
  { id: "lnt", src: "/marquee/lnt.png", alt: "L&T" },
  { id: "nokia", src: "/marquee/nokia.png", alt: "Nokia" },
  { id: "reliance", src: "/marquee/reliance.png", alt: "Reliance" },
  { id: "skoda", src: "/marquee/skoda.jpeg", alt: "Skoda" },
  { id: "suzuki", src: "/marquee/suzuki.webp", alt: "Suzuki" },
  { id: "toyota", src: "/marquee/toyota.jpg", alt: "Toyota" },
];

export function resolveMarqueeSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) {
    return `${API_URL}${src}`;
  }
  return src;
}
