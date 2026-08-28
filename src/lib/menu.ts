import { cache } from "react";

import { defaultSettings, seedCategories, seedProducts } from "@/data/seed";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { MenuPayload, SiteSettings } from "@/types/menu";

const fallbackPayload: MenuPayload = {
  categories: seedCategories,
  products: seedProducts,
  settings: defaultSettings,
  source: "seed",
};

function mapSettingsRecord(record: Record<string, unknown> | null): SiteSettings {
  if (!record) {
    return defaultSettings;
  }

  return {
    restaurantName: String(record.restaurant_name ?? defaultSettings.restaurantName),
    locationLabel: String(record.location_label ?? defaultSettings.locationLabel),
    heroTitle: String(record.hero_title ?? defaultSettings.heroTitle),
    heroSubtitle: String(record.hero_subtitle ?? defaultSettings.heroSubtitle),
    whatsappUrl: String(record.whatsapp_url ?? defaultSettings.whatsappUrl),
    deliveryUrl: String(record.delivery_url ?? defaultSettings.deliveryUrl),
    address: String(record.address ?? defaultSettings.address),
    schedule: String(record.schedule ?? defaultSettings.schedule),
    primaryColor: String(record.primary_color ?? defaultSettings.primaryColor),
    secondaryColor: String(record.secondary_color ?? defaultSettings.secondaryColor),
    heroBackgroundUrl: String(record.hero_background_url ?? defaultSettings.heroBackgroundUrl),
    logoUrl: String(record.logo_url ?? defaultSettings.logoUrl),
  };
}

export const getPublicMenuData = cache(async (): Promise<MenuPayload> => {
  if (!hasSupabaseServerEnv()) {
    return fallbackPayload;
  }

  try {
    const supabase = await createSupabaseServerClient();

    const [settingsResult, categoriesResult, productsResult] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (categoriesResult.error || productsResult.error) {
      return fallbackPayload;
    }

    if (!categoriesResult.data?.length || !productsResult.data?.length) {
      return fallbackPayload;
    }

    return {
      categories: categoriesResult.data.map((category) => ({
        id: String(category.id),
        slug: String(category.slug),
        name: String(category.name),
        description: String(category.description ?? ""),
        icon: String(category.icon ?? "UtensilsCrossed"),
        sortOrder: Number(category.sort_order ?? 0),
        accent: String(category.accent ?? "#ef4444"),
        coverImage: String(category.cover_image ?? defaultSettings.primaryColor),
      })),
      products: productsResult.data.map((product) => ({
        id: String(product.id),
        categorySlug: String(product.category_slug),
        sortOrder: Number(product.sort_order ?? 0),
        name: String(product.name),
        description: String(product.description ?? ""),
        price: Number(product.price ?? 0),
        imageUrl: String(product.image_url ?? ""),
        rating: Number(product.rating ?? 5),
        tag: product.tag ? String(product.tag) : undefined,
        isFeatured: Boolean(product.is_featured),
        isPopular: Boolean(product.is_popular),
      })),
      settings: mapSettingsRecord(settingsResult.data as Record<string, unknown> | null),
      source: "supabase",
    };
  } catch {
    return fallbackPayload;
  }
});
