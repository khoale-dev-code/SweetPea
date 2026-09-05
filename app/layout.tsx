import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sweet Pea — Tiệm bánh nhỏ xinh",
    template: "%s · Sweet Pea",
  },
  description:
    "Tiệm bánh Sweet Pea — bánh tươi mỗi ngày, thức uống dịu ngọt và những khoảnh khắc thật xanh.",
  icons: {
    icon: "/sweet-pea-logo.png",
    shortcut: "/sweet-pea-logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f0df",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
