import type { ReactNode } from "react";
import {
  AppHeaderActions,
  AppHeaderBrand,
  AppHeaderSearch,
  MobileNav,
  NavSidebar,
  Sidebar,
  TopNavigation
} from "@/components/organisms";
import { AppLayout } from "@/components/templates";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout
      topNavigation={
        <TopNavigation brand={<AppHeaderBrand />} navigation={<AppHeaderSearch />} actions={<AppHeaderActions />} />
      }
      mobileNav={<MobileNav />}
      sidebar={
        <Sidebar>
          <NavSidebar />
        </Sidebar>
      }
    >
      {children}
    </AppLayout>
  );
}
