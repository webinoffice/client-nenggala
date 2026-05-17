// src/components/ui/Button.tsx
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent"
  | "destructive";

type Size = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
  secondary: "bg-ink text-paper hover:bg-ink-soft",
  outline: "bg-transparent text-ink border border-ink/15 hover:bg-paper-soft",
  ghost: "bg-transparent text-ink hover:bg-paper-soft",
  accent: "bg-accent text-accent-foreground hover:brightness-95",
  destructive: "bg-brand text-brand-foreground hover:bg-brand-hover",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-5 text-xs",
  lg: "h-12 px-7 text-sm",
  icon: "h-9 w-9",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type AsLink = CommonProps & {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
};

type ButtonProps = AsButton | AsLink;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, ...props },
  ref,
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
});

export default Button;
