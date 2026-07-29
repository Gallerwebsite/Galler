const brands = [
  {
    name: "Swiss",
    logo: (
      <span className="flex items-center gap-1.5 text-lg font-bold text-[#1a1a1a]">
        <span className="text-[#1a1a1a]">+</span> Swiss
      </span>
    ),
  },
  {
    name: "Berlin",
    logo: (
      <span className="flex items-center gap-1.5 text-lg font-bold text-[#1a1a1a]">
        <span className="inline-block h-5 w-4 rounded-sm bg-[#1a1a1a]" />
        Berlin.
      </span>
    ),
  },
  {
    name: "Alaska",
    logo: (
      <span className="text-2xl font-light italic tracking-tight text-[#1a1a1a]">
        alaska
      </span>
    ),
  },
  {
    name: "Cairo",
    logo: (
      <span className="text-2xl font-bold tracking-widest text-[#1a1a1a]">
        Cairo
      </span>
    ),
  },
  {
    name: "Theo",
    logo: (
      <span className="text-2xl font-light italic text-[#1a1a1a]" style={{ fontFamily: "Georgia, serif" }}>
        Theo
      </span>
    ),
  },
];

export default function BrandsStrip() {
  return (
    <section className="border-t border-gray-200 bg-[#f5f5f5] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex h-20 items-center justify-center rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
