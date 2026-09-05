import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { MenuCatalog } from "@/components/menu-catalog";
import { NewsCard } from "@/components/news-card";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts, getStoreData } from "@/lib/store";

export const revalidate = 60;

export default async function Home() {
  const [data, news] = await Promise.all([getStoreData(), getNewsPosts()]);
  const featured = data.items.filter((item) => item.is_featured);
  const menuPreview = (featured.length ? featured : data.items).slice(0, 3);

  return (
    <PageTransition>
      <Hero shop={data.shop} />
      <MenuCatalog
        categories={data.categories}
        items={menuPreview}
        eyebrow="Tiệm gợi ý"
        title="Ba món nhỏ, đủ làm ngày vui hơn"
        description="Mỗi món được làm theo mẻ nhỏ để giữ độ tươi. Menu đầy đủ vẫn còn nhiều lựa chọn xinh xắn khác."
        showFilters={false}
        showViewAll
      />

      <section className="paper-texture border-y border-[#d7d1bf] py-20 sm:py-24">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">Bản tin Sweet Pea</p>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#214e3d] sm:text-6xl">Chuyện mới từ căn bếp</h2>
            </div>
            <Link href="/news" className="focus-ring inline-flex w-fit items-center gap-2 rounded-full font-semibold text-[#245943]">Xem tất cả <ArrowRight size={18} /></Link>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {news.slice(0, 2).map((post) => <NewsCard key={post.id} post={post} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#245943] py-16 text-white sm:py-20">
        <div className="container-shell flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#cfdda9]">Sweet Pea · Since 2022</p><h2 className="font-display mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Bánh tươi, vị vừa đủ và một góc nhỏ thật hiền.</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href="/about" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[#e4eacb] px-6 font-semibold text-[#214e3d]">Câu chuyện của tiệm</Link><Link href="/contact" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white">Liên hệ đặt bánh</Link></div>
        </div>
      </section>
    </PageTransition>
  );
}
