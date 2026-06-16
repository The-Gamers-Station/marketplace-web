import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = '',
  description = 'منصتك الأولى للألعاب والمنتجات الرقمية في المملكة العربية السعودية.',
  keywords = 'ألعاب إلكترونية, بلايستيشن, إكس بوكس, نينتندو, ألعاب كمبيوتر, PS5, Xbox Series X, gaming, السعودية',
  image = 'https://gamers-station.com/og-image.jpg',
  url = 'https://gamers-station.com',
  type = 'website',
  author = 'GamersStation',
  structuredData = null,
  canonicalUrl = null,
  alternateLinks = [],
  noindex = false,
  nofollow = false,
  dynamicAdMeta = null
}) => {
  const META_DESCRIPTION_SUFFIX = ' (تصفح المزيد من عروض الجيمرز على موقع جيمرز ستيشن)';
  const DEFAULT_WEBSITE_NAME = 'Gamers Station';
  
  const truncateByCodePoints = (value, maxChars) => {
    if (!value) return '';
    const normalized = String(value).replace(/\s+/g, ' ').trim();
    const codePoints = Array.from(normalized);
    if (codePoints.length <= maxChars) return normalized;
    return codePoints.slice(0, maxChars).join('').trim();
  };
  
  const adTitle = dynamicAdMeta?.title?.trim();
  const adCity = dynamicAdMeta?.city?.trim();
  const adDescription = dynamicAdMeta?.description;
  const adWebsiteName = dynamicAdMeta?.websiteName?.trim() || DEFAULT_WEBSITE_NAME;
  const adSuffix = dynamicAdMeta?.descriptionSuffix ?? META_DESCRIPTION_SUFFIX;
  const hasDynamicAdMeta = Boolean(adTitle && adCity);
  
  const generatedAdMetaTitle = hasDynamicAdMeta
    ? `${adTitle} | ${adCity} | ${adWebsiteName}`
    : '';
  const generatedAdMetaDescription = hasDynamicAdMeta
    ? `${truncateByCodePoints(adDescription, 150)}${adSuffix}`
    : '';
  
  const siteTitle = 'GamersStation - أكبر سوق للألعاب الإلكترونية في السعودية';
  const fullTitle = hasDynamicAdMeta
    ? generatedAdMetaTitle
    : (title ? `${title} | ${siteTitle}` : siteTitle);
  const finalDescription = hasDynamicAdMeta
    ? generatedAdMetaDescription
    : description;
  const currentUrl = canonicalUrl || `${url}${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  const englishAlternateUrl = `${url}/en${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  
  // Default structured data for Organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GamersStation",
    "url": "https://gamers-station.com",
    "logo": "https://gamers-station.com/logo.svg",
    "description": "أكبر سوق للألعاب الإلكترونية في السعودية",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SA",
      "addressRegion": "الرياض"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@thegamersstation.com",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    },
    "sameAs": [
      "https://www.facebook.com/GamersStationApp",
      "https://www.twitter.com/GamersStationApp",
      "https://www.instagram.com/GamersStationApp",
      "https://www.youtube.com/GamersStationApp"
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      {fullTitle && <title>{fullTitle}</title>}
      {finalDescription && <meta name="description" content={finalDescription} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Robots Meta Tags */}
      {robotsContent && <meta name="robots" content={robotsContent} />}
      {robotsContent && <meta name="googlebot" content={robotsContent} />}
      
      {/* Canonical URL */}
      {currentUrl && <link rel="canonical" href={currentUrl} />}
      
      {/* Alternate Language Links */}
      {currentUrl && <link rel="alternate" hreflang="ar-SA" href={currentUrl} />}
      {englishAlternateUrl && <link rel="alternate" hreflang="en-SA" href={englishAlternateUrl} />}
      {alternateLinks.map((link, index) => (
        <link key={index} rel="alternate" hreflang={link.hreflang} href={link.href} />
      ))}
      
      {/* Open Graph Meta Tags */}
      {type && <meta property="og:type" content={type} />}
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      {fullTitle && <meta property="og:title" content={fullTitle} />}
      {finalDescription && <meta property="og:description" content={finalDescription} />}
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}
      <meta property="og:locale" content="ar_SA" />
      <meta property="og:locale:alternate" content="en_SA" />
      <meta property="og:site_name" content="GamersStation" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:site" content="@GamersStationApp" />
      <meta name="twitter:creator" content="@GamersStationApp" />
      {currentUrl && <meta name="twitter:url" content={currentUrl} />}
      {fullTitle && <meta name="twitter:title" content={fullTitle} />}
      {finalDescription && <meta name="twitter:description" content={finalDescription} />}
      {image && <meta name="twitter:image" content={image} />}
      {(title || fullTitle) && <meta name="twitter:image:alt" content={title || fullTitle || 'GamersStation'} />}
      
      {/* Article Meta Tags (for blog posts or product pages) */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:published_time" content={new Date().toISOString()} />
        </>
      )}
      
      {/* Product Meta Tags */}
      {type === 'product' && (
        <>
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
          <meta property="product:price:currency" content="SAR" />
        </>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#0a1628" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="GamersStation" />
      <meta name="application-name" content="GamersStation" />
      <meta name="msapplication-TileColor" content="#0a1628" />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;