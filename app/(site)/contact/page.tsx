import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { getShopSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ Sweet Pea để đặt bánh, thức uống và xem bản đồ đến tiệm.",
};

const MAP_DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=11.3037693%2C106.0845314";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.4228900511307!2d106.08453139999999!3d11.303769299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b005115731b%3A0xf0764ae590819fde!2zVGnhu4dtIGLDoW5oIFN3ZWV0IFBlYQ!5e0!3m2!1svi!2s!4v1788413933411!5m2!1svi!2s";

export default async function ContactPage() {
  const shop = await getShopSettings();
  const contacts = [
    { icon: Phone, label: "Điện thoại", value: shop.phone, href: `tel:${shop.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "Zalo", value: "Nhắn tiệm để đặt món", href: shop.zalo_url },
    { icon: Mail, label: "Email", value: shop.email, href: `mailto:${shop.email}` },
    { icon: MapPin, label: "Địa chỉ", value: shop.address, href: MAP_DIRECTIONS_URL },
  ];

  return (
    <PageTransition>
      <PageHero
        eyebrow="Liên hệ Sweet Pea"
        title="Bạn chọn món, tiệm chuẩn bị phần ngọt ngào."
        description="Nhắn tiệm trước để kiểm tra món đang có, đặt bánh theo dịp hoặc xem bản đồ phía dưới để đến Sweet Pea thuận tiện hơn."
      />

      <section className="bg-[#c7db95] py-16 sm:py-20">
        <div className="container-shell grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="focus-ring rounded-[2rem] border border-[#c7db95] bg-[#fffced] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
                  <Icon size={21} />
                </span>
                <small className="mt-7 block text-xs font-bold uppercase tracking-[0.14em] text-[#829078]">{label}</small>
                <strong className="mt-2 block break-words text-base leading-7 text-[#184d39]">{value}</strong>
              </a>
            ))}
          </div>

          <div className="rounded-[2.5rem] bg-[#184d39] p-7 text-white sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c7db95] text-[#184d39]">
              <Clock3 size={22} />
            </span>
            <p className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-[#c7db95]">Thời gian nhận đơn</p>
            <h2 className="font-display mt-3 text-4xl font-bold leading-tight">{shop.opening_text}</h2>
            <p className="mt-5 leading-8 text-white/75">
              Đơn cần trang trí riêng nên được đặt sớm để tiệm chuẩn bị đầy đủ và đúng ý bạn hơn.
            </p>
            <a
              href={shop.zalo_url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#c7db95] px-6 font-semibold text-[#184d39]"
            >
              Nhắn Zalo ngay
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#fffced] py-16 sm:py-20">
        <div className="container-shell">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#77906d]">Bản đồ Sweet Pea</p>
              <h2 className="font-display mt-3 text-4xl font-bold leading-tight text-[#184d39] sm:text-5xl">Đường đến tiệm</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#68766e]">{shop.address}</p>
            </div>
            <a
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#c8cfaf] bg-[#c7db95] px-5 text-sm font-bold text-[#184d39] transition hover:bg-[#c7db95]"
            >
              <Navigation size={17} />
              Mở Google Maps
            </a>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#d8d0bf] bg-[#eee8dc] shadow-[0_18px_55px_rgba(48,70,57,0.1)]">
            <iframe
              src={MAP_EMBED_URL}
              title="Bản đồ Tiệm bánh Sweet Pea"
              className="h-[360px] w-full border-0 sm:h-[450px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
