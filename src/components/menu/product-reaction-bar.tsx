"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, ThumbsUp } from "lucide-react";

import type { ProductReactionCounts, ReactionType } from "@/types/reactions";
import { getReactionTotal, getVisibleReactionTypes } from "@/types/reactions";

type ProductReactionBarProps = {
  productId: string;
  counts: ProductReactionCounts;
  userReaction: ReactionType | null;
  onReact: (productId: string, reaction: ReactionType | null) => void;
  compact?: boolean;
};

export function ProductReactionBar({
  productId,
  counts,
  userReaction,
  onReact,
  compact = false,
}: ProductReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = getReactionTotal(counts);
  const visibleTypes = getVisibleReactionTypes(counts);

  useEffect(() => {
    if (!pickerOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [pickerOpen]);

  function handleSelect(reaction: ReactionType) {
    const nextReaction = userReaction === reaction ? null : reaction;
    onReact(productId, nextReaction);
    setPickerOpen(false);
  }

  return (
    <div ref={rootRef} className="product-reaction-bar">
      {pickerOpen ? (
        <div className="product-reaction-picker" role="menu" aria-label="Elegir reaccion">
          <button
            type="button"
            className="product-reaction-picker-btn product-reaction-picker-btn-like"
            aria-label="Me gusta"
            onClick={() => handleSelect("like")}
          >
            <ThumbsUp className="size-4 fill-current" strokeWidth={0} />
          </button>
          <button
            type="button"
            className="product-reaction-picker-btn product-reaction-picker-btn-love"
            aria-label="Me encanta"
            onClick={() => handleSelect("love")}
          >
            <Heart className="size-4 fill-current" strokeWidth={0} />
          </button>
        </div>
      ) : null}

      <div className="product-reaction-row">
        {total > 0 ? (
          <div className="product-reaction-summary">
            <div className="product-reaction-badges">
              {visibleTypes.map((type) => (
                <span
                  key={type}
                  className={`product-reaction-badge ${
                    type === "like"
                      ? "product-reaction-badge-like"
                      : "product-reaction-badge-love"
                  }`}
                >
                  {type === "like" ? (
                    <ThumbsUp className="size-3 fill-current" strokeWidth={0} />
                  ) : (
                    <Heart className="size-3 fill-current" strokeWidth={0} />
                  )}
                </span>
              ))}
            </div>
            <span className="product-reaction-count">{total}</span>
          </div>
        ) : null}

        <button
          type="button"
          className={`product-reaction-trigger ${compact ? "product-reaction-trigger-compact" : ""} ${
            userReaction ? "is-active" : ""
          } ${userReaction === "like" ? "is-like" : userReaction === "love" ? "is-love" : ""}`}
          aria-label="Reaccionar al plato"
          aria-expanded={pickerOpen}
          onClick={(event) => {
            event.stopPropagation();
            setPickerOpen((current) => !current);
          }}
        >
          {userReaction === "love" ? (
            <Heart className="size-4 fill-current" strokeWidth={0} />
          ) : userReaction === "like" ? (
            <ThumbsUp className="size-4 fill-current" strokeWidth={0} />
          ) : (
            <ThumbsUp className="size-4" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
