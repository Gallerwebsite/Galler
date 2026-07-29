"use client";

import { TextAnimate } from "@/registry/magicui/text-animate";

type Props = {
  title: string;
  className?: string;
};

export default function CharacterSlideHeading({
  title,
  className = "text-center font-cinzel text-[24px] font-normal leading-[1.08] tracking-tight text-[#000000] md:text-[40px]",
}: Props) {
  return (
    <TextAnimate
      as="h2"
      animation="slideRight"
      by="character"
      once
      duration={0.9}
      className={className}
    >
      {title}
    </TextAnimate>
  );
}
