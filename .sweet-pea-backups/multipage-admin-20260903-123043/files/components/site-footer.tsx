import Image from "next/image";
import Link from "next/link";
import type { ShopSettings } from "@/lib/types";

export function SiteFooter({ shop }: { shop: ShopSettings }) {
  return (
    <footer className="bg-[#183f30] py-8 text-white">
      <div className="container-shell flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image src="/sweet-pea-logo.png" alt="" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-display text-xl font-semibold">Sweet Pea</p>
            <p className="text-xs text-white/60">Freshly baked daily · Est. 2022</p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm text-white/70">
          <a href={shop.zalo_url} target="_blank" rel="noreferrer" className="hover:text-white">Zalo</a>
          <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-white">{shop.phone}</a>
          <Link href="/admin" className="hover:text-white">Quản trị</Link>
        </div>
      </div>
    </footer>
  );
}
