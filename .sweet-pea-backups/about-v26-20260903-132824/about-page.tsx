import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Leaf, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Câu chuyện về tiệm bánh Sweet Pea và cách những mẻ bánh nhỏ được làm mỗi ngày.",
};

const values = [
  { icon: Leaf, title: "Tươi trong ngày", text: "Tiệm ưu tiên những mẻ bánh nhỏ để giữ được hương vị và kết cấu tốt nhất." },
  { icon: Heart, title: "Ngọt vừa đủ", text: "Công thức được cân chỉnh để vị bánh nhẹ nhàng, dễ ăn và không bị ngấy." },
  { icon: Sparkles, title: "Chỉn chu từng hộp", text: "Mỗi món bánh đều được kiểm tra và đóng gói cẩn thận trước khi đến tay bạn." },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <PageHero eyebrow="Về Sweet Pea" title="Một tiệm bánh nhỏ, bắt đầu từ những điều rất dịu dàng." description="Sweet Pea ra đời năm 2022 với mong muốn tạo ra những chiếc bánh vừa xinh, vừa ngon và mang lại cảm giác ấm áp như một món quà nhỏ." />
      <section className="bg-[#fffdf8] py-16 sm:py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div className="soft-grid leaf-shadow rounded-[3rem] bg-[#e5ebca] p-7 sm:p-10"><Image src="/sweet-pea-logo.png" alt="Logo Sweet Pea" width={960} height={960} className="mx-auto aspect-square w-full max-w-md rounded-[2.4rem] object-cover" /></div>
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">Từ căn bếp của tiệm</p><h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#214e3d] sm:text-5xl">Làm chậm một chút để chiếc bánh ngon hơn.</h2><div className="mt-6 space-y-5 text-base leading-8 text-[#607167]"><p>Mỗi ngày, Sweet Pea chuẩn bị nguyên liệu vừa đủ cho từng mẻ bánh. Nhịp làm bánh nhỏ giúp tiệm kiểm soát độ mềm của cốt, độ nhẹ của kem và sự tươi mới khi bánh được giao.</p><p>Tiệm thích những màu sắc tự nhiên, cách trang trí gọn gàng và hương vị dễ ăn. Bạn có thể chọn món có sẵn hoặc nhắn trước để tiệm chuẩn bị cho một ngày đặc biệt.</p></div></div>
        </div>
      </section>
      <section className="paper-texture border-y border-[#d7d1bf] py-16 sm:py-20"><div className="container-shell grid gap-5 md:grid-cols-3">{values.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[2rem] border border-[#d7d1bf] bg-white/70 p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e5ebca] text-[#245943]"><Icon size={21} /></span><h3 className="font-display mt-6 text-2xl font-semibold text-[#214e3d]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#68776e]">{text}</p></article>)}</div></section>
    </PageTransition>
  );
}
