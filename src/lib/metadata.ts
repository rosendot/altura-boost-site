import { Metadata } from 'next';

// Helper function to create canonical URLs
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alturaboost.com';
  // Remove trailing slash from base URL and leading slash from path if present
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://alturaboost.com'),
  title: {
    default: 'Altura Boost - Professional Game Boosting Services',
    template: '%s | Altura Boost',
  },
  description: 'Professional game boosting services for popular titles. Fast, secure, and reliable rank boosting, coaching, and account services.',
  keywords: ['game boosting', 'rank boosting', 'gaming services', 'professional boosting', 'game coaching'],
  authors: [{ name: 'Altura Boost' }],
  creator: 'Altura Boost',
  publisher: 'Altura Boost',
  applicationName: 'Altura Boost',
  category: 'Gaming Services',
  classification: 'Professional Gaming Services',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Apple-specific meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Altura Boost',
  },
  // Additional manifest configuration
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Altura Boost',
    title: 'Altura Boost - Professional Game Boosting Services',
    description: 'Professional game boosting services for popular titles. Fast, secure, and reliable rank boosting, coaching, and account services.',
    images: [
      {
        url: '/altura_logo.webp',
        width: 1200,
        height: 630,
        alt: 'Altura Boost Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Altura Boost - Professional Game Boosting Services',
    description: 'Professional game boosting services for popular titles. Fast, secure, and reliable rank boosting, coaching, and account services.',
    images: ['/altura_logo.webp'],
    creator: '@alturaboost', // Add your Twitter handle when available
    site: '@alturaboost', // Add your Twitter handle when available
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/altura_logo.webp',
    shortcut: '/altura_logo.webp',
    apple: '/altura_logo.webp',
  },
  verification: {
    // Add your verification codes here when you set them up
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: '/',
  },
};
