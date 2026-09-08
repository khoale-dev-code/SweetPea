import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";
import { HomeEditableMedia } from "@/components/home-editable-media";
import type { HomeSpaceContent } from "@/lib/homepage-types";

const headingFont = { fontFamily: 'Cambria, "Times New Roman", serif' };

function MediaCaption({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <figcaption className={small ? "absolute bottom-3 left-3 rounded-full bg-[#fffced]/90 px-2.5 py-1 text-[11px] font-bold text-[#184d39] backdrop-blur-sm" : "absolute bottom-3 left-3 rounded-full border border-white/30 bg-[#fffced]/92 px-3 py-1.5 text-xs font-bold text-[#184d39] shadow-sm backdrop-blur-sm"}>
      {children}
    </figcaption>
  );
}

export function HomeSpaceEditable({ content }: { content: HomeSpaceContent }) {
  return (
    <section data-home-section="space-admin" className="relative overflow-hidden border-y border-[#184d39]/10 bg-[#fbf2df] py-14 sm:py-16 lg:py-20">
      <div className="container-shell">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-10 xl:gap-12">
            <div className="max-w-[470px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ef9dc0]/35 bg-white/70 px-3 py-1.5">
                <Flower2 size={13} className="text-[#ef9dc0]" />
                <span className="text-[11px] font-bold text-[#b5487a]">{content.eyebrow}</span>
              </div>

              <h2 style={headingFont} className="mt-4 max-w-[430px] text-[2.35rem] font-bold leading-[0.98] tracking-[-0.045em] text-[#184d39] sm:text-[3rem] lg:text-[3.35rem]">
                {content.title}
              </h2>

              <p className="mt-5 max-w-[440px] text-[15px] leading-7 text-[#184d39]/66 sm:text-base sm:leading-8">
                {content.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {content.chips.map((label, index) => (
                  <span key={`${label}-${index}`} className={index === 1 ? "rounded-full border border-[#ef9dc0]/40 bg-[#fbdce9]/50 px-3 py-1.5 text-xs font-semibold text-[#b5487a]" : "rounded-full border border-[#184d39]/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#184d39]/68"}>
                    {label}
                  </span>
                ))}
              </div>

              <Link href={content.cta_href} className="focus-ring group mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-bold text-[#fffced] shadow-[0_10px_28px_rgba(24,77,57,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]">
                {content.cta_label}
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:h-[470px] lg:grid-cols-[1.16fr_0.84fr] lg:grid-rows-2 lg:gap-4">
              <figure className="group relative col-span-2 aspect-[16/10] overflow-hidden rounded-[1.65rem] border-4 border-white bg-[#e8eddb] shadow-[0_18px_55px_rgba(24,77,57,0.1)] lg:col-span-1 lg:row-span-2 lg:aspect-auto">
                <HomeEditableMedia media={content.main_media} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#123e2e]/38 to-transparent" />
                <MediaCaption>{content.main_label}</MediaCaption>
              </figure>

              <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border-4 border-white bg-[#e8eddb] shadow-[0_14px_38px_rgba(24,77,57,0.08)] lg:aspect-auto">
                <HomeEditableMedia media={content.top_media} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#123e2e]/32 to-transparent" />
                <MediaCaption small>{content.top_label}</MediaCaption>
              </figure>

              <figure className="group relative aspect-square overflow-hidden rounded-[1.5rem] border-4 border-white bg-[#e8eddb] shadow-[0_14px_38px_rgba(24,77,57,0.08)] lg:aspect-auto">
                <HomeEditableMedia media={content.bottom_media} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#123e2e]/32 to-transparent" />
                <MediaCaption small>{content.bottom_label}</MediaCaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
