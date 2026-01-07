import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { baseMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema, StructuredData } from "@/lib/structuredData";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <StructuredData data={[organizationSchema, websiteSchema]} />
      </head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
