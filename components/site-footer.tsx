import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ShopSettings } from "@/lib/types";

export function SiteFooter({ shop }: { shop: ShopSettings }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#c7db95] text-[#184d39]">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fffced]/55 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#184d39]/5 blur-3xl"
      />

      {/* Decorative leaves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[4%] top-[42%] hidden opacity-[0.09] lg:block"
      >
        <LeafDecoration />
      </div>

      {/* CTA */}
      <div className="relative border-b border-[#184d39]/10">
        <div className="container-shell py-7 sm:py-9 lg:py-10">
          <div className="relative overflow-hidden rounded-[26px] border border-[#184d39]/10 bg-[#fffced] px-5 py-6 shadow-[0_18px_50px_rgba(24,77,57,0.08)] sm:px-7 sm:py-7 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-9">
            {/* CTA decorations */}
            <div
              aria-hidden="true"
              className="absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c7db95]/45 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-16 left-[38%] h-36 w-36 rounded-full bg-[#c7db95]/20 blur-3xl"
            />

            <div className="relative max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#184d39]/10 bg-[#c7db95]/25 px-3 py-1.5">
                <LeafSmallIcon />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#184d39]/65">
                  Sweet Pea · Bakery & Café
                </span>
              </div>

              <h2 className="font-display max-w-[700px] text-[27px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#184d39] sm:text-[32px] lg:text-[38px]">
                Một chút ngọt cho
                <span className="italic text-[#6f8c56]">
                  {" "}
                  ngày dịu dàng hơn.
                </span>
              </h2>

              <p className="mt-3 max-w-[610px] text-sm leading-6 text-[#184d39]/65 sm:text-[15px]">
                Ghé Sweet Pea để thưởng thức bánh mới mỗi ngày, một ly nước
                thật vừa vị và những khoảng thời gian thật nhẹ nhàng.
              </p>
            </div>

            <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:shrink-0">
              <Link
                href="/menu"
                className="group inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#184d39] px-5 text-sm font-semibold text-[#fffced] shadow-[0_8px_24px_rgba(24,77,57,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]"
              >
                Xem thực đơn

                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRightIcon />
                </span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#184d39]/15 bg-white/40 px-5 text-sm font-semibold text-[#184d39] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#184d39]/25 hover:bg-white/75"
              >
                Liên hệ đặt bánh
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-shell relative py-10 sm:py-12 lg:py-14">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.72fr_0.82fr_1.05fr] lg:gap-10 xl:gap-14">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="Sweet Pea - Trang chủ"
              className="inline-flex items-center gap-3.5"
            >
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border border-[#184d39]/10 bg-[#fffced] p-1.5 shadow-[0_8px_25px_rgba(24,77,57,0.08)]">
                <Image
                  src="/sweet-pea-logo.png"
                  alt="Sweet Pea"
                  width={52}
                  height={52}
                  className="h-full w-full rounded-full object-contain"
                />
              </div>

              <div>
                <p className="font-display text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#184d39]">
                  Sweet Pea
                </p>

                <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#184d39]/55">
                  Bakery & Café
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-[330px] text-sm leading-[1.8] text-[#184d39]/65">
              Một tiệm nhỏ dành cho bánh tươi, những ly nước vừa vị và những
              buổi hẹn thật thong thả.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {shop.zalo_url ? (
                <FooterSocialLink
                  href={shop.zalo_url}
                  label="Zalo"
                >
                  <ChatIcon />
                </FooterSocialLink>
              ) : null}

              <FooterSocialLink
                href="/contact"
                label="Liên hệ"
                internal
              >
                <MailIcon />
              </FooterSocialLink>
            </div>
          </div>

          {/* Explore */}
          <FooterColumn title="Khám phá">
            <FooterLink href="/">
              Trang chủ
            </FooterLink>

            <FooterLink href="/menu">
              Thực đơn
            </FooterLink>

            <FooterLink href="/about">
              Giới thiệu
            </FooterLink>

            <FooterLink href="/news">
              Bản tin
            </FooterLink>

            <FooterLink href="/contact">
              Liên hệ
            </FooterLink>
          </FooterColumn>

          {/* Information */}
          <FooterColumn title="Sweet Pea">
            <FooterLink href="/menu">
              Menu tại tiệm
            </FooterLink>

            <FooterLink href="/news">
              Chuyện từ căn bếp
            </FooterLink>

            <FooterLink href="/about">
              Câu chuyện của tiệm
            </FooterLink>

            <FooterLink href="/contact">
              Đường đến Sweet Pea
            </FooterLink>
          </FooterColumn>

          {/* Visit */}
          <div>
            <FooterHeading>
              Ghé Sweet Pea
            </FooterHeading>

            <div className="mt-5 space-y-4">
              <FooterInfo icon={<ClockIcon />}>
                <span className="block font-semibold text-[#184d39]">
                  Mở cửa mỗi ngày
                </span>

                <span className="mt-0.5 block text-[#184d39]/55">
                  Một góc nhỏ luôn chờ bạn ghé qua.
                </span>
              </FooterInfo>

              <FooterInfo icon={<LeafSmallIcon />}>
                <span className="block font-semibold text-[#184d39]">
                  Bánh mới mỗi ngày
                </span>

                <span className="mt-0.5 block text-[#184d39]/55">
                  Bánh và thức uống được chuẩn bị tại tiệm.
                </span>
              </FooterInfo>

              {shop.zalo_url ? (
                <a
                  href={shop.zalo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#184d39] px-4 text-sm font-semibold text-[#fffced] shadow-[0_7px_20px_rgba(24,77,57,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#123e2e]"
                >
                  <ChatIcon />

                  Nhắn Sweet Pea

                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px bg-[#184d39]/10 lg:mt-12" />

        {/* Bottom */}
        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#184d39]/55">
              © {currentYear} Sweet Pea Bakery & Café.
            </p>

            <p className="mt-1 text-[10px] text-[#184d39]/40">
              Những điều ngọt ngào được làm mới mỗi ngày.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#184d39]/50">
            <span>
              Freshly baked daily
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-[#184d39]/35 sm:block"
            />

            <span>
              Est. 2022
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-[#184d39]/35 sm:block"
            />

            <Link
              href="/admin"
              className="transition-colors hover:text-[#184d39]"
            >
              Quản trị
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <FooterHeading>
        {title}
      </FooterHeading>

      <nav className="mt-5 flex flex-col items-start gap-3">
        {children}
      </nav>
    </div>
  );
}

function FooterHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#184d39]">
      {children}
    </h3>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center text-sm font-medium text-[#184d39]/62 transition-colors duration-300 hover:text-[#184d39]"
    >
      <span className="mr-0 h-px w-0 bg-[#184d39] transition-all duration-300 group-hover:mr-2 group-hover:w-3" />

      {children}
    </Link>
  );
}

function FooterInfo({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#184d39]/8 bg-[#fffced]/45 text-[#184d39]">
        {icon}
      </div>

      <p className="text-sm leading-5">
        {children}
      </p>
    </div>
  );
}

function FooterSocialLink({
  href,
  label,
  children,
  internal = false,
}: {
  href?: string | null;
  label: string;
  children: ReactNode;
  internal?: boolean;
}) {
  const className =
    "inline-flex h-10 items-center gap-2 rounded-full border border-[#184d39]/12 bg-[#fffced]/40 px-3.5 text-xs font-semibold text-[#184d39]/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#184d39]/25 hover:bg-[#fffced] hover:text-[#184d39]";

  if (internal) {
    return (
      <Link
        href={href || "/"}
        className={className}
      >
        {children}
        {label}
      </Link>
    );
  }

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
      {label}
    </a>
  );
}

/* ========================================
   ICONS
======================================== */

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M7 17 17 7M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M7 18.2 3.8 20l.8-3.8A8 8 0 1 1 7 18.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M4 6.5h16v11H4v-11Zm.8.8 7.2 5.4 7.2-5.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7.8V12l2.9 1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M19.5 4.5C13 4.8 7.3 7.5 6.3 12.3c-.7 3.3 1.7 5.4 4.6 4.9 4.9-.8 7.6-6.2 8.6-12.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M5 19c2.4-4.1 5.5-7.1 9.8-9.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafDecoration() {
  return (
    <svg
      width="230"
      height="300"
      viewBox="0 0 230 300"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M198 20C152 75 109 129 73 205C61 229 50 255 42 280"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M167 61C184 48 204 47 218 51C211 67 195 80 174 78"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M135 103C153 86 176 83 192 87C186 105 166 121 143 120"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M103 152C119 137 141 133 158 138C150 158 133 170 110 169"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M78 199C63 184 44 178 29 181C34 199 50 213 70 215"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M122 125C108 110 88 105 72 110C78 128 94 140 115 140"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}