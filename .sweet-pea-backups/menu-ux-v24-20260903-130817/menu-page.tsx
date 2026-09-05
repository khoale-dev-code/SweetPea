import type { Metadata } from "next";
import { MenuCatalog } from "@/components/menu-catalog";
import { PageTransition } from "@/components/page-transition";
import { getStoreData } from "@/lib/store";

export const metadata: Metadata = {
  title: "Menu",
  description: "Xem menu cà phê, matcha, trà trái cây, sữa chua, bánh tráng và topping tại Sweet Pea.",
};

export const revalidate = 60;

export default async function MenuPage() {
  const data = await getStoreData();

  return (
    <PageTransition>
      <MenuCatalog
        categories={data.categories}
        items={data.items}
        eyebrow="Menu Sweet Pea"
        title="Menu tại tiệm"
        description="Giá được hiển thị theo menu hiện tại của Sweet Pea. Chọn danh mục để xem nhanh hoặc xem toàn bộ menu theo dạng bảng giá."
        variant="board"
      />
    </PageTransition>
  );
}
