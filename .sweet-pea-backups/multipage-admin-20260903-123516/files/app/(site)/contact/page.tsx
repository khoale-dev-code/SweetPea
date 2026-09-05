import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { getStoreData } from "@/lib/store";

export const metadata: Metadata = { title: "Liên hệ", description: "Liên hệ Sweet Pea để đặt bánh và nhận định vị của tiệm." };

export default async function ContactPage() {
  const { shop } = await getStoreData();
  const contacts = [
    { icon: Phone, label: "Điện thoại", value: shop.phone, href: `tel:${shop.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "Zalo", value: "Nhắn tiệm để đặt bánh", href: shop.zalo_url },
    { icon: Mail, label: "Email", value: shop.email, href: `mailto:${shop.email}` },
    { icon: MapPin, label: "Địa chỉ", value: shop.address, href: shop.map_url },
  ];

  return (
    <PageTransition>
      <PageHero eyebrow="Liên hệ Sweet Pea" title="Bạn chọn bánh, tiệm chuẩn bị phần ngọt ngào." description="Nhắn tiệm trước để kiểm tra món đang có, đặt bánh theo dịp hoặc nhận định vị chính xác nếu bạn sợ đi lạc." />
      <section className="bg-[#e4eacb] py-16 sm:py-20"><div className="container-shell grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <div className="grid gap-4 sm:grid-cols-2">{contacts.map(({ icon: Icon, label, value, href }) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="focus-ring rounded-[2rem] border border-[#cad3a9] bg-[#fffdf8] p-6 transition hover:-translate-y-1 hover:shadow-lg"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e5ebca] text-[#245943]"><Icon size={21} /></span><small className="mt-7 block text-xs font-bold uppercase tracking-[0.14em] text-[#829078]">{label}</small><strong className="mt-2 block break-words text-base leading-7 text-[#214e3d]">{value}</strong></a>)}</div>
        <div className="rounded-[2.5rem] bg-[#245943] p-7 text-white sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dfe9bd] text-[#245943]"><Clock3 size={22} /></span><p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-[#cedba9]">Thời gian nhận đơn</p><h2 className="font-display mt-3 text-4xl font-semibold">{shop.opening_text}</h2><p className="mt-5 leading-8 text-white/72">Đơn cần trang trí riêng nên được đặt sớm để tiệm chuẩn bị đầy đủ và đúng ý bạn hơn.</p><a href={shop.zalo_url} target="_blank" rel="noreferrer" className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#e4eacb] px-6 font-semibold text-[#214e3d]">Nhắn Zalo ngay</a></div>
      </div></section>
    </PageTransition>
  );
}
