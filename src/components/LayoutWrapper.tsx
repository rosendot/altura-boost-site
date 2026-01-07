'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/signup');

  return (
    <CartProvider>
      {!isAuthPage && <Navbar />}
      <div className={!isAuthPage ? "pt-20" : ""}>
        {children}
      </div>
      {!isAuthPage && <Footer />}
    </CartProvider>
  );
}
