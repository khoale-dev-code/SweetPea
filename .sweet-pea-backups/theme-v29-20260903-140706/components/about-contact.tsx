import { Clock3, Mail, MapPin, Phone, Sprout } from "lucide-react";
import type { ShopSettings } from "@/lib/types";

export function AboutContact({ shop }: { shop: ShopSettings }) {
  return (
    <>
      <section id="about" className="paper-texture border-y border-[#d7d1bf] py-20 sm:py-24">
        <div className="container-shell grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="rounded-[2.5rem] bg-[#245943] p-7 text-white sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#dfe9bd] text-[#245943]">
              <Sprout size={23} />
            </span>
            <p className="mt-12 text-sm font-bold uppercase tracking-[0.18em] text-[#cddba6]">Câu chuyện nhỏ</p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Tươi mỗi ngày,
              <br /> tử tế trong từng chiếc bánh.
            </h2>
          </div>
          <div className="px-1 py-4 lg:px-10">
            <p className="text-lg leading-9 text-[#53665b]">
              Sweet Pea bắt đầu từ năm 2022 với mong muốn làm ra những chiếc bánh vừa xinh, vừa ngon và không quá ngọt. Tiệm ưu tiên mẻ bánh nhỏ để hương vị luôn mới, chỉn chu từ phần cốt đến lớp kem cuối cùng.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-[#d7d1bf] bg-white/65 p-5">
                <p className="font-display text-3xl font-semibold text-[#245943]">2022</p>
                <p className="mt-1 text-sm text-[#68766e]">Năm Sweet Pea bắt đầu</p>
              </div>
              <div className="rounded-3xl border border-[#d7d1bf] bg-white/65 p-5">
                <p className="font-display text-3xl font-semibold text-[#245943]">Mỗi ngày</p>
                <p className="mt-1 text-sm text-[#68766e]">Bánh mới theo số lượng nhỏ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#e4eacb] py-20 sm:py-24">
        <div className="container-shell grid gap-8 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#66815e]">Ghé Sweet Pea</p>
            <h2 className="font-display mt-3 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-[#214e3d] sm:text-6xl">
              Tiệm ở đây, chờ bạn ghé.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5d6e63]">Nếu sợ đi lạc, bạn cứ gọi hoặc nhắn Zalo. Tiệm sẽ gửi định vị thật nhanh.</p>
          </div>

          <div className="rounded-[2.25rem] border border-[#cad3a9] bg-[#fffdf8] p-5 shadow-[0_20px_55px_rgba(50,77,62,0.09)] sm:p-7">
            <div className="grid gap-3">
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="focus-ring flex min-h-14 items-center gap-4 rounded-2xl px-3 transition hover:bg-[#f3f0e3]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e6edcf] text-[#245943]"><Phone size={19} /></span>
                <span><small className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">Điện thoại</small><strong className="mt-1 block text-base">{shop.phone}</strong></span>
              </a>
              <a href={`mailto:${shop.email}`} className="focus-ring flex min-h-14 items-center gap-4 rounded-2xl px-3 transition hover:bg-[#f3f0e3]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e6edcf] text-[#245943]"><Mail size={19} /></span>
                <span className="min-w-0"><small className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">Email</small><strong className="mt-1 block truncate text-sm sm:text-base">{shop.email}</strong></span>
              </a>
              <a href={shop.map_url} target="_blank" rel="noreferrer" className="focus-ring flex min-h-14 items-start gap-4 rounded-2xl px-3 py-3 transition hover:bg-[#f3f0e3]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e6edcf] text-[#245943]"><MapPin size={19} /></span>
                <span><small className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">Địa chỉ</small><strong className="mt-1 block text-sm leading-6 sm:text-base">{shop.address}</strong></span>
              </a>
              <div className="flex min-h-14 items-center gap-4 rounded-2xl px-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e6edcf] text-[#245943]"><Clock3 size={19} /></span>
                <span><small className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#829078]">Thời gian</small><strong className="mt-1 block text-base">{shop.opening_text}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
