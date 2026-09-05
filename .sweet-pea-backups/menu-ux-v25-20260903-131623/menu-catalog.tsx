"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CakeSlice,
  Check,
  ChevronDown,
  Clock3,
  Grid2X2,
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
        items: items
          .filter((item) => item.category_id === category.id && item.is_available)
          .sort((a, b) => a.sort_order - b.sort_order),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, items, quickCategory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#173a2d]/55 p-0 backdrop-blur-[3px] sm:p-5" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Menu nhanh Sweet Pea"
        className="mx-auto flex h-full w-full max-w-[1180px] flex-col overflow-hidden bg-[#fffdf8] shadow-2xl sm:h-[calc(100vh-40px)] sm:rounded-[2rem] sm:border sm:border-[#d9d1bf]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-[#e2dacb] bg-[#fffaf0]/95 px-4 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7c8c71]">
                <List size={15} /> Menu nhanh
              </div>
              <h2 className="font-display mt-1 text-3xl font-bold text-[#214e3d] sm:text-4xl">Bảng giá tại tiệm</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6f7a72]">Xem toàn bộ món và giá trong một màn hình. Các món có ảnh vẫn được trình bày ở trang chính.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d8d0be] bg-white text-[#315b47] transition hover:bg-[#f2eddf]"
              aria-label="Đóng menu nhanh"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lọc menu nhanh">
            {[{ id: "all", name: "Tất cả" }, ...categories].map((category) => {
              const selected = category.id === quickCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setQuickCategory(category.id)}
                  className={`focus-ring min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {groups.map(({ category, items: groupItems }) => (
              <article key={category.id} className="overflow-hidden rounded-[1.6rem] border border-[#ded5c4] bg-[#fffaf1] shadow-[0_12px_35px_rgba(48,65,52,0.06)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#e2d9c9] bg-[#f2ebdd] px-5 py-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#849078]">Sweet Pea Menu</p>
                    <h3 className="font-display mt-1 text-2xl font-bold text-[#214e3d]">{category.name}</h3>
                    {category.description && <p className="mt-1 text-xs leading-5 text-[#78837a]">{category.description}</p>}
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ccd4ae] bg-[#e9edd7] text-[#315b47]">
                    <Leaf size={17} />
                  </span>
                </div>

                <div className="divide-y divide-[#ece4d7] px-5">
                  {groupItems.map((item) => (
                    <div key={item.id} className="py-3.5">
                      <div className="flex items-baseline gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[14px] font-bold leading-5 text-[#2c4438] sm:text-[15px]">{item.name}</span>
                            {item.is_featured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#e5ebca] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#55704e]">
                                <Sparkles size={10} /> Gợi ý
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="mb-[4px] min-w-4 flex-1 border-b border-dotted border-[#b9b19f]" aria-hidden="true" />
                        <strong className="shrink-0 text-sm font-extrabold tabular-nums text-[#245943] sm:text-[15px]">{money(item.price)}</strong>
                      </div>
                      {item.description && item.description !== "Tiệm gợi ý" && (
                        <p className="mt-1 text-[11px] leading-4 text-[#8a928c]">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
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

  const activeItems = useMemo(
    () => items.filter((item) => item.is_available && (active === "all" || item.category_id === active)),
    [active, items],
  );

  const imageItems = useMemo(
    () => activeItems.filter((item) => Boolean(item.image_url)).sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order),
    [activeItems],
  );

  const visibleImageItems = showAllImages ? imageItems : imageItems.slice(0, 12);
  const callHref = phoneHref(phone);

  useEffect(() => {
    setShowAllImages(false);
  }, [active]);

  return (
    <>
      <section id="menu" className="overflow-hidden bg-[#fffdf8] pb-20 pt-10 sm:pb-24 sm:pt-14 lg:pb-28 lg:pt-16">
        <div className="container-shell">
          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch lg:gap-10">
            <div className="relative flex min-h-[300px] flex-col justify-center overflow-hidden rounded-[2rem] border border-[#e3dccd] bg-[#fffaf2] px-5 py-9 sm:px-9 lg:min-h-[330px] lg:px-11">
              <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#e9edd2]/70 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-[#f1dfc6]/55 blur-3xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full bg-[#edf1dc] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#687b5c] sm:text-xs">
                  <Leaf size={14} /> {eyebrow}
                </p>
                <h1 className="font-display mt-5 max-w-3xl text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#214e3d]">{title}</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#68766e] sm:text-base">{description}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setQuickOpen(true)}
                    className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#245943] px-6 font-semibold text-white shadow-[0_10px_25px_rgba(36,89,67,0.18)] transition hover:bg-[#183f30]"
                  >
                    <List size={18} /> Xem menu nhanh
                  </button>
                  {callHref && (
                    <a
                      href={callHref}
                      className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfc6b3] bg-white px-6 font-semibold text-[#315b47] transition hover:border-[#91a087] hover:bg-[#fbf7ed]"
                    >
                      <Phone size={17} /> Gọi đặt món
                    </a>
                  )}
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[2rem] border border-[#d9d1bf] bg-[#f4f0e3] p-6 shadow-[0_16px_45px_rgba(56,72,59,0.07)] sm:p-7">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-[#c8cba8]" />
              <div className="pointer-events-none absolute -bottom-5 -right-5 h-24 w-24 rounded-full border border-[#c8cba8]" />
              <div className="relative space-y-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#315b47] shadow-sm"><Clock3 size={18} /></span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#6f8067]">Thời gian phục vụ</p>
                    <p className="mt-1 text-base font-bold text-[#294a3b]">{openingText || "Nhận đặt bánh và thức uống mỗi ngày"}</p>
                  </div>
                </div>
                <div className="border-t border-dashed border-[#cbc2ad] pt-5">
                  <p className="text-sm font-semibold text-[#3d5549]">Giá hiển thị theo menu tại tiệm.</p>
                  <p className="mt-2 text-sm leading-6 text-[#748078]">Món chưa có ảnh vẫn luôn xuất hiện trong <strong className="font-semibold text-[#315b47]">Menu nhanh</strong> để khách dễ xem đầy đủ bảng giá.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#e4e9cc] px-3 py-2 text-xs font-bold text-[#55704e]">
                  <Sparkles size={14} /> Hình ảnh được cập nhật từ trang quản trị
                </div>
              </div>
            </aside>
          </div>

          <div className="sticky top-[68px] z-30 -mx-3 mt-7 rounded-[1.4rem] border border-[#e2d9c8] bg-[#fffdf8]/92 p-2.5 shadow-[0_10px_35px_rgba(51,70,58,0.06)] backdrop-blur-xl sm:mx-0 sm:mt-9 sm:rounded-[1.6rem]">
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
                    className={`focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition sm:px-5 ${
                      selected
                        ? "border-[#245943] bg-[#245943] text-white"
                        : "border-[#ded6c6] bg-[#f9f4e9] text-[#53655b] hover:border-[#8fa087]"
                    }`}
                  >
                    {selected ? <Check size={15} /> : <Leaf size={14} />}
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7b8e70]"><Grid2X2 size={15} /> Thực đơn bằng hình ảnh</p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-[-0.03em] text-[#214e3d] sm:text-4xl">Khám phá món tại Sweet Pea</h2>
              <p className="mt-2 text-sm leading-6 text-[#728078]">Chỉ hiển thị các món đã có ảnh để trang luôn đẹp và dễ chọn. Xem Menu nhanh để xem toàn bộ món.</p>
            </div>
            <button
              type="button"
              onClick={() => setQuickOpen(true)}
              className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-[#d1c8b5] bg-[#fbf7ed] px-4 py-2.5 text-sm font-bold text-[#315b47] transition hover:bg-[#f2ecdd]"
            >
              <List size={16} /> Xem bảng giá đầy đủ
            </button>
          </div>

          {visibleImageItems.length > 0 ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleImageItems.map((item) => {
                  const category = categories.find((entry) => entry.id === item.category_id);
                  return (
                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-[1.65rem] border border-[#ded6c6] bg-white shadow-[0_14px_40px_rgba(46,75,61,0.075)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(46,75,61,0.12)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef0df]">
                        <MenuImage item={item} />
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                          {item.is_featured ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6f8b4c] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm">
                              <Sparkles size={11} /> Gợi ý
                            </span>
                          ) : <span />}
                          <span className="rounded-full bg-[#fffaf0]/92 px-2.5 py-1.5 text-[10px] font-bold text-[#4d6658] shadow-sm backdrop-blur">{category?.name || "Sweet Pea"}</span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-[1.35rem] font-bold leading-[1.12] text-[#214e3d]">{item.name}</h3>
                          <strong className="shrink-0 text-sm font-extrabold tabular-nums text-[#245943]">{money(item.price)}</strong>
                        </div>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#748078]">{item.description && item.description !== "Tiệm gợi ý" ? item.description : "Có tại Sweet Pea."}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-[#eee7db] pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b958f]">Đang có tại tiệm</span>
                          <button
                            type="button"
                            onClick={() => setQuickOpen(true)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-[#f0eadb] px-3 py-2 text-xs font-bold text-[#315b47] transition hover:bg-[#e7dfcf]"
                          >
                            <List size={14} /> Menu nhanh
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {imageItems.length > visibleImageItems.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllImages(true)}
                    className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-[#d4ccb9] bg-white px-6 font-semibold text-[#315b47] transition hover:bg-[#f8f3e7]"
                  >
                    Xem thêm {imageItems.length - visibleImageItems.length} món <ChevronDown size={17} />
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

      <button
        type="button"
        onClick={() => setQuickOpen(true)}
        className="focus-ring fixed bottom-4 left-1/2 z-40 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-[#245943] px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(23,58,45,0.28)] sm:hidden"
      >
        <List size={17} /> Xem menu nhanh
      </button>

      <QuickMenu open={quickOpen} onClose={() => setQuickOpen(false)} categories={categories} items={items} initialCategory={active} />
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
  const visibleItems = useMemo(
    () => (active === "all" ? items : items.filter((item) => item.category_id === active)),
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

      {visibleItems.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-white shadow-[0_12px_40px_rgba(46,75,61,0.07)]">
              <div className="aspect-[4/3] overflow-hidden"><MenuImage item={item} /></div>
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold leading-tight text-[#214e3d]">{item.name}</h3>
                  <span className="shrink-0 rounded-full bg-[#edf1dc] px-3 py-1.5 text-sm font-bold text-[#315b47]">{money(item.price)}</span>
                </div>
                <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#6a766f]">{item.description || "Có tại Sweet Pea."}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#ece6d9] pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">{item.is_available ? "Đang có tại tiệm" : "Tạm hết"}</span>
                  {item.is_featured && <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8d6a3d]"><CakeSlice size={14} /> Tiệm gợi ý</span>}
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
