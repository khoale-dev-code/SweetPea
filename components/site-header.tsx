"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { ReservationButton } from "@/components/reservation-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Bản tin", href: "/news" },
  { label: "Liên hệ", href: "/contact" },
];

export function SiteHeader({ phone }: { phone: string }) {
  const tel = phone.replace(/\s/g, "");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#d7d1bf]/80 bg-[#fffced]/92 backdrop-blur-xl">
      <div className="container-shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Về trang chủ">
          <Image
            src="/sweet-pea-logo.png"
            alt="Sweet Pea"
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-full border border-[#d9c8ae] object-cover"
          />
          <span className="font-display text-[1.45rem] font-semibold tracking-[-0.03em] text-[#184d39]">
            Sweet Pea
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring relative rounded-full px-1 py-2 text-sm font-semibold transition hover:text-[#1f5741] ${active ? "text-[#1f5741]" : "text-[#4d6458]"}`}
              >
                {item.label}
                {active && <span className="absolute inset-x-1 -bottom-1 h-0.5 rounded-full bg-[#6f8e62]" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ReservationButton variant="icon" className="sm:hidden" />
          <ReservationButton className="hidden sm:inline-flex" />
          <a
            href={`tel:${tel}`}
            className="focus-ring hidden min-h-11 items-center gap-2 rounded-full bg-[#184d39] px-5 text-sm font-semibold text-white transition hover:bg-[#123e2e] xl:inline-flex"
          >
            <Phone size={17} aria-hidden="true" />
            Gọi đặt bánh
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-[#cfc8b7] bg-white/70 text-[#184d39] lg:hidden"
                aria-label="Mở menu"
              >
                <Menu size={21} />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,24rem)] border-l-[#d7d1bf] bg-[#fffced] p-0">
              <SheetHeader className="border-b border-[#d7d1bf] p-6 text-left">
                <div className="flex items-center gap-3">
                  <Image
                    src="/sweet-pea-logo.png"
                    alt=""
                    width={52}
                    height={52}
                    className="rounded-full border border-[#d9c8ae]"
                  />
                  <SheetTitle className="font-display text-2xl text-[#184d39]">Sweet Pea</SheetTitle>
                </div>
                <SheetDescription className="text-[#617064]">Bánh tươi và những điều dịu ngọt.</SheetDescription>
              </SheetHeader>

              <nav className="grid gap-2 p-5" aria-label="Điều hướng trên điện thoại">
                {navItems.map((item, index) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`focus-ring flex min-h-14 items-center justify-between rounded-2xl px-4 text-base font-semibold text-[#184d39] transition hover:bg-[#c7db95] ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "bg-[#c7db95]" : ""}`}
                    >
                      {item.label}
                      <span className="text-xs text-[#859188]">0{index + 1}</span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto p-5">
                <a
                  href={`tel:${tel}`}
                  className="focus-ring flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#184d39] px-5 font-semibold text-white"
                >
                  <Phone size={18} />
                  {phone}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
