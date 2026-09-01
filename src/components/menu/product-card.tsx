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
        className="block w-full text-left"
        aria-label={`Ver ${product.name}`}
      >
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-32 w-full object-cover md:h-40"
          />
          <span className="type-kicker is-light absolute left-2 top-2 rounded-full bg-[var(--brand-red)] px-2 py-1 text-[0.58rem] text-white">
            {product.tag?.toUpperCase() ?? "Oferta"}
          </span>
        </div>

        <p
          className={`type-product line-clamp-3 min-h-[2.7rem] px-3 pt-2 text-center ${
            isDark ? "text-white" : "text-[var(--text-ink)]"
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
          className="type-price shrink-0 rounded-[0.7rem] bg-brand-gradient px-3.5 py-1.5 text-[0.88rem] text-white md:px-4 md:text-[0.95rem]"
        >
          {formatCurrency(product.price)}
        </button>
      </div>
    </article>
  );
}
