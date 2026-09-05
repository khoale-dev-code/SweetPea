import { ClientSocialFloat } from "@/components/client-social-float";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getShopSettings } from "@/lib/store";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const shop = await getShopSettings();

  return (
    <main className="min-h-screen">
      <SiteHeader phone={shop.phone} />
      <ClientSocialFloat />
      {children}
      <SiteFooter shop={shop} />
    </main>
  );
}
