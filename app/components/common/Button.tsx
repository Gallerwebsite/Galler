import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit";
}

function ArrowIcon() {
  return (
    <span className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--primary-orange)]">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 7h12m0 0L8 2m5 5L8 12"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer";

  const variants = {
    primary: `${base} bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] ${className}`,
    outline: `${base} border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white ${className}`,
  };

  const classes = variants[variant];

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {variant === "primary" && <ArrowIcon />}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {variant === "primary" && <ArrowIcon />}
    </button>
  );
}
