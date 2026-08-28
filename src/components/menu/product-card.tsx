"use client";

import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/menu";
import type { ProductReactionCounts, ReactionType } from "@/types/reactions";

import { ProductReactionBar } from "./product-reaction-bar";

type ProductCardProps = {
  product: Product;
  counts: ProductReactionCounts;
  userReaction: ReactionType | null;
  onReact: (productId: string, reaction: ReactionType | null) => void;
  onOpen: (product: Product) => void;
  isDark?: boolean;
};

export function ProductCard({
  product,
  counts,
  userReaction,
  onReact,
  onOpen,
  isDark = false,
}: ProductCardProps) {
  return (
    <article
      className={`product-card overflow-hidden rounded-[1.55rem] border shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${
        isDark
          ? "border-white/10 bg-[#1b1b1b] text-white"
          : "border-black/10 bg-white text-neutral-900"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="block w-full text-left"
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-32 w-full object-cover md:h-40"
          />
          <span className="absolute left-2 top-2 rounded-full bg-[var(--brand-red)] px-2 py-1 text-[0.55rem] font-black uppercase tracking-[0.15em] text-white">
            {product.tag?.toUpperCase() ?? "Oferta"}
          </span>
        </div>

        <p
          className={`line-clamp-3 min-h-[2.7rem] px-3 pt-2 text-center text-[0.95rem] font-medium leading-5 ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          {product.name}
        </p>
      </button>

      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
        <ProductReactionBar
          productId={product.id}
          counts={counts}
          userReaction={userReaction}
          onReact={onReact}
          compact
        />

        <button
          type="button"
          onClick={() => onOpen(product)}
          className="shrink-0 rounded-[0.7rem] bg-brand-gradient px-3.5 py-1.5 text-[0.92rem] font-black text-white shadow-sm md:px-4 md:text-[1.02rem]"
        >
          {formatCurrency(product.price)}
        </button>
      </div>
    </article>
  );
}
