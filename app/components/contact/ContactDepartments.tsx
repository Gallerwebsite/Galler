"use client";

import { motion } from "framer-motion";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { SlEarphonesAlt } from "react-icons/sl";

interface Department {
  title: string;
  description: string;
  email: string;
  icon: "headset" | "gear" | "person";
}

interface ContactDepartmentsProps {
  departments?: Department[];
}

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    title: "SALES ENQUIRIES",
    description: "For product information and quotations",
    email: "sales@gallerindia.com",
    icon: "headset",
  },
  {
    title: "TECHNICAL SUPPORT",
    description: "For technical assistance and product support",
    email: "support@gallerindia.com",
    icon: "gear",
  },
  {
    title: "CAREERS",
    description: "Explore career opportunities with us",
    email: "careers@gallerindia.com",
    icon: "person",
  },
];

const entryEase = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, amount: 0.25 };

function DepartmentIcon({ type }: { type: Department["icon"] }) {
  const icons = {
    headset: SlEarphonesAlt,
    gear: IoSettingsOutline,
    person: FaRegUser,
  };
  const Icon = icons[type];

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e8e0d0] bg-white text-[#b8451a]">
      <Icon className="h-6 w-6" aria-hidden />
    </div>
  );
}

export default function ContactDepartments({
  departments = DEFAULT_DEPARTMENTS,
}: ContactDepartmentsProps) {
  return (
    <section className="border-t border-[#e5e5e5] bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:grid-cols-3 sm:gap-0 lg:px-10">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.title}
            className={`flex gap-4 sm:gap-5 sm:px-8 ${
              index < departments.length - 1 ? "sm:border-r sm:border-[#e5e5e5]" : ""
            } ${index === 0 ? "sm:pl-0" : ""} ${index === departments.length - 1 ? "sm:pr-0" : ""}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: entryEase, delay: index * 0.12 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: entryEase, delay: index * 0.12 + 0.05 }}
            >
              <DepartmentIcon type={dept.icon} />
            </motion.div>
            <div className="min-w-0 pt-0.5">
              <motion.h3
                className="font-cinzel text-[20px] md:text-[30px] font-normal leading-[1.08] tracking-tight text-[#000]"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.12 + 0.08 }}
              >
                {dept.title}
              </motion.h3>
              <motion.p
                className="mt-2 font-century text-[15px] leading-relaxed text-[#4a4a4a]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.12 + 0.14 }}
              >
                {dept.description}
              </motion.p>
              <motion.a
                href={`mailto:${dept.email}`}
                className="mt-3 inline-block font-century text-[15px] font-medium text-[#b8451a] transition-colors hover:text-[#a8871f]"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ duration: 0.55, ease: entryEase, delay: index * 0.12 + 0.2 }}
              >
                {dept.email}
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
