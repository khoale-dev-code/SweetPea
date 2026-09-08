import Link from "next/link";
import { ArrowRight, CakeSlice, Clock3, Flower2, Heart, Leaf, MapPin, Sparkles } from "lucide-react";
import { HomeEditableMedia } from "@/components/home-editable-media";
import type { HomeHeroContent } from "@/lib/homepage-types";

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

function FlowerMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="11" r="7" fill="#f3b8d3" />
      <circle cx="29" cy="20" r="7" fill="#f3b8d3" />
      <circle cx="20" cy="29" r="7" fill="#f3b8d3" />
      <circle cx="11" cy="20" r="7" fill="#f3b8d3" />
      <circle cx="20" cy="20" r="6" fill="#fce4ee" />
    </svg>
  );
}

function GardenDivider() {
  const icons = [Flower2, Leaf, Heart, Flower2, Leaf];
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center gap-6 py-2 opacity-70">
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#184d39]/15" />
      {icons.map((Icon, index) => (
        <Icon
          key={index}
          size={index === 2 ? 18 : 14}
          className={index % 2 === 0 ? "text-[#ef9dc0]" : "text-[#8ba573]"}
          style={{ animation: "sp-bounce-soft 2.4s ease-in-out infinite", animationDelay: `${index * 0.15}s` }}
        />
      ))}
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#184d39]/15" />
    </div>
  );
}

export function HomeHeroEditable({ content }: { content: HomeHeroContent }) {
  const chipIcons = [Clock3, CakeSlice, Heart];

  return (
    <section data-home-section="hero-admin" className="relative overflow-hidden bg-gradient-to-b from-[#fdf3e5] via-[#fffced] to-[#fffced]">
      <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#f3b8d3]/25 blur-3xl [animation:sp-blob_10s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-[#c7db95]/30 blur-3xl [animation:sp-blob_12s_ease-in-out_infinite_reverse]" />
      <FlowerMark className="pointer-events-none absolute left-[6%] top-[14%] h-10 w-10 rotate-[-12deg] opacity-70 sm:h-14 sm:w-14 [animation:sp-float_5s_ease-in-out_infinite]" />
      <FlowerMark className="pointer-events-none absolute right-[8%] top-[62%] h-8 w-8 rotate-[18deg] opacity-50 sm:h-10 sm:w-10 [animation:sp-float_6s_ease-in-out_infinite_0.8s]" />

      <div className="container-shell relative py-10 sm:py-14 lg:py-16 xl:py-20">
        <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 xl:gap-16">
          <div className="max-w-[560px] [animation:sp-fade-up_0.7s_ease-out_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ef9dc0]/35 bg-white/70 px-3.5 py-2 text-xs font-bold text-[#b5487a] shadow-sm backdrop-blur-sm">
              <Flower2 size={15} className="text-[#ef9dc0] [animation:sp-twinkle_2.6s_ease-in-out_infinite]" />
              {content.eyebrow}
            </div>

            <h1 style={headingFont} className="mt-5 max-w-[560px] text-[clamp(3rem,5.2vw,5.15rem)] font-bold leading-[0.9] tracking-[-0.052em] text-[#184d39]">
              {content.title}
              <span className="mt-1.5 block text-[0.72em] font-normal italic leading-[0.98] tracking-[-0.035em] text-[#8a5f79]">
                {content.accent_title}
              </span>
            </h1>

            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#184d39]/65 sm:text-base sm:leading-8">
              {content.description}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href={content.primary_href} className="focus-ring group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] shadow-[0_10px_28px_rgba(24,77,57,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]">
                {content.primary_label}
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link href={content.secondary_href} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#ef9dc0]/50 bg-white/60 px-5 text-sm font-bold text-[#184d39] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ef9dc0] hover:bg-white">
                {content.secondary_label} <Leaf size={16} className="text-[#8ba573]" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {content.chips.map((label, index) => {
                const Icon = chipIcons[index];
                const accent = index === 2;
                return (
                  <div key={`${label}-${index}`} className={accent ? "inline-flex min-h-9 items-center gap-2 rounded-full border border-[#ef9dc0]/30 bg-[#fbdce9]/45 px-3.5 text-xs font-semibold text-[#b5487a]" : "inline-flex min-h-9 items-center gap-2 rounded-full border border-[#184d39]/10 bg-white/55 px-3.5 text-xs font-semibold text-[#184d39]/75"}>
                    <Icon size={14} className={accent ? "text-[#ef9dc0]" : "text-[#184d39]"} />
                    <span className="max-w-[220px] truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none [animation:sp-fade-up_0.8s_ease-out_0.15s_both]">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border-4 border-white bg-[#e8eddb] shadow-[0_28px_70px_rgba(24,77,57,0.18)] sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[560px]">
              <HomeEditableMedia media={content.main_media} eager className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#123e2e]/50 via-[#123e2e]/10 to-transparent" />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#fffced]/92 px-3 py-1.5 text-xs font-bold text-[#184d39] shadow-sm backdrop-blur-sm">
                <MapPin size={13} /> {content.media_label}
              </div>
            </div>

            <div className="absolute -left-5 -top-5 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#e8eddb] shadow-[0_14px_30px_rgba(24,77,57,0.2)] sm:h-28 sm:w-28 lg:-left-8 lg:-top-8 lg:h-32 lg:w-32 [animation:sp-float_5s_ease-in-out_infinite]">
              <HomeEditableMedia media={content.bubble_media} className="h-full w-full object-cover" />
            </div>

            <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-2xl border-2 border-[#f3b8d3] bg-white px-3.5 py-2.5 shadow-[0_14px_30px_rgba(181,72,122,0.18)] sm:-right-6 sm:px-4 sm:py-3 [animation:sp-float_4.5s_ease-in-out_infinite_0.3s]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbdce9] text-[#b5487a]">
                <Sparkles size={16} className="[animation:sp-twinkle_2.2s_ease-in-out_infinite]" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-[#184d39]">{content.sticker_title}</p>
                <p className="text-[11px] text-[#184d39]/55">{content.sticker_text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GardenDivider />
    </section>
  );
}
