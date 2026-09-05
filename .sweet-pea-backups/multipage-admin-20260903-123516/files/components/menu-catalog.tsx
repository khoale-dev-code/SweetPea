"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CakeSlice, Check, Leaf } from "lucide-react";
import type { MenuCategory, MenuItem } from "@/lib/types";

function money(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function optimizedImage(url: string) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto:eco,w_900/");
}

function MenuImage({ item }: { item: MenuItem }) {
  if (item.image_url) {
    return (
      // Cloudinary transformation handles responsive format, quality and width.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={optimizedImage(item.image_url)}
        alt={item.name}
        loading="lazy"
        decoding="async"
        className="menu-card-image h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="menu-card-image soft-grid relative grid h-full place-items-center bg-[#e6eccb]">
      <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/75 text-[#426a54]">
        <Leaf size={18} />
      </span>
      <Image
        src="/sweet-pea-logo.png"
        alt=""
        width={180}
        height={180}
        loading="lazy"
        className="h-32 w-32 rounded-full border border-[#d8cbb5] object-cover opacity-90"
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
};

export function MenuCatalog({
  categories,
  items,
  eyebrow = "Menu Sweet Pea",
  title = "Món xinh cho ngày dịu dàng",
  description = "Giá và tình trạng món được cập nhật trực tiếp. Nhắn tiệm để giữ phần bánh bạn thích nhé.",
  showFilters = true,
  showViewAll = false,
}: MenuCatalogProps) {
  const [active, setActive] = useState("all");
  const visibleItems = useMemo(
    () => (active === "all" ? items : items.filter((item) => item.category_id === active)),
    [active, items],
  );

  return (
    <section id="menu" className="bg-[#fffdf8] py-20 sm:py-24">
      <div className="container-shell">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">{eyebrow}</p>
            <h2 className="font-display mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-[#214e3d] sm:text-6xl">
              {title}
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#68766e]">
            {description}
          </p>
        </div>

        {showFilters && <div className="mt-9 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Lọc menu theo danh mục">
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
        </div>}

        {visibleItems.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="menu-card group overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-white shadow-[0_12px_40px_rgba(46,75,61,0.07)]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <MenuImage item={item} />
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.025em] text-[#214e3d]">{item.name}</h3>
                    <span className="shrink-0 rounded-full bg-[#edf1dc] px-3 py-1.5 text-sm font-bold text-[#315b47]">
                      {money(item.price)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#6a766f]">{item.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#ece6d9] pt-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">
                      {item.is_available ? "Đang có tại tiệm" : "Tạm hết"}
                    </span>
                    {item.is_featured && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8d6a3d]">
                        <CakeSlice size={14} />
                        Tiệm gợi ý
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[#cbd2b3] bg-[#f7f5e9] px-6 py-14 text-center text-[#657368]">
            Danh mục này đang được tiệm chuẩn bị thêm món mới.
          </div>
        )}
        {showViewAll && (
          <div className="mt-9 text-center">
            <Link href="/menu" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[#245943] px-7 font-semibold text-white transition hover:bg-[#183f30]">
              Xem toàn bộ menu
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
