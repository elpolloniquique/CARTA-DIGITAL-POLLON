/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChefHat,
  ChevronRight,
  GlassWater,
  Globe,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  MoonStar,
  Package,
  Phone,
  Plus,
  Search,
  Star,
  Sun,
  SunMedium,
  ThumbsUp,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { defaultSettings } from "@/data/seed";
import { trackPageVisit } from "@/lib/analytics";
import {
  fetchProductReactionsMap,
  fetchPublicTopReactions,
  fetchUserReactions,
  getProductReactionCounts,
  subscribeProductReactions,
  trackProductReaction,
} from "@/lib/reactions";
import type { Category, MenuPayload, Product } from "@/types/menu";
import type { ProductReactionCounts, ReactionType } from "@/types/reactions";
import { getVisibleReactionTypes } from "@/types/reactions";

import { ProductCard } from "./product-card";
import { ProductReactionBar } from "./product-reaction-bar";

const categoryIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Home,
  Users,
  HeartHandshake,
  UtensilsCrossed,
  ChefHat,
  PlusCircle: Plus,
  GlassWater,
  Package,
};

const HOME_HERO_BUTTONS = [
  "todo-menu",
  "ofertas-familiares",
  "ofertas-dos",
  "ofertas-personales",
  "agregados",
  "platos-extras",
  "bebidas",
] as const;

type MobileMenuAppProps = {
  initialData: MenuPayload;
};

function BrandLogo({
  logoUrl,
  alt,
  className,
  fallback,
}: {
  logoUrl: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  if (logoUrl.trim()) {
    return <img src={logoUrl} alt={alt} className={className} />;
  }

  return <>{fallback}</>;
}

function getCategoryIcon(iconName: string) {
  return categoryIconMap[iconName] ?? UtensilsCrossed;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getInitials(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}

function matchesSmartSearch(query: string, product: Product, categoryName: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const productName = normalizeText(product.name);
  const productDescription = normalizeText(product.description);
  const normalizedCategory = normalizeText(categoryName);
  const combined = `${productName} ${productDescription} ${normalizedCategory}`.trim();
  const words = combined.split(/\s+/).filter(Boolean);
  const collapsedQuery = normalizedQuery.replace(/\s+/g, "");
  const initials = getInitials(`${product.name} ${categoryName}`);

  if (
    combined.includes(normalizedQuery) ||
    productName.startsWith(normalizedQuery) ||
    productDescription.startsWith(normalizedQuery) ||
    normalizedCategory.startsWith(normalizedQuery) ||
    initials.startsWith(collapsedQuery)
  ) {
    return true;
  }

  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTokens.every((token) => words.some((word) => word.startsWith(token)));
}

function splitHeroCategoryLabel(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length <= 1) {
    return words;
  }

  if (words.length === 2) {
    return words;
  }

  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

function formatWhatsAppDisplay(url: string) {
  const match = url.match(/wa\.me\/(\d+)/i);
  if (!match) {
    return url;
  }

  const digits = match[1];
  if (digits.startsWith("56") && digits.length >= 11) {
    return `+56 ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  return `+${digits}`;
}

function getWhatsAppDigits(url: string) {
  const match = url.match(/wa\.me\/(\d+)/i);
  return match?.[1] ?? "";
}

function getPhoneCallHref(url: string) {
  const digits = getWhatsAppDigits(url);
  return digits ? `tel:+${digits}` : url;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function HeroCategoryLabel({ name }: { name: string }) {
  const lines = splitHeroCategoryLabel(name);

  return (
    <span className="hero-category-label">
      {lines.map((line) => (
        <span key={line} className="hero-category-label-line">
          {line}
        </span>
      ))}
    </span>
  );
}

export function MobileMenuApp({ initialData }: MobileMenuAppProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todo-menu");
  const [categoryScreenOpen, setCategoryScreenOpen] = useState(false);
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType>>({});
  const [reactionsMap, setReactionsMap] = useState<Map<string, ProductReactionCounts>>(new Map());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("pollon-theme");
    return storedTheme === "dark" ? "dark" : "light";
  });
  const [exploreTick, setExploreTick] = useState(0);
  const [topLikesMap, setTopLikesMap] = useState<Map<string, number>>(new Map());

  const categories = initialData.categories;
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.slug !== "todo-menu"),
    [categories],
  );

  const categoryNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.slug, category.name]),
      ) as Record<string, string>,
    [categories],
  );

  const homeHeroCategories = useMemo(
    () =>
      HOME_HERO_BUTTONS.map((slug) => categories.find((category) => category.slug === slug)).filter(
        Boolean,
      ) as Category[],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const baseProducts =
      activeCategory === "todo-menu"
        ? initialData.products
        : initialData.products.filter((product) => product.categorySlug === activeCategory);

    const searchedProducts = search.trim()
      ? baseProducts.filter((product) =>
          matchesSmartSearch(search, product, categoryNameBySlug[product.categorySlug] ?? ""),
        )
      : baseProducts;

    return showFavoritesOnly
      ? searchedProducts.filter((product) => Boolean(userReactions[product.id]))
      : searchedProducts;
  }, [
    activeCategory,
    categoryNameBySlug,
    userReactions,
    initialData.products,
    search,
    showFavoritesOnly,
  ]);

  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) {
      return [];
    }

    return initialData.products
      .filter((product) =>
        matchesSmartSearch(globalSearchQuery, product, categoryNameBySlug[product.categorySlug] ?? ""),
      )
      .slice(0, 18);
  }, [categoryNameBySlug, globalSearchQuery, initialData.products]);

  const currentCategoryMeta = useMemo<Category | undefined>(() => {
    return categories.find((category) => category.slug === activeCategory);
  }, [activeCategory, categories]);

  const activeLabel =
    activeCategory === "todo-menu"
      ? "TODO EL MENU"
      : currentCategoryMeta?.name.toUpperCase() ?? "NUESTRA CARTA";

  const activeDescription =
    activeCategory === "todo-menu"
      ? "Todos los platos de todas las categorias."
      : currentCategoryMeta?.description ?? "Platos de esta categoria.";

  const isDark = theme === "dark";

  const [locationCity, locationCountry] = useMemo(() => {
    const parts = initialData.settings.locationLabel.split(",").map((part) => part.trim());
    return [parts[0] ?? "Iquique", parts[1] ?? "Chile"];
  }, [initialData.settings.locationLabel]);

  const heroBackgroundUrl =
    initialData.settings.heroBackgroundUrl || defaultSettings.heroBackgroundUrl;
  const logoUrl = initialData.settings.logoUrl;
  const restaurantName = initialData.settings.restaurantName;

  const topLikedProducts = useMemo(() => {
    return [...topLikesMap.entries()]
      .map(([productId, likes]) => {
        const product = initialData.products.find((item) => item.id === productId);
        return product ? { product, likes } : null;
      })
      .filter((item): item is { product: Product; likes: number } => Boolean(item));
  }, [initialData.products, topLikesMap]);

  useEffect(() => {
    window.localStorage.setItem("pollon-theme", theme);
  }, [theme]);

  useEffect(() => {
    void trackPageVisit();

    void Promise.all([fetchUserReactions(), fetchProductReactionsMap()]).then(
      ([reactions, map]) => {
        setUserReactions(reactions);
        setReactionsMap(map);
      },
    );

    const unsubscribe = subscribeProductReactions(setReactionsMap);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function refreshTopLikes() {
      const likes = await fetchPublicTopReactions(6);
      setTopLikesMap(likes);
    }

    void refreshTopLikes();
    const timer = window.setInterval(() => {
      void refreshTopLikes();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [reactionsMap]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExploreTick((current) => current + 1);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  function openCategory(slug: string, openFullscreen = true) {
    setActiveCategory(slug);
    setDrawerOpen(false);
    setCategoryScreenOpen(openFullscreen);
    setCategorySearchOpen(false);
    setSearch("");
    setShowFavoritesOnly(false);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery("");
  }

  function closeCategoryScreen() {
    setCategoryScreenOpen(false);
    setCategorySearchOpen(false);
    setSearch("");
    setShowFavoritesOnly(false);
  }

  function handleProductReaction(productId: string, reaction: ReactionType | null) {
    const previousReaction = userReactions[productId] ?? null;

    setUserReactions((current) => {
      const next = { ...current };
      if (reaction) {
        next[productId] = reaction;
      } else {
        delete next[productId];
      }
      return next;
    });

    setReactionsMap((current) => {
      const next = new Map(current);
      const counts = { ...getProductReactionCounts(current, productId) };

      if (previousReaction === "like") {
        counts.likes = Math.max(0, counts.likes - 1);
      }
      if (previousReaction === "love") {
        counts.loves = Math.max(0, counts.loves - 1);
      }
      if (reaction === "like") {
        counts.likes += 1;
      }
      if (reaction === "love") {
        counts.loves += 1;
      }

      if (counts.likes === 0 && counts.loves === 0) {
        next.delete(productId);
      } else {
        next.set(productId, counts);
      }

      return next;
    });

    void trackProductReaction(productId, reaction);
  }

  function openProductFromSearch(product: Product) {
    setGlobalSearchOpen(false);
    setGlobalSearchQuery("");
    setActiveCategory(product.categorySlug);
    setCategoryScreenOpen(true);
    setCategorySearchOpen(false);
    setSearch("");
    setShowFavoritesOnly(false);
    setSelectedProduct(product);
  }

  return (
    <main className={`desktop-frame ${isDark ? "dark-surface bg-[#050505]" : "light-surface"}`}>
      <div
        className={`mobile-shell transition-colors ${
          isDark
            ? "border-white/10 bg-gradient-to-b from-[#0f0f0f] to-[#171717] text-white shadow-none md:border-none md:bg-[#111] md:from-[#111] md:to-[#111]"
            : "light-surface border-[#e5e5e5] text-neutral-900 shadow-none md:border-none"
        }`}
      >
        <nav
          className={`wide-top-nav sticky top-0 z-40 items-center gap-5 border-b px-5 py-4 lg:gap-8 lg:px-8 ${
            isDark
              ? "border-white/10 bg-[#111]/95 text-white backdrop-blur-xl"
              : "border-black/8 bg-white/95 text-neutral-900 backdrop-blur-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
              isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-neutral-50"
            }`}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>

          <p className="type-brand-mark shrink-0 lg:text-[1.35rem]">
            <BrandLogo
              logoUrl={logoUrl}
              alt={restaurantName}
              className="h-9 max-w-[140px] object-contain lg:h-10 lg:max-w-[160px]"
              fallback={restaurantName}
            />
          </p>

          <div className="hidden min-w-0 flex-1 flex-col items-center text-center sm:flex">
            <p className="type-brand-mark text-[1.2rem] lg:text-[1.35rem]">
              Carta <span className="text-[var(--brand-red)]">Digital</span>
            </p>
            <p className="type-kicker mt-1">
              <span className="text-[var(--brand-red)]">{locationCity}</span>
              <span className={isDark ? "text-white/70" : "text-neutral-800"}> · {locationCountry}</span>
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <label
              className={`hidden min-w-[220px] items-center gap-3 rounded-full border px-4 py-2.5 lg:flex lg:min-w-[320px] ${
                isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white shadow-sm"
              }`}
            >
              <Search className="size-4 shrink-0 text-neutral-400" />
              <input
                value={globalSearchQuery}
                onChange={(event) => {
                  setGlobalSearchQuery(event.target.value);
                  setGlobalSearchOpen(true);
                }}
                onFocus={() => setGlobalSearchOpen(true)}
                placeholder="Buscar platos..."
                className={`w-full border-none bg-transparent text-sm outline-none ${
                  isDark ? "text-white placeholder:text-white/40" : "text-neutral-800 placeholder:text-neutral-400"
                }`}
              />
            </label>

            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className={`flex size-11 items-center justify-center rounded-xl border lg:hidden ${
                isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-neutral-50"
              }`}
              aria-label="Buscar platos"
            >
              <Search className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="inline-flex size-11 items-center justify-center rounded-full bg-[var(--brand-red)] text-white shadow-[0_4px_12px_rgba(239,43,45,0.35)]"
              aria-label="Cambiar tema"
            >
              {isDark ? <MoonStar className="size-5" /> : <SunMedium className="size-5" />}
            </button>
          </div>
        </nav>

        <div className="desktop-content-wrap pb-8 pt-0 md:px-0 md:pb-10 md:pt-0">
          <header
            className={`mobile-top-bar sticky top-0 z-30 md:hidden ${
              isDark ? "mobile-top-bar-dark" : "mobile-top-bar-light"
            }`}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className={`mobile-header-icon-btn ${isDark ? "text-white" : "text-neutral-900"}`}
                aria-label="Abrir menu"
              >
                <Menu className="size-7" strokeWidth={2.25} />
              </button>

              <div className="flex-1 text-center">
                <div
                  className={`mobile-header-title ${isDark ? "text-white" : "text-neutral-900"}`}
                >
                  Carta <span className="text-[var(--brand-red)]">Digital</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGlobalSearchOpen(true)}
                  className={`mobile-header-icon-btn ${isDark ? "text-white" : "text-neutral-900"}`}
                  aria-label="Buscar platos"
                >
                  <Search className="size-6" strokeWidth={2.25} />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                  className="mobile-theme-toggle"
                  aria-label="Cambiar tema"
                >
                  {isDark ? (
                    <MoonStar className="mobile-theme-toggle-icon size-[1.15rem] fill-white" strokeWidth={1.5} />
                  ) : (
                    <Sun className="mobile-theme-toggle-icon size-[1.15rem] fill-white/95 text-white" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </header>

          <section className="wide-hero-banner mobile-hero-edge hero-banner-stage relative overflow-hidden md:rounded-none md:border-none">
            <img
              src={heroBackgroundUrl}
              alt={`Local de ${restaurantName}`}
              className="hero-banner-image"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />

            <div className="absolute inset-x-0 top-0 p-5 text-center text-white md:inset-x-auto md:left-10 md:top-10 md:p-0 md:text-left lg:left-14 lg:top-12">
              <div className="hero-brand-badge mx-auto max-w-[220px] rounded-xl px-4 py-2 md:mx-0 md:max-w-none md:px-8 md:py-6">
                <p className="type-display text-[2rem] text-[var(--brand-red)] md:text-[2.75rem] lg:text-[3.1rem]">
                  {restaurantName}
                </p>
                <p className="type-kicker is-light mt-1.5 md:mt-2">
                  Pollo a la brasa · {locationCity}, {locationCountry}
                </p>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-5 md:hidden">
              <div className="mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => openCategory("todo-menu", true)}
                  className="hero-all-menu-btn"
                  aria-label="Ver todo el menu"
                >
                  <Home className="size-4 shrink-0" />
                  <span className="hero-all-menu-label">Todo el menu</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {homeHeroCategories
                  .filter((category) => category.slug !== "todo-menu")
                  .map((category) => {
                    const Icon = getCategoryIcon(category.icon);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => openCategory(category.slug, true)}
                        className="hero-category-btn hero-category-btn-mobile"
                      >
                        <Icon className="hero-category-icon" />
                        <HeroCategoryLabel name={category.name} />
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="wide-hero-actions absolute inset-x-0 hidden flex-col items-center gap-4 px-6 md:flex lg:gap-5 lg:px-14">
              <button
                type="button"
                onClick={() => openCategory("todo-menu", true)}
                className="hero-all-menu-btn"
                aria-label="Ver todo el menu"
              >
                <Home className="size-4 shrink-0" />
                <span className="hero-all-menu-label">Todo el menu</span>
              </button>

              <div className="wide-hero-category-row">
              {homeHeroCategories
                .filter((category) => category.slug !== "todo-menu")
                .map((category) => {
                  const Icon = getCategoryIcon(category.icon);

                  return (
                    <button
                      key={`wide-hero-${category.id}`}
                      type="button"
                      onClick={() => openCategory(category.slug, true)}
                      className="hero-category-btn hero-category-btn-wide"
                    >
                      <Icon className="hero-category-icon" />
                      <HeroCategoryLabel name={category.name} />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="mobile-content-pad px-3 md:px-0">
          <section className="mt-6 md:mt-10">
            <div
              className={`type-section mb-4 md:mb-5 ${isDark ? "text-white" : "text-[var(--text-ink)]"}`}
            >
              Explorar
            </div>

            <div className="desktop-explore-grid space-y-4 px-0.5 md:space-y-0">
              {visibleCategories.map((category, categoryIndex) => {
                const products = initialData.products.filter(
                  (product) => product.categorySlug === category.slug,
                );

                if (!products.length) {
                  return null;
                }

                const currentProduct =
                  products[(exploreTick + categoryIndex) % products.length] ?? products[0];
                const Icon = getCategoryIcon(category.icon);

                return (
                  <button
                    key={`explore-${category.id}`}
                    type="button"
                    onClick={() => openCategory(category.slug, true)}
                    className={`mx-auto block w-full overflow-hidden rounded-xl border text-left transition ${
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-[#e5e5e5] bg-white"
                    }`}
                  >
                    <div className="relative">
                      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-1.5 px-3 pt-3">
                        <Icon className="size-4 shrink-0 text-[#171717] md:size-5" />
                        <p className="explore-card-label text-black">
                          {category.name}
                        </p>
                      </div>
                      <img
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        className="h-[230px] w-full object-cover md:h-[320px] lg:h-[360px]"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2.5 px-3 pb-3 md:px-4 md:pb-4">
                        <span className="type-price shrink-0 rounded-full bg-white px-3 py-1.5 text-[0.88rem] text-[var(--brand-red)] shadow-sm md:px-4 md:py-1.5 md:text-[0.95rem]">
                          {formatCurrency(currentProduct.price)}
                        </span>
                        <p className="explore-card-title min-w-0 flex-1 line-clamp-2 text-white" style={{ color: "#ffffff" }}>
                          {currentProduct.name}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {topLikedProducts.length > 0 ? (
            <section className="mt-8 md:mt-10">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`type-section ${isDark ? "text-white" : "text-[var(--text-ink)]"}`}
                >
                  Favoritos de clientes
                </div>
                <span className="type-kicker rounded-full bg-[var(--brand-red)]/10 px-3 py-1">
                  En vivo
                </span>
              </div>

              <div className="desktop-favorites-grid space-y-3 md:space-y-0">
                {topLikedProducts.map(({ product, likes }) => (
                  <button
                    key={`top-like-${product.id}`}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={`flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left ${
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-[#e5e5e5] bg-white"
                    }`}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="type-product line-clamp-2">{product.name}</p>
                      <p className="type-price mt-1 text-[0.9rem] text-[var(--brand-red)]">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <div className="product-reaction-badges">
                        {getVisibleReactionTypes(
                          getProductReactionCounts(reactionsMap, product.id),
                        ).map((type) => (
                          <span
                            key={`top-${product.id}-${type}`}
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
                      <span className="type-price text-[0.85rem] text-[var(--text-body)]">{likes}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <footer
            id="ubicacion"
            className={`mt-8 hidden rounded-xl border p-5 md:block md:mt-12 md:p-6 ${
              isDark
                ? "border-white/10 bg-white/5 text-white"
                : "border-[#e5e5e5] bg-white text-neutral-800"
            }`}
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="type-kicker">
                  Ubicacion
                </p>
                <p className="type-display mt-2 text-[1.25rem]">{initialData.settings.restaurantName}</p>
                <p className="type-muted mt-1">{initialData.settings.address}</p>
              </div>
              <div>
                <p className="type-kicker">
                  Horario
                </p>
                <p className="type-muted mt-2">{initialData.settings.schedule}</p>
              </div>
              <div>
                <p className="type-kicker">
                  Contacto
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={initialData.settings.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                  <a
                    href={initialData.settings.deliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                      isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-neutral-50"
                    }`}
                  >
                    <Globe className="size-4" />
                    Web
                  </a>
                </div>
              </div>
            </div>
          </footer>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-black/50 transition ${
            drawerOpen || globalSearchOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => {
            setDrawerOpen(false);
            setGlobalSearchOpen(false);
          }}
        />

        <aside
          className={`menu-drawer fixed left-0 top-0 z-[60] flex h-full w-[min(78vw,248px)] max-w-[248px] flex-col text-neutral-900 transition duration-300 md:w-[min(280px,28vw)] md:max-w-[280px] ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="menu-drawer-header shrink-0">
            <div className="flex w-full items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push("/admin");
                }}
                className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition hover:scale-[1.03]"
                aria-label="Iniciar sesion de administrador"
                title="Iniciar sesion"
              >
                <BrandLogo
                  logoUrl={logoUrl}
                  alt={restaurantName}
                  className="size-7 object-contain"
                  fallback={
                    <div className="text-center leading-none">
                      <div className="menu-drawer-logo-brand">Pollon</div>
                      <div className="menu-drawer-logo-tagline">Pollo a la brasa</div>
                    </div>
                  }
                />
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20"
                aria-label="Cerrar menu"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-3.5 pb-6 pt-5 hide-scrollbar">
            <p className="menu-drawer-categories-label">Categorias</p>

            <nav className="mt-3 flex w-full flex-col gap-0.5">
              <button
                type="button"
                onClick={() => openCategory("todo-menu", true)}
                className={`menu-drawer-category-item${
                  categoryScreenOpen && activeCategory === "todo-menu" && !showFavoritesOnly
                    ? " is-active"
                    : ""
                }`}
              >
                <Home className="size-4 shrink-0" strokeWidth={2.1} />
                Todo el menu
              </button>

              {categories
                .filter((category) => category.slug !== "todo-menu")
                .map((category) => {
                  const active =
                    categoryScreenOpen && activeCategory === category.slug && !showFavoritesOnly;
                  const Icon = getCategoryIcon(category.icon);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategory(category.slug, true)}
                      className={`menu-drawer-category-item${active ? " is-active" : ""}`}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={2.1} />
                      {category.name}
                    </button>
                  );
                })}
            </nav>

            <div className="mt-auto space-y-1.5 border-t border-neutral-200 pt-4">
              <a
                href={initialData.settings.deliveryUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-drawer-delivery-link !border-0 !bg-transparent !shadow-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <Globe className="size-4" strokeWidth={2} />
                </span>
                <span className="menu-drawer-delivery-title">Pagina web</span>
              </a>

              <a
                href={initialData.settings.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-drawer-delivery-link !border-0 !bg-transparent !shadow-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <WhatsAppGlyph className="size-4" />
                </span>
                <span className="menu-drawer-delivery-title">WhatsApp</span>
              </a>

              <a
                href={getPhoneCallHref(initialData.settings.whatsappUrl)}
                className="menu-drawer-delivery-link !border-0 !bg-transparent !shadow-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)] text-white">
                  <Phone className="size-4" strokeWidth={2} />
                </span>
                <span className="menu-drawer-delivery-title">Llamar</span>
              </a>
            </div>
          </div>
        </aside>

        {globalSearchOpen ? (
          <div className="wide-search-dropdown fixed inset-x-0 top-0 z-[65] mx-auto w-full max-w-[430px] px-3 pt-20 md:max-w-[720px] md:pt-28">
            <div
              className={`rounded-xl border p-4 shadow-none ${
                isDark
                  ? "border-white/10 bg-[#0f0f0f] text-white"
                  : "border-[#e5e5e5] bg-white text-neutral-900"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="type-section text-[1.35rem] text-[var(--brand-red)]">
                  Buscar platos
                </p>
                <button
                  type="button"
                  onClick={() => setGlobalSearchOpen(false)}
                  className="flex size-10 items-center justify-center rounded-full border border-black/10"
                >
                  <X className="size-4" />
                </button>
              </div>

              <label
                className={`flex items-center gap-3 rounded-full border px-4 py-3 ${
                  isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white"
                }`}
              >
                <Search className="size-4 text-[var(--brand-red)]" />
                <input
                  autoFocus
                  value={globalSearchQuery}
                  onChange={(event) => setGlobalSearchQuery(event.target.value)}
                  placeholder="Escribe una inicial o nombre del plato..."
                  className="w-full border-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
              </label>

              <div className="hide-scrollbar mt-4 max-h-[58vh] overflow-y-auto space-y-3">
                {globalSearchQuery.trim() ? (
                  globalSearchResults.length > 0 ? (
                    globalSearchResults.map((product) => (
                      <button
                        key={`search-${product.id}`}
                        type="button"
                        onClick={() => openProductFromSearch(product)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                          isDark
                            ? "border-white/10 bg-white/5"
                            : "border-[#e5e5e5] bg-white"
                        }`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="type-product truncate">{product.name}</p>
                          <p className="type-muted mt-1 truncate">
                            {categoryNameBySlug[product.categorySlug] ?? "Categoria"}
                          </p>
                        </div>
                        <span className="type-price rounded-full bg-brand-gradient px-3 py-1 text-xs text-white">
                          {formatCurrency(product.price)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-black/10 px-4 py-7 text-center text-sm text-neutral-500">
                      No encontramos platos con esa busqueda.
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-dashed border-black/10 px-4 py-7 text-center text-sm text-neutral-500">
                    Escribe por ejemplo: <strong>pollo</strong>, <strong>chaufa</strong>,{" "}
                    <strong>coca</strong> o incluso una inicial para filtrar mas rapido.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {categoryScreenOpen ? (
          <div
            className={`wide-category-panel fixed inset-x-0 top-0 z-[45] mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden md:inset-0 md:h-auto md:max-w-none md:bg-black/45 md:backdrop-blur-sm ${
              isDark ? "bg-[#111111]" : "bg-white"
            }`}
            onClick={closeCategoryScreen}
          >
            <div
              className={`wide-category-panel-inner flex h-full w-full flex-col overflow-hidden md:mx-auto ${
                isDark ? "bg-[#111111]" : "bg-white"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
            <div className="bg-brand-gradient px-3 py-2 text-white shadow-lg md:rounded-t-xl">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={closeCategoryScreen}
                  className="flex size-9 items-center justify-center rounded-full bg-white/12"
                  aria-label="Cerrar categoria"
                >
                  <ArrowLeft className="size-5" />
                </button>

                <h2 className="type-display flex-1 text-center text-[1.4rem] text-white md:text-[1.6rem]">
                  {activeLabel}
                </h2>

                <button
                  type="button"
                  onClick={() => setCategorySearchOpen((current) => !current)}
                  className="flex size-9 items-center justify-center rounded-full bg-white/12"
                  aria-label="Buscar en la categoria"
                >
                  <Search className="size-5" />
                </button>
              </div>

              <p className="type-muted is-light mt-0.5 text-center">{activeDescription}</p>

              {categorySearchOpen ? (
                <div className="mt-2">
                  <label className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-neutral-900">
                    <Search className="size-4 text-neutral-500" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={`Buscar en ${activeLabel.toLowerCase()}...`}
                      className="w-full border-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-6 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div className={`type-kicker ${isDark ? "text-white/75" : ""}`}>
                  {showFavoritesOnly ? "Favoritos" : "Platos"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                  className={`rounded-full px-3 py-2 text-[0.72rem] font-semibold tracking-wide ${
                    showFavoritesOnly
                      ? "bg-[var(--brand-red)] text-white"
                      : isDark
                        ? "border border-white/10 bg-white/5 text-white"
                        : "border border-black/10 bg-white text-neutral-700"
                  }`}
                >
                  {showFavoritesOnly ? "Ver todo" : "Solo favoritos"}
                </button>
              </div>

              <div className="desktop-product-grid grid grid-cols-2 gap-3 md:gap-4 md:p-1">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={`screen-${product.id}`}
                    product={product}
                    counts={getProductReactionCounts(reactionsMap, product.id)}
                    userReaction={userReactions[product.id] ?? null}
                    onReact={handleProductReaction}
                    onOpen={setSelectedProduct}
                    isDark={isDark}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 ? (
                <div
                  className={`mt-6 rounded-xl border border-dashed px-4 py-8 text-center text-sm ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white/65"
                      : "border-black/15 bg-white text-neutral-500"
                  }`}
                >
                  No encontramos platos en esta categoria con esa busqueda.
                </div>
              ) : null}
            </div>
            </div>
          </div>
        ) : null}

        {selectedProduct ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 md:p-8">
            <div
              className={`relative w-full max-w-[390px] overflow-hidden rounded-xl border md:max-w-[920px] ${
                isDark ? "border-white/10 bg-[#111111] text-white" : "border-[#e5e5e5] bg-white text-neutral-900"
              }`}
            >
              <div className="bg-brand-gradient px-5 py-5 text-white md:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="type-kicker is-light">
                      {selectedProduct.tag ?? "Especial"}
                    </p>
                    <h3 className="type-display mt-1 text-[1.65rem] text-white">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex size-10 items-center justify-center rounded-full bg-white/15"
                    aria-label="Cerrar producto"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="md:grid md:grid-cols-2">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="h-[240px] w-full object-cover md:h-full md:min-h-[420px]"
                />

                <div className="space-y-5 p-5 md:flex md:flex-col md:justify-center md:p-8">
                  <div className="hidden items-start justify-between md:flex">
                    <div>
                      <p className="type-kicker">
                        {selectedProduct.tag ?? "Especial"}
                      </p>
                      <h3 className="type-display mt-2 text-[1.85rem]">
                        {selectedProduct.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className={`flex size-10 items-center justify-center rounded-full border ${
                        isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-neutral-50"
                      }`}
                      aria-label="Cerrar producto"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-1 text-[var(--brand-red)] md:justify-start">
                    {Array.from({ length: selectedProduct.rating }).map((_, index) => (
                      <Star
                        key={`${selectedProduct.id}-modal-${index}`}
                        className="size-4 fill-current"
                      />
                    ))}
                  </div>

                  <p
                    className={`type-body text-balance text-center md:text-left ${isDark ? "text-white/80" : ""}`}
                  >
                    {selectedProduct.description}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <ProductReactionBar
                      productId={selectedProduct.id}
                      counts={getProductReactionCounts(reactionsMap, selectedProduct.id)}
                      userReaction={userReactions[selectedProduct.id] ?? null}
                      onReact={handleProductReaction}
                    />
                    <div className="type-price flex h-14 min-w-[8.5rem] flex-1 items-center justify-center rounded-xl bg-brand-gradient px-6 text-[1.35rem] text-white md:h-16 md:text-[1.55rem]">
                      {formatCurrency(selectedProduct.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
