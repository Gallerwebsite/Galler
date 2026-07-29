import type { SiteContent } from "@/app/lib/getContent";
import { getMarqueeRowsFromContent } from "@/app/lib/marquee-config";
import homeAboutGif from "@/public/home-about.gif";
import MarqueeTrack from "./MarqueeTrack";
import CharacterSlideHeading from "./CharacterSlideHeading";

type Props = { content?: SiteContent["marquee"]; heading?: string };

function SideGif({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={homeAboutGif.src}
      alt=""
      className={className}
      aria-hidden
    />
  );
}

export default function LogoMarquee({ content, heading = "OUR CLIENTS" }: Props) {
  const rows = getMarqueeRowsFromContent(content);
  if (rows.length === 0) return null;

  return (
    <section aria-label="Partner logos" className="relative overflow-hidden bg-[#f6f6f6] py-14 sm:py-16">
      <SideGif
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-52 w-auto -translate-x-[70%] object-contain sm:h-64 lg:h-80 xl:h-96"
      />
      <SideGif
        className="pointer-events-none absolute top-0 right-0 z-0 h-52 w-auto translate-x-[70%] object-contain sm:h-64 lg:h-80 xl:h-96"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <CharacterSlideHeading
          title={heading}
          className="mb-10 text-center font-cinzel text-[27px] font-normal leading-[1.08] tracking-tight text-[#000000] sm:mb-12 md:text-[40px]"
        />
        <MarqueeTrack rows={rows} />
      </div>
    </section>
  );
}
