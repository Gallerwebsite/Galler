import type { SiteContent } from "@/app/lib/getContent";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";
import HeroHeading from "./HeroHeading";

const DEFAULT_HERO_VIDEO = "/videos/home-video.mp4";

type Props = { content?: SiteContent["hero"] };

const DEFAULT_LINE_1 = "AN END-TO-END ENGINEERING";
const DEFAULT_LINE_2 = "SOLUTIONS COMPANY";

function getHeroLines(content?: SiteContent["hero"]): string[] {
  const line1 = content?.headingLine1?.trim();
  const line2 = content?.headingLine2?.trim();

  if (line1 || line2) {
    return [line1 || DEFAULT_LINE_1, line2 || DEFAULT_LINE_2];
  }

  const legacyTitle = content?.title?.trim();
  if (legacyTitle) {
    const legacyLines = legacyTitle
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (legacyLines.length > 0) return legacyLines;
  }

  return [DEFAULT_LINE_1, DEFAULT_LINE_2];
}

export default function HeroSection({ content }: Props) {
  const lines = getHeroLines(content);
  const videoSrc = resolveUploadSrc(content?.videoUrl || DEFAULT_HERO_VIDEO);

  return (
    <section className="relative mt-20 min-h-[55dvh] overflow-hidden md:min-h-[65dvh] lg:min-h-[calc(100dvh-5rem)]">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover object-[center_35%] lg:object-center"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[55dvh] max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16 md:min-h-[65dvh] lg:min-h-[calc(100dvh-5rem)] lg:px-8 lg:py-16">
        <HeroHeading lines={lines} />
      </div>
    </section>
  );
}
