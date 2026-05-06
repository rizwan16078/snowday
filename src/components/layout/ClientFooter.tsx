"use client";

import dynamic from "next/dynamic";

const DynamicFooter = dynamic(
  () => import("@/components/layout/Footer").then((mod) => mod.Footer),
  {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-[#050a14]" />,
  }
);

export function ClientFooter() {
  return <DynamicFooter />;
}
