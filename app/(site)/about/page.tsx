import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Coffee,
  Heart,
  Leaf,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AboutMedia } from "@/components/about-media";
import { PageTransition } from "@/components/page-transition";
import { getAboutPageContent } from "@/lib/about-page-store";
import { getShopSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Khám phá câu chuyện, không gian sân vườn và những khoảnh khắc dịu dàng tại Sweet Pea.",
};

export const revalidate = 60;

const highlightIcons = [Leaf, Coffee, Heart];

/* ---------------------------------------------------------------------- */
/*  Shared brand motif — same four-petal blossom used on the homepage,    */
/*  kept as the one recurring accent shape instead of mixing in new ones. */
/* ---------------------------------------------------------------------- */

function PetalMark({
  className = "h-4 w-4",
  centerColor = "#F6CBD9",
}: {
  className?: string;
  centerColor?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="6.5" r="4.4" fill="currentColor" />
      <circle cx="12" cy="17.5" r="4.4" fill="currentColor" />
      <circle cx="6.5" cy="12" r="4.4" fill="currentColor" />
      <circle cx="17.5" cy="12" r="4.4" fill="currentColor" />
      <circle cx="12" cy="12" r="3.1" fill={centerColor} />
    </svg>
  );
}

function LaceDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto mb-8 flex max-w-[220px] items-center gap-3"
    >
      <span className="h-px flex-1 border-t border-dashed border-[#184d39]/22" />
      <PetalMark className="h-5 w-5 shrink-0 text-[#C97B95]" />
      <span className="h-px flex-1 border-t border-dashed border-[#184d39]/22" />
    </div>
  );
}

export default async function AboutPage() {
  const [shop, content] = await Promise.all([
    getShopSettings(),
    getAboutPageContent(),
  ]);

  return (
    <PageTransition>
      <main
        data-about-page-version="5.0-floral"
        className="overflow-hidden bg-[#fffced] text-[#184d39]"
      >
        {/* ---------------------------------------------------------- HERO */}
        <section className="relative border-b border-[#184d39]/8">
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#c7db95]/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#E4EDC9]/70 blur-3xl" />

          <div className="container-shell relative grid gap-8 py-10 sm:py-14 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-14 lg:py-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#184d39]/9 bg-[#c7db95]/55 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#184d39]">
                <PetalMark className="h-4 w-4 text-[#C97B95]" />
                {content.hero.eyebrow}
              </span>

              <h1 className="font-display mt-5 text-[clamp(3rem,6.2vw,5.4rem)] font-bold leading-[0.94] tracking-[-0.055em] text-[#184d39]">
                {content.hero.title}
                <span className="mt-1 block font-normal italic text-[#C97B95] underline decoration-wavy decoration-2 decoration-[#F6CBD9] underline-offset-[10px]">
                  {content.hero.accent}
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-8 text-[#184d39]/62 sm:text-base">
                {content.hero.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <a
                  href="#khong-gian"
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-extrabold text-[#fffced] shadow-[0_12px_28px_rgba(24,77,57,.14)] transition hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  {content.hero.primary_label}
                  <Leaf size={15} />
                </a>
                <Link
                  href="/menu"
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C97B95]/30 bg-white/65 px-5 text-sm font-extrabold text-[#184d39] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {content.hero.secondary_label}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[410px] sm:min-h-[500px] lg:min-h-[540px]">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[#184d39]/10 bg-[#dfe8be] shadow-[0_28px_70px_rgba(24,77,57,.14)] sm:rounded-[2.5rem]">
                <AboutMedia
                  media={content.hero.media}
                  priority
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.015]"
                />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#173f31]/62 via-[#173f31]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#dcebb0]">
                    Sweet Pea Garden
                  </p>
                  <p className="font-display mt-1 text-2xl font-bold sm:text-3xl">
                    {content.hero.badge_text}
                  </p>
                </div>
              </div>

              <div className="absolute -left-3 top-5 z-10 hidden max-w-[190px] rotate-[-2deg] rounded-[1.4rem] border-2 border-dashed border-[#184d39]/12 bg-[#fffced]/95 p-4 shadow-[0_16px_42px_rgba(24,77,57,.14)] backdrop-blur sm:block lg:-left-8">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F6CBD9] text-[#184d39]">
                  <Sparkles size={17} />
                </span>
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/50">
                  {content.hero.badge_title}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-[#184d39]">
                  {content.hero.badge_text}
                </p>
              </div>

              <PetalMark className="pointer-events-none absolute -bottom-3 right-6 hidden h-8 w-8 text-[#C7DB95] sm:block" />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- STORY */}
        <section className="bg-[#fffced] py-12 sm:py-16 lg:py-20">
          <div className="container-shell">
            <LaceDivider />

            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#184d39]/50">
                  <Leaf size={14} className="text-[#78906d]" />
                  {content.story.eyebrow}
                </p>
                <h2 className="font-display mt-3 text-[2.45rem] font-bold leading-[1] tracking-[-0.04em] text-[#184d39] sm:text-[3.25rem]">
                  {content.story.title}
                </h2>
                <div className="mt-5 space-y-4 text-[14px] leading-7 text-[#184d39]/58 sm:text-[15px]">
                  <p>{content.story.paragraph_1}</p>
                  <p>{content.story.paragraph_2}</p>
                  <p>{content.story.paragraph_3}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <figure className="relative min-h-[360px] overflow-hidden rounded-[1.8rem] border border-[#184d39]/9 bg-[#c7db95]/20 sm:min-h-[460px]">
                  <AboutMedia
                    media={content.story.media_left}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fffced]/90 text-[#184d39] shadow-sm">
                    <PetalMark className="h-4 w-4" />
                  </span>
                </figure>
                <figure className="relative mt-9 min-h-[330px] overflow-hidden rounded-[1.8rem] border border-[#184d39]/9 bg-[#E4EDC9]/45 sm:mt-14 sm:min-h-[410px]">
                  <AboutMedia
                    media={content.story.media_right}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- HIGHLIGHTS */}
        <section className="border-y border-[#184d39]/8 bg-[#c7db95]/40 py-9 sm:py-11">
          <div className="container-shell grid gap-3.5 md:grid-cols-3">
            {content.highlights.map((item, index) => {
              const Icon = highlightIcons[index] || Sparkles;
              return (
                <article
                  key={`${item.title}-${index}`}
                  className="group rounded-[1.5rem] border border-dashed border-[#184d39]/16 bg-[#fffced]/85 p-5 shadow-[0_10px_28px_rgba(24,77,57,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#C97B95]/35 hover:shadow-[0_16px_34px_rgba(24,77,57,.08)]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[#c7db95] text-[#184d39] transition group-hover:-rotate-6">
                    <Icon size={19} />
                  </span>
                  <h3 className="font-display mt-4 text-xl font-bold text-[#184d39]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[#184d39]/55">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------- GALLERY */}
        <section id="khong-gian" className="bg-[#fffced] py-12 sm:py-16 lg:py-20">
          <div className="container-shell">
            <LaceDivider />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#184d39]/50">
                  <PetalMark className="h-4 w-4 text-[#C97B95]" />
                  {content.gallery.eyebrow}
                </p>
                <h2 className="font-display mt-2 text-[2.4rem] font-bold tracking-[-0.04em] text-[#184d39] sm:text-[3.15rem]">
                  {content.gallery.title}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#184d39]/52 sm:text-right">
                {content.gallery.description}
              </p>
            </div>

            <div className="grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[240px] lg:grid-cols-12 lg:auto-rows-[230px]">
              {content.gallery.items.map((item, index) => {
                const layout =
                  index === 0
                    ? "col-span-2 lg:col-span-5 lg:row-span-2"
                    : index === 1
                      ? "col-span-2 sm:col-span-1 lg:col-span-4"
                      : index === 2
                        ? "col-span-2 sm:col-span-1 lg:col-span-3"
                        : index === 3
                          ? "col-span-2 sm:col-span-1 lg:col-span-4"
                          : "col-span-2 sm:col-span-1 lg:col-span-3";

                return (
                  <figure
                    key={item.id}
                    className={`group relative overflow-hidden rounded-[1.4rem] border border-dashed border-[#184d39]/16 bg-[#c7db95]/18 shadow-[0_12px_30px_rgba(24,77,57,.06)] ${layout}`}
                  >
                    <AboutMedia
                      media={item.media}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#173f31]/30 via-transparent to-transparent" />
                    {index === 0 ? (
                      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fffced]/90 text-[#184d39] shadow-sm">
                        <PetalMark className="h-4 w-4" />
                      </span>
                    ) : null}
                    {item.caption ? (
                      <figcaption className="absolute bottom-3 left-3 rounded-full bg-[#fffced]/90 px-3 py-1.5 text-[10px] font-extrabold text-[#184d39] backdrop-blur">
                        {item.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- QUOTE */}
        <section className="bg-[#fffced] pb-12 sm:pb-16 lg:pb-20">
          <div className="container-shell">
            <div className="relative min-h-[260px] overflow-hidden rounded-[1.8rem] border border-[#184d39]/9 sm:min-h-[320px] sm:rounded-[2.2rem]">
              <AboutMedia
                media={content.quote.media}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#173f31]/58" />
              <PetalMark className="pointer-events-none absolute right-6 top-6 h-8 w-8 text-white/25" />
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
                <div className="max-w-3xl">
                  <Coffee className="mx-auto text-[#c7db95]" size={25} />
                  <blockquote className="font-display mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.9rem]">
                    “{content.quote.text}”
                  </blockquote>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/74">
                    {content.quote.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- INFO STRIP */}
        <section className="border-t border-[#184d39]/8 bg-[#c7db95]/25 py-8 sm:py-10">
          <div className="container-shell grid gap-3 lg:grid-cols-[1fr_1.1fr_1.25fr]">
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-[#184d39]/7 bg-[#fffced]/85 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#c7db95] text-[#184d39]">
                <Clock3 size={18} />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#184d39]/50">Mở cửa</p>
                <p className="mt-1 font-display text-lg font-bold text-[#184d39]">{shop.opening_text || "Mở cửa mỗi ngày"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.4rem] border border-[#184d39]/7 bg-[#fffced]/85 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F6CBD9] text-[#184d39]">
                <PetalMark className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#184d39]/50">Không gian</p>
                <p className="mt-1 font-display text-lg font-bold text-[#184d39]">Trong nhà &amp; sân vườn</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-[1.4rem] bg-[#184d39] p-4 text-white sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/12 text-[#c7db95]">
                  <MapPin size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#c7db95]">Chúng tôi ở đây</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/88">{shop.address}</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c7db95] px-4 text-xs font-extrabold text-[#184d39] transition hover:bg-[#fffced]"
              >
                Xem đường đi
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}