import type { HomeMedia } from "@/lib/homepage-types";

export function HomeEditableMedia({
  media,
  className,
  eager = false,
}: {
  media: HomeMedia;
  className: string;
  eager?: boolean;
}) {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        aria-label={media.alt || "Sweet Pea video"}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        className={className}
      />
    );
  }

  return (
    // GIF and normal images both render through img so animated GIFs keep playing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={media.alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
