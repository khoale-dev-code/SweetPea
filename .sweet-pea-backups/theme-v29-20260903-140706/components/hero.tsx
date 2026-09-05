import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, Clock3, Sparkles } from "lucide-react";
import type { ShopSettings } from "@/lib/types";

export function Hero({ shop }: { shop: ShopSettings }) {
  return (
    <section id="top" className="paper-texture overflow-hidden border-b border-[#d7d1bf]">
      <div className="container-shell grid min-h-[calc(100svh-76px)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:py-16">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cfd6b0] bg-[#eef2d8] px-4 py-2 text-sm font-semibold text-[#315d48]">
            <Sparkles size={16} aria-hidden="true" />
            {shop.tagline}
          </div>

          <h1 className="font-display text-[clamp(3.35rem,8.5vw,7rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-[#1f4f3b]">
            Một chút ngọt,
            <span className="mt-1 block italic text-[#6f8e62]">một ngày xinh.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#53665b] sm:text-lg">
            {shop.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#245943] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#183f30]"
            >
              Xem menu hôm nay
              <ArrowDownRight size={19} />
            </Link>
            <Link
              href="/contact"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[#bfc9ae] bg-white/60 px-6 font-semibold text-[#245943] transition hover:bg-white"
            >
              Liên hệ đặt bánh
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-3 text-sm font-medium text-[#607267]">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e7edcf] text-[#245943]">
              <Clock3 size={17} />
            </span>
            {shop.opening_text}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[31rem] lg:justify-self-end">
          <div className="absolute -inset-5 rounded-[3.5rem] border border-[#b8c493]/65" aria-hidden="true" />
          <div className="leaf-shadow soft-grid relative aspect-[4/5] overflow-hidden rounded-[3rem] border border-[#d5ccb9] bg-[#e8edcf] p-7 sm:p-10">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#c9d89d]" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-[#fff8eb]" aria-hidden="true" />
            <div className="relative grid h-full place-items-center">
              <div className="w-[82%] -rotate-2 rounded-[2.5rem] bg-[#fff8eb] p-5 shadow-[0_20px_60px_rgba(68,91,66,0.16)] transition duration-500 hover:rotate-0 sm:p-7">
                <Image
                  src="/sweet-pea-logo.png"
                  alt="Logo Tiệm bánh Sweet Pea"
                  width={960}
                  height={960}
                  sizes="(max-width: 768px) 75vw, 420px"
                  priority
                  className="aspect-square w-full rounded-[2rem] object-cover"
                />
              </div>
            </div>
            <span className="absolute bottom-5 right-5 rounded-full bg-[#245943] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
              made with care
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
