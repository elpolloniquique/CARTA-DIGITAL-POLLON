/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Ban,
  CheckCircle2,
  Copy,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { Category, Product } from "@/types/menu";

import { ProductEditModal } from "../product-edit-modal";

type MenuViewProps = {
  categories: Category[];
  products: Product[];
  loading: boolean;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onDuplicateProduct: (product: Product) => void;
  onToggleProductActive: (product: Product) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
};

type MenuTab = "products" | "categories";

const emptyCategory = (): Category => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  icon: "UtensilsCrossed",
  sortOrder: 99,
  accent: "#ef4444",
  coverImage: "",
});

const emptyProduct = (categorySlug: string): Product => ({
  id: "",
  categorySlug,
  sortOrder: 0,
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  rating: 5,
  tag: "",
  isFeatured: false,
  isPopular: false,
  isActive: true,
});

export function MenuView({
  categories,
  products,
  loading,
  onSaveCategory,
  onDeleteCategory,
  onSaveProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onToggleProductActive,
  onUploadImage,
}: MenuViewProps) {
  const [tab, setTab] = useState<MenuTab>("products");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Category>(emptyCategory());

  const defaultCategorySlug = categories[0]?.slug ?? "ofertas-familiares";

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((product) => {
        if (categoryFilter !== "all" && product.categorySlug !== categoryFilter) return false;
        if (statusFilter === "active" && product.isActive === false) return false;
        if (statusFilter === "inactive" && product.isActive !== false) return false;
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
  }, [categoryFilter, products, search, statusFilter]);

  function openNewProduct() {
    setEditingProduct(emptyProduct(defaultCategorySlug));
    setModalOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct({ ...product });
    setModalOpen(true);
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSaveCategory(categoryForm);
    setCategoryForm(emptyCategory());
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-black/8 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("products")}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              tab === "products" ? "bg-[#ef2b2d] text-white" : "text-neutral-600"
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              tab === "categories" ? "bg-[#ef2b2d] text-white" : "text-neutral-600"
            }`}
          >
            Categorias
          </button>
        </div>

        {tab === "products" ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ef2b2d] bg-white px-4 py-2.5 text-sm font-bold text-[#ef2b2d]"
            >
              <Eye className="size-4" />
              Vista previa
            </a>
            <button
              type="button"
              onClick={openNewProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef2b2d] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(239,43,45,0.28)]"
            >
              <Plus className="size-4" />
              Nuevo producto
            </button>
          </div>
        ) : null}
      </div>

      {tab === "products" ? (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold outline-none"
            >
              <option value="all">Todas las categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto..."
                className="w-full rounded-xl border border-black/10 py-2.5 pl-10 pr-4 text-sm outline-none"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-[960px]">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const categoryName =
                      categories.find((category) => category.slug === product.categorySlug)?.name ??
                      product.categorySlug;

                    return (
                      <tr key={product.id}>
                        <td className="font-bold text-neutral-500">{product.sortOrder ?? 0}</td>
                        <td>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="size-12 rounded-lg object-cover"
                          />
                        </td>
                        <td>
                          <p className="font-semibold text-[#111]">{product.name}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                            {product.description}
                          </p>
                        </td>
                        <td className="text-sm text-neutral-600">{categoryName}</td>
                        <td className="font-black text-[#ef2b2d]">
                          {formatCurrency(product.price)}
                        </td>
                        <td>
                          {product.isActive !== false ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : (
                            <Ban className="size-5 text-amber-500" />
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                              title="Editar"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicateProduct(product)}
                              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                              title="Duplicar"
                            >
                              <Copy className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void onToggleProductActive(product)}
                              className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                              title={product.isActive !== false ? "Desactivar" : "Activar"}
                            >
                              <Ban className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDeleteProduct(product.id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-neutral-500">
                No hay productos con los filtros actuales.
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <form
            onSubmit={(event) => void handleCategorySubmit(event)}
            className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-[#111]">
              {categoryForm.id ? "Editar categoria" : "Nueva categoria"}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Nombre"
                required
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
              />
              <input
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="Slug (opcional)"
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
              />
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Descripcion"
                rows={3}
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={categoryForm.sortOrder}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                  type="number"
                  placeholder="Orden"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
                />
                <input
                  value={categoryForm.accent}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, accent: event.target.value }))
                  }
                  placeholder="#ef4444"
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <input
                value={categoryForm.coverImage}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, coverImage: event.target.value }))
                }
                placeholder="URL imagen portada"
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={loading}
                  className="rounded-xl bg-[#ef2b2d] px-4 py-2.5 text-sm font-bold text-white"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryForm(emptyCategory())}
                  className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold"
                >
                  Limpiar
                </button>
              </div>
              {categoryForm.id ? (
                <button
                  type="button"
                  onClick={() => void onDeleteCategory(categoryForm.id)}
                  className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                  Eliminar categoria
                </button>
              ) : null}
            </div>
          </form>

          <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-[#111]">Categorias registradas</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryForm(category)}
                  className="rounded-xl border border-black/8 px-4 py-4 text-left transition hover:border-[#ef2b2d]/40 hover:bg-[#ef2b2d]/5"
                >
                  <p className="font-bold text-[#111]">{category.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{category.slug}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && editingProduct ? (
        <ProductEditModal
          key={editingProduct.id || "new-product"}
          product={editingProduct}
          categories={categories}
          loading={loading}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (product) => {
            await onSaveProduct(product);
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onUploadImage={onUploadImage}
        />
      ) : null}
    </div>
  );
}
