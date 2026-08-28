import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { getSessionId } from "@/lib/analytics";
import type { ProductReactionCounts, ReactionType } from "@/types/reactions";
import { emptyReactionCounts } from "@/types/reactions";

const LOCAL_REACTIONS_KEY = "pollon-product-reactions";

function readLocalReactions(): Record<string, ReactionType> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(LOCAL_REACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored) as Record<string, ReactionType>;
    }

    const legacy = JSON.parse(window.localStorage.getItem("pollon-liked-ids") ?? "[]") as string[];
    if (legacy.length) {
      const migrated = Object.fromEntries(legacy.map((productId) => [productId, "love" as ReactionType]));
      writeLocalReactions(migrated);
      return migrated;
    }

    return {};
  } catch {
    return {};
  }
}

function writeLocalReactions(reactions: Record<string, ReactionType>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_REACTIONS_KEY, JSON.stringify(reactions));
}

function applyReactionRow(
  map: Map<string, ProductReactionCounts>,
  productId: string,
  reactionType: string,
) {
  const counts = map.get(productId) ?? emptyReactionCounts();

  if (reactionType === "like") {
    counts.likes += 1;
  } else {
    counts.loves += 1;
  }

  map.set(productId, counts);
}

function buildMapFromLocalReactions(): Map<string, ProductReactionCounts> {
  const map = new Map<string, ProductReactionCounts>();
  const local = readLocalReactions();

  Object.entries(local).forEach(([productId, reactionType]) => {
    applyReactionRow(map, productId, reactionType);
  });

  return map;
}

export async function fetchProductReactionsMap(): Promise<Map<string, ProductReactionCounts>> {
  if (!hasSupabaseEnv()) {
    return buildMapFromLocalReactions();
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("product_likes").select("product_id, reaction_type");

    const map = new Map<string, ProductReactionCounts>();

    data?.forEach((row) => {
      applyReactionRow(map, String(row.product_id), String(row.reaction_type ?? "love"));
    });

    return map;
  } catch {
    return buildMapFromLocalReactions();
  }
}

export async function fetchUserReactions(): Promise<Record<string, ReactionType>> {
  const local = readLocalReactions();

  if (!hasSupabaseEnv()) {
    return local;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("product_likes")
      .select("product_id, reaction_type")
      .eq("session_id", getSessionId());

    if (!data?.length) {
      return local;
    }

    const merged = { ...local };

    data.forEach((row) => {
      const reactionType = String(row.reaction_type ?? "love") as ReactionType;
      merged[String(row.product_id)] = reactionType === "like" ? "like" : "love";
    });

    return merged;
  } catch {
    return local;
  }
}

export async function trackProductReaction(productId: string, reaction: ReactionType | null) {
  const sessionId = getSessionId();
  const local = readLocalReactions();

  if (reaction) {
    local[productId] = reaction;
  } else {
    delete local[productId];
  }

  writeLocalReactions(local);

  if (!hasSupabaseEnv()) return;

  try {
    const supabase = createSupabaseBrowserClient();

    if (reaction) {
      await supabase.from("product_likes").upsert(
        {
          product_id: productId,
          session_id: sessionId,
          reaction_type: reaction,
        },
        { onConflict: "product_id,session_id" },
      );
    } else {
      await supabase
        .from("product_likes")
        .delete()
        .eq("product_id", productId)
        .eq("session_id", sessionId);
    }
  } catch {
    // fallback local only
  }
}

export function subscribeProductReactions(
  onUpdate: (map: Map<string, ProductReactionCounts>) => void,
) {
  if (!hasSupabaseEnv()) {
    return () => undefined;
  }

  let active = true;

  const supabase = createSupabaseBrowserClient();
  const channel = supabase
    .channel("public-product-likes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_likes" },
      () => {
        void fetchProductReactionsMap().then((map) => {
          if (active) {
            onUpdate(map);
          }
        });
      },
    )
    .subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}

export function getProductReactionCounts(
  map: Map<string, ProductReactionCounts>,
  productId: string,
): ProductReactionCounts {
  return map.get(productId) ?? emptyReactionCounts();
}

export async function fetchPublicTopReactions(limit = 6): Promise<Map<string, number>> {
  const reactionsMap = await fetchProductReactionsMap();

  return new Map(
    [...reactionsMap.entries()]
      .map(([productId, counts]) => [productId, counts.likes + counts.loves] as const)
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit),
  );
}
