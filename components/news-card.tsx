import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { NewsPost } from "@/lib/types";

function dateText(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export function NewsCard({ post, featured = false }: { post: NewsPost; featured?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-[2rem] border border-[#ddd5c5] bg-[#fffced] ${featured ? "md:grid md:grid-cols-[1.15fr_.85fr]" : ""}`}>
      <Link href={`/news/${post.id}`} className="block overflow-hidden bg-[#c7db95]">
        <div className={featured ? "aspect-[16/10] md:h-full md:min-h-[24rem]" : "aspect-[4/3]"}>
          {post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
          ) : (
            <div className="soft-grid grid h-full place-items-center p-8">
              <Image src="/sweet-pea-logo.png" alt="" width={220} height={220} className="w-36 rounded-full border border-[#d8cbb5] opacity-90 sm:w-44" />
            </div>
          )}
        </div>
      </Link>
      <div className={`flex flex-col p-5 sm:p-7 ${featured ? "justify-center lg:p-10" : ""}`}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8d76]">{dateText(post.published_at)}</p>
        <h2 className={`font-display mt-3 font-semibold leading-tight tracking-[-0.035em] text-[#184d39] ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
          <Link href={`/news/${post.id}`} className="hover:text-[#658157]">{post.title}</Link>
        </h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#69776f] sm:text-base">{post.excerpt}</p>
        <Link href={`/news/${post.id}`} className="focus-ring mt-6 inline-flex w-fit items-center gap-2 rounded-full text-sm font-bold text-[#184d39]">
          Đọc bản tin <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
