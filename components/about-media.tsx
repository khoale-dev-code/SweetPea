import type { AboutMedia as AboutMediaValue } from "@/lib/about-page-types";

export function AboutMedia({
  media,
  className = "",
  priority = false,
}: {
  media: AboutMediaValue;
  className?: string;
  priority?: boolean;
}) {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        aria-label={media.alt}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        className={className}
      />
    );
  }

  return (
    // About media can be local, Cloudinary, GIF, or another admin-provided URL.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={media.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
