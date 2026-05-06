"use client";

import dynamic from "next/dynamic";

const DynamicNavbar = dynamic(
  () => import("@/components/layout/Navbar").then((mod) => mod.Navbar),
  {
    ssr: false,
    loading: () => <div className="h-[88px] w-full" />, // Navbar height placeholder
  }
);

export function ClientNavbar() {
  return <DynamicNavbar />;
}
