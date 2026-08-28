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
  UserCircle,
  MapPin,
  Menu,
  MessageCircle,
  MoonStar,
  Package,
  Phone,
  Plus,
  Search,
  Star,
  Store,
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

  function goHomeFromDrawer() {
    setDrawerOpen(false);
    setCategoryScreenOpen(false);
    setCategorySearchOpen(false);
    setActiveCategory("todo-menu");
    setSearch("");
    setShowFavoritesOnly(false);
    setGlobalSearchOpen(false);
    setGlobalSearchQuery("");
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
            : "light-surface border-black/10 text-neutral-900 shadow-none md:border-none"
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

          <p className="shrink-0 text-[1.35rem] font-black uppercase tracking-[0.04em] lg:text-[1.55rem]">
            <BrandLogo
              logoUrl={logoUrl}
              alt={restaurantName}
              className="h-9 max-w-[140px] object-contain lg:h-10 lg:max-w-[160px]"
              fallback={restaurantName}
            />
          </p>

          <div className="hidden min-w-0 flex-1 flex-col items-center text-center sm:flex">
            <p className="text-[1.05rem] font-black uppercase tracking-[0.08em] lg:text-[1.15rem]">
              Carta <span className="text-[var(--brand-red)]">Digital</span>
            </p>
            <p className="mt-0.5 text-[0.62rem] font-black uppercase tracking-[0.28em] lg:text-[0.68rem]">
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
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-3 ${
                isDark
                  ? "border-white/15 bg-white/5 text-white"
                  : "border-amber-200 bg-amber-50 text-neutral-900"
              }`}
              aria-label="Cambiar tema"
            >
              <span className="text-[0.62rem] font-black uppercase tracking-[0.18em]">
                {isDark ? "Night" : "Day"}
              </span>
              <span
                className={`flex size-6 items-center justify-center rounded-full ${
                  isDark ? "bg-[var(--brand-red)] text-white" : "bg-amber-400 text-white"
                }`}
              >
                {isDark ? <MoonStar className="size-3.5" /> : <SunMedium className="size-3.5" />}
              </span>
            </button>
          </div>
        </nav>

        <div className="desktop-content-wrap pb-28 pt-0 md:px-0 md:pb-10 md:pt-0">
          <header
            className={`mobile-top-bar sticky top-0 z-30 md:hidden ${
              isDark ? "mobile-top-bar-dark" : "mobile-top-bar-light"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
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
                  CARTA <span className="text-[var(--brand-red)]">DIGITAL</span>
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
                  <span className="mobile-theme-toggle-label">{isDark ? "Night" : "Day"}</span>
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
              <div className="hero-brand-badge mx-auto max-w-[220px] rounded-full px-4 py-2 md:mx-0 md:max-w-none md:rounded-[1.75rem] md:px-8 md:py-6">
                <p className="font-[var(--font-display)] text-[2rem] font-bold leading-none text-[var(--brand-red)] md:text-[2.75rem] lg:text-[3rem]">
                  {restaurantName}
                </p>
                <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.24em] text-white/90 md:mt-2 md:text-[0.7rem] md:tracking-[0.22em]">
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
              className={`mb-4 text-[2rem] font-black uppercase tracking-tight md:mb-5 md:text-[2.35rem] ${isDark ? "text-white" : "text-neutral-900"}`}
            >
              EXPLORE
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
                    className={`product-card-shadow mx-auto block w-full overflow-hidden rounded-[2rem] border text-left transition md:rounded-[1.75rem] md:hover:-translate-y-1 md:hover:shadow-[0_24px_48px_rgba(15,23,42,0.18)] ${
                      isDark
                        ? "border-white/10 bg-white/5 md:border-none"
                        : "border-black/8 bg-white md:border-none"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={currentProduct.imageUrl}
                        alt={currentProduct.name}
                        className="h-[230px] w-full object-cover md:h-[320px] lg:h-[360px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-5 lg:p-6">
                        <div className="mb-2 flex items-center gap-2">
                          <Icon className="size-5 text-white md:size-[1.35rem]" />
                          <p className="text-[1.05rem] font-black uppercase tracking-[0.08em] md:text-[0.95rem] md:tracking-[0.12em]">
                            {category.name}
                          </p>
                        </div>
                        <p className="line-clamp-2 text-[1.2rem] font-semibold leading-6 md:text-[1.35rem] md:leading-7 lg:text-[1.45rem]">
                          {currentProduct.name}
                        </p>
                        <div className="mt-3 flex items-center justify-between md:mt-4">
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--brand-red)] md:px-4 md:py-1.5 md:text-[0.95rem]">
                            {formatCurrency(currentProduct.price)}
                          </span>
                        </div>
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
                  className={`text-[1.55rem] font-black uppercase tracking-tight md:text-[2rem] ${isDark ? "text-white" : "text-neutral-900"}`}
                >
                  Favoritos de clientes
                </div>
                <span className="rounded-full bg-[var(--brand-red)]/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--brand-red)]">
                  En vivo
                </span>
              </div>

              <div className="desktop-favorites-grid space-y-3 md:space-y-0">
                {topLikedProducts.map(({ product, likes }) => (
                  <button
                    key={`top-like-${product.id}`}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={`flex w-full items-center gap-3 overflow-hidden rounded-[1.4rem] border p-3 text-left ${
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-black/8 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold leading-5">{product.name}</p>
                      <p className="mt-1 text-sm font-black text-[var(--brand-red)]">
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
                      <span className="text-sm font-black text-neutral-700">{likes}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <footer
            id="ubicacion"
            className={`mt-8 hidden rounded-[2rem] border p-5 md:block md:mt-12 md:p-6 ${
              isDark
                ? "border-white/10 bg-white/5 text-white"
                : "border-black/8 bg-white text-neutral-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            }`}
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-red)]">
                  Ubicacion
                </p>
                <p className="mt-2 text-lg font-bold">{initialData.settings.restaurantName}</p>
                <p className="mt-1 text-sm leading-7 text-neutral-500">{initialData.settings.address}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-red)]">
                  Horario
                </p>
                <p className="mt-2 text-sm leading-7 text-neutral-500">{initialData.settings.schedule}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-red)]">
                  Contacto
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={initialData.settings.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white"
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

        <nav
          className={`mobile-bottom-nav fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t px-4 py-3 backdrop-blur-xl md:hidden ${
            isDark
              ? "border-white/10 bg-black/90"
              : "border-black/10 bg-white/92"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setCategoryScreenOpen(false);
              setDrawerOpen(false);
              setSearch("");
              setShowFavoritesOnly(false);
              setGlobalSearchOpen(false);
              setGlobalSearchQuery("");
              setActiveCategory("todo-menu");
            }}
            className="flex flex-col items-center gap-1 text-[0.72rem] font-semibold text-[var(--brand-red)]"
          >
            <Home className="size-5" />
            Inicio
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 text-[0.72rem] font-medium ${isDark ? "text-white/75" : "text-neutral-600"}`}
          >
            <Store className="size-5" />
            Menu
          </button>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }}
            className={`flex flex-col items-center gap-1 text-[0.72rem] font-medium ${isDark ? "text-white/75" : "text-neutral-600"}`}
          >
            <MapPin className="size-5" />
            Ubicacion
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFavoritesOnly((current) => {
                const next = !current;
                setActiveCategory("todo-menu");
                setCategoryScreenOpen(next);
                setCategorySearchOpen(false);
                setSearch("");
                return next;
              });
            }}
            className={`flex flex-col items-center gap-1 text-[0.72rem] font-medium ${isDark ? "text-white/75" : "text-neutral-600"}`}
          >
            <Heart
              className={`size-5 ${
                showFavoritesOnly ? "fill-[var(--brand-red)] text-[var(--brand-red)]" : ""
              }`}
            />
            Favoritos
          </button>
          <a
            href={initialData.settings.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex flex-col items-center gap-1 text-[0.72rem] font-medium ${isDark ? "text-white/75" : "text-neutral-600"}`}
          >
            <MessageCircle className="size-5" />
            WhatsApp
          </a>
          <a
            href={initialData.settings.deliveryUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex flex-col items-center gap-1 text-[0.72rem] font-medium ${isDark ? "text-white/75" : "text-neutral-600"}`}
          >
            <Globe className="size-5" />
            Web
          </a>
        </nav>

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
          className={`menu-drawer fixed left-0 top-0 z-[60] flex h-full w-[min(88vw,300px)] max-w-[300px] flex-col bg-white text-neutral-900 transition duration-300 md:w-[min(360px,34vw)] md:max-w-[360px] ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="menu-drawer-header shrink-0 bg-brand-gradient">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-[3.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
                  <BrandLogo
                    logoUrl={logoUrl}
                    alt={restaurantName}
                    className="size-[2.6rem] object-contain"
                    fallback={
                      <div className="text-center leading-none">
                        <div className="menu-drawer-logo-brand">Pollon</div>
                        <div className="menu-drawer-logo-tagline">Pollo a la brasa</div>
                      </div>
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push("/admin");
                  }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20"
                  aria-label="Iniciar sesion"
                  title="Iniciar sesion"
                >
                  <UserCircle className="size-5" strokeWidth={1.75} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:border-white/50 hover:bg-white/20"
                aria-label="Cerrar menu"
              >
                <X className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-5 py-6 hide-scrollbar">
            <a
              href={initialData.settings.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="menu-drawer-phone-card mb-6 flex items-center gap-3"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)] text-white shadow-sm">
                <Phone className="size-5" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-bold leading-tight text-neutral-900">
                  {formatWhatsAppDisplay(initialData.settings.whatsappUrl)}
                </span>
                <span className="mt-0.5 block text-[0.72rem] text-neutral-400">
                  Llamanos o escribenos
                </span>
              </span>
            </a>

            <p className="menu-drawer-categories-label">Categorias</p>

            <nav className="mt-4 flex w-full flex-col gap-1">
              <button
                type="button"
                onClick={goHomeFromDrawer}
                className={`menu-drawer-category-item${
                  !categoryScreenOpen && !showFavoritesOnly ? " is-active" : ""
                }`}
              >
                Inicio
              </button>

              <button
                type="button"
                onClick={() => openCategory("todo-menu", true)}
                className={`menu-drawer-category-item${
                  categoryScreenOpen && activeCategory === "todo-menu" && !showFavoritesOnly
                    ? " is-active"
                    : ""
                }`}
              >
                Todo el menu
              </button>

              {categories
                .filter((category) => category.slug !== "todo-menu")
                .map((category) => {
                  const active =
                    categoryScreenOpen && activeCategory === category.slug && !showFavoritesOnly;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategory(category.slug, true)}
                      className={`menu-drawer-category-item${active ? " is-active" : ""}`}
                    >
                      {category.name}
                    </button>
                  );
                })}
            </nav>

            <div className="mt-auto border-t border-neutral-200 pt-5">
              <a
                href={initialData.settings.deliveryUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-drawer-delivery-link"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)] text-white shadow-sm">
                  <Globe className="size-5" strokeWidth={2} />
                </span>
                <span className="menu-drawer-delivery-title">Delivery</span>
              </a>
            </div>
          </div>
        </aside>

        {globalSearchOpen ? (
          <div className="wide-search-dropdown fixed inset-x-0 top-0 z-[65] mx-auto w-full max-w-[430px] px-3 pt-20 md:max-w-[720px] md:pt-28">
            <div
              className={`rounded-[2rem] border p-4 shadow-2xl ${
                isDark
                  ? "border-white/10 bg-[#0f0f0f] text-white"
                  : "border-black/10 bg-white text-neutral-900"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-black uppercase tracking-[0.12em] text-[var(--brand-red)]">
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
                        className={`flex w-full items-center gap-3 rounded-[1.4rem] border p-3 text-left ${
                          isDark
                            ? "border-white/10 bg-white/5"
                            : "border-black/10 bg-neutral-50"
                        }`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-[1rem] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{product.name}</p>
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {categoryNameBySlug[product.categorySlug] ?? "Categoria"}
                          </p>
                        </div>
                        <span className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-black text-white">
                          {formatCurrency(product.price)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-7 text-center text-sm text-neutral-500">
                      No encontramos platos con esa busqueda.
                    </div>
                  )
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-7 text-center text-sm text-neutral-500">
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
            className={`wide-category-panel fixed inset-x-0 top-0 z-[45] mx-auto flex h-[calc(100dvh-74px)] w-full max-w-[430px] flex-col overflow-hidden md:inset-0 md:h-auto md:max-w-none md:bg-black/45 md:backdrop-blur-sm ${
              isDark ? "bg-[#111111]" : "bg-[#f7f4ef]"
            }`}
            onClick={closeCategoryScreen}
          >
            <div
              className={`wide-category-panel-inner flex h-full w-full flex-col overflow-hidden md:mx-auto ${
                isDark ? "bg-[#111111]" : "bg-[#f7f4ef]"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
            <div className="bg-brand-gradient px-4 pb-4 pt-5 text-white shadow-lg md:rounded-t-[2rem]">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeCategoryScreen}
                  className="flex size-10 items-center justify-center rounded-full bg-white/12"
                  aria-label="Cerrar categoria"
                >
                  <ArrowLeft className="size-5" />
                </button>

                <h2 className="flex-1 text-center text-[1.45rem] font-black uppercase tracking-tight">
                  {activeLabel}
                </h2>

                <button
                  type="button"
                  onClick={() => setCategorySearchOpen((current) => !current)}
                  className="flex size-10 items-center justify-center rounded-full bg-white/12"
                  aria-label="Buscar en la categoria"
                >
                  <Search className="size-5" />
                </button>
              </div>

              <p className="mt-3 text-center text-sm text-white/80">{activeDescription}</p>

              {categorySearchOpen ? (
                <div className="mt-4">
                  <label className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-neutral-900">
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
                <div className={`text-sm font-black uppercase tracking-[0.18em] ${isDark ? "text-white/75" : "text-neutral-600"}`}>
                  {showFavoritesOnly ? "Favoritos" : "Platos"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                  className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.16em] ${
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
                  className={`mt-6 rounded-[1.6rem] border border-dashed px-4 py-8 text-center text-sm ${
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
              className={`relative w-full max-w-[390px] overflow-hidden rounded-[2rem] shadow-2xl md:max-w-[920px] ${
                isDark ? "bg-[#111111] text-white" : "bg-white text-neutral-900"
              }`}
            >
              <div className="bg-brand-gradient px-5 py-5 text-white md:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-white/75">
                      {selectedProduct.tag ?? "Especial"}
                    </p>
                    <h3 className="mt-1 text-[1.8rem] font-black leading-tight">
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
                      <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--brand-red)]">
                        {selectedProduct.tag ?? "Especial"}
                      </p>
                      <h3 className="mt-2 text-[2rem] font-black leading-tight">
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
                    className={`text-balance text-center text-[1.12rem] leading-8 md:text-left ${isDark ? "text-white/80" : "text-neutral-600"}`}
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
                    <div className="flex h-16 min-w-[9rem] flex-1 items-center justify-center rounded-2xl bg-brand-gradient px-6 text-[1.65rem] font-black text-white shadow-lg md:text-[2rem]">
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
