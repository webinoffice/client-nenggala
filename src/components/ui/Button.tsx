import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors",
    variant === "primary" &&
      "bg-brand text-brand-foreground hover:bg-brand-hover",
    variant === "secondary" && "bg-ink text-paper hover:bg-ink-soft",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return <button className={styles}>{children}</button>;
}
