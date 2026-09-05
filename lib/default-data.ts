import type { MenuCategory, MenuItem, NewsPost, ShopSettings } from "./types";

export const defaultShop: ShopSettings = {
  id: 1,
  name: "Sweet Pea",
  tagline: "Freshly baked daily · Est. 2022",
  description:
    "Một tiệm bánh nhỏ xinh, nơi mỗi chiếc bánh và thức uống được chuẩn bị chỉn chu để bạn ghé tiệm là có một khoảng nghỉ thật dễ chịu.",
  phone: "032 824 3949",
  email: "nguyenthikimthoa14032000@gmail.com",
  address:
    "Hẻm 17, đường 786, ấp Thạnh Thuận, xã Thanh Điền, huyện Châu Thành, Tây Ninh",
  map_url: "https://www.google.com/maps/search/?api=1&query=11.3037693%2C106.0845314",
  zalo_url: "https://zalo.me/0328243949",
  opening_text: "Nhận đặt bánh và thức uống mỗi ngày",
};

export const defaultCategories: MenuCategory[] = [
  {
    id: "coffee",
    name: "Coffee",
    slug: "coffee",
    description: "Cà phê, bạc sỉu và cacao.",
    sort_order: 1,
    is_visible: true,
  },
  {
    id: "latte",
    name: "Latte / Matcha",
    slug: "latte-matcha",
    description: "Matcha latte và các lựa chọn Oatside.",
    sort_order: 2,
    is_visible: true,
  },
  {
    id: "fruit-tea",
    name: "Fruit Tea",
    slug: "fruit-tea",
    description: "Trà trái cây thanh mát.",
    sort_order: 3,
    is_visible: true,
  },
  {
    id: "milk-yogurt",
    name: "Milk / Yogurt",
    slug: "milk-yogurt",
    description: "Sữa, trà sữa và sữa chua.",
    sort_order: 4,
    is_visible: true,
  },
  {
    id: "banh-trang",
    name: "Bánh tráng",
    slug: "banh-trang",
    description: "Món ăn vặt tại tiệm.",
    sort_order: 5,
    is_visible: true,
  },
  {
    id: "topping",
    name: "Topping",
    slug: "topping",
    description: "Gọi thêm theo sở thích.",
    sort_order: 6,
    is_visible: true,
  },
];

export const defaultItems: MenuItem[] = [
  { id: "ca-phe-den", category_id: "coffee", name: "Cà phê đen", description: "", price: 20000, image_url: "", is_featured: false, is_available: true, sort_order: 1 },
  { id: "ca-phe-sua", category_id: "coffee", name: "Cà phê sữa", description: "", price: 22000, image_url: "", is_featured: false, is_available: true, sort_order: 2 },
  { id: "ca-phe-muoi", category_id: "coffee", name: "Cà phê muối", description: "Tiệm gợi ý", price: 35000, image_url: "", is_featured: true, is_available: true, sort_order: 3 },
  { id: "ca-phe-kem-trung", category_id: "coffee", name: "Cà phê kem trứng", description: "", price: 38000, image_url: "", is_featured: false, is_available: true, sort_order: 4 },
  { id: "ca-phe-sua-thai", category_id: "coffee", name: "Cà phê sữa thái", description: "", price: 35000, image_url: "", is_featured: false, is_available: true, sort_order: 5 },
  { id: "bac-siu-da", category_id: "coffee", name: "Bạc sỉu đá", description: "", price: 28000, image_url: "", is_featured: false, is_available: true, sort_order: 6 },
  { id: "bac-siu-kem-muoi", category_id: "coffee", name: "Bạc sỉu kem muối", description: "", price: 35000, image_url: "", is_featured: false, is_available: true, sort_order: 7 },
  { id: "cacao-da", category_id: "coffee", name: "Cacao đá", description: "", price: 28000, image_url: "", is_featured: false, is_available: true, sort_order: 8 },
  { id: "cacao-pho-mai", category_id: "coffee", name: "Cacao phô mai", description: "", price: 35000, image_url: "", is_featured: false, is_available: true, sort_order: 9 },
  { id: "cacao-kem-muoi", category_id: "coffee", name: "Cacao kem muối", description: "", price: 35000, image_url: "", is_featured: false, is_available: true, sort_order: 10 },
  { id: "cacao-kem-trung", category_id: "coffee", name: "Cacao kem trứng", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 11 },

  { id: "matcha-latte", category_id: "latte", name: "Matcha latte", description: "Tiệm gợi ý", price: 35000, image_url: "", is_featured: true, is_available: true, sort_order: 20 },
  { id: "matcha-latte-oatside", category_id: "latte", name: "Matcha latte Oatside milk", description: "Sữa yến mạch", price: 40000, image_url: "", is_featured: false, is_available: true, sort_order: 21 },
  { id: "matcha-latte-kem-muoi", category_id: "latte", name: "Matcha latte kem muối", description: "", price: 40000, image_url: "", is_featured: false, is_available: true, sort_order: 22 },
  { id: "matcha-latte-kem-dua", category_id: "latte", name: "Matcha latte kem dừa", description: "", price: 45000, image_url: "", is_featured: false, is_available: true, sort_order: 23 },
  { id: "matcha-latte-coffee", category_id: "latte", name: "Matcha latte coffee", description: "", price: 38000, image_url: "", is_featured: false, is_available: true, sort_order: 24 },
  { id: "matcha-latte-coffee-oatside", category_id: "latte", name: "Matcha latte coffee Oatside", description: "", price: 43000, image_url: "", is_featured: false, is_available: true, sort_order: 25 },
  { id: "matcha-latte-milk-foam-oatside", category_id: "latte", name: "Matcha latte milk foam Oatside", description: "", price: 45000, image_url: "", is_featured: false, is_available: true, sort_order: 26 },
  { id: "matcha-kem-dua-oatside", category_id: "latte", name: "Matcha kem dừa Oatside", description: "", price: 50000, image_url: "", is_featured: false, is_available: true, sort_order: 27 },

  { id: "tra-dao", category_id: "fruit-tea", name: "Trà đào", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 40 },
  { id: "tra-vai-thanh-long", category_id: "fruit-tea", name: "Trà vải thanh long", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 41 },
  { id: "tra-buoi-hong", category_id: "fruit-tea", name: "Trà bưởi hồng", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 42 },
  { id: "tra-oi-hong", category_id: "fruit-tea", name: "Trà ổi hồng", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 43 },
  { id: "tra-me-muoi-ot", category_id: "fruit-tea", name: "Trà me muối ớt", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 44 },
  { id: "tra-mang-cut", category_id: "fruit-tea", name: "Trà măng cụt", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 45 },
  { id: "tra-dau-tay", category_id: "fruit-tea", name: "Trà dâu tây", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 46 },
  { id: "tra-dau-tam", category_id: "fruit-tea", name: "Trà dâu tằm", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 47 },
  { id: "tra-dua-luoi", category_id: "fruit-tea", name: "Trà dưa lưới", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 48 },
  { id: "tra-mang-cau", category_id: "fruit-tea", name: "Trà mãng cầu", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 49 },
  { id: "tra-xoai-chanh-day", category_id: "fruit-tea", name: "Trà xoài chanh dây", description: "", price: 36000, image_url: "", is_featured: false, is_available: true, sort_order: 50 },
  { id: "tra-hoa-atiso", category_id: "fruit-tea", name: "Trà hoa atiso", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 51 },
  { id: "tra-lai-dac-thom", category_id: "fruit-tea", name: "Trà lài đác thơm", description: "", price: 40000, image_url: "", is_featured: false, is_available: true, sort_order: 52 },
  { id: "tra-thom-thot-not", category_id: "fruit-tea", name: "Trà thơm thốt nốt", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 53 },
  { id: "tra-trai-cay-nhiet-doi", category_id: "fruit-tea", name: "Trà trái cây nhiệt đới", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 54 },

  { id: "sua-tuoi-duong-den-thot-not", category_id: "milk-yogurt", name: "Sữa tươi đường đen thốt nốt", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 70 },
  { id: "tra-sua-oolong", category_id: "milk-yogurt", name: "Trà sữa oolong", description: "", price: 40000, image_url: "", is_featured: false, is_available: true, sort_order: 71 },
  { id: "sua-chua-duong-den-thot-not", category_id: "milk-yogurt", name: "Sữa chua đường đen thốt nốt", description: "", price: 40000, image_url: "", is_featured: false, is_available: true, sort_order: 72 },
  { id: "sua-chua-viet-quat", category_id: "milk-yogurt", name: "Sữa chua việt quất", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 73 },
  { id: "sua-chua-dao", category_id: "milk-yogurt", name: "Sữa chua đào", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 74 },
  { id: "sua-chua-dau-tay", category_id: "milk-yogurt", name: "Sữa chua dâu tây", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 75 },
  { id: "sua-chua-dau-tam", category_id: "milk-yogurt", name: "Sữa chua dâu tằm", description: "", price: 39000, image_url: "", is_featured: false, is_available: true, sort_order: 76 },

  { id: "banh-trang-deo-mo-hanh-full-topping", category_id: "banh-trang", name: "Bánh tráng dẻo mỡ hành full topping", description: "Best seller", price: 30000, image_url: "", is_featured: true, is_available: true, sort_order: 90 },
  { id: "banh-trang-deo-mo-hanh-chay", category_id: "banh-trang", name: "Bánh tráng dẻo mỡ hành chay", description: "", price: 15000, image_url: "", is_featured: false, is_available: true, sort_order: 91 },
  { id: "banh-trang-cuon-tron-muoi-bo", category_id: "banh-trang", name: "Bánh tráng cuốn trộn muối bò", description: "Best seller", price: 30000, image_url: "", is_featured: true, is_available: true, sort_order: 92 },

  { id: "topping-tran-chau-trang", category_id: "topping", name: "Trân châu trắng", description: "", price: 10000, image_url: "", is_featured: false, is_available: true, sort_order: 110 },
  { id: "topping-hat-dac", category_id: "topping", name: "Hạt đác", description: "", price: 15000, image_url: "", is_featured: false, is_available: true, sort_order: 111 },
  { id: "topping-thot-not", category_id: "topping", name: "Thốt nốt", description: "", price: 20000, image_url: "", is_featured: false, is_available: true, sort_order: 112 },
  { id: "topping-kem-muoi", category_id: "topping", name: "Kem muối", description: "", price: 15000, image_url: "", is_featured: false, is_available: true, sort_order: 113 },
  { id: "topping-kem-trung", category_id: "topping", name: "Kem trứng", description: "", price: 15000, image_url: "", is_featured: false, is_available: true, sort_order: 114 },
  { id: "topping-trung-cut", category_id: "topping", name: "Thêm trứng cút", description: "Dùng cho bánh tráng", price: 5000, image_url: "", is_featured: false, is_available: true, sort_order: 115 },
  { id: "topping-top-mo", category_id: "topping", name: "Thêm tóp mỡ", description: "Dùng cho bánh tráng", price: 10000, image_url: "", is_featured: false, is_available: true, sort_order: 116 },
];

export const defaultNews: NewsPost[] = [
  {
    id: "sweet-pea-story",
    title: "Một mẻ bánh mới bắt đầu như thế nào?",
    excerpt: "Từ lúc cân bột đến khi chiếc bánh cuối cùng được đặt vào hộp, Sweet Pea luôn giữ nhịp làm bánh thật chậm và chỉn chu.",
    content:
      "Mỗi buổi làm bánh ở Sweet Pea bắt đầu bằng việc chuẩn bị nguyên liệu vừa đủ cho số lượng bánh trong ngày. Tiệm ưu tiên những mẻ nhỏ để bánh luôn mới, phần cốt giữ được độ mềm và lớp kem có vị thanh nhẹ. Từng chiếc bánh sau khi hoàn thiện đều được kiểm tra lại trước khi đóng hộp. Với Sweet Pea, một món bánh ngon không chỉ nằm ở công thức mà còn ở cảm giác được chăm chút khi bạn mở chiếc hộp ra.",
    image_url: "",
    is_featured: true,
    is_published: true,
    sort_order: 1,
    published_at: "2026-08-20T08:00:00.000Z",
  },
  {
    id: "order-cake-guide",
    title: "Gợi ý đặt bánh cho một buổi gặp nhỏ",
    excerpt: "Chọn kích thước, vị bánh và thời gian nhận như thế nào để buổi gặp vừa đủ ngọt mà không bị lãng phí?",
    content:
      "Với những buổi gặp từ bốn đến sáu người, bạn có thể chọn bánh kích thước nhỏ và thêm vài phần bánh lẻ để mọi người cùng thử nhiều vị. Nếu cần trang trí theo chủ đề, hãy nhắn tiệm sớm để có thời gian chuẩn bị màu sắc và phụ kiện phù hợp. Bạn cũng nên cho tiệm biết thời gian sử dụng bánh để được hướng dẫn bảo quản tốt nhất.",
    image_url: "",
    is_featured: false,
    is_published: true,
    sort_order: 2,
    published_at: "2026-08-12T08:00:00.000Z",
  },
];
