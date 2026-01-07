import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { baseMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema, StructuredData } from "@/lib/structuredData";
import type { Metadata } from "next";

export const metadata: Metadata = baseMetadata;

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
