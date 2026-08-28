import { MobileMenuApp } from "@/components/menu/mobile-menu-app";
import { getPublicMenuData } from "@/lib/menu";

export default async function HomePage() {
  const payload = await getPublicMenuData();

  return <MobileMenuApp initialData={payload} />;
}
