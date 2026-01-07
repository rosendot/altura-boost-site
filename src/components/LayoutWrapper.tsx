'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/signup');

  return (
    <ToastProvider>
      <CartProvider>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {!isAuthPage && <Navbar />}
        <main id="main-content" className={!isAuthPage ? "pt-20" : ""}>
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </CartProvider>
    </ToastProvider>
  );
}
