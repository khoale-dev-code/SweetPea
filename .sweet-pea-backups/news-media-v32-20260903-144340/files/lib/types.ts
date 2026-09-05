export type ShopSettings = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  map_url: string;
  zalo_url: string;
  opening_text: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_visible?: boolean;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  created_at?: string;
};

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  published_at: string;
};

export type StoreData = {
  shop: ShopSettings;
  categories: MenuCategory[];
  items: MenuItem[];
  source: "supabase" | "sample";
};
