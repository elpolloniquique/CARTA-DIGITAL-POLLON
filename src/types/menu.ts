export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  accent: string;
  coverImage: string;
};

export type Product = {
  id: string;
  categorySlug: string;
  sortOrder?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  tag?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isActive?: boolean;
};

export type SiteSettings = {
  restaurantName: string;
  locationLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundUrl: string;
  logoUrl: string;
  whatsappUrl: string;
  deliveryUrl: string;
  address: string;
  schedule: string;
  primaryColor: string;
  secondaryColor: string;
};

export type MenuPayload = {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
  source: "seed" | "supabase";
};
