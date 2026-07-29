"use client";

import { motion } from "framer-motion";
import aboutBanner from "@/Assets/aboutbanner.jpg";
import { resolveUploadSrc } from "@/app/lib/resolveUploadSrc";

interface Plant {
  name: string;
  address: string;
  image?: string;
  mapUrl?: string;
}

interface ContactLocationsProps {
  plants?: Plant[];
  locationMapUrl?: string;
}

const DEFAULT_PLANTS: Plant[] = [
  {
    name: "PLANT 1 – NOIDA",
    address: "A-37, Sector 58, Noida, Uttar Pradesh – 201301, India",
  },
  {
    name: "PLANT 2 – GREATER NOIDA",
    address: "D-14, UPSIDC Industrial Area, Greater Noida, Uttar Pradesh – 201306, India",
  },
  {
    name: "PLANT 3 – DEHRADUN",
    address: "Plot No. 12, Selakui Industrial Area, Dehradun, Uttarakhand – 248197, India",
  },
  {
    name: "PLANT 4 – BANGALORE",
    address:
      "No. 25, KIADB Industrial Area, Electronics City Phase 2, Bangalore, Karnataka – 560100, India",
  },
];

const DEFAULT_MAP_EMBED_URL =
  "https://maps.google.com/maps?q=Plot+No.+620,+Sector+8+Rd,+Sector+8,+Imt+Manesar,+Gurugram,+Haryana+122050,+India&hl=en&z=16&output=embed";

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function getPlantMapUrl(plant: Plant): string | null {
  const mapUrl = plant.mapUrl?.trim();
  if (mapUrl) return mapUrl;

  const address = plant.address.trim();
  if (address && address !== "Enter plant address") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return null;
}

export default function ContactLocations({
  plants = DEFAULT_PLANTS,
  locationMapUrl = DEFAULT_MAP_EMBED_URL 
}: ContactLocationsProps) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-14 lg:px-10">
        <div>
          <motion.h2
            className="font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight text-[#000]"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase }}
          >
            OUR LOCATION
          </motion.h2>
          <motion.div
            className="mt-8 overflow-hidden rounded-sm border border-[#e5e5e5] shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.1 }}
          >
            <iframe
              title="Galler India Pvt. Ltd. location"
              src={locationMapUrl}
              className="h-[320px] w-full border-0 sm:h-[380px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        </div>

        <div>
          <motion.h2
            className="font-cinzel text-[30px] font-normal leading-[1.08] tracking-tight text-[#000]"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: entryEase, delay: 0.05 }}
          >
            OUR PLANTS
          </motion.h2>
          <ul className="mt-8 space-y-6">
            {plants.map((plant, index) => {
              const imageSrc = plant.image ? resolveUploadSrc(plant.image) : aboutBanner.src;
              const mapUrl = getPlantMapUrl(plant);

              const content = (
                <>
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-sm border border-[#e5e5e5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="font-century text-[15px] font-bold text-[#0b1f4a] transition-colors group-hover:text-[#b8451a]">{plant.name}</p>
                    <p className="mt-1.5 font-century text-[15px] leading-relaxed text-[#4a4a4a]">
                      {plant.address}
                    </p>
                  </div>
                </>
              );

              return (
                <motion.li
                  key={`${plant.name}-${index}`}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{
                    duration: 0.55,
                    ease: entryEase,
                    delay: 0.08 + index * 0.1,
                  }}
                >
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex cursor-pointer gap-4 rounded-sm p-1 -m-1 transition-colors hover:bg-[#f8f8f8]"
                      aria-label={`Open ${plant.name} in Google Maps`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex gap-4">{content}</div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
