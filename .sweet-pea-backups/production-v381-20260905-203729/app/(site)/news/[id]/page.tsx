import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Film, Images, Sparkles } from "lucide-react";
import { NewsMediaGallery } from "@/components/news-media-gallery";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts } from "@/lib/store";
import type { NewsMedia, NewsPost } from "@/lib/types";

type NewsDetailProps = { params: Promise<{ id: string }> };

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

function dateText(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function inferMedia(url: string): NewsMedia {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".gif")) return { type: "gif", url };
  if (/\.(mp4|webm|mov|m4v|ogv|ogg)$/i.test(clean)) return { type: "video", url };
  return { type: "image", url };
}

function postMedia(post: NewsPost) {
  const media = [...(post.media || [])];
  if (post.image_url && !media.some((item) => item.url === post.image_url)) media.unshift(inferMedia(post.image_url));
  return media.filter((item, index, list) => Boolean(item.url) && list.findIndex((candidate) => candidate.url === item.url) === index);
}

function RelatedPreview({ post }: { post: NewsPost }) {
  const media = postMedia(post);
  const cover = post.image_url ? media.find((item) => item.url === post.image_url) || inferMedia(post.image_url) : media[0];
  if (!cover) return <div className="soft-grid grid h-full place-items-center bg-[#c7db95]/38 p-5"><Image src="/sweet-pea-logo.png" alt="Sweet Pea" width={120} height={120} className="w-16 rounded-full opacity-90" /></div>;
  if (cover.type === "video") return <div className="relative h-full w-full"><video src={cover.url} muted playsInline preload="metadata" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-[#184d39]/14 text-white"><Film size={20} /></span></div>;
  return <img src={cover.url} alt={post.title} loading="lazy" className="h-full w-full object-cover" />;
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

  const media = postMedia(post);
  const related = posts.filter((item) => item.id !== post.id).slice(0, 3);
  const videoCount = media.filter((item) => item.type === "video").length;

  return (
    <PageTransition>
      <article className="bg-[#fffced]">
        <header className="relative overflow-hidden border-b border-[#184d39]/10 bg-[#fffced]">
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#c7db95]/45 blur-3xl" />
          <div className="container-shell relative py-10 sm:py-14 lg:py-16">
            <Link href="/news" className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#184d39]/12 bg-white/65 px-4 py-2.5 text-sm font-bold text-[#184d39]"><ArrowLeft size={16} /> Quay lại Bản tin</Link>
            <div className="mt-8 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/50">
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {dateText(post.published_at)}</span>
                {post.is_featured ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c7db95]/55 px-2.5 py-1 text-[#184d39]"><Sparkles size={12} /> Nổi bật</span> : null}
                {media.length > 1 ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#184d39]/10 bg-white px-2.5 py-1 text-[#184d39]/60"><Images size={12} /> {media.length} media</span> : null}
                {videoCount ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#184d39] px-2.5 py-1 text-white"><Film size={12} /> {videoCount} video</span> : null}
              </div>
              <h1 style={headingFont} className="mt-4 text-[clamp(2.8rem,7vw,5.7rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#184d39]">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#184d39]/62 sm:text-lg">{post.excerpt}</p>
            </div>
          </div>
        </header>

        <div className="container-shell grid gap-9 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-12 lg:py-16">
          <main className="min-w-0">
            {media.length ? (
              <NewsMediaGallery title={post.title} media={media} autoplaySeconds={post.media_autoplay_seconds || 0} />
            ) : (
              <div className="soft-grid grid min-h-[22rem] place-items-center rounded-[1.8rem] border border-[#184d39]/10 bg-[#c7db95]/32">
                <Image src="/sweet-pea-logo.png" alt="Sweet Pea" width={240} height={240} className="w-36 rounded-full sm:w-48" />
              </div>
            )}

            <div className="mx-auto mt-9 max-w-3xl whitespace-pre-line text-[1.03rem] leading-9 text-[#184d39]/72 sm:text-[1.08rem]">
              {post.content}
            </div>
          </main>

          <aside className="grid gap-4 lg:sticky lg:top-24">
            <div className="rounded-[1.6rem] border border-[#184d39]/10 bg-[#c7db95]/28 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#184d39]/52">Đọc tiếp</p>
              <h2 style={headingFont} className="mt-2 text-2xl font-bold text-[#184d39]">Chuyện khác từ tiệm</h2>
            </div>
            {related.map((item) => {
              const itemMedia = postMedia(item);
              return (
                <Link key={item.id} href={`/news/${item.id}`} className="group overflow-hidden rounded-[1.5rem] border border-[#184d39]/10 bg-white/48">
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-[#184d39]/10 bg-[#c7db95]/20">
                    <RelatedPreview post={item} />
                    {itemMedia.length > 1 ? <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[#184d39]/88 px-2 py-1 text-[9px] font-bold text-white"><Images size={10} /> {itemMedia.length}</span> : null}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#184d39]/45">{dateText(item.published_at)}</p>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-[#184d39]">{item.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#184d39]">Đọc bài <ArrowRight size={13} /></span>
                  </div>
                </Link>
              );
            })}
          </aside>
        </div>
      </article>
    </PageTransition>
  );
}
