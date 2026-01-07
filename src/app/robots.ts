import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alturaboost.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/games',
          '/games/*',
          '/faq',
          '/terms',
          '/work-with-us',
          '/signup/customer',
        ],
        disallow: [
          '/account',
          '/admin',
          '/cart',
          '/checkout',
          '/hub',
          '/messages',
          '/login',
          '/forgot-password',
          '/reset-password',
          '/signup/booster',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
