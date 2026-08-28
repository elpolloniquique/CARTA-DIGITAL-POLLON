export type AdminSection = "dashboard" | "menu" | "settings";

export type VisitStats = {
  today: number;
  week: number;
  month: number;
  total: number;
  byHour: { hour: number; count: number }[];
  byDay: { label: string; count: number }[];
};

export type FavoriteProductStat = {
  productId: string;
  productName: string;
  categorySlug: string;
  imageUrl: string;
  likes: number;
};

export type AdminAnalytics = {
  visits: VisitStats;
  favorites: FavoriteProductStat[];
};
