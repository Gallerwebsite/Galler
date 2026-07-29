import type { ReactNode } from "react";
import { FaFileAlt, FaFilePdf, FaSearch, FaUsers } from "react-icons/fa";
import { FaCode, FaHandshake } from "react-icons/fa6";

export type BenefitIconKey =
  | "meaningful"
  | "learn"
  | "diverse"
  | "ownership"
  | "growth"
  | "career";

export type StepIconKey =
  | "application"
  | "review"
  | "technical"
  | "interview"
  | "offer"
  | "welcome";

const benefitIcons: Record<BenefitIconKey, ReactNode> = {
  meaningful: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 2v4M12 18v4M22 12h-4M6 12H2" strokeLinecap="round" />
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2c0-3.3 2.7-6 6-6 1.7 0 3.2.7 4.2 1.8" strokeLinecap="round" />
      <circle cx="16" cy="11" r="3" />
      <path d="M22 17v-1.5c0-2.5-2-4.5-4.5-4.5" strokeLinecap="round" />
    </svg>
  ),
  diverse: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  ownership: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3 3-3 3-3-3z" />
      <path d="M12 8v8" strokeLinecap="round" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
      <path d="M6 19h12" strokeLinecap="round" />
    </svg>
  ),
  growth: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 20l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v8h-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 20h-8" strokeLinecap="round" />
    </svg>
  ),
  career: (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" strokeLinecap="round" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" strokeLinecap="round" />
      <path d="M4 22h16" strokeLinecap="round" />
      <path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79"
        strokeLinecap="round"
      />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const stepIcons: Record<StepIconKey, ReactNode> = {
  application: <FaFileAlt className="h-6 w-6" />,
  review: <FaSearch className="h-6 w-6" />,
  technical: <FaCode className="h-6 w-6" />,
  interview: <FaUsers className="h-6 w-6" />,
  offer: <FaFilePdf className="h-6 w-6" />,
  welcome: <FaHandshake className="h-6 w-6" />,
};

export function getBenefitIcon(key?: string, index = 0): ReactNode {
  const keys = Object.keys(benefitIcons) as BenefitIconKey[];
  const resolved = (key && key in benefitIcons ? key : keys[index % keys.length]) as BenefitIconKey;
  return benefitIcons[resolved];
}

export function getStepIcon(key?: string, index = 0): ReactNode {
  const keys = Object.keys(stepIcons) as StepIconKey[];
  const resolved = (key && key in stepIcons ? key : keys[index % keys.length]) as StepIconKey;
  return stepIcons[resolved];
}
