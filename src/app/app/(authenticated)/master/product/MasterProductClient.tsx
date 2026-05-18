// src/app/app/(authenticated)/master/product/MasterProductClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import ProductFormModal, { type ProductFormValues } from "./ProductFormModal";

export type Product = {
  id: string;
  typeId: string;
  productName: string;
  link: string;
  image: string;
  updatedBy: string;
  updateDate: string;
  disabled: boolean;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "TS",
    typeId: "TS-01",
    productName: "Uniform",
    link: "www.tokopedia.com/13...",
    image: "U_1313828837.JPG",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32",
    disabled: false,
  },
  {
    id: "BL",
    typeId: "BL-01",
    productName: "White Belt",
    link: "www.tokopedia.com/belts/white",
    image: "B_2024110501.JPG",
    updatedBy: "Carolina",
    updateDate: "2025-12-15T09:12:00",
    disabled: false,
  },
  {
    id: "BL",
    typeId: "BL-02",
    productName: "Yellow Belt",
    link: "www.tokopedia.com/belts/yellow",
    image: "B_2024110502.JPG",
    updatedBy: "Andre",
    updateDate: "2025-11-30T14:22:11",
    disabled: false,
  },
  {
    id: "BL",
    typeId: "BL-03",
    productName: "Green Belt",
    link: "www.tokopedia.com/belts/green",
    image: "B_2024110503.JPG",
    updatedBy: "Andre",
    updateDate: "2025-11-30T14:23:00",
    disabled: false,
  },
  {
    id: "GR",
    typeId: "GR-01",
    productName: "Hand Pads",
    link: "www.tokopedia.com/grip/pads",
    image: "G_2024100101.JPG",
    updatedBy: "Carolina",
    updateDate: "2025-10-01T11:00:00",
    disabled: false,
  },
  {
    id: "GR",
    typeId: "GR-02",
    productName: "Shin Guards",
    link: "www.tokopedia.com/grip/shin",
    image: "G_2024100102.JPG",
    updatedBy: "Carolina",
    updateDate: "2025-10-01T11:05:00",
    disabled: true,
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterProductClient() {
  const currentUserName = "Carolina";

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [typeIdInput, setTypeIdInput] = useState("");
  const [productInput, setProductInput] = useState("");
  const [applied, setApplied] = useState({ typeId: "", product: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchType =
        applied.typeId === "" ||
        p.typeId.toLowerCase().includes(applied.typeId.toLowerCase());
      const matchName =
        applied.product === "" ||
        p.productName.toLowerCase().includes(applied.product.toLowerCase());
      return matchType && matchName;
    });
  }, [products, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter = applied.typeId !== "" || applied.product !== "";

  const handleSearch = () => {
    setApplied({ typeId: typeIdInput, product: productInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setTypeIdInput("");
    setProductInput("");
    setApplied({ typeId: "", product: "" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSubmit = (values: ProductFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.typeId === editing.typeId
            ? {
                ...p,
                ...values,
                updatedBy: currentUserName,
                updateDate: now,
              }
            : p,
        ),
      );
    } else {
      setProducts((prev) => [
        {
          ...values,
          updatedBy: currentUserName,
          updateDate: now,
          disabled: false,
        },
        ...prev,
      ]);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleConfirmDisable = () => {
    if (!confirming) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.typeId === confirming.typeId ? { ...p, disabled: !p.disabled } : p,
      ),
    );
  };

  return (
    <>
      <PageHeader
        title="Master Product"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      {/* Filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl">
          <Input
            label="Type ID"
            value={typeIdInput}
            onChange={(e) => setTypeIdInput(e.target.value)}
            placeholder="e.g. TS-01"
          />
          <Input
            label="Product"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
            placeholder="e.g. Uniform"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button variant="secondary" onClick={handleSearch}>
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">ID</th>
                <th className="text-left px-4 py-3.5">Type ID</th>
                <th className="text-left px-4 py-3.5">Product</th>
                <th className="text-left px-4 py-3.5">Link</th>
                <th className="text-left px-4 py-3.5">Image</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.typeId}
                    className={cn(
                      "border-b border-ink/5 hover:bg-paper-soft/50 transition-colors",
                      p.disabled && "opacity-50",
                    )}
                  >
                    <td className="px-4 py-3 text-ink font-medium">{p.id}</td>
                    <td className="px-4 py-3 text-ink font-medium">
                      {p.typeId}
                    </td>
                    <td className="px-4 py-3 text-ink">{p.productName}</td>
                    <td className="px-4 py-3 text-ink/70 truncate max-w-[180px]">
                      {p.link}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{p.image}</td>
                    <td className="px-4 py-3 text-ink/70">{p.updatedBy}</td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                      {formatDate(p.updateDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setConfirming(p)}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition",
                            !p.disabled
                              ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                              : "bg-ink text-paper hover:bg-ink-soft",
                          )}
                        >
                          {p.disabled ? "Enable" : "Disable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination footer */}
        {totalItems > 0 && (
          <div className="px-4 py-4 border-t border-ink/10 bg-paper">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirmDisable}
        title={confirming?.disabled ? "Enable Product" : "Disable Product"}
        description={
          confirming
            ? confirming.disabled
              ? `Enable "${confirming.productName}" (${confirming.typeId})? It will return to active listings.`
              : `Disable "${confirming.productName}" (${confirming.typeId})? It will be hidden from active listings but kept in the system.`
            : ""
        }
        confirmLabel={confirming?.disabled ? "Enable" : "Disable"}
        variant={confirming?.disabled ? "primary" : "destructive"}
      />
    </>
  );
}
