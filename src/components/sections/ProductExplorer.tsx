"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMarketingProducts,
  useMarketingProductTypes,
} from "@/lib/marketing/products";

// "all" is the synthetic All-Products tab; every other value is a real
// ProductTypeId (as a string).
const ALL = "all";

const PER_PAGE = 12;

export default function ProductExplorer() {
  const products = useMarketingProducts();
  const productTypes = useMarketingProductTypes();
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Category tabs come from the DB (ProductType). "All Products" is prepended.
  const tabs = [
    { value: ALL, label: "All Products" },
    ...productTypes.map((t) => ({ value: String(t.id), label: t.name })),
  ];

  // Filter by category (real ProductTypeId), then by search query.
  const filtered = products.filter((p) => {
    if (activeCategory !== ALL && String(p.typeId) !== activeCategory)
      return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Clamp page so a stale value can't land us on an empty page after the
  // filter set shrinks.
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Explore Our Product
        </h2>

        {/* Search */}
        <div className="mt-8 flex justify-center">
          <div className="flex w-full items-stretch overflow-hidden rounded-sm border-2 border-accent bg-paper md:w-96">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              aria-label="Search products"
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="flex items-center justify-center bg-accent px-3 text-accent-foreground"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:justify-around">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveCategory(tab.value);
                  setPage(1);
                }}
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
        {paginated.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {paginated.map((product) => (
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
        ) : (
          <p className="mt-12 text-center text-muted">
            {query.trim()
              ? `Tidak ada produk untuk "${query}".`
              : "Belum ada produk pada kategori ini."}
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-ink/20 p-2 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "h-9 min-w-9 rounded-sm border px-3 text-sm font-semibold transition-colors",
                  p === safePage
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-ink/20 text-ink hover:bg-ink/5",
                )}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-sm border border-ink/20 p-2 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
