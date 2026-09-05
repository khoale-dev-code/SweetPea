import { AboutContact } from "@/components/about-contact";
import { Hero } from "@/components/hero";
import { MenuCatalog } from "@/components/menu-catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStoreData } from "@/lib/store";

export const revalidate = 60;

export default async function Home() {
  const data = await getStoreData();

  return (
    <main className="min-h-screen">
      <SiteHeader phone={data.shop.phone} />
      <Hero shop={data.shop} />
      <MenuCatalog categories={data.categories} items={data.items} />
      <AboutContact shop={data.shop} />
      <SiteFooter shop={data.shop} />
    </main>
  );
}
