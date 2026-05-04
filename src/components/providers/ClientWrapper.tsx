"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { Footer } from "@/components/layout/Footer";

interface ClientWrapperProps {
  children: ReactNode;
}

/**
 * ClientWrapper isolates client-side state and providers
 * from the Server-side RootLayout.
 */
export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <QueryProvider>
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </QueryProvider>
  );
}
