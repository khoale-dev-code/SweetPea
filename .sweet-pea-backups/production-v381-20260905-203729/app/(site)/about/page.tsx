import type { Metadata } from "next";
import Image from "next/image";
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
import { PageTransition } from "@/components/page-transition";
import { getStoreData } from "@/lib/store";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Khám phá câu chuyện, không gian sân vườn và những khoảnh khắc dịu dàng tại Sweet Pea.",
};

const gallery = [
  {
    src: "/images/about/sweet-pea-lemon-garden.webp",
    alt: "Góc sân vườn Sweet Pea dưới tán cây và những giỏ trái vàng",
    className: "col-span-2 lg:col-span-5 lg:row-span-2",
  },
  {
    src: "/images/about/sweet-pea-garden-house.webp",
    alt: "Lối nhỏ xanh mát dẫn vào không gian Sweet Pea",
    className: "col-span-2 sm:col-span-1 lg:col-span-4",
  },
  {
    src: "/images/about/sweet-pea-garden-view.webp",
    alt: "Từ hiên Sweet Pea nhìn ra khu vườn và bàn ghế ngoài trời",
    className: "col-span-2 sm:col-span-1 lg:col-span-3",
  },
  {
    src: "/images/about/sweet-pea-plaid-table.webp",
    alt: "Bàn ghế gỗ và hoa trong khu sân vườn Sweet Pea",
    className: "col-span-2 sm:col-span-1 lg:col-span-4",
  },
  {
    src: "/images/about/sweet-pea-pastry-case.webp",
    alt: "Tủ bánh với các món bánh nướng tại Sweet Pea",
    className: "col-span-2 sm:col-span-1 lg:col-span-3",
  },
];

const highlights = [
  {
    icon: Leaf,
    title: "Không gian sân vườn",
    text: "Nhiều cây xanh, khoảng thở và ánh sáng tự nhiên để bạn chậm lại một chút giữa ngày.",
  },
  {
    icon: Coffee,
    title: "Bánh & nước làm mỗi ngày",
    text: "Từng món được chuẩn bị theo nhịp nhỏ, ưu tiên sự tươi mới, vừa vị và cảm giác thân thuộc.",
  },
  {
    icon: Heart,
    title: "Góc ngồi ấm cúng",
    text: "Có những góc riêng tư cho buổi hẹn, làm việc nhẹ nhàng hoặc đơn giản là ngồi yên một lúc.",
  },
];

export default async function AboutPage() {
  const { shop } = await getStoreData();

  return (
    <PageTransition>
      <main className="overflow-hidden bg-[#fffced] text-[#184d39]">
        <section className="relative border-b border-[#ded5c5]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 8% 20%, rgba(217,226,184,.46), transparent 21rem), radial-gradient(circle at 88% 10%, rgba(255,255,255,.92), transparent 24rem)",
            }}
          />

          <div className="container-shell relative grid min-h-[640px] gap-10 py-12 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c7db95] bg-[#c7db95]/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#617b60] sm:text-xs">
                <Leaf size={15} />
                Về Sweet Pea
              </div>

              <h1 className="font-display text-5xl font-bold leading-[0.98] text-[#184d39] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                Một góc vườn nhỏ,
                <span className="mt-2 block text-[#184d39]">nhiều điều dịu dàng.</span>
              </h1>

              <div className="mt-7 flex items-center gap-3 text-[#93a477]" aria-hidden="true">
                <span className="h-px w-12 bg-current" />
                <Sparkles size={18} />
                <span className="h-px w-5 bg-current" />
              </div>

              <p className="mt-7 max-w-xl text-base leading-8 text-[#5e6f65] sm:text-[17px]">
                Sweet Pea là một tiệm bánh &amp; café mang tinh thần sân vườn — nơi mùi bánh mới,
                ly nước mát và những tán cây xanh cùng tạo nên một khoảng dừng nhẹ nhàng cho mỗi
                cuộc hẹn.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#khong-gian"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#184d39] px-6 text-sm font-bold text-white shadow-[0_14px_35px_rgba(33,90,67,.2)] transition hover:-translate-y-0.5 hover:bg-[#184d39]"
                >
                  Khám phá không gian
                  <Leaf size={17} />
                </a>
                <Link
                  href="/menu"
                  className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfc5b5] bg-white/70 px-6 text-sm font-bold text-[#184d39] transition hover:border-[#9faf86] hover:bg-white"
                >
                  Xem menu
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[430px] sm:min-h-[520px] lg:min-h-[590px]">
              <div className="absolute -left-4 top-8 z-20 hidden rounded-[1.4rem] border border-white/70 bg-[#fffced]/92 p-4 shadow-[0_18px_50px_rgba(38,64,50,.16)] backdrop-blur sm:block lg:-left-10">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#c7db95] text-[#184d39]">
                  <Leaf size={18} />
                </span>
                <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#7a8b6f]">Sân vườn</p>
                <p className="mt-1 max-w-[150px] text-sm font-semibold leading-6 text-[#184d39]">
                  Một khoảng xanh để ngồi thật lâu.
                </p>
              </div>

              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-[#d9cfbd] bg-[#e8e2d5] shadow-[0_30px_80px_rgba(43,73,58,.18)] sm:rounded-[2.6rem]">
                <Image
                  src="/images/about/sweet-pea-lemon-garden.webp"
                  alt="Không gian sân vườn Sweet Pea với cây xanh và khu trưng bày trái vàng"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition duration-700 hover:scale-[1.015]"
                />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#184d39]/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">Sweet Pea Garden</p>
                    <p className="font-display mt-1 text-2xl font-bold sm:text-3xl">Một khu vườn để ghé về.</p>
                  </div>
                  <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 backdrop-blur sm:grid">
                    <Leaf size={21} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7b906f]">Câu chuyện của Sweet Pea</p>
              <h2 className="font-display mt-4 text-4xl font-bold leading-tight text-[#184d39] sm:text-5xl">
                Nơi những ngày bình thường cũng có thể trở nên đáng nhớ.
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-8 text-[#627168] sm:text-base">
                <p>
                  Sweet Pea lớn lên từ tình yêu dành cho những khu vườn, những chiếc bánh vừa ra lò
                  và cảm giác dễ chịu của một buổi chiều không cần vội.
                </p>
                <p>
                  Tiệm không cố gắng trở thành một nơi quá cầu kỳ. Chúng mình chỉ muốn mỗi góc ngồi,
                  từng chiếc bánh và từng ly nước đều đủ chỉn chu để bạn cảm thấy thoải mái khi ghé qua.
                </p>
                <p>
                  Dù là một buổi hẹn, một buổi làm việc hay vài phút dành riêng cho mình, Sweet Pea
                  luôn mong bạn tìm thấy một khoảng thật nhẹ ở đây.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] sm:min-h-[500px]">
                <Image
                  src="/images/about/sweet-pea-garden-house.webp"
                  alt="Lối vào xanh mát của Sweet Pea"
                  fill
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-10 min-h-[350px] overflow-hidden rounded-[2rem] sm:mt-16 sm:min-h-[440px]">
                <Image
                  src="/images/about/sweet-pea-plaid-table.webp"
                  alt="Bàn ghế ngoài trời tại Sweet Pea"
                  fill
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#ded5c5] bg-[#fffced] py-12 sm:py-16">
          <div className="container-shell grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group rounded-[2rem] border border-[#dcd2c1] bg-[#fffced] p-6 shadow-[0_12px_35px_rgba(40,66,52,.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(40,66,52,.1)] sm:p-7"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#c7db95] bg-[#c7db95] text-[#184d39] transition group-hover:rotate-[-6deg]">
                  <Icon size={21} />
                </span>
                <h3 className="font-display mt-6 text-2xl font-bold text-[#184d39]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#66746b]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="khong-gian" className="bg-[#fffced] py-16 sm:py-20 lg:py-24">
          <div className="container-shell">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7b906f]">Một vòng quanh tiệm</p>
                <h2 className="font-display mt-3 text-4xl font-bold text-[#184d39] sm:text-5xl">Không gian tại Sweet Pea</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#68776e] sm:text-right">
                Từ hiên nhỏ, khu vườn đến tủ bánh — mỗi góc đều giữ một chút chất mộc và sự gần gũi riêng.
              </p>
            </div>

            <div className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[280px] sm:gap-4 lg:grid-cols-12 lg:auto-rows-[260px]">
              {gallery.map((image, index) => (
                <figure
                  key={image.src}
                  className={`group relative overflow-hidden rounded-[1.5rem] border border-[#ded4c3] bg-[#eee7da] shadow-[0_12px_35px_rgba(40,66,52,.07)] sm:rounded-[2rem] ${image.className}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 42vw" : "(max-width: 1024px) 50vw, 30vw"}
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#184d39]/20 via-transparent to-transparent opacity-70" />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fffced] pb-16 sm:pb-20 lg:pb-24">
          <div className="container-shell">
            <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-[#cfc6b7] sm:min-h-[340px] sm:rounded-[2.5rem]">
              <Image
                src="/images/about/sweet-pea-garden-view.webp"
                alt="Không gian nhìn ra khu vườn Sweet Pea"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#184d39]/55" />
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                <div className="max-w-3xl">
                  <Coffee className="mx-auto text-[#c7db95]" size={28} />
                  <blockquote className="font-display mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                    “Nơi những buổi hẹn trở nên nhẹ nhàng hơn.”
                  </blockquote>
                  <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                    Một chiếc bàn nhỏ, một món mình thích và đủ thời gian để chuyện trò.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#ded5c5] bg-[#fffced] py-10 sm:py-12">
          <div className="container-shell grid gap-3 lg:grid-cols-[1fr_1.2fr_1.25fr]">
            <div className="flex items-start gap-4 rounded-[1.5rem] bg-white/55 p-5 sm:p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c7db95] text-[#184d39]">
                <Clock3 size={20} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7b8a73]">Mở cửa</p>
                <p className="mt-1 font-display text-xl font-bold text-[#184d39]">{shop.opening_text || "Mở cửa mỗi ngày"}</p>
                <p className="mt-1 text-xs leading-5 text-[#738077]">Nhắn tiệm trước nếu bạn cần đặt món số lượng nhiều.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[1.5rem] bg-white/55 p-5 sm:p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c7db95] text-[#184d39]">
                <Leaf size={20} />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7b8a73]">Không gian</p>
                <p className="mt-1 font-display text-xl font-bold text-[#184d39]">Trong nhà &amp; sân vườn</p>
                <p className="mt-1 text-xs leading-5 text-[#738077]">Có nhiều góc ngồi phù hợp đi một mình, đi đôi hoặc nhóm nhỏ.</p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5 rounded-[1.5rem] bg-[#184d39] p-5 text-white sm:flex-row sm:items-center sm:p-6 lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/12 text-[#c7db95]">
                  <MapPin size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7db95]">Chúng tôi ở đây</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-white/90">{shop.address}</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c7db95] px-5 text-sm font-bold text-[#184d39] transition hover:bg-white"
              >
                Xem đường đi
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
