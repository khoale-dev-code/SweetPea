"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  CakeSlice,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Grid2X2,
  Eye,
  ImageIcon,
  Leaf,
  List,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import type { MenuCategory, MenuItem } from "@/lib/types";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function optimizedImage(url: string) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto:good,w_1000/");
}

function phoneHref(phone?: string) {
  if (!phone) return "";
  const normalized = phone.replace(/[^0-9+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

function MenuImage({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  if (item.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={optimizedImage(item.image_url)}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
      />
    );
  }

  return (
    <div className="soft-grid relative grid h-full place-items-center overflow-hidden bg-[#eef0df]">
      <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#d9d0b9] bg-[#fffaf0]/90 text-[#496c58]">
        <ImageIcon size={16} />
      </span>
      <Image
        src="/sweet-pea-logo.png"
        alt=""
        width={compact ? 120 : 180}
        height={compact ? 120 : 180}
        loading="lazy"
        className={`${compact ? "h-20 w-20" : "h-28 w-28"} rounded-full border border-[#d8cbb5] object-cover opacity-80`}
      />
    </div>
  );
}

type MenuCatalogProps = {
  categories: MenuCategory[];
  items: MenuItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  showFilters?: boolean;
  showViewAll?: boolean;
  variant?: "cards" | "board";
  phone?: string;
  openingText?: string;
};


type SizeVariant = {
  key: string;
  label: string;
  price: number;
  item: MenuItem;
};

type ProductGroup = {
  key: string;
  name: string;
  categoryId: string;
  primary: MenuItem;
  variants: SizeVariant[];
  description: string;
  isFeatured: boolean;
  sortOrder: number;
};

const SIZE_MARKER = /\[\[sizes:([^\]]+)\]\]/i;

function cleanDescription(value?: string) {
  return (value || "").replace(SIZE_MARKER, "").replace(/\s{2,}/g, " ").trim();
}

function parseInlineSizes(item: MenuItem): SizeVariant[] {
  const match = (item.description || "").match(SIZE_MARKER);
  if (!match) return [];

  return match[1]
    .split(/[|;]/)
    .map((part, index) => {
      const option = part.trim().match(/^([^=:]+?)\s*[=:]\s*([\d.,]+)\s*(?:đ|vnd)?$/i);
      if (!option) return null;
      const price = Number(option[2].replace(/[^\d]/g, ""));
      if (!price) return null;
      return {
        key: `${item.id}-inline-${index}`,
        label: option[1].trim(),
        price,
        item,
      };
    })
    .filter((value): value is SizeVariant => Boolean(value));
}

function parseSizeName(name: string) {
  const patterns = [
    /^(.*?)\s+size\s*(S|M|L|XL)\s*$/i,
    /^(.*?)\s*[-–—|/]\s*(?:size\s*)?(S|M|L|XL)\s*$/i,
    /^(.*?)\s*\(\s*(?:size\s*)?(S|M|L|XL)\s*\)\s*$/i,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (!match) continue;
    const base = match[1].trim().replace(/[-–—|/]\s*$/, "").trim();
    if (base.length < 2) continue;
    return { base, size: match[2].toUpperCase() };
  }

  return null;
}

function sizeRank(label: string) {
  const normalized = label.trim().toUpperCase();
  const ranks: Record<string, number> = { S: 10, M: 20, L: 30, XL: 40 };
  return ranks[normalized] ?? 100;
}

function groupMenuProducts(source: MenuItem[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  source.forEach((item) => {
    const inlineSizes = parseInlineSizes(item);
    if (inlineSizes.length >= 2) {
      groups.set(`inline:${item.id}`, {
        key: `inline:${item.id}`,
        name: item.name,
        categoryId: item.category_id,
        primary: item,
        variants: inlineSizes.sort((a, b) => sizeRank(a.label) - sizeRank(b.label)),
        description: cleanDescription(item.description),
        isFeatured: item.is_featured,
        sortOrder: item.sort_order,
      });
      return;
    }

    const sized = parseSizeName(item.name);
    if (!sized) {
      groups.set(`item:${item.id}`, {
        key: `item:${item.id}`,
        name: item.name,
        categoryId: item.category_id,
        primary: item,
        variants: [{ key: item.id, label: "Mặc định", price: item.price, item }],
        description: cleanDescription(item.description),
        isFeatured: item.is_featured,
        sortOrder: item.sort_order,
      });
      return;
    }

    const normalizedBase = sized.base.toLocaleLowerCase("vi").replace(/\s+/g, " ");
    const key = `size:${item.category_id}:${normalizedBase}`;
    const existing = groups.get(key);
    const variant: SizeVariant = { key: item.id, label: sized.size, price: item.price, item };

    if (!existing) {
      groups.set(key, {
        key,
        name: sized.base,
        categoryId: item.category_id,
        primary: item,
        variants: [variant],
        description: cleanDescription(item.description),
        isFeatured: item.is_featured,
        sortOrder: item.sort_order,
      });
      return;
    }

    existing.variants.push(variant);
    existing.variants.sort((a, b) => sizeRank(a.label) - sizeRank(b.label));
    existing.isFeatured = existing.isFeatured || item.is_featured;
    existing.sortOrder = Math.min(existing.sortOrder, item.sort_order);

    if (!existing.primary.image_url && item.image_url) existing.primary = item;
    if (!existing.description && cleanDescription(item.description)) {
      existing.description = cleanDescription(item.description);
    }
  });

  return [...groups.values()].sort(
    (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
  );
}

function minProductPrice(product: ProductGroup) {
  return Math.min(...product.variants.map((variant) => Number(variant.price || 0)));
}

function productPrice(product: ProductGroup) {
  return product.variants.length > 1 ? `Từ ${money(minProductPrice(product))}` : money(product.variants[0]?.price || product.primary.price);
}

function ProductDetail({
  product,
  categoryName,
  phone,
  onClose,
}: {
  product: ProductGroup | null;
  categoryName?: string;
  phone?: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!product) return;
    setSelected(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, product]);

  if (!product || typeof document === "undefined") return null;

  const activeVariant = product.variants[selected] || product.variants[0];
  const imageItem = product.primary.image_url ? product.primary : activeVariant.item;
  const callHref = phoneHref(phone);

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-end justify-center bg-[#102f24]/60 backdrop-blur-[4px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết ${product.name}`}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.8rem] border border-[#ddd4c3] bg-[#fffdf8] shadow-[0_-24px_80px_rgba(17,48,37,0.22)] sm:max-h-[820px] sm:max-w-[940px] sm:rounded-[2rem]"
        onMouseDown={(event: any) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-[#d4ccbd] sm:hidden" />

        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d9d1c0] bg-[#fffdf8]/95 text-[#315b47] shadow-sm backdrop-blur sm:right-5 sm:top-5"
          aria-label="Đóng chi tiết sản phẩm"
        >
          <X size={18} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#eef0df] sm:aspect-auto sm:min-h-[560px]">
              <MenuImage item={imageItem} />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6f8b4c] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm">
                    <Sparkles size={11} /> Gợi ý
                  </span>
                )}
                {categoryName && (
                  <span className="rounded-full bg-[#fffaf0]/94 px-3 py-1.5 text-[10px] font-bold text-[#4d6658] shadow-sm backdrop-blur">
                    {categoryName}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-8 lg:p-9">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7c8d70]">Chi tiết sản phẩm</p>
              <h2 className="font-display mt-2 pr-10 text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-[#214e3d] sm:text-4xl">
                {product.name}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6f7b74]">
                {product.description || "Món được chuẩn bị tại Sweet Pea và phục vụ theo tình trạng tại tiệm."}
              </p>

              <div className="mt-6 rounded-[1.4rem] border border-[#e1d8c7] bg-[#faf5ea] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7a8b70]">Chọn size</p>
                    <p className="mt-1 text-xs leading-5 text-[#78847c]">Chạm vào size để xem đúng mức giá.</p>
                  </div>
                  <strong className="shrink-0 text-lg font-extrabold tabular-nums text-[#245943]">{money(activeVariant.price)}</strong>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.variants.map((variant, index) => {
                    const active = index === selected;
                    return (
                      <button
                        key={variant.key}
                        type="button"
                        onClick={() => setSelected(index)}
                        className={`focus-ring rounded-2xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-[#245943] bg-[#245943] text-white shadow-[0_8px_20px_rgba(36,89,67,0.16)]"
                            : "border-[#ddd5c5] bg-white text-[#3f5549] hover:border-[#91a087]"
                        }`}
                      >
                        <span className={`block text-[10px] font-extrabold uppercase tracking-[0.12em] ${active ? "text-[#dfeadf]" : "text-[#879188]"}`}>
                          Size
                        </span>
                        <span className="mt-0.5 block text-base font-extrabold">{variant.label}</span>
                        <span className={`mt-1 block text-xs font-bold tabular-nums ${active ? "text-white" : "text-[#245943]"}`}>{money(variant.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {callHref ? (
                  <a
                    href={callHref}
                    className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#245943] px-5 text-sm font-bold text-white transition hover:bg-[#183f30]"
                  >
                    <Phone size={17} /> Gọi đặt món
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#d4ccb9] bg-white px-5 text-sm font-bold text-[#315b47] transition hover:bg-[#f8f3e7]"
                >
                  Tiếp tục xem menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function QuickMenu({
  open,
  onClose,
  categories,
  items,
  initialCategory,
}: {
  open: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  items: MenuItem[];
  initialCategory: string;
}) {
  const [quickCategory, setQuickCategory] = useState(initialCategory);

  useEffect(() => {
    if (!open) return;
    setQuickCategory(initialCategory);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [initialCategory, onClose, open]);

  const groups = useMemo(() => {
    const scoped = quickCategory === "all" ? categories : categories.filter((category) => category.id === quickCategory);
    return scoped
      .map((category) => ({
        category,
        products: groupMenuProducts(
          items
            .filter((item) => item.category_id === category.id && item.is_available)
            .sort((a, b) => a.sort_order - b.sort_order),
        ),
      }))
      .filter((group) => group.products.length > 0);
  }, [categories, items, quickCategory]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center bg-[#123126]/62 backdrop-blur-[4px] sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Menu nhanh Sweet Pea"
        className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.85rem] border border-[#d9d1bf] bg-[#fffdf8] shadow-[0_-24px_80px_rgba(17,48,37,0.24)] sm:h-[calc(100dvh-40px)] sm:max-h-[860px] sm:max-w-[1160px] sm:rounded-[2rem]"
        onMouseDown={(event: any) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-[#d4ccbd] sm:hidden" />

        <header className="shrink-0 border-b border-[#e2dacb] bg-[#fffaf0]/97 px-4 pb-3 pt-3 backdrop-blur-xl sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7c8c71] sm:text-[11px]">
                <List size={14} /> Menu nhanh
              </div>
              <h2 className="font-display mt-1 text-2xl font-bold leading-tight text-[#214e3d] sm:text-4xl">Bảng giá tại tiệm</h2>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-[#6f7a72] sm:block">
                Xem nhanh toàn bộ món và mức giá. Sản phẩm có nhiều size được gom chung để dễ so sánh.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d8d0be] bg-white text-[#315b47] transition hover:bg-[#f2eddf] sm:h-11 sm:w-11"
              aria-label="Đóng menu nhanh"
            >
              <X size={19} />
            </button>
          </div>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mt-4" role="tablist" aria-label="Lọc menu nhanh">
            {[{ id: "all", name: "Tất cả" }, ...categories].map((category) => {
              const selected = category.id === quickCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setQuickCategory(category.id)}
                  className={`focus-ring min-h-10 shrink-0 rounded-full border px-3.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    selected
                      ? "border-[#245943] bg-[#245943] text-white"
                      : "border-[#d8d1c0] bg-[#f9f3e7] text-[#52645a] hover:border-[#93a28d]"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-7 sm:py-6">
          <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-2">
            {groups.map(({ category, products }) => (
              <article key={category.id} className="overflow-hidden rounded-[1.35rem] border border-[#ded5c4] bg-[#fffdf9] shadow-[0_10px_30px_rgba(48,65,52,0.05)] sm:rounded-[1.6rem]">
                <div className="flex items-start justify-between gap-3 border-b border-[#e2d9c9] bg-[#f2ebdd] px-4 py-3.5 sm:px-5 sm:py-4">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#849078] sm:text-[10px]">Sweet Pea Menu</p>
                    <h3 className="font-display mt-1 text-xl font-bold text-[#214e3d] sm:text-2xl">{category.name}</h3>
                    {category.description && <p className="mt-1 hidden text-xs leading-5 text-[#78837a] sm:block">{category.description}</p>}
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ccd4ae] bg-[#e9edd7] text-[#315b47] sm:h-10 sm:w-10">
                    <Leaf size={16} />
                  </span>
                </div>

                <div className="divide-y divide-[#ece4d7] px-4 sm:px-5">
                  {products.map((product) => (
                    <div key={product.key} className="py-3 sm:py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-bold leading-5 text-[#2c4438] sm:text-[15px]">{product.name}</span>
                            {product.isFeatured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#e5ebca] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#55704e] sm:text-[9px]">
                                <Sparkles size={9} /> Gợi ý
                              </span>
                            )}
                            {product.variants.length > 1 && (
                              <span className="rounded-full border border-[#d5d8bd] bg-[#f3f5e7] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#65785f] sm:text-[9px]">
                                {product.variants.length} size
                              </span>
                            )}
                          </div>

                          {product.variants.length > 1 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {product.variants.map((variant) => (
                                <span key={variant.key} className="inline-flex items-center gap-1 rounded-lg bg-[#f5f0e5] px-2 py-1 text-[10px] font-bold text-[#5d6f64] sm:text-[11px]">
                                  <b className="text-[#315b47]">{variant.label}</b>
                                  <span>{money(variant.price)}</span>
                                </span>
                              ))}
                            </div>
                          ) : product.description && product.description !== "Tiệm gợi ý" ? (
                            <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-[#8a928c] sm:text-[11px]">{product.description}</p>
                          ) : null}
                        </div>

                        <strong className="shrink-0 pt-0.5 text-xs font-extrabold tabular-nums text-[#245943] sm:text-[15px]">
                          {productPrice(product)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#e6dfd1] bg-[#fbf7ed] px-4 py-3 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold leading-4 text-[#7c8881] sm:text-xs">Giá có thể thay đổi theo cập nhật tại tiệm.</p>
            <button type="button" onClick={onClose} className="focus-ring shrink-0 rounded-full bg-[#245943] px-4 py-2.5 text-xs font-bold text-white sm:px-5 sm:text-sm">
              Xong
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function GalleryMenu({
  categories,
  items,
  eyebrow,
  title,
  description,
  phone,
  openingText,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
  eyebrow: string;
  title: string;
  description: string;
  phone?: string;
  openingText?: string;
}) {
  const [active, setActive] = useState("all");
  const [quickOpen, setQuickOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductGroup | null>(null);

  const activeItems = useMemo(
    () => items.filter((item) => item.is_available && (active === "all" || item.category_id === active)),
    [active, items],
  );

  const imageProducts = useMemo(
    () => groupMenuProducts(activeItems).filter((product) => Boolean(product.primary.image_url)),
    [activeItems],
  );

  const visibleImageProducts = showAllImages ? imageProducts : imageProducts.slice(0, 12);
  const callHref = phoneHref(phone);

  useEffect(() => {
    setShowAllImages(false);
  }, [active]);

  return (
    <>
      <section id="menu" className="overflow-hidden bg-[#fffdf8] pb-20 pt-7 sm:pb-24 sm:pt-12 lg:pb-28 lg:pt-14">
        <div className="container-shell">
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch lg:gap-8">
            <div className="relative flex min-h-[270px] flex-col justify-center overflow-hidden rounded-[1.7rem] border border-[#e3dccd] bg-[#fffaf2] px-5 py-8 sm:min-h-[300px] sm:rounded-[2rem] sm:px-9 lg:min-h-[320px] lg:px-11">
              <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#e9edd2]/70 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-[#f1dfc6]/55 blur-3xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full bg-[#edf1dc] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#687b5c] sm:text-xs">
                  <Leaf size={14} /> {eyebrow}
                </p>
                <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.55rem,7vw,5.3rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#214e3d] sm:mt-5">{title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#68766e] sm:mt-5 sm:text-base sm:leading-7">{description}</p>
                <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickOpen(true)}
                    className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#245943] px-5 font-semibold text-white shadow-[0_10px_25px_rgba(36,89,67,0.18)] transition hover:bg-[#183f30] sm:px-6"
                  >
                    <List size={18} /> Xem menu nhanh
                  </button>
                  {callHref && (
                    <a
                      href={callHref}
                      className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfc6b3] bg-white px-5 font-semibold text-[#315b47] transition hover:border-[#91a087] hover:bg-[#fbf7ed] sm:px-6"
                    >
                      <Phone size={17} /> Gọi đặt món
                    </a>
                  )}
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[1.7rem] border border-[#d9d1bf] bg-[#f4f0e3] p-5 shadow-[0_16px_45px_rgba(56,72,59,0.07)] sm:rounded-[2rem] sm:p-7">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-[#c8cba8]" />
              <div className="pointer-events-none absolute -bottom-5 -right-5 h-24 w-24 rounded-full border border-[#c8cba8]" />
              <div className="relative space-y-4 sm:space-y-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#315b47] shadow-sm"><Clock3 size={18} /></span>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6f8067] sm:text-[11px]">Thời gian phục vụ</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#294a3b] sm:text-base">{openingText || "Nhận đặt bánh và thức uống mỗi ngày"}</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-[#cbc2ad] pt-4 sm:pt-5">
                  <p className="text-sm font-semibold text-[#3d5549]">Giá hiển thị theo menu tại tiệm.</p>
                  <p className="mt-2 text-sm leading-6 text-[#748078]">Mở <strong className="font-semibold text-[#315b47]">Menu nhanh</strong> để xem bảng giá đầy đủ. Món nhiều size sẽ được gom chung.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e4e9cc] px-3 py-2 text-xs font-bold text-[#55704e]">
                  <Sparkles size={14} /> Ảnh được cập nhật từ Admin
                </div>
              </div>
            </aside>
          </div>

          <div className="sticky top-[68px] z-30 -mx-3 mt-5 rounded-[1.35rem] border border-[#e2d9c8] bg-[#fffdf8]/94 p-2 shadow-[0_10px_35px_rgba(51,70,58,0.06)] backdrop-blur-xl sm:mx-0 sm:mt-8 sm:rounded-[1.6rem] sm:p-2.5">
            <div className="flex gap-2 overflow-x-auto pb-0.5" role="tablist" aria-label="Lọc sản phẩm theo danh mục">
              {[{ id: "all", name: "Tất cả" }, ...categories].map((category) => {
                const selected = category.id === active;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActive(category.id)}
                    className={`focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition sm:min-h-11 sm:px-5 sm:text-sm ${
                      selected
                        ? "border-[#245943] bg-[#245943] text-white"
                        : "border-[#ded6c6] bg-[#f9f4e9] text-[#53655b] hover:border-[#8fa087]"
                    }`}
                  >
                    {selected ? <Check size={14} /> : <Leaf size={13} />}
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-3 sm:mt-10 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7b8e70] sm:text-xs"><Grid2X2 size={15} /> Thực đơn bằng hình ảnh</p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.03em] text-[#214e3d] sm:text-4xl">Khám phá món tại Sweet Pea</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#728078]">Món có ảnh được ưu tiên hiển thị. Với món có nhiều size, bấm <strong className="font-semibold text-[#315b47]">Xem chi tiết</strong> để chọn size và xem đúng giá.</p>
            </div>
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-[#d1c8b5] bg-[#fbf7ed] px-4 py-2.5 text-sm font-bold text-[#315b47] transition hover:bg-[#f2ecdd]"
            >
              <List size={16} /> Xem bảng giá đầy đủ
            </button>
          </div>

          {visibleImageProducts.length > 0 ? (
            <>
              <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleImageProducts.map((product) => {
                  const category = categories.find((entry) => entry.id === product.categoryId);
                  const hasSizes = product.variants.length > 1;

                  return (
                    <article
                      key={product.key}
                      className="group overflow-hidden rounded-[1.5rem] border border-[#ded6c6] bg-white shadow-[0_12px_36px_rgba(46,75,61,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(46,75,61,0.12)] sm:rounded-[1.65rem]"
                    >
                      <div className="relative aspect-[16/11] overflow-hidden bg-[#eef0df] sm:aspect-[4/3]">
                        <MenuImage item={product.primary} />
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                          {product.isFeatured ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6f8b4c] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm sm:text-[10px]">
                              <Sparkles size={11} /> Gợi ý
                            </span>
                          ) : <span />}
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="rounded-full bg-[#fffaf0]/92 px-2.5 py-1.5 text-[9px] font-bold text-[#4d6658] shadow-sm backdrop-blur sm:text-[10px]">{category?.name || "Sweet Pea"}</span>
                            {hasSizes && (
                              <span className="rounded-full bg-[#245943] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-white shadow-sm">
                                {product.variants.length} size
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display min-w-0 text-[1.25rem] font-bold leading-[1.12] text-[#214e3d] sm:text-[1.35rem]">{product.name}</h3>
                          <strong className="shrink-0 text-xs font-extrabold tabular-nums text-[#245943] sm:text-sm">{productPrice(product)}</strong>
                        </div>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#748078]">{product.description || "Có tại Sweet Pea."}</p>
                        <div className="mt-4 flex min-h-10 items-center justify-between gap-3 border-t border-[#eee7db] pt-3">
                          <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#8b958f] sm:text-[10px]">
                            {hasSizes ? `${product.variants.length} lựa chọn kích thước` : "Đang có tại tiệm"}
                          </span>

                          {hasSizes ? (
                            <button
                              type="button"
                              onClick={() => setDetailProduct(product)}
                              className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#245943] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#183f30]"
                            >
                              <Eye size={14} /> Xem chi tiết <ChevronRight size={13} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {imageProducts.length > visibleImageProducts.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllImages(true)}
                    className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-[#d4ccb9] bg-white px-6 font-semibold text-[#315b47] transition hover:bg-[#f8f3e7]"
                  >
                    Xem thêm {imageProducts.length - visibleImageProducts.length} món <ChevronDown size={17} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-dashed border-[#cbd2b3] bg-[#f7f5e9] px-5 py-14 text-center sm:px-8">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e6ebcf] text-[#456753]"><ImageIcon size={21} /></span>
              <h3 className="font-display mt-4 text-2xl font-bold text-[#214e3d]">Danh mục này chưa có ảnh món</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#748078]">Bạn có thể thêm ảnh trong trang Quản trị. Khách vẫn xem được đầy đủ tên món và giá bằng Menu nhanh.</p>
              <button type="button" onClick={() => setQuickOpen(true)} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#245943] px-5 text-sm font-semibold text-white">
                <List size={16} /> Xem menu nhanh
              </button>
            </div>
          )}
        </div>
      </section>

      {!quickOpen && !detailProduct ? (
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="focus-ring fixed bottom-4 left-1/2 z-40 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-[#245943] px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(23,58,45,0.28)] sm:hidden"
        >
          <List size={17} /> Xem menu nhanh
        </button>
      ) : null}

      <QuickMenu open={quickOpen} onClose={() => setQuickOpen(false)} categories={categories} items={items} initialCategory={active} />
      <ProductDetail
        product={detailProduct}
        categoryName={detailProduct ? categories.find((entry) => entry.id === detailProduct.categoryId)?.name : undefined}
        phone={phone}
        onClose={() => setDetailProduct(null)}
      />
    </>
  );
}

function CardMenu({
  categories,
  items,
  active,
  setActive,
  showFilters,
  showViewAll,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
  active: string;
  setActive: (value: string) => void;
  showFilters: boolean;
  showViewAll: boolean;
}) {
  const visibleProducts = useMemo(
    () =>
      groupMenuProducts(
        (active === "all" ? items : items.filter((item) => item.category_id === active)).filter((item) => item.is_available),
      ),
    [active, items],
  );

  return (
    <>
      {showFilters && (
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Lọc menu theo danh mục">
          {[{ id: "all", name: "Tất cả" }, ...categories].map((category) => {
            const selected = category.id === active;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(category.id)}
                className={`focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                  selected
                    ? "border-[#245943] bg-[#245943] text-white"
                    : "border-[#d7d1bf] bg-[#f8f2e6] text-[#506359] hover:border-[#8da083]"
                }`}
              >
                {selected && <Check size={15} />}
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {visibleProducts.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product.key} className="group overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-white shadow-[0_12px_40px_rgba(46,75,61,0.07)]">
              <div className="aspect-[4/3] overflow-hidden"><MenuImage item={product.primary} /></div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold leading-tight text-[#214e3d]">{product.name}</h3>
                  <span className="shrink-0 rounded-full bg-[#edf1dc] px-3 py-1.5 text-sm font-bold text-[#315b47]">{productPrice(product)}</span>
                </div>
                <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#6a766f]">{product.description || "Có tại Sweet Pea."}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#ece6d9] pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">{product.variants.length > 1 ? `${product.variants.length} size` : "Đang có tại tiệm"}</span>
                  {product.isFeatured && <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8d6a3d]"><CakeSlice size={14} /> Tiệm gợi ý</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-[#cbd2b3] bg-[#f7f5e9] px-6 py-14 text-center text-[#657368]">Danh mục này đang được tiệm chuẩn bị thêm món mới.</div>
      )}

      {showViewAll && (
        <div className="mt-9 text-center">
          <Link href="/menu" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[#245943] px-7 font-semibold text-white transition hover:bg-[#183f30]">Xem toàn bộ menu</Link>
        </div>
      )}
    </>
  );
}

export function MenuCatalog({
  categories,
  items,
  eyebrow = "Menu Sweet Pea",
  title = "Món xinh cho ngày dịu dàng",
  description = "Giá và tình trạng món được cập nhật trực tiếp. Nhắn tiệm để giữ phần bạn thích nhé.",
  showFilters = true,
  showViewAll = false,
  variant = "cards",
  phone,
  openingText,
}: MenuCatalogProps) {
  const [active, setActive] = useState("all");

  if (variant === "board") {
    return (
      <GalleryMenu
        categories={categories}
        items={items}
        eyebrow={eyebrow}
        title={title}
        description={description}
        phone={phone}
        openingText={openingText}
      />
    );
  }

  return (
    <section id="menu" className="bg-[#fffdf8] py-16 sm:py-20 lg:py-24">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">{eyebrow}</p>
            <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold leading-[1.04] text-[#214e3d] sm:text-5xl lg:text-6xl">{title}</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#68766e]">{description}</p>
        </div>

        <CardMenu categories={categories} items={items} active={active} setActive={setActive} showFilters={showFilters} showViewAll={showViewAll} />
      </div>
    </section>
  );
}
