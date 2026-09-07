import Link from "next/link";
import {
  ArrowRight,
  CakeSlice,
  Clock3,
  Flower2,
  Heart,
  ImageIcon,
  Leaf,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts, getStoreData } from "@/lib/store";
import type { MenuItem, NewsPost } from "@/lib/types";
import { ProductImageCarousel } from "@/components/product-image-carousel";

export const revalidate = 60;

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

/**
 * Color tokens for this page
 * avocado-900  #184d39  deep avocado green — headings, primary buttons
 * avocado-500  #6f8f5a  mid avocado green — supporting text/icons
 * avocado-200  #c7db95  light avocado green — chips, soft fills
 * cream        #fffced  base background
 * sand         #fbf2df  secondary background for alternating sections
 * pink-100     #fbdce9  soft pink — blobs, chip fills
 * pink-400     #ef9dc0  pink accent — buttons, dividers, stickers
 * pink-700     #b5487a  deeper pink — text on pink chips
 */

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function dateText(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function optimizedImage(url: string) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto:good,w_1400/");
}

const SIZE_META = /\[\[sizes:[^\]]+\]\]/gi;
const GALLERY_META = /\[\[gallery:([^\]]+)\]\]/i;
const AUTOPLAY_META = /\[\[autoplay:(\d+)\]\]/i;

function uniqueProductImages(images: string[]) {
  return [...new Set(images.map((value) => value.trim()).filter(Boolean))];
}

function galleryImages(item: MenuItem) {
  const match = (item.description || "").match(GALLERY_META);
  return uniqueProductImages([item.image_url || "", ...(match ? match[1].split("|") : [])]);
}

function galleryAutoplay(item: MenuItem) {
  const match = (item.description || "").match(AUTOPLAY_META);
  const seconds = match ? Number(match[1]) : 0;
  return seconds >= 2 && seconds <= 30 ? seconds : 0;
}

function cleanDescription(value?: string) {
  return (value || "")
    .replace(SIZE_META, "")
    .replace(GALLERY_META, "")
    .replace(AUTOPLAY_META, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function productBaseName(name: string) {
  return name
    .replace(/\s*[-–—]?\s*(?:size\s*)?(S|M|L|XL)\s*$/i, "")
    .replace(/\s*\((?:size\s*)?(S|M|L|XL)\)\s*$/i, "")
    .trim();
}

type HomeProduct = {
  key: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrl: string;
  images: string[];
  autoplaySeconds: number;
  isFeatured: boolean;
  variantCount: number;
  sortOrder: number;
};

function groupProducts(items: MenuItem[]): HomeProduct[] {
  const groups = new Map<string, HomeProduct>();

  for (const item of items) {
    const name = productBaseName(item.name);
    const key = `${item.category_id}::${name.toLocaleLowerCase("vi")}`;
    const inlineSizeMatch = (item.description || "").match(/\[\[sizes:([^\]]+)\]\]/i);
    const inlineSizeCount = inlineSizeMatch
      ? Math.max(1, inlineSizeMatch[1].split(/[|;]/).filter(Boolean).length)
      : 1;
    const images = galleryImages(item);
    const autoplaySeconds = galleryAutoplay(item);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        key,
        name,
        description: cleanDescription(item.description),
        categoryId: item.category_id,
        price: Number(item.price || 0),
        imageUrl: images[0] || item.image_url || "",
        images,
        autoplaySeconds,
        isFeatured: Boolean(item.is_featured),
        variantCount: inlineSizeCount,
        sortOrder: Number(item.sort_order || 0),
      });
      continue;
    }

    current.price = Math.min(current.price || Number(item.price || 0), Number(item.price || 0));
    current.images = uniqueProductImages([...current.images, ...images]);
    current.imageUrl = current.images[0] || current.imageUrl || item.image_url || "";
    current.autoplaySeconds = Math.max(current.autoplaySeconds, autoplaySeconds);
    current.description = current.description || cleanDescription(item.description);
    current.isFeatured = current.isFeatured || Boolean(item.is_featured);
    current.variantCount += 1;
    current.sortOrder = Math.min(current.sortOrder, Number(item.sort_order || 0));
  }

  return [...groups.values()].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    if (Boolean(a.imageUrl) !== Boolean(b.imageUrl)) return a.imageUrl ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}

function ProductImage({ product }: { product: HomeProduct }) {
  if (!product.images.length) {
    return (
      <div className="soft-grid grid aspect-[4/3] w-full place-items-center bg-gradient-to-br from-[#c7db95]/25 to-[#fbdce9]/40 p-8">
        <div className="text-center text-[#184d39]/75">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#184d39]/10 bg-[#fffced]">
            <ImageIcon size={20} />
          </span>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em]">Sweet Pea</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-[#fffced]">
      <ProductImageCarousel
        images={product.images}
        alt={product.name}
        autoplaySeconds={product.autoplaySeconds}
        imageClassName="object-contain p-2 sm:p-3"
      />
    </div>
  );
}

function StoryImage({ post, fallback, alt }: { post?: NewsPost; fallback: string; alt: string }) {
  if (!post?.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fallback} alt={alt} loading="lazy" className="h-full w-full object-contain" />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimizedImage(post.image_url)}
      alt={post.title}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain"
    />
  );
}

/** Small hand-drawn-style flower used as a recurring decorative motif */
function FlowerMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <g>
        <circle cx="20" cy="11" r="7" fill="#f3b8d3" />
        <circle cx="29" cy="20" r="7" fill="#f3b8d3" />
        <circle cx="20" cy="29" r="7" fill="#f3b8d3" />
        <circle cx="11" cy="20" r="7" fill="#f3b8d3" />
        <circle cx="20" cy="20" r="6" fill="#fce4ee" />
      </g>
    </svg>
  );
}

/** A soft row of alternating flowers/leaves used to separate sections */
function GardenDivider() {
  const icons = [Flower2, Leaf, Heart, Flower2, Leaf];
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center gap-6 py-2 opacity-70">
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#184d39]/15" />
      {icons.map((Icon, index) => (
        <Icon
          key={index}
          size={index === 2 ? 18 : 14}
          className={index % 2 === 0 ? "text-[#ef9dc0]" : "text-[#8ba573]"}
          style={{ animation: `sp-bounce-soft 2.4s ease-in-out infinite`, animationDelay: `${index * 0.15}s` }}
        />
      ))}
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#184d39]/15" />
    </div>
  );
}

export default async function Home() {
  const [data, news] = await Promise.all([getStoreData(), getNewsPosts()]);
  const categories = new Map(data.categories.map((category) => [category.id, category.name]));
  const products = groupProducts(data.items);
  const withImages = products.filter((product) => product.imageUrl);
  const selectedProducts = [...withImages, ...products.filter((product) => !product.imageUrl)].slice(0, 6);
  const featuredNews = news.filter((post) => post.is_featured);
  const homeNews = [...featuredNews, ...news.filter((post) => !post.is_featured)].slice(0, 3);
  const phoneHref = `tel:${data.shop.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <PageTransition>
      <style>{`
        @keyframes sp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes sp-float-lg { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(3deg); } }
        @keyframes sp-blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(12px, -18px) scale(1.06); } 66% { transform: translate(-14px, 10px) scale(0.96); } }
        @keyframes sp-twinkle { 0%, 100% { opacity: 0.55; transform: scale(0.92); } 50% { opacity: 1; transform: scale(1.12); } }
        @keyframes sp-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sp-bounce-soft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @media (prefers-reduced-motion: reduce) {
          [class*="sp-"], [style*="sp-"] { animation: none !important; }
        }
      `}</style>
      {/* ---------------------------------------------------------------- */}
      {/* HERO — one full, uncropped-feeling banner instead of a chopped   */}
      {/* image grid, so the photo reads big and confident, not tiny.     */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fdf3e5] via-[#fffced] to-[#fffced]">
        <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#f3b8d3]/25 blur-3xl [animation:sp-blob_10s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-[#c7db95]/30 blur-3xl [animation:sp-blob_12s_ease-in-out_infinite_reverse]" />
        <FlowerMark className="pointer-events-none absolute left-[6%] top-[14%] h-10 w-10 rotate-[-12deg] opacity-70 sm:h-14 sm:w-14 [animation:sp-float_5s_ease-in-out_infinite]" />
        <FlowerMark className="pointer-events-none absolute right-[8%] top-[62%] h-8 w-8 rotate-[18deg] opacity-50 sm:h-10 sm:w-10 [animation:sp-float_6s_ease-in-out_infinite_0.8s]" />

        <div className="container-shell relative py-10 sm:py-14 lg:py-16 xl:py-20">
          <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 xl:gap-16">
            {/* Text column */}
            <div className="max-w-[560px] [animation:sp-fade-up_0.7s_ease-out_both]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ef9dc0]/35 bg-white/70 px-3.5 py-2 text-xs font-bold text-[#b5487a] shadow-sm backdrop-blur-sm">
                <Flower2 size={15} className="text-[#ef9dc0] [animation:sp-twinkle_2.6s_ease-in-out_infinite]" />
                Sweet Pea · Bakery &amp; Café
              </div>

              <h1
                style={headingFont}
                className="mt-5 max-w-[560px] text-[clamp(3rem,5.2vw,5.15rem)] font-bold leading-[0.9] tracking-[-0.052em] text-[#184d39]"
              >
                Một góc xanh,
                <span className="mt-1.5 block text-[0.72em] font-normal italic leading-[0.98] tracking-[-0.035em] text-[#8a5f79]">
                  một ngày dịu hơn.
                </span>
              </h1>

              <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#184d39]/65 sm:text-base sm:leading-8">
                {data.shop.description || "Bánh tươi, thức uống vừa vị và một khoảng sân vườn để bạn chậm lại giữa ngày."}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/menu"
                  className="focus-ring group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] shadow-[0_10px_28px_rgba(24,77,57,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  Khám phá menu
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/about"
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#ef9dc0]/50 bg-white/60 px-5 text-sm font-bold text-[#184d39] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ef9dc0] hover:bg-white"
                >
                  Xem không gian <Leaf size={16} className="text-[#8ba573]" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/55 px-3.5 text-xs font-semibold text-[#184d39]/75">
                  <Clock3 size={14} className="text-[#184d39]" />
                  <span className="max-w-[210px] truncate">{data.shop.opening_text}</span>
                </div>

                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/55 px-3.5 text-xs font-semibold text-[#184d39]/75">
                  <CakeSlice size={14} className="text-[#184d39]" />
                  Bánh mới mỗi ngày
                </div>

                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#ef9dc0]/30 bg-[#fbdce9]/45 px-3.5 text-xs font-semibold text-[#b5487a]">
                  <Heart size={13} className="text-[#ef9dc0]" />
                  Sân vườn xanh
                </div>
              </div>
            </div>

            {/* Image column — a single generously-sized photo fills the     */}
            {/* whole area (object-cover, explicit min-height) so nothing   */}
            {/* looks cropped-small or leaves dead space, plus two small    */}
            {/* layered accents for a playful, dimensional feel.            */}
            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none [animation:sp-fade-up_0.8s_ease-out_0.15s_both]">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border-4 border-white shadow-[0_28px_70px_rgba(24,77,57,0.18)] sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[560px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home-v27/sweet-pea-lemon-garden.webp"
                  alt="Không gian sân vườn Sweet Pea"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#123e2e]/50 via-[#123e2e]/10 to-transparent" />
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#fffced]/92 px-3 py-1.5 text-xs font-bold text-[#184d39] shadow-sm backdrop-blur-sm">
                  <MapPin size={13} /> Góc sân vườn Sweet Pea
                </div>
              </div>

              {/* Floating photo bubble — overlaps the main image corner */}
              <div className="absolute -left-5 -top-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-[0_14px_30px_rgba(24,77,57,0.2)] sm:h-28 sm:w-28 lg:-left-8 lg:-top-8 lg:h-32 lg:w-32 [animation:sp-float_5s_ease-in-out_infinite]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home-v27/sweet-pea-pastry-case.webp"
                  alt="Tủ bánh tại Sweet Pea"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating pink sticker card */}
              <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl border-2 border-[#f3b8d3] bg-white px-3.5 py-2.5 shadow-[0_14px_30px_rgba(181,72,122,0.18)] sm:-right-6 sm:px-4 sm:py-3 [animation:sp-float_4.5s_ease-in-out_infinite_0.3s]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbdce9] text-[#b5487a]">
                  <Sparkles size={16} className="[animation:sp-twinkle_2.2s_ease-in-out_infinite]" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-bold text-[#184d39]">Bánh mới mỗi sáng</p>
                  <p className="text-[11px] text-[#184d39]/55">nướng tại tiệm, giòn thơm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GardenDivider />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PRODUCTS                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ba573]">
                <Flower2 size={13} /> Hôm nay ở Sweet Pea
              </p>
              <h2 style={headingFont} className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#184d39] sm:text-5xl lg:text-6xl">
                Chọn một món bạn thích.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[#68776e]">Ảnh sản phẩm luôn được giữ nguyên tỉ lệ để bạn nhìn trọn món, không bị cắt mất phần trên hoặc hai bên.</p>
            </div>
            <Link href="/menu" className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-[#d5ccbb] bg-[#fffced] px-5 py-3 text-sm font-bold text-[#184d39] transition hover:bg-white">
              Xem toàn bộ menu <ArrowRight size={17} />
            </Link>
          </div>

          {selectedProducts.length ? (
            <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {selectedProducts.map((product) => (
                <article key={product.key} className="group relative overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#fffced] shadow-[0_16px_40px_rgba(54,72,60,0.06)] transition hover:-translate-y-1 hover:border-[#f3b8d3]/60 hover:shadow-[0_24px_55px_rgba(181,72,122,0.14)]">
                  <div className="border-b border-[#e1d8c8]">
                    <ProductImage product={product} />
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#7d9276]">{categories.get(product.categoryId) || "Sweet Pea"}</p>
                        <h3 style={headingFont} className="mt-2 text-2xl font-bold leading-tight text-[#184d39]">{product.name}</h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#fbdce9] px-3 py-1.5 text-sm font-extrabold text-[#b5487a]">
                        {product.variantCount > 1 ? "Từ " : ""}{money(product.price)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-[3.25rem] text-sm leading-6 text-[#6a786f]">
                      {product.description || (product.variantCount > 1 ? `${product.variantCount} lựa chọn kích thước.` : "Đang có tại tiệm hôm nay.")}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-dashed border-[#ddd3c1] pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[#799071]">
                        <Leaf size={13} /> {product.isFeatured ? "Tiệm gợi ý" : "Đang có tại tiệm"}
                      </span>
                      <Link href="/menu" className="focus-ring inline-flex items-center gap-1 text-sm font-bold text-[#184d39]">
                        {product.variantCount > 1 ? "Xem lựa chọn" : "Xem menu"} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                  {product.isFeatured ? (
                    <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#ef9dc0] shadow-sm">
                      <Heart size={15} fill="#ef9dc0" />
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-[2rem] border border-dashed border-[#d7cfbf] bg-[#fffced] p-10 text-center text-[#66766c]">
              Menu đang được cập nhật. Bạn có thể xem bảng giá đầy đủ ở trang Menu.
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SPACE / ABOUT                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-y border-[#184d39]/10 bg-[#fbf2df] py-14 sm:py-16 lg:py-20">
        <FlowerMark className="pointer-events-none absolute right-[4%] top-[8%] h-12 w-12 rotate-[10deg] opacity-40" />
        <div className="container-shell">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-10 xl:gap-12">
              <div className="max-w-[470px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ef9dc0]/35 bg-white/70 px-3 py-1.5">
                  <Flower2 size={13} className="text-[#ef9dc0]" />
                  <span className="text-[11px] font-bold text-[#b5487a]">
                    Không gian Sweet Pea
                  </span>
                </div>

                <h2
                  style={headingFont}
                  className="mt-4 max-w-[430px] text-[2.35rem] font-bold leading-[0.98] tracking-[-0.045em] text-[#184d39] sm:text-[3rem] lg:text-[3.35rem]"
                >
                  Một khu vườn nhỏ để ngồi lâu hơn một chút.
                </h2>

                <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-[#184d39]/66 sm:text-base sm:leading-8">
                  Có cây xanh, những góc bàn nhỏ và mùi bánh mới. Dù ghé một mình hay đi cùng bạn bè,
                  Sweet Pea vẫn giữ một nhịp thật chậm, thoáng và dễ chịu.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { label: "Sân vườn xanh", accent: false },
                    { label: "Góc ngồi yên", accent: true },
                    { label: "Bánh mới mỗi ngày", accent: false },
                  ].map(({ label, accent }) => (
                    <span
                      key={label}
                      className={
                        accent
                          ? "rounded-full border border-[#ef9dc0]/40 bg-[#fbdce9]/50 px-3 py-1.5 text-xs font-semibold text-[#b5487a]"
                          : "rounded-full border border-[#184d39]/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#184d39]/68"
                      }
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <Link
                  href="/about"
                  className="focus-ring group mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] shadow-[0_10px_28px_rgba(24,77,57,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  Khám phá câu chuyện
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:h-[470px] lg:grid-cols-[1.16fr_0.84fr] lg:grid-rows-2 lg:gap-4">
                <figure className="group relative col-span-2 aspect-[16/10] overflow-hidden rounded-[1.65rem] border-4 border-white shadow-[0_18px_55px_rgba(24,77,57,0.1)] lg:col-span-1 lg:row-span-2 lg:aspect-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home-v27/sweet-pea-garden-house.webp"
                    alt="Khu vườn và lối vào Sweet Pea"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#123e2e]/38 to-transparent" />
                  <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-[#fffced]/92 px-3 py-1.5 text-xs font-bold text-[#184d39] shadow-sm backdrop-blur-sm">
                    Góc vườn xanh
                  </figcaption>
                </figure>

                <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border-4 border-white shadow-[0_14px_38px_rgba(24,77,57,0.08)] lg:aspect-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home-v27/sweet-pea-garden-view.webp"
                    alt="Góc nhìn từ bàn ngồi ra sân vườn"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#123e2e]/32 to-transparent" />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-[#fffced]/90 px-2.5 py-1 text-[11px] font-bold text-[#184d39] backdrop-blur-sm">
                    Ngồi thật chậm
                  </figcaption>
                </figure>

                <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border-4 border-white shadow-[0_14px_38px_rgba(24,77,57,0.08)] lg:aspect-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home-v27/sweet-pea-pastry-case.webp"
                    alt="Tủ bánh Sweet Pea"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#123e2e]/32 to-transparent" />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-[#fffced]/90 px-2.5 py-1 text-[11px] font-bold text-[#184d39] backdrop-blur-sm">
                    Bánh mới mỗi ngày
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* NEWS                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ba573]">
                <Flower2 size={13} /> {featuredNews.length ? "Bản tin nổi bật" : "Bản tin Sweet Pea"}
              </p>
              <h2 style={headingFont} className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#184d39] sm:text-5xl">{featuredNews.length ? "Tiệm đang muốn kể bạn nghe." : "Chuyện mới từ căn bếp."}</h2>
            </div>
            <Link href="/news" className="focus-ring inline-flex w-fit items-center gap-2 text-sm font-bold text-[#184d39]">Xem tất cả <ArrowRight size={17} /></Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homeNews.map((post, index) => (
              <article key={post.id} className="overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#fffced] transition hover:border-[#f3b8d3]/50 hover:shadow-[0_18px_40px_rgba(181,72,122,0.1)]">
                <Link href={`/news/${post.id}`} className="block border-b border-[#e2d9ca] bg-[#eee8dd] p-2">
                  <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[1.55rem]">
                    <StoryImage post={post} fallback={index === 0 ? "/images/home-v27/sweet-pea-lemon-garden.webp" : "/images/home-v27/sweet-pea-garden-view.webp"} alt="Không gian Sweet Pea" />
                  </div>
                </Link>
                <div className="p-5 sm:p-7">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b5487a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ef9dc0]" /> {dateText(post.published_at)}
                  </p>
                  <h3 style={headingFont} className="mt-3 text-2xl font-bold leading-tight text-[#184d39] sm:text-3xl">
                    <Link href={`/news/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6b796f]">{post.excerpt}</p>
                  <Link href={`/news/${post.id}`} className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#184d39]">Đọc bản tin <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA — brighter, layered gradient with floating floral accents    */}
      {/* instead of a flat block of dark green.                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative -mt-8 overflow-hidden rounded-t-[2.5rem] border-t border-[#184d39]/10 bg-gradient-to-br from-[#c7db95] via-[#e7efc6] to-[#fbf2df] py-16 text-[#184d39] sm:rounded-t-[3.5rem] sm:py-20 lg:py-24">
        {/* avocado + beige ambient glow */}
        <div className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full bg-[#fffced]/70 blur-3xl [animation:sp-blob_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-16 bottom-[-5rem] h-80 w-80 rounded-full bg-[#f5e7cf]/80 blur-3xl [animation:sp-blob_11s_ease-in-out_infinite_reverse]" />
        <div className="pointer-events-none absolute right-[28%] top-[-3rem] h-48 w-48 rounded-full bg-[#dce9b5]/75 blur-3xl [animation:sp-blob_8s_ease-in-out_infinite]" />

        {/* subtle decorative details */}
        <div className="pointer-events-none absolute left-[7%] top-[20%] h-24 w-24 rounded-full border border-[#184d39]/5 bg-white/15" />
        <div className="pointer-events-none absolute bottom-[12%] right-[8%] h-16 w-16 rounded-full border border-[#184d39]/5 bg-[#fffced]/20" />

        <Sparkles className="pointer-events-none absolute left-[24%] top-[20%] h-5 w-5 text-[#6f8f5a]/55 [animation:sp-twinkle_2.4s_ease-in-out_infinite]" />
        <Sparkles className="pointer-events-none absolute right-[27%] bottom-[20%] h-4 w-4 text-[#184d39]/35 [animation:sp-twinkle_3s_ease-in-out_infinite_0.6s]" />

        <div className="container-shell relative">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="[animation:sp-fade-up_0.7s_ease-out_both]">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-[#184d39]/10 bg-[#fffced]/72 px-3 py-1.5 text-xs font-bold text-[#6f8f5a] shadow-sm backdrop-blur-sm">
                <Leaf size={13} />
                Sweet Pea · Since 2022
              </p>

              <h2
                style={headingFont}
                className="mt-4 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#184d39] sm:text-5xl lg:text-6xl"
              >
                Ghé tiệm, chọn một góc ngồi và để Sweet Pea lo phần ngọt ngào còn lại.
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row [animation:sp-fade-up_0.8s_ease-out_0.15s_both]">
              <a
                href={phoneHref}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#184d39] px-6 font-bold text-[#fffced] shadow-[0_12px_30px_rgba(24,77,57,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e] hover:shadow-[0_16px_36px_rgba(24,77,57,0.24)]"
              >
                <Phone size={17} />
                Gọi đặt bánh
              </a>

              <Link
                href="/contact"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#184d39]/15 bg-[#fffced]/72 px-6 font-bold text-[#184d39] shadow-[0_8px_24px_rgba(24,77,57,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#184d39]/25 hover:bg-[#fffced]"
              >
                <MapPin size={17} />
                Xem địa chỉ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}