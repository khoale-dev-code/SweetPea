import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts } from "@/lib/store";
import type { NewsPost } from "@/lib/types";

type NewsDetailProps = { params: Promise<{ id: string }> };

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

function dateText(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function optimizeCloudinary(url: string, width = 1500) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
}

function RelatedImage({ post }: { post: NewsPost }) {
  if (post.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={optimizeCloudinary(post.image_url, 640)} alt={post.title} loading="lazy" className="h-full w-full object-contain" />
    );
  }
  return (
    <div className="soft-grid grid h-full place-items-center bg-[#c7db95] p-5">
      <Image src="/sweet-pea-logo.png" alt="Sweet Pea" width={120} height={120} className="w-16 rounded-full opacity-90" />
    </div>
  );
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { id } = await params;
  const post = (await getNewsPosts()).find((item) => item.id === id);
  return post ? { title: post.title, description: post.excerpt } : { title: "Không tìm thấy bản tin" };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { id } = await params;
  const posts = await getNewsPosts();
  const post = posts.find((item) => item.id === id);
  if (!post) notFound();

  const related = posts.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <PageTransition>
      <article className="bg-[#fffced]">
        <header className="relative overflow-hidden border-b border-[#ddd5c6] bg-[#fffced]">
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#c7db95]/55 blur-3xl" />
          <div className="container-shell relative py-10 sm:py-14 lg:py-16">
            <Link href="/news" className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#d7cfbf] bg-white/65 px-4 py-2.5 text-sm font-bold text-[#496456]">
              <ArrowLeft size={16} /> Quay lại Bản tin
            </Link>
            <div className="mt-8 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7d8e76]">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {dateText(post.published_at)}</span>
                {post.is_featured ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c7db95] px-2.5 py-1 text-[#55725b]"><Sparkles size={12} /> Nổi bật</span> : null}
              </div>
              <h1 style={headingFont} className="mt-4 text-[clamp(2.8rem,7vw,5.8rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#184d39]">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#617268] sm:text-lg">{post.excerpt}</p>
            </div>
          </div>
        </header>

        <div className="container-shell grid gap-9 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-12 lg:py-16">
          <main className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#f1ebe0] p-2 shadow-[0_18px_55px_rgba(49,70,57,0.06)]">
              <div className="flex min-h-[16rem] items-center justify-center overflow-hidden rounded-[1.55rem] sm:min-h-[24rem]">
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optimizeCloudinary(post.image_url)} alt={post.title} className="max-h-[44rem] w-full object-contain" />
                ) : (
                  <div className="soft-grid grid min-h-[24rem] w-full place-items-center bg-[#c7db95]">
                    <Image src="/sweet-pea-logo.png" alt="Sweet Pea" width={240} height={240} className="w-36 rounded-full sm:w-48" />
                  </div>
                )}
              </div>
            </div>

            <div className="mx-auto mt-9 max-w-3xl whitespace-pre-line text-[1.03rem] leading-9 text-[#52665b] sm:text-[1.08rem]">
              {post.content}
            </div>
          </main>

          <aside className="grid gap-4 lg:sticky lg:top-24">
            <div className="rounded-[1.6rem] border border-[#c7db95] bg-[#c7db95] p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7d9274]">Đọc tiếp</p>
              <h2 style={headingFont} className="mt-2 text-2xl font-bold text-[#184d39]">Chuyện khác từ tiệm</h2>
            </div>
            {related.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group overflow-hidden rounded-[1.5rem] border border-[#ddd5c5] bg-[#fffced]">
                <div className="flex aspect-[16/9] items-center justify-center border-b border-[#e4ddcf] bg-[#efeadf]">
                  <RelatedImage post={item} />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#87928a]">{dateText(item.published_at)}</p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#184d39]">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#55725c]">Đọc bài <ArrowRight size={13} /></span>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </article>
    </PageTransition>
  );
}
