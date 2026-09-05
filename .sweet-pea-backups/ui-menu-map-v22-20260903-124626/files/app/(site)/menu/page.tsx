import type { Metadata } from "next";
import { MenuCatalog } from "@/components/menu-catalog";
import { PageTransition } from "@/components/page-transition";
import { getStoreData } from "@/lib/store";

export const metadata: Metadata = {
  title: "Menu",
  description: "Xem menu bánh và thức uống đang có tại Sweet Pea.",
};

export const revalidate = 60;

export default async function MenuPage() {
  const data = await getStoreData();
  return (
    <PageTransition>
      <MenuCatalog
        categories={data.categories}
        items={data.items}
        eyebrow="Menu hôm nay"
        title="Chọn món bạn đang thèm"
        description="Dùng bộ lọc để tìm nhanh món bánh hoặc thức uống. Các món đang hiển thị đều có thể đặt với tiệm."
      />
    </PageTransition>
  );
}
