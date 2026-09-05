import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { getNewsPosts } from "@/lib/store";

type NewsDetailProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { id } = await params;
  const post = (await getNewsPosts()).find((item) => item.id === id);
  return post ? { title: post.title, description: post.excerpt } : { title: "Không tìm thấy bản tin" };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { id } = await params;
  const post = (await getNewsPosts()).find((item) => item.id === id);
  if (!post) notFound();

  return (
    <PageTransition>
      <article className="paper-texture py-12 sm:py-20">
        <div className="container-shell max-w-4xl">
          <Link href="/news" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-[#567064]"><ArrowLeft size={17} /> Quay lại bản tin</Link>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-[#77906d]">Bản tin Sweet Pea</p>
          <h1 className="font-display mt-3 text-[clamp(2.7rem,7vw,5.3rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#214e3d]">{post.title}</h1>
          <p className="mt-5 text-sm font-medium text-[#77857c]">{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(post.published_at))}</p>
          <div className="mt-9 aspect-[16/9] overflow-hidden rounded-[2.5rem] border border-[#d9d1c1] bg-[#e5ebca]">{post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
          ) : <div className="soft-grid grid h-full place-items-center"><Image src="/sweet-pea-logo.png" alt="" width={260} height={260} className="w-40 rounded-full sm:w-52" /></div>}</div>
          <div className="mt-10 whitespace-pre-line text-[1.05rem] leading-9 text-[#52665b]">{post.content}</div>
        </div>
      </article>
    </PageTransition>
  );
}
