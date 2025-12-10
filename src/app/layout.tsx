'use client';

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/signup');

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/webp" href="/altura_logo.webp" />
      </head>
      <body>
        <CartProvider>
          {!isAuthPage && <Navbar />}
          {children}
          {!isAuthPage && <Footer />}
        </CartProvider>
      </body>
    </html>
  );
}
