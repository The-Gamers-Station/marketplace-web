import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Hero from '../../components/Hero/Hero';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import './LandingPage.css';

const LandingPage = () => {
  // State for selected category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };
  // Structured data for the home page
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://gamersstation.eg/#website",
        "url": "https://gamersstation.eg/",
        "name": "GamersStation",
        "description": "أكبر سوق للألعاب الإلكترونية في مصر",
        "publisher": {
          "@id": "https://gamersstation.eg/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://gamersstation.eg/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "ar-EG"
      },
      {
        "@type": "Organization",
        "@id": "https://gamersstation.eg/#organization",
        "name": "GamersStation",
        "url": "https://gamersstation.eg/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://gamersstation.eg/#logo",
          "url": "https://gamersstation.eg/logo.svg",
          "contentUrl": "https://gamersstation.eg/logo.svg",
          "caption": "GamersStation"
        },
        "image": {
          "@id": "https://gamersstation.eg/#logo"
        },
        "sameAs": [
          "https://www.facebook.com/GamersStationApp",
          "https://www.twitter.com/GamersStationApp",
          "https://www.instagram.com/GamersStationApp",
          "https://www.youtube.com/@GamersStationApp"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "EG",
          "addressLocality": "القاهرة"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://gamersstation.eg/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "الرئيسية",
            "item": "https://gamersstation.eg/"
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title=""
        description="تسوق أحدث الألعاب والأجهزة من PlayStation 5، Xbox Series X، Nintendo Switch، وأجهزة الكمبيوتر. أفضل الأسعار والعروض من تجار موثوقين في مصر. توصيل سريع وضمان أصلي."
        keywords="ألعاب إلكترونية, بلايستيشن 5, إكس بوكس, نينتندو سويتش, ألعاب كمبيوتر, PS5, Xbox Series X, Nintendo Switch, gaming مصر, متجر ألعاب, أجهزة ألعاب"
        structuredData={homeStructuredData}
        type="website"
      />
      <div className="landing-page">
        <Header />
        <Hero />
        <CategoryFilter onFilterChange={handleCategoryChange} />
        <main className="main-content">
          <ProductGrid categoryId={selectedCategoryId} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;