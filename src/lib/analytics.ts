import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import type { AdminAnalytics, FavoriteProductStat, VisitStats } from "@/types/admin";

const SESSION_KEY = "pollon-session-id";
const LOCAL_VISITS_KEY = "pollon-local-visits";
const LOCAL_LIKES_KEY = "pollon-liked-ids";

export function getSessionId() {
  if (typeof window === "undefined") {
    return "server";
  }

  let sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

function readLocalVisits(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_VISITS_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalVisit(isoDate: string) {
  const visits = readLocalVisits();
  visits.push(isoDate);
  window.localStorage.setItem(LOCAL_VISITS_KEY, JSON.stringify(visits.slice(-5000)));
}

function readLocalLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LIKES_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalLikedIds(ids: string[]) {
  window.localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(ids));
}

export async function trackPageVisit() {
  const sessionId = getSessionId();
  const visitedAt = new Date().toISOString();
  writeLocalVisit(visitedAt);

  if (!hasSupabaseEnv()) return;

  try {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("analytics_visits").insert({
      session_id: sessionId,
      visited_at: visitedAt,
    });
  } catch {
    // fallback local only
  }
}

export async function trackProductLike(productId: string, liked: boolean) {
  const { trackProductReaction } = await import("@/lib/reactions");
  await trackProductReaction(productId, liked ? "love" : null);
}

export async function fetchUserLikedProductIds(): Promise<string[]> {
  const localIds = readLocalLikedIds();

  if (!hasSupabaseEnv()) return localIds;

  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("product_likes")
      .select("product_id")
      .eq("session_id", getSessionId());

    if (!data?.length) return localIds;

    return Array.from(
      new Set([...localIds, ...data.map((row) => String(row.product_id))]),
    );
  } catch {
    return localIds;
  }
}

function buildVisitStatsFromDates(dates: Date[]): VisitStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const byHourMap = new Map<number, number>();
  const byDayMap = new Map<string, number>();

  for (let index = 6; index >= 0; index -= 1) {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - index);
    const key = day.toLocaleDateString("es-CL", { weekday: "short" });
    byDayMap.set(key, 0);
  }

  let today = 0;
  let week = 0;
  let month = 0;

  dates.forEach((date) => {
    if (date >= startOfToday) today += 1;
    if (date >= startOfWeek) week += 1;
    if (date >= startOfMonth) month += 1;

    const hour = date.getHours();
    byHourMap.set(hour, (byHourMap.get(hour) ?? 0) + 1);

    const dayKey = date.toLocaleDateString("es-CL", { weekday: "short" });
    if (byDayMap.has(dayKey)) {
      byDayMap.set(dayKey, (byDayMap.get(dayKey) ?? 0) + 1);
    }
  });

  return {
    today,
    week,
    month,
    total: dates.length,
    byHour: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: byHourMap.get(hour) ?? 0,
    })),
    byDay: Array.from(byDayMap.entries()).map(([label, count]) => ({ label, count })),
  };
}

function buildFavoritesFromMap(
  likesMap: Map<string, number>,
  products: { id: string; name: string; categorySlug: string; imageUrl: string }[],
): FavoriteProductStat[] {
  return products
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      categorySlug: product.categorySlug,
      imageUrl: product.imageUrl,
      likes: likesMap.get(product.id) ?? 0,
    }))
    .filter((item) => item.likes > 0)
    .sort((a, b) => b.likes - a.likes);
}

async function fetchLikesMap(): Promise<Map<string, number>> {
  const likesMap = new Map<string, number>();

  if (!hasSupabaseEnv()) {
    readLocalLikedIds().forEach((productId) => {
      likesMap.set(productId, (likesMap.get(productId) ?? 0) + 1);
    });
    return likesMap;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from("product_likes").select("product_id");

    data?.forEach((row) => {
      const productId = String(row.product_id);
      likesMap.set(productId, (likesMap.get(productId) ?? 0) + 1);
    });
  } catch {
    readLocalLikedIds().forEach((productId) => {
      likesMap.set(productId, (likesMap.get(productId) ?? 0) + 1);
    });
  }

  return likesMap;
}

export async function fetchPublicTopLikes(limit = 6): Promise<Map<string, number>> {
  const likesMap = await fetchLikesMap();
  return new Map(
    [...likesMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit),
  );
}

export async function fetchAdminAnalytics(
  products: { id: string; name: string; categorySlug: string; imageUrl: string }[],
): Promise<AdminAnalytics> {
  const localVisitDates = readLocalVisits().map((iso) => new Date(iso));
  const likesMap = await fetchLikesMap();

  if (!hasSupabaseEnv()) {
    return {
      visits: buildVisitStatsFromDates(localVisitDates),
      favorites: buildFavoritesFromMap(likesMap, products),
    };
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("analytics_visits")
      .select("visited_at")
      .gte("visited_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString());

    const visitDates =
      data?.map((row) => new Date(String(row.visited_at))) ?? localVisitDates;

    return {
      visits: buildVisitStatsFromDates(visitDates.length ? visitDates : localVisitDates),
      favorites: buildFavoritesFromMap(likesMap, products),
    };
  } catch {
    return {
      visits: buildVisitStatsFromDates(localVisitDates),
      favorites: buildFavoritesFromMap(likesMap, products),
    };
  }
}
