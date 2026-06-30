// src/app/app/(authenticated)/master/product/MasterProductClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Search, ExternalLink } from "lucide-react";
import UploadedImage from "@/components/app/UploadedImage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import ProductFormModal, { type ProductFormValues } from "./ProductFormModal";
import { useProductTypes } from "../_shared/product-types";
import {
  getProducts,
  subscribeProducts,
  addProduct,
  updateProduct,
  removeProduct,
  type Product,
} from "../_shared/products";

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toHref(link: string) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

export default function MasterProductClient() {
  const products = useSyncExternalStore(
    subscribeProducts,
    getProducts,
    getProducts,
  );
  const productTypes = useProductTypes();
  const [typeInput, setTypeInput] = useState("All");
  const [productInput, setProductInput] = useState("");
  const [applied, setApplied] = useState({ type: "All", product: "" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);
  const [viewingImage, setViewingImage] = useState<Product | null>(null);
  const [actionError, setActionError] = useState("");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchType = applied.type === "All" || p.type === applied.type;
      const matchName =
        applied.product === "" ||
        p.productName.toLowerCase().includes(applied.product.toLowerCase());
      return matchType && matchName;
    });
  }, [products, applied]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter = applied.type !== "All" || applied.product !== "";

  const handleSearch = () => {
    setApplied({ type: typeInput, product: productInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setTypeInput("All");
    setProductInput("");
    setApplied({ type: "All", product: "" });
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
    const input = {
      typeId: values.typeId,
      productName: values.productName,
      link: values.link,
    };
    if (editing) {
      updateProduct(editing.id, input, values.imageFile);
    } else {
      addProduct(input, values.imageFile);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    try {
      await removeProduct(target.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete product",
      );
    }
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
          <Select
            label="Type"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
          >
            <option value="All">All</option>
            {productTypes.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </Select>
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
                <th className="text-left px-4 py-3.5">Type</th>
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
                    colSpan={7}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink font-medium">{p.type}</td>
                    <td className="px-4 py-3 text-ink">{p.productName}</td>
                    <td className="px-4 py-3 truncate max-w-[180px]">
                      <a
                        href={toHref(p.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand hover:text-brand-hover underline underline-offset-4"
                      >
                        <span className="truncate">{p.link}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewingImage(p)}
                        className="text-brand hover:text-brand-hover underline underline-offset-4 font-mono text-xs"
                      >
                        View
                      </button>
                    </td>
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
                          className="bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-brand-hover transition"
                        >
                          Delete
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

      {/* Image popup */}
      <Modal
        open={viewingImage !== null}
        onClose={() => setViewingImage(null)}
        title={viewingImage?.productName ?? ""}
        size="md"
      >
        {viewingImage && (
          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-paper-soft border border-ink/10">
            <UploadedImage
              src={viewingImage.image}
              alt={viewingImage.productName}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={
          confirming
            ? `Delete "${confirming.productName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      <Modal
        open={actionError !== ""}
        onClose={() => setActionError("")}
        title="Cannot Delete Product"
        size="sm"
      >
        <p className="text-sm text-ink/80">{actionError}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setActionError("")}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
