/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { UploadCloud, X } from "lucide-react";

import type { Category, Product } from "@/types/menu";

type ProductEditModalProps = {
  product: Product;
  categories: Category[];
  loading: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
};

export function ProductEditModal({
  product,
  categories,
  loading,
  onClose,
  onSave,
  onUploadImage,
}: ProductEditModalProps) {
  const [form, setForm] = useState<Product>(product);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(form);
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const publicUrl = await onUploadImage(file);
      setForm((current) => ({ ...current, imageUrl: publicUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/8 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </p>
            <h3 className="text-xl font-black text-[#111]">{form.name || "Sin nombre"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-600">Categoria</span>
            <select
              value={form.categorySlug}
              onChange={(event) =>
                setForm((current) => ({ ...current, categorySlug: event.target.value }))
              }
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-600">Nombre</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-600">Descripcion</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-600">Precio</span>
              <input
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: Number(event.target.value) }))
                }
                type="number"
                min={0}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-neutral-600">
                Orden del plato
              </span>
              <input
                value={form.sortOrder ?? 0}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                }
                type="number"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Numero entero: 10 aparece primero, 20 despues, y asi sucesivamente.
              </p>
            </label>
          </div>

          <div className="rounded-2xl border border-black/8 bg-neutral-50 p-4">
            <p className="text-sm font-bold text-[#111]">Imagen del plato</p>
            {form.imageUrl ? (
              <div className="relative mt-3 inline-block">
                <img
                  src={form.imageUrl}
                  alt={form.name}
                  className="h-40 w-40 rounded-xl object-cover"
                />
                <span className="absolute left-2 top-2 rounded-md bg-[#ef2b2d] px-2 py-1 text-[0.65rem] font-black uppercase text-white">
                  Portada
                </span>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Agregar URL de imagen
                </span>
                <div className="flex gap-2">
                  <input
                    value={imageUrlInput}
                    onChange={(event) => setImageUrlInput(event.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!imageUrlInput.trim()) return;
                      setForm((current) => ({ ...current, imageUrl: imageUrlInput.trim() }));
                      setImageUrlInput("");
                    }}
                    className="rounded-xl bg-[#111] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Agregar
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Subir fotos desde tu PC o movil
                </span>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 bg-white px-4 py-6 text-sm text-neutral-600">
                  <UploadCloud className="size-5" />
                  {uploading ? "Subiendo..." : "Seleccionar una o varias fotos"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleFileUpload(file);
                    }}
                  />
                </label>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-black/8 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              disabled={loading || uploading}
              className="rounded-xl bg-[#ef2b2d] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
