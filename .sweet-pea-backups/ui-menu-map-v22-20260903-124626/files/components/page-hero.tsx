type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="paper-texture border-b border-[#d7d1bf] py-14 sm:py-20">
      <div className="container-shell">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">{eyebrow}</p>
        <h1 className="font-display mt-3 max-w-4xl text-[clamp(2.75rem,7vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#214e3d]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#607167] sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
