# SEO Setup Guide - Altura Boost

This guide covers all the SEO optimizations implemented for Altura Boost and how to configure them.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Search Console Setup](#search-console-setup)
3. [Social Media Configuration](#social-media-configuration)
4. [Testing & Validation](#testing--validation)
5. [Ongoing Optimization](#ongoing-optimization)

---

## Environment Variables

### Required Environment Variable

Add this to your `.env.local` file:

```bash
# SEO - Base URL for canonical URLs and sitemap
NEXT_PUBLIC_SITE_URL=https://alturaboost.com
```

**Important:**
- Use your production domain (no trailing slash)
- This affects canonical URLs, sitemap generation, and structured data
- Default fallback is `https://alturaboost.com`

---

## Search Console Setup

### 1. Google Search Console

**Verify Ownership:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://alturaboost.com`
3. Choose verification method:
   - **HTML Tag** (recommended): Copy verification code
   - Add to `src/lib/metadata.ts`:
     ```typescript
     verification: {
       google: 'your-verification-code-here',
     }
     ```

4. Submit sitemap: `https://alturaboost.com/sitemap.xml`

**Monitor:**
- Index coverage
- Search performance
- Rich results status
- Mobile usability

### 2. Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site and verify
3. Add verification code to `src/lib/metadata.ts`:
   ```typescript
   verification: {
     bing: 'your-bing-verification-code',
   }
   ```
4. Submit sitemap

### 3. Yandex Webmaster

1. Go to [Yandex Webmaster](https://webmaster.yandex.com/)
2. Add site and verify
3. Add verification code to `src/lib/metadata.ts`

---

## Social Media Configuration

### Twitter/X

**Update Twitter Handle:**

In `src/lib/metadata.ts`, replace `@alturaboost` with your actual Twitter handle:

```typescript
twitter: {
  creator: '@your_twitter_handle',
  site: '@your_twitter_handle',
}
```

### Social Media Links

**Add Social Profiles to Organization Schema:**

In `src/lib/structuredData.tsx`, update the `sameAs` array:

```typescript
sameAs: [
  'https://twitter.com/your_handle',
  'https://facebook.com/your_page',
  'https://instagram.com/your_profile',
  'https://discord.gg/your_server',
  'https://www.youtube.com/@your_channel',
],
```

**Benefits:**
- Links appear in Google Knowledge Panel
- Helps verify brand authenticity
- Improves social search presence

---

## Testing & Validation

### 1. Rich Results Test

Test structured data markup:
- URL: https://search.google.com/test/rich-results
- Test each page type:
  - Home page
  - Game detail pages
  - FAQ page

**Expected Results:**
- ✅ Organization schema valid
- ✅ Product schema valid
- ✅ FAQPage schema valid
- ✅ BreadcrumbList schema valid

### 2. Schema Markup Validator

- URL: https://validator.schema.org/
- Validates JSON-LD syntax
- Checks for warnings and errors

### 3. Open Graph Debugger

**Facebook:**
- URL: https://developers.facebook.com/tools/debug/
- Tests Open Graph tags
- Shows preview of shared content

**Twitter:**
- URL: https://cards-dev.twitter.com/validator
- Tests Twitter Card markup
- Shows card preview

### 4. Mobile-Friendly Test

- URL: https://search.google.com/test/mobile-friendly
- Ensures mobile optimization
- Tests viewport and responsive design

### 5. PageSpeed Insights

- URL: https://pagespeed.web.dev/
- Test Core Web Vitals
- Monitor performance scores

---

## Sitemap & Robots

### Sitemap

**Location:** `https://alturaboost.com/sitemap.xml`

**Features:**
- Auto-generated from database
- Updates dynamically with new games
- Includes all public pages
- Proper priority and change frequency

**Verify:**
```bash
curl https://alturaboost.com/sitemap.xml
```

### Robots.txt

**Location:** `https://alturaboost.com/robots.txt`

**Allows:**
- All public pages
- Game pages
- FAQ, Terms, Work With Us
- Customer signup

**Blocks:**
- Account dashboards
- Admin panel
- Shopping cart
- Payment pages
- API endpoints

**Verify:**
```bash
curl https://alturaboost.com/robots.txt
```

---

## Ongoing Optimization

### Monthly Tasks

1. **Review Search Console:**
   - Check for indexing issues
   - Monitor search queries
   - Review click-through rates
   - Fix any errors

2. **Update Structured Data:**
   - Keep aggregate ratings current
   - Update product availability
   - Refresh FAQ content

3. **Monitor Rankings:**
   - Track keyword positions
   - Analyze competitor changes
   - Update content strategy

### Quarterly Tasks

1. **Content Audit:**
   - Update meta descriptions
   - Refresh outdated content
   - Add new FAQs
   - Update service offerings

2. **Technical SEO:**
   - Check for broken links
   - Verify canonical URLs
   - Review sitemap coverage
   - Test mobile usability

3. **Performance:**
   - Run PageSpeed Insights
   - Optimize Core Web Vitals
   - Compress images further
   - Review loading times

---

## Structured Data Reference

### Schemas Implemented

| Schema Type | Location | Purpose |
|------------|----------|---------|
| Organization | Root layout | Company information |
| WebSite | Root layout | Site search functionality |
| Product | Game pages | Service offerings with prices |
| BreadcrumbList | Game pages | Navigation breadcrumbs |
| FAQPage | FAQ page | Rich FAQ results |

### Adding New Schemas

When adding new content types, consider:
- **Article** - For blog posts
- **Review** - For customer testimonials
- **VideoObject** - For tutorial videos
- **HowTo** - For guides

---

## Contact Information

### Adding Contact Details

**In Organization Schema:**

Edit `src/lib/structuredData.tsx`:

```typescript
contactPoint: {
  '@type': 'ContactPoint',
  contactType: 'Customer Service',
  email: 'support@alturaboost.com',
  availableLanguage: ['English'],
  areaServed: 'Worldwide',
}
```

---

## Image Optimization

### Open Graph Images

**Current:** `/altura_logo.webp`

**Best Practices:**
- Dimensions: 1200x630px (required for Facebook)
- Format: WebP, PNG, or JPEG
- File size: < 1MB
- Include branding and text overlay

**Create game-specific images:**
- Unique image per game
- Include game artwork
- Add "Altura Boost" branding
- Store in `/public/og/` directory

**Update per-game:**
```typescript
openGraph: {
  images: [
    {
      url: `/og/${game.slug}.webp`,
      width: 1200,
      height: 630,
      alt: `${game.name} Boosting Services`,
    },
  ],
}
```

---

## Local SEO (Optional)

If you have a physical location:

**Add to Organization Schema:**
```typescript
address: {
  '@type': 'PostalAddress',
  streetAddress: 'Your Street',
  addressLocality: 'City',
  addressRegion: 'State',
  postalCode: '12345',
  addressCountry: 'US',
}
```

---

## Troubleshooting

### Sitemap Not Appearing

```bash
# Check Next.js is generating it
npm run build
# Verify sitemap.ts exists at src/app/sitemap.ts
```

### Structured Data Not Showing

- Clear browser cache
- Use View Source (not Inspect)
- Look for `<script type="application/ld+json">`
- Validate with schema.org validator

### Canonical URLs Wrong

- Check `NEXT_PUBLIC_SITE_URL` environment variable
- Verify it has no trailing slash
- Restart development server

### Meta Tags Not Updating

- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Hard refresh browser: Ctrl+Shift+R

---

## Resources

### Documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

### Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Support
- Report issues: [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- SEO questions: Check Google Search Central documentation

---

## Summary

Your SEO is fully configured with:
- ✅ Meta tags on all pages
- ✅ Open Graph for social sharing
- ✅ Twitter Cards
- ✅ Dynamic sitemap
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Structured data (5 schema types)
- ✅ Mobile optimization
- ✅ PWA manifest

**Next Steps:**
1. Set `NEXT_PUBLIC_SITE_URL` environment variable
2. Verify with Google Search Console
3. Submit sitemap
4. Add social media links
5. Test with rich results tool
6. Monitor performance monthly

---

*Last Updated: January 2026*
