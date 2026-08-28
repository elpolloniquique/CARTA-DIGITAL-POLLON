import { defaultSettings, seedCategories, seedProducts } from "@/data/seed";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category, Product, SiteSettings } from "@/types/menu";

export function mapSettingsToDb(settings: SiteSettings) {
  return {
    id: 1,
    restaurant_name: settings.restaurantName,
    location_label: settings.locationLabel,
    hero_title: settings.heroTitle,
    hero_subtitle: settings.heroSubtitle,
    whatsapp_url: settings.whatsappUrl,
    delivery_url: settings.deliveryUrl,
    address: settings.address,
    schedule: settings.schedule,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    hero_background_url: settings.heroBackgroundUrl,
    logo_url: settings.logoUrl,
  };
}

export function mapSettingsFromDb(row: Record<string, unknown>): SiteSettings {
  return {
    restaurantName: String(row.restaurant_name ?? defaultSettings.restaurantName),
    locationLabel: String(row.location_label ?? defaultSettings.locationLabel),
    heroTitle: String(row.hero_title ?? defaultSettings.heroTitle),
    heroSubtitle: String(row.hero_subtitle ?? defaultSettings.heroSubtitle),
    whatsappUrl: String(row.whatsapp_url ?? defaultSettings.whatsappUrl),
    deliveryUrl: String(row.delivery_url ?? defaultSettings.deliveryUrl),
    address: String(row.address ?? defaultSettings.address),
    schedule: String(row.schedule ?? defaultSettings.schedule),
    primaryColor: String(row.primary_color ?? defaultSettings.primaryColor),
    secondaryColor: String(row.secondary_color ?? defaultSettings.secondaryColor),
    heroBackgroundUrl: String(row.hero_background_url ?? defaultSettings.heroBackgroundUrl),
    logoUrl: String(row.logo_url ?? defaultSettings.logoUrl),
  };
}

export function mapCategoryFromDb(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ""),
    icon: String(row.icon ?? "UtensilsCrossed"),
    sortOrder: Number(row.sort_order ?? 0),
    accent: String(row.accent ?? "#ef4444"),
    coverImage: String(row.cover_image ?? ""),
  };
}

export function mapProductFromDb(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    categorySlug: String(row.category_slug),
    sortOrder: Number(row.sort_order ?? 0),
    name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    imageUrl: String(row.image_url ?? ""),
    rating: Number(row.rating ?? 5),
    tag: row.tag ? String(row.tag) : "",
    isFeatured: Boolean(row.is_featured),
    isPopular: Boolean(row.is_popular),
    isActive: row.is_active === undefined ? true : Boolean(row.is_active),
  };
}

export function mapProductToDb(product: Product) {
  return {
    id: product.id || slugify(product.name),
    category_slug: product.categorySlug,
    sort_order: Number(product.sortOrder ?? 0),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image_url: product.imageUrl,
    rating: Number(product.rating),
    tag: product.tag || null,
    is_featured: Boolean(product.isFeatured),
    is_popular: Boolean(product.isPopular),
    is_active: product.isActive !== false,
  };
}

export function mapCategoryToDb(category: Category) {
  const slug = category.slug || slugify(category.name);
  return {
    id: category.id || `cat-${slug}`,
    slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    sort_order: category.sortOrder,
    accent: category.accent,
    cover_image: category.coverImage,
  };
}

export async function loadAdminData() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase no configurado.");
  }

  const supabase = createSupabaseBrowserClient();
  const [settingsResult, categoriesResult, productsResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  return {
    settings: settingsResult.data
      ? mapSettingsFromDb(settingsResult.data as Record<string, unknown>)
      : defaultSettings,
    categories: (categoriesResult.data ?? []).map((row) =>
      mapCategoryFromDb(row as Record<string, unknown>),
    ),
    products: (productsResult.data ?? []).map((row) =>
      mapProductFromDb(row as Record<string, unknown>),
    ),
  };
}

export async function importSeedMenu() {
  if (!hasSupabaseEnv()) return;

  const supabase = createSupabaseBrowserClient();

  const { error: settingsError } = await supabase
    .from("site_settings")
    .upsert(mapSettingsToDb(defaultSettings));
  if (settingsError) throw settingsError;

  const { error: categoriesError } = await supabase.from("categories").upsert(
    seedCategories
      .filter((category) => category.slug !== "todo-menu")
      .map((category) => mapCategoryToDb(category)),
  );
  if (categoriesError) throw categoriesError;

  const { error: productsError } = await supabase.from("products").upsert(
    seedProducts.map((product, index) => ({
      ...mapProductToDb(product),
      sort_order: product.sortOrder ?? index + 1,
      is_active: true,
    })),
  );
  if (productsError) throw productsError;
}

export async function uploadProductImage(file: File) {
  return uploadSiteAsset(file, "products");
}

export async function uploadSiteAsset(file: File, folder: "hero" | "logo" | "products" = "products") {
  const supabase = createSupabaseBrowserClient();
  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${slugify(file.name)}.${extension}`;
  const path =
    folder === "products" ? `products/${fileName}` : `site/${folder}/${fileName}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
