import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Our Academy",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Product", href: "/product" },
      { label: "Event", href: "/event" },
    ],
  },
  {
    title: "Our Program",
    links: [
      { label: "Taekwondo", href: "/program/taekwondo" },
      { label: "Nunchaku-Do", href: "/program/nunchaku" },
      { label: "Gymnastic", href: "/program/gymnastic" },
    ],
  },
];

const CONTACTS = ["0876 1234 5678", "0815 1234 5678"];
const SOCIALS = [
  { handle: "@nenggalaacademy", href: "#" },
  { handle: "@nenggalakedoya", href: "#" },
  { handle: "@nenggalameruya", href: "#" },
];

const PARTNERS = [
  { name: "Adidas", src: "/images/partner-adidas.png" },
  { name: "Partner 2", src: "/images/partner-2.png" },
  { name: "Partner 3", src: "/images/partner-3.png" },
];

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-12 md:px-8">
        {/* Brand + Partners */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand font-display text-2xl font-bold">
              N
            </div>
            <div>
              <p className="font-display text-base font-bold uppercase tracking-widest">
                Nenggala
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Academy
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Great Partners
            </p>
            <div className="mt-3 flex items-center gap-4">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="relative h-10 w-20 overflow-hidden rounded-sm bg-paper/5"
                >
                  <Image
                    src={p.src}
                    alt={p.name}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">
              {col.title}
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/80 transition-colors hover:text-brand"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="md:col-span-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">
            Contact
          </p>
          <ul className="space-y-2">
            {CONTACTS.map((c) => (
              <li key={c} className="text-sm text-paper/80">
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div className="md:col-span-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">
            Social Media
          </p>
          <ul className="space-y-2">
            {SOCIALS.map((s) => (
              <li key={s.handle}>
                <a
                  href={s.href}
                  className="flex items-center gap-2 text-sm text-paper/80 transition-colors hover:text-brand"
                >
                  <InstagramIcon />
                  {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} Nenggala Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
