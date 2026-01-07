import { getCanonicalUrl } from './metadata';

// Organization Schema - represents the company
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Altura Boost',
    url: getCanonicalUrl(''),
    logo: getCanonicalUrl('/altura_logo.webp'),
    description: 'Professional game boosting services for popular titles. Fast, secure, and reliable rank boosting, coaching, and account services.',
    sameAs: [
      // Add your social media URLs here when available
      // 'https://twitter.com/alturaboost',
      // 'https://facebook.com/alturaboost',
      // 'https://instagram.com/alturaboost',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      // Add email or phone when available
      // email: 'support@alturaboost.com',
    },
  };
}

// Product Schema - for individual game boosting services
interface ProductSchemaProps {
  name: string;
  gameName: string;
  description: string;
  price: number;
  imageUrl: string;
  slug: string;
}

export function getProductSchema({
  name,
  gameName,
  description,
  price,
  imageUrl,
  slug,
}: ProductSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${gameName} - ${name}`,
    description: description || `Professional ${name} service for ${gameName}`,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Altura Boost',
    },
    offers: {
      '@type': 'Offer',
      url: getCanonicalUrl(`/games/${slug}`),
      priceCurrency: 'USD',
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

// Service Schema - alternative to Product for service-based offerings
interface ServiceSchemaProps {
  name: string;
  gameName: string;
  description: string;
  imageUrl: string;
  slug: string;
}

export function getServiceSchema({
  name,
  gameName,
  description,
  imageUrl,
  slug,
}: ServiceSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Game Boosting Service',
    name: `${gameName} - ${name}`,
    description: description || `Professional ${name} service for ${gameName}`,
    provider: {
      '@type': 'Organization',
      name: 'Altura Boost',
      url: getCanonicalUrl(''),
    },
    areaServed: 'Worldwide',
    image: imageUrl,
    url: getCanonicalUrl(`/games/${slug}`),
  };
}

// FAQPage Schema - for FAQ pages
interface FAQItem {
  question: string;
  answer: string;
}

export function getFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// BreadcrumbList Schema - for navigation breadcrumbs
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  };
}

// WebSite Schema - for the main website
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Altura Boost',
    url: getCanonicalUrl(''),
    description: 'Professional game boosting services for popular titles',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: getCanonicalUrl('/games?search={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Helper component to render JSON-LD script tags
interface StructuredDataProps {
  data: object | object[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
