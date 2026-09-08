import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CakeSlice,
  Cat,
  Coffee,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  MoonStar,
  Navigation,
  Phone,
  SunMedium,
} from "lucide-react";
import {
  ContactFloat,
  ContactHoverCard,
  ContactReveal,
} from "@/components/contact-motion";
import { PageTransition } from "@/components/page-transition";
import { getShopSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ Sweet Pea để đặt bánh, hỏi menu, xem giờ mở cửa và đường đến tiệm.",
};

export const revalidate = 60;

const MAP_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=11.3037693%2C106.0845314";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.4228900511307!2d106.08453139999999!3d11.303769299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b005115731b%3A0xf0764ae590819fde!2zVGnhu4dtIGLDoW5oIFN3ZWV0IFBlYQ!5e0!3m2!1svi!2s!4v1788413933411!5m2!1svi!2s";

const headingFont = {
  fontFamily: 'Cambria, "Times New Roman", serif',
};

const OPEN_TIME = "07:30";
const CLOSE_TIME = "22:00";

/* ---------------------------------------------------------------------- */
/*  Same four-petal blossom used across the site — the one recurring      */
/*  accent shape, reused here instead of introducing new ornaments.       */
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

export default async function ContactPage() {
  const shop = await getShopSettings();
  const phoneHref = `tel:${shop.phone.replace(/[^0-9+]/g, "")}`;
  const zaloHref = shop.zalo_url || "https://zalo.me/0328243949";

  const contacts = [
    {
      icon: Phone,
      label: "Điện thoại",
      value: shop.phone,
      note: "Tư vấn & đặt bánh nhanh chóng",
      href: phoneHref,
      accent: "bg-[#E4EDC9] text-[#184d39]",
    },
    {
      icon: MessageCircle,
      label: "Zalo",
      value: "Nhắn tiệm để đặt món",
      note: "Tụi mình phản hồi sớm nhất có thể",
      href: zaloHref,
      accent: "bg-[#F6CBD9] text-[#184d39]",
    },
    {
      icon: Mail,
      label: "Email",
      value: shop.email,
      note: "Gửi góp ý hoặc câu hỏi cho tụi mình",
      href: `mailto:${shop.email}`,
      accent: "bg-[#C7DB95] text-[#184d39]",
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: shop.address,
      note: "Hẹn gặp bạn tại Sweet Pea",
      href: MAP_DIRECTIONS_URL,
      accent: "bg-[#F3ECD9] text-[#184d39]",
    },
  ];

  return (
    <PageTransition>
      <main
        data-contact-page-version="5.1-floral"
        className="overflow-hidden bg-[#fffced] text-[#184d39]"
      >
        {/* ---------------------------------------------------------- HERO */}
        <section className="relative border-b border-[#184d39]/8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 86% 12%, rgba(199,219,149,.4), transparent 28rem), linear-gradient(180deg, #fffced 0%, #fffaf0 100%)",
            }}
          />

          <div className="container-shell relative grid min-h-[610px] gap-10 py-12 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:py-20">
            <ContactReveal className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C97B95]/30 bg-[#F6CBD9]/35 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#184d39] shadow-sm backdrop-blur">
                <PetalMark className="h-4 w-4 text-[#C97B95]" />
                Liên hệ Sweet Pea
              </div>

              <h1
                style={headingFont}
                className="mt-5 max-w-[650px] text-[clamp(3.1rem,5.6vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.05em] text-[#184d39]"
              >
                Luôn ở đây
                <span className="mt-1 block font-normal italic text-[#C97B95] underline decoration-wavy decoration-2 decoration-[#F6CBD9] underline-offset-[10px]">
                  để lắng nghe bạn.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#184d39]/62 sm:text-base sm:leading-8">
                Dù là đặt bánh, hỏi menu, góp ý hay chỉ muốn chào một tiếng,
                tụi mình luôn sẵn sàng trò chuyện cùng bạn. Cảm ơn bạn đã luôn
                yêu thương Sweet Pea.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={zaloHref}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#184d39] px-6 text-sm font-extrabold text-[#fffced] shadow-[0_14px_34px_rgba(24,77,57,.18)] transition hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  <MessageCircle size={16} />
                  Nhắn Sweet Pea
                  <ArrowRight size={15} />
                </a>

                <a
                  href={phoneHref}
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#184d39]/12 bg-white/70 px-6 text-sm font-extrabold text-[#184d39] shadow-[0_10px_25px_rgba(24,77,57,.06)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <Phone size={16} />
                  Gọi đặt bánh
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Bánh mới mỗi ngày", "Không gian sân vườn", "Tụi mình luôn nghe bạn"].map(
                  (label, index) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                        index === 1
                          ? "border-[#C97B95]/30 bg-[#F6CBD9]/45 text-[#184d39]"
                          : "border-[#184d39]/8 bg-white/55 text-[#184d39]/68"
                      }`}
                    >
                      {index === 0 ? (
                        <CakeSlice size={11} />
                      ) : index === 1 ? (
                        <Leaf size={11} />
                      ) : (
                        <Heart size={11} />
                      )}
                      {label}
                    </span>
                  ),
                )}
              </div>
            </ContactReveal>

            <ContactReveal delay={0.12} className="relative min-h-[430px] sm:min-h-[500px] lg:min-h-[540px]">
              <div className="absolute inset-0 overflow-hidden rounded-[2.2rem] border border-[#184d39]/10 bg-[#e7ead9] shadow-[0_28px_75px_rgba(24,77,57,.16)] sm:rounded-[2.8rem]">
                <Image
                  src="/images/home-v27/sweet-pea-pastry-case.webp"
                  alt="Tủ bánh Sweet Pea"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173f2e]/45 via-transparent to-white/5" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div className="rounded-[1.1rem] border border-white/35 bg-[#fffced]/88 px-4 py-3 text-[#184d39] shadow-lg backdrop-blur-md">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#184d39]/55">
                      Sweet Pea today
                    </p>
                    <p className="mt-1 text-sm font-extrabold">Bánh mới, góc nhỏ, hẹn thật chill.</p>
                  </div>
                </div>
              </div>

              <ContactFloat
                delay={0.2}
                className="absolute -left-3 top-6 hidden w-[170px] overflow-hidden rounded-[1.6rem] border-4 border-[#fffced] bg-white shadow-[0_18px_40px_rgba(24,77,57,.18)] sm:block lg:-left-9"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/images/home-v27/sweet-pea-lemon-garden.webp"
                    alt="Góc sân vườn Sweet Pea"
                    fill
                    sizes="170px"
                    className="object-cover"
                  />
                </div>
                <div className="bg-[#fffced] px-3 py-2 text-[10px] font-extrabold text-[#184d39]">
                  Một góc xanh nhỏ 🌿
                </div>
              </ContactFloat>

              <ContactFloat
                delay={0.75}
                className="absolute -bottom-5 right-3 hidden max-w-[210px] rotate-[-2deg] rounded-[1.35rem] border-2 border-dashed border-[#184d39]/12 bg-[#fffced]/95 px-4 py-3 text-[#184d39] shadow-[0_16px_34px_rgba(24,77,57,.12)] backdrop-blur sm:block lg:-right-5"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F6CBD9] text-[#184d39]">
                    <Heart size={15} />
                  </span>
                  <div>
                    <p className="text-[10px] font-extrabold">Good cake, happier people.</p>
                    <p className="mt-0.5 text-[9px] text-[#184d39]/55">Hẹn gặp bạn ở tiệm nhé.</p>
                  </div>
                </div>
              </ContactFloat>

              <PetalMark className="pointer-events-none absolute -top-4 right-10 hidden h-8 w-8 text-[#C7DB95] sm:block" />
            </ContactReveal>
          </div>
        </section>

        {/* --------------------------------------------------- CONTACT INFO */}
        <section className="relative bg-[#dce8b9] py-12 sm:py-16 lg:py-[72px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 100%, rgba(255,252,237,.78), transparent 20rem)",
            }}
          />

          <div className="container-shell relative">
            <ContactReveal className="mb-6 max-w-2xl">
              <LaceDivider />
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#184d39]/55">
                Thông tin liên hệ
              </p>
              <h2
                style={headingFont}
                className="mt-2 text-4xl font-bold tracking-[-0.035em] text-[#184d39] sm:text-5xl"
              >
                Liên hệ với Sweet Pea.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#184d39]/58 sm:text-base">
                Chọn cách thuận tiện nhất, tụi mình sẽ phản hồi sớm nhất có thể.
              </p>
            </ContactReveal>

            <div className="grid gap-4 lg:grid-cols-[1.04fr_.96fr] lg:items-stretch">
              <div className="grid gap-4 sm:grid-cols-2">
                {contacts.map(({ icon: Icon, label, value, note, href, accent }, index) => (
                  <ContactHoverCard key={label} delay={index * 0.05} className="h-full">
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                      className="focus-ring group relative flex h-full min-h-[170px] flex-col rounded-[1.65rem] border border-dashed border-[#184d39]/16 bg-[#fffced]/92 p-5 shadow-[0_12px_30px_rgba(24,77,57,.06)] backdrop-blur transition hover:border-[#C97B95]/35 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-[1rem] ${accent}`}>
                          <Icon size={19} />
                        </span>
                        <ArrowRight
                          size={15}
                          className="mt-1 text-[#184d39]/35 transition group-hover:translate-x-1 group-hover:text-[#184d39]"
                        />
                      </div>

                      <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#184d39]/48">
                        {label}
                      </p>
                      <strong className="mt-1.5 break-words text-[13px] leading-6 text-[#184d39] sm:text-sm">
                        {value}
                      </strong>
                      <span className="mt-auto pt-3 text-[10px] leading-5 text-[#184d39]/48">{note}</span>
                    </a>
                  </ContactHoverCard>
                ))}
              </div>

              <ContactReveal delay={0.12} className="h-full">
                <div className="relative h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-[#16422f]/10 bg-[linear-gradient(145deg,#184d39_0%,#1c5b42_56%,#133d2d_100%)] p-5 text-[#fffced] shadow-[0_22px_55px_rgba(24,77,57,.16)] sm:p-7">
                  <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#F6CBD9]/14 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-[#c7db95]/18 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#c7db95]">
                        <PetalMark className="h-3.5 w-3.5" centerColor="#184d39" />
                        Giờ mở cửa
                      </p>
                      <h2 style={headingFont} className="mt-2 text-3xl font-bold sm:text-4xl">
                        Ghé lúc nào cũng có một góc chờ bạn.
                      </h2>
                    </div>

                    <ContactFloat className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] border border-white/15 bg-white/10 text-[#F6CBD9] backdrop-blur">
                      <Cat size={30} strokeWidth={1.8} />
                    </ContactFloat>
                  </div>

                  <div className="relative mt-5 rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-3 text-[12px] leading-6 text-white/80 backdrop-blur-sm">
                    <span className="font-extrabold text-[#fffced]">Mình là Quít Bi.</span>{" "}
                    Tụi mình mở cửa vào 7:30 và đóng cửa vào 22:00.
                  </div>

                  <div className="relative mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[1.35rem] border border-white/12 bg-[#fffced]/10 p-4 backdrop-blur-sm">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c7db95] text-[#184d39]">
                        <SunMedium size={17} />
                      </span>
                      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#c7db95]">
                        Mở cửa
                      </p>
                      <strong style={headingFont} className="mt-1 block text-3xl font-bold sm:text-4xl">
                        {OPEN_TIME}
                      </strong>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/12 bg-[#fffced]/10 p-4 backdrop-blur-sm">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F6CBD9] text-[#184d39]">
                        <MoonStar size={17} />
                      </span>
                      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#f6d9e2]">
                        Đóng cửa
                      </p>
                      <strong style={headingFont} className="mt-1 block text-3xl font-bold sm:text-4xl">
                        {CLOSE_TIME}
                      </strong>
                    </div>
                  </div>

                  <div className="relative mt-5 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-3">
                    {[
                      { icon: CakeSlice, label: "Bánh mới mỗi ngày" },
                      { icon: Coffee, label: "Góc ngồi ấm cúng" },
                      { icon: Heart, label: "Luôn chào đón bạn" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-[10px] font-semibold text-white/70">
                        <Icon size={13} className="text-[#c7db95]" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </ContactReveal>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- MAP */}
        <section className="bg-[#fffced] py-12 sm:py-16 lg:py-[72px]">
          <div className="container-shell">
            <LaceDivider />

            <ContactReveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#184d39]/55">
                  <PetalMark className="h-4 w-4 text-[#C97B95]" />
                  Bản đồ đến tiệm
                </p>
                <h2
                  style={headingFont}
                  className="mt-2 text-4xl font-bold tracking-[-0.035em] text-[#184d39] sm:text-5xl"
                >
                  Đường đến Sweet Pea.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#184d39]/58 sm:text-base">
                  {shop.address}
                </p>
              </div>

              <a
                href={MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#184d39]/10 bg-[#c7db95] px-5 text-xs font-extrabold text-[#184d39] shadow-[0_10px_24px_rgba(24,77,57,.08)] transition hover:-translate-y-0.5 hover:bg-[#d7e7ac]"
              >
                <Navigation size={15} />
                Mở Google Maps
              </a>
            </ContactReveal>

            <ContactReveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[2rem] border border-[#184d39]/10 bg-[#ede8dc] p-2 shadow-[0_20px_55px_rgba(24,77,57,.09)] sm:rounded-[2.4rem] sm:p-3">
                <div className="overflow-hidden rounded-[1.55rem] sm:rounded-[1.9rem]">
                  <iframe
                    src={MAP_EMBED_URL}
                    title="Bản đồ Tiệm bánh Sweet Pea"
                    className="h-[350px] w-full border-0 sm:h-[430px] lg:h-[470px]"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </ContactReveal>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}