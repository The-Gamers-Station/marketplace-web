import React, { useState } from 'react';
import { Plus, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
// import Hero from '../../components/Hero/Hero';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // State for selected category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryType, setSelectedSubcategoryType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Handle category filter change
  const handleCategoryChange = (categoryId, categoryIds) => {
    if (categoryIds) {
      // Multiple category IDs for cross-platform subcategory search
      setSelectedCategoryId(null);
      setSelectedSubcategoryType(categoryIds);
    } else {
      // Single category ID for platform-specific search
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryType(null);
    }
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
        "description": "أكبر سوق للألعاب الإلكترونية في السعودية",
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
        "inLanguage": "ar-SA"
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
          "addressCountry": "SA",
          "addressLocality": "الرياض"
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
        description="تسوق أحدث الألعاب والأجهزة من PlayStation 5، Xbox Series X، Nintendo Switch، وأجهزة الكمبيوتر. أفضل الأسعار والعروض من تجار موثوقين في السعودية. توصيل سريع وضمان أصلي."
        keywords="ألعاب إلكترونية, بلايستيشن 5, إكس بوكس, نينتندو سويتش, ألعاب كمبيوتر, PS5, Xbox Series X, Nintendo Switch, gaming السعودية, متجر ألعاب, أجهزة ألعاب"
        structuredData={homeStructuredData}
        type="website"
      />
      <div className="landing-page">
        <Header />
        {/* <Hero /> */}
        
        {/* Search Bar */}
        <div className="landing-search-container">
          <form className="landing-search-form" onSubmit={handleSearchSubmit}>
            <button type="submit" className="landing-search-btn" aria-label={t('header.search')}>
              <Search size={20} />
            </button>
            <input
              type="text"
              className="landing-search-input"
              placeholder={t('header.searchPlaceholder', 'ابحث عن سلعة')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <CategoryFilter onFilterChange={handleCategoryChange} />
        <main className="main-content">
          <ProductGrid
            categoryId={selectedCategoryId}
            subcategoryType={selectedSubcategoryType}
            hideLoadMore={true}
          />
          
          {/* Show All Products Button */}
          <div className="show-all-products-container">
            <button
              className="show-all-products-btn"
              onClick={() => navigate('/products')}
            >
              {t('common.showAllProducts', 'Show All Products')}
              <ArrowRight size={20} className="arrow-icon" />
            </button>
          </div>
        </main>
        <Footer />
        
        {/* Floating Add Product Button */}
        <button
          className="floating-add-btn"
          onClick={() => navigate('/add-product')}
          aria-label="Add Product"
        >
          <Plus size={24} />
        </button>
      </div>
    </>
  );
};

export default LandingPage;