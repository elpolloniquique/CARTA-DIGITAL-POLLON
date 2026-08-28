export type ReactionType = "like" | "love";

export interface ProductReactionCounts {
  likes: number;
  loves: number;
}

export function getReactionTotal(counts: ProductReactionCounts) {
  return counts.likes + counts.loves;
}

export function getVisibleReactionTypes(counts: ProductReactionCounts): ReactionType[] {
  if (counts.likes === 0 && counts.loves === 0) {
    return [];
  }

  if (counts.loves >= counts.likes) {
    const types: ReactionType[] = [];
    if (counts.loves > 0) types.push("love");
    if (counts.likes > 0) types.push("like");
    return types;
  }

  const types: ReactionType[] = [];
  if (counts.likes > 0) types.push("like");
  if (counts.loves > 0) types.push("love");
  return types;
}

export function emptyReactionCounts(): ProductReactionCounts {
  return { likes: 0, loves: 0 };
}
