import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { baseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
