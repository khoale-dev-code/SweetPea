import type { MenuCategory, MenuItem, ShopSettings } from "./types";

export const defaultShop: ShopSettings = {
  id: 1,
  name: "Sweet Pea",
  tagline: "Freshly baked daily · Est. 2022",
  description:
    "Một tiệm bánh nhỏ xinh, nơi mỗi chiếc bánh được làm mới trong ngày và gói ghém bằng thật nhiều dịu dàng.",
  phone: "032 824 3949",
  email: "nguyenthikimthoa14032000@gmail.com",
  address:
    "Hẻm 17, đường 786, ấp Thạnh Thuận, xã Thanh Điền, huyện Châu Thành, Tây Ninh",
  map_url: "https://maps.google.com/?q=H%E1%BA%BBm+17+%C4%91%C6%B0%E1%BB%9Dng+786+T%C3%A2y+Ninh",
  zalo_url: "https://zalo.me/0328243949",
  opening_text: "Nhận đặt bánh mỗi ngày",
};

export const defaultCategories: MenuCategory[] = [
  {
    id: "cake",
    name: "Bánh ngọt",
    slug: "banh-ngot",
    description: "Bánh mềm, kem nhẹ và vị ngọt vừa đủ.",
    sort_order: 1,
    is_visible: true,
  },
  {
    id: "pastry",
    name: "Bánh nướng",
    slug: "banh-nuong",
    description: "Thơm mùi bơ, ngon nhất khi dùng trong ngày.",
    sort_order: 2,
    is_visible: true,
  },
  {
    id: "drink",
    name: "Thức uống",
    slug: "thuc-uong",
    description: "Một chút mát lành để ăn bánh vui hơn.",
    sort_order: 3,
    is_visible: true,
  },
];

export const defaultItems: MenuItem[] = [
  {
    id: "strawberry-cake",
    category_id: "cake",
    name: "Bánh kem dâu",
    description: "Cốt bánh vanilla mềm, kem sữa thanh nhẹ và dâu tươi.",
    price: 165000,
    image_url: "",
    is_featured: true,
    is_available: true,
    sort_order: 1,
  },
  {
    id: "tiramisu",
    category_id: "cake",
    name: "Tiramisu",
    description: "Mascarpone béo dịu, cacao thơm và cà phê cân bằng.",
    price: 55000,
    image_url: "",
    is_featured: true,
    is_available: true,
    sort_order: 2,
  },
  {
    id: "croissant",
    category_id: "pastry",
    name: "Croissant bơ",
    description: "Vỏ giòn nhiều lớp, ruột mềm và thơm bơ.",
    price: 39000,
    image_url: "",
    is_featured: true,
    is_available: true,
    sort_order: 3,
  },
  {
    id: "matcha-latte",
    category_id: "drink",
    name: "Matcha latte",
    description: "Matcha thơm đậm, sữa tươi và vị ngọt nhẹ.",
    price: 49000,
    image_url: "",
    is_featured: false,
    is_available: true,
    sort_order: 4,
  },
  {
    id: "peach-tea",
    category_id: "drink",
    name: "Trà đào Sweet Pea",
    description: "Trà thanh, đào giòn và hương cam dịu mát.",
    price: 45000,
    image_url: "",
    is_featured: false,
    is_available: true,
    sort_order: 5,
  },
];
