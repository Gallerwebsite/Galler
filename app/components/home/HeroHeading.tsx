"use client";

import { TextAnimate } from "@/registry/magicui/text-animate";

type Props = {
  lines: string[];
};

const headingClassName =
  "max-w-4xl font-cinzel text-[24px] leading-[1.08] font-normal tracking-tight text-white md:text-[40px]";

export default function HeroHeading({ lines }: Props) {
  const visibleLines = lines.map((line) => line.trim()).filter(Boolean);

  if (visibleLines.length <= 1) {
    const text = visibleLines[0] ?? "";
    return (
      <TextAnimate
        as="h1"
        animation="slideLeft"
        by="character"
        startOnView={false}
        once
        delay={0.2}
        duration={1.2}
        className={headingClassName}
      >
        {text}
      </TextAnimate>
    );
  }

  let charOffset = 0;

  return (
    <h1
      className={`${headingClassName} flex flex-col items-center gap-4 md:gap-6`}
      aria-label={visibleLines.join(" ")}
    >
      {visibleLines.map((line, index) => {
        const delay = 0.2 + charOffset * 0.03;
        charOffset += line.length;

        return (
          <TextAnimate
            key={`${line}-${index}`}
            as="span"
            animation="slideLeft"
            by="character"
            startOnView={false}
            once
            delay={delay}
            duration={0.03 * line.length + 0.3}
            className="block"
            accessible={false}
          >
            {line}
          </TextAnimate>
        );
      })}
    </h1>
  );
}
