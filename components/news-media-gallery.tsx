"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Film, Images, Pause, Play } from "lucide-react";
import type { NewsMedia } from "@/lib/types";

type NewsMediaGalleryProps = {
  title: string;
  media: NewsMedia[];
  autoplaySeconds?: number;
};

function uniqueMedia(media: NewsMedia[]) {
  return media.filter(
    (item, index, list) => Boolean(item?.url) && list.findIndex((candidate) => candidate.url === item.url) === index,
  );
}

export function NewsMediaGallery({ title, media, autoplaySeconds = 0 }: NewsMediaGalleryProps) {
  const items = useMemo(() => uniqueMedia(media).slice(0, 12), [media]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [active, items.length]);

  useEffect(() => {
    const current = items[active];
    if (!current || current.type === "video" || paused || autoplaySeconds <= 0 || items.length <= 1) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % items.length), autoplaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [active, autoplaySeconds, items, paused]);

  if (!items.length) return null;
  const current = items[active];

  function previous() {
    setActive((value) => (value - 1 + items.length) % items.length);
  }

  function next() {
    setActive((value) => (value + 1) % items.length);
  }

  return (
    <section
      className="overflow-hidden rounded-[1.8rem] border border-[#184d39]/12 bg-[#fffced] shadow-[0_18px_55px_rgba(24,77,57,0.07)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative flex min-h-[17rem] touch-pan-y items-center justify-center overflow-hidden bg-[#184d39]/[0.045] sm:min-h-[28rem] lg:min-h-[34rem]"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          setPaused(true);
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start == null) return;
          const end = event.changedTouches[0]?.clientX ?? start;
          const delta = end - start;
          if (Math.abs(delta) > 45) delta > 0 ? previous() : next();
          window.setTimeout(() => setPaused(false), 1200);
        }}
      >
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            preload="metadata"
            className="max-h-[42rem] h-full w-full bg-[#102d23] object-contain"
            onPlay={() => setPaused(true)}
            onPause={() => setPaused(false)}
            onEnded={() => {
              if (autoplaySeconds > 0 && items.length > 1) next();
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.url}
            src={current.url}
            alt={`${title} - ${current.type === "gif" ? "GIF" : "ảnh"} ${active + 1}`}
            loading={active === 0 ? "eager" : "lazy"}
            decoding="async"
            className="max-h-[42rem] h-full w-full object-contain"
          />
        )}

        {items.length > 1 ? (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Media trước"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#184d39]/82 text-[#fffced] shadow-lg backdrop-blur transition hover:bg-[#184d39] sm:grid"
            >
              <ChevronLeft size={21} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Media tiếp theo"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#184d39]/82 text-[#fffced] shadow-lg backdrop-blur transition hover:bg-[#184d39] sm:grid"
            >
              <ChevronRight size={21} />
            </button>
          </>
        ) : null}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#184d39]/88 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#fffced] backdrop-blur">
            {current.type === "video" ? <Film size={12} /> : <Images size={12} />}
            {current.type === "video" ? "Video" : current.type === "gif" ? "GIF" : "Hình ảnh"}
          </span>
          {items.length > 1 ? (
            <span className="rounded-full bg-[#fffced]/90 px-3 py-1.5 text-[10px] font-extrabold text-[#184d39] shadow-sm">
              {active + 1}/{items.length}
            </span>
          ) : null}
        </div>

        {autoplaySeconds > 0 && items.length > 1 ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-[#184d39]/10 bg-[#fffced]/92 px-3 text-[10px] font-extrabold text-[#184d39] shadow-sm backdrop-blur"
          >
            {paused || current.type === "video" ? <Play size={12} /> : <Pause size={12} />}
            {paused || current.type === "video" ? "Tiếp tục" : `${autoplaySeconds}s`}
          </button>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="border-t border-[#184d39]/10 bg-[#c7db95]/22 p-3 sm:p-4">
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {items.map((item, index) => (
              <button
                key={`${item.type}-${item.url}`}
                type="button"
                onClick={() => {
                  setActive(index);
                  setPaused(true);
                  window.setTimeout(() => setPaused(false), 1200);
                }}
                aria-label={`Xem media ${index + 1}`}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#fffced] transition sm:h-20 sm:w-28 ${
                  index === active ? "border-[#184d39] shadow-[0_6px_18px_rgba(24,77,57,0.13)]" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <>
                    <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-[#184d39]/18 text-white"><Play size={17} fill="currentColor" /></span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
                {item.type === "gif" ? <span className="absolute bottom-1 right-1 rounded bg-[#184d39]/85 px-1.5 py-0.5 text-[8px] font-extrabold text-white">GIF</span> : null}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold text-[#184d39]/55 sm:hidden">Vuốt ảnh sang trái hoặc phải để xem thêm</p>
        </div>
      ) : null}
    </section>
  );
}
