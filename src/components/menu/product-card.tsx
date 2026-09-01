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
      className={`product-card overflow-hidden rounded-xl border ${
        isDark
          ? "border-white/10 bg-[#1b1b1b] text-white"
          : "border-[#e5e5e5] bg-white text-neutral-900"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="block min-h-0 w-full flex-1 text-left"
        aria-label={`Ver ${product.name}`}
      >
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-32 w-full object-cover md:h-40"
          />
        </div>

        <p
          className={`type-product line-clamp-2 min-h-[2.45rem] px-2.5 pt-2 text-left leading-[1.25] ${
            isDark ? "text-white" : "text-[var(--text-ink)]"
          }`}
        >
          {product.name}
        </p>
      </button>

      <div className="mt-auto flex items-center justify-between gap-3 px-2.5 pb-2.5 pt-1.5">
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
          className="type-price inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient px-2.5 text-[0.78rem] text-white md:h-9 md:px-3 md:text-[0.88rem]"
        >
          {formatCurrency(product.price)}
        </button>
      </div>
    </article>
  );
}
