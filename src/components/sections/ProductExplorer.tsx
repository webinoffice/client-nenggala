"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Category = "all" | "taekwondo" | "nunchaku" | "gymnastic" | "accessories";

interface Product {
  id: string;
  name: string;
  category: Exclude<Category, "all">;
  image: string;
}

const TABS: { value: Category; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "nunchaku", label: "Nunchaku" },
  { value: "gymnastic", label: "Gymnastic" },
  { value: "accessories", label: "Accesories" }, // preserving typo from design
];

const PLACEHOLDER = "/images/product-placeholder.jpg";

const PRODUCTS: Product[] = [
  // Taekwondo
  {
    id: "tk-1",
    name: "Seragam Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-2",
    name: "Seragam Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-3",
    name: "Seragam Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-4",
    name: "Seragam Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-5",
    name: "Seragam Taekwondo Premium",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-6",
    name: "Seragam Taekwondo Premium",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-7",
    name: "Sabuk Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  {
    id: "tk-8",
    name: "Pelindung Taekwondo",
    category: "taekwondo",
    image: PLACEHOLDER,
  },
  // Nunchaku
  {
    id: "nc-1",
    name: "Nunchaku Standar",
    category: "nunchaku",
    image: PLACEHOLDER,
  },
  {
    id: "nc-2",
    name: "Nunchaku Latihan",
    category: "nunchaku",
    image: PLACEHOLDER,
  },
  {
    id: "nc-3",
    name: "Nunchaku Premium",
    category: "nunchaku",
    image: PLACEHOLDER,
  },
  {
    id: "nc-4",
    name: "Nunchaku Pro",
    category: "nunchaku",
    image: PLACEHOLDER,
  },
  // Gymnastic
  {
    id: "gm-1",
    name: "Matras Gymnastic",
    category: "gymnastic",
    image: PLACEHOLDER,
  },
  { id: "gm-2", name: "Hand Grip", category: "gymnastic", image: PLACEHOLDER },
  {
    id: "gm-3",
    name: "Balance Bar",
    category: "gymnastic",
    image: PLACEHOLDER,
  },
  {
    id: "gm-4",
    name: "Chalk Powder",
    category: "gymnastic",
    image: PLACEHOLDER,
  },
  // Accessories
  {
    id: "ac-1",
    name: "Tas Latihan",
    category: "accessories",
    image: PLACEHOLDER,
  },
  {
    id: "ac-2",
    name: "Handuk Atlet",
    category: "accessories",
    image: PLACEHOLDER,
  },
  {
    id: "ac-3",
    name: "Botol Minum",
    category: "accessories",
    image: PLACEHOLDER,
  },
  {
    id: "ac-4",
    name: "Pelindung Tubuh",
    category: "accessories",
    image: PLACEHOLDER,
  },
];

export default function ProductExplorer() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const visibleProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Explore Our Product
        </h2>

        {/* Filter tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:justify-around">
          {TABS.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={cn(
                  "pb-1 text-base font-medium transition-colors md:text-lg",
                  isActive
                    ? "text-brand underline decoration-2 underline-offset-8"
                    : "text-ink hover:text-brand/70",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-paper-soft">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="border-t border-ink/10 px-3 py-3 text-center">
                <p className="text-sm font-medium text-ink">{product.name}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state (just in case) */}
        {visibleProducts.length === 0 && (
          <p className="mt-12 text-center text-muted">
            Belum ada produk pada kategori ini.
          </p>
        )}
      </div>
    </section>
  );
}
