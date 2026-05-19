// src/app/app/(authenticated)/me/contact/page.tsx
import Image from "next/image";
import { Bell, MessageCircle } from "lucide-react";
import { DOJANG_CONTACTS } from "@/lib/contacts";

export default function ContactUsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          What Do You Need? Feel Free To Contact Us!
        </h1>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-ink" />
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
            Contact
          </h2>
        </div>

        <div className="bg-paper rounded-sm border border-ink/10 divide-y divide-ink/10">
          {DOJANG_CONTACTS.map((contact) => (
            <article
              key={contact.id}
              className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 md:gap-5"
            >
              <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-sm bg-ink">
                <Image
                  src={contact.image}
                  alt={contact.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <div className="min-w-0 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-display text-base md:text-lg font-bold text-ink">
                    {contact.name}
                  </h3>
                  <p className="text-xs md:text-sm text-ink/70 mt-1 leading-relaxed">
                    {contact.address}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ink hover:text-[#25D366] transition-colors w-fit group"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle size={14} fill="white" />
                  </span>
                  <span className="font-medium">{contact.whatsappDisplay}</span>
                  <span className="text-muted">({contact.picName})</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
