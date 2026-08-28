"use client";

import { useRef, useState } from "react";

type SiteImageFieldProps = {
  label: string;
  description: string;
  value: string;
  previewClassName?: string;
  accept?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
};

export function SiteImageField({
  label,
  description,
  value,
  previewClassName = "h-32 w-full rounded-xl object-cover",
  accept = "image/*",
  onChange,
  onUpload,
}: SiteImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No pudimos subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-neutral-50 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-neutral-700">{label}</p>
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      </div>

      {value ? (
        <div className="mb-4 overflow-hidden rounded-xl border border-black/8 bg-white">
          <img src={value} alt={label} className={previewClassName} />
        </div>
      ) : (
        <div className="mb-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-black/10 bg-white text-xs text-neutral-400">
          Sin imagen configurada
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          URL de imagen
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl bg-[#111] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {uploading ? "Subiendo..." : "Subir desde PC"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Quitar imagen
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      {error ? <p className="mt-2 text-xs font-medium text-[#ef2b2d]">{error}</p> : null}
    </div>
  );
}
