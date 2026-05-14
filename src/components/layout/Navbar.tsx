"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "About Us", href: "/about-us" },
  { label: "Gallery", href: "/gallery" },
  { label: "Event", href: "/event" },
  { label: "Program", href: "/program" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand font-display text-lg font-bold">
            N
          </div>
          <span className="font-display text-sm font-semibold uppercase tracking-widest">
            Nenggala
            <span className="block text-[10px] font-normal text-muted-foreground">
              Academy
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs font-semibold uppercase tracking-widest transition-colors hover:text-brand",
                isActive(item.href) && "text-brand",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Login button (desktop) */}
        <Link
          href="/app/login"
          className="hidden rounded-sm bg-brand px-5 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground transition-colors hover:bg-brand-hover md:block"
        >
          Login
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="border-t border-ink-soft bg-ink md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-sm px-3 py-2 text-sm font-semibold uppercase tracking-widest hover:bg-ink-soft hover:text-brand",
                  isActive(item.href) && "text-brand",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/app/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-sm bg-brand px-3 py-2.5 text-center text-sm font-bold uppercase tracking-widest text-brand-foreground"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
