"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function optimizedImage(url: string) {
  if (!url.includes("res.cloudinary.com") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto:good,w_1400/");
}

function uniqueImages(images: string[]) {
  return [...new Set(images.map((image) => image.trim()).filter(Boolean))];
}

export function ProductImageCarousel({
  images,
  alt,
  autoplaySeconds = 0,
  className = "",
  imageClassName = "object-contain",
  showArrows = true,
  showDots = true,
  priority = false,
}: {
  images: string[];
  alt: string;
  autoplaySeconds?: number;
  className?: string;
  imageClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  priority?: boolean;
}) {
  const safeImages = useMemo(() => uniqueImages(images), [images]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, safeImages.length - 1)));
  }, [safeImages.length]);

  useEffect(() => {
    if (safeImages.length <= 1 || autoplaySeconds <= 0 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeImages.length);
    }, Math.max(2, autoplaySeconds) * 1000);
    return () => window.clearInterval(timer);
  }, [autoplaySeconds, paused, safeImages.length]);

  if (!safeImages.length) return null;

  const previous = () => setIndex((current) => (current - 1 + safeImages.length) % safeImages.length);
  const next = () => setIndex((current) => (current + 1) % safeImages.length);

  return (
    <div
      className={`group/gallery relative h-full w-full overflow-hidden bg-[#fffced] ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX ?? start;
        touchStartX.current = null;
        if (start !== null && end !== null) {
          const delta = end - start;
          if (Math.abs(delta) >= 42) {
            if (delta < 0) next();
            else previous();
          }
        }
        window.setTimeout(() => setPaused(false), 700);
      }}
      aria-roledescription="carousel"
      aria-label={`Hình ảnh ${alt}`}
    >
      {safeImages.map((src, imageIndex) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${imageIndex}`}
          src={optimizedImage(src)}
          alt={imageIndex === index ? alt : ""}
          loading={priority && imageIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full select-none transition-all duration-500 ${imageClassName} ${
            imageIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[0.985] opacity-0"
          }`}
        />
      ))}

      {safeImages.length > 1 && showArrows ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              previous();
            }}
            className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#184d39]/12 bg-[#fffced]/92 text-[#184d39] opacity-100 shadow-sm backdrop-blur transition hover:bg-white sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:group-focus-within/gallery:opacity-100"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#184d39]/12 bg-[#fffced]/92 text-[#184d39] opacity-100 shadow-sm backdrop-blur transition hover:bg-white sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:group-focus-within/gallery:opacity-100"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight size={17} />
          </button>
        </>
      ) : null}

      {safeImages.length > 1 && showDots ? (
        <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#184d39]/68 px-2.5 py-1.5 backdrop-blur">
          {safeImages.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIndex(dotIndex);
              }}
              className={`h-1.5 rounded-full transition-all ${dotIndex === index ? "w-5 bg-[#fffced]" : "w-1.5 bg-[#fffced]/55"}`}
              aria-label={`Xem ảnh ${dotIndex + 1}`}
              aria-current={dotIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}

      {safeImages.length > 1 ? (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-[#184d39]/72 px-2.5 py-1 text-[10px] font-bold tabular-nums text-[#fffced] backdrop-blur">
          {index + 1}/{safeImages.length}
        </span>
      ) : null}
    </div>
  );
}
