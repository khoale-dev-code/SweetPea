import Link from "next/link";
import {
  ArrowRight,
  CakeSlice,
  Clock3,
  ImageIcon,
  Leaf,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts, getStoreData } from "@/lib/store";
import type { MenuItem, NewsPost } from "@/lib/types";

export const revalidate = 60;

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

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

function cleanDescription(value?: string) {
  return (value || "")
    .replace(/\[\[sizes:[^\]]+\]\]/gi, "")
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
  isFeatured: boolean;
  variantCount: number;
  sortOrder: number;
};

function groupProducts(items: MenuItem[]): HomeProduct[] {
  const groups = new Map<string, HomeProduct>();

  for (const item of items) {
    const name = productBaseName(item.name);
    const key = `${item.category_id}::${name.toLocaleLowerCase("vi")}`;
    const inlineSizeCount = /\[\[sizes:/i.test(item.description || "") ? 2 : 1;
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        key,
        name,
        description: cleanDescription(item.description),
        categoryId: item.category_id,
        price: Number(item.price || 0),
        imageUrl: item.image_url || "",
        isFeatured: Boolean(item.is_featured),
        variantCount: inlineSizeCount,
        sortOrder: Number(item.sort_order || 0),
      });
      continue;
    }

    current.price = Math.min(current.price || Number(item.price || 0), Number(item.price || 0));
    current.imageUrl = current.imageUrl || item.image_url || "";
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
  if (!product.imageUrl) {
    return (
      <div className="soft-grid grid aspect-[4/3] w-full place-items-center bg-[#eef0df] p-8">
        <div className="text-center text-[#5d735f]">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#d7cfba] bg-[#fffced]">
            <ImageIcon size={20} />
          </span>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em]">Sweet Pea</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#fffced] p-2 sm:p-3">
      {/* Product photos intentionally use object-contain so the entire uploaded image remains visible. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimizedImage(product.imageUrl)}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
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
            <section className="relative overflow-hidden border-b border-[#184d39]/10 bg-[#fffced]">
        <div className="pointer-events-none absolute -left-28 top-6 h-64 w-64 rounded-full bg-[#c7db95]/28 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#c7db95]/18 blur-3xl" />

        <div className="container-shell relative py-8 sm:py-10 lg:py-12 xl:py-14">
          <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-11 xl:gap-14">
            <div className="max-w-[560px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#184d39]/10 bg-[#c7db95]/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#184d39] sm:text-xs">
                <Sparkles size={14} />
                Sweet Pea · Bakery & Café
              </div>

              <h1
                style={headingFont}
                className="mt-5 max-w-[560px] text-[clamp(3rem,5.2vw,5.15rem)] font-bold leading-[0.9] tracking-[-0.052em] text-[#184d39]"
              >
                Một góc xanh,
                <span className="mt-1.5 block text-[0.72em] font-normal italic leading-[0.98] tracking-[-0.035em] text-[#789366] sm:mt-2">
                  một ngày dịu hơn.
                </span>
              </h1>

              <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#184d39]/65 sm:text-base sm:leading-8">
                {data.shop.description || "Bánh tươi, thức uống vừa vị và một khoảng sân vườn để bạn chậm lại giữa ngày."}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/menu"
                  className="focus-ring group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] shadow-[0_10px_28px_rgba(24,77,57,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  Khám phá menu
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/about"
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#184d39]/14 bg-white/45 px-5 text-sm font-bold text-[#184d39] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80"
                >
                  Xem không gian <Leaf size={16} />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/42 px-3.5 text-xs font-semibold text-[#184d39]/72">
                  <Clock3 size={14} className="text-[#184d39]" />
                  <span className="max-w-[210px] truncate">{data.shop.opening_text}</span>
                </div>

                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/42 px-3.5 text-xs font-semibold text-[#184d39]/72">
                  <CakeSlice size={14} className="text-[#184d39]" />
                  Bánh mới mỗi ngày
                </div>

                <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/42 px-3.5 text-xs font-semibold text-[#184d39]/72">
                  <Leaf size={14} className="text-[#184d39]" />
                  Sân vườn xanh
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:h-[500px] lg:grid-cols-[1.42fr_0.86fr] lg:grid-rows-2">
              <figure className="group relative col-span-2 aspect-[16/10] overflow-hidden rounded-[1.7rem] border border-[#184d39]/10 bg-[#c7db95]/18 shadow-[0_20px_55px_rgba(24,77,57,0.09)] sm:aspect-[16/9] lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:rounded-[2rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home-v27/sweet-pea-lemon-garden.webp"
                  alt="Không gian sân vườn Sweet Pea"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#123e2e]/45 via-[#123e2e]/10 to-transparent" />
                <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#fffced]/92 px-3 py-1.5 text-[11px] font-bold text-[#184d39] shadow-sm backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-xs">
                  <MapPin size={13} /> Góc sân vườn Sweet Pea
                </figcaption>
              </figure>

              <figure className="group relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-[#184d39]/10 bg-[#c7db95]/18 shadow-[0_14px_38px_rgba(24,77,57,0.07)] lg:aspect-auto lg:rounded-[1.65rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home-v27/sweet-pea-pastry-case.webp"
                  alt="Tủ bánh tại Sweet Pea"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#123e2e]/38 to-transparent" />
                <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-[#fffced]/90 px-2.5 py-1 text-[10px] font-bold text-[#184d39] backdrop-blur-sm sm:text-[11px]">
                  Bánh mới mỗi ngày
                </figcaption>
              </figure>

              <figure className="group relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-[#184d39]/10 bg-[#c7db95]/18 shadow-[0_14px_38px_rgba(24,77,57,0.07)] lg:aspect-auto lg:rounded-[1.65rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home-v27/sweet-pea-garden-view.webp"
                  alt="Góc ngồi nhìn ra khu vườn Sweet Pea"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#123e2e]/38 to-transparent" />
                <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-[#fffced]/90 px-2.5 py-1 text-[10px] font-bold text-[#184d39] backdrop-blur-sm sm:text-[11px]">
                  Ngồi thật chậm
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718a68]">Hôm nay ở Sweet Pea</p>
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
                <article key={product.key} className="group overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#fffced] shadow-[0_16px_40px_rgba(54,72,60,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(54,72,60,0.11)]">
                  <div className="border-b border-[#e1d8c8]">
                    <ProductImage product={product} />
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#7d9276]">{categories.get(product.categoryId) || "Sweet Pea"}</p>
                        <h3 style={headingFont} className="mt-2 text-2xl font-bold leading-tight text-[#184d39]">{product.name}</h3>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#c7db95] px-3 py-1.5 text-sm font-extrabold text-[#184d39]">
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

            <section className="border-y border-[#184d39]/10 bg-[#fffced] py-12 sm:py-14 lg:py-16">
        <div className="container-shell">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-10 xl:gap-12">
              <div className="max-w-[470px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#184d39]/10 bg-[#c7db95]/32 px-3 py-1.5">
                  <Leaf size={13} className="text-[#184d39]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#184d39]/70">
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
                  {["Sân vườn xanh", "Góc ngồi yên", "Bánh mới mỗi ngày"].map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-[#184d39]/10 bg-white/45 px-3 py-1.5 text-xs font-semibold text-[#184d39]/68"
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
                <figure className="group relative col-span-2 aspect-[16/10] overflow-hidden rounded-[1.65rem] border border-[#184d39]/10 bg-[#c7db95]/20 shadow-[0_18px_55px_rgba(24,77,57,0.08)] lg:col-span-1 lg:row-span-2 lg:aspect-auto">
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

                <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border border-[#184d39]/10 bg-[#c7db95]/20 shadow-[0_14px_38px_rgba(24,77,57,0.07)] lg:aspect-auto">
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

                <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border border-[#184d39]/10 bg-[#c7db95]/20 shadow-[0_14px_38px_rgba(24,77,57,0.07)] lg:aspect-auto">
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

      <section className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#718a68]">{featuredNews.length ? "Bản tin nổi bật" : "Bản tin Sweet Pea"}</p>
              <h2 style={headingFont} className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#184d39] sm:text-5xl">{featuredNews.length ? "Tiệm đang muốn kể bạn nghe." : "Chuyện mới từ căn bếp."}</h2>
            </div>
            <Link href="/news" className="focus-ring inline-flex w-fit items-center gap-2 text-sm font-bold text-[#184d39]">Xem tất cả <ArrowRight size={17} /></Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homeNews.map((post, index) => (
              <article key={post.id} className="overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#fffced]">
                <Link href={`/news/${post.id}`} className="block border-b border-[#e2d9ca] bg-[#eee8dd] p-2">
                  <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[1.55rem]">
                    <StoryImage post={post} fallback={index === 0 ? "/images/home-v27/sweet-pea-lemon-garden.webp" : "/images/home-v27/sweet-pea-garden-view.webp"} alt="Không gian Sweet Pea" />
                  </div>
                </Link>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829078]">{dateText(post.published_at)}</p>
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

      <section className="bg-[#184d39] py-14 text-white sm:py-16 lg:py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7db95]">Sweet Pea · Since 2022</p>
            <h2 style={headingFont} className="mt-3 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Ghé tiệm, chọn một góc ngồi và để Sweet Pea lo phần ngọt ngào còn lại.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={phoneHref} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c7db95] px-6 font-bold text-[#184d39]">
              <Phone size={17} /> Gọi đặt bánh
            </a>
            <Link href="/contact" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 font-bold text-white">
              <MapPin size={17} /> Xem địa chỉ
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
