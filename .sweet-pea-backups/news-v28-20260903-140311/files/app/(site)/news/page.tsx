import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NewsCard } from "@/components/news-card";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts } from "@/lib/store";

export const metadata: Metadata = {
  title: "Bản tin",
  description: "Những câu chuyện, món mới và thông báo từ căn bếp Sweet Pea.",
};

export const revalidate = 60;

export default async function NewsPage() {
  const posts = await getNewsPosts();
  const [featured, ...rest] = posts;

  return (
    <PageTransition>
      <section className="paper-texture border-b border-[#d7d1bf] py-12 sm:py-16">
        <div className="container-shell flex flex-col gap-7 sm:flex-row sm:items-center">
          <Image src="/sweet-pea-logo.png" alt="Sweet Pea" width={132} height={132} priority className="h-28 w-28 rounded-full border-4 border-[#efe1ce] object-cover shadow-sm sm:h-32 sm:w-32" />
          <div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#214e3d] sm:text-5xl">Bản tin Sweet Pea</h1><Link href="/menu" className="focus-ring inline-flex min-h-10 items-center rounded-full border border-[#d6c7b4] bg-[#f8efe4] px-4 text-sm font-semibold text-[#245943]">Xem thực đơn</Link></div><p className="mt-3 text-sm font-semibold text-[#607167]">{posts.length} bài viết · Chuyện mới từ căn bếp</p><p className="mt-3 max-w-xl text-base leading-7 text-[#607167]">Món mới, cách chọn bánh và những câu chuyện nhỏ được Sweet Pea lưu lại ở đây.</p></div>
        </div>
      </section>

      <section className="bg-[#fffdf8] py-14 sm:py-20">
        <div className="container-shell">
          {featured ? <NewsCard post={featured} featured /> : <div className="rounded-[2rem] border border-dashed border-[#ccd4b5] p-12 text-center text-[#67766d]">Tiệm đang chuẩn bị bản tin đầu tiên.</div>}
          {rest.length > 0 && <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((post) => <NewsCard key={post.id} post={post} />)}</div>}
        </div>
      </section>
    </PageTransition>
  );
}
