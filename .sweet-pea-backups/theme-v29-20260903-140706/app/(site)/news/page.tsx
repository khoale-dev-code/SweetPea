import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Leaf,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts } from "@/lib/store";
import type { NewsPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "Bản tin",
  description: "Món mới, câu chuyện và những cập nhật mới nhất từ Sweet Pea.",
};

export const revalidate = 60;

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

function dateText(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function optimizeCloudinary(url: string, width = 1200) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
}

function NewsImage({ post, compact = false }: { post: NewsPost; compact?: boolean }) {
  if (post.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={optimizeCloudinary(post.image_url, compact ? 560 : 1200)}
        alt={post.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.015]"
      />
    );
  }

  return (
    <div className="soft-grid grid h-full place-items-center bg-[#e7edce] p-6">
      <Image
        src="/sweet-pea-logo.png"
        alt="Sweet Pea"
        width={180}
        height={180}
        className={compact ? "w-14 rounded-full opacity-90" : "w-28 rounded-full opacity-90 sm:w-36"}
      />
    </div>
  );
}

function sortPosts(posts: NewsPost[]) {
  return [...posts].sort((a, b) => {
    const byDate = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    if (byDate !== 0) return byDate;
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

export default async function NewsPage() {
  const posts = sortPosts((await getNewsPosts()).filter((post) => post.is_published !== false));
  const featured = posts.find((post) => post.is_featured) || posts[0];
  const latest = posts.slice(0, 6);

  return (
    <PageTransition>
      <section className="relative overflow-hidden border-b border-[#d9d1c0] bg-[#f5efe3]">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#dce7bd]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#efd6aa]/35 blur-3xl" />
        <div className="container-shell relative grid gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-12 lg:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d3d9b8] bg-[#eef2d8] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#496b54]">
              <Newspaper size={15} /> Bản tin Sweet Pea
            </span>
            <h1
              style={headingFont}
              className="mt-5 text-[clamp(3.25rem,7vw,6rem)] font-bold leading-[0.93] tracking-[-0.055em] text-[#194d39]"
            >
              Chuyện mới
              <span className="mt-1 block italic font-normal text-[#708d64]">từ căn bếp.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#617268] sm:text-lg">
              Món mới, những buổi hẹn nhỏ và câu chuyện Sweet Pea muốn lưu lại cùng bạn.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#496456]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd4c3] bg-white/65 px-4 py-2.5">
                <Newspaper size={16} /> {posts.length} bài viết
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd4c3] bg-white/65 px-4 py-2.5">
                <Clock3 size={16} /> Cập nhật từ tiệm
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#d8cfbd] bg-[#eee7d9] p-2 shadow-[0_22px_60px_rgba(44,73,59,0.1)]">
            {featured ? (
              <Link href={`/news/${featured.id}`} className="group relative block overflow-hidden rounded-[1.6rem] bg-[#f3eee3]">
                <div className="flex aspect-[16/10] items-center justify-center">
                  <NewsImage post={featured} />
                </div>
                <div className="absolute inset-x-3 bottom-3 rounded-[1.25rem] bg-[#163f31]/92 p-4 text-white shadow-lg backdrop-blur sm:inset-x-4 sm:bottom-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#d9e5bd]">
                    {featured.is_featured ? <><Sparkles size={13} /> Nổi bật</> : <><CalendarDays size={13} /> Mới nhất</>}
                  </div>
                  <p style={headingFont} className="mt-2 line-clamp-2 text-xl font-bold leading-tight sm:text-2xl">{featured.title}</p>
                </div>
              </Link>
            ) : (
              <div className="grid aspect-[16/10] place-items-center rounded-[1.6rem] bg-[#e7edce] text-[#54705c]">
                Chưa có bản tin.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf8] py-12 sm:py-16 lg:py-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start xl:gap-12">
          <aside className="order-2 grid gap-5 lg:order-1 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-[1.7rem] border border-[#ddd5c5] bg-[#fffaf2] shadow-[0_14px_40px_rgba(50,70,58,0.04)]">
              <div className="border-b border-[#e6ded0] px-5 py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#849376]">Bài viết mới nhất</p>
              </div>
              <div className="divide-y divide-[#eee7dc]">
                {latest.length ? latest.map((post) => (
                  <Link key={post.id} href={`/news/${post.id}`} className="group flex gap-3 p-4 transition hover:bg-white">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e2dacb] bg-[#edf1dc]">
                      <NewsImage post={post} compact />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8b958d]">{dateText(post.published_at)}</p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#244b3b] transition group-hover:text-[#64805a]">{post.title}</h2>
                    </div>
                  </Link>
                )) : <p className="p-5 text-sm text-[#758279]">Chưa có bài viết.</p>}
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-[#d8ddbf] bg-[#eef2da] p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d9274]">Khám phá Sweet Pea</p>
              <nav className="mt-3 grid divide-y divide-[#d8dfbd] text-sm font-bold text-[#315b47]">
                <Link href="/menu" className="flex items-center justify-between py-3">Menu tại tiệm <ChevronRight size={16} /></Link>
                <Link href="/about" className="flex items-center justify-between py-3">Câu chuyện của tiệm <ChevronRight size={16} /></Link>
                <Link href="/contact" className="flex items-center justify-between py-3">Địa chỉ & liên hệ <ChevronRight size={16} /></Link>
              </nav>
            </section>
          </aside>

          <main className="order-1 min-w-0 lg:order-2">
            <div className="flex flex-col gap-3 border-b border-[#e4ddd0] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#809175]">Sweet Pea Journal</p>
                <h2 style={headingFont} className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#214e3d] sm:text-4xl">Tất cả bản tin</h2>
              </div>
              <Link href="/menu" className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-[#d6cdbd] bg-[#faf6ee] px-4 py-2.5 text-sm font-bold text-[#245943]">
                Xem menu <ArrowRight size={16} />
              </Link>
            </div>

            {posts.length ? (
              <div className="divide-y divide-[#e8e1d5]">
                {posts.map((post) => (
                  <article key={post.id} className="group grid gap-5 py-7 sm:grid-cols-[15rem_minmax(0,1fr)] sm:items-center lg:grid-cols-[17rem_minmax(0,1fr)] lg:py-8">
                    <Link href={`/news/${post.id}`} className="overflow-hidden rounded-[1.45rem] border border-[#ddd5c6] bg-[#f0eadf] p-1.5">
                      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[1.15rem]">
                        <NewsImage post={post} />
                      </div>
                    </Link>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7f8e78]">
                          <CalendarDays size={13} /> {dateText(post.published_at)}
                        </span>
                        {post.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8eed2] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#51705a]">
                            <Sparkles size={11} /> Nổi bật
                          </span>
                        ) : null}
                      </div>
                      <h3 style={headingFont} className="mt-3 text-2xl font-bold leading-tight tracking-[-0.025em] text-[#214e3d] sm:text-3xl">
                        <Link href={`/news/${post.id}`} className="transition hover:text-[#6f8b63]">{post.title}</Link>
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#68776e] sm:text-[0.96rem]">{post.excerpt}</p>
                      <Link href={`/news/${post.id}`} className="focus-ring mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#245943]">
                        Đọc bản tin <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[2rem] border border-dashed border-[#cdd5b4] bg-[#f7f4eb] p-12 text-center text-[#6d7b72]">
                <Leaf className="mx-auto text-[#79916e]" />
                <p className="mt-3 font-bold text-[#315b47]">Tiệm đang chuẩn bị bản tin đầu tiên.</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </PageTransition>
  );
}
